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

var packageJSON  = require('./package')
	, jshintConfig = packageJSON.jshintConfig

var paths = {
		src:  'src/'
		, layout: 'layouts/'
		, dest: 'dest/'
	}

// concatenate JS Files
gulp.task('scripts', function() {
	return gulp.src(paths.src + 'js/*.js')
	  .pipe(concat('main.js'))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest(paths.dest + 'js'))
})

gulp.task('lint', function() {
	return gulp.src(paths.src + 'js/*.js')
	  .pipe(jshint(jshintConfig))
	  .pipe(jshint.reporter(stylish))
	  .pipe(jshint.reporter('fail'))
})

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
	return gulp.src(paths.src + 'img/**/*')
	  .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
	  .pipe(gulp.dest(paths.dest + 'img'))
})

gulp.task('pages', function() {
	var mdFilter = gulpFilter('*.md')
	
	return gulp.src(paths.src + 'pages/*')
	  .pipe(frontMatter({
		property: 'data',
		remove: true
	  }))
	  .pipe(applyTemplate({
		engine: 'ejs'
		, template: function (context) {
			return paths.src + paths.layout + context.data.template + '.ejs'
		}
	  }))
	  .pipe(mdFilter)
	  .pipe(marked())
	  .pipe(mdFilter.restore())
	  .pipe(gulp.dest(paths.dest + 'pages'))
	  .pipe(livereload(connect))
})

gulp.task('index', function() {
})

gulp.task('watch', function() {

  gulp.watch(paths.src + 'js/*.js', ['lint', 'scripts'])
  gulp.watch(paths.src + 'scss/*.scss', ['sass'])
  gulp.watch(paths.src + 'img/*', ['images'])
  gulp.watch(paths.src + 'pages/*', ['pages'])

})

// Default Task
gulp.task('default', ['lint', 'scripts', 'scss-lint', 'sass', 'images', 'pages'])