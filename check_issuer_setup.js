// Check Issuer Account Setup
const xrpl = require('xrpl')

// Account credentials
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"    // Your account as issuer

async function checkIssuerSetup() {
    // Connect to XRPL mainnet
    const client = new xrpl.Client('wss://xrplcluster.com')
    await client.connect()

    try {
        console.log("\nChecking issuer account setup...")
        console.log("Issuer Account:", ISSUER_ADDRESS)

        // Get account info
        const accountInfo = await client.request({
            command: "account_info",
            account: ISSUER_ADDRESS,
            ledger_index: "validated"
        })
        console.log("\nAccount Info:", JSON.stringify(accountInfo.result, null, 2))

        // Get account flags
        const flags = accountInfo.result.account_data.Flags
        console.log("\nAccount Flags:", flags)
        console.log("DefaultRipple enabled:", (flags & 0x00800000) !== 0)

        // Get trust lines
        const trustLines = await client.request({
            command: "account_lines",
            account: ISSUER_ADDRESS,
            ledger_index: "validated"
        })
        console.log("\nTrust Lines:", JSON.stringify(trustLines.result, null, 2))

    } catch (err) {
        console.error("Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

checkIssuerSetup()
