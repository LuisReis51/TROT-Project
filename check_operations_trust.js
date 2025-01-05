// Check Operations Account Trust Lines
const xrpl = require('xrpl')

// Account addresses
const OPERATIONS_ADDRESS = "rJ4TP3htb1ZjVcf6g17JQbA1A6PzFkPXj"
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"

async function checkTrustLines() {
    // Connect to XRPL mainnet
    const client = new xrpl.Client('wss://xrplcluster.com')
    await client.connect()

    try {
        console.log("\nChecking Operations Account:", OPERATIONS_ADDRESS)
        
        // Get account info
        const accountInfo = await client.request({
            command: "account_info",
            account: OPERATIONS_ADDRESS,
            ledger_index: "validated"
        })
        console.log("Operations Balance:", xrpl.dropsToXrp(accountInfo.result.account_data.Balance), "XRP")

        // Get trust lines
        const lines = await client.request({
            command: "account_lines",
            account: OPERATIONS_ADDRESS,
            peer: ISSUER_ADDRESS,  // Only show lines with the issuer
            ledger_index: "validated"
        })

        console.log("\nTrust Lines with Issuer:", JSON.stringify(lines.result, null, 2))
        
    } catch (err) {
        console.error("Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

checkTrustLines()
