import { google } from 'googleapis';

// 사용자님께서 제공해주신 정보
const SERVICE_ACCOUNT_FILE = 'C:\\Users\\ISJSU\\.config\\mcp-gdrive\\service-account.json';
const FOLDER_ID = '1k3VV04qx8-AjJnykeWFetCMznmPrFVXJ';

/**
 * 특정 구글 드라이브 폴더의 파일 목록을 조회하는 함수
 */
async function listDriveFiles() {
  console.log(`[안내] 서비스 계정 키를 읽어 인증을 시도합니다...`);
  
  try {
    // 1. Google Drive API 인증 설정 (읽기 전용 권한)
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log(`[안내] 인증 성공! 폴더(ID: ${FOLDER_ID}) 검색을 시작합니다...`);

    // 2. 폴더 접근 가능 여부 사전 확인
    try {
      await drive.files.get({ fileId: FOLDER_ID, fields: 'id, name' });
      console.log(`[안내] 폴더 접근 확인 완료! 파일 목록 조회를 시작합니다...`);
    } catch (folderError: any) {
      console.log(`\n❌ [오류] 폴더(ID: ${FOLDER_ID})에 접근할 수 없습니다.`);
      console.log(`원인: 서비스 계정 이메일이 해당 폴더에 '편집자' 또는 '뷰어'로 공유되지 않았거나, 폴더 ID가 잘못되었습니다.`);
      console.log(`상세 에러: ${folderError.message}`);
      return;
    }

    // 3. 파일 목록 조회 요청
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed = false`, // 해당 폴더 안에 있으면서 휴지통에 가지 않은 파일
      fields: 'files(id, name, mimeType, createdTime, size)',
      spaces: 'drive',
    });

    const files = res.data.files;
    
    // 3. 결과 출력
    if (files && files.length > 0) {
      console.log('\n✅ 해당 폴더에서 다음 파일들을 찾았습니다:');
      console.table(
        files.map(file => ({
          '파일명 (Name)': file.name,
          '유형 (Type)': file.mimeType?.replace('application/vnd.google-apps.', ''), // 구글 문서 타입 간소화
          '크기 (Size)': file.size ? `${(Number(file.size) / 1024).toFixed(2)} KB` : 'N/A',
          '생성일시 (Created)': new Date(file.createdTime as string).toLocaleString('ko-KR'),
          '파일 ID (ID)': file.id
        }))
      );
      console.log(`총 ${files.length}개의 항목이 조회되었습니다.\n`);
    } else {
      console.log('\n⚠️ 해당 폴더가 비어있거나, 파일이 존재하지 않습니다.');
      console.log('📌 팁: 서비스 계정 이메일이 해당 폴더에 "편집자/뷰어"로 공유되어 있는지 다시 한번 확인해주세요!');
    }
  } catch (error: any) {
    console.error('\n❌ 파일 목록을 불러오는 중 에러가 발생했습니다:');
    if (error.code === 'ENOENT') {
      console.error(`- 서비스 계정 키 파일을 찾을 수 없습니다: ${SERVICE_ACCOUNT_FILE}`);
    } else {
      console.error(`- 에러 메세지: ${error.message}`);
    }
  }
}

// 스크립트 실행
listDriveFiles();
