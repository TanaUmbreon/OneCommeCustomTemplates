#!/usr/bin/env pwsh

using namespace System
using namespace System.IO

# .Description
# このプロジェクトのソースコードを「わんコメ」の「テンプレートフォルダ」にデプロイして使用できるようにします。
# ESLintによりLINTエラーが発生している場合はデプロイを行いません。
# また、その他の理由でエラーとなる場合もデプロイを行いません。
# このスクリプトの動作条件は、プロジェクトのルートフォルダーを基準として
# ".\scripts\" フォルダーにこのファイルが配置されている事を前提としています。
function Main() {
    # プロジェクトのルートフォルダーのパス
    $RootDirPath = (New-Object DirectoryInfo([Path]::Combine($PSScriptRoot, "..\"))).FullName

    # webpackの実行モード
    $WebpackMode = "development"
    # webpackの出力先フォルダーのパス
    $OutputDirPath = [Path]::Combine($RootDirPath, "debug\")
    # srcフォルダーのパス
    $SrcDirPath = [Path]::Combine($RootDirPath, "src\")
    # webpackコマンドのパス
    $WebpackCommandPath =[Path]::Combine($RootDirPath, "node_modules\.bin\webpack")
    # デプロイ先となる「テンプレートフォルダ」のパス
    $TemplateDirPath = [Path]::Combine($env:APPDATA, "live-comment-viewer\templates\")

    if (-not [File]::Exists($WebpackCommandPath)) { throw $WEBPACK_NOT_INSTALLED }
    ThrowIf-DirectoryNotFound $SrcDirPath ([String]::Format($SOURCE_DIRECTORY_NOT_FOUND, $srcDirPath))
    ThrowIf-DirectoryNotFound $TemplateDirPath ([String]::Format($TEMPLATE_DIRECTORY_NOT_FOUND, $templateDirPath))
    ThrowIf-EslintProblemOccurred $SrcDirPath

    if ([Directory]::Exists($OutputDirPath)) { [Directory]::Delete($OutputDirPath, $True) }

    Start-Process -Wait -FilePath "$WebpackCommandPath" -ArgumentList ("--mode", $WebpackMode)
    Copy-Files ([Path]::Combine($SrcDirPath, "lor-like-comment\")) `
               ([Path]::Combine($OutputDirPath, "lor-like-comment\"))

    $OutputDir = New-Object DirectoryInfo($OutputDirPath)
    foreach ($FromDir in $OutputDir.EnumerateDirectories()) {
        $ToDir = New-Object DirectoryInfo([Path]::Combine($TemplateDirPath, $FromDir.Name))
        
        if ($ToDir.Exists) {
            $ToDir.Delete($true)
        }
        Copy-Item -Recurse $FromDir.FullName $ToDir.FullName

        Write-Host ([String]::Format($TEMPLATE_REPLACED, $FromDir.Name))
    }

    Write-Host $DEPLOY_COMPLETED
}

# .Description
# 指定したパスのフォルダーが存在しなかった場合、指定したエラーメッセージで例外をスローします。
function ThrowIf-DirectoryNotFound($path, $errorMessage) {
    if (-not [Directory]::Exists($path)) {
        throw $errorMessage
    }
}

# .Description
# 指定したパスに対してESLintによるチェックを行い、問題が発生した場合例外をスローします。
function ThrowIf-EslintProblemOccurred($path) {
    node_modules\.bin\eslint --quiet "$path"
    if (-not $?) {
        throw $ESLINT_ERROR
    }
}

# .Description
# 指定したフォルダ直下にあるファイルを指定したフォルダ直下に上書きコピーします。
# jsファイルはコピーから除外されます。
function Copy-Files($fromDirPath, $toDirPath, $filter = "*.*") {
    $fromDir = New-Object DirectoryInfo($fromDirPath)
    $toDir = New-Object DirectoryInfo($toDirPath)

    if (-not $toDir.Exists) { $toDir.Create }

    foreach ($fromFile in $fromDir.EnumerateFiles($filter)) {
        if ($fromFile.Extension -eq ".js") { continue }

        $fromFile.CopyTo([Path]::Combine($toDir.FullName, $fromFile.Name), $True)|Out-Null
    }
}

# .Description
# このスクリプト内で参照できる定数を宣言します。
function Declare-ScriptScopedConstants() {
    New-Variable -Scope script -Option ReadOnly -Name SCRIPT_BEGIN -Value "デプロイを開始します。"
    New-Variable -Scope script -Option ReadOnly -Name SCRIPT_COMPLETED -Value "デプロイが完了しました。"
    New-Variable -Scope script -Option ReadOnly -Name SCRIPT_STOPPED -Value "問題が発生したためデプロイを停止しました。`n{0}"

    New-Variable -Scope script -Option ReadOnly -Name TEMPLATE_REPLACED -Value "テンプレート '{0}' を配置しました。"
    New-Variable -Scope script -Option ReadOnly -Name SOURCE_DIRECTORY_NOT_FOUND -Value "ソースコードフォルダー '{0}' が見つかりません。"
    New-Variable -Scope script -Option ReadOnly -Name ESLINT_ERROR -Value "ESLintによるチェックでエラーがありました。"
    New-Variable -Scope script -Option ReadOnly -Name TEMPLATE_DIRECTORY_NOT_FOUND -Value @"
「わんコメ」の「テンプレートフォルダ」が見つかりません。以下の確認をしてください。
1. 「わんコメ」がPCにインストールされている。
2. 「テンプレートフォルダ」の場所が '{0}' になっている。
3. このデプロイスクリプトで指定している「テンプレートフォルダ」のパスが「わんコメ」のデフォルトのインストール先になっている。
"@
}

try {
    Declare-ScriptScopedConstants

    Write-Host $SCRIPT_BEGIN
    Main
    Write-Host $SCRIPT_COMPLETED
} catch {
    Write-Host -ForegroundColor Red ([String]::Format($SCRIPT_STOPPED, ($error[0] | Out-string)))
}
