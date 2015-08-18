var gulp = require('gulp');
var ts = require('gulp-typescript');
var typescript = require('typescript');
var del = require('del');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var connect = require('gulp-connect');
var open = require('gulp-open');
var sass = require('gulp-sass');
var KarmaServer = require('karma').Server;


// Add debounce to gulp watch for FTP
(function ftp_debounce_fix() {

	var watch = gulp.watch;
	// Overwrite the local gulp.watch function
	gulp.watch = function (glob, opt, fn) {
		var _this = this, _fn, timeout;
		// This is taken from the gulpjs file, but needed to
		// qualify the "fn" variable
		if (typeof opt === 'function' || Array.isArray(opt)) {
			fn = opt;
			opt = null;
		}
		// Make a copy of the callback function for reference
		_fn = fn;
		// Create a new delayed callback function
		fn = function () {
			if (timeout) {
				clearTimeout(timeout);
			}
			timeout = setTimeout(Array.isArray(_fn) ? function () {
				_this.start.call(_this, _fn);
			} : _fn, 2000);
		};
		return watch.call(this, glob, opt, fn);
	};
})();

var serverOptions = {
	root: '',
	port: 8000,
	livereload: true,
};

var tasks = {
	defaultTask: 'default',
	typeScript: 'typeScript-compile',
	htmlAndCss: 'copy-HTML-and-CSS',
	copy: 'copy-compiled-JS',
	cleanSrc: 'clean-source',
	buildSass: 'build-sass',
	startWebServer: 'start-webServer',
	openBrowser: 'open-browser',
	watch: 'watch',
	watcherRebuild: 'watcher-rebuild',
	cleanTestBuild: 'clean-test-build',
	testBuild: 'test-build',
	test: 'test'
};

// Main task 
gulp.task(tasks.defaultTask, function () {
	runSequence(tasks.cleanSrc,
		tasks.typeScript,
		tasks.htmlAndCss,
		tasks.test,
		tasks.startWebServer,
		tasks.openBrowser,
		tasks.watch);
});

// default task starts watcher. in order not to start it each change
// watcher will run the task bellow
gulp.task(tasks.watcherRebuild, function (callback) {
	runSequence(
		tasks.cleanSrc,
		tasks.typeScript,
		//tasks.test,
		tasks.htmlAndCss);
	callback();
});

// compiles *.ts files by tsconfig.json file and creates sourcemap filse
gulp.task(tasks.typeScript, function () {
	var tsProject = ts.createProject('tsconfig.json', {
		typescript: typescript
	});

	return gulp.src(['typings/**/**.ts', 'scripts/src/**/**.ts'])
		.pipe(sourcemaps.init())
        .pipe(ts(tsProject))
		.pipe(sourcemaps.write('../maps', { includeContent: false, sourceRoot: '/scripts/src' }))
        .pipe(gulp.dest('scripts/build'));
});

// copy *.html files (templates of components)
// to apropriate directory under public/scripts
gulp.task(tasks.htmlAndCss, function () {
	return gulp.src(['scripts/src/**/**.html', 'scripts/src/**/**.css'])
        .pipe(gulp.dest('scripts/build'))
		.pipe(connect.reload());
});


gulp.task(tasks.buildSass, function () {
	return gulp.src('./scripts/src/angular2_material/src/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('./scripts/src/angular2_material/src'));
});


//  clean all generated/compiled files 
//	only in both scripts/ directory
gulp.task(tasks.cleanSrc, function () {
	return del(['scripts/build/*', 'scripts/maps/*']);
});

// watcher
gulp.task(tasks.watch, function () {
	gulp.watch(['scripts/src/**/**.ts', 'scripts/src/**/**.html'], [tasks.watcherRebuild]);
});

// starts web server
gulp.task(tasks.startWebServer, function () {
	connect.server(serverOptions);
});

gulp.task(tasks.openBrowser, function () {
	gulp.src('index.html')
		.pipe(open('', { url: 'http://localhost:' + serverOptions.port }));
});


// tests
gulp.task(tasks.cleanTestBuild, function () {
	return del(['scripts/test/**/*.js', 'scripts/test/maps/**']);
});

gulp.task(tasks.testBuild, [tasks.cleanTestBuild], function () {
	var tsProject = ts.createProject('tsconfig.json', {
		typescript: typescript
	});

	return gulp.src(['scripts/test/**/**.ts'])
		.pipe(sourcemaps.init())
        .pipe(ts(tsProject))
		.pipe(sourcemaps.write('/maps', { includeContent: false, sourceRoot: '/test' }))
        .pipe(gulp.dest('scripts/test'));
});

gulp.task(tasks.test, [tasks.testBuild], function (done) {
	new KarmaServer({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, done).start();
});