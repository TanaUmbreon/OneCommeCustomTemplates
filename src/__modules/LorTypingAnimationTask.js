import { AnimationTaskBase } from "./AnimationTaskBase.js";

/** @typedef {import("./LorAnimationChar").LorAnimationChar} LorAnimationChar */

/** @type {number} コメントの次の文字を表示する間隔[ミリ秒] */
const DELAY_MILLISECONDS = 100;

/**
 * LoR (Library Of Ruina) 風コメント文字のタイピングアニメーションを行うタスクです。
 */
export class LorTypingAnimationTask extends AnimationTaskBase {
  /** @type {LorAnimationChar} 文字タイピングアニメーションを行う対象の LoR コメント文字 */
  #char;

  /**
   * 文字タイピングアニメーションを行う対象の LoR コメント文字を指定して、
   * LorTypingAnimationTask のインスタンスを生成します。
   * @param {LorAnimationChar} char 文字タイピングアニメーションを行う対象の LoR コメント文字。
   */
  constructor(char) {
    super(DELAY_MILLISECONDS);
    this.#char = char;
  }

  execute() {
    this.#char.activate();
  }
}