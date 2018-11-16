/**
 * Сборка проекта
 */
const args = require('yargs').argv;
const gulp = require("gulp");
const minifyCSS = require('gulp-csso');
const sass = require('gulp-sass');
const webpack = require('webpack-stream');
const compiler = require('webpack');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const notifier = require('node-notifier');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const webpackConfig = require('./webpack.config.js');

const TARGET_DIR = "dist";
webpackConfig.mode = args.env || "development";
// webpackConfig.watch = webpackConfig.mode === "development";

gulp.task('scripts', () => {
    return gulp.src('./src/index.ts')
        .pipe(webpack(webpackConfig), compiler, (err, stats) => {
            if (error) { // кажется еще не сталкивался с этой ошибкой
                onError(error);
            } else if (stats.hasErrors()) { // ошибки в самой сборке, к примеру "не удалось найти модуль по заданному пути"
                onError(stats.toString(statsLog));
            } else {
                onSuccess(stats.toString(statsLog));
            }
        })
        .on('error', function handleError() {
            this.emit('end'); // Recover from errors
        })
        .pipe(gulp.dest(TARGET_DIR))
        .pipe(reload({stream: true}));
});

gulp.task('assets', () => {
    gulp.src('./src/assets/favicons/*.*')
        .pipe(gulp.dest(TARGET_DIR + '/favicons'));

    gulp.src('./node_modules/@fortawesome/fontawesome-free/css/all.css')
        .pipe(rename("fontawesome.css"))
        .pipe(minifyCSS())
        .pipe(gulp.dest(TARGET_DIR + '/css'));

    gulp.src('./node_modules/vuetify/dist/vuetify.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest(TARGET_DIR + '/css'));

    gulp.src('./node_modules/@fortawesome/fontawesome-free/webfonts/*.*')
        .pipe(gulp.dest(TARGET_DIR + '/webfonts'));

    gulp.src('./src/assets/img/**/*.*')
        .pipe(gulp.dest(TARGET_DIR + '/img'));

    gulp.src('./src/assets/static/**/*.*')
        .pipe(gulp.dest(TARGET_DIR + '/static'));

    return gulp.src('./index.html')
        .pipe(gulp.dest(TARGET_DIR))
        .pipe(reload({stream: true}));
});

// Компиляция SCSS
gulp.task('css', () => {
    return gulp.src('./src/assets/scss/index.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(minifyCSS())
        .pipe(gulp.dest(TARGET_DIR + '/css'))
        .pipe(reload({stream: true}));
});

// Основной таск сборки
gulp.task("build", ["scripts", "css", "assets"]);

/** Таск с watch */
gulp.task('default', ['build', "css", "assets"], () => {
    browserSync.init({
        proxy: "localhost:8080",
        port: 3000,
        open: true,
        notify: false,
        serveStatic: [TARGET_DIR]
    });
    gulp.watch(['src/**/*.ts'], ['scripts']);
    gulp.watch(['src/assets/scss/**/*.scss'], ['css']);
    gulp.watch(['*.html'], ['assets']);
});

const onError = (error) => {
    let formattedError = new gutil.PluginError('webpack', error);
    notifier.notify({ // чисто чтобы сразу узнать об ошибке
        title: `Error: ${formattedError.plugin}`,
        message: formattedError.message
    });
    done(formattedError);
};

const onSuccess = (detailInfo) => {
    gutil.log('[webpack]', detailInfo);
    done();
};