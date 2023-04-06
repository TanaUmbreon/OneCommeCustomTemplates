const JSON_PATH = '../../comment.json';

/** @type {number} 画面に表示するコメントの最大数 */
const LIMIT = 5;

/** @type {number} コメントの回転角度の最小値[度] */
const COMMENT_ROTATE_MIN = -30;
/** @type {number} コメントの回転角度の最大値[度] */
const COMMENT_ROTATE_MAX = 30;
/** @type {number} コメントを表示する位置の最小値[vw, vh] */
const COMMENT_OFFSET_MIN = 5;
/** @type {number} コメントを表示する位置の最大値[vw, vh] */
const COMMENT_OFFSET_MAX = 50;
/** @type {number} コメントの次の文字を表示する間隔[ミリ秒] */
const DELAY_MILLISECONDS = 150;

/** @type {number} コメントが完全に表示されてからフェードアウトが始まるまでの時間[ミリ秒] */
const COMMENT_DISPLAY_MILLISECONDS = 10000;

/**
 * @typedef {object} OneComment
 * @property {*}
 */

/**
 * 要素の配置位置を表します。
 */
class Position {
  /** @type {Position} 上方向 */
  static #top = new Position("top");
  /** @type {Position} 上方向 */
  static get TOP() { return this.#top; }

  /** @type {Position} 下方向 */
  static #bottom = new Position("bottom");
  /** @type {Position} 下方向 */
  static get BOTTOM() { return this.#bottom; }

  /** @type {Position} 左方向 */
  static #left = new Position("left");
  /** @type {Position} 左方向 */
  static get LEFT() { return this.#left; }

  /** @type {Position} 右方向 */
  static #right = new Position("right");
  /** @type {Position} 右方向 */
  static get RIGHT() { return this.#right; }

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

/**
 * 疑似乱数の生成および疑似乱数を使用した操作を提供します。
 */
class Random {
  /**
   * min 以上 max 以下の範囲で整数の疑似乱数を生成して返します。
   * @param {number} min 疑似乱数の最低値。この数値を含む値。
   * @param {number} max 疑似乱数の最大値。この数値を含む値。
   * @returns {number} min 以上 max 以下のランダムな整数。
   */
  static nextInt(min, max) {
    const minInt = Math.floor(min);
    const maxInt = Math.floor(max);
    return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
  }

  /**
   * 指定した要素からランダムに一つ選択して返します。
   * @param {any[]} items 選択の候補となる要素。この引数は可変長引数です。
   * @returns {any} items からランダムに一つ選択した要素。items の要素が空の場合は null。
   */
  static selectOne(...items) {
    if (items.length == 0) { return null; }
    return items[Math.floor(Math.random() * items.length)];
  }
}

/**
 * LoR (Library of Ruina) 風アニメーションを行うコメント本文の単一の文字を表します。
 */
class LorAnimationChar {
  /** @type {string} フロント側の文字の span 要素を特定する ID 名 */
  #frontId;
  /** @type {string} 影側の文字の span 要素を特定する ID 名 */
  #shadowId;

  /** @type {boolean} この文字をアクティブ化してタイピングアニメーションを行った事を示す値 */
  #hasActivated;
  /** @type {boolean} この文字をアクティブ化してタイピングアニメーションを行った事を示す値 */
  get hasActivated() { return this.#hasActivated; }

  /**
   * LorTypingChar のインスタンスを生成します。
   * @param {string} frontId フロント側の文字の span 要素を特定する ID 名
   * @param {string} shadowId 影側の文字の span 要素を特定する ID 名
   */
  constructor(frontId, shadowId) {
    this.#frontId = frontId;
    this.#shadowId = shadowId;
    this.#hasActivated = false;
  }

  /**
   * この文字をアクティブ化して、タイピングアニメーションを行います。
   */
  activate() {
    document.getElementById(this.#frontId)?.classList.add("is-active");
    document.getElementById(this.#shadowId)?.classList.add("is-active");
    this.#hasActivated = true;
  }
}

/**
 * LoR (Library of Ruina) 風アニメーションを行う単一のコメントを表します。OneSDK のコメントと後方互換を持たせています。
 */
class LorAnimationComment {
  // Memo:
  //   このインスタンスをVueのバインディングデータとして設定し、Vueのv-forやメソッドの引数として渡すようにしている。
  //   この時インスタンスがProxyに置き換わり、インスタンスメンバーを間接的に参照するようになる。
  //   参照できるインスタンスメンバーにゲッターが含まれていないため注意が必要。
  //   参照したいインスタンスメンバーは、読み取り専用であってもプロパティとして定義する。

  /** @type {string} 配信プラットフォームのサービス名 */
  service;
  /** @type {string} コメント発信サービス ID */
  id;
  /** @type {string} コメント発信サービス名 */
  name;
  /** @type {number} コメントのインデックス番号 */
  commentIndex;
  /** @type {any} コメントの本体データ */
  data;
  /** @type {string} コメントブロックに適用するスタイル情報 */
  style;
  /** @type {string} コメント本文として使用する HTML ソースコード */
  html;
  /** @type {LorAnimationChar[]} LoR 風アニメーションを行うコメント文字のリスト */
  #characters;

  /** @type {LorAnimationChar[]} LoR 風アニメーションを行うコメント文字のリスト */
  get characters() { return this.#characters; }

  /**
   * 指定した OneSDK のコメントから LorAnimationComment のインスタンスを生成します。
   * @param {any} oneComment OneSDK のコメント。
   */
  constructor(oneComment) {
    this.service = oneComment.service;
    this.id = oneComment.id;
    this.name = oneComment.name;
    this.commentIndex = oneComment.commentIndex;
    this.data = oneComment.data;
    this.style = LorAnimationComment.#buildStyle();
    this.html = oneComment.data.comment;
    this.#characters = [];

    //let front = "";
    //let shadow = "";
    ///** @type {string} */
    //const commentId = comment.data.id;
    //const isGift = LorAnimationComment.#isGiftStickerComment(oneComment);
    //if (isGift) {
    //  const frontId = `${commentId}-front`;
//
    //  this.#characters.push(new LorAnimationChar(frontId));
//
    //  front += `<span id="${frontId}" class=${comment.data.comment}`;
    //} else {
    //  for (var i = 0; i < sourceText.length; i++) {
    //    const frontId = `${commentId}-${i}-front`;
    //    const shadowId = `${commentId}-${i}-shadow`;
//
    //    //this.#typingCharList[i] = new LorTypingChar(frontId, shadowId);
    //    
    //    const char = escape(sourceText.charAt(i));
    //    front += `<span id="${frontId}" class="typing-front" aria-hidden="true">${char}</span>`;
    //    shadow += `<span id="${shadowId}" id class="typing-shadow" aria-hidden="true">${char}</span>`;
    //  }
    //}
    //this.#html = `<div class="comment-text-front" aria-hidden="true">${front}</div>${shadow}`;
  }

  /**
   * コメントブロックに適用するスタイル情報を構築して返します。
   * @returns {string} コメントブロックに適用するスタイル情報。
   */
  static #buildStyle() {
    const rotate = Random.nextInt(COMMENT_ROTATE_MIN, COMMENT_ROTATE_MAX);
    const virtical = Random.selectOne(Position.TOP, Position.BOTTOM);
    const virticalOffset = Random.nextInt(COMMENT_OFFSET_MIN, COMMENT_OFFSET_MAX);
    const horizontal = Random.selectOne(Position.LEFT, Position.RIGHT);
    const horizontalOffset = Random.nextInt(COMMENT_OFFSET_MIN, COMMENT_OFFSET_MAX);

    return `position: absolute; ` +
           `transform: rotate(${rotate}deg); ` +
           `${virtical.getCssPropertyName()}: ${virticalOffset}vh; ` +
           `${horizontal.getCssPropertyName()}: ${horizontalOffset}vw; `;
  }

  /**
   * 指定した OneSDK のコメントが画像データで構成されたギフトステッカーであることを判定します。
   * @param {any} oneComment OneSDK のコメント。
   * @returns {boolean} ギフトステッカーの場合は true、そうでない場合は false。
   */
  static #isGiftStickerComment(oneComment) {
    /** @type {string} */
    const text = oneComment.data.comment;

    return text.startsWith("<img ") && text.includes(`class="gift-image gift-sticker"`);
  }

  /**
   * 指定した OneSDK のコメントからコメント文字のリストを構築して返します。
   * @param {any} oneComment OneSDK のコメント。
   * @returns {LorAnimationChar[]}
   */
  static #buildCharacters(oneComment) {
    /** @type {string} */
    const commentId = oneComment.data.id;

    if (LorAnimationComment.#isGiftStickerComment(oneComment)) {
      return [new LorAnimationChar()];
    }


  }
}

///**
// * 単一の Library of Ruina (LoR) 風コメントを表します。
// */
//class _LorComment {
//  /** @type {number} コメントの回転角度[度] */
//  #rotate;
//  /** @type {Position} 垂直方向のコメント表示位置 */
//  #virtical;
//  /** @type {number} 垂直方向のコメント表示位置からのオフセット[vw] */
//  #virticalOffset;
//  /** @type {Position} 水平方向のコメント表示位置 */
//  #horizontal;
//  /** @type {number} 水平方向のコメント表示位置からのオフセット[vw] */
//  #horizontalOffset;
//
//  /** @type {LorAnimationChar[]} アニメーションを行う文字のリスト */
//  #charList;
//  /** @type {LorAnimationChar[]} アニメーションを行う文字のリスト */
//  get charList() { return this.#charList; }
//
//  /** @type {LorTypingChar[]} タイピングアニメーションを行う文字のリスト */
//  #typingCharList;
//  /** @type {LorTypingChar[]} タイピングアニメーションを行う文字のリスト */
//  get typingCharList() { return this.#typingCharList; }
//
//  /** @type {string} コメント全体に適用するスタイル情報 */
//  #style;
//  /** @type {string} コメント全体に適用するスタイル情報 */
//  get style() { return this.#style; }
//
//  /** @type {string} コメント本文として使用する HTML ソースコード */
//  #html;
//  /** @type {string} コメント本文として使用する HTML ソースコード */
//  get html() { return this.#html; }
//
//  /**
//   * LorComment のインスタンスを生成します。
//   * @param {*} comment OneSDK で作成されたコメントオブジェクト。
//   */
//  constructor(comment) {
//    this.#rotate = this.#nextInt(COMMENT_ROTATE_MIN, COMMENT_ROTATE_MAX);
//    this.#virtical = this.#selectOne(Position.TOP, Position.BOTTOM);
//    this.#virticalOffset = this.#nextInt(COMMENT_OFFSET_MIN, COMMENT_OFFSET_MAX);
//    this.#horizontal = this.#selectOne(Position.LEFT, Position.RIGHT);
//    this.#horizontalOffset = this.#nextInt(COMMENT_OFFSET_MIN, COMMENT_OFFSET_MAX);
//
//    this.#style =
//      `position: absolute; ` +
//      `transform: rotate(${this.#rotate}deg); ` +
//      `${this.#virtical.getCssPropertyName()}: ${this.#virticalOffset}vh; ` +
//      `${this.#horizontal.getCssPropertyName()}: ${this.#horizontalOffset}vw; `;
//
//    let sourceText = comment.data.comment;
//    let commentId = comment.data.id;
//
//    this.#typingCharList = new Array(sourceText.length);
//
//    let front = "";
//    let shadow = "";
//    for (var i = 0; i < sourceText.length; i++) {
//      let frontId = `${commentId}-${i}-front`;
//      let shadowId = `${commentId}-${i}-shadow`;
//
//      this.#typingCharList[i] = new LorTypingChar(frontId, shadowId);
//
//      let char = this.#escape(sourceText.charAt(i));
//      front += `<span id="${frontId}" class="typing-front" aria-hidden="true">${char}</span>`;
//      shadow += `<span id="${shadowId}" id class="typing-shadow" aria-hidden="true">${char}</span>`;
//    }
//
//    this.#html = `<div class="comment-text-front" aria-hidden="true">${front}</div>${shadow}`;
//  }
//
//  /**
//   * min 以上 max 以下の範囲で整数の疑似乱数を生成して返します。
//   * @param {number} min 疑似乱数の最低値。この数値を含む値。
//   * @param {number} max 疑似乱数の最大値。この数値を含む値。
//   * @returns min 以上 max 以下のランダムな整数。
//   */
//  #nextInt(min, max) {
//    const MIN_INT = Math.floor(min);
//    const MAX_INT = Math.floor(max);
//    return Math.floor(Math.random() * (MAX_INT - MIN_INT + 1)) + MIN_INT;
//  }
//
//  /**
//   * 指定した要素からランダムに一つ選択して返します。
//   * @param {any[]} items 選択の候補となる要素。この引数は可変長引数です。
//   * @returns {any} items からランダムに一つ選択した要素。items の要素が空の場合は null。
//   */
//  #selectOne(...items) {
//    if (items.length == 0) { return null; }
//    return items[this.#nextInt(0, items.length - 1)];
//  }
//
//  /**
//   * 指定した文字列に含まれる HTML の特殊文字 (&, <, >, ", ', 半角スペース) を参照文字にエスケープして返します。
//   * @param {string} string エスケープ対象の文字列。
//   * @returns 特殊文字を参照文字にエスケープされた文字列。
//   */
//  #escape = string =>
//    string
//      .replace("&", "&lt;")
//      .replace("<", "&lt;")
//      .replace(">", "&gt;")
//      .replace('"', "&quot;")
//      .replace("'", "&#x27;")
//      .replace(" ", "&nbsp;");
//}

/**
 * LoRL (ibrary of Ruina) 風アニメーションを制御します。
 */
class LorAnimator {
  /** @type {Map<number, LorAnimationComment>} OneSDK コメントの ID と、それに対応する制御対象の  LoR 風アニメーションコメントを関連付けたマップ */
  #commentMap;
  /** @type {LorAnimationComment[]} 制御対象の LoR 風アニメーションコメントのリスト */
  #commentList;
  /** @type {LorAnimationChar[]} タイピングアニメーションさせるコメント文字を表示順に列挙させたキュー */
  #typingQueue;
  /** @type {number?} タイピングアニメーションの制御に使うタイマー (setInterval) 関数の識別子。値が null の場合はタイマーが動作していない状態を表します */
  #typingTimerId;

  /** @type {LorAnimationComment[]} 制御対象の LoR 風アニメーションコメントのリスト */
  get comments() { return this.#commentList; }

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
   * @param {any[]} oneComments 制御対象にする OneSDK コメントの配列。
   */
  refresh(oneComments) {
    this.#stopAnimation();

    const oldMap = this.#commentMap;
    this.#commentMap = new Map();
    this.#commentList = [];
    this.#typingQueue = [];

    oneComments.forEach(oneComment => {
      const id = oneComment.data.id;
      const targetComment = oldMap.get(id) ?? new LorAnimationComment(oneComment);
      this.#commentMap.set(id, targetComment);
      this.#commentList.push(targetComment);
      this.#typingQueue.push(...targetComment.characters.filter(c => !c.hasActivatedTyping));
    });

    this.#startAnimation();
  }

  /**
   * アニメーションを開始します。
   */
  #startAnimation() {
    if (this.#typingTimerId == null) {
      this.#typingTimerId = setInterval(() => {
        if (this.#typingQueue.length == 0) {
          this.#stopAnimation();
          return;
        }
    
        const char = this.#typingQueue.shift();
        if (char == undefined) { return; }
        char.activateTyping();
      }, DELAY_MILLISECONDS);
    }
  }

  /**
   * アニメーションを停止します。
   */
  #stopAnimation() {
    if (this.#typingTimerId != null) {
      clearInterval(this.#typingTimerId);
      this.#typingTimerId = null;
    }
  }
}

/** @type {LorAnimator} LoR 風アニメーションの制御オブジェクト */
const animator = new LorAnimator();

const app = Vue.createApp({
  setup() {
    document.body.removeAttribute('hidden')
  },
  data() {
    return {
      comments: []
    }
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
    /**
     * 指定した LoR 風コメントのコメント本文として使用する HTML ソースコードを取得します。
     * @param {LorAnimationComment} comment HTML ソースコードを取得する対象の LoR 風コメント。
     * @returns {string} コメント本文として使用する HTML ソースコード。
     */
    getCommentTextHtml(comment) {
      return comment.html ?? comment.data.comment;
    }
  },
  mounted() {
    let cache = new Map()
    commentIndex = 0
    OneSDK.setup({
      jsonPath: JSON_PATH,
      commentLimit: LIMIT
    })
    OneSDK.subscribe({
      action: 'comments',
      /**
       * 配信プラットフォームでコメントを受け取った時に呼び出されます。
       * @param {any[]} comments 最新 LIMIT 件までの OneSDK コメントの配列。
       */
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

        animator.refresh(comments);
        this.comments = animator.comments;
      }
    })
    OneSDK.connect()
  },
})
OneSDK.ready().then(() => {
  app.mount("#container");
})
