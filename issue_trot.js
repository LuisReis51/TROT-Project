// Issue TROT Tokens
const xrpl = require('xrpl')

// TROT Issuer Account
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"
const ISSUER_SEED = "sEdTAmwrsXmHksQqseh1U1NwbbQZKD8"

// Operations Account
const OPERATIONS_ADDRESS = "rJ4TP3htb1ZjVcf6g17JQbA1A6PzFkPXj"

async function issueTrot() {
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

        // Issue TROT tokens with a smaller amount
        const issueTx = {
            "TransactionType": "Payment",
            "Account": ISSUER_ADDRESS,
            "Destination": OPERATIONS_ADDRESS,
            "Amount": {
                "currency": "54524F5400000000000000000000000000000000",
                "value": "100", // Start with 100 TROT
                "issuer": ISSUER_ADDRESS
            },
            "Fee": "12",
            "Flags": 131072 // tfSetNoRipple
        }

        console.log("\nIssuing TROT tokens...")
        console.log("From:", ISSUER_ADDRESS)
        console.log("To:", OPERATIONS_ADDRESS)
        console.log("Amount:", issueTx.Amount.value, "TROT")
        
        // Submit transaction
        const result = await client.submitAndWait(issueTx, { wallet })

        console.log("\nTransaction Result:", result.result.meta.TransactionResult)
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log("TROT tokens successfully issued!")
            
            // Check balances
            const lines = await client.request({
                command: "account_lines",
                account: OPERATIONS_ADDRESS,
                ledger_index: "validated"
            })
            console.log("\nUpdated Trust Lines:", JSON.stringify(lines.result, null, 2))
        } else {
            console.log("Failed to issue tokens. Please check the transaction result.")
            console.log("Error details:", JSON.stringify(result.result, null, 2))
        }
        
    } catch (err) {
        console.error("Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

issueTrot()
