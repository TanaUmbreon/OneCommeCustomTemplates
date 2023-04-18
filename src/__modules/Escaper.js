const html = require("html-escaper");

/**
 * 指定した文字列に含まれる HTML エンティティ (`&`, `<`, `>`, `"`, `'`) と半角スペースを参照文字にエスケープして返します。
 * @param {string} text エスケープ対象の文字列。
 * @returns {string} 参照文字にエスケープされた text と同等の文字列。
 */
export function escape(text) {
  /** @type {string} */
  const escaped = html.escape(text);
  return escaped.replace(" ", "&nbsp;");
}
