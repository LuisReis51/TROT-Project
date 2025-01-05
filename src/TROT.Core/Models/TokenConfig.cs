namespace TROT.Core.Models
{
    public class TokenConfig
    {
        public string RpcUrl { get; set; } = string.Empty;
        public string ContractAddress { get; set; } = string.Empty;
        public string OwnerPrivateKey { get; set; } = string.Empty;
        public decimal InitialSupply { get; set; } = 1_000_000_000;
        public decimal MaxSupply { get; set; } = 2_000_000_000;
    }
}
