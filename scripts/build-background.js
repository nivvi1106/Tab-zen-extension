// This script now builds BOTH background.js and offscreen.js
import fs from 'fs';
import path from 'path';

const polyfillPath = path.resolve('node_modules/webextension-polyfill/dist/browser-polyfill.js');
const outputDir = path.resolve('dist');

// --- Create the output directory if it doesn't exist ---
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// --- Build background.js ---
try {
    const backgroundInPath = path.resolve('src/background.js');
    const backgroundOutPath = path.resolve(outputDir, 'background.js');
    
    const polyfillContent = fs.readFileSync(polyfillPath, 'utf-8');
    const backgroundContent = fs.readFileSync(backgroundInPath, 'utf-8');
    
    const finalBackgroundScript = polyfillContent + '\n' + backgroundContent;
    fs.writeFileSync(backgroundOutPath, finalBackgroundScript);
    console.log('✅ Successfully built background.js');

} catch (error) {
    console.error('❌ Error building background.js:', error);
    process.exit(1);
}

// --- Build offscreen.js ---
try {
    const offscreenInPath = path.resolve('public/offscreen.js');
    const offscreenOutPath = path.resolve(outputDir, 'offscreen.js');

    const polyfillContent = fs.readFileSync(polyfillPath, 'utf-8');
    const offscreenContent = fs.readFileSync(offscreenInPath, 'utf-8');

    const finalOffscreenScript = polyfillContent + '\n' + offscreenContent;
    fs.writeFileSync(offscreenOutPath, finalOffscreenScript);
    console.log('✅ Successfully built offscreen.js');

} catch (error) {
    console.error('❌ Error building offscreen.js:', error);
    process.exit(1);
}