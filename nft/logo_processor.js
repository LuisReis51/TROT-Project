// TROT Logo NFT Processor
const sharp = require('sharp')
const fs = require('fs').promises
const path = require('path')

class LogoProcessor {
    constructor(sourceLogoPath) {
        this.sourceLogoPath = sourceLogoPath
        this.outputDir = path.join(__dirname, 'processed_logos')
    }

    async init() {
        await fs.mkdir(this.outputDir, { recursive: true })
    }

    async createBadgeVariation(type) {
        const image = sharp(this.sourceLogoPath)
        
        // Apply badge-specific effects
        switch(type) {
            case 'road_master':
                await image
                    .modulate({
                        brightness: 1.1,
                        saturation: 1.2
                    })
                    .tint({ r: 100, g: 150, b: 255 })
                break

            case 'secure_guardian':
                await image
                    .modulate({
                        brightness: 1.2,
                        saturation: 1.1
                    })
                    .tint({ r: 200, g: 100, b: 100 })
                break

            case 'eco_warrior':
                await image
                    .tint({ r: 100, g: 150, b: 100 })
                    .modulate({
                        brightness: 1.1,
                        saturation: 1.3
                    })
                break

            case 'founding_member':
                await image
                    .tint({ r: 255, g: 215, b: 0 })
                    .modulate({
                        brightness: 1.3,
                        saturation: 1.4
                    })
                break

            // New badge types
            case 'time_keeper':
                await image
                    .tint({ r: 150, g: 100, b: 255 })
                    .modulate({
                        brightness: 1.2,
                        saturation: 1.3,
                        hue: 180
                    })
                break

            case 'community_pillar':
                await image
                    .tint({ r: 255, g: 140, b: 0 })
                    .modulate({
                        brightness: 1.25,
                        saturation: 1.35
                    })
                break

            case 'innovation_pioneer':
                await image
                    .tint({ r: 0, g: 191, b: 255 })
                    .modulate({
                        brightness: 1.3,
                        saturation: 1.4,
                        hue: 200
                    })
                break

            case 'reliability_star':
                await image
                    .tint({ r: 147, g: 112, b: 219 })
                    .modulate({
                        brightness: 1.2,
                        saturation: 1.25
                    })
                break
        }

        // Apply common enhancements
        await image
            .sharpen()
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })

        // Save processed image
        const outputPath = path.join(this.outputDir, `badge_${type}.png`)
        await image.toFile(outputPath)
        return outputPath
    }

    async createAnimatedBadge(type) {
        const frames = []
        const frameCount = 30

        // Create base image with effects
        const baseImage = await this.createBadgeVariation(type)
        
        // Generate animation frames
        for (let i = 0; i < frameCount; i++) {
            const frame = sharp(this.sourceLogoPath)
            const progress = i / frameCount
            
            // Apply animation effects based on badge type
            switch(type) {
                case 'founding_member':
                    // Rotating golden glow
                    frame.modulate({
                        brightness: 1.2 + Math.sin(progress * Math.PI * 2) * 0.2
                    })
                    break

                case 'road_master':
                    // Pulsing blue aura
                    frame.modulate({
                        brightness: 1.1 + Math.sin(progress * Math.PI * 2) * 0.1,
                        saturation: 1.2 + Math.cos(progress * Math.PI * 2) * 0.1
                    })
                    break

                case 'secure_guardian':
                    // Shield pulse effect
                    frame.modulate({
                        brightness: 1.2 + Math.cos(progress * Math.PI * 2) * 0.15
                    })
                    break

                case 'eco_warrior':
                    // Nature energy flow
                    frame.modulate({
                        brightness: 1.1 + Math.sin(progress * Math.PI * 2) * 0.1,
                        hue: Math.floor(progress * 30)
                    })
                    break

                // Animations for new badges
                case 'time_keeper':
                    // Time ripple effect
                    frame.modulate({
                        brightness: 1.2 + Math.sin(progress * Math.PI * 4) * 0.1,
                        hue: Math.floor(progress * 60)
                    })
                    break

                case 'community_pillar':
                    // Community energy pulse
                    frame.modulate({
                        brightness: 1.25 + Math.sin(progress * Math.PI * 2) * 0.15,
                        saturation: 1.35 + Math.cos(progress * Math.PI * 2) * 0.1
                    })
                    break

                case 'innovation_pioneer':
                    // Innovation wave effect
                    frame.modulate({
                        brightness: 1.3 + Math.sin(progress * Math.PI * 3) * 0.1,
                        hue: Math.floor(progress * 90)
                    })
                    break

                case 'reliability_star':
                    // Reliability shimmer
                    frame.modulate({
                        brightness: 1.2 + Math.sin(progress * Math.PI * 2) * 0.2,
                        saturation: 1.25 + Math.cos(progress * Math.PI * 2) * 0.15
                    })
                    break
            }

            const buffer = await frame
                .resize(512, 512, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .toBuffer()
            frames.push(buffer)
        }

        // Create animated WebP
        const outputPath = path.join(this.outputDir, `badge_${type}_animated.webp`)
        await sharp({
            create: {
                width: 512,
                height: 512,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        })
        .composite(frames.map((frame, i) => ({
            input: frame,
            top: 0,
            left: 0,
            blend: 'over'
        })))
        .webp({
            quality: 80,
            loop: 0,
            delay: 50 // 50ms delay between frames
        })
        .toFile(outputPath)

        return outputPath
    }

    async createNFTMetadata(type, imagePath, animatedPath) {
        return {
            name: `TROT ${this.formatBadgeName(type)} Badge`,
            description: this.getBadgeDescription(type),
            image: path.basename(imagePath),
            animation_url: path.basename(animatedPath),
            attributes: {
                badge_type: type,
                rarity: this.getBadgeRarity(type),
                created_at: new Date().toISOString()
            }
        }
    }

    formatBadgeName(type) {
        return type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    getBadgeDescription(type) {
        const descriptions = {
            road_master: "Master of efficient routes and timely deliveries. This badge recognizes excellence in route optimization and delivery performance.",
            secure_guardian: "Specialist in secure and confidential transport. Awarded for maintaining the highest standards of security and trust.",
            eco_warrior: "Champion of environmentally conscious delivery. Recognition for promoting and implementing sustainable delivery practices.",
            founding_member: "Original supporter and pioneer of the TROT platform. A mark of distinction for early platform adopters.",
            time_keeper: "Guardian of punctuality and efficiency. Awarded for exceptional on-time delivery performance.",
            community_pillar: "Cornerstone of the TROT community. Recognition for outstanding contribution to platform growth.",
            innovation_pioneer: "Trailblazer in delivery innovation. Celebrates creative solutions and forward-thinking approaches.",
            reliability_star: "Paragon of consistency and dependability. Honors unwavering commitment to service excellence."
        }
        return descriptions[type] || "TROT Achievement Badge"
    }

    getBadgeRarity(type) {
        const rarities = {
            founding_member: "Legendary",
            innovation_pioneer: "Mythic",
            road_master: "Epic",
            secure_guardian: "Rare",
            time_keeper: "Rare",
            community_pillar: "Epic",
            eco_warrior: "Uncommon",
            reliability_star: "Rare"
        }
        return rarities[type] || "Common"
    }
}

// Example usage
async function processLogo() {
    const processor = new LogoProcessor('C:/Users/Luis/Documents/trot/trot docs/512x512trotlogo.png')
    await processor.init()

    // Create badge variations
    const badges = [
        'road_master',
        'secure_guardian',
        'eco_warrior',
        'founding_member',
        'time_keeper',
        'community_pillar',
        'innovation_pioneer',
        'reliability_star'
    ]

    for (const badge of badges) {
        const imagePath = await processor.createBadgeVariation(badge)
        const animatedPath = await processor.createAnimatedBadge(badge)
        const metadata = await processor.createNFTMetadata(badge, imagePath, animatedPath)
        
        // Save metadata
        await fs.writeFile(
            path.join(processor.outputDir, `badge_${badge}_metadata.json`),
            JSON.stringify(metadata, null, 2)
        )
    }
}

module.exports = LogoProcessor
