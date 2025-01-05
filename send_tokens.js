// Send TROT Tokens
const xrpl = require('xrpl')

// Account credentials
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"    // Your account as issuer
const ISSUER_SEED = "sEdTAmwrsXmHksQqseh1U1NwbbQZKD8"          // Your account seed
const OPERATIONS_ADDRESS = "rJ4TP3htb1ZjVcf6g17JQbA1A6PzFkPXj"  // Operations account

async function sendTokens() {
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

        // Send tokens using a Payment transaction
        const sendTokenTx = {
            "TransactionType": "Payment",
            "Account": ISSUER_ADDRESS,
            "Destination": OPERATIONS_ADDRESS,
            "Amount": {
                "currency": "54524F5400000000000000000000000000000000", // TROT in hex
                "value": "1000000", // 1 million TROT
                "issuer": ISSUER_ADDRESS
            },
            "Fee": "12",
            "Flags": 0
        }

        console.log("\nSending TROT tokens...")
        console.log("From (Issuer):", ISSUER_ADDRESS)
        console.log("To (Operations):", OPERATIONS_ADDRESS)
        console.log("Amount:", sendTokenTx.Amount.value, "TROT")
        
        // Submit transaction
        const result = await client.submitAndWait(sendTokenTx, { wallet })

        console.log("\nTransaction Result:", result.result.meta.TransactionResult)
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log("TROT Tokens successfully sent!")
        } else {
            console.log("Failed to send tokens. Please check the transaction result.")
        }
        
    } catch (err) {
        console.error("Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

sendTokens()
