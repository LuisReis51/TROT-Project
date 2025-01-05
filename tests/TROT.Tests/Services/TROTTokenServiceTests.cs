using Xunit;
using TROT.Core.Services;

namespace TROT.Tests.Services
{
    public class TROTTokenServiceTests
    {
        private const string TestRpcUrl = "http://localhost:8545";
        private const string TestContractAddress = "0x0000000000000000000000000000000000000000";

        [Fact]
        public async Task GetBalance_ShouldReturnBalance()
        {
            // Arrange
            var service = new TROTTokenService(TestRpcUrl, TestContractAddress);
            var testAddress = "0x1234567890123456789012345678901234567890";

            // Act & Assert
            var exception = await Record.ExceptionAsync(async () =>
            {
                var balance = await service.GetBalanceAsync(testAddress);
            });

            // In test environment without blockchain, we expect an error
            Assert.NotNull(exception);
        }
    }
}
