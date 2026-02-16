#include "wslclient.h"
#include "svccomm.h"
#include "logging.h"
#include <iostream>
#include <sstream>
#include <algorithm>
#include <comdef.h>

namespace WSL {

void ProcessHandles::CloseHandles() {
    auto safeClose = [](HANDLE& h) {
        if (h != INVALID_HANDLE_VALUE) {
            CloseHandle(h);
            h = INVALID_HANDLE_VALUE;
        }
    };
    
    safeClose(stdin_handle);
    safeClose(stdout_handle);
    safeClose(stderr_handle);
    safeClose(process_handle);
    safeClose(control_handle);
    safeClose(interop_handle);
}

bool ProcessHandles::AreValid() const {
    return (stdin_handle != INVALID_HANDLE_VALUE &&
            stdout_handle != INVALID_HANDLE_VALUE &&
            stderr_handle != INVALID_HANDLE_VALUE &&
            process_handle != INVALID_HANDLE_VALUE);
}

WSLCommandLineParser::WSLCommandLineParser(int argc, wchar_t* argv[]) {
    try {
        ParseArguments(argc, argv);
    }
    catch (const std::exception& e) {
        isValid_ = false;
        errorMessage_ = L"Failed to parse command line: " + 
                       std::wstring(e.what(), e.what() + strlen(e.what()));
    }
}

void WSLCommandLineParser::ParseArguments(int argc, wchar_t* argv[]) {
    if (argc < 1) {
        throw std::invalid_argument("No arguments provided");
    }
    
    // Default to execute command if no specific command given
    arguments_.command = WSLCommand::Execute;
    
    for (int i = 1; i < argc; ++i) {
        std::wstring arg = argv[i];
        std::transform(arg.begin(), arg.end(), arg.begin(), ::towlower);
        
        if (arg == L"--help" || arg == L"-h") {
            arguments_.command = WSLCommand::Help;
            return; // Help overrides everything else
        }
        else if (arg == L"--version" || arg == L"-v") {
            arguments_.command = WSLCommand::Version;
        }
        else if (arg == L"--list" || arg == L"-l") {
            arguments_.command = WSLCommand::List;
        }
        else if (arg == L"--status") {
            arguments_.command = WSLCommand::Status;
        }
        else if (arg == L"--shutdown") {
            arguments_.command = WSLCommand::Shutdown;
        }
        else if (arg == L"--terminate" || arg == L"-t") {
            arguments_.command = WSLCommand::Terminate;
            // Next argument should be distribution name
            if (i + 1 < argc) {
                arguments_.distributionName = argv[++i];
            }
        }
        else if (arg == L"--distribution" || arg == L"-d") {
            ParseDistributionOption(i, argc, argv);
        }
        else if (arg == L"--exec" || arg == L"-e") {
            ParseExecuteOption(i, argc, argv);
        }
        else if (arg == L"--user" || arg == L"-u") {
            ParseUserOption(i, argc, argv);
        }
        else if (arg == L"--cd") {
            ParseWorkingDirectoryOption(i, argc, argv);
        }
        else if (arg == L"--shell-type") {
            arguments_.shellExecute = true;
        }
        else if (arg.front() != L'-') {
            // This is likely a command to execute
            std::wostringstream oss;
            for (int j = i; j < argc; ++j) {
                if (j > i) oss << L" ";
                oss << argv[j];
            }
            arguments_.executeCommand = oss.str();
            break;
        }
        else {
            throw std::invalid_argument("Unknown argument: " + 
                std::string(arg.begin(), arg.end()));
        }
    }
}                                                           

void WSLCommandLineParser::ParseDistributionOption(int& index, int argc, wchar_t* argv[]) {
    if (index + 1 >= argc) {
        throw std::invalid_argument("--distribution requires a distribution name");
    }
    arguments_.distributionName = argv[++index];
}

void WSLCommandLineParser::ParseExecuteOption(int& index, int argc, wchar_t* argv[]) {
    if (index + 1 >= argc) {
        throw std::invalid_argument("--exec requires a command");
    }
    arguments_.executeCommand = argv[++index];
}

void WSLCommandLineParser::ParseUserOption(int& index, int argc, wchar_t* argv[]) {
    if (index + 1 >= argc) {
        throw std::invalid_argument("--user requires a username");
    }
    arguments_.userName = argv[++index];
    arguments_.asUser = true;
}

void WSLCommandLineParser::ParseWorkingDirectoryOption(int& index, int argc, wchar_t* argv[]) {
    if (index + 1 >= argc) {
        throw std::invalid_argument("--cd requires a directory path");
    }
    arguments_.workingDirectory = argv[++index];
}

void WSLCommandLineParser::ShowHelp() const {
    std::wcout << L"Windows Subsystem for Linux\n"
               << L"Usage: wsl [options] [command]\n\n"
               << L"Options:\n"
               << L"  -d, --distribution <name>    Run the specified distribution\n"
               << L"  -u, --user <username>        Run as the specified user\n"
               << L"  -e, --exec <command>         Execute the specified command\n"
               << L"      --cd <directory>         Change to the specified directory\n"
               << L"      --shell-type             Request a shell\n\n"
               << L"Management Commands:\n"
               << L"  -l, --list                   List installed distributions\n"
               << L"      --status                 Show WSL status\n"
               << L"  -t, --terminate <name>       Terminate the specified distribution\n"
               << L"      --shutdown               Shutdown all distributions\n\n"
               << L"Information:\n"
               << L"  -h, --help                   Display this help\n"
               << L"  -v, --version                Display version information\n\n";
}

void WSLCommandLineParser::ShowVersion() const {
    std::wcout << L"WSL version " << GetWSLVersion() << L"\n";
}

// WSLClient implementation
class WSLClient::Impl {
private:
    std::unique_ptr<WSLServiceCommunicator> service_;
    
public:
    Impl() : service_(std::make_unique<WSLServiceCommunicator>()) {}
    
    int Execute(const WSLArguments& args) {
        try {
            switch (args.command) {
                case WSLCommand::Help:
                    WSLCommandLineParser::ShowHelp();
                    return 0;
                    
                case WSLCommand::Version:
                    WSLCommandLineParser::ShowVersion(); 
                    return 0;
                    
                case WSLCommand::List:
                    return HandleListCommand();
                    
                case WSLCommand::Status:
                    return HandleStatusCommand();
                    
                case WSLCommand::Shutdown:
                    return HandleShutdownCommand();
                    
                case WSLCommand::Terminate:
                    return HandleTerminateCommand(args.distributionName);
                    
                case WSLCommand::Execute:
                default:
                    return HandleExecuteCommand(args);
            }
        }
        catch (const std::exception& e) {
            LogError(L"WSLClient::Execute failed: %hs", e.what());
            std::wcerr << L"Error: " << e.what() << std::endl;
            return 1;
        }
    }
    
private:
    int HandleListCommand() {
        auto distributions = GetAvailableDistributions();
        if (distributions.empty()) {
            std::wcout << L"No distributions installed.\n";
            return 0;
        }
        
        std::wstring defaultDistro = GetDefaultDistribution();
        
        for (const auto& distro : distributions) {
            std::wcout << distro;
            if (distro == defaultDistro) {
                std::wcout << L" (Default)";
            }
            std::wcout << L"\n";
        }
        
        return 0;                    
    }
    
    int HandleStatusCommand() {
        // Implementation to show WSL status
        std::wcout << L"WSL Status:\n";
        std::wcout << L"Version: " << GetWSLVersion() << L"\n";
        
        auto distributions = GetAvailableDistributions();
        std::wcout << L"Installed distributions: " << distributions.size() << L"\n";
        std::wcout << L"Default distribution: " << GetDefaultDistribution() << L"\n";
        
        return 0;
    }
    
    int HandleShutdownCommand() {
        return service_->Shutdown();
    }
    
    int HandleTerminateCommand(const std::wstring& distributionName) {
        if (distributionName.empty()) {
            std::wcerr << L"Error: No distribution specified for termination\n";
            return 1;
        }
        
        return service_->TerminateDistribution(distributionName);
    }
    
    int HandleExecuteCommand(const WSLArguments& args) {
        std::wstring distro = args.distributionName;
        if (distro.empty()) {
            distro = GetDefaultDistribution();
            if (distro.empty()) {
                std::wcerr << L"Error: No default distribution configured\n";
                return 1;
            }
        }
        
        std::wstring command = args.executeCommand;
        if (command.empty()) {
            command = L"/bin/bash -l";  // Default shell
        }
        
        return service_->CreateInstanceAndExecute(distro, command, args);
    }
};

WSLClient::WSLClient() : pImpl_(std::make_unique<Impl>()) {}
WSLClient::~WSLClient() = default;

int WSLClient::Execute(const WSLArguments& args) {
    return pImpl_->Execute(args);
}

// Utility function implementations
std::wstring GetWSLVersion() {
    return L"2.0.0.0";  // This would read from version resources
}

std::vector<std::wstring> GetAvailableDistributions() {
    std::vector<std::wstring> distributions;
    
    // Query registry for installed distributions
    HKEY hKey = nullptr;
    LONG result = RegOpenKeyExW(HKEY_CURRENT_USER, 
                               L"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Lxss",
                               0, KEY_READ, &hKey);
    
    if (result != ERROR_SUCCESS) {
        return distributions; // Return empty vector
    }
    
    DWORD index = 0;
    wchar_t subKeyName[256];
    DWORD subKeyNameSize = sizeof(subKeyName) / sizeof(subKeyName[0]);
    
    while (RegEnumKeyExW(hKey, index++, subKeyName, &subKeyNameSize,
                        nullptr, nullptr, nullptr, nullptr) == ERROR_SUCCESS) {
        
        HKEY hSubKey = nullptr;
        if (RegOpenKeyExW(hKey, subKeyName, 0, KEY_READ, &hSubKey) == ERROR_SUCCESS) {
            
            wchar_t distroName[256];
            DWORD distroNameSize = sizeof(distroName);
            
            if (RegQueryValueExW(hSubKey, L"DistributionName", nullptr, nullptr,
                               reinterpret_cast<LPBYTE>(distroName), 
                               &distroNameSize) == ERROR_SUCCESS) {
                distributions.emplace_back(distroName);
            }
            
            RegCloseKey(hSubKey);
        }
        
        subKeyNameSize = sizeof(subKeyName) / sizeof(subKeyName[0]);
    }
    
    RegCloseKey(hKey);
    return distributions;
}

bool IsDistributionInstalled(const std::wstring& name) {
    auto distributions = GetAvailableDistributions();
    return std::find(distributions.begin(), distributions.end(), name) != distributions.end();
}

std::wstring GetDefaultDistribution() {
    HKEY hKey = nullptr;
    LONG result = RegOpenKeyExW(HKEY_CURRENT_USER,
                               L"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Lxss",
                               0, KEY_READ, &hKey);
    
    if (result != ERROR_SUCCESS) {
        return L"";
    }
    
    wchar_t defaultDistroGuid[256];
    DWORD size = sizeof(defaultDistroGuid);
    
    result = RegQueryValueExW(hKey, L"DefaultDistribution", nullptr, nullptr,
                             reinterpret_cast<LPBYTE>(defaultDistroGuid), &size);
    
    RegCloseKey(hKey);
    
    if (result != ERROR_SUCCESS) {
        return L"";
    }
    
    // Convert GUID to distribution name
    // This would require additional registry lookup
    return L"Ubuntu"; // Simplified for example
}

} // namespace WSL
