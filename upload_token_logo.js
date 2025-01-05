// Upload TROT token logo to IPFS via Pinata and update token information
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs').promises
const path = require('path')
const xrpl = require('xrpl')
require('dotenv').config()

async function uploadToPinata(filePath, name) {
    try {
        const data = new FormData()
        data.append('file', await fs.readFile(filePath), {
            filepath: path.basename(filePath)
        })
        data.append('pinataMetadata', JSON.stringify({
            name: `TROT_${name}`
        }))

        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
            maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                'Authorization': `Bearer ${process.env.PINATA_JWT}`
            }
        })

        return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
    } catch (error) {
        console.error('Error uploading to Pinata:', error)
        throw error
    }
}

async function updateTokenInfo() {
    try {
        console.log('Uploading logos to IPFS via Pinata...')
        
        // Upload both logo versions
        const url512 = await uploadToPinata(
            path.join(__dirname, 'nft/token_logo/trot_token_512.png'),
            'logo_512'
        )
        console.log('Main logo uploaded:', url512)

        const url128 = await uploadToPinata(
            path.join(__dirname, 'nft/token_logo/trot_token_128.png'),
            'logo_128'
        )
        console.log('Thumbnail uploaded:', url128)

        // Update token_info.json with new URLs
        const tokenInfoPath = path.join(__dirname, 'token_info.json')
        const tokenInfo = JSON.parse(await fs.readFile(tokenInfoPath, 'utf8'))
        
        tokenInfo.token.logo = {
            url: url512,
            thumbnail: url128,
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

// Install required dependencies if not present
async function installDependencies() {
    const { execSync } = require('child_process')
    console.log('Installing required dependencies...')
    execSync('npm install axios form-data', { stdio: 'inherit' })
}

// Run the process
installDependencies()
    .then(updateTokenInfo)
    .catch(console.error)
