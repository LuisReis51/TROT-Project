// Avatar System Tests
const AvatarSystem = require('../avatar_system')

describe('Avatar System', () => {
    let avatarSystem
    const testUserAddress = "rfvd9orZgjbuNueGeiFHWb7DbKM3SMw7Dt"

    beforeEach(() => {
        avatarSystem = new AvatarSystem()
    })

    test('should create base avatar', () => {
        const avatar = avatarSystem.createBaseAvatar(testUserAddress)
        expect(avatar.base.model).toBe('driver')
        expect(avatar.base.variant).toBe('casual')
        expect(avatar.status.current).toBe('inactive')
    })

    test('should update avatar with achievement', async () => {
        const achievement = {
            achievement: 'road_master',
            timestamp: new Date().toISOString(),
            category: 'service'
        }

        const updatedAvatar = await avatarSystem.updateAvatarWithAchievement(
            testUserAddress,
            achievement
        )

        expect(updatedAvatar.achievements).toHaveLength(1)
        expect(updatedAvatar.achievements[0].type).toBe('road_master')
        expect(updatedAvatar.visual_effects).toHaveLength(1)
    })

    test('should update avatar status', () => {
        avatarSystem.createBaseAvatar(testUserAddress)
        const updatedAvatar = avatarSystem.updateStatus(testUserAddress, 'active')
        
        expect(updatedAvatar.status.current).toBe('active')
        expect(updatedAvatar.status.effects).toContain('ready_pulse')
    })

    test('should stack visual effects correctly', async () => {
        const achievements = [
            {
                achievement: 'founding_member',
                timestamp: new Date().toISOString(),
                category: 'special'
            },
            {
                achievement: 'road_master',
                timestamp: new Date().toISOString(),
                category: 'service'
            }
        ]

        for (const achievement of achievements) {
            await avatarSystem.updateAvatarWithAchievement(testUserAddress, achievement)
        }

        const avatar = avatarSystem.getAvatarDisplay(testUserAddress)
        expect(avatar.active_effects.aura).toBe('founder_glow')
    })

    test('should handle specializations', async () => {
        const achievement = {
            achievement: 'secure_guardian',
            timestamp: new Date().toISOString(),
            category: 'service'
        }

        const updatedAvatar = await avatarSystem.updateAvatarWithAchievement(
            testUserAddress,
            achievement
        )

        expect(updatedAvatar.specializations).toContain('secure_transport')
    })
})
