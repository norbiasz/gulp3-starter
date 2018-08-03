var gulp = require('gulp');
var browserSync = require('browser-sync');
var sourcemaps = require('gulp-sourcemaps');
var compass = require('gulp-compass');
var plumber = require('gulp-plumber'); //w konsoli podaje miejsce wystapienia błedu
var autoprefixer = require('gulp-autoprefixer');
var minifCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify'); //minifikacja JS
var concat = require('gulp-concat'); //łączenie js i css w jeden plik
var include = require("gulp-include"); //dołacanie do pliku JS zewnętrznych skryptów
var imagemin = require('gulp-imagemin'); //kompresa plików graficznych
var changed = require('gulp-changed'); //sprawdza w któryh plikach graficznych zaszła zmiana
var htmlReaplce = require('gulp-html-replace'); //przetworzenie kilku plików css lub js w jeden  
                                                //CSS -> <!-- build:css --> PLIKI CSS <!-- endbuild -->  
                                                //JS->   <!-- build:js --> PLIKI JS <!-- endbuild  -->
var htmlMin = require('gulp-htmlmin'); //minifikacja HTML
var del = require('del'); //usuwanie
var sequence = require('run-sequence'); //kolejność wykonywania taksów

gulp.task('reload', function() {
  browserSync.reload();
});

gulp.task('serve', function() {
  browserSync({
    server: 'dist/'
  });

  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('src/*.*', function(){
    sequence('cleanHtml', ['html']) 
  });
  gulp.watch('src/files/**', function(){ 
    sequence('cleanFiles', ['files']) 
  });
  gulp.watch('src/img/**', function(){
    sequence('cleanImg', ['img']) 
  }); 
});

gulp.task('files', function() {
  return gulp.src('src/files/**/*')
    .pipe(plumber())
    .pipe(gulp.dest('dist/files/'));
});

gulp.task('fonts', function() {
  return gulp.src('src/fonts/**/*')
    .pipe(plumber())
    .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('sass', function() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(compass({
			css: 'dist/css',
			sass: 'src/scss'
		}))
    .pipe(autoprefixer({
      browsers: ['last 3 versions']
    }))
    .pipe(sourcemaps.write())
    .pipe(concat('style.css'))
    .pipe(minifCSS())
    .pipe(gulp.dest('dist/css/'))
    .pipe(browserSync.stream());
});

gulp.task('js', function(){
  return gulp.src('src/js/**/*.js')
  .pipe(plumber())
  .pipe(include({
        extensions: "js",
        hardFail: true,
        includePaths: [
            __dirname + "/node_modules"
        ]
  }))
	.pipe(concat('script-my.js'))
	.pipe(uglify())
  .pipe(gulp.dest('dist/js/'))
  .pipe(browserSync.stream());
});

gulp.task('img', function() {
  return gulp.src('src/img/**/*.*')
    .pipe(plumber())
    .pipe(changed('dist/img/'))
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img/'));
});

gulp.task('html', function() {
  return gulp.src('src/*.*')
    .pipe(plumber())
    .pipe(htmlReaplce({
      'css': 'css/style.css',
      'js': 'js/script-my.js'
    }))
    // .pipe(htmlMin({
    //   sortAttributes: true,
    //   sortClassName: true,
    //   collapseWhitespace: true
    // }))
    .pipe(gulp.dest('dist/'))
});

gulp.task('clean', function() {
  return del(['dist']);
});

// gulp.task('cleanCss', function() {
//   return del(['dist/cs/**']);
// });

// gulp.task('cleanJs', function() {
//   return del(['dist/js/**']);
// });

gulp.task('cleanFiles', function() {
  return del(['dist/files/**']);
});

gulp.task('cleanImg', function() {
  return del(['dist/img/**']);
});

gulp.task('cleanHtml', function() {
  return del(['dist/*.html']);
});

gulp.task('build', function() {
  sequence('clean', ['html', 'js', 'sass', 'files', 'img']);
});

gulp.task('default', ['serve']);
 