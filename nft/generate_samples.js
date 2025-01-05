// Generate Sample TROT Badges
const LogoProcessor = require('./logo_processor')
const fs = require('fs').promises
const path = require('path')

async function generateSamples() {
    try {
        const processor = new LogoProcessor('C:/Users/Luis/Documents/trot/trot docs/512x512trotlogo.png')
        await processor.init()

        const badgeTypes = [
            'road_master',
            'secure_guardian',
            'eco_warrior',
            'founding_member',
            'time_keeper',
            'community_pillar',
            'innovation_pioneer',
            'reliability_star'
        ]

        console.log('Generating sample badges...')
        
        for (const type of badgeTypes) {
            console.log(`\nProcessing ${type} badge...`)
            
            console.log('Creating static version...')
            const imagePath = await processor.createBadgeVariation(type)
            
            console.log('Creating animated version...')
            const animatedPath = await processor.createAnimatedBadge(type)
            
            console.log('Generating metadata...')
            const metadata = await processor.createNFTMetadata(type, imagePath, animatedPath)
            
            // Save metadata
            await fs.writeFile(
                path.join(processor.outputDir, `badge_${type}_metadata.json`),
                JSON.stringify(metadata, null, 2)
            )
            
            console.log(`✓ Created ${type} badge:`)
            console.log(`  • Static image: ${imagePath}`)
            console.log(`  • Animated version: ${animatedPath}`)
            console.log(`  • Metadata: badge_${type}_metadata.json`)
        }

        console.log('\n✨ Sample generation complete! Check the processed_logos directory.')

    } catch (err) {
        console.error('Error generating samples:', err)
    }
}

generateSamples()
