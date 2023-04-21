#!/usr/bin/env pwsh

using namespace System
using namespace System.IO

# .Description
# ソースコードのビルドを行い、配布可能なファイルを作成します。
# このスクリプトの動作条件は、プロジェクトのルートフォルダーを基準として
# ".\scripts\" フォルダーにこのファイルが配置されている事を前提としています。
function Main() {
    $RootDirPath = (New-Object DirectoryInfo([Path]::Combine($PSScriptRoot, "..\"))).FullName

    $WebpackMode = "production"
    $OutputDirPath = [Path]::Combine($RootDirPath, "dist\")
    $SrcDirPath = [Path]::Combine($RootDirPath, "src\")
    $DocsDirPath = [Path]::Combine($RootDirPath, "docs\")
    $WebpackCommandPath =[Path]::Combine($RootDirPath, "node_modules\.bin\webpack")

    if (-not [File]::Exists($WebpackCommandPath)) { throw $WEBPACK_NOT_INSTALLED }
    if (-not [Directory]::Exists($SrcDirPath)) { throw $SOURCE_DIRECTORY_NOT_FOUND }

    if ([Directory]::Exists($OutputDirPath)) { [Directory]::Delete($OutputDirPath, $True) }

    Start-Process -Wait -FilePath "$WebpackCommandPath" -ArgumentList ("--mode", $WebpackMode)
    Copy-Files $DocsDirPath $OutputDirPath "README.txt"
    Copy-Files $DocsDirPath $OutputDirPath "LICENSE.txt"
    Copy-Files ([Path]::Combine($SrcDirPath, "lor-like-comment\")) `
               ([Path]::Combine($OutputDirPath, "templates\lor-like-comment\"))
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
    New-Variable -Scope script -Option ReadOnly -Name WEBPACK_NOT_INSTALLED -Value "webpack が node_modules にインストールされていません。`nプロジェクトのルートフォルダーで 'npm install' を実行してください。"
    New-Variable -Scope script -Option ReadOnly -Name SOURCE_DIRECTORY_NOT_FOUND -Value "src フォルダーが見つかりません。"

    New-Variable -Scope script -Option ReadOnly -Name SCRIPT_BEGIN -Value "リリースビルドを開始します。"
    New-Variable -Scope script -Option ReadOnly -Name SCRIPT_COMPLETED -Value "リリースビルドが完了しました。"
    New-Variable -Scope script -Option ReadOnly -Name SCRIPT_STOPPED -Value "問題が発生したためリリースビルドを停止しました。`n{0}"
}

try {
    Declare-ScriptScopedConstants

    Write-Host $SCRIPT_BEGIN
    Main
    Write-Host $SCRIPT_COMPLETED
} catch {
    Write-Host -ForegroundColor Red ([String]::Format($SCRIPT_STOPPED, ($error[0] | Out-string)))
}
