#!/usr/bin/env pwsh

using namespace System
using namespace System.IO

# .Description
# ソースコードのビルドを行い、配布可能なファイルを作成します。
# このスクリプトの動作条件は、プロジェクトのルートフォルダーを基準として
# ".\scripts\" フォルダーにこのファイルが配置されている事を前提としています。
function Main() {
    $WebpackPath = New-Object FileInfo([Path]::Combine($PSScriptRoot, "..\node_modules\.bin\webpack"))

    if (-not $WebpackPath.Exists) {
        throw $WEBPACK_NOT_INSTALLED
    }

    Start-Process -FilePath $WebpackPath
}

# .Description
# このスクリプト内で参照できる定数を宣言します。
function Declare-ScriptScopedConstants() {
    New-Variable -Scope script -Option ReadOnly -Name WEBPACK_NOT_INSTALLED -Value "webpack が node_modules にインストールされていません。`nプロジェクトのルートフォルダーで 'npm install' を実行してください。"

    New-Variable -Scope script -Option ReadOnly -Name SCRIPT_BEGIN -Value "ビルドを開始します。"
    New-Variable -Scope script -Option ReadOnly -Name SCRIPT_COMPLETED -Value "ビルドが完了しました。"
    New-Variable -Scope script -Option ReadOnly -Name SCRIPT_STOPPED -Value "問題が発生したためビルドを停止しました。`n{0}"
}

try {
    Declare-ScriptScopedConstants

    Write-Host $SCRIPT_BEGIN
    Main
    Write-Host $SCRIPT_COMPLETED
} catch {
    Write-Host -ForegroundColor Red ([String]::Format($SCRIPT_STOPPED, ($error[0] | Out-string)))
}
