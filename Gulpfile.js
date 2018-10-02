let gulp = require('gulp');
let ts = require('gulp-typescript');

let tsProject = ts.createProject("./tsconfig.json");

gulp.task("build-typescript", function () {
    return tsProject.src()
        .pipe(tsProject())
        .on("error", (err) => { })
        .js.pipe(gulp.dest("build"));
});

gulp.task("start-watchers", () => {
    gulp.watch(tsProject.config.include, gulp.parallel("build-typescript"));
})

gulp.task("default-nowatch", gulp.series("build-typescript"));

gulp.task("default", gulp.parallel("default-nowatch", "start-watchers"));

