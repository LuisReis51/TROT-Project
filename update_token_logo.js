// Update TROT token logo for wallet display
const fs = require('fs').promises
const path = require('path')
const xrpl = require('xrpl')
require('dotenv').config()

async function updateTokenLogo() {
    try {
        // Copy logo files to docs/images
        const sourceDir = path.join(__dirname, 'nft/token_logo')
        const targetDir = path.join(__dirname, 'docs/images')
        
        // Copy files
        await fs.copyFile(
            path.join(sourceDir, 'trot_token_512.png'),
            path.join(targetDir, 'trot_token_512.png')
        )
        await fs.copyFile(
            path.join(sourceDir, 'trot_token_128.png'),
            path.join(targetDir, 'trot_token_128.png')
        )

        console.log('Logo files copied to docs/images')

        // Update token_info.json with GitHub URLs
        const tokenInfoPath = path.join(__dirname, 'token_info.json')
        const tokenInfo = JSON.parse(await fs.readFile(tokenInfoPath, 'utf8'))
        
        // GitHub repository URL for TROT
        const baseUrl = 'https://raw.githubusercontent.com/LuisReis51/TROT-Project/main/docs/images'
        
        tokenInfo.token.logo = {
            url: `${baseUrl}/trot_token_512.png`,
            thumbnail: `${baseUrl}/trot_token_128.png`,
            format: 'png'
        }

        await fs.writeFile(tokenInfoPath, JSON.stringify(tokenInfo, null, 4))
        console.log('Token info updated with new logo URLs')

        // Connect to XRPL
        const client = new xrpl.Client("wss://xrplcluster.com/")
        await client.connect()

        // Prepare transaction
        const wallet = xrpl.Wallet.fromSeed(process.env.ISSUER_SEED)
        
        // Convert token info to hex for AccountSet transaction
        const tokenInfoHex = Buffer.from(JSON.stringify(tokenInfo)).toString('hex').toUpperCase()
        
        // Set account domain with token information
        const tx = {
            TransactionType: "AccountSet",
            Account: wallet.address,
            Domain: tokenInfoHex
        }

        // Submit transaction
        console.log('Submitting transaction to XRPL...')
        const result = await client.submitAndWait(tx, { wallet })
        
        console.log('Transaction successful!')
        console.log('Transaction result:', result)
        
        await client.disconnect()
        
    } catch (error) {
        console.error('Error:', error)
    }
}

updateTokenLogo()
