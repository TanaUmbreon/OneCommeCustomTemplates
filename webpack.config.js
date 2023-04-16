/** パス操作を行う Node.js のモジュール */
const path = require("path");

module.exports = {
  mode: "production",
  optimization: {
    minimize: false,
  },
  entry: {
    lor: "./src/lor-like-comment/script.js",
  },
  output: {
    path: path.resolve(__dirname, "release"),
    filename: "script.js",
  },
};
