// Achievement System Tests
const AchievementSystem = require('../achievement_system')

describe('Achievement System', () => {
    let achievementSystem
    const testUserAddress = "rfvd9orZgjbuNueGeiFHWb7DbKM3SMw7Dt"

    beforeEach(() => {
        achievementSystem = new AchievementSystem()
    })

    test('should verify road_master achievement', async () => {
        const stats = {
            deliveries: 1500,
            totalDeliveries: 1500,
            onTimeDeliveries: 1470
        }

        const progress = await achievementSystem.updateProgress(testUserAddress, stats)
        expect(progress.road_master.completed).toBe(true)
        expect(progress.road_master.progress).toBe(150)
    })

    test('should verify time_keeper achievement', async () => {
        const stats = {
            deliveries: 150,
            totalDeliveries: 150,
            onTimeDeliveries: 148
        }

        const progress = await achievementSystem.updateProgress(testUserAddress, stats)
        expect(progress.time_keeper.completed).toBe(true)
        expect(parseFloat(progress.time_keeper.progress)).toBeCloseTo(98.7, 1)
    })

    test('should verify secure_guardian achievement', async () => {
        const stats = {
            secureDeliveries: 55,
            securityRating: 4.9
        }

        const progress = await achievementSystem.updateProgress(testUserAddress, stats)
        expect(progress.secure_guardian.completed).toBe(true)
        expect(progress.secure_guardian.progress).toBe(110)
    })

    test('should not award incomplete achievements', async () => {
        const stats = {
            deliveries: 500,
            totalDeliveries: 500,
            onTimeDeliveries: 480
        }

        const progress = await achievementSystem.updateProgress(testUserAddress, stats)
        expect(progress.road_master.completed).toBe(false)
        expect(progress.road_master.progress).toBe(50)
    })
})
