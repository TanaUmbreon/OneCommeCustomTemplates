import { Position } from "./Position.js";
import { Random} from "./Random.js";
import { LorAnimationChar } from "./LorAnimationChar.js";
import { escape } from "./Escaper.js";
const runes = require("runes");

/** @typedef {import("../__types/onesdk").BaseComment} BaseComment */
/** @typedef {import("../__types/onesdk").CommonData} CommonData */

/** @type {number} コメントの回転角度の最小値[度] */
const COMMENT_ROTATE_MIN = -30;
/** @type {number} コメントの回転角度の最大値[度] */
const COMMENT_ROTATE_MAX = 30;
/** @type {number} コメントを表示する位置の最小値[vw, vh] */
const COMMENT_OFFSET_MIN = 5;
/** @type {number} コメントを表示する位置の最大値[vw, vh] */
const COMMENT_OFFSET_MAX = 50;

/** @type {string} コメントが非表示状態になっている事を表すクラス名 */
const IS_DEACTIVE_STYLE = "is-deactive";

/**
 * LoR (Library Of Ruina) 風アニメーションを行う単一のコメントを表します。
 * OneSDK コメントの一部プロパティと互換性を持ちます。
 */
export class LorAnimationComment {
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
  /** @type {boolean} このコメントを非アクティブ化してフェードアウトアニメーションを行った事を示す値 */
  hasDeactivated;

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
    this.hasDeactivated = false;

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
      content += c.buildContent();
    });
    this.animationContent = content;
  }

  /**
   * このコメントを非アクティブ化して、フェードアウトを行います。
   */
  deactivation() {
    if (this.hasDeactivated) {
      return;
    }

    document.getElementById(this.data.id)?.classList.add(IS_DEACTIVE_STYLE);
    this.hasDeactivated = true;
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
    /** 変数charactersに対する文字の参照位置 */
    let position = 0;
    while (oneCommentChars.length > position) {
      // eslint-disable-next-line security/detect-object-injection
      const char = oneCommentChars[position];
      const id = `${oneComment.data.id}-${lorCommentChars.length}`;
      const isLast = (oneCommentChars.length - 1) <= position;

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

          lorCommentChars.push(new LorAnimationChar(this, id, imgMatched[0], isLast));
          continue;
        }
      }

      position++;

      const escaped = escape(char);
      lorCommentChars.push(new LorAnimationChar(this, id, escaped, isLast));
    }

    return lorCommentChars;
  }
}
