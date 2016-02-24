var gulp = require('gulp');
var ts = require('gulp-tsb');
var babel = require('gulp-babel');

gulp.task('compile-typescript', function() {
  var compiler = ts.create(require('../../tsconfig.json').compilerOptions);

  return gulp.src('src/**/*.ts')
    .pipe(compiler())
    .pipe(gulp.dest('dist/es6/'));
});

gulp.task('compile-es6', function() {
  return gulp.src('dist/es6/**/*.js')
    .pipe(babel({
      modules: 'system'
    }))
    .pipe(gulp.dest('dist/es5/'));
});