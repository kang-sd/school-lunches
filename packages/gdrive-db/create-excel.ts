import { google } from 'googleapis';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// 사용자 정보
const SERVICE_ACCOUNT_FILE = path.join(os.homedir(), '.config', 'mcp-gdrive', 'service-account.json');
const FOLDER_ID = '1k3VV04qx8-AjJnykeWFetCMznmPrFVXJ';

async function createExcelFiles() {
  console.log('[안내] 엑셀 파일 생성 및 업로드를 시작합니다...\n');
  
  try {
    // 1. Google Drive API 인증 설정 (파일 쓰기 권한 '/auth/drive' 필수 적용)
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/drive'], 
    });
    const drive = google.drive({ version: 'v3', auth });

    // 2. 대상 폴더 접근/조작 권한 확인
    try {
      await drive.files.get({ fileId: FOLDER_ID, fields: 'id, name' });
      console.log(`[확인] 대상 폴더 접근 권한 정상! 업로드를 진행합니다.\n`);
    } catch (e: any) {
      console.error(`❌ [오류] 대상 폴더에 접근할 수 없습니다: ${e.message}`);
      return;
    }

    // ==========================================
    // 01. 식재료DB_2026년.xlsx 생성
    // ==========================================
    console.log('[1/2] "식재료DB_2026년.xlsx" 로컬 생성 중...');
    const dbWorkbook = new ExcelJS.Workbook();
    dbWorkbook.addWorksheet('식재료목록');
    dbWorkbook.addWorksheet('영양성분');
    dbWorkbook.addWorksheet('알레르기');
    
    // 로컬 시스템에 데이터 저장 (드라이브 전송용 임시)
    const dbFilePath = path.join(__dirname, '식재료DB_2026년.xlsx');
    await dbWorkbook.xlsx.writeFile(dbFilePath);

    // 구글 드라이브로 파일 전송 (MimeType: 원본 엑셀 형식 적용)
    console.log('      👉 구글 드라이브 업로드 중...');
    await drive.files.create({
      requestBody: {
        name: '식재료DB_2026년',
        parents: [FOLDER_ID],
        mimeType: 'application/vnd.google-apps.spreadsheet',
      },
      media: {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: fs.createReadStream(dbFilePath),
      },
    });
    console.log('      ✅ 식재료DB_2026년.xlsx 업로드 완료!\n');

    // ==========================================
    // 02. 급식관리_2026년.xlsx 생성
    // ==========================================
    console.log('[2/2] "급식관리_2026년.xlsx" 로컬 생성 중...');
    const mgmtWorkbook = new ExcelJS.Workbook();
    mgmtWorkbook.addWorksheet('레시피목록');
    mgmtWorkbook.addWorksheet('식단계획');
    mgmtWorkbook.addWorksheet('발주내역');
    
    // 로컬 시스템에 데이터 저장
    const mgmtFilePath = path.join(__dirname, '급식관리_2026년.xlsx');
    await mgmtWorkbook.xlsx.writeFile(mgmtFilePath);

    // 구글 드라이브로 파일 전송
    console.log('      👉 구글 드라이브 업로드 중...');
    await drive.files.create({
      requestBody: {
        name: '급식관리_2026년',
        parents: [FOLDER_ID],
        mimeType: 'application/vnd.google-apps.spreadsheet',
      },
      media: {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: fs.createReadStream(mgmtFilePath),
      },
    });
    console.log('      ✅ 급식관리_2026년.xlsx 업로드 완료!\n');

    // 3. 사용이 끝난 임시 로컬 파일 삭제 (Cleanup)
    fs.unlinkSync(dbFilePath);
    fs.unlinkSync(mgmtFilePath);

    console.log('🎉 지정하신 구글 드라이브 폴더에 2개의 엑셀(`.xlsx`) 파일이 성공적으로 만들어졌습니다!');

  } catch (error: any) {
    console.error('\n❌ 파일 작업 중 에러가 발생했습니다:');
    console.error(error.message);
  }
}

createExcelFiles();
