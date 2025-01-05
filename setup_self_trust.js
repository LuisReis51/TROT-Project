// Setup Trust Line for Self-Issuance
const xrpl = require('xrpl')

// Account credentials
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"    // Your account as issuer
const ISSUER_SEED = "sEdTAmwrsXmHksQqseh1U1NwbbQZKD8"          // Your account seed

async function setupSelfTrust() {
    // Connect to XRPL mainnet
    const client = new xrpl.Client('wss://xrplcluster.com')
    await client.connect()

    try {
        // Create wallet from seed
        const wallet = xrpl.Wallet.fromSeed(ISSUER_SEED)
        console.log("\nUsing Account:", wallet.classicAddress)
        
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

        // Set up trust line to self
        const trustSetTx = {
            "TransactionType": "TrustSet",
            "Account": ISSUER_ADDRESS,
            "LimitAmount": {
                "currency": "54524F5400000000000000000000000000000000", // TROT in hex
                "value": "8000000000", // 8 billion TROT
                "issuer": ISSUER_ADDRESS
            },
            "Fee": "12",
            "Flags": 131072  // tfSetNoRipple flag
        }

        console.log("\nSetting up trust line to self...")
        console.log("Account:", ISSUER_ADDRESS)
        console.log("Trust Amount:", trustSetTx.LimitAmount.value, "TROT")
        
        // Submit transaction
        const result = await client.submitAndWait(trustSetTx, { wallet })

        console.log("\nTrust Line Result:", result.result.meta.TransactionResult)
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log("Trust line successfully established!")
        } else {
            console.log("Failed to set up trust line. Please check the transaction result.")
        }
        
    } catch (err) {
        console.error("Setup Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

setupSelfTrust()
