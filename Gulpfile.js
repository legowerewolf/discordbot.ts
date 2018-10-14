let gulp = require('gulp');
let ts = require('gulp-typescript');

let tsProject = ts.createProject("./tsconfig.json");

function build_typescript() {
    return tsProject.src()
        .pipe(tsProject())
        .on("error", (err) => { })
        .js.pipe(gulp.dest("build"));
}

function run_tests(done) {
    let tests = [
        {
            name: "Prefixer composition",
            test: () => {
                let prefixer = require("./build/prefixer").getNewPrefixer();
                prefixer.prepare("Testing");
                prefixer.prepare("Test");
                return prefixer.compose("T", "3.14") === "[T]       3.14"
            }
        }
    ]

    let testPrefixer = require("./build/prefixer").getNewPrefixer();
    tests.map(test => test.name).forEach((name) => { testPrefixer.prepare(name) });

    console.log("=".repeat(60));

    let pass = tests
        .map((test) => {
            let result = test.test();
            testPrefixer.log(test.name, `${result ? "Pass" : "Fail"}`);
            return result;
        })
        .reduce((accum, result) => { return accum && result }, true);

    console.log("=".repeat(60));

    done(pass || tests.length == 0 ? null : new Error("Tests failed."));
}

gulp.task("build", build_typescript);
gulp.task("test", gulp.series(build_typescript, run_tests));
gulp.task("start-watchers", () => {
    gulp.watch(tsProject.config.include, gulp.parallel("test"));
});
gulp.task("default", gulp.parallel("test", "start-watchers"));