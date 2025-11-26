#include <windows.h>
#include <iostream>
#include <vector>
#include <string>
#include "wslclient.h"
#include "svccomm.h"

class WSLCommandLineParser {
private:
    std::vector<std::wstring> args;
    std::wstring distributionName;
    std::wstring command;
    bool isHelp = false;
    bool isVersion = false;
    bool isShutdown = false;

public:
    WSLCommandLineParser(int argc, wchar_t* argv[]) {
        for (int i = 1; i < argc; ++i) {
            args.push_back(argv[i]);
        }
        ParseArguments();
    }

    void ParseArguments() {
        for (size_t i = 0; i < args.size(); ++i) {
            const auto& arg = args[i];
            
            if (arg == L"--help" || arg == L"-h") {
                isHelp = true;
            }
            else if (arg == L"--version" || arg == L"-v") {
                isVersion = true;
            }
            else if (arg == L"--shutdown") {
                isShutdown = true;
            }
            else if (arg == L"--distribution" || arg == L"-d") {
                if (i + 1 < args.size()) {
                    distributionName = args[++i];
                }
            }
            else if (arg == L"--exec" || arg == L"-e") {
                if (i + 1 < args.size()) {
                    command = args[++i];
                }
            }
        }
    }

    // Getters
    bool IsHelp() const { return isHelp; }
    bool IsVersion() const { return isVersion; }
    bool IsShutdown() const { return isShutdown; }
    const std::wstring& GetDistributionName() const { return distributionName; }
    const std::wstring& GetCommand() const { return command; }
};

int wmain(int argc, wchar_t* argv[]) {
    WSLCommandLineParser parser(argc, argv);
    
    if (parser.IsHelp()) {
        ShowHelp();
        return 0;
    }
    
    if (parser.IsVersion()) {
        ShowVersion();
        return 0;
    }
    
    try {
        WSLServiceCommunicator service;
        
        if (parser.IsShutdown()) {
            return service.Shutdown();
        }
        
        // Create instance and execute command
        return service.CreateInstanceAndExecute(
            parser.GetDistributionName(),
            parser.GetCommand()
        );
    }
    catch (const std::exception& e) {
        std::wcerr << L"Error: " << e.what() << std::endl;
        return 1;
    }
}