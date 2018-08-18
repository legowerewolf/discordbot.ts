var gulp = require('gulp');
var ts = require('gulp-typescript');

var tsProject = ts.createProject("./tsconfig.json");

gulp.task("build-typescript", function () {
    return tsProject.src()
        .pipe(tsProject())
        .on("error", (err) => { })
        .js.pipe(gulp.dest("build"));
});

gulp.task("start-watchers", () => {
    gulp.watch(tsProject.config.include, ["build-typescript"]);
})

gulp.task("default-nowatch", ["build-typescript"])

gulp.task("default", ["default-nowatch", "start-watchers"]);

