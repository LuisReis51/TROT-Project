// TROT Badge and Avatar System
const xrpl = require('xrpl')

class BadgeSystem {
    constructor(issuerAddress, issuerSeed) {
        this.issuerAddress = issuerAddress
        this.issuerSeed = issuerSeed
        this.badges = new Map()
        this.avatarStates = new Map()
    }

    // Badge NFT structure
    createBadgeNFT(badgeType, achievementData) {
        return {
            type: badgeType,
            achievement: achievementData,
            timestamp: Date.now(),
            metadata: {
                visual: `badge_assets/${badgeType}.svg`,
                animation: `badge_assets/${badgeType}_animation.gif`,
                description: achievementData.description,
                attributes: achievementData.criteria
            }
        }
    }

    // Avatar state management
    updateAvatarState(userAddress, newState) {
        return {
            baseAvatar: `avatar_assets/${newState.level}.svg`,
            equipment: newState.equipment,
            effects: newState.achievements.map(a => `effects/${a}_overlay.png`),
            status: {
                availability: newState.status,
                specialization: newState.focus,
                recentAchievements: newState.recent
            }
        }
    }

    // Achievement verification system
    async verifyAchievement(userAddress, achievementType, data) {
        const criteria = {
            'road_master': () => data.deliveries >= 1000,
            'time_keeper': () => this.calculateOnTimeRate(data.deliveryTimes) >= 0.98,
            'secure_guardian': () => data.secureDeliveries >= 50,
            'eco_warrior': () => data.greenRoutes >= 100,
            // Add more achievement verifications
        }

        return criteria[achievementType] ? criteria[achievementType]() : false
    }

    // Badge issuance on XRPL
    async issueBadge(recipientAddress, badgeType, achievementData) {
        // Connect to XRPL
        const client = new xrpl.Client('wss://xrplcluster.com')
        await client.connect()

        try {
            const wallet = xrpl.Wallet.fromSeed(this.issuerSeed)
            
            // Create NFT for the badge
            const tokenCreateTx = {
                "TransactionType": "NFTokenMint",
                "Account": this.issuerAddress,
                "NFTokenTaxon": 0,
                "URI": xrpl.convertStringToHex(JSON.stringify(this.createBadgeNFT(badgeType, achievementData))),
                "Flags": 8, // transferable
                "Fee": "12"
            }

            // Submit transaction
            const result = await client.submitAndWait(tokenCreateTx, { wallet })
            
            if (result.result.meta.TransactionResult === "tesSUCCESS") {
                // Transfer NFT to recipient
                const nftId = this.extractNFTokenID(result)
                await this.transferNFT(client, wallet, recipientAddress, nftId)
                console.log(`Badge ${badgeType} issued to ${recipientAddress}`)
            }

        } catch (err) {
            console.error("Error issuing badge:", err)
        }

        client.disconnect()
    }

    // Helper function to extract NFT ID
    extractNFTokenID(result) {
        // Implementation to extract NFT ID from transaction result
        return result.result.meta.nftoken_id
    }

    // Transfer NFT to recipient
    async transferNFT(client, wallet, recipientAddress, nftId) {
        const transferTx = {
            "TransactionType": "NFTokenCreateOffer",
            "Account": this.issuerAddress,
            "NFTokenID": nftId,
            "Amount": "0",
            "Destination": recipientAddress,
            "Fee": "12"
        }

        return await client.submitAndWait(transferTx, { wallet })
    }

    // Calculate on-time delivery rate
    calculateOnTimeRate(deliveryTimes) {
        if (!deliveryTimes || deliveryTimes.length === 0) return 0
        const onTime = deliveryTimes.filter(d => d.actual <= d.expected).length
        return onTime / deliveryTimes.length
    }
}

// Example usage
async function demonstrateBadgeSystem() {
    const badgeSystem = new BadgeSystem(
        "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u",  // Issuer address
        "sEdTAmwrsXmHksQqseh1U1NwbbQZKD8"      // Issuer seed
    )

    // Example achievement data
    const achievementData = {
        deliveries: 1050,
        deliveryTimes: [
            { expected: 1000, actual: 950 },
            { expected: 1200, actual: 1150 }
        ],
        secureDeliveries: 55,
        greenRoutes: 120
    }

    // Verify and issue badge
    const userAddress = "rfvd9orZgjbuNueGeiFHWb7DbKM3SMw7Dt"
    if (await badgeSystem.verifyAchievement(userAddress, 'road_master', achievementData)) {
        await badgeSystem.issueBadge(userAddress, 'road_master', {
            description: "Completed 1000+ successful deliveries",
            criteria: {
                required: 1000,
                achieved: achievementData.deliveries,
                date: new Date().toISOString()
            }
        })
    }
}

// Run demonstration
demonstrateBadgeSystem()
