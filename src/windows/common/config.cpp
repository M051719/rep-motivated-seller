#include "config.h"
#include <fstream>
#include <sstream>
#include <regex>

class WSLConfigManager::Impl {
private:
    std::map<std::string, std::map<std::string, std::string>> wslConfig;
    std::map<std::string, std::map<std::string, std::string>> wslGlobalConfig;

public:
    bool LoadWslConfig(const std::string& distributionPath) {
        std::string configPath = distributionPath + "/etc/wsl.conf";
        return ParseINIFile(configPath, wslConfig);
    }

    bool LoadGlobalConfig(const std::string& userProfile) {
        std::string configPath = userProfile + "\\.wslconfig";
        return ParseINIFile(configPath, wslGlobalConfig);
    }

private:
    bool ParseINIFile(const std::string& filePath,
                      std::map<std::string, std::map<std::string, std::string>>& config) {
        std::ifstream file(filePath);
        if (!file.is_open()) return false;

        std::string line;
        std::string currentSection;
        std::regex sectionRegex(R"(\[([^\]]+)\])");
        std::regex keyValueRegex(R"(([^=]+)=([^=]*))");
        std::smatch matches;

        while (std::getline(file, line)) {
            // Remove comments and trim whitespace
            size_t commentPos = line.find('#');
            if (commentPos != std::string::npos) {
                line = line.substr(0, commentPos);
            }

            line = Trim(line);
            if (line.empty()) continue;

            // Check for section header
            if (std::regex_match(line, matches, sectionRegex)) {
                currentSection = matches[1].str();
                config[currentSection] = std::map<std::string, std::string>();
            }
            // Check for key-value pair
            else if (std::regex_match(line, matches, keyValueRegex)) {
                if (!currentSection.empty()) {
                    std::string key = Trim(matches[1].str());
                    std::string value = Trim(matches[2].str());
                    config[currentSection][key] = value;
                }
            }
        }

        return true;
    }

    std::string Trim(const std::string& str) {
        size_t start = str.find_first_not_of(" \t\r\n");
        if (start == std::string::npos) return "";

        size_t end = str.find_last_not_of(" \t\r\n");
        return str.substr(start, end - start + 1);
    }
};

// Configuration validation and application
class ConfigValidator {
public:
    static bool ValidateMemorySize(const std::string& memoryStr) {
        std::regex memoryRegex(R"((\d+)(GB|MB|KB|B)?)");
        return std::regex_match(memoryStr, memoryRegex);
    }

    static bool ValidateProcessorCount(const std::string& procStr) {
        try {
            int count = std::stoi(procStr);
            return count > 0 && count <= std::thread::hardware_concurrency();
        } catch (...) {
            return false;
        }
    }

    static bool ValidateNetworkingMode(const std::string& mode) {
        const std::vector<std::string> validModes = {
            "NAT", "bridged", "mirrored", "none", "virtioproxy"
        };
        return std::find(validModes.begin(), validModes.end(), mode) != validModes.end();
    }
};
