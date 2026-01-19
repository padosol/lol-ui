import { test } from '@playwright/test';

test('브라우저 에러 확인', async ({ page }) => {
  // 콘솔 에러 수집
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // 페이지 에러 수집
  page.on('pageerror', (error) => {
    errors.push(`Page Error: ${error.message}`);
  });

  // 요청 실패 수집
  page.on('requestfailed', (request) => {
    errors.push(`Request Failed: ${request.url()} - ${request.failure()?.errorText}`);
  });

  // 소환사 페이지로 이동
  await page.goto('/summoners/kr/hide%20on%20bush-KR1');

  // 페이지 로드 대기
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  // 에러가 있는지 확인
  if (errors.length > 0) {
    console.log('발견된 에러들:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  // 스크린샷 저장
  await page.screenshot({ path: 'tests/screenshots/error-check.png', fullPage: true });

  // 에러 출력 (테스트는 실패하지 않음)
  if (errors.length > 0) {
    console.error('브라우저 에러 발견:', errors);
  }
});

