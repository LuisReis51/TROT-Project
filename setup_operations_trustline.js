// Setup Trust Line for Operations Account
const xrpl = require('xrpl')

// Account credentials
const OPERATIONS_ADDRESS = "rJ4TP3htb1ZjVcf6g17JQbA1A6PzFkPXj"  // Operations Account
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"     // Your account as issuer

async function checkTrustLine() {
    // Connect to XRPL mainnet
    const client = new xrpl.Client('wss://xrplcluster.com')
    await client.connect()

    try {
        console.log("\nChecking trust line...")
        console.log("Operations Account:", OPERATIONS_ADDRESS)
        console.log("Token Issuer:", ISSUER_ADDRESS)
        
        // Check trust lines
        const trustLines = await client.request({
            command: "account_lines",
            account: OPERATIONS_ADDRESS,
            peer: ISSUER_ADDRESS,
            ledger_index: "validated"
        })

        console.log("\nTrust Lines:", JSON.stringify(trustLines.result, null, 2))
        
    } catch (err) {
        console.error("Trust Line Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

checkTrustLine()
