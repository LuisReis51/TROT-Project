// Setup Operations Account Trust Line
const xrpl = require('xrpl')

// Account credentials
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"    // Your account as issuer
const OPERATIONS_ADDRESS = "rJ4TP3htb1ZjVcf6g17JQbA1A6PzFkPXj"  // Operations account

async function setupTrust() {
    // Connect to XRPL mainnet
    const client = new xrpl.Client('wss://xrplcluster.com')
    await client.connect()

    try {
        console.log("\nChecking Operations Account:", OPERATIONS_ADDRESS)
        
        // Check account info
        try {
            const accountInfo = await client.request({
                command: "account_info",
                account: OPERATIONS_ADDRESS,
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

        // Get existing trust lines
        const trustLines = await client.request({
            command: "account_lines",
            account: OPERATIONS_ADDRESS,
            ledger_index: "validated"
        })

        console.log("\nExisting Trust Lines:", JSON.stringify(trustLines.result, null, 2))
        
    } catch (err) {
        console.error("Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

setupTrust()
