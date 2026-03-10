$ErrorActionPreference = "Stop"

# 백업 파일들이 임시로 모일 폴더 생성
$backupDir = "$HOME\Desktop\Antigravity_Setup"
if (Test-Path $backupDir) { Remove-Item -Recurse -Force $backupDir }
New-Item -ItemType Directory -Path $backupDir | Out-Null

Write-Host "📦 사무실 PC 환경 백업을 시작합니다..." -ForegroundColor Cyan

# 1. MCP 설정 파일 복사
$mcpConfigSrc = "$HOME\.gemini\antigravity\mcp_config.json"
if (Test-Path $mcpConfigSrc) {
    Copy-Item -Path $mcpConfigSrc -Destination $backupDir -Force
    Write-Host "  ✔️ mcp_config.json 복사 완료"
}

# 2. 스킬 폴더 복사
$skillsSrc = "$HOME\.gemini\antigravity\skills"
if (Test-Path $skillsSrc) {
    Copy-Item -Path $skillsSrc -Destination "$backupDir\skills" -Recurse -Force
    Write-Host "  ✔️ 스킬 폴더 복사 완료"
}

# 3. 구글 드라이브 인증 키 폴더 복사
$gdriveCredsSrc = "$HOME\.config\mcp-gdrive"
if (Test-Path $gdriveCredsSrc) {
    Copy-Item -Path $gdriveCredsSrc -Destination "$backupDir\mcp-gdrive" -Recurse -Force
    Write-Host "  ✔️ 구글 드라이브 인증 키(mcp-gdrive) 복사 완료"
}

# 4. 노트북 복원용(설치) 스크립트 생성
$installerPath = "$backupDir\install_env.ps1"
$installerContent = @"
`$ErrorActionPreference = "Stop"
Write-Host "🚀 노트북 Antigravity 환경 원클릭 세팅을 시작합니다!" -ForegroundColor Green

# 1. MCP 설정 파일 복원
`$mcpDest = "`$HOME\.gemini\antigravity"
if (-not (Test-Path `$mcpDest)) { New-Item -ItemType Directory -Force -Path `$mcpDest | Out-Null }
Copy-Item -Path ".\mcp_config.json" -Destination "`$mcpDest" -Force
Write-Host "  ✔️ MCP 서버 설정(mcp_config.json) 복원 완료"

# 2. 스킬 폴더 복원
if (Test-Path ".\skills") {
    Copy-Item -Path ".\skills" -Destination "`$mcpDest" -Recurse -Force
    Write-Host "  ✔️ 스킬 폴더 복원 완료"
}

# 3. 구글 드라이브 키 복원
`$gdriveDest = "`$HOME\.config"
if (-not (Test-Path `$gdriveDest)) { New-Item -ItemType Directory -Force -Path `$gdriveDest | Out-Null }
if (Test-Path ".\mcp-gdrive") {
    Copy-Item -Path ".\mcp-gdrive" -Destination "`$gdriveDest" -Recurse -Force
    Write-Host "  ✔️ 구글 드라이브 인증 키 복원 완료"
}

Write-Host "`n🎉 모든 세팅이 완료되었습니다! Antigravity 에디터를 재시작해 주세요!" -ForegroundColor Cyan
Pause
"@
Set-Content -Path $installerPath -Value $installerContent -Encoding UTF8

# 5. 전체를 압축(ZIP)
$zipPath = "$HOME\Desktop\Antigravity_Setup.zip"
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
Compress-Archive -Path "$backupDir\*" -DestinationPath $zipPath

# 정리
Remove-Item -Recurse -Force $backupDir

Write-Host "`n✅ 바탕화면에 [Antigravity_Setup.zip] 압축 파일이 완성되었습니다!" -ForegroundColor Green
Write-Host "이 압축 파일을 USB나 카카오톡 나와의 채팅으로 노트북에 옮긴 후,"
Write-Host "압축을 풀고 [install_env.ps1] 파일을 우클릭하여 'PowerShell에서 실행'을 누르면 끝입니다."
