/** パス操作を行う Node.js の組み込みモジュール */
const path = require("path");

// modeの指定はコマンド引数から行い、その内容によりモードと出力先フォルダを切り替える
module.exports = (env, argv) => {
  const isRelease = argv.mode == "production";
  const dir = isRelease ? "dist" : "deploy";

  return {
    mode: argv.mode,
    optimization: {
      minimize: false,
    },
    entry: {
      "lor-like-comment": "./src/lor-like-comment/script.js",
    },
    output: {
      path: path.resolve(__dirname, dir, "templates"),
      filename: "[name]/script.js",
    },
  };
};
