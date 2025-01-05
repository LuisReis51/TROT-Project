// TROT Avatar Evolution System
class AvatarSystem {
    constructor() {
        this.userAvatars = new Map()
    }

    // Initialize new avatar
    createBaseAvatar(userAddress) {
        return {
            base: {
                model: "driver",
                variant: "casual",
                customization: {
                    uniform: "standard",
                    vehicle: "delivery-van",
                    accessories: ["phone", "scanner"]
                }
            },
            status: {
                current: "inactive",
                effects: []
            },
            achievements: [],
            specializations: [],
            stats: {
                deliveries: 0,
                rating: 0,
                experience: 0
            },
            visual_effects: []
        }
    }

    // Update avatar based on achievements
    async updateAvatarWithAchievement(userAddress, achievement) {
        let avatar = this.userAvatars.get(userAddress) || this.createBaseAvatar(userAddress)
        
        // Add achievement effects
        const effects = this.getAchievementEffects(achievement)
        avatar.achievements.push({
            type: achievement.achievement,
            timestamp: achievement.timestamp,
            effects
        })

        // Update specializations
        this.updateSpecializations(avatar, achievement)

        // Update visual effects
        this.updateVisualEffects(avatar, achievement)

        // Save updated avatar
        this.userAvatars.set(userAddress, avatar)
        return avatar
    }

    // Get achievement-specific effects
    getAchievementEffects(achievement) {
        const effects = {
            road_master: {
                aura: "experience_glow",
                vehicle_upgrade: "premium_vehicle",
                animation: "smooth_drive"
            },
            time_keeper: {
                aura: "time_ripple",
                accessory: "precision_watch",
                animation: "swift_movement"
            },
            secure_guardian: {
                aura: "security_shield",
                vehicle_upgrade: "armored_transport",
                animation: "secure_pulse"
            },
            local_hero: {
                aura: "community_stars",
                accessory: "community_badge",
                animation: "hero_shine"
            },
            eco_warrior: {
                aura: "nature_energy",
                vehicle_upgrade: "eco_vehicle",
                animation: "leaf_trail"
            },
            founding_member: {
                aura: "founder_glow",
                accessory: "founder_mark",
                animation: "golden_sparkle"
            },
            emergency_responder: {
                aura: "emergency_pulse",
                vehicle_upgrade: "rapid_response",
                animation: "urgent_flash"
            }
        }
        
        return effects[achievement.achievement] || {}
    }

    // Update avatar specializations
    updateSpecializations(avatar, achievement) {
        const specializationMap = {
            secure_guardian: "secure_transport",
            eco_warrior: "green_delivery",
            emergency_responder: "emergency_service"
        }

        if (specializationMap[achievement.achievement]) {
            if (!avatar.specializations.includes(specializationMap[achievement.achievement])) {
                avatar.specializations.push(specializationMap[achievement.achievement])
            }
        }
    }

    // Update visual effects
    updateVisualEffects(avatar, achievement) {
        const newEffect = {
            type: achievement.achievement,
            effect: this.getAchievementEffects(achievement),
            priority: this.getEffectPriority(achievement)
        }

        // Manage visual effects stack
        avatar.visual_effects = avatar.visual_effects
            .filter(effect => effect.priority >= newEffect.priority)
            .concat(newEffect)
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 3) // Keep only top 3 effects
    }

    // Get effect priority
    getEffectPriority(achievement) {
        const priorities = {
            founding_member: 100,
            emergency_responder: 90,
            secure_guardian: 80,
            road_master: 70,
            local_hero: 60,
            eco_warrior: 50,
            time_keeper: 40
        }
        return priorities[achievement.achievement] || 0
    }

    // Update avatar status
    updateStatus(userAddress, status) {
        let avatar = this.userAvatars.get(userAddress)
        if (avatar) {
            avatar.status.current = status
            avatar.status.effects = this.getStatusEffects(status)
            this.userAvatars.set(userAddress, avatar)
        }
        return avatar
    }

    // Get status-specific effects
    getStatusEffects(status) {
        const effects = {
            active: ["ready_pulse", "available_indicator"],
            en_route: ["motion_trail", "delivery_indicator"],
            priority: ["priority_glow", "urgent_indicator"],
            emergency: ["emergency_pulse", "critical_indicator"]
        }
        return effects[status] || []
    }

    // Get avatar display data
    getAvatarDisplay(userAddress) {
        const avatar = this.userAvatars.get(userAddress)
        if (!avatar) return null

        return {
            base_model: this.getBaseModel(avatar),
            active_effects: this.compileEffects(avatar),
            status_indicator: this.getStatusIndicator(avatar),
            specialization_markers: this.getSpecializationMarkers(avatar)
        }
    }

    // Compile all active effects
    compileEffects(avatar) {
        return {
            aura: this.getHighestPriorityEffect(avatar, 'aura'),
            vehicle: this.getHighestPriorityEffect(avatar, 'vehicle_upgrade'),
            accessories: this.getActiveAccessories(avatar),
            animations: this.getActiveAnimations(avatar)
        }
    }

    // Get highest priority effect of a type
    getHighestPriorityEffect(avatar, effectType) {
        return avatar.visual_effects
            .filter(effect => effect.effect[effectType])
            .sort((a, b) => b.priority - a.priority)[0]?.effect[effectType]
    }

    // Get active accessories
    getActiveAccessories(avatar) {
        return avatar.achievements
            .map(achievement => this.getAchievementEffects(achievement).accessory)
            .filter(Boolean)
    }

    // Get active animations
    getActiveAnimations(avatar) {
        return avatar.achievements
            .map(achievement => this.getAchievementEffects(achievement).animation)
            .filter(Boolean)
    }
}

module.exports = AvatarSystem
