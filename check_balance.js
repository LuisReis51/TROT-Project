// Check Token Balance
const xrpl = require('xrpl')

// Account credentials
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"    // Your account as issuer
const OPERATIONS_ADDRESS = "rJ4TP3htb1ZjVcf6g17JQbA1A6PzFkPXj"  // Operations account

async function checkBalance() {
    // Connect to XRPL mainnet
    const client = new xrpl.Client('wss://xrplcluster.com')
    await client.connect()

    try {
        console.log("\nChecking balances...")

        // Check issuer balance
        console.log("\nIssuer Account:", ISSUER_ADDRESS)
        const issuerLines = await client.request({
            command: "account_lines",
            account: ISSUER_ADDRESS,
            ledger_index: "validated"
        })
        console.log("Issuer Trust Lines:", JSON.stringify(issuerLines.result, null, 2))

        // Check operations balance
        console.log("\nOperations Account:", OPERATIONS_ADDRESS)
        const opsLines = await client.request({
            command: "account_lines",
            account: OPERATIONS_ADDRESS,
            ledger_index: "validated"
        })
        console.log("Operations Trust Lines:", JSON.stringify(opsLines.result, null, 2))
        
    } catch (err) {
        console.error("Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

checkBalance()
