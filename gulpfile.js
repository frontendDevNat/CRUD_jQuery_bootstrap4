"use strict";

const gulp = require('gulp'),
    run = require("run-sequence"),
    autoprefixer = require('gulp-autoprefixer'),
    rigger = require('gulp-rigger'),
    rename = require("gulp-rename"),
    sass = require("gulp-sass"),
   // uglify = require("gulp-uglify"),
    watch = require("gulp-watch"),
    imagemin = require("gulp-imagemin"),
    webserver = require("browser-sync"),
    plumber = require("gulp-plumber"),
    cleanCSS = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    cssbeautify = require("gulp-cssbeautify");


/* Paths to source/build/watch files
=========================*/

let path = {
    build: {
        html: "build/",
        js: "build/assets/js/",
        css: "build/assets/css/",
        img: "build/assets/img/",
        fonts: "build/assets/fonts/"
    },
    src: {
        html: "src/*.{htm,html}",
        js: "src/assets/js/*.js",
        css: "src/assets/sass/style.scss",
        img: "src/assets/img/**/*.*",
        fonts: "src/assets/fonts/**/*.*"
    },
    watch: {
        html: "src/**/*.{htm,html}",
        js: "src/assets/js/**/*.js",
        css: "src/assets/sass/**/*.scss",
        img: "src/assets/img/**/*.*",
        fonts: "src/assets/fonts/**/*.*"
    },
    clean: "./build"
};



/* Webserver config
=========================*/

let config = {
    server: "build/",
    notify: false,
    open: true,
    ui: false
};

/*gulp.task('default', function () {
    gulp.src('src/app.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(rigger())
        .pipe(gulp.dest('build/'))
})*/


/* Tasks
=========================*/

gulp.task("webserver", function () {
    webserver(config);
});


gulp.task("html:build", function () {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(webserver.reload({stream: true}));
});


gulp.task("css:build", function () {
    gulp.src(path.src.css)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ["last 3 versions"],
            cascade: true
        }))
        .pipe(cleanCSS())
        .pipe(cssbeautify())
        .pipe(gulp.dest(path.build.css))
        .pipe(rename("style.min.css"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({stream: true}));
});


gulp.task("js:build", function () {
    gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        //.pipe(uglify())
        .pipe(rename("main.min.js"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(webserver.reload({stream: true}));
});


gulp.task("fonts:build", function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});


gulp.task("image:build", function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img));
});


gulp.task('build', function (cb) {
    run(
        "html:build",
        "css:build",
        "js:build",
        "fonts:build",
        "image:build"
        , cb);
});


gulp.task("watch", function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start("html:build");
    });
    watch([path.watch.css], function(event, cb) {
        gulp.start("css:build");
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start("js:build");
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start("image:build");
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start("fonts:build");
    });
});


gulp.task("default", function (cb) {
    run(
        "build",
        "webserver",
        "watch"
        , cb);
});
