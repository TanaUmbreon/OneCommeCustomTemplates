#!/usr/bin/env pwsh

using namespace System
using namespace System.IO
using namespace System.Text.RegularExpressions

# .Description
# このプロジェクトのソースコードを「わんコメ」の「テンプレートフォルダ」にデプロイして使用できるようにします。
# ESLintによりLINTエラーが発生している場合はデプロイを行いません。
# また、その他の理由でエラーとなる場合もデプロイを行いません。
function Main() {
    try {
        # デプロイ先となる「テンプレートフォルダ」のパス
        $templateDirPath = [Path]::Combine($env:APPDATA, "live-comment-viewer\templates")
        # プロジェクトのルートフォルダーのパス
        $rootDirPath = [Environment]::CurrentDirectory
        # ソースコードフォルダーのパス
        $srcDirPath = [Path]::Combine($rootDirPath, "src")
        # デプロイから除外するフォルダーの名前(正規表現パターンで指定)
        $excludesDirNamePattern = "^(__origin|__pro|basic|cool-pop|flipboard|ktx-quick-starter|line|line-right|neon|newsticker|persona|persona-right|retro|slim|word-party-preset|yurucamp|yurucamp-right)$"

        ThrowIf-DirectoryNotFound $templateDirPath ([String]::Format($TEMPLATE_DIRECTORY_NOT_FOUND, $templateDirPath))
        ThrowIf-DirectoryNotFound $srcDirPath ([String]::Format($SOURCE_DIRECTORY_NOT_FOUND, $srcDirPath))
        ThrowIf-EslintProblemOccurred $srcDirPath

        $srcDir = New-Object DirectoryInfo($srcDirPath)
        foreach ($fromDir in $srcDir.EnumerateDirectories()) {
            if ([Regex]::IsMatch($fromDir.Name, $excludesDirNamePattern, [RegexOptions]::IgnoreCase)) { continue }
            
            $toDir = New-Object DirectoryInfo([Path]::Combine($templateDirPath, $fromDir))
            
            if ($toDir.Exists) {
                $toDir.Delete($true)
            }
            Copy-Item -Recurse $fromDir.FullName $toDir.FullName

            Write-Host ([String]::Format($TEMPLATE_REPLACED, $fromDir.Name))
        }

        Write-Host $DEPLOY_COMPLETED
    } catch {
        Write-Host -ForegroundColor Red ([String]::Format($DEPLOY_STOPPED, $_))
    }
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
# このスクリプト内で参照できる定数を宣言します。
function Declare-ScriptScopedConstants() {
    New-Variable -Scope script -Name DEPLOY_BEGIN -Value "デプロイを開始します。"
    New-Variable -Scope script -Name DEPLOY_COMPLETED -Value "デプロイが完了しました。"
    New-Variable -Scope script -Name TEMPLATE_REPLACED -Value "テンプレート '{0}' を配置しました。"
    New-Variable -Scope script -Name SOURCE_DIRECTORY_NOT_FOUND -Value "ソースコードフォルダー '{0}' が見つかりません。"
    New-Variable -Scope script -Name ESLINT_ERROR -Value "ESLintによるチェックでエラーがありました。"
    New-Variable -Scope script -Name TEMPLATE_DIRECTORY_NOT_FOUND -Value @"
「わんコメ」の「テンプレートフォルダ」が見つかりません。以下の確認をしてください。
1. 「わんコメ」がPCにインストールされている。
2. 「テンプレートフォルダ」の場所が '{0}' になっている。
3. このデプロイスクリプトで指定している「テンプレートフォルダ」のパスが「わんコメ」のデフォルトのインストール先になっている。
"@
    New-Variable -Scope script -Name DEPLOY_STOPPED -Value @"
問題が発生したためデプロイを中止しました。
{0}
"@
}

Declare-ScriptScopedConstants
Write-Host $DEPLOY_BEGIN
Main
