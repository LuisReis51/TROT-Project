const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const assetsDir = path.join(__dirname, 'assets');
const tokensDir = path.join(assetsDir, 'tokens');
fs.mkdirSync(tokensDir, { recursive: true });

// Copy and rename the logo files
const sourceDir = path.join(__dirname, 'nft', 'token_logo');
const currencyCode = '54524F5400000000000000000000000000000000';
const issuer = 'rakCekSaQvVjQbcQdbUjXNixSFV2U7vB3u';

// Copy main logo
fs.copyFileSync(
    path.join(sourceDir, 'trot_token_512.png'),
    path.join(tokensDir, `${currencyCode}-${issuer}.png`)
);

console.log('Token assets setup completed successfully!');
