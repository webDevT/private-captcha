const fs = require('fs');
const path = require('path');

console.log('🔄 Updating HTML for WebP images...\n');

// Check which WebP files exist
const imgDir = 'app/img';
const webpFiles = [];

try {
    const files = fs.readdirSync(imgDir);
    files.forEach(file => {
        if (file.endsWith('.webp')) {
            const originalName = file.replace('.webp', '');
            const originalExt = ['.png', '.jpg', '.jpeg'].find(ext => 
                fs.existsSync(path.join(imgDir, originalName + ext))
            );
            
            if (originalExt) {
                webpFiles.push({
                    webp: file,
                    original: originalName + originalExt
                });
            }
        }
    });
} catch (error) {
    console.log('❌ Error reading img directory:', error.message);
    process.exit(1);
}

if (webpFiles.length === 0) {
    console.log('❌ No WebP files found in app/img/');
    console.log('   Please convert some images to WebP first using Squoosh.app');
    process.exit(1);
}

console.log(`✅ Found ${webpFiles.length} WebP files:`);
webpFiles.forEach(file => {
    console.log(`   ${file.original} → ${file.webp}`);
});

console.log('\n📝 HTML Update Suggestions:');
console.log('Replace these <img> tags with <picture> elements:\n');

webpFiles.forEach(file => {
    console.log(`<!-- ${file.original} → ${file.webp} -->`);
    console.log(`<picture>`);
    console.log(`  <source srcset="img/${file.webp}" type="image/webp">`);
    console.log(`  <img src="img/${file.original}" alt="...">`);
    console.log(`</picture>`);
    console.log('');
});

console.log('🎯 Next Steps:');
console.log('   1. Copy the HTML code above');
console.log('   2. Replace the corresponding <img> tags in your HTML files');
console.log('   3. Test the website to ensure images load correctly');
console.log('   4. Run npm run build to generate optimized version');

console.log('\n💡 Pro Tip:');
console.log('   Start with the largest images first (photo1.png, photo2.png, etc.)');
console.log('   These will give you the biggest PageSpeed improvement!');
