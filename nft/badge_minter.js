// TROT Badge NFT Minter
const xrpl = require('xrpl')
const fs = require('fs').promises
const path = require('path')
const LogoProcessor = require('./logo_processor')

class BadgeMinter {
    constructor(issuerWallet) {
        this.issuerWallet = issuerWallet
        this.logoProcessor = new LogoProcessor('C:/Users/Luis/Documents/trot/trot docs/512x512trotlogo.png')
    }

    async connect() {
        this.client = new xrpl.Client("wss://xrplcluster.com")
        await this.client.connect()
    }

    async disconnect() {
        if (this.client) {
            await this.client.disconnect()
        }
    }

    async mintBadge(recipientAddress, badgeType) {
        try {
            // Process logo and create badge
            await this.logoProcessor.init()
            const imagePath = await this.logoProcessor.createBadgeVariation(badgeType)
            const animatedPath = await this.logoProcessor.createAnimatedBadge(badgeType)
            const metadata = await this.logoProcessor.createNFTMetadata(
                badgeType,
                imagePath,
                animatedPath
            )

            // Prepare NFT mint transaction
            const transactionBlob = {
                TransactionType: "NFTokenMint",
                Account: this.issuerWallet.address,
                URI: xrpl.convertStringToHex(JSON.stringify(metadata)),
                Flags: 1, // transferable
                NFTokenTaxon: this.getBadgeTaxon(badgeType),
                Memos: [{
                    Memo: {
                        MemoType: xrpl.convertStringToHex("Description"),
                        MemoData: xrpl.convertStringToHex(metadata.description)
                    }
                }]
            }

            // Submit transaction
            const tx = await this.client.submitAndWait(transactionBlob, {
                wallet: this.issuerWallet
            })

            // Get NFT ID from transaction result
            const nfts = await this.client.request({
                command: "account_nfts",
                account: this.issuerWallet.address
            })

            // Transfer to recipient
            if (recipientAddress !== this.issuerWallet.address) {
                const latestNFT = nfts.result.account_nfts[nfts.result.account_nfts.length - 1]
                await this.transferNFT(recipientAddress, latestNFT.NFTokenID)
            }

            return {
                success: true,
                nftId: latestNFT.NFTokenID,
                metadata: metadata,
                tx: tx.result.hash
            }

        } catch (err) {
            console.error("Error minting badge:", err)
            return {
                success: false,
                error: err.message
            }
        }
    }

    async transferNFT(recipientAddress, nftId) {
        const transactionBlob = {
            TransactionType: "NFTokenCreateOffer",
            Account: this.issuerWallet.address,
            NFTokenID: nftId,
            Amount: "0",
            Destination: recipientAddress,
            Flags: 1
        }

        const tx = await this.client.submitAndWait(transactionBlob, {
            wallet: this.issuerWallet
        })

        return tx.result
    }

    getBadgeTaxon(badgeType) {
        const taxons = {
            founding_member: 1,
            road_master: 2,
            secure_guardian: 3,
            eco_warrior: 4
        }
        return taxons[badgeType] || 0
    }
}

module.exports = BadgeMinter
