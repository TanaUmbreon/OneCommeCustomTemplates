/**
 * アニメーションの実行単位を表す基本クラスです。
 */
export class AnimationTaskBase {
  /** アニメーションを実行するまでの遅延時間[ミリ秒] */
  #delayMiliseconds;
  /** アニメーションを実行するまでの遅延時間[ミリ秒] */
  get delayMiliseconds() {
    return this.#delayMiliseconds;
  }

  constructor(delayMiliseconds) {
    this.#delayMiliseconds = Math.min(delayMiliseconds, 0);
  }

  /**
   * アニメーションを実行します。基本クラスでは何も行わず、具体的な実装は継承クラスで行います。
   */
  execute() {}
}
