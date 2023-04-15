/** @typedef {import("../types/onesdk").BaseComment} BaseComment */
/** @typedef {import("../types/onesdk").CommonData} CommonData */

//const runes = require("./runes");
import { Position } from "../__modules/Position.js";

/**
 * @callback escape 指定した文字列に含まれる HTML エンティティ (`&`, `<`, `>`, `"`, `'`) を参照文字にエスケープして返します。
 * @param {string} es エスケープする対象の文字列。
 * @return {string} エスケープされた es と同等の文字列。
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

/** @type {string} コメントの単一文字が表示状態になっている事を表すクラス名 */
const IS_ACTIVE_STYLE = "is-active";
/** @type {string} コメントの単一文字のブロックを表すクラス名 */
const TYPING_BLOCK_STYLE = "typing-block";
/** @type {string} 表示領域だけ確保して非表示にするコメントの単一文字を表すクラス名 */
const HIDDEN_STYLE = "hidden";

/** @type {number} コメントが完全に表示されてからフェードアウトが始まるまでの時間[ミリ秒] */
const COMMENT_DISPLAY_MILLISECONDS = 10000;

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
  /** @type {LorAnimationComment} このコメント文字が含まれるコメント */
  #owner;
  /** @type {LorAnimationComment} このコメント文字が含まれるコメント */
  get owner() {
    return this.#owner;
  }

  /** @type {string} コメント文字の要素を特定する ID 名 */
  #id;
  /** @type {string} コメント文字の要素を特定する ID 名 */
  get id() {
    return this.#id;
  }

  /** @type {string} コメント文字を表す HTML 要素のコンテンツ */
  #content;
  /** @type {string} コメント文字を表す HTML 要素のコンテンツ */
  get content() {
    return this.#content;
  }

  /** @type {boolean} 文字の代わりに img 要素を用いている事を示す値 */
  #isImage;
  /** @type {boolean} 文字の代わりに img 要素を用いている事を示す値 */
  get isImage() {
    return this.#isImage;
  }

  /** @type {boolean} この文字をアクティブ化してタイピングアニメーションを行った事を示す値 */
  #hasActivated;
  /** @type {boolean} この文字をアクティブ化してタイピングアニメーションを行った事を示す値 */
  get hasActivated() {
    return this.#hasActivated;
  }

  /**
   * LorTypingChar のインスタンスを生成します。
   * @param {LorAnimationComment} owner このコメント文字が含まれるコメント。
   * @param {string} id コメント文字の要素を特定する ID 名。
   * @param {string} content 文字を表す HTML 要素のコンテンツ。
   * @param {boolean} isImage 文字の代わりに img 要素を用いている事を示す値。
   */
  constructor(owner, id, content, isImage) {
    this.#owner = owner;
    this.#id = id;
    this.#content = content;
    this.#isImage = isImage;
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
    this.#owner.onActivated();
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
    this.#characters = this.#buildCharacters(oneComment);

    let content = "";
    this.#characters.forEach((c) => (content += c.content));
    this.animationContent = content;
    this.speechContent = content;
  }

  /**
   * 現在の状態に基づいて HTML ソースコードをリフレッシュします。
   */
  refreshContent() {
    let content = "";
    this.#characters.forEach((c) => {
      const isActiveStyle = c.hasActivated ? IS_ACTIVE_STYLE : "";
      const isImageStyle = c.isImage ? HIDDEN_STYLE : "";
      content += `<div id="${c.id}" class="${TYPING_BLOCK_STYLE} ${isActiveStyle}">` +
        `<span class="comment-text-front">${c.content}</span>` +
        `<span class="comment-text-shadow ${isImageStyle}">${c.content}</span>` +
        `</div>`;
    });
    this.animationContent = content;
  }

  /**
   * コメント文字が全て表示されてアクティブ状態になった時に呼び出されます。
   */
  onActivated() {

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
   * 指定した OneSDK コメントからコメント文字のリストを構築して返します。
   * @param {CommonData} oneComment OneSDK コメント。
   * @returns {LorAnimationChar[]} コメント文字のリスト。
   */
  #buildCharacters(oneComment) {
    /** @type {LorAnimationChar[]} */
    const lorCommentChars = [];

    /** @type {string[]} */
    let oneCommentChars = runes(oneComment.data.comment);
    let position = 0; // 変数charactersに対する文字の参照位置
    while (oneCommentChars.length > position) {
      // eslint-disable-next-line security/detect-object-injection
      const char = oneCommentChars[position];
      const id = `${oneComment.data.id}-${lorCommentChars.length}`;

      // Note:
      // 参照した文字charが<img>要素の開始だった場合は<img>要素丸ごと1つ、それ以外はエスケープしたものをコメント文字として扱う。

      // パフォーマンスを確保するため、参照位置の文字が<img>要素の開始文字「<」であった場合に初めて正規表現で判断する。
      // さらに、<img>要素でない間はcomment変数の文字をcharAt()関数でのみ参照する。
      // <img>要素となった時点で初めて、comment変数を先頭から参照位置まで切り落とし、
      // <img>要素の部分を取得してLorAnimationCharを作成し、その後<img>要素の部分もcomment変数から切り落とす。
      if (char == "<") {
        const slicedComment = oneCommentChars.slice(position).join("");
        const imgMatched = slicedComment.match(/^<img\s.+?>/g);
        if (imgMatched != null) {
          const imgLength = runes(imgMatched[0]).length;
          oneCommentChars = oneCommentChars.slice(position + imgLength);
          position = 0;

          lorCommentChars.push(new LorAnimationChar(this, id, imgMatched[0], true));
          continue;
        }
      }

      position++;

      const escaped = this.#escape(char);
      lorCommentChars.push(new LorAnimationChar(this, id, escaped, false));
    }

    return lorCommentChars;
  }

  /**
   * 指定した文字列に含まれる HTML エンティティ (`&`, `<`, `>`, `"`, `'`) と半角スペースを参照文字にエスケープして返します。
   * @param {string} text エスケープ対象の文字列。
   * @returns {string} 参照文字にエスケープされた text と同等の文字列。
   */
  #escape(text) {
    /** @type {string} */
    const escaped = html.escape(text);
    return escaped.replace(" ", "&nbsp;");
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
