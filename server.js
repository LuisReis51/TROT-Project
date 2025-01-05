// TROT API Server
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const badgeApi = require('./api/badge_api')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api/v1', badgeApi)

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message
    })
})

// Start server
app.listen(PORT, () => {
    console.log(`TROT API Server running on port ${PORT}`)
})
