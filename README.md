# わんコメ カスタムテンプレート(OneComme Custom Templates)

配信者向けのコメントアプリ「[わんコメ](https://onecomme.com/)」を使ったカスタマイズ済みのテンプレートです。ゲーム「[Library Of Ruina](https://store.steampowered.com/app/1256670/Library_Of_Ruina/)」の幻想体戦などで使われているメッセージ風にコメントを表示させることができるようになります。

## 免責事項

## テンプレート利用者向けの情報

### 利用するための前提条件

- **※必須※**
  - 「わんコメ」がPCにインストールされていること。
- **※任意※**
  - 「[ロゴたいぷゴシック](http://www.fontna.com/blog/1226/)」がPCにインストールされていること。「Library Of Ruina」で使われているフォントに似せるために使用しますが、インストールされていなくても他のフォントで代用するので任意です。

### テンプレートのダウンロード方法

[「Releases」ページ](https://github.com/TanaUmbreon/OneCommeCustomTemplates/releases)」を参照してください。

## テンプレート開発者向けの情報

### 開発するための前提条件

「[利用するための前提条件](#利用するための前提条件)」に加え、以下の条件が必要となります。

- 「[Visual Studio Code](https://code.visualstudio.com/)」(以下、「VSCode」)がPCにインストールされていて、かつ拡張機能の「ESLint」と「Prettier - Code formatter」が「VSCode」にインストールされていること。開発エディタとして使用します。
- 「[Node.js](https://nodejs.org/ja)」がPCにインストールされていて、かつ「Node.js」の「npm」コマンドがターミナルやコマンドプロンプト等(以下、「ターミナル」)で使用できるようパスが通っていること。開発を補助するツールやライブラリーをセットアップし、使用できるようにします。

### 開発環境の構築手順

1. 「GitHub」から [TanaUmbreon/OneCommeCustomTemplatesリポジトリ](https://github.com/TanaUmbreon/OneCommeCustomTemplates) をクローンします。以下、クローン先として指定したソースコードが配置されたフォルダーを「作業フォルダー」と呼びます。
2. 「VSCode」を起動し、「ファイル」→「フォルダーを開く」メニューから「作業フォルダー」を選択して開きます。
3. 「VSCode」でCtrl+@キーを押し、「ターミナル」を表示させます。
4. 「ターミナル」でコマンド `npm run setup` を入力して実行します。

### 定義済みスクリプトコマンド

`npm run setup`

- 「わんコメ」の「テンプレートフォルダ」にある `__origin\` フォルダーを、「作業フォルダー」の `templates\` フォルダー直下にコピペする。
- 「ターミナル」で「作業フォルダー」からコマンド `npm install` を実行する。開発で使う「Node.js」のライブラリーが「作業フォルダー」にインストールされる。

`npm run deploy`

`npm run build`

### 使用しているNode.jsのライブラリ

- `ESLint` ※開発環境のみ
  - プラグイン
    - [eslint-plugin-security](https://github.com/eslint-community/eslint-plugin-security)
  - 設定
    - [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
- `Prettier` ※開発環境のみ

## ライセンス

このソースコードはMITライセンスで公開しています。
