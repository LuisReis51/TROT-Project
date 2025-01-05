// Create a new XRPL account
const xrpl = require('xrpl')

async function createAccount() {
    // Generate new credentials
    const wallet = xrpl.Wallet.generate()
    
    console.log("\nNew Account Generated!")
    console.log("Address:", wallet.classicAddress)
    console.log("Seed:", wallet.seed)
    console.log("\nIMPORTANT: Save these credentials securely!")
    console.log("You will need to fund this account with at least 10 XRP to activate it")
}

createAccount()
