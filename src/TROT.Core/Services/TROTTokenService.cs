using Nethereum.Web3;
using Nethereum.Contracts;

namespace TROT.Core.Services
{
    public interface ITROTTokenService
    {
        Task<decimal> GetBalanceAsync(string address);
        Task<string> TransferAsync(string privateKey, string to, decimal amount);
    }

    public class TROTTokenService : ITROTTokenService
    {
        private readonly Web3 _web3;
        private readonly string _contractAddress;

        public TROTTokenService(string rpcUrl, string contractAddress)
        {
            _web3 = new Web3(rpcUrl);
            _contractAddress = contractAddress;
        }

        public async Task<decimal> GetBalanceAsync(string address)
        {
            var balanceOfFunctionMessage = new { Owner = address };
            var balanceHandler = _web3.Eth.GetContractQueryHandler<object>();
            var balance = await balanceHandler.QueryAsync<decimal>(
                _contractAddress,
                balanceOfFunctionMessage,
                "balanceOf"
            );
            return balance;
        }

        public async Task<string> TransferAsync(string privateKey, string to, decimal amount)
        {
            var account = new Nethereum.Web3.Accounts.Account(privateKey);
            var web3 = new Web3(account);
            
            var transferFunction = new { To = to, Value = amount };
            var transferHandler = web3.Eth.GetContractTransactionHandler<object>();
            var transactionReceipt = await transferHandler.SendRequestAndWaitForReceiptAsync(
                _contractAddress,
                transferFunction,
                "transfer"
            );
            
            return transactionReceipt.TransactionHash;
        }
    }
}
