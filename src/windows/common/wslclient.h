#pragma once

#include <windows.h>
#include <string>
#include <vector>
#include <memory>
#include <optional>

namespace WSL {

struct ProcessHandles {
    HANDLE stdin_handle = INVALID_HANDLE_VALUE;
    HANDLE stdout_handle = INVALID_HANDLE_VALUE;
    HANDLE stderr_handle = INVALID_HANDLE_VALUE;
    HANDLE process_handle = INVALID_HANDLE_VALUE;
    HANDLE control_handle = INVALID_HANDLE_VALUE;
    HANDLE interop_handle = INVALID_HANDLE_VALUE;
    
    ~ProcessHandles() {
        CloseHandles();
    }
    
    void CloseHandles();
    bool AreValid() const;
};

enum class WSLCommand {
    Execute,
    Help,
    Version,
    List,
    Status,
    Shutdown,
    Terminate,
    SetDefault,
    Unregister,
    Import,
    Export,
    Update
};

struct WSLArguments {
    WSLCommand command = WSLCommand::Execute;
    std::wstring distributionName;
    std::wstring executeCommand;
    std::wstring workingDirectory;
    std::vector<std::wstring> additionalArgs;
    bool asUser = false;
    bool shellExecute = false;
    std::wstring userName;
    std::optional<DWORD> exitCode;
};

class WSLCommandLineParser {
public:
    explicit WSLCommandLineParser(int argc, wchar_t* argv[]);
    ~WSLCommandLineParser() = default;
    
    // Non-copyable
    WSLCommandLineParser(const WSLCommandLineParser&) = delete;
    WSLCommandLineParser& operator=(const WSLCommandLineParser&) = delete;
    
    // Movable
    WSLCommandLineParser(WSLCommandLineParser&&) = default;
    WSLCommandLineParser& operator=(WSLCommandLineParser&&) = default;
    
    const WSLArguments& GetArguments() const { return arguments_; }
    bool IsValid() const { return isValid_; }
    const std::wstring& GetErrorMessage() const { return errorMessage_; }
    
    void ShowHelp() const;
    void ShowVersion() const;
    
private:
    void ParseArguments(int argc, wchar_t* argv[]);
    void ParseDistributionOption(int& index, int argc, wchar_t* argv[]);
    void ParseExecuteOption(int& index, int argc, wchar_t* argv[]);
    void ParseUserOption(int& index, int argc, wchar_t* argv[]);
    void ParseWorkingDirectoryOption(int& index, int argc, wchar_t* argv[]);
    
    WSLArguments arguments_;
    bool isValid_ = true;
    std::wstring errorMessage_;
    
    static const wchar_t* GetCommandName(WSLCommand command);
};

class WSLClient {
public:
    WSLClient();
    ~WSLClient();
    
    // Non-copyable, non-movable
    WSLClient(const WSLClient&) = delete;
    WSLClient& operator=(const WSLClient&) = delete;
    WSLClient(WSLClient&&) = delete;
    WSLClient& operator=(WSLClient&&) = delete;
    
    int Execute(const WSLArguments& args);
    
private:
    class Impl;
    std::unique_ptr<Impl> pImpl_;
};

// Utility functions
std::wstring GetWSLVersion();
std::vector<std::wstring> GetAvailableDistributions();
bool IsDistributionInstalled(const std::wstring& name);
std::wstring GetDefaultDistribution();
bool SetDefaultDistribution(const std::wstring& name);

} // namespace WSL
