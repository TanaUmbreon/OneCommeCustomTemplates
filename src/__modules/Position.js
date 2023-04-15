/**
 * 要素の配置位置を表します。
 */
export class Position {
  /** @type {Position} 上方向 */
  static #top = new Position("top");
  /** @type {Position} 上方向 */
  static get TOP() {
    return this.#top;
  }

  /** @type {Position} 下方向 */
  static #bottom = new Position("bottom");
  /** @type {Position} 下方向 */
  static get BOTTOM() {
    return this.#bottom;
  }

  /** @type {Position} 左方向 */
  static #left = new Position("left");
  /** @type {Position} 左方向 */
  static get LEFT() {
    return this.#left;
  }

  /** @type {Position} 右方向 */
  static #right = new Position("right");
  /** @type {Position} 右方向 */
  static get RIGHT() {
    return this.#right;
  }

  /** @type {string} CSS のプロパティ名 */
  #cssPropertyName;

  /**
   * Position の新しいインスタンスを生成します。
   * @param {string} cssPropertyName CSS のプロパティ名。
   */
  constructor(cssPropertyName) {
    this.#cssPropertyName = cssPropertyName;
  }

  /**
   * このインスタンスの値と等価な CSS のプロパティ名を取得します。
   * @returns {string} CSS のプロパティ名。
   */
  getCssPropertyName = () => this.#cssPropertyName;
}
