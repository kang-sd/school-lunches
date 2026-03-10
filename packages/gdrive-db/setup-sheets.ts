import { google } from 'googleapis';

const SERVICE_ACCOUNT_FILE = 'C:\\Users\\ISJSU\\.config\\mcp-gdrive\\service-account.json';

const FILES = [
  {
    name: '급식관리_2026년',
    id: '1IAs7weR1cmHNaGRKaWKMyOYZx_hBp5rTYYYCb9FEp7o',
    sheets: [
      { title: '레시피목록', headers: ['번호', '레시피명', '분류', '재료', '조리법', '1인분량'] },
      { title: '식단계획', headers: ['날짜', '요일', '메뉴1', '메뉴2', '메뉴3', '메뉴4', '메뉴5', '열량합계'] },
      { title: '발주내역', headers: ['날짜', '식재료명', '수량', '단위', '단가', '합계', '납품업체'] }
    ]
  },
  {
    name: '식재료DB_2026년',
    id: '1vR93hK9PjnIhhwCx8vBV11dhyy_paPx4Y71FMF1IVic',
    sheets: [
      { title: '식재료목록', headers: ['번호', '식재료명', '분류', '단위', '단가', '원산지', '알레르기여부'] },
      { title: '영양성분', headers: ['식재료명', '열량', '단백질', '지방', '탄수화물', '칼슘', '철', '비타민A', '비타민C'] },
      { title: '알레르기', headers: ['번호', '알레르기명', '해당식재료'] }
    ]
  }
];

async function setupSheets() {
  console.log('[안내] 스프레드시트 초기 설정을 시작합니다!\n');
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'], // 스프레드시트 읽기/쓰기 권한
  });

  const sheetsApi = google.sheets({ version: 'v4', auth });

  for (const fileConf of FILES) {
    console.log(`▶ [${fileConf.name}] 작업 시작`);
    try {
      // 1. 기존 시트 목록 조회
      const doc = await sheetsApi.spreadsheets.get({ spreadsheetId: fileConf.id });
      const existingSheets = doc.data.sheets || [];
      const existingTitles = existingSheets.map(s => s.properties?.title || '');
      
      const requests: any[] = [];
      let firstSheetId = existingSheets[0]?.properties?.sheetId;
      let firstSheetTitle = existingSheets[0]?.properties?.title;

      // 2. 추가해야 할 시트 찾기
      let isFirstSheetRenamed = false;

      for (const [index, target] of fileConf.sheets.entries()) {
        if (!existingTitles.includes(target.title)) {
          // 기존에 비어있는 첫번째 기본 시트("시트1" 등)가 있다면 제목을 변경하여 재활용
          if (index === 0 && !isFirstSheetRenamed && firstSheetId !== undefined && firstSheetTitle?.startsWith('시트')) {
             requests.push({
               updateSheetProperties: {
                 properties: { sheetId: firstSheetId, title: target.title },
                 fields: 'title'
               }
             });
             isFirstSheetRenamed = true;
          } else {
             requests.push({
               addSheet: { properties: { title: target.title } }
             });
          }
        }
      }

      // 변경사항이 있다면 구글 시트에 일괄 요청(추가 및 이름 변경)
      if (requests.length > 0) {
        console.log(`  - 시트 구조 설정 중...`);
        await sheetsApi.spreadsheets.batchUpdate({
          spreadsheetId: fileConf.id,
          requestBody: { requests }
        });
      } else {
         console.log(`  - 시트가 이미 모두 존재합니다.`);
      }

      // 3. 시트 상단 헤더 데이터 입력
      console.log(`  - 각 시트 메인 헤더(1행) 데이터 입력 중...`);
      const dataToUpdate = fileConf.sheets.map(sheet => ({
        range: `'${sheet.title}'!A1`,
        values: [sheet.headers] // 2차원 배열 형태 [[컬럼1, 컬럼2, ...]]
      }));

      await sheetsApi.spreadsheets.values.batchUpdate({
        spreadsheetId: fileConf.id,
        requestBody: {
          valueInputOption: 'USER_ENTERED', // 사용자가 입력한 것처럼 값 파싱
          data: dataToUpdate
        }
      });
      
      console.log(`✅ [${fileConf.name}] 작업 완료!\n`);
      
    } catch (e: any) {
      console.error(`❌ [${fileConf.name}] 작업 중 오류 발생:`, e.message);
    }
  }
}

setupSheets();
