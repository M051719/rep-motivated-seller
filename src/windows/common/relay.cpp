#include "relay.h"
#include <thread>
#include <atomic>

class IORelay {
private:
    HANDLE linux_stdin;
    HANDLE linux_stdout;
    HANDLE linux_stderr;
    std::atomic<bool> shouldStop{false};
    
public:
    IORelay(HANDLE stdin_h, HANDLE stdout_h, HANDLE stderr_h)
        : linux_stdin(stdin_h), linux_stdout(stdout_h), linux_stderr(stderr_h) {}
    
    int Start() {
        // Create relay threads
        std::thread stdinThread(&IORelay::RelayStdin, this);
        std::thread stdoutThread(&IORelay::RelayStdout, this);
        std::thread stderrThread(&IORelay::RelayStderr, this);
        
        // Wait for process to complete
        WaitForProcessCompletion();
        
        shouldStop = true;
        
        // Cleanup threads
        if (stdinThread.joinable()) stdinThread.join();
        if (stdoutThread.joinable()) stdoutThread.join();
        if (stderrThread.joinable()) stderrThread.join();
        
        return GetProcessExitCode();
    }
    
private:
    void RelayStdin() {
        char buffer[4096];
        DWORD bytesRead, bytesWritten;
        
        while (!shouldStop) {
            if (ReadFile(GetStdHandle(STD_INPUT_HANDLE), buffer, sizeof(buffer), &bytesRead, nullptr)) {
                if (bytesRead > 0) {
                    WriteFile(linux_stdin, buffer, bytesRead, &bytesWritten, nullptr);
                }
            }
        }
    }
    
    void RelayStdout() {
        char buffer[4096];
        DWORD bytesRead, bytesWritten;
        
        while (!shouldStop) {
            if (ReadFile(linux_stdout, buffer, sizeof(buffer), &bytesRead, nullptr)) {
                if (bytesRead > 0) {
                    WriteFile(GetStdHandle(STD_OUTPUT_HANDLE), buffer, bytesRead, &bytesWritten, nullptr);
                }
            } else {
                break; // Process likely terminated
            }
        }
    }
    
    void RelayStderr() {
        char buffer[4096];
        DWORD bytesRead, bytesWritten;
        
        while (!shouldStop) {
            if (ReadFile(linux_stderr, buffer, sizeof(buffer), &bytesRead, nullptr)) {
                if (bytesRead > 0) {
                    WriteFile(GetStdHandle(STD_ERROR_HANDLE), buffer, bytesRead, &bytesWritten, nullptr);
                }
            } else {
                break; // Process likely terminated
            }
        }
    }
    
    void WaitForProcessCompletion() {
        // Implementation to wait for Linux process completion
        // This would typically involve waiting on a control handle
    }
    
    int GetProcessExitCode() {
        // Return the exit code from the Linux process
        return 0;
    }
};

int RelayIO(HANDLE stdin_h, HANDLE stdout_h, HANDLE stderr_h) {
    IORelay relay(stdin_h, stdout_h, stderr_h);
    return relay.Start();
}