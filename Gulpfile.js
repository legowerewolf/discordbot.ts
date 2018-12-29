let gulp = require('gulp');
let ts = require('gulp-typescript');
let pre = require('legowerewolf-prefixer');

let tsProject = ts.createProject("./tsconfig.json");

let isWatched = false;

function build_typescript() {
    return tsProject.src()
        .pipe(tsProject())
        .on("error", (err) => { })
        .js.pipe(gulp.dest("build"));
}

function run_tests(done) {
    let tests = [
        ////////////////////// Tests go here. //////////////////////
        /*
        Tests are just functions that return a true or a false.

        */

        /*
        {
            name: "Template",
            test: () => true
        }
        */
        ///////////////////// End testing block ///////////////////
    ]

    let testPrefixer = new pre.Prefixer(...tests.map(test => test.name));

    console.log("=".repeat(60));

    let pass = tests
        .map((test) => {
            let result = test.test();
            console.log(testPrefixer.prefix(test.name, `${result ? "Pass" : "Fail"}`));
            return result;
        })
        .reduce((accum, result) => { return accum && result }, true);

    console.log("=".repeat(60));

    done(isWatched ? false : !pass);
}

gulp.task("build", build_typescript);
gulp.task("test", gulp.series(build_typescript, run_tests));
gulp.task("start-watchers", () => {
    isWatched = true;
    gulp.watch(tsProject.config.include, gulp.parallel("test"));
});
gulp.task("default", gulp.parallel("test", "start-watchers"));