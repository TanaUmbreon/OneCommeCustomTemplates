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
  /** @type {string} コメント文字の要素を特定する ID 名 */
  #id;
  /** @type {string} コメント文字を表す HTML 要素のコンテンツ */
  #content;
  /** @type {boolean} この文字をアクティブ化してタイピングアニメーションを行った事を示す値 */
  #hasActivated;

  /** @type {LorAnimationComment} このコメント文字が含まれるコメント */
  #owner;
  /** @type {LorAnimationComment} このコメント文字が含まれるコメント */
  get owner() {
    return this.#owner;
  }

  /** @type {boolean} コメント文字列の最後の文字であることを示す値 */
  #isLast;
  /** @type {boolean} コメント文字列の最後の文字であることを示す値 */
  get isLast() {
    return this.#isLast;
  }

  /**
   * LorTypingChar のインスタンスを生成します。
   * @param {LorAnimationComment} owner このコメント文字が含まれるコメント。
   * @param {string} id コメント文字の要素を特定する ID 名。
   * @param {string} content 文字を表す HTML 要素のコンテンツ。
   * @param {boolean} isLast コメント文字列の最後の文字であることを示す値。
   */
  constructor(owner, id, content, isLast) {
    this.#owner = owner;
    this.#id = id;
    this.#content = content;
    this.#isLast = isLast;
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
