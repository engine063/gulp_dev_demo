var gulp = require('gulp')
var gutil = require('gulp-util')
var uglify = require('gulp-uglify')
var watchPath = require('gulp-watch-path')
var combiner = require('stream-combiner2')
var sourcemaps = require('gulp-sourcemaps')
var minifycss = require('gulp-minify-css')
var autoprefixer = require('gulp-autoprefixer');//解析 CSS 文件并且添加浏览器前缀到CSS规则里
var less = require('gulp-less')
var imagemin = require('gulp-imagemin')

var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');

var handleError = function (err) {
    var colors = gutil.colors;
    gutil.log(colors.red('Error!'))
    gutil.log('fileName: ' + colors.red(err.fileName))
    gutil.log('lineNumber: ' + colors.red(err.lineNumber))
    gutil.log('message: ' + err.message)
    gutil.log('plugin: ' + colors.yellow(err.plugin))
}
var logChange = function(type,path) {
    /*
    paths
        { srcPath: 'src/js/log.js',
            srcDir: 'src/js/',
            distPath: 'dist/js/log.js',
            distDir: 'dist/js/',
            srcFilename: 'log.js',
            distFilename: 'log.js' }
    */
    gutil.log(gutil.colors.green(type) + ' ' + path.srcPath)
    gutil.log('Dist ' + path.distPath)
}
// 合并JS文件
gulp.task('concatJs',function(){
    gulp.src(['src/egret_game/*.js', 'src/egret_game/libs/*/*.js', 'src/egret_game/libs/*.js', 'src/egret_game/libs/*/modules/*.js'])// 需要合并的文件
        .pipe(sourcemaps.init())
        .pipe(concat('game.min.js'))// 合并到文件名
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/egret_game/'));// 输出到的目录
})

gulp.task('watchjs', function () {
    gulp.watch('src/js/**/*.js', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')
        logChange(event.type, paths);
        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            uglify(),
            sourcemaps.write('./'),
            gulp.dest(paths.distDir)
        ])
        combined.on('error', handleError)
    })
})

gulp.task('uglifyjs', function () {
    var combined = combiner.obj([
        gulp.src('src/js/**/*.js'),
        sourcemaps.init(),
        uglify(),
        sourcemaps.write('./'),
        gulp.dest('dist/js/')
    ])
    combined.on('error', handleError)
})

gulp.task('watchcss', function () {
    gulp.watch('src/css/**/*.css', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')
        logChange(event.type, paths);
        gulp.src(paths.srcPath)
            .pipe(sourcemaps.init())
            .pipe(autoprefixer({
              browsers: 'last 2 versions'
            }))
            .pipe(minifycss())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('minifycss', function () {
    gulp.src('src/css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
          browsers: 'last 2 versions'
        }))
        .pipe(minifycss())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/css/'))
})

gulp.task('watchless', function () {
    gulp.watch('src/less/**/*.less', function (event) {
        var paths = watchPath(event, 'src/less/', 'dist/css/')

        logChange(event.type, paths);
        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            autoprefixer({
              browsers: 'last 2 versions'
            }),
            less(),
            minifycss(),
            sourcemaps.write('./'),
            gulp.dest(paths.distDir)
        ])
        combined.on('error', handleError)
    })
})


gulp.task('watchimage', function () {
    gulp.watch('src/images/**/*', function (event) {
        var paths = watchPath(event,'src/','dist/')
        logChange(event.type, paths);
        gulp.src(paths.srcPath)
            .pipe(imagemin({
                progressive: true
            }))
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('image', function () {
    gulp.src('src/images/**/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('dist/images'))
})

gulp.task('watchcopy', function () {
    gulp.watch('src/fonts/**/*', function (event) {
        var paths = watchPath(event,'src/', 'dist/')

        logChange(event.type, paths);

        gulp.src(paths.srcPath)
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('copy', function () {
    gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/fonts/'))
})

gulp.task('watchtemplates', function () {
    gulp.watch('src/templates/**/*', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')

        logChange(event.type, paths);

        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            handlebars({
              // 3.0.1
              handlebars: require('handlebars')
            }),
            wrap('Handlebars.template(<%= contents %>)'),
            declare({
              namespace: 'S.templates',
              noRedeclare: true
            }),
            gulp.dest(paths.distDir)
        ])
        combined.on('error', handleError)
    })
})

gulp.task('templates', function () {
    gulp.src('src/templates/**/*')
        .pipe(handlebars({
        // 3.0.1
        handlebars: require('handlebars')
        }))
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(declare({
        namespace: 'S.templates',
        noRedeclare: true
        }))
        .pipe(gulp.dest('dist/templates'))
})


gulp.task('default', [
    // build
    'uglifyjs', 'minifycss',  'image', 'copy', 'templates',
    // watch
    'watchjs', 'watchcss', 'watchless', 'watchimage', 'watchcopy', 'watchtemplates'
    ]
)

// var sass = require('gulp-ruby-sass') 
// gulp.task('lesscss', function () {
//     var combined = combiner.obj([
//             gulp.src('src/less/**/*.less'),
//             sourcemaps.init(),
//             autoprefixer({
//               browsers: 'last 2 versions'
//             }),
//             less(),
//             minifycss(),
//             sourcemaps.write('./'),
//             gulp.dest('dist/css/')
//         ])
//     combined.on('error', handleError)
// })
// gulp.task('watchsass',function () {
//     gulp.watch('src/sass/**/*', function (event) {
//         var paths = watchPath(event, 'src/sass/', 'dist/css/')

//         gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
//         gutil.log('Dist ' + paths.distPath)
//         sass(paths.srcPath)
//             .on('error', function (err) {
//                 console.error('Error!', err.message);
//             })
//             .pipe(sourcemaps.init())
//             .pipe(minifycss())
//             .pipe(autoprefixer({
//               browsers: 'last 2 versions'
//             }))
//             .pipe(sourcemaps.write('./'))
//             .pipe(gulp.dest(paths.distDir))
//     })
// })
// gulp.task('sasscss', function () {
//         sass('src/sass/')
//         .on('error', function (err) {
//             console.error('Error!', err.message);
//         })
//         .pipe(sourcemaps.init())
//         .pipe(minifycss())
//         .pipe(autoprefixer({
//           browsers: 'last 2 versions'
//         }))
//         .pipe(sourcemaps.write('./'))
//         .pipe(gulp.dest('dist/css'))
// })
