// Configure TROT Token Issuer Account
const xrpl = require('xrpl')

// TROT Issuer Account
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"
const ISSUER_SEED = "sEdTAmwrsXmHksQqseh1U1NwbbQZKD8"

async function configureIssuer() {
    // Connect to XRPL mainnet
    const client = new xrpl.Client('wss://xrplcluster.com')
    await client.connect()

    try {
        // Create wallet from seed
        const wallet = xrpl.Wallet.fromSeed(ISSUER_SEED)
        console.log("\nUsing Issuer Account:", wallet.classicAddress)
        
        // Check account info
        const accountInfo = await client.request({
            command: "account_info",
            account: wallet.classicAddress,
            ledger_index: "validated"
        })
        console.log("Issuer Balance:", xrpl.dropsToXrp(accountInfo.result.account_data.Balance), "XRP")

        // Configure issuer settings
        const accountSetTx = {
            "TransactionType": "AccountSet",
            "Account": ISSUER_ADDRESS,
            "SetFlag": xrpl.AccountSetAsfFlags.asfDefaultRipple,
            "Domain": "54524F54", // "TROT" in hex
            "Fee": "12"
        }

        console.log("\nConfiguring issuer account...")
        
        // Submit transaction
        const result = await client.submitAndWait(accountSetTx, { wallet })

        console.log("\nTransaction Result:", result.result.meta.TransactionResult)
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log("Issuer account successfully configured!")
            
            // Get updated account info
            const updatedInfo = await client.request({
                command: "account_info",
                account: wallet.classicAddress,
                ledger_index: "validated"
            })
            console.log("\nUpdated Account Flags:", updatedInfo.result.account_data.Flags)
        } else {
            console.log("Failed to configure issuer account. Please check the transaction result.")
        }
        
    } catch (err) {
        console.error("Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

configureIssuer()
