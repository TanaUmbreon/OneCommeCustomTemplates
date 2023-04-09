// OneSDK コメントの型定義
// 【参考】https://onecomme.com/docs/developer/comment-json
/**
 * @typedef {object} BaseComment OneSDK コメントの共通情報
 * @property {string} id コメント ID
 * @property {string} userId 配信サイトでのユーザー識別 ID(匿名の場合もあるため保障されない)
 * @property {string} liveId 配信識別子
 * @property {string} name ユーザー名(コメント投稿者名)
 * @property {boolean} isFirstTime 接続開始してから最初のコメントを表す値
 * @property {boolean} isOwner 配信者自身を表す値
 * @property {string?} displayName 表示ユーザー名(わんコメで文字数カットされたユーザー名)
 * @property {boolean} hasGift ギフトデータを持っていることを表す値
 * @property {string} profileImage プロフィールアイコン URL(名前アイコンに置き換えられることがある)
 * @property {string} originalProfileImage オリジナルのプロフィールアイコン URL
 * @property {string} comment コメント本文(HTML はエスケープ・画像はimgタグになっている)
 */
/**
 * @typedef {object} CommonData OneSDK で扱う、配信サービスに投稿された単一のコメントを表します。
 * @property {string} id 視聴枠を識別するための ID
 * @property {string} service 配信サイト識別子
 * @property {string} name わんコメで視聴枠につけた任意の名前
 * @property {string} url 視聴 URL
 * @property {BaseComment} data コメントの共通情報
 * @property {number} commentIndex コメントのインデックス番号
 */

const JSON_PATH = "../../comment.json";

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

/** @type {string} コメントの文字が表示状態になっていることを表すクラス名 */
const IS_ACTIVE = "is-active";

/** @type {number} コメントが完全に表示されてからフェードアウトが始まるまでの時間[ミリ秒] */
const COMMENT_DISPLAY_MILLISECONDS = 10000;

/**
 * 要素の配置位置を表します。
 */
class Position {
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
    if (items.length == 0) {
      return null;
    }
    return items[Math.floor(Math.random() * items.length)];
  }
}

/**
 * LoR (Library Of Ruina) 風アニメーションを行うコメント本文の単一の文字を表します。
 */
class LorAnimationChar {
  /** @type {string} フロント側の文字の span 要素を特定する ID 名 */
  #frontId;
  /** @type {string} フロント側の文字の span 要素を特定する ID 名 */
  get frontId() {
    return this.#frontId;
  }

  /** @type {string} 影側の文字の span 要素を特定する ID 名 */
  #shadowId;
  /** @type {string} 影側の文字の span 要素を特定する ID 名 */
  get shadowId() {
    return this.#shadowId;
  }

  /** @type {string} 文字を表す HTML 要素のコンテンツ */
  #content;
  /** @type {string} 文字を表す HTML 要素のコンテンツ */
  get content() {
    return this.#content;
  }

  /** @type {boolean} この文字をアクティブ化してタイピングアニメーションを行った事を示す値 */
  #hasActivated;
  /** @type {boolean} この文字をアクティブ化してタイピングアニメーションを行った事を示す値 */
  get hasActivated() {
    return this.#hasActivated;
  }

  /**
   * LorTypingChar のインスタンスを生成します。
   * @param {string} frontId フロント側の文字の span 要素を特定する ID 名
   * @param {string} shadowId 影側の文字の span 要素を特定する ID 名
   * @param {string} content 文字を表す HTML 要素のコンテンツ
   */
  constructor(frontId, shadowId, content) {
    this.#frontId = frontId;
    this.#shadowId = shadowId;
    this.#content = content;
    this.#hasActivated = false;
  }

  /**
   * この文字をアクティブ化して、タイピングアニメーションを行います。
   */
  activate() {
    if (this.#hasActivated) {
      return;
    }

    document.getElementById(this.#frontId)?.classList.add(IS_ACTIVE);
    document.getElementById(this.#shadowId)?.classList.add(IS_ACTIVE);
    this.#hasActivated = true;
  }
}

/**
 * LoR (Library Of Ruina) 風アニメーションを行う単一のコメントを表します。
 * OneSDK コメントの一部プロパティと互換性を持ちます。
 */
class LorAnimationComment {
  // Memo:
  //   このインスタンスをVueのバインディングデータとして設定し、Vueのv-forやメソッドの引数として渡すようにしている。
  //   この時インスタンスがProxyに置き換わり、インスタンスメンバーを間接的に参照するようになる。
  //   この状態でのthisはプライベートメンバーを参照できず、外部に対して読み取り専用な実装にできないので注意。
  //   書き込み可能なパブリックフィールドで妥協すること。

  /** @type {string} 視聴枠を識別するための ID */
  id;
  /** @type {string} 配信サイト識別子 */
  service;
  /** @type {string} わんコメで視聴枠につけた任意の名前 */
  name;
  /** @type {BaseComment} コメントの共通情報 */
  data;
  /** @type {number} コメントのインデックス番号 */
  commentIndex;
  /** @type {string} コメントブロックに適用するスタイル情報 */
  style;
  /** @type {string} アニメーション表示のコメント本文として使用する HTML ソースコード */
  animationContent;
  /** @type {string} 読み上げ用のコメント本文として使用する HTML ソースコード */
  speechContent;
  /** @type {boolean} 画像データで構成されたギフトステッカーである事を示す値 */
  #isGiftSticker;

  /** @type {LorAnimationChar[]} LoR 風アニメーションを行うコメント文字のリスト */
  #characters;
  /** @type {LorAnimationChar[]} LoR 風アニメーションを行うコメント文字のリスト */
  get characters() {
    return this.#characters;
  }

  /**
   * 指定した OneSDK コメントから LorAnimationComment のインスタンスを生成します。
   * @param {CommonData} oneComment OneSDK コメント。
   */
  constructor(oneComment) {
    this.id = oneComment.id;
    this.service = oneComment.service;
    this.name = oneComment.name;
    this.data = oneComment.data;
    this.commentIndex = oneComment.commentIndex;

    this.style = this.#buildStyle();
    this.animationContent = "";
    this.#isGiftSticker = this.#isGiftStickerComment(oneComment);

    this.speechContent = this.#isGiftSticker
      ? oneComment.data.comment
      : html.escape(oneComment.data.comment);
    this.#characters = this.#isGiftSticker
      ? this.#buildCharactersAsGiftSticker(oneComment)
      : this.#buildCharacters(oneComment);
  }

  /**
   * 現在の状態に基づいて HTML ソースコードをリフレッシュします。
   */
  refreshContent() {
    this.animationContent = "";

    if (this.#isGiftSticker) {
      this.#characters.forEach((c) => {
        this.animationContent += `<span id="${c.frontId}">${c.content}</span>`;
      });
      return;
    }

    let front = "";
    let shadow = "";
    this.#characters.forEach((c) => {
      const isActive = c.hasActivated ? " " + IS_ACTIVE : "";
      front += `<span id="${c.frontId}" class="typing-front${isActive}">${c.content}</span>`;
      shadow += `<span id="${c.shadowId}" class="typing-shadow${isActive}">${c.content}</span>`;
    });
    this.animationContent = `<div class="comment-text-front">${front}</div>${shadow}</div>`;
  }

  /**
   * コメントブロックに適用するスタイル情報を構築して返します。
   * @returns {string} コメントブロックに適用するスタイル情報。
   */
  #buildStyle() {
    const rotate = Random.nextInt(COMMENT_ROTATE_MIN, COMMENT_ROTATE_MAX);
    const virtical = Random.selectOne(Position.TOP, Position.BOTTOM);
    const virticalOffset = Random.nextInt(COMMENT_OFFSET_MIN, COMMENT_OFFSET_MAX);
    const horizontal = Random.selectOne(Position.LEFT, Position.RIGHT);
    const horizontalOffset = Random.nextInt(COMMENT_OFFSET_MIN, COMMENT_OFFSET_MAX);

    return (
      `position: absolute; ` +
      `transform: rotate(${rotate}deg); ` +
      `${virtical.getCssPropertyName()}: ${virticalOffset}vh; ` +
      `${horizontal.getCssPropertyName()}: ${horizontalOffset}vw; `
    );
  }

  /**
   * 指定した OneSDK コメントが画像データで構成されたギフトステッカーである事を判定します。
   * @param {CommonData} oneComment OneSDK コメント。
   * @returns {boolean} ギフトステッカーの場合は true、そうでない場合は false。
   */
  #isGiftStickerComment(oneComment) {
    const text = oneComment.data.comment;

    return text.startsWith("<img ") && text.includes(`class="gift-image gift-sticker"`);
  }

  /**
   * 指定した OneSDK コメントからコメント文字のリストを構築して返します。
   * @param {CommonData} oneComment OneSDK コメント。
   * @returns {LorAnimationChar[]} コメント文字のリスト。
   */
  #buildCharacters(oneComment) {
    /** @type {LorAnimationChar[]} */
    const characters = [];
    const commentId = oneComment.data.id;
    const comment = oneComment.data.comment;

    for (let i = 0; i < comment.length; i++) {
      const content = html.escape(comment.charAt(i));
      characters.push(new LorAnimationChar(`${commentId}-${i}-front`, `${commentId}-${i}-shadow`, content));
    }

    return characters;
  }

  /**
   * 指定した OneSDK コメントからギフトステッカーとしてコメント文字のリストを構築して返します。
   * @param {CommonData} oneComment OneSDK コメント。
   * @returns {LorAnimationChar[]} コメント文字のリスト。
   */
  #buildCharactersAsGiftSticker(oneComment) {
    return [new LorAnimationChar(oneComment.data.id, "", oneComment.data.comment)];
  }
}

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
      this.#typingQueue.push(...lorComment.characters.filter(c => !c.hasActivated));
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