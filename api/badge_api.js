// TROT Badge API
const express = require('express')
const router = express.Router()
const AchievementSystem = require('../achievement_system')
const NFTBadgeSystem = require('../nft_badge_system')
const AvatarSystem = require('../avatar_system')

// Initialize systems
const achievementSystem = new AchievementSystem()
const nftBadgeSystem = new NFTBadgeSystem(
    process.env.ISSUER_ADDRESS,
    process.env.ISSUER_SEED
)
const avatarSystem = new AvatarSystem()

// Middleware for checking authentication
const checkAuth = (req, res, next) => {
    // Implement your authentication logic here
    next()
}

// Get user's achievements
router.get('/achievements/:userAddress', checkAuth, async (req, res) => {
    try {
        const progress = achievementSystem.getProgress(req.params.userAddress)
        res.json({ success: true, progress })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// Update user's stats and check for achievements
router.post('/stats/update/:userAddress', checkAuth, async (req, res) => {
    try {
        const progress = await achievementSystem.updateProgress(
            req.params.userAddress,
            req.body.stats
        )
        res.json({ success: true, progress })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// Get user's avatar
router.get('/avatar/:userAddress', checkAuth, async (req, res) => {
    try {
        const avatar = avatarSystem.getAvatarDisplay(req.params.userAddress)
        res.json({ success: true, avatar })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// Update avatar status
router.post('/avatar/status/:userAddress', checkAuth, async (req, res) => {
    try {
        const avatar = avatarSystem.updateStatus(
            req.params.userAddress,
            req.body.status
        )
        res.json({ success: true, avatar })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// Verify badge ownership
router.get('/badge/verify/:userAddress/:nftId', checkAuth, async (req, res) => {
    try {
        const isOwner = await nftBadgeSystem.verifyBadgeOwnership(
            req.params.userAddress,
            req.params.nftId
        )
        res.json({ success: true, isOwner })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// Get all badges for user
router.get('/badges/:userAddress', checkAuth, async (req, res) => {
    try {
        const client = await nftBadgeSystem.connect()
        const nfts = await client.request({
            command: "account_nfts",
            account: req.params.userAddress
        })
        await nftBadgeSystem.disconnect()
        
        res.json({ success: true, badges: nfts.result.account_nfts })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

module.exports = router
