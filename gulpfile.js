var gulp = require('gulp')
	, cache = require('gulp-cache')
	, concat = require('gulp-concat')
	, jshint = require('gulp-jshint')
	, stylish = require('jshint-stylish')
	, uglify = require('gulp-uglify')
	, rename = require('gulp-rename')
	, sass = require('gulp-ruby-sass')
	, scsslint = require('gulp-scss-lint')
	, imagemin = require('gulp-imagemin')
	, frontMatter = require('gulp-front-matter')
	, marked = require('gulp-marked')
	, applyTemplate = require('gulp-apply-template')
	, gulpFilter = require('gulp-filter')
	, connect = require('gulp-connect')
	, livereload = require('gulp-livereload')
	, gulpIgnore = require('gulp-ignore')
	, debug = require('gulp-debug')

var packageJSON  = require('./package')
	, jshintConfig = packageJSON.jshintConfig

var paths = {
	src:  'src/'
	, layout: 'layouts/'
	, dest: 'dest/'
}

gulp.task('common-scripts', function() {
	
	var scripts = gulp.src(paths.src + 'assets/js/*.js')
	
	// validate scripts (lint)
	scripts.pipe(jshint(jshintConfig))
	  .pipe(jshint.reporter(stylish))
	  .pipe(jshint.reporter('fail'))
	
	// combine and minify scripts
	return scripts.pipe(concat('main.js'))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest(paths.dest + 'assets/js'))
})

gulp.task('specific-scripts', function() {
	
	var scripts = gulp.src(paths.src + 'assets/js/specific/*.js')
	
	// validate scripts (lint)
	scripts.pipe(jshint(jshintConfig))
	  .pipe(jshint.reporter(stylish))
	  .pipe(jshint.reporter('fail'))
	
	// combine and minify scripts
	return scripts.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest(paths.dest + 'assets/js'))
})

// compile sass
gulp.task('sass', function() {
	return sass(paths.src + 'scss/', {style: 'compressed'}) 
	.on('error', function (err) {
	  console.error('Error!', err.message)
   })
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest(paths.dest + 'css'))
})
 
gulp.task('scss-lint', function() {
	return gulp.src(paths.src + 'scss/*.scss')
	  .pipe(scsslint())
	  .pipe(scsslint.failReporter())
})

gulp.task('images', function() {
	return gulp.src(paths.src + 'assets/img/**/*')
	  .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
	  .pipe(gulp.dest(paths.dest + 'assets/img'))
})

gulp.task('assets', ['common-scripts', 'specific-scripts', 'scss-lint', 'sass', 'images'])

gulp.task('pages', function() {
	var mdFilter = gulpFilter('*.md')
	
	var pages= gulp.src(paths.src + 'pages/**/*.*')
	  .pipe(frontMatter({
		property: 'data',
		remove: true
	  }))
	  
	pages.pipe(gulpIgnore.include(function(file) { return Object.keys(file.data).length === 0 }))
	  .pipe(debug({title: 'Invalid page: missing front matter'}))
	  
	return pages.pipe(gulpIgnore.include(function(file) { return Object.keys(file.data).length !== 0 }))
	  .pipe(applyTemplate({
		engine: 'ejs'
		, template: function (context) {
			return paths.src + paths.layout + context.data.template + '.ejs'
		}
	  }))
	  .pipe(mdFilter)
	  .pipe(marked())
	  .pipe(mdFilter.restore())
	  .pipe(gulp.dest(function(file) {
		  return paths.dest + (file.data.lang || 'en')
	  }))
})

gulp.task('index', function() {
})

gulp.task('watch', function() {

  gulp.watch(paths.src + 'assets/js/*.js', ['scripts'])
  gulp.watch(paths.src + 'assets/scss/*.scss', ['sass'])
  gulp.watch(paths.src + 'assets/img/*', ['images'])
  gulp.watch(paths.src + 'pages/*', ['pages'])

})

// Default Task
gulp.task('default', ['assets', 'pages'])
