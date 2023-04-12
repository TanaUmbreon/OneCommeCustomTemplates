// OneSDK コメントの型定義
// 【参考】https://onecomme.com/docs/developer/comment-json

/** OneSDK コメントの共通情報を表します。 */
export type BaseComment = {
  /** コメント ID */
  id: string;
  /** 配信サイトでのユーザー識別 ID(匿名の場合もあるため保障されない) */
  userId: string;
  /** 配信識別子 */
  liveId: string;
  /** ユーザー名(コメント投稿者名) */
  name: string;
  /** 接続開始してから最初のコメントを表す値 */
  isFirstTime: boolean;
  /** 配信者自身を表す値 */
  isOwner: boolean;
  /** 表示ユーザー名(わんコメで文字数カットされたユーザー名) */
  displayName?: string;
  /** ギフトデータを持っていることを表す値 */
  hasGift: boolean;
  /** プロフィールアイコン URL(名前アイコンに置き換えられることがある) */
  profileImage: string;
  /** オリジナルのプロフィールアイコン URL */
  originalProfileImage: string;
  /** コメント本文(HTML はエスケープ・画像はimgタグになっている) */
  comment: string;
};

/** OneSDK で扱う、配信サービスに投稿された単一のコメントを表します。 */
export type CommonData = {
  /** 視聴枠を識別するための ID */
  id: string;
  /** 配信サイト識別子 */
  service: string;
  /** わんコメで視聴枠につけた任意の名前 */
  name: string;
  /** 視聴 URL */
  url: string;
  /** コメントの共通情報 */
  data: BaseComment;
  /** コメントのインデックス番号 */
  commentIndex: number;
};
