@echo off

:: .Description
:: ���̃o�b�`�t�@�C���Ɠ����t�H���_�[�K�w�ɂ��铯���� PowerShell �X�N���v�g�����s���܂��B
:: �o�b�`�t�@�C���Ɏw�肳�ꂽ���������̂܂� PowerShell �X�N���v�g�ɓn���܂��B

set script=%~dpn0.ps1
powershell -NoProfile -ExecutionPolicy Unrestricted -File "%script%" %*
