# 퇴근_Git업로드.ps1 (오늘 작업한 내용을 원격 저장소에 올립니다)

$ErrorActionPreference = "Stop"

Write-Host "🚀 퇴근 준비 🚀" -ForegroundColor Cyan
Write-Host "오늘 작업한 모든 코드를 안전하게 백업(업로드)합니다...`n"

# Git 상태 확인
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "✅ 변경된 코드가 없습니다. 이미 최신 상태입니다." -ForegroundColor Green
    Write-Host "안녕히 가세요!" -ForegroundColor Yellow
    Pause
    exit
}

try {
    # 1. 모든 변경사항 스테이징
    Write-Host "1/3. 변경된 파일 모으는 중..." 
    git add .

    # 2. 커밋 메시지 작성 (현재 시간 기준)
    $commitMsg = "퇴근 전 자동 백업: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    Write-Host "2/3. 변경사항 저장 중: [$commitMsg]"
    git commit -m $commitMsg | Out-Null

    # 3. 원격 저장소에 푸시
    Write-Host "3/3. 클라우드(GitHub)에 업로드 중..."
    $pushOutput = git push origin main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 업로드가 완료되었습니다! 기분 좋게 퇴근하세요!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ 오류가 발생했습니다. 아래 메시지를 확인해주세요." -ForegroundColor Red
        Write-Host $pushOutput
    }

} catch {
    Write-Host "`n❌ 스크립트 실행 중 알 수 없는 문제가 발생했습니다:`n$($_.Exception.Message)" -ForegroundColor Red
}

Pause
