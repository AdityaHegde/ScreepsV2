import gulp from "gulp";
import mocha from "gulp-mocha";
import del from "del";

import rollupStream from "@rollup/stream";
import source from "vinyl-source-stream";

import path from "path";
import typescript from "rollup-plugin-typescript2";

const UNIT_TEST_FILES = "tests/unit/**/*.spec.js";
const COMPONENT_TEST_FILES = "tests/component/**/*.spec.js";

function clean() {
  return del(["build"]);
}

function build() {
  return rollupStream({
    input : "src/main.ts",
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            // tsconfig.json has module = "commonjs" which is for worker code
            // "esnext" is needed for rollup
            module: "esnext",
            target: "es2019"
          }
        }
      })
    ]
  })
  .pipe(source("main.js"))
  .pipe(gulp.dest("common"));
}

function unit() {
  return gulp.src(UNIT_TEST_FILES)
        .pipe(mocha());
}

function component() {
  return gulp.src(COMPONENT_TEST_FILES)
        .pipe(mocha());
}

export {
  clean,
  build,
  unit,
  component,
}
