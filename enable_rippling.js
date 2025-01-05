// Enable Rippling on Issuer Account
const xrpl = require('xrpl')

// Account credentials
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"    // Your account as issuer
const ISSUER_SEED = "sEdTAmwrsXmHksQqseh1U1NwbbQZKD8"          // Your account seed

async function enableRippling() {
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

        // Enable rippling with AccountSet transaction
        const accountSetTx = {
            "TransactionType": "AccountSet",
            "Account": ISSUER_ADDRESS,
            "SetFlag": xrpl.AccountSetAsfFlags.asfDefaultRipple,
            "Fee": "12"
        }

        console.log("\nEnabling rippling...")
        
        // Submit transaction
        const result = await client.submitAndWait(accountSetTx, { wallet })

        console.log("\nTransaction Result:", result.result.meta.TransactionResult)
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log("Rippling successfully enabled!")
        } else {
            console.log("Failed to enable rippling. Please check the transaction result.")
        }
        
    } catch (err) {
        console.error("Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

enableRippling()
