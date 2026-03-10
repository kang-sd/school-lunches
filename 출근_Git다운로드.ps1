# 출근_Git다운로드.ps1 (다른 기기에서 수정한 최신 코드를 다운로드합니다)

$ErrorActionPreference = "Stop"

Write-Host "🌅 출근 준비 🌅" -ForegroundColor Cyan
Write-Host "클라우드(GitHub)에서 최신 코드를 다운로드(동기화)합니다...`n"

try {
    # 1. 원격 저장소에서 최신 코드 받기 (Pull)
    Write-Host "1/2. 최신 코드 가져오는 중..."
    $pullOutput = git pull origin main 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ 최신 코드 다운로드 완료! 작업을 시작하셔도 좋습니다." -ForegroundColor Green
        
        # package.json이 있다면 패키지가 변경되었을 가능성을 대비하여 안내 추가
        if (Test-Path "package.json") {
             Write-Host "💡 팁: 다운로드 후 실행이 안 된다면 'npm install'을 한 번 쳐주세요." -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n⚠️ 코드를 가져오는 중 오류가 발생했습니다 (충돌 가능성)." -ForegroundColor Red
        Write-Host $pullOutput
    }

} catch {
    Write-Host "`n❌ 스크립트 실행 중 알 수 없는 문제가 발생했습니다:`n$($_.Exception.Message)" -ForegroundColor Red
}

Pause
