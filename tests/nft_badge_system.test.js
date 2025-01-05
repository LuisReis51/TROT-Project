// NFT Badge System Tests
const NFTBadgeSystem = require('../nft_badge_system')

describe('NFT Badge System', () => {
    let nftSystem
    const testIssuerAddress = "rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u"
    const testIssuerSeed = "sEdTAmwrsXmHksQqseh1U1NwbbQZKD8"
    const testRecipientAddress = "rfvd9orZgjbuNueGeiFHWb7DbKM3SMw7Dt"

    beforeEach(async () => {
        nftSystem = new NFTBadgeSystem(testIssuerAddress, testIssuerSeed)
        await nftSystem.connect()
    })

    afterEach(async () => {
        await nftSystem.disconnect()
    })

    test('should create badge metadata', () => {
        const achievement = {
            category: 'service',
            achievement: 'road_master',
            timestamp: new Date().toISOString(),
            proof: { /* mock proof data */ }
        }

        const metadata = nftSystem.createBadgeMetadata(achievement)
        expect(metadata.name).toBe('TROT road_master Badge')
        expect(metadata.attributes.category).toBe('service')
        expect(metadata.attributes.achievement).toBe('road_master')
    })

    test('should mint badge NFT', async () => {
        const achievement = {
            category: 'service',
            achievement: 'road_master',
            timestamp: new Date().toISOString(),
            proof: { /* mock proof data */ }
        }

        const result = await nftSystem.mintBadge(testRecipientAddress, achievement)
        expect(result.success).toBe(true)
        expect(result.nftId).toBeDefined()
    })

    test('should verify badge ownership', async () => {
        const achievement = {
            category: 'service',
            achievement: 'road_master',
            timestamp: new Date().toISOString(),
            proof: { /* mock proof data */ }
        }

        const mintResult = await nftSystem.mintBadge(testRecipientAddress, achievement)
        const ownershipVerified = await nftSystem.verifyBadgeOwnership(
            testRecipientAddress,
            mintResult.nftId
        )
        expect(ownershipVerified).toBe(true)
    })
})
