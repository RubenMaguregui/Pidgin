var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('serve', ['compile-typescript'], function(done) {
  browserSync({
    online: false,
    open: false,
    port: 8080,
    server: {
      baseDir: ['.'],
      middleware: function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      }
    }
  }, done);
});
