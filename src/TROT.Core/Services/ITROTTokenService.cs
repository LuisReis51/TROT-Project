using TROT.Core.Models;

namespace TROT.Core.Services
{
    public interface ITROTTokenService
    {
        Task<decimal> GetBalanceAsync(string address);
        Task<string> TransferAsync(string to, decimal amount);
        Task<string> MintAsync(string to, decimal amount);
        Task<string> BurnAsync(decimal amount);
        Task<string> PauseAsync();
        Task<string> UnpauseAsync();
        Task<bool> IsPausedAsync();
        Task<decimal> GetTotalSupplyAsync();
    }
}
