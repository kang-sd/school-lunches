@echo off
chcp 65001 > nul
echo 안티그래비티 노트북 복구 마법사를 시작합니다...
git init
git remote add origin https://github.com/kang-sd/school-lunches.git
git fetch
git branch -M main
git reset --hard origin/main
echo =======================================================
echo 복구가 완료되었습니다! 이제부터 USB 연결 없이
echo '출근_Git다운로드', '퇴근_Git업로드' 스크립트가 정상 작동합니다.
echo =======================================================
pause
