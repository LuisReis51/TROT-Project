// TROT Token Mainnet Deployment
const xrpl = require('xrpl')

// TROT Token account credentials
const TROT_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"
const TROT_SEED = "sEdTAmwrsXmHksQqseh1U1NwbbQZKD8"

async function deployToMainnet() {
    // Connect to XRPL mainnet
    const client = new xrpl.Client('wss://xrplcluster.com')
    await client.connect()

    try {
        // Create wallet from seed
        const wallet = xrpl.Wallet.fromSeed(TROT_SEED)
        console.log("\nUsing TROT Token Account:", wallet.classicAddress)
        
        // Check account info
        try {
            const accountInfo = await client.request({
                command: "account_info",
                account: wallet.classicAddress,
                ledger_index: "validated"
            })
            console.log("Account Balance:", xrpl.dropsToXrp(accountInfo.result.account_data.Balance), "XRP")
        } catch (err) {
            if (err.data && err.data.error === "actNotFound") {
                console.log("\nERROR: Account not found or not funded.")
                return
            }
            throw err
        }

        // Set up trust line first
        const trustSetTx = {
            "TransactionType": "TrustSet",
            "Account": wallet.classicAddress,
            "LimitAmount": {
                "currency": "54524F5400000000000000000000000000000000", // TROT in hex
                "value": "8000000000", // 8 billion TROT
                "issuer": "rJ4TP3htb1ZjVcf6g17JQbA1A6PzFkPXj" // Operations Account
            },
            "Fee": "12",
            "Flags": 0
        }

        console.log("\nSetting up trust line...")
        
        // Submit transaction
        const result = await client.submitAndWait(trustSetTx, { wallet })

        console.log("Trust Line Result:", result.result.meta.TransactionResult)
        console.log("Trust line established! Now you can receive TROT tokens.")
        
    } catch (err) {
        console.error("Deployment Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

deployToMainnet()