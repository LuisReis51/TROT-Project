// Setup Account as Token Issuer
const xrpl = require('xrpl')

// Account credentials
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"    // Your account as issuer
const ISSUER_SEED = "sEdTAmwrsXmHksQqseh1U1NwbbQZKD8"          // Your account seed

async function setupIssuer() {
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

        // Set DefaultRipple flag
        const accountSetTx = {
            "TransactionType": "AccountSet",
            "Account": ISSUER_ADDRESS,
            "SetFlag": 8, // Enable rippling
            "Fee": "12"
        }

        console.log("\nSetting up account as issuer...")
        
        // Submit transaction
        const result = await client.submitAndWait(accountSetTx, { wallet })

        console.log("Setup Result:", result.result.meta.TransactionResult)
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log("Account successfully set up as issuer!")
        } else {
            console.log("Failed to set up account as issuer. Please check the transaction result.")
        }
        
    } catch (err) {
        console.error("Setup Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

setupIssuer()
