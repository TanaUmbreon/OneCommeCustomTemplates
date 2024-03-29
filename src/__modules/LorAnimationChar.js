import { Random} from "./Random.js";

/** @type {string} コメントの単一文字が表示状態になっている事を表すクラス名 */
const IS_ACTIVE_STYLE = "is-active";
/** @type {string} コメントの単一文字のブロックを表すクラス名 */
const TYPING_BLOCK_STYLE = "typing-block";
/** @type {string} 表示領域だけ確保して非表示にするコメントの単一文字を表すクラス名 */
const HIDDEN_STYLE = "hidden";

/** @type {number} 文字の回転角度の最小値[度] */
const CHAR_ROTATE_MIN = -3;
/** @type {number} 文字の回転角度の最小値[度] */
const CHAR_ROTATE_MAX = 3;

/**
 * LoR (Library Of Ruina) 風アニメーションを行うコメント本文の単一の文字を表します。
 */
export class LorAnimationChar {
  /** @type {string} コメント文字の要素を特定する ID 名 */
  #id;
  
  /** @type {boolean} この文字をアクティブ化してタイピングアニメーションを行った事を示す値 */
  #hasActivated;
  get hasActivated() {
    return this.#hasActivated;
  }

  /** @type {string} コメント文字を表す HTML 要素のコンテンツ */
  #content;
  /** @type {string} コメント文字を表す HTML 要素のコンテンツ */
  get content() {
    return this.#content;
  }

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

  /**
   * この文字をランダムにわずかに傾かせ、小刻みに揺れるアニメーションを行います。
   */
  shake() {
    const style = document.getElementById(this.#id)?.style;
    if (style == null) { return; }
    style.transform = `rotate(${Random.nextInt(CHAR_ROTATE_MIN, CHAR_ROTATE_MAX)}deg)`;
  }

  /**
   * 現在の状態に基づいてこの文字の HTML ソースコードを構築して返します。
   * @returns この文字の HTML ソースコード。
   */
  buildContent() {
    const isActiveStyle = this.#hasActivated ? IS_ACTIVE_STYLE : "";
    const isImageStyle = this.isImage ? HIDDEN_STYLE : "";
    return (
      `<div id="${this.#id}" class="${TYPING_BLOCK_STYLE} ${isActiveStyle}">` +
      `<span class="comment-text-shadow ${isImageStyle}">${this.#content}</span>` +
      `<span class="comment-text-front">${this.#content}</span>` +
      `</div>`
    );
  }

  /**
   * 現在の状態に基づいてこの文字の表示領域確保用 HTML ソースコードを構築して返します。
   * @returns この文字の HTML ソースコード。
   */
  buildPreBoxingContent() {
    const isImageStyle = this.isImage ? HIDDEN_STYLE : "";
    return (
      `<div class="${TYPING_BLOCK_STYLE} ${IS_ACTIVE_STYLE}">` +
      `<span class="comment-text-shadow ${isImageStyle}">${this.#content}</span>` +
      `<span class="comment-text-front">${this.#content}</span>` +
      `</div>`
    );
  }
}
