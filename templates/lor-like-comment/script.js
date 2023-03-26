const JSON_PATH = '../../comment.json';

/** @type {number} 画面に表示するコメントの最大数 */
const LIMIT = 5;

/** @type {number} コメントが完全に表示されてからフェードアウトが始まるまでの時間[ミリ秒] */
const COMMENT_DISPLAY_MILLISECONDS = 10000;

/** @type {number} コメントの回転角度の最小値[度] */
const COMMENT_ROTATE_MIN = -30;
/** @type {number} コメントの回転角度の最大値[度] */
const COMMENT_ROTATE_MAX = 30;
/** @type {number} コメントを表示する位置の最小値[vw, vh] */
const COMMENT_OFFSET_MIN = 0;
/** @type {number} コメントを表示する位置の最大値[vw, vh] */
const COMMENT_OFFSET_MAX = 50;
/** @type {number} コメントの次の文字を表示する間隔[ミリ秒] */
const DELAY_MILLISECONDS = 150;

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
 * Library of Ruina (LoR) 風コメントのタイピングアニメーションを行う文字を表します。
 */
class LorTypingChar {
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
 * 単一の Library of Ruina (LoR) 風コメントを表します。
 */
class LorComment {
  /** @type {number} コメントの回転角度[度] */
  #rotate;
  /** @type {Position} 垂直方向のコメント表示位置 */
  #virtical;
  /** @type {number} 垂直方向のコメント表示位置からのオフセット[vw] */
  #virticalOffset;
  /** @type {Position} 水平方向のコメント表示位置 */
  #horizontal;
  /** @type {number} 水平方向のコメント表示位置からのオフセット[vw] */
  #horizontalOffset;

  /** @type {LorTypingChar[]} タイピングアニメーションを行う文字のリスト */
  #typingCharList;
  /** @type {LorTypingChar[]} タイピングアニメーションを行う文字のリスト */
  get typingCharList() { return this.#typingCharList; }

  /** @type {string} コメント全体に適用するスタイル情報 */
  #style;
  /** @type {string} コメント全体に適用するスタイル情報 */
  get style() { return this.#style; }

  /** @type {string} コメント本文として使用する HTML ソースコード */
  #html;
  /** @type {string} コメント本文として使用する HTML ソースコード */
  get html() { return this.#html; }

  /**
   * LorComment のインスタンスを生成します。
   * @param {*} comment OneSDK で作成されたコメントオブジェクト。
   */
  constructor(comment) {
    this.#rotate = this.#nextInt(COMMENT_ROTATE_MIN, COMMENT_ROTATE_MAX);
    this.#virtical = this.#selectOne(Position.TOP, Position.BOTTOM);
    this.#virticalOffset = this.#nextInt(COMMENT_OFFSET_MIN, COMMENT_OFFSET_MAX);
    this.#horizontal = this.#selectOne(Position.LEFT, Position.RIGHT);
    this.#horizontalOffset = this.#nextInt(COMMENT_OFFSET_MIN, COMMENT_OFFSET_MAX);

    this.#style =
      `position: absolute; ` +
      `transform: rotate(${this.#rotate}deg); ` +
      `${this.#virtical.getCssPropertyName()}: ${this.#virticalOffset}vh; ` +
      `${this.#horizontal.getCssPropertyName()}: ${this.#horizontalOffset}vw; `;

    let sourceText = comment.data.comment;
    let commentId = comment.data.id;

    this.#typingCharList = new Array(sourceText.length);

    let front = "";
    let shadow = "";
    for (var i = 0; i < sourceText.length; i++) {
      let frontId = `${commentId}-${i}-front`;
      let shadowId = `${commentId}-${i}-shadow`;

      this.#typingCharList[i] = new LorTypingChar(frontId, shadowId);

      let char = this.#escape(sourceText.charAt(i));
      front += `<span id="${frontId}" class="typing-front" aria-hidden="true">${char}</span>`;
      shadow += `<span id="${shadowId}" id class="typing-shadow" aria-hidden="true">${char}</span>`;
    }

    this.#html = `<div class="comment-text-front" aria-hidden="true">${front}</div>${shadow}`;
  }

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
   * 指定した要素からランダムに一つ選択して返します。
   * @param {any[]} items 選択の候補となる要素。この引数は可変長引数です。
   * @returns {any} items からランダムに一つ選択した要素。items の要素が空の場合は null。
   */
  #selectOne(...items) {
    if (items.length == 0) { return null; }
    return items[this.#nextInt(0, items.length - 1)];
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

/**
 * Library of Ruina (LoR) 風コメントのアニメーションを制御します。
 */
class LorCommentAnimator {
  /** @type {Map<number, LorComment>} OneSDK コメントの ID とそれに対応する LoR 風コメントを関連付けたマップ */
  #commentMap;

  /** @type {LorTypingChar[]} タイピングアニメーションさせる文字を表示順に列挙させたキュー */
  #typingCharQueue;
  /** @type {number?} タイピングアニメーションの制御に使うタイマー (setInterval) 関数の識別子。値が null の場合はタイマーが動作していない状態を表します */
  #typingTimerId;

  /**
   * LorCommentAnimator のインスタンスを生成します。
   */
  constructor() {
    this.#commentMap = new Map();
    this.#typingCharQueue = [];
    this.#typingTimerId = null;
  }

  /**
   * 指定した OneSDK を元に生成された LoR 風コメントを取得します。
   * @param {any} oneComment OneSDK コメント
   * @returns {LorComment?} 指定した oneComment を元に生成された LoR 風コメントが制御対象であればそのインスタンス。そうでなければ null。
   */
  getComment(oneComment) {
    return this.#commentMap.get(oneComment.data.id) ?? null;
  }

  /**
   * 指定した OneSDK コメントの配列でアニメーションの制御対象をリフレッシュします。
   * @param {any[]} oneComments 
   */
  refresh(oneComments) {
    this.#stopAnimation();

    let oldMap = this.#commentMap;
    this.#commentMap = new Map();
    this.#typingCharQueue = [];

    oneComments.forEach(oneComment => {
      let id = oneComment.data.id;
      let comment = oldMap.get(id) ?? new LorComment(oneComment);
      this.#commentMap.set(id, comment);
      this.#typingCharQueue.push(...comment.typingCharList.filter(c => !c.hasActivated));
    });

    this.#startAnimation();
  }

  /**
   * アニメーションを開始します。
   */
  #startAnimation() {
    if (this.#typingTimerId == null) {
      this.#typingTimerId = setInterval(() => {
        if (this.#typingCharQueue.length == 0) {
          this.#stopAnimation();
          return;
        }
    
        let char = this.#typingCharQueue.shift();
        if (char == undefined) { return; }
        char.activate();
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

/** @type {LorCommentAnimator} LoR 風コメントのアニメーション制御オブジェクト */
const animator = new LorCommentAnimator();

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
    getClassName(comment) {
      return comment.commentIndex % 2 === 0 ? "comment even" : "comment odd";
    },
    getStyle(comment) {
      let style = animator.getComment(comment)?.style ?? "";
      return style + OneSDK.getCommentStyle(comment);
    },
    getCommentTextHtml(comment) {
      return animator.getComment(comment)?.html ?? comment.data.comment;
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

        animator.refresh(comments);
      }
    })
    OneSDK.connect()
  },
})
OneSDK.ready().then(() => {
  app.mount("#container");
})
