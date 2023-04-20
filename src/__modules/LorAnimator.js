import { LorAnimationComment } from "./LorAnimationComment.js";

/** @typedef {import("../__types/onesdk").CommonData} CommonData */
/** @typedef {import("../__modules/LorAnimationChar").LorAnimationChar} LorAnimationChar */

/** @type {number} コメントの次の文字を表示する間隔[ミリ秒] */
const DELAY_MILLISECONDS = 150;

/** @type {number} コメント文字を小刻みに揺らす間隔[ミリ秒] */
const SHAKING_MILLISECONDS = 300;

/** @type {number} コメントが完全に表示されてからフェードアウトが始まるまでの時間[ミリ秒] */
const COMMENT_DISPLAY_MILLISECONDS = 8000;

/**
 * LoR (Library Of Ruina) 風アニメーションを制御します。
 */
export class LorAnimator {
  /** @type {Map<string, LorAnimationComment>} OneSDK コメントの ID と、それに対応する制御対象の  LoR 風アニメーションコメントを関連付けたマップ */
  #commentMap;
  /** @type {LorAnimationComment[]} 制御対象の LoR 風アニメーションコメントのリスト */
  #commentList;
  /** @type {LorAnimationChar[]} タイピングアニメーションさせるコメント文字を表示順に列挙させたキュー */
  #typingQueue;
  /** @type {number?} タイピングアニメーションの制御に使うタイマー (setInterval) 関数の識別子。値が null の場合はタイマーが動作していない状態を表します */
  #typingTimerId;
  /** @type {number?} 文字を小刻みに揺らすアニメーションの制御に使うタイマー (setInterval) 関数の識別子。値が null の場合はタイマーが動作していない状態を表します */
  #shakingTimerId;

  /** @type {LorAnimationComment[]} 制御対象の LoR 風アニメーションコメントのリスト */
  get comments() {
    return this.#commentList;
  }

  /**
   * LorCommentAnimator のインスタンスを生成します。
   */
  constructor() {
    this.#commentMap = new Map();
    this.#commentList = [];
    this.#typingQueue = [];
    this.#typingTimerId = null;
    this.#shakingTimerId = null;
  }

  /**
   * 指定した OneSDK コメントの配列を新しい制御対象として設定し、状態をリフレッシュします。
   * 新しい OneSDK コメントが含まれている場合は LorAnimationComment に変換して制御対象に追加します。
   * 前回に制御対象として指定した OneSDK コメントが含まれている場合は、変換済みの LorAnimationComment をそのまま使用します。
   * @param {CommonData[]} oneComments 制御対象にする OneSDK コメントの配列。
   */
  refresh(oneComments) {
    this.#stopTypingAnimation();
    this.#stopShakingAnimation();

    const oldMap = this.#commentMap;
    this.#commentMap = new Map();
    this.#commentList = [];
    this.#typingQueue = [];

    oneComments.forEach((oneComment) => {
      const id = oneComment.data.id;
      const lorComment = oldMap.get(id) ?? new LorAnimationComment(oneComment);
      lorComment.refreshContent();
      this.#commentMap.set(id, lorComment);
      this.#commentList.push(lorComment);
      this.#typingQueue.push(...lorComment.characters.filter((c) => !c.hasActivated));
    });

    this.#startTypingAnimation();
    this.#startShakingAnimation();
  }

  /**
   * タイピングアニメーションを開始します。
   */
  #startTypingAnimation() {
    if (this.#typingTimerId != null) {
      return;
    }

    this.#typingTimerId = setInterval(() => {
      if (this.#typingQueue.length == 0) {
        this.#stopTypingAnimation();
        return;
      }

      const char = this.#typingQueue.shift();
      if (char == null) {
        this.#stopTypingAnimation();
        return;
      }
      
      char.activate();
      if (!char.isLast) { return; }

      setTimeout(() => {
        char.owner.deactivation();
      }, COMMENT_DISPLAY_MILLISECONDS);
    }, DELAY_MILLISECONDS);
  }

  /**
   * タイピングアニメーションを停止します。
   */
  #stopTypingAnimation() {
    if (this.#typingTimerId == null) {
      return;
    }

    clearInterval(this.#typingTimerId);
    this.#typingTimerId = null;
  }

  /**
   * 文字を小刻みに揺らすアニメーションを開始します。
   */
  #startShakingAnimation() {
    if (this.#shakingTimerId != null) {
      return;
    }

    this.#shakingTimerId = setInterval(() => {
      this.#commentList.forEach(comment => {
        comment.characters.forEach(char => {
          char.shake();
        });
      });
    }, SHAKING_MILLISECONDS);
  }

  /**
   * 文字を小刻みに揺らすアニメーションを停止します。
   */
  #stopShakingAnimation() {
    if (this.#shakingTimerId == null) {
      return;
    }

    clearInterval(this.#shakingTimerId);
    this.#shakingTimerId = null;
  }
}
