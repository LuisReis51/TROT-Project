// TROT NFT Badge Minting System
const xrpl = require('xrpl')

class NFTBadgeSystem {
    constructor(issuerAddress, issuerSeed) {
        this.issuerAddress = issuerAddress
        this.issuerSeed = issuerSeed
        this.client = null
    }

    // Connect to XRPL
    async connect() {
        this.client = new xrpl.Client('wss://xrplcluster.com')
        await this.client.connect()
        return this.client
    }

    // Disconnect from XRPL
    async disconnect() {
        if (this.client) {
            await this.client.disconnect()
        }
    }

    // Create badge metadata
    createBadgeMetadata(achievement) {
        return {
            name: `TROT ${achievement.achievement} Badge`,
            description: this.getBadgeDescription(achievement),
            image: this.getBadgeImageURI(achievement),
            attributes: {
                category: achievement.category,
                achievement: achievement.achievement,
                timestamp: achievement.timestamp,
                proof: achievement.proof
            },
            animation_url: this.getAnimationURI(achievement)
        }
    }

    // Get badge description
    getBadgeDescription(achievement) {
        const descriptions = {
            road_master: "Completed 1000+ successful deliveries",
            time_keeper: "Maintained 98% on-time delivery rate",
            secure_guardian: "Specialist in secure transport",
            local_hero: "Served community in critical times",
            eco_warrior: "Champion of green delivery",
            founding_member: "Original TROT platform supporter",
            emergency_responder: "Certified emergency delivery specialist"
        }
        return descriptions[achievement.achievement] || "TROT Achievement Badge"
    }

    // Get badge image URI
    getBadgeImageURI(achievement) {
        return `ipfs://badge_assets/${achievement.category}/${achievement.achievement}.svg`
    }

    // Get animation URI
    getAnimationURI(achievement) {
        return `ipfs://badge_animations/${achievement.category}/${achievement.achievement}.gif`
    }

    // Mint NFT badge
    async mintBadge(recipientAddress, achievement) {
        try {
            const wallet = xrpl.Wallet.fromSeed(this.issuerSeed)
            const metadata = this.createBadgeMetadata(achievement)
            
            // Prepare NFT mint transaction
            const mintTx = {
                "TransactionType": "NFTokenMint",
                "Account": this.issuerAddress,
                "NFTokenTaxon": this.getBadgeTaxon(achievement),
                "URI": xrpl.convertStringToHex(JSON.stringify(metadata)),
                "Flags": 8, // transferable
                "Fee": "12",
                "TransferFee": 0, // No transfer fee
                "Memos": [{
                    "MemoData": xrpl.convertStringToHex(JSON.stringify({
                        type: "TROT_BADGE",
                        version: "1.0",
                        achievement: achievement.achievement
                    }))
                }]
            }

            // Submit mint transaction
            const mintResult = await this.client.submitAndWait(mintTx, { wallet })
            
            if (mintResult.result.meta.TransactionResult === "tesSUCCESS") {
                const nftId = this.extractNFTokenID(mintResult)
                
                // Transfer NFT to recipient
                await this.transferBadge(nftId, recipientAddress)
                
                return {
                    success: true,
                    nftId,
                    transaction: mintResult.result.hash
                }
            }

            return {
                success: false,
                error: "Minting failed",
                result: mintResult
            }

        } catch (err) {
            console.error("Error minting badge:", err)
            return {
                success: false,
                error: err.message
            }
        }
    }

    // Get badge taxon (category identifier)
    getBadgeTaxon(achievement) {
        const taxons = {
            service: 1000,
            community: 2000,
            special: 3000
        }
        return taxons[achievement.category] || 0
    }

    // Extract NFT ID from transaction result
    extractNFTokenID(result) {
        const nftNode = result.result.meta.AffectedNodes.find(node => 
            node.CreatedNode && node.CreatedNode.LedgerEntryType === "NFTokenPage"
        )
        return nftNode?.CreatedNode?.LedgerEntryType?.NFTokens[0]?.NFToken?.NFTokenID
    }

    // Transfer badge to recipient
    async transferBadge(nftId, recipientAddress) {
        const wallet = xrpl.Wallet.fromSeed(this.issuerSeed)
        
        const transferTx = {
            "TransactionType": "NFTokenCreateOffer",
            "Account": this.issuerAddress,
            "NFTokenID": nftId,
            "Amount": "0",
            "Destination": recipientAddress,
            "Fee": "12"
        }

        const transferResult = await this.client.submitAndWait(transferTx, { wallet })
        
        if (transferResult.result.meta.TransactionResult === "tesSUCCESS") {
            return {
                success: true,
                transaction: transferResult.result.hash
            }
        }

        throw new Error("Badge transfer failed")
    }

    // Verify badge ownership
    async verifyBadgeOwnership(userAddress, nftId) {
        const nftInfo = await this.client.request({
            command: "account_nfts",
            account: userAddress
        })
        
        return nftInfo.result.account_nfts.some(nft => nft.NFTokenID === nftId)
    }
}

module.exports = NFTBadgeSystem
