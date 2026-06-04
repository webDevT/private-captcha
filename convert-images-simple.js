const fs = require('fs');
const path = require('path');

// Configuration
const inputDir = 'app/img';
const imageExtensions = ['.png', '.jpg', '.jpeg'];

console.log('🖼️  Image Optimization Report\n');

let totalSize = 0;
let imageCount = 0;
const images = [];

// Read all files in the input directory
const files = fs.readdirSync(inputDir);

for (const file of files) {
    const filePath = path.join(inputDir, file);
    const ext = path.extname(file).toLowerCase();

    // Check if it's an image file
    if (imageExtensions.includes(ext)) {
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024 * 100) / 100;
        
        totalSize += sizeKB;
        imageCount++;
        
        images.push({
            name: file,
            size: sizeKB,
            extension: ext
        });
    }
}

// Sort by size (largest first)
images.sort((a, b) => b.size - a.size);

console.log('📊 Current Image Analysis:');
console.log(`   Total images: ${imageCount}`);
console.log(`   Total size: ${totalSize.toFixed(2)}KB\n`);

console.log('🔝 Largest Images (optimization priority):');
images.slice(0, 10).forEach((img, index) => {
    console.log(`   ${index + 1}. ${img.name} - ${img.size}KB`);
});

console.log('\n💡 Optimization Recommendations:');
console.log('   1. Convert PNG/JPG to WebP format (30-50% smaller)');
console.log('   2. Use responsive images for different screen sizes');
console.log('   3. Compress images with tools like:');
console.log('      - Squoosh.app (online)');
console.log('      - TinyPNG.com (online)');
console.log('      - ImageOptim (desktop)');

console.log('\n📝 HTML Update Template:');
console.log('Replace your <img> tags with <picture> elements:');
console.log('');
console.log('<!-- Before -->');
console.log('<img src="img/photo1.png" alt="Photo 1">');
console.log('');
console.log('<!-- After -->');
console.log('<picture>');
console.log('  <source srcset="img/photo1.webp" type="image/webp">');
console.log('  <img src="img/photo1.png" alt="Photo 1">');
console.log('</picture>');

console.log('\n🎯 Expected Savings:');
const estimatedSavings = Math.round(totalSize * 0.4); // 40% average savings
console.log(`   Estimated WebP savings: ~${estimatedSavings}KB (40% reduction)`);
console.log(`   PageSpeed improvement: Significant LCP and FCP boost`);

console.log('\n✅ Ready to optimize! Run: npm run convert-images');
