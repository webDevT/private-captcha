const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const del = require('del');
const autoprefixer = require('gulp-autoprefixer');
const fileinclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();

const clean = async () => {
    await del('docs');
};

const cleanTemp = async () => {
    await del('app/temp');
};

const compileSass = () => {
    return gulp.src('app/sass/**/*.scss', { allowEmpty: true })
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 8 versions']
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('app/css'))
        .pipe(gulp.dest('app/temp/css'))
        .pipe(browserSync.stream());
};

const processHTML = () => {
    return gulp.src('app/src/**/*.html', { base: 'app/src', allowEmpty: true })
        .pipe(fileinclude({
            prefix: '@@',
            basepath: 'app/'
        }))
        .pipe(gulp.dest('app/temp/'));
};

const processJS = () => {
    return gulp.src('app/js/**/*.js', { base: 'app', allowEmpty: true })
        .pipe(gulp.dest('app/temp/'));
};

const copyImages = () => {
    return gulp.src(['app/img/**/*', '!app/img/.gitkeep'], { base: 'app', allowEmpty: true })
        .pipe(gulp.dest('app/temp/'));
};

const copyDirectory = (srcDir, destDir) => {
    if (!fs.existsSync(srcDir)) return;

    fs.mkdirSync(destDir, { recursive: true });

    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else if (entry.isFile()) {
            fs.copyFileSync(srcPath, destPath);
        }
    }
};

const copyFonts = () => {
    copyDirectory('app/fonts', 'app/temp/fonts');
    return Promise.resolve();
};

const convertImages = () => {
    const { convertImages: runConvert } = require('./convert-images.js');
    return runConvert('app/img', 'app/img');
};

const copyImagesProd = () => {
    return gulp.src(['app/img/**/*', '!app/img/.gitkeep'], { base: 'app/img', allowEmpty: true })
        .pipe(gulp.dest('docs/img'));
};

const copyFontsProd = () => {
    copyDirectory('app/fonts', 'docs/fonts');
    return Promise.resolve();
};

const serve = (done) => {
    browserSync.init({
        server: {
            baseDir: 'app/temp'
        },
        port: 3000,
        open: true,
        notify: false,
        files: ['app/temp/**/*']
    });

    done();
};

const reload = (done) => {
    browserSync.reload();
    done();
};

const watch = () => {
    gulp.watch('app/sass/**/*.scss', compileSass);
    gulp.watch(['app/src/**/*.html', 'app/includes/**/*.html'], gulp.series(processHTML, reload));
    gulp.watch('app/js/**/*.js', gulp.series(processJS, reload));
    gulp.watch('app/img/**/*', gulp.series(copyImages, reload));
    gulp.watch('app/fonts/**/*', gulp.series(copyFonts, reload));
};

const exportBuild = () => {
    const buildHtml = gulp.src('app/src/**/*.html', { base: 'app/src', allowEmpty: true })
        .pipe(fileinclude({
            prefix: '@@',
            basepath: 'app/'
        }))
        .pipe(gulp.dest('docs'));

    const buildCss = gulp.src('app/css/**/*.css')
        .pipe(gulp.dest('docs/css'));

    const buildJs = gulp.src(['app/js/**/*.js', 'app/js/**/*.json'])
        .pipe(gulp.dest('docs/js'));

    const buildImg = copyImagesProd();
    const buildFonts = copyFontsProd();
    const buildHtaccess = gulp.src('.htaccess', { allowEmpty: true })
        .pipe(gulp.dest('docs'));

    return Promise.all([buildHtml, buildCss, buildJs, buildImg, buildFonts, buildHtaccess]);
};

const build = gulp.series(clean, convertImages, compileSass, exportBuild);

const dev = gulp.series(
    cleanTemp,
    compileSass,
    processJS,
    copyImages,
    copyFonts,
    processHTML,
    gulp.parallel(serve, watch)
);

exports.clean = clean;
exports.cleanTemp = cleanTemp;
exports.sass = compileSass;
exports.html = processHTML;
exports.js = processJS;
exports.convertImages = convertImages;
exports.copyImages = copyImages;
exports.copyFonts = copyFonts;
exports.serve = serve;
exports.watch = watch;
exports.export = exportBuild;
exports.build = build;
exports.dev = dev;
exports.default = dev;