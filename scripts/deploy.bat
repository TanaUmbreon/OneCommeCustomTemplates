@echo off

:: .Description
:: このバッチファイルと同じフォルダー階層にある同名の PowerShell スクリプトを実行します。
:: バッチファイルに指定された引数もそのまま PowerShell スクリプトに渡します。

set script=%~dpn0.ps1
powershell -NoProfile -ExecutionPolicy Unrestricted -File "%script%" %*
