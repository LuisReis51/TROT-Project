// TROT Token Issuance Script
const xrpl = require('xrpl')

// Account credentials
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"    // Your account as issuer
const ISSUER_SEED = "sEdTAmwrsXmHksQqseh1U1NwbbQZKD8"          // Your account seed
const OPERATIONS_ADDRESS = "rJ4TP3htb1ZjVcf6g17JQbA1A6PzFkPXj"  // Operations account

async function issueTrotTokens() {
    // Connect to XRPL mainnet
    const client = new xrpl.Client('wss://xrplcluster.com')
    await client.connect()

    try {
        // Create wallet from seed
        const wallet = xrpl.Wallet.fromSeed(ISSUER_SEED)
        console.log("\nUsing Issuer Account:", wallet.classicAddress)
        
        // Check account info
        try {
            const accountInfo = await client.request({
                command: "account_info",
                account: wallet.classicAddress,
                ledger_index: "validated"
            })
            console.log("Issuer Balance:", xrpl.dropsToXrp(accountInfo.result.account_data.Balance), "XRP")
        } catch (err) {
            if (err.data && err.data.error === "actNotFound") {
                console.log("\nERROR: Issuer account not found or not funded.")
                return
            }
            throw err
        }

        // Issue tokens using a currency issue transaction
        const issueTokenTx = {
            "TransactionType": "TrustSet",
            "Account": ISSUER_ADDRESS,
            "LimitAmount": {
                "currency": "54524F5400000000000000000000000000000000", // TROT in hex
                "value": "8000000000", // 8 billion TROT
                "issuer": OPERATIONS_ADDRESS
            },
            "Fee": "12",
            "Flags": 262144  // tfSetfAuth flag
        }

        console.log("\nIssuing TROT tokens...")
        console.log("From (Issuer):", ISSUER_ADDRESS)
        console.log("To (Operations):", OPERATIONS_ADDRESS)
        console.log("Amount:", issueTokenTx.LimitAmount.value, "TROT")
        
        // Submit transaction
        const result = await client.submitAndWait(issueTokenTx, { wallet })

        console.log("\nIssuance Result:", result.result.meta.TransactionResult)
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log("TROT Tokens successfully issued!")
        } else {
            console.log("Failed to issue tokens. Please check the transaction result.")
        }
        
    } catch (err) {
        console.error("Issuance Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

issueTrotTokens()
