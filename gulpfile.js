const gulp = require('gulp');
const csso = require('gulp-csso');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const cp = require('child_process');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync');

const jekyllCommand = (/^win/.test(process.platform)) ? 'jekyll.bat' : 'bundle';

/*
 * Build the Jekyll Site
 * runs a child process in node that runs the jekyll commands
 */
gulp.task('jekyll-build', function (done) {
	return cp.spawn(jekyllCommand, ['exec', 'jekyll', 'build'], {stdio: 'pipe'}).on('close', done);
});

/*
 * Rebuild Jekyll & reload browserSync
 */
gulp.task('jekyll-rebuild', gulp.series('jekyll-build', function (done) {
	browserSync.reload();
	done();
}));

/*
 * Build the jekyll site and launch browser-sync
 */
gulp.task('browser-sync', gulp.series('jekyll-build', function(done) {
	browserSync({
		server: {
			baseDir: '_site'
		}
	});
	done();
}));

gulp.task('sass', function(done) {
  	gulp.src('_sass/**/*.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(csso())
		.pipe(gulp.dest('assets/css/'));
		done();
});

gulp.task('assets', function() {
	return gulp.src('_assets/**/*.*')
		.pipe(plumber())
		.pipe(gulp.dest('assets'));
});

gulp.task('js', function(){
	return gulp.src('_js/**/*.js')
		.pipe(plumber())
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest('assets/js/'))
});

gulp.task('watch', function(done) {
	gulp.watch('_sass/**/*.scss', gulp.series('sass', 'jekyll-rebuild'));
	gulp.watch('_js/**/*.js', gulp.series('js', 'jekyll-rebuild'));
	gulp.watch('_assets/**/*.*', gulp.series('assets', 'jekyll-rebuild'));
	gulp.watch(['*.html', '_includes/*.html', '_layouts/*.html', '_config.yml'], gulp.series('jekyll-rebuild'));
	done();
});

gulp.task('default', gulp.series('sass', 'assets', 'js', 'watch', 'browser-sync'));
