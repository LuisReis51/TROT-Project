// Update Trust Line for TROT Token
const xrpl = require('xrpl')

async function updateTrustLine() {
    // Connect to XRPL
    const client = new xrpl.Client('wss://xrplcluster.com')
    await client.connect()

    try {
        // Prepare trust line transaction
        const trustSet = {
            "TransactionType": "TrustSet",
            "Account": "RECIPIENT_ADDRESS", // Replace with recipient's address
            "LimitAmount": {
                "currency": "TROT",
                "issuer": "rnmV9yQ1d1v3UyQsMPxCD6YXLAma8FGhS6", // TROT Issuer
                "value": "1000000000" // Adjust limit as needed (e.g., 1 billion)
            }
        }

        // Sign and submit transaction
        const trustSetTx = await client.submitAndWait(trustSet, {
            // Add recipient's wallet credentials
            wallet: xrpl.Wallet.fromSeed("RECIPIENT_SECRET") 
        })

        console.log("Trust Line Updated:", trustSetTx.result.meta.TransactionResult)
        
    } catch (err) {
        console.error("Error:", err)
    }

    client.disconnect()
}

updateTrustLine()
