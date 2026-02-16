#include "svccomm.h"
#include <comdef.h>
#include <atlbase.h>
#include <memory>
#include <stdexcept>

class WSLServiceCommunicator::Impl {
private:
    CComPtr<ILxssUserSession> userSession;
    bool initialized = false;

public:
    HRESULT Initialize() {
        if (initialized) {
            return S_OK;
        }

        HRESULT hr = CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
        if (FAILED(hr) && hr != RPC_E_CHANGED_MODE) {
            return hr;
        }

        hr = CoCreateInstance(
            CLSID_LxssUserSession,
            nullptr,
            CLSCTX_LOCAL_SERVER,
            IID_ILxssUserSession,
            reinterpret_cast<void**>(&userSession)
        );

        if (SUCCEEDED(hr)) {
            initialized = true;
        }

        return hr;
    }

    ~Impl() {
        if (initialized) {
            userSession.Release();
            CoUninitialize();
        }
    }

    HRESULT CreateInstance(
        const std::wstring& distributionName,
        const std::wstring& command,
        ProcessHandles& handles
    ) {
        if (!initialized || !userSession) {
            return E_NOT_VALID_STATE;
        }

        GUID distributionId = {};
        HRESULT hr = GetDistributionId(distributionName, &distributionId);
        if (FAILED(hr)) {
            return hr;
        }

        // Prepare command line and environment
        std::vector<std::wstring> cmdArgs = ParseCommandLine(command);
        std::vector<std::wstring> environment = GetEnvironmentVariables();

        LXSS_STD_HANDLES stdHandles = {};
        hr = userSession->CreateLxProcess(
            &distributionId,
            command.c_str(),
            static_cast<ULONG>(cmdArgs.size()),
            cmdArgs.empty() ? nullptr : cmdArgs.data(),
            environment.empty() ? nullptr : environment.data(),
            nullptr, // current directory
            nullptr, // Linux path
            0,       // flags
            nullptr, // startup info
            nullptr, // process information
            &stdHandles
        );

        if (SUCCEEDED(hr)) {
            handles.stdin_handle = stdHandles.StdIn;
            handles.stdout_handle = stdHandles.StdOut;
            handles.stderr_handle = stdHandles.StdErr;
            handles.process_handle = stdHandles.Process;
        }

        return hr;
    }

private:
    HRESULT GetDistributionId(const std::wstring& name, GUID* id) {
        if (!id) return E_INVALIDARG;

        // Query Windows registry for distribution information
        std::wstring registryPath = L"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Lxss";

        HKEY hKey = nullptr;
        LONG result = RegOpenKeyExW(HKEY_CURRENT_USER, registryPath.c_str(), 0, KEY_READ, &hKey);
        if (result != ERROR_SUCCESS) {
            return HRESULT_FROM_WIN32(result);
        }

        // Enumerate distributions to find matching name
        DWORD index = 0;
        wchar_t subKeyName[256];
        DWORD subKeyNameSize = sizeof(subKeyName) / sizeof(subKeyName[0]);

        while (RegEnumKeyExW(hKey, index++, subKeyName, &subKeyNameSize,
                            nullptr, nullptr, nullptr, nullptr) == ERROR_SUCCESS) {

            HKEY hSubKey = nullptr;
            if (RegOpenKeyExW(hKey, subKeyName, 0, KEY_READ, &hSubKey) == ERROR_SUCCESS) {

                // Read distribution name
                wchar_t distroName[256];
                DWORD distroNameSize = sizeof(distroName);
                DWORD valueType;

                if (RegQueryValueExW(hSubKey, L"DistributionName", nullptr, &valueType,
                                   reinterpret_cast<LPBYTE>(distroName), &distroNameSize) == ERROR_SUCCESS) {

                    if (name.empty() || name == distroName) {
                        // Convert string GUID to GUID structure
                        HRESULT hr = CLSIDFromString(subKeyName, id);
                        RegCloseKey(hSubKey);
                        RegCloseKey(hKey);
                        return hr;
                    }
                }
                RegCloseKey(hSubKey);
            }
            subKeyNameSize = sizeof(subKeyName) / sizeof(subKeyName[0]);
        }

        RegCloseKey(hKey);
        return HRESULT_FROM_WIN32(ERROR_NOT_FOUND);
    }

    std::vector<std::wstring> ParseCommandLine(const std::wstring& command) {
        std::vector<std::wstring> args;
        if (command.empty()) return args;

        // Simple command line parsing - could be enhanced
        std::wistringstream iss(command);
        std::wstring arg;
        while (iss >> arg) {
            args.push_back(arg);
        }
        return args;
    }

    std::vector<std::wstring> GetEnvironmentVariables() {
        std::vector<std::wstring> env;

        wchar_t* envStrings = GetEnvironmentStringsW();
        if (!envStrings) return env;

        wchar_t* current = envStrings;
        while (*current) {
            env.emplace_back(current);
            current += wcslen(current) + 1;
        }

        FreeEnvironmentStringsW(envStrings);
        return env;
    }
};

// WSLServiceCommunicator implementation
WSLServiceCommunicator::WSLServiceCommunicator()
    : pImpl(std::make_unique<Impl>()) {
}

WSLServiceCommunicator::~WSLServiceCommunicator() = default;

int WSLServiceCommunicator::CreateInstanceAndExecute(
    const std::wstring& distribution,
    const std::wstring& command
) {
    try {
        HRESULT hr = pImpl->Initialize();
        if (FAILED(hr)) {
            throw std::runtime_error("Failed to initialize COM interface: " + std::to_string(hr));
        }

        ProcessHandles handles;
        hr = pImpl->CreateInstance(distribution, command, handles);
        if (FAILED(hr)) {
            throw std::runtime_error("Failed to create WSL instance: " + std::to_string(hr));
        }

        // Start I/O relay with proper error handling
        return RelayIO(handles);
    }
    catch (const std::exception& e) {
        std::cerr << "WSL Error: " << e.what() << std::endl;
        return 1;
    }
}