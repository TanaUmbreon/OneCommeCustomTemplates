/** @typedef {import("../__types/onesdk").BaseComment} BaseComment */
/** @typedef {import("../__types/onesdk").CommonData} CommonData */

import { LorAnimationComment } from "../__modules/LorAnimationComment.js";

const JSON_PATH = "../../comment.json";

/** @type {number} 画面に表示するコメントの最大数 */
const LIMIT = 5;

/** @type {number} コメントの次の文字を表示する間隔[ミリ秒] */
const DELAY_MILLISECONDS = 150;


/** @type {number} コメントが完全に表示されてからフェードアウトが始まるまでの時間[ミリ秒] */
const COMMENT_DISPLAY_MILLISECONDS = 10000;

/**
 * LoR (Library Of Ruina) 風アニメーションを制御します。
 */
class LorAnimator {
  /** @type {Map<string, LorAnimationComment>} OneSDK コメントの ID と、それに対応する制御対象の  LoR 風アニメーションコメントを関連付けたマップ */
  #commentMap;
  /** @type {LorAnimationComment[]} 制御対象の LoR 風アニメーションコメントのリスト */
  #commentList;
  /** @type {LorAnimationChar[]} タイピングアニメーションさせるコメント文字を表示順に列挙させたキュー */
  #typingQueue;
  /** @type {number?} タイピングアニメーションの制御に使うタイマー (setInterval) 関数の識別子。値が null の場合はタイマーが動作していない状態を表します */
  #typingTimerId;

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
  }

  /**
   * 指定した OneSDK コメントの配列を新しい制御対象として設定し、状態をリフレッシュします。
   * 新しい OneSDK コメントが含まれている場合は LorAnimationComment に変換して制御対象に追加します。
   * 前回に制御対象として指定した OneSDK コメントが含まれている場合は、変換済みの LorAnimationComment をそのまま使用します。
   * @param {CommonData[]} oneComments 制御対象にする OneSDK コメントの配列。
   */
  refresh(oneComments) {
    this.#stopTypingAnimation();

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
}

/** @type {LorAnimator} LoR 風アニメーションの制御オブジェクト */
const animator = new LorAnimator();

const app = Vue.createApp({
  setup() {
    document.body.removeAttribute("hidden");
  },
  data() {
    return {
      comments: [],
    };
  },
  methods: {
    /**
     * 指定した LoR 風コメントのコメントブロックに設定するクラス名を取得します。
     * @param {LorAnimationComment} comment クラス名を取得する対象の LoR 風コメント。
     * @returns {string} コメントブロックに対して設定するクラス名。
     */
    getClassName(comment) {
      return comment.commentIndex % 2 === 0 ? "comment even" : "comment odd";
    },
    /**
     * 指定した LoR 風コメントのコメントブロックに適用するスタイル情報を取得します。
     * @param {LorAnimationComment} comment スタイル情報を取得する対象の LoR 風コメント。
     * @returns {string} コメントブロックに対して適用するスタイル情報。
     */
    getStyle(comment) {
      return comment.style + OneSDK.getCommentStyle(comment);
    },
  },
  mounted() {
    let cache = new Map();
    let commentIndex = 0;
    OneSDK.setup({
      jsonPath: JSON_PATH,
      commentLimit: LIMIT,
    });
    OneSDK.subscribe({
      action: "comments",
      /**
       * 配信プラットフォームでコメントを受け取った時に呼び出されます。
       * @param {CommonData[]} comments 最新 LIMIT 件までの OneSDK コメントの配列。
       */
      callback: (comments) => {
        const newCache = new Map();
        comments.forEach((comment) => {
          const index = cache.get(comment.data.id);
          if (isNaN(index)) {
            comment.commentIndex = commentIndex;
            newCache.set(comment.data.id, commentIndex);
            ++commentIndex;
          } else {
            comment.commentIndex = index;
            newCache.set(comment.data.id, index);
          }
        });
        cache = newCache;

        animator.refresh(comments);
        this.comments = animator.comments;
      },
    });
    OneSDK.connect();
  },
});
OneSDK.ready().then(() => {
  app.mount("#container");
});
