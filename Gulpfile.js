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
            name: "Prefixer",
            test: () => {
                let Prefixer = require("./build/prefixer").Prefixer;
                Prefixer.prepare("Testing");
                Prefixer.prepare("Test");
                return Prefixer.compose("T", "3.14") === "[T]       3.14"
            }
        }
    ]

    let pass = tests.map((test) => {
        let result = test.test();
        console.log(`${test.name}: ${result ? "Pass" : "Fail"}`);
        return result
    }).reduce((accum, result) => { return accum && result }, true);

    done(pass ? null : new Error("Tests failed."));
}

gulp.task("build", build_typescript);
gulp.task("test", gulp.series(build_typescript, run_tests));
gulp.task("start-watchers", () => {
    gulp.watch(tsProject.config.include, gulp.parallel("test"));
});
gulp.task("default", gulp.parallel("test", "start-watchers"));