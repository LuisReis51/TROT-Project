// Setup Market Making for TROT Token
const xrpl = require('xrpl')

// Account credentials
const ISSUER_ADDRESS = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"
const ISSUER_SEED = "sEdTAmwrsXmHksQqseh1U1NwbbQZKD8"

async function setupMarket() {
    // Connect to XRPL mainnet
    const client = new xrpl.Client('wss://xrplcluster.com')
    await client.connect()

    try {
        // Create wallet from seed
        const wallet = xrpl.Wallet.fromSeed(ISSUER_SEED)
        console.log("\nUsing Issuer Account:", wallet.classicAddress)

        // Create an offer to sell TROT for XRP
        const offerCreateTx = {
            "TransactionType": "OfferCreate",
            "Account": ISSUER_ADDRESS,
            "TakerGets": {
                "currency": "54524F5400000000000000000000000000000000",
                "value": "1000",  // Amount of TROT to sell
                "issuer": ISSUER_ADDRESS
            },
            "TakerPays": "1000000", // Amount of XRP to receive (in drops)
            "Fee": "12"
        }

        console.log("\nCreating market offer...")
        console.log("Selling:", offerCreateTx.TakerGets.value, "TROT")
        console.log("For:", xrpl.dropsToXrp(offerCreateTx.TakerPays), "XRP")
        
        // Submit transaction
        const result = await client.submitAndWait(offerCreateTx, { wallet })

        console.log("\nTransaction Result:", result.result.meta.TransactionResult)
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log("Market offer successfully created!")
            
            // Get offers
            const offers = await client.request({
                command: "account_offers",
                account: ISSUER_ADDRESS,
                ledger_index: "validated"
            })
            console.log("\nActive Offers:", JSON.stringify(offers.result, null, 2))
        } else {
            console.log("Failed to create offer. Please check the transaction result.")
        }
        
    } catch (err) {
        console.error("Error:", err)
        if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2))
        }
    }

    client.disconnect()
}

setupMarket()
