// Setup Trust Line for TROT Token Recipient
const xrpl = require('xrpl')

// Account credentials
const RECIPIENT_ADDRESS = "rfvd9orZgjbuNueGeiFHWb7DbKM3SMw7Dt"
const RECIPIENT_SEED = "sEdTD36arkZS7yMUrVJxcR6V8Y97EZz"
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"

async function setupTrustLine() {
    // Connect to XRPL mainnet
    const client = new xrpl.Client('wss://xrplcluster.com')
    await client.connect()

    try {
        // Create wallet from seed
        const wallet = xrpl.Wallet.fromSeed(RECIPIENT_SEED)
        console.log("\nUsing Recipient Account:", wallet.classicAddress)
        
        // Check account info
        const accountInfo = await client.request({
            command: "account_info",
            account: wallet.classicAddress,
            ledger_index: "validated"
        })
        console.log("Recipient Balance:", xrpl.dropsToXrp(accountInfo.result.account_data.Balance), "XRP")

        // Set trust line
        const trustSetTx = {
            "TransactionType": "TrustSet",
            "Account": RECIPIENT_ADDRESS,
            "LimitAmount": {
                "currency": "54524F5400000000000000000000000000000000", // TROT in hex
                "value": "1000000000", // 1 billion TROT
                "issuer": ISSUER_ADDRESS
            },
            "Fee": "12"
        }

        console.log("\nSetting up trust line...")
        console.log("From (Recipient):", RECIPIENT_ADDRESS)
        console.log("To (Issuer):", ISSUER_ADDRESS)
        console.log("Limit:", trustSetTx.LimitAmount.value, "TROT")
        
        // Submit transaction
        const result = await client.submitAndWait(trustSetTx, { wallet })

        console.log("\nTransaction Result:", result.result.meta.TransactionResult)
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log("Trust line successfully set up!")
            
            // Check trust lines
            const lines = await client.request({
                command: "account_lines",
                account: RECIPIENT_ADDRESS,
                ledger_index: "validated"
            })
            console.log("\nUpdated Trust Lines:", JSON.stringify(lines.result, null, 2))
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
