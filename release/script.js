/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 277:
/***/ ((module) => {



const HIGH_SURROGATE_START = 0xd800
const HIGH_SURROGATE_END = 0xdbff

const LOW_SURROGATE_START = 0xdc00

const REGIONAL_INDICATOR_START = 0x1f1e6
const REGIONAL_INDICATOR_END = 0x1f1ff

const FITZPATRICK_MODIFIER_START = 0x1f3fb
const FITZPATRICK_MODIFIER_END = 0x1f3ff

const VARIATION_MODIFIER_START = 0xfe00
const VARIATION_MODIFIER_END = 0xfe0f

const DIACRITICAL_MARKS_START = 0x20d0
const DIACRITICAL_MARKS_END = 0x20ff

const ZWJ = 0x200d

const GRAPHEMS = [
  0x0308, // ( ◌̈ ) COMBINING DIAERESIS
  0x0937, // ( ष ) DEVANAGARI LETTER SSA
  0x0937, // ( ष ) DEVANAGARI LETTER SSA
  0x093F, // ( ि ) DEVANAGARI VOWEL SIGN I
  0x093F, // ( ि ) DEVANAGARI VOWEL SIGN I
  0x0BA8, // ( ந ) TAMIL LETTER NA
  0x0BBF, // ( ி ) TAMIL VOWEL SIGN I
  0x0BCD, // ( ◌்) TAMIL SIGN VIRAMA
  0x0E31, // ( ◌ั ) THAI CHARACTER MAI HAN-AKAT
  0x0E33, // ( ำ ) THAI CHARACTER SARA AM
  0x0E40, // ( เ ) THAI CHARACTER SARA E
  0x0E49, // ( เ ) THAI CHARACTER MAI THO
  0x1100, // ( ᄀ ) HANGUL CHOSEONG KIYEOK
  0x1161, // ( ᅡ ) HANGUL JUNGSEONG A
  0x11A8 // ( ᆨ ) HANGUL JONGSEONG KIYEOK
]

function runes (string) {
  if (typeof string !== 'string') {
    throw new Error('string cannot be undefined or null')
  }
  const result = []
  let i = 0
  let increment = 0
  while (i < string.length) {
    increment += nextUnits(i + increment, string)
    if (isGraphem(string[i + increment])) {
      increment++
    }
    if (isVariationSelector(string[i + increment])) {
      increment++
    }
    if (isDiacriticalMark(string[i + increment])) {
      increment++
    }
    if (isZeroWidthJoiner(string[i + increment])) {
      increment++
      continue
    }
    result.push(string.substring(i, i + increment))
    i += increment
    increment = 0
  }
  return result
}

// Decide how many code units make up the current character.
// BMP characters: 1 code unit
// Non-BMP characters (represented by surrogate pairs): 2 code units
// Emoji with skin-tone modifiers: 4 code units (2 code points)
// Country flags: 4 code units (2 code points)
// Variations: 2 code units
function nextUnits (i, string) {
  const current = string[i]
  // If we don't have a value that is part of a surrogate pair, or we're at
  // the end, only take the value at i
  if (!isFirstOfSurrogatePair(current) || i === string.length - 1) {
    return 1
  }

  const currentPair = current + string[i + 1]
  let nextPair = string.substring(i + 2, i + 5)

  // Country flags are comprised of two regional indicator symbols,
  // each represented by a surrogate pair.
  // See http://emojipedia.org/flags/
  // If both pairs are regional indicator symbols, take 4
  if (isRegionalIndicator(currentPair) && isRegionalIndicator(nextPair)) {
    return 4
  }

  // If the next pair make a Fitzpatrick skin tone
  // modifier, take 4
  // See http://emojipedia.org/modifiers/
  // Technically, only some code points are meant to be
  // combined with the skin tone modifiers. This function
  // does not check the current pair to see if it is
  // one of them.
  if (isFitzpatrickModifier(nextPair)) {
    return 4
  }
  return 2
}

function isFirstOfSurrogatePair (string) {
  return string && betweenInclusive(string[0].charCodeAt(0), HIGH_SURROGATE_START, HIGH_SURROGATE_END)
}

function isRegionalIndicator (string) {
  return betweenInclusive(codePointFromSurrogatePair(string), REGIONAL_INDICATOR_START, REGIONAL_INDICATOR_END)
}

function isFitzpatrickModifier (string) {
  return betweenInclusive(codePointFromSurrogatePair(string), FITZPATRICK_MODIFIER_START, FITZPATRICK_MODIFIER_END)
}

function isVariationSelector (string) {
  return typeof string === 'string' && betweenInclusive(string.charCodeAt(0), VARIATION_MODIFIER_START, VARIATION_MODIFIER_END)
}

function isDiacriticalMark (string) {
  return typeof string === 'string' && betweenInclusive(string.charCodeAt(0), DIACRITICAL_MARKS_START, DIACRITICAL_MARKS_END)
}

function isGraphem (string) {
  return typeof string === 'string' && GRAPHEMS.indexOf(string.charCodeAt(0)) !== -1
}

function isZeroWidthJoiner (string) {
  return typeof string === 'string' && string.charCodeAt(0) === ZWJ
}

function codePointFromSurrogatePair (pair) {
  const highOffset = pair.charCodeAt(0) - HIGH_SURROGATE_START
  const lowOffset = pair.charCodeAt(1) - LOW_SURROGATE_START
  return (highOffset << 10) + lowOffset + 0x10000
}

function betweenInclusive (value, lower, upper) {
  return value >= lower && value <= upper
}

function substring (string, start, width) {
  const chars = runes(string)
  if (start === undefined) {
    return string
  }
  if (start >= chars.length) {
    return ''
  }
  const rest = chars.length - start
  const stringWidth = width === undefined ? rest : width
  let endIndex = start + stringWidth
  if (endIndex > (start + rest)) {
    endIndex = undefined
  }
  return chars.slice(start, endIndex).join('')
}

module.exports = runes
module.exports.substr = substring


/***/ }),

/***/ 247:
/***/ ((__unused_webpack_module, exports) => {


/**
 * Copyright (C) 2017-present by Andrea Giammarchi - @WebReflection
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const {replace} = '';

// escape
const es = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
const ca = /[&<>'"]/g;

const esca = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
};
const pe = m => esca[m];

/**
 * Safely escape HTML entities such as `&`, `<`, `>`, `"`, and `'`.
 * @param {string} es the input to safely escape
 * @returns {string} the escaped input, and it **throws** an error if
 *  the input type is unexpected, except for boolean and numbers,
 *  converted as string.
 */
const escape = es => replace.call(es, ca, pe);
exports.escape = escape;


// unescape
const unes = {
  '&amp;': '&',
  '&#38;': '&',
  '&lt;': '<',
  '&#60;': '<',
  '&gt;': '>',
  '&#62;': '>',
  '&apos;': "'",
  '&#39;': "'",
  '&quot;': '"',
  '&#34;': '"'
};
const cape = m => unes[m];

/**
 * Safely unescape previously escaped entities such as `&`, `<`, `>`, `"`,
 * and `'`.
 * @param {string} un a previously escaped string
 * @returns {string} the unescaped input, and it **throws** an error if
 *  the input type is unexpected, except for boolean and numbers,
 *  converted as string.
 */
const unescape = un => replace.call(un, es, cape);
exports.unescape = unescape;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {

;// CONCATENATED MODULE: ./src/__modules/Position.js
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

;// CONCATENATED MODULE: ./src/__modules/Random.js
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

;// CONCATENATED MODULE: ./src/lor-like-comment/script.js
/** @typedef {import("../types/onesdk").BaseComment} BaseComment */
/** @typedef {import("../types/onesdk").CommonData} CommonData */



const runes = __webpack_require__(277);
const html = __webpack_require__(247);

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

})();

/******/ })()
;