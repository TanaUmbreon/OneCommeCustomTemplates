import { LorAnimator } from "../__modules/LorAnimator.js";

/** @typedef {import("../__types/onesdk").BaseComment} BaseComment */
/** @typedef {import("../__types/onesdk").CommonData} CommonData */
/** @typedef {import("../__modules/LorAnimationComment").LorAnimationComment} LorAnimationComment */

const JSON_PATH = "../../comment.json";

/** @type {number} 画面に表示するコメントの最大数 */
const LIMIT = 10;

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
      let className = comment.commentIndex % 2 === 0 ? "comment even" : "comment odd";
      if (comment.hasDeactivated) {
        className += " is-deactive";
      }
      return className;
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
