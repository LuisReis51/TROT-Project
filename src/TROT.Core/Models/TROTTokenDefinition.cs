using Ripple.Binary.Codec.Types;
using System.Collections.Generic;

namespace TROT.Core.Models
{
    public class TROTTokenDefinition
    {
        public const string CurrencyCode = "TROT";
        public const string TokenName = "TIME ROUTE OPTIMIZATION TRENDS";
        public const decimal InitialSupply = 8_000_000_000;  // 8 billion tokens
        
        public static Dictionary<string, object> GetTokenProperties()
        {
            return new Dictionary<string, object>
            {
                { "Currency", CurrencyCode },
                { "Issuer", "" },  // Will be set to your issuing account
                { "Value", InitialSupply.ToString() },
                { "TokenTaxon", 0 },  // Required for issued tokens
                { "TransferFee", 0 },  // 0% transfer fee
                { "Flags", new uint[] { 
                    // TF_TRANSFERABLE - Allows tokens to be transferred
                    // TF_BURNABLE - Allows tokens to be burned
                    0x00000001 | 0x00000002 
                }}
            };
        }
    }
}
