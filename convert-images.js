const fs = require('fs');
const path = require('path');

const quality = 80; // WebP quality (0-100)

// Get file size in KB
function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return Math.round(stats.size / 1024 * 100) / 100;
    } catch (error) {
        return 0;
    }
}

// Recursively get all image files in directory
function getImageFiles(dir, baseDir = dir, files = []) {
    if (!fs.existsSync(dir)) {
        console.log(`❌ Directory not found: ${dir}`);
        return files;
    }
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);
        if (entry.isDirectory()) {
            getImageFiles(fullPath, baseDir, files);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (['.png', '.jpg', '.jpeg'].includes(ext)) {
                files.push({ fullPath, relativePath, name: entry.name, ext });
            }
        }
    }
    return files;
}

async function convertImages(inputDir = 'app/img', outputDir = inputDir) {
    console.log('🚀 Starting image conversion to WebP (using sharp)...\n');

    let sharp;
    try {
        sharp = require('sharp');
    } catch (error) {
        console.log('❌ Package "sharp" not found. Install it with:');
        console.log('   npm install --save-dev sharp');
        console.log('');
        process.exit(1);
    }

    const imageFiles = getImageFiles(inputDir);
    if (imageFiles.length === 0) {
        console.log('📁 No PNG/JPG/JPEG files found in app/img');
        return;
    }

    const convertedFiles = [];
    let totalOriginalSize = 0;
    let totalWebPSize = 0;

    for (const { fullPath, relativePath, name, ext } of imageFiles) {
        const webpFile = path.basename(name, ext) + '.webp';
        const webpPath = path.join(outputDir, path.dirname(relativePath), webpFile);

        // Ensure output directory exists
        const webpDir = path.dirname(webpPath);
        if (!fs.existsSync(webpDir)) {
            fs.mkdirSync(webpDir, { recursive: true });
        }

        if (fs.existsSync(webpPath)) {
            console.log(`⏭️  Skipping ${name} (WebP already exists)`);
            continue;
        }

        console.log(`🔄 Converting ${name}...`);

        const originalSize = getFileSize(fullPath);
        totalOriginalSize += originalSize;

        try {
            await sharp(fullPath)
                .webp({ quality })
                .toFile(webpPath);

            const webpSize = getFileSize(webpPath);
            totalWebPSize += webpSize;
            const savings = originalSize - webpSize;
            const savingsPercent = originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;

            console.log(`✅ ${name} → ${webpFile}`);
            console.log(`   Size: ${originalSize}KB → ${webpSize}KB (${savingsPercent}% saved)`);

            convertedFiles.push({
                original: name,
                webp: webpFile,
                relativeDir: path.dirname(relativePath),
                originalSize,
                webpSize,
                savings,
                savingsPercent
            });
        } catch (error) {
            console.error(`❌ Failed to convert ${name}:`, error.message);
        }
    }

    // Summary
    if (convertedFiles.length > 0) {
        const totalSaved = totalOriginalSize - totalWebPSize;
        const avgPercent = totalOriginalSize > 0 ? Math.round((totalSaved / totalOriginalSize) * 100) : 0;
        console.log('\n📊 Conversion Summary:');
        console.log(`   Files converted: ${convertedFiles.length}`);
        console.log(`   Total original size: ${totalOriginalSize.toFixed(2)}KB`);
        console.log(`   Total WebP size: ${totalWebPSize.toFixed(2)}KB`);
        console.log(`   Total savings: ${totalSaved.toFixed(2)}KB (${avgPercent}%)`);

        console.log('\n📝 HTML: use <picture> for WebP + fallback');
        convertedFiles.forEach((file) => {
            const imgPath = file.relativeDir ? `img/${file.relativeDir}/${file.webp}` : `img/${file.webp}`;
            const imgOrig = file.relativeDir ? `img/${file.relativeDir}/${file.original}` : `img/${file.original}`;
            console.log(`   <source srcset="${imgPath}" type="image/webp"> + <img src="${imgOrig}" alt="...">`);
        });
    }

    console.log('\n🎉 Conversion complete!');
}

if (require.main === module) {
    convertImages().catch((err) => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
}

module.exports = { convertImages };
