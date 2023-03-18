const JSON_PATH = '../../comment.json';

/** 画面に表示するコメントの最大数 */
const LIMIT = 20;

/** @type {number} コメントの回転角度の最小値[度] */
const COMMENT_ROTATE_MIN = -30;
/** @type {number} コメントの回転角度の最大値[度] */
const COMMENT_ROTATE_MAX = 30;
/** @type {number} コメントを表示する位置の最小値[vw, vh] */
const COMMENT_OFFSET_MIN = 0;
/** @type {number} コメントを表示する位置の最大値[vw, vh] */
const COMMENT_OFFSET_MAX = 50;
/** コメントの次の文字を表示する間隔[ミリ秒] */
const DELAY_MILISECONDS = 150;

/**
 * 垂直方向の位置を表します。
 */
const VirtialPosition = Object.freeze({
  /** 上方向 */
  TOP: 0,
  /** 下方向 */
  BOTTOM: 1,
});

/**
 * 水平方向の位置を表します。
 */
const HorizontalPosition = Object.freeze({
  /** 左方向 */
  LEFT: 0,
  /** 右方向 */
  RIGHT: 1,
});

/** @type {Map<number, LorComment>} コメントIDとそれに対応する LoR 風コメントの状態を関連付けたマップ */
const lorCommentMap = new Map();

const app = Vue.createApp({
  setup() {
    document.body.removeAttribute('hidden')
  },
  data () {
    return {
      comments: []
    }
  },
  methods: {
    getClassName(comment) {
      if (comment.commentIndex % 2 === 0) {
        return 'comment even'
      }
      return 'comment odd'
    },
    getStyle(comment) {
      let id = comment.data.id;

      if (!lorCommentMap.has(id)) {
        lorCommentMap.set(id, new LorComment(comment));
      }

      let lor = lorCommentMap.get(id);
      return lor.getCommentStyle() + OneSDK.getCommentStyle(comment);
    },
    getCommentTextHtml(comment) {
      let id = comment.data.id;

      if (!lorCommentMap.has(id)) {
        lorCommentMap.set(id, new LorComment(comment));
      }

      let lor = lorCommentMap.get(id);
      return lor.getCommentTextHtml();
    }
  },
  mounted () {
    let cache = new Map()
    commentIndex = 0
    OneSDK.setup({
      jsonPath: JSON_PATH,
      commentLimit: LIMIT
    })
    OneSDK.subscribe({
      action: 'comments',
      callback: (comments) => {
        const newCache = new Map()
        comments.forEach(comment => {
          const index = cache.get(comment.data.id)
          if (isNaN(index)) {
            comment.commentIndex = commentIndex
            newCache.set(comment.data.id, commentIndex)
            ++commentIndex
          } else {
            comment.commentIndex = index
            newCache.set(comment.data.id, index)
          }
        })
        cache = newCache
        this.comments = comments

        lorCommentMap.forEach(value => {
          
        });
        let frontElements = document.getElementsByClassName("typing-animation-front");
        let shadowElements = document.getElementsByClassName("typing-animation-shadow");
        for (let i = 0; i < frontElements.length; i++) {
          frontElements[i].style.transitionDelay = (DELAY_MILISECONDS * i) + "ms";
          frontElements[i].classList.add("is-active");
        }
        for (let i = 0; i < shadowElements.length; i++) {
          shadowElements[i].style.transitionDelay = (DELAY_MILISECONDS * i) + "ms";
          shadowElements[i].classList.add("is-active");
        }
      }
    })
    OneSDK.connect()
  },
})
OneSDK.ready().then(() => {
  app.mount("#container");
})

/**
 * Library of Ruina 風コメントの状態を管理します。
 */
class LorComment {
  /** @type {number} コメントの回転角度[度] */
  #rotate;
  /** @type {VirtialPosition} 垂直方向のコメント表示位置の起点 */
  #virtical;
  /** @type {number} 垂直方向のコメント表示位置の起点からのオフセット[vw] */
  #virticalOffset;
  /** @type {HorizontalPosition} 水平方向のコメント表示位置の起点 */
  #horizontal;
  /** @type {number} 水平方向のコメント表示位置の起点からのオフセット[vw] */
  #horizontalOffset;
  /** @type {string} コメント全体に適用するスタイル情報 */
  #commentStyle;

  /** @type {Array<boolean>} 表示するコメント1文字ごとに、その文字が画面上に表示された事を示すフラグのリスト */
  #hasShownCharList;
  /** @type {string} HTML に構築済みのコメント本文 */
  #commentTextHtml;

  /**
   * LorComment のインスタンスを生成します。
   * @param {string} comment 表示するコメントの原文。HTML の特殊文字は参照文字にエスケープされます。
   */
  constructor(comment) {
    this.#rotate = this.#nextInt(COMMENT_ROTATE_MIN, COMMENT_ROTATE_MAX);
    this.#virtical = this.#nextInt(VirtialPosition.TOP, VirtialPosition.BOTTOM);
    this.#virticalOffset = this.#nextInt(COMMENT_OFFSET_MIN, COMMENT_OFFSET_MAX);
    this.#horizontal = this.#nextInt(HorizontalPosition.LEFT, HorizontalPosition.RIGHT);
    this.#horizontalOffset = this.#nextInt(COMMENT_OFFSET_MIN, COMMENT_OFFSET_MAX);

    this.#commentStyle =
      `transform: rotate(${this.#rotate}deg); ` +
      `position: absolute; ` +
      `${this.#virtical == VirtialPosition.BOTTOM ? "bottom" : "top"}: ${this.#virticalOffset}vh; ` +
      `${this.#horizontal == HorizontalPosition.RIGHT ? "right" : "left"}: ${this.#horizontalOffset}vw; `;

    let commentSource = comment.data.comment;
    
    this.#hasShownCharList = new Array(commentSource.length).fill(false);

    let front = "";
    let shadow = "";
    for (var i = 0; i < commentSource.length; i++) {
      front += `<span class="typing-animation-front" aria-hidden="true">${this.#escape(commentSource.charAt(i))}</span>`;
      shadow += `<span class="typing-animation-shadow" aria-hidden="true">${this.#escape(commentSource.charAt(i))}</span>`;
    }
    this.#commentTextHtml = `<div class="comment-text-front" aria-hidden="true">${front}</div>${shadow}`;
  }

  /**
   * コメント全体に適用するスタイル情報を取得します。
   * @returns {string}
   */
  getCommentStyle = () => this.#commentStyle;

  /**
   * HTML に構築済みのコメント本文を取得します。
   * @returns {string}
   */
  getCommentTextHtml = () => this.#commentTextHtml;

  /**
   * min 以上 max 以下の範囲で整数の疑似乱数を生成して返します。
   * @param {number} min 疑似乱数の最低値。この数値を含む値。
   * @param {number} max 疑似乱数の最大値。この数値を含む値。
   * @returns min 以上 max 以下のランダムな整数。
   */
  #nextInt(min, max) {
    const MIN_INT = Math.floor(min);
    const MAX_INT = Math.floor(max);
    return Math.floor(Math.random() * (MAX_INT - MIN_INT + 1)) + MIN_INT;
  }

  /**
   * 指定した文字列に含まれる HTML の特殊文字 (&, <, >, ", ', 半角スペース) を参照文字にエスケープして返します。
   * @param {string} string エスケープ対象の文字列。
   * @returns 特殊文字を参照文字にエスケープされた文字列。
   */
  #escape = string =>
    string
      .replace("&", "&lt;")
      .replace("<", "&lt;")
      .replace(">", "&gt;")
      .replace('"', "&quot;")
      .replace("'", "&#x27;")
      .replace(" ", "&nbsp;");
}
