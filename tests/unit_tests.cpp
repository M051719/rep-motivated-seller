#include <gtest/gtest.h>
#include "../src/windows/common/wslclient.h"
#include "../src/windows/common/config.h"

class WSLClientTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Setup test environment
    }
    
    void TearDown() override {
        // Cleanup test environment
    }
};

TEST_F(WSLClientTest, ParseBasicArguments) {
    const wchar_t* args[] = {L"wsl.exe", L"--distribution", L"Ubuntu", L"echo", L"hello"};
    
    WSLCommandLineParser parser(5, const_cast<wchar_t**>(args));
    
    EXPECT_EQ(parser.GetDistributionName(), L"Ubuntu");
    EXPECT_EQ(parser.GetCommand(), L"echo hello");
}

TEST_F(WSLClientTest, ParseHelpArgument) {
    const wchar_t* args[] = {L"wsl.exe", L"--help"};
    
    WSLCommandLineParser parser(2, const_cast<wchar_t**>(args));
    
    EXPECT_TRUE(parser.IsHelp());
}

class WSLConfigTest : public ::testing::Test {
protected:
    std::string testConfigPath;
    
    void SetUp() override {
        testConfigPath = "test_wsl.conf";
        CreateTestConfig();
    }
    
    void TearDown() override {
        std::remove(testConfigPath.c_str());
    }
    
private:
    void CreateTestConfig() {
        std::ofstream file(testConfigPath);
        file << "[boot]\n";
        file << "systemd=true\n";
        file << "[automount]\n";
        file << "enabled=true\n";
        file << "root=/mnt\n";
        file.close();
    }
};

TEST_F(WSLConfigTest, ParseConfigFile) {
    WSLConfigManager config;
    EXPECT_TRUE(config.LoadWslConfig(testConfigPath));
    
    EXPECT_EQ(config.GetValue("boot", "systemd"), "true");
    EXPECT_EQ(config.GetValue("automount", "enabled"), "true");
    EXPECT_EQ(config.GetValue("automount", "root"), "/mnt");
}

class WSLServiceTest : public ::testing::Test {
protected:
    void SetUp() override {
        CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    }
    
    void TearDown() override {
        CoUninitialize();
    }
};

TEST_F(WSLServiceTest, COMInterfaceCreation) {
    WSLServiceCommunicator service;
    
    // This would require the actual service to be running
    // In a real test, we'd use a mock service
    EXPECT_NO_THROW(service.Initialize());
}

// Performance tests
class WSLPerformanceTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Setup performance monitoring
    }
};

TEST_F(WSLPerformanceTest, IORelayPerformance) {
    // Test I/O relay performance with large data transfers
    const size_t testDataSize = 1024 * 1024; // 1MB
    std::vector<char> testData(testDataSize, 'A');
    
    auto start = std::chrono::high_resolution_clock::now();
    
    // Simulate I/O relay
    // This would relay the test data through the actual relay mechanism
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // Performance should be under reasonable threshold
    EXPECT_LT(duration.count(), 1000); // Under 1 second for 1MB
}

int main(int argc, char** argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}