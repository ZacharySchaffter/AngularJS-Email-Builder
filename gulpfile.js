var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');

var browserify = require('browserify');
var babelify = require('babelify');
var source = require("vinyl-source-stream")


var dev = './dev/';
var devCss = dev + 'sass/';
var devJs = dev + 'js/';
var devPhp = dev + 'php/';

var prod = './dist/';
var prodCss = prod + 'css/';
var prodJs = prod + 'js/';
var prodPhp = prod + 'php/';

function exceptionLog (error) {
  console.log(error.toString());
}

// HTML
gulp.task('html', function() {
    return gulp.src(dev + '**/*.html')
    .pipe(gulp.dest(prod));
});


// CSS via Sass and Autoprefixer
gulp.task('css', function() {
    return gulp.src(devCss + '**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
        outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(sourcemaps.write('sass/maps'))
    .pipe(gulp.dest(prodCss))
    .on('error', exceptionLog);
});

//JS
gulp.task('js', function() {
    return gulp.src(devJs + '**/*.js')
        .pipe(gulp.dest(prodJs));
    /*
    //Default JS task, re-add when we've refactored it to use requires...
    return browserify({
        entries : devJs+'app.js'
    }) //only look at app entry
        .transform(babelify)
        .bundle()
        .pipe(source("script.js"))
        .pipe(gulp.dest(prodJs))
        .on('error', exceptionLog);
    */
});

//PHP
gulp.task('php', function() {
    return gulp.src(devPhp + '**/*.php')
        .pipe(gulp.dest(prodPhp));
});

//Images 
gulp.task('images', () =>
    gulp.src(dev + "img/**/*")
        .pipe(imagemin())
        .pipe(gulp.dest(prod+'img/'))
);

gulp.task('watch', function() {
    browserSync.init({
        proxy: "http://localhost:5000/",
        port: 1919
    });
    gulp.watch([devCss + '**/*.css', devCss + '**/*.scss' ], ['css']);
    gulp.watch([dev + '**/*.js'], ['js']);
    gulp.watch([dev + '**/*.html'], ['html']);
    gulp.watch([dev + 'img/*'], ['images']);
    gulp.watch([dev + '**/*.php'], ['php']);
    gulp.watch(dev + '**/*').on('change', browserSync.reload);
});

gulp.task('default', ['watch', 'css', 'js', 'images', 'html', 'php']);
