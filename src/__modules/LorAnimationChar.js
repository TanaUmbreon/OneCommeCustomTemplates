/** @type {string} コメントの単一文字が表示状態になっている事を表すクラス名 */
const IS_ACTIVE_STYLE = "is-active";
/** @type {string} コメントの単一文字のブロックを表すクラス名 */
const TYPING_BLOCK_STYLE = "typing-block";
/** @type {string} 表示領域だけ確保して非表示にするコメントの単一文字を表すクラス名 */
const HIDDEN_STYLE = "hidden";

/**
 * LoR (Library Of Ruina) 風アニメーションを行うコメント本文の単一の文字を表します。
 */
export class LorAnimationChar {
  /** @type {LorAnimationComment} このコメント文字が含まれるコメント */
  #owner;
  /** @type {string} コメント文字の要素を特定する ID 名 */
  #id;
  /** @type {string} コメント文字を表す HTML 要素のコンテンツ */
  #content;
  /** @type {boolean} 文字の代わりに img 要素を用いている事を示す値 */
  #isImage;
  /** @type {boolean} この文字をアクティブ化してタイピングアニメーションを行った事を示す値 */
  #hasActivated;

  /**
   * LorTypingChar のインスタンスを生成します。
   * @param {LorAnimationComment} owner このコメント文字が含まれるコメント。
   * @param {string} id コメント文字の要素を特定する ID 名。
   * @param {string} content 文字を表す HTML 要素のコンテンツ。
   * @param {boolean} isImage 文字の代わりに img 要素を用いている事を示す値。
   */
  constructor(owner, id, content, isImage) {
    this.#owner = owner;
    this.#id = id;
    this.#content = content;
    this.#isImage = isImage;
    this.#hasActivated = false;
  }

  /**
   * この文字をアクティブ化して、タイピングアニメーションを行います。
   */
  activate() {
    if (this.#hasActivated) {
      return;
    }

    document.getElementById(this.#id)?.classList.add(IS_ACTIVE_STYLE);
    this.#hasActivated = true;
    this.#owner.onActivated();
  }

  buildContent() {
    const isActiveStyle = this.hasActivated ? IS_ACTIVE_STYLE : "";
    const isImageStyle = this.isImage ? HIDDEN_STYLE : "";
    return (
      `<div id="${this.#id}" class="${TYPING_BLOCK_STYLE} ${isActiveStyle}">` +
      `<span class="comment-text-front">${this.#content}</span>` +
      `<span class="comment-text-shadow ${isImageStyle}">${this.#content}</span>` +
      `</div>`
    );
  }
}
