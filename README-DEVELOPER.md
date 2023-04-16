# わんコメ カスタムテンプレート 開発者向け情報

## 開発するための前提条件

「[利用するための前提条件](https://github.com/TanaUmbreon/OneCommeCustomTemplates/README.md#利用するための前提条件)」に加え、以下の環境を前提としています。

- 「[Visual Studio Code](https://code.visualstudio.com/)」(以下、「VSCode」)がPCにインストールされていて、かつ拡張機能の「ESLint」と「Prettier - Code formatter」が「VSCode」にインストールされていること。開発エディタとして使用します。
- 「[Node.js](https://nodejs.org/ja)」がPCにインストールされていて、かつ「Node.js」の「npm」コマンドがターミナルやコマンドプロンプト等(以下、「ターミナル」)で使用できるようパスが通っていること。開発を補助するツールやライブラリーをセットアップし、使用できるようにします。
- 「Git」がPCにインストールされていること。

## 開発環境の構築手順

1. 「GitHub」から [TanaUmbreon/OneCommeCustomTemplatesリポジトリ](https://github.com/TanaUmbreon/OneCommeCustomTemplates) をクローンまたは [ソースコード] をダウンロードします。以下、クローン先として指定したソースコードが配置されたフォルダーを「作業フォルダー」と呼びます。
2. 「VSCode」を起動し、「ファイル」→「フォルダーを開く」メニューから「作業フォルダー」を選択して開きます。
3. 「VSCode」でCtrl+@キーを押し、「ターミナル」を表示させます。
4. 「ターミナル」でコマンド `npm run setup` を入力して実行します。

## 定義済みスクリプトコマンド

「VSCode」で「作業フォルダー」を開いている状態だと、「ターミナル」で以下の `npm run` コマンドを実行することができます。

|`npm run setup`|
|:--|
|未実装<br>~~「わんコメ」の「テンプレートフォルダ」にある `__origin\` フォルダーを、「作業フォルダー」の `templates\` フォルダー直下にコピペします。~~<br>~~「ターミナル」で「作業フォルダー」からコマンド `npm install` を実行する。開発で使う「Node.js」のライブラリーが「作業フォルダー」にインストールされます。~~|

|`npm run deploy-debug`|
|:--|
|利用および配布可能な「わんコメ」のテンプレートを作成します。<br>このコマンドを実行することでプロジェクトの「作業フォルダー」に `release` フォルダーが作成されます。その配下にある `lor-like-comment` フォルダーを「わんコメ」の「テンプレートフォルダ」に配置することで利用できるようになります。<br>※「作業フォルダー」の `src` フォルダーにあるソースコードはそのままテンプレートに使用することはできません。必ず、このコマンドを実行して作成したテンプレートを|

`npm run deploy`

## 使用しているNode.jsのライブラリ

- 開発環境のみ (devDependencies)
  - `ESLint`
    - プラグイン
      - [eslint-plugin-security](https://github.com/eslint-community/eslint-plugin-security)
    - 設定
      - [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
  - `Prettier`
  - `webpack`
  - `webpack-cli`
- 開発環境+本番環境 (dependencies)
  - `html-escaper`
  - `runes`
