const gulp = require("gulp");
const path = require("path");

const ts = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const es = require("event-stream");
const vsce = require("vsce");
const nls = require("vscode-nls-dev");

const inlineMap = true;
const inlineSource = true;
const outDest = "out";

// If all VS Code langaues are support you can use nls.coreLanguages
const languages = [{ folderName: "zh", id: "zh" }];

function clean() {
  return del([`${outDest}/**`, "package.nls.*.json", "*.vsix"]);
}

function compile(buildNls) {
  const tsProject = ts.createProject(`./tsconfig.json`);
  let r = tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .js.pipe(buildNls ? nls.rewriteLocalizeCalls() : es.through())
    .pipe(
      buildNls
        ? nls.createAdditionalLanguageFiles(languages, "i18n", "out")
        : es.through()
    );

  if (inlineMap && inlineSource) {
    r = r.pipe(sourcemaps.write());
  } else {
    r = r.pipe(
      sourcemaps.write("../out", {
        // no inlined source
        includeContent: inlineSource,
        // Return relative source map root directories per file.
        sourceRoot: "../src"
      })
    );
  }

  return r.pipe(gulp.dest(outDest));
}

gulp.task("internal-compile", function() {
  compile(false, "api");
  compile(false, "client");
  return compile(false, "server");
});

gulp.task("internal-nls-compile", function() {
  return compile(true);
});

gulp.task(clean);

gulp.task("add-i18n", function() {
  return gulp
    .src(["package.nls.json"])
    .pipe(nls.createAdditionalLanguageFiles(languages, "i18n"))
    .pipe(gulp.dest("."));
});

gulp.task("vsce:publish", function() {
  return vsce.publish();
});

gulp.task("vsce:package", function() {
  return vsce.createVSIX();
});

gulp.task("build", gulp.series("clean", "internal-nls-compile", "add-i18n"));

gulp.task("default", gulp.series("build"));

gulp.task("compile", gulp.series("clean", "internal-compile"));

gulp.task("publish", gulp.series("build", "vsce:publish"));

gulp.task("package", gulp.series("build", "vsce:package"));
