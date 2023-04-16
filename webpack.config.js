/** パス操作を行う Node.js の組み込みモジュール */
const path = require("path");

module.exports = {
  // modeの指定はコマンド引数から行う
  // mode: "production",
  optimization: {
    minimize: false,
  },
  entry: {
    lor: "./src/lor-like-comment/script.js",
  },
  output: {
    path: path.resolve(__dirname, "dist/templates"),
    filename: "script.js",
  },
};
