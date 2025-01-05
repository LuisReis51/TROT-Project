// Setup Trust Line for TROT Token
const xrpl = require('xrpl')

// Account credentials for Operations Account
const OPERATIONS_ADDRESS = "rJ4TP3htb1ZjVcf6g17JQbA1A6PzFkPXj"  // Operations account
const OPERATIONS_SEED = "YOUR_OPERATIONS_ACCOUNT_SEED"           // You'll need to provide this

// Issuer Account (TROT token)
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"    // TROT token issuer

async function setupTrustLine() {
    // Connect to XRPL mainnet
    const client = new xrpl.Client('wss://xrplcluster.com')
    await client.connect()

    try {
        // Create wallet from seed
        const wallet = xrpl.Wallet.fromSeed(OPERATIONS_SEED)
        console.log("\nUsing Operations Account:", wallet.classicAddress)
        
        // Check account info
        try {
            const accountInfo = await client.request({
                command: "account_info",
                account: wallet.classicAddress,
                ledger_index: "validated"
            })
            console.log("Operations Balance:", xrpl.dropsToXrp(accountInfo.result.account_data.Balance), "XRP")
        } catch (err) {
            if (err.data && err.data.error === "actNotFound") {
                console.log("\nERROR: Operations account not found or not funded.")
                return
            }
            throw err
        }

        // Set trust line
        const trustSetTx = {
            "TransactionType": "TrustSet",
            "Account": OPERATIONS_ADDRESS,
            "LimitAmount": {
                "currency": "54524F5400000000000000000000000000000000", // TROT in hex
                "value": "8000000000", // 8 billion TROT
                "issuer": ISSUER_ADDRESS
            },
            "Fee": "12",
            "Flags": 131072 // tfSetNoRipple
        }

        console.log("\nSetting up trust line...")
        console.log("From (Operations):", OPERATIONS_ADDRESS)
        console.log("To (Issuer):", ISSUER_ADDRESS)
        console.log("Limit:", trustSetTx.LimitAmount.value, "TROT")
        
        // Submit transaction
        const result = await client.submitAndWait(trustSetTx, { wallet })

        console.log("\nTransaction Result:", result.result.meta.TransactionResult)
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log("Trust line successfully set up!")
        } else {
            console.log("Failed to set up trust line. Please check the transaction result.")
        }
        
    } catch (err) {
        console.error("Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

setupTrustLine()
