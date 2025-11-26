cmake_minimum_required(VERSION 3.25 FATAL_ERROR)

# Project definition with metadata
project(WSL 
    VERSION 2.0.0
    DESCRIPTION "Windows Subsystem for Linux"
    HOMEPAGE_URL "https://docs.microsoft.com/en-us/windows/wsl/"
    LANGUAGES CXX C
)

# Compiler requirements
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Policy settings for modern CMake
cmake_policy(SET CMP0091 NEW)  # MSVC runtime library flag
cmake_policy(SET CMP0092 NEW)  # MSVC warning flags

# Build configuration validation
if(NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
    message(STATUS "Setting build type to 'Debug' as none was specified.")
    set(CMAKE_BUILD_TYPE "Debug" CACHE STRING "Choose the type of build." FORCE)
    set_property(CACHE CMAKE_BUILD_TYPE PROPERTY STRINGS "Debug" "Release" "MinSizeRel" "RelWithDebInfo")
endif()

# Platform detection and validation
if(CMAKE_SIZEOF_VOID_P EQUAL 8)
    set(PLATFORM_ARCH "x64")
elseif(CMAKE_VS_PLATFORM_NAME STREQUAL "ARM64")
    set(PLATFORM_ARCH "arm64")
elseif(CMAKE_VS_PLATFORM_NAME STREQUAL "Win32")
    set(PLATFORM_ARCH "x86")
else()
    message(FATAL_ERROR "Unsupported platform: ${CMAKE_VS_PLATFORM_NAME}")
endif()

message(STATUS "Building for platform: ${PLATFORM_ARCH}")
message(STATUS "Build configuration: ${CMAKE_BUILD_TYPE}")

# Windows version requirement
if(WIN32)
    set(MIN_WINDOWS_VERSION 0x0A00)  # Windows 10
    add_definitions(-D_WIN32_WINNT=${MIN_WINDOWS_VERSION})
else()
    message(FATAL_ERROR "WSL can only be built on Windows")
endif()

# Output directory structure
set(OUTPUT_BASE_DIR "${CMAKE_BINARY_DIR}/bin/${PLATFORM_ARCH}/${CMAKE_BUILD_TYPE}")
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${OUTPUT_BASE_DIR}")
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY "${OUTPUT_BASE_DIR}")
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY "${OUTPUT_BASE_DIR}")

# Ensure output directories exist
file(MAKE_DIRECTORY "${OUTPUT_BASE_DIR}")

# Compiler-specific settings
if(MSVC)
    # Enhanced warnings and standards compliance
    add_compile_options(
        /W4                    # Warning level 4
        /WX                    # Treat warnings as errors
        /permissive-           # Strict conformance mode
        /Zc:__cplusplus        # Correct __cplusplus macro
        /utf-8                 # UTF-8 source and execution charset
        /MP                    # Multi-processor compilation
        /Gy                    # Enable function-level linking
        /GR-                   # Disable RTTI (not needed)
        /EHsc                  # Exception handling model
    )
    
    # Release optimizations
    add_compile_options($<$<CONFIG:Release>:/O2 /Ob2 /DNDEBUG>)
    
    # Debug information
    add_compile_options($<$<CONFIG:Debug>:/Od /Zi /RTC1>)
    add_link_options($<$<CONFIG:Debug>:/DEBUG>)
    
    # Security enhancements
    add_compile_options(/GS /guard:cf)
    add_link_options(/GUARD:CF /DYNAMICBASE /NXCOMPAT)
    
endif()

# Global definitions
add_definitions(
    -DUNICODE
    -D_UNICODE
    -DWIN32_LEAN_AND_MEAN
    -DNOMINMAX
    -D_CRT_SECURE_NO_WARNINGS
    -DPROJECT_VERSION_MAJOR=${PROJECT_VERSION_MAJOR}
    -DPROJECT_VERSION_MINOR=${PROJECT_VERSION_MINOR}
    -DPROJECT_VERSION_PATCH=${PROJECT_VERSION_PATCH}
)

# Find required tools and libraries
find_program(MIDL_COMPILER midl REQUIRED 
    HINTS "C:/Program Files (x86)/Windows Kits/10/bin/*/x64"
    DOC "Microsoft Interface Definition Language compiler"
)
message(STATUS "Found MIDL: ${MIDL_COMPILER}")

# Required Windows libraries
set(WINDOWS_LIBS
    kernel32
    user32
    ole32
    oleaut32
    uuid
    advapi32
    shell32
    ws2_32
    iphlpapi
    wtsapi32
    userenv
    ntdll
)

# Validate required libraries exist
foreach(LIB ${WINDOWS_LIBS})
    find_library(${LIB}_LIB ${LIB})
    if(NOT ${LIB}_LIB)
        message(WARNING "Library ${LIB} not found - some features may not work")
    endif()
endforeach()

# Create interface library for common components
add_library(WSLCommon STATIC)
target_include_directories(WSLCommon PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/src/windows/common>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/src/shared/inc>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_BINARY_DIR}>  # For generated files
)

# Common source files
target_sources(WSLCommon PRIVATE
    src/windows/common/wslclient.cpp
    src/windows/common/svccomm.cpp
    src/windows/common/config.cpp
    src/windows/common/relay.cpp
    src/windows/common/notifications.cpp
    src/windows/common/registry.cpp
    src/windows/common/security.cpp
    src/windows/common/logging.cpp
)

# IDL file processing
set(IDL_SOURCE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/src/windows/service/inc")
set(IDL_FILES "${IDL_SOURCE_DIR}/wslservice.idl")
set(IDL_OUTPUTS)

foreach(IDL_FILE ${IDL_FILES})
    get_filename_component(IDL_NAME ${IDL_FILE} NAME_WE)
    set(IDL_OUTPUT_H "${CMAKE_CURRENT_BINARY_DIR}/${IDL_NAME}.h")
    set(IDL_OUTPUT_C "${CMAKE_CURRENT_BINARY_DIR}/${IDL_NAME}_i.c")
    set(IDL_OUTPUT_TLB "${CMAKE_CURRENT_BINARY_DIR}/${IDL_NAME}.tlb")
    
    add_custom_command(
        OUTPUT ${IDL_OUTPUT_H} ${IDL_OUTPUT_C} ${IDL_OUTPUT_TLB}
        COMMAND ${MIDL_COMPILER}
        ARGS /nologo 
             /target NT60
             /out ${CMAKE_CURRENT_BINARY_DIR}
             /h ${IDL_NAME}.h
             /iid ${IDL_NAME}_i.c
             /tlb ${IDL_NAME}.tlb
             ${IDL_FILE}
        DEPENDS ${IDL_FILE}
        COMMENT "Processing IDL file: ${IDL_NAME}"
        VERBATIM
    )
    
    list(APPEND IDL_OUTPUTS ${IDL_OUTPUT_H} ${IDL_OUTPUT_C})
endforeach()

# Add generated IDL files to common library
if(IDL_OUTPUTS)
    target_sources(WSLCommon PRIVATE ${IDL_OUTPUTS})
endif()

# Function to create WSL executables with consistent settings
function(add_wsl_executable TARGET_NAME)
    cmake_parse_arguments(WSL_EXE "WIN32_APP" "SUBSYSTEM" "SOURCES;LIBS;DEFINITIONS" ${ARGN})
    
    if(WSL_EXE_WIN32_APP)
        add_executable(${TARGET_NAME} WIN32 ${WSL_EXE_SOURCES})
    else()
        add_executable(${TARGET_NAME} ${WSL_EXE_SOURCES})
    endif()
    
    target_link_libraries(${TARGET_NAME} PRIVATE 
        WSLCommon 
        ${WINDOWS_LIBS}
        ${WSL_EXE_LIBS}
    )
    
    if(WSL_EXE_DEFINITIONS)
        target_compile_definitions(${TARGET_NAME} PRIVATE ${WSL_EXE_DEFINITIONS})
    endif()
    
    # Set target properties
    set_target_properties(${TARGET_NAME} PROPERTIES
        VS_DEBUGGER_WORKING_DIRECTORY "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}"
        DEBUG_POSTFIX "_d"
        PDB_OUTPUT_DIRECTORY "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}"
    )
    
    # Set subsystem
    if(WSL_EXE_SUBSYSTEM)
        set_target_properties(${TARGET_NAME} PROPERTIES
            LINK_FLAGS "/SUBSYSTEM:${WSL_EXE_SUBSYSTEM}"
        )
    endif()
    
    # Copy to output directory
    add_custom_command(TARGET ${TARGET_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different
        $<TARGET_FILE:${TARGET_NAME}>
        "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/${TARGET_NAME}.exe"
        COMMENT "Copying ${TARGET_NAME} to output directory"
    )
    
    message(STATUS "Added executable: ${TARGET_NAME}")
endfunction()

# Create all WSL executables
add_wsl_executable(wsl 
    SOURCES src/windows/wsl/main.cpp src/windows/wsl/commands.cpp
    SUBSYSTEM CONSOLE
)

add_wsl_executable(wslg
    WIN32_APP
    SOURCES src/windows/wslg/main.cpp src/windows/wslg/gui.cpp
    SUBSYSTEM WINDOWS
)

add_wsl_executable(wslconfig
    SOURCES src/windows/wslconfig/main.cpp src/windows/wslconfig/config_manager.cpp
    SUBSYSTEM CONSOLE
)

add_wsl_executable(wslhost
    SOURCES src/windows/wslhost/main.cpp src/windows/wslhost/notifications.cpp
    SUBSYSTEM CONSOLE
    DEFINITIONS WSL_HOST_BUILD
)

add_wsl_executable(wslrelay
    SOURCES src/windows/wslrelay/main.cpp src/windows/wslrelay/network.cpp
    LIBS ws2_32 iphlpapi
    SUBSYSTEM CONSOLE
)

add_wsl_executable(wslservice
    SOURCES 
        src/windows/service/main.cpp 
        src/windows/service/LxssUserSession.cpp
        src/windows/service/WslCoreVm.cpp
        src/windows/service/DistributionManager.cpp
    LIBS wtsapi32 userenv
    SUBSYSTEM CONSOLE
    DEFINITIONS WSL_SERVICE_BUILD
)

# Testing framework
option(BUILD_TESTING "Build unit tests" OFF)
if(BUILD_TESTING)
    enable_testing()
    message(STATUS "Building tests enabled")
    
    # Find or fetch Google Test
    find_package(GTest QUIET)
    if(NOT GTest_FOUND)
        message(STATUS "Google Test not found, fetching from GitHub")
        include(FetchContent)
        FetchContent_Declare(
            googletest
            GIT_REPOSITORY https://github.com/google/googletest.git
            GIT_TAG v1.14.0
        )
        FetchContent_MakeAvailable(googletest)
    endif()
    
    add_executable(wsl_tests
        tests/unit/test_main.cpp
        tests/unit/config_tests.cpp
        tests/unit/relay_tests.cpp
        tests/unit/service_tests.cpp
    )
    
    target_link_libraries(wsl_tests PRIVATE
        WSLCommon
        GTest::gtest_main
        ${WINDOWS_LIBS}
    )
    
    include(GoogleTest)
    gtest_discover_tests(wsl_tests)
    
    message(STATUS "Added test target: wsl_tests")
endif()

# Packaging configuration
option(BUILD_BUNDLE "Create installation packages" OFF)
if(BUILD_BUNDLE)
    message(STATUS "Package generation enabled")
    
    # MSI package using WiX
    set(CPACK_GENERATOR "WIX")
    set(CPACK_WIX_UPGRADE_GUID "12345678-1234-1234-1234-123456789ABC")
    set(CPACK_PACKAGE_NAME "Windows Subsystem for Linux")
    set(CPACK_PACKAGE_VENDOR "Microsoft Corporation")
    set(CPACK_PACKAGE_VERSION ${PROJECT_VERSION})
    set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "Windows Subsystem for Linux Implementation")
    set(CPACK_PACKAGE_INSTALL_DIRECTORY "WSL")
    
    # Install targets
    install(TARGETS wsl wslg wslconfig wslhost wslrelay wslservice
        DESTINATION bin
        COMPONENT Runtime
    )
    
    # Install configuration templates
    install(DIRECTORY templates/
        DESTINATION templates
        COMPONENT Configuration
    )
    
    # Install documentation
    install(FILES README.md docs/BUILDING.md docs/ARCHITECTURE.md
        DESTINATION docs
        COMPONENT Documentation
    )
    
    include(CPack)
endif()

# Build summary
message(STATUS "")
message(STATUS "WSL Build Configuration Summary:")
message(STATUS "  Version: ${PROJECT_VERSION}")
message(STATUS "  Platform: ${PLATFORM_ARCH}")
message(STATUS "  Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "  Output directory: ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}")
message(STATUS "  Testing: ${BUILD_TESTING}")
message(STATUS "  Packaging: ${BUILD_BUNDLE}")
message(STATUS "")