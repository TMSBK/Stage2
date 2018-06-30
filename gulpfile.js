var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var jasmine = require('gulp-jasmine-phantom');
/*var concat = require('gulp-concat'); */
let uglify = require('gulp-uglify-es').default;
var babel = require('gulp-babel');
var gutil = require('gutil'); // eslint-disable-line
 
 
gulp.task('default', ['copy-html', 'copy-images', 'styles','lint', 'scripts-dist', 'scripts-dist-sw', 'manifest-dist'], function(done) {
    gulp.watch('sass/**/*.scss', ['styles']);
    gulp.watch('js/**/*.js', ['lint']);
    gulp.watch('/*.html', ['copy-html']);
    done();
 
    browserSync.init({
        server: './dist'
    });
});

gulp.task('dist', [
    'copy-html',
    'copy-images',
    'styles',
    'lint',
    'scripts-dist'
]);

gulp.task('scripts', function() {
    gulp.src('js/**/*.js')
        .pipe(babel())
        /*.pipe(concat('min.js'))*/
        .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', function() {
    gulp.src('js/**/*.js')
        .pipe(babel())
        /*.pipe(concat('min.js'))*/
        .pipe(uglify())
        /*.on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })*/
        .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist-sw', function() {
    gulp.src('sw.js')
        .pipe(babel())
        /*.pipe(concat('min.js'))*/
        .pipe(uglify())
        /*.on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })*/
        .pipe(gulp.dest('dist'));
});

gulp.task('manifest-dist', function() {
    gulp.src('manifest.json')
        /*.pipe(babel())*/
        /*.pipe(concat('min.js'))*/
        /*.pipe(uglify())*/
        /*.on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })*/
        .pipe(gulp.dest('dist'));
});
 
gulp.task('lint', function() {
    return gulp.src(['js/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('tests', function () {
    gulp.src('tests/spec/extraSpec.js')
        .pipe(jasmine({
            integration: true,
            vendor: 'js/**/*.js'
        }));
});
 
gulp.task('copy-html', function() {
    gulp.src('*.html')
        .pipe(gulp.dest('./dist'));
});
 
gulp.task('copy-images', function() {
    gulp.src('minimizedImages/*')
        .pipe(gulp.dest('dist/minimizedImages'));
});
 
gulp.task('styles', function() {
    gulp.src('sass/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});
 
 
 
browserSync.stream();
