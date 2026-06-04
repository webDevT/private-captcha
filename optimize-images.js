const fs = require('fs');
const path = require('path');

console.log('🖼️  Image Optimization Guide');
console.log('============================\n');

// Configuration
const inputDir = 'app/img';
const imageExtensions = ['.png', '.jpg', '.jpeg'];
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

console.log('🔝 Top 10 Largest Images (optimize these first):');
images.slice(0, 10).forEach((img, index) => {
    const savings = Math.round(img.size * 0.4); // 40% average savings
    console.log(`   ${index + 1}. ${img.name} - ${img.size}KB (save ~${savings}KB)`);
});

console.log('\n💡 Manual Conversion Steps:');
console.log('   1. Go to https://squoosh.app');
console.log('   2. Upload each image from the list above');
console.log('   3. Select "WebP" format');
console.log('   4. Set quality to 80-85%');
console.log('   5. Download and save as .webp in app/img/');
console.log('   6. Update HTML with <picture> elements');

console.log('\n📝 HTML Update Template:');
console.log('Replace this:');
console.log('<img src="img/photo1.png" alt="Photo 1">');
console.log('');
console.log('With this:');
console.log('<picture>');
console.log('  <source srcset="img/photo1.webp" type="image/webp">');
console.log('  <img src="img/photo1.png" alt="Photo 1">');
console.log('</picture>');

console.log('\n🎯 Expected Results:');
const estimatedSavings = Math.round(totalSize * 0.4);
console.log(`   Total savings: ~${estimatedSavings}KB`);
console.log(`   PageSpeed improvement: +20-30 points`);
console.log(`   LCP improvement: Significant`);

console.log('\n🚀 Priority Order:');
console.log('   1. photo1.png (LCP image)');
console.log('   2. photo2.png, photo3.png, etc. (slider images)');
console.log('   3. slider-image.png');
console.log('   4. review-photo.png');
console.log('   5. Other large images');

console.log('\n✅ Ready to optimize! Start with the largest images first.');
