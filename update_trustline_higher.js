// Update Trust Line with Higher Limit
const xrpl = require('xrpl')

// TROT Issuer Account
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"
const ISSUER_SEED = "sEdTAmwrsXmHksQqseh1U1NwbbQZKD8"

async function updateTrustLine() {
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

        // Set trust line with higher limit
        const trustSetTx = {
            "TransactionType": "TrustSet",
            "Account": ISSUER_ADDRESS,
            "LimitAmount": {
                "currency": "54524F5400000000000000000000000000000000",
                "value": "100000000000", // 100 billion TROT
                "issuer": ISSUER_ADDRESS
            },
            "Fee": "12",
            "Flags": 0 // No flags, allow rippling
        }

        console.log("\nUpdating trust line...")
        console.log("Account:", ISSUER_ADDRESS)
        console.log("New Limit:", trustSetTx.LimitAmount.value, "TROT")
        
        // Submit transaction
        const result = await client.submitAndWait(trustSetTx, { wallet })

        console.log("\nTransaction Result:", result.result.meta.TransactionResult)
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log("Trust line successfully updated!")
            
            // Check trust lines
            const lines = await client.request({
                command: "account_lines",
                account: ISSUER_ADDRESS,
                ledger_index: "validated"
            })
            console.log("\nUpdated Trust Lines:", JSON.stringify(lines.result, null, 2))
        } else {
            console.log("Failed to update trust line. Please check the transaction result.")
        }
        
    } catch (err) {
        console.error("Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

updateTrustLine()
