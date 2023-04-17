/** パス操作を行う Node.js の組み込みモジュール */
const path = require("path");

// modeの指定はコマンド引数から行い、その内容によりモードと出力先フォルダを切り替える
module.exports = (env, argv) => {
  const isRelease = argv.mode == "production";
  const dir = isRelease ? "dist" : "debug";
  const outputPath = isRelease
    ? path.resolve(__dirname, dir, "templates")
    : path.resolve(__dirname, dir);

  return {
    mode: argv.mode,
    optimization: {
      minimize: false,
    },
    entry: {
      "lor-like-comment": "./src/lor-like-comment/script.js",
    },
    output: {
      path: outputPath,
      filename: "[name]/script.js",
    },
  };
};
