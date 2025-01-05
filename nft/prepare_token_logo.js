// Prepare TROT token logo for wallet display
const sharp = require('sharp')
const fs = require('fs').promises
const path = require('path')

async function prepareTokenLogo() {
    const sourcePath = 'C:/Users/Luis/Documents/trot/trot docs/512x512trotlogo.png'
    const outputDir = path.join(__dirname, 'token_logo')
    
    try {
        // Create output directory if it doesn't exist
        await fs.mkdir(outputDir, { recursive: true })
        
        // Process logo for token display
        // Most wallets expect logos to be square PNGs
        const image = sharp(sourcePath)
        
        // Create main token logo (512x512)
        await image
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile(path.join(outputDir, 'trot_token_512.png'))
            
        // Create smaller version for thumbnails (128x128)
        await image
            .resize(128, 128, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile(path.join(outputDir, 'trot_token_128.png'))
            
        console.log('✨ Token logos generated successfully!')
        console.log('Output directory:', outputDir)
        
    } catch (err) {
        console.error('Error preparing token logo:', err)
    }
}

prepareTokenLogo()
