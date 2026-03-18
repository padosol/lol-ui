# TodoMVC Playwright 테스트 계획

## Context
https://demo.playwright.dev/todomvc/ 앱을 Playwright MCP 도구로 수동 테스트하고, 모든 성공/실패 시나리오에 대해 스크린샷을 캡처한다.

## 테스트 시나리오

### 1. 초기 상태 확인
- 페이지 로드 후 빈 상태 확인
- 📸 `01-initial-empty-state.png`

### 2. Todo 추가
- "Buy groceries", "Read a book", "Walk the dog" 3개 항목 추가
- 항목 수 카운터 확인 ("3 items left")
- 📸 `02-added-three-todos.png`

### 3. Todo 완료 (체크박스 토글)
- "Buy groceries" 완료 처리
- 카운터가 "2 items left"로 변경 확인
- 📸 `03-completed-one-todo.png`

### 4. 필터링 - Active
- "Active" 필터 클릭
- 완료되지 않은 항목만 표시 확인
- 📸 `04-filter-active.png`

### 5. 필터링 - Completed
- "Completed" 필터 클릭
- 완료된 항목만 표시 확인
- 📸 `05-filter-completed.png`

### 6. 필터링 - All
- "All" 필터 클릭
- 모든 항목 표시 확인
- 📸 `06-filter-all.png`

### 7. Todo 편집
- "Read a book" 더블클릭하여 "Read two books"로 수정
- 📸 `07-edited-todo.png`

### 8. Todo 삭제
- "Walk the dog" 항목에 hover 후 X 버튼 클릭하여 삭제
- 📸 `08-deleted-todo.png`

### 9. Toggle All (전체 완료)
- Toggle All 체크박스 클릭하여 모든 항목 완료
- 📸 `09-toggle-all-complete.png`

### 10. Clear Completed
- "Clear completed" 버튼 클릭
- 리스트가 비어있는 상태 확인
- 📸 `10-clear-completed.png`

### 11. 빈 입력 시도 (실패 시나리오)
- 빈 문자열로 todo 추가 시도 → 추가되지 않음 확인
- 📸 `11-empty-input-no-add.png`

### 12. 편집 중 ESC 취소 (실패/취소 시나리오)
- 항목 더블클릭 후 ESC로 편집 취소 → 원래 텍스트 유지 확인
- 📸 `12-edit-cancel-esc.png`

## 실행 방법
1. `browser_navigate`로 TodoMVC 페이지 열기
2. 각 시나리오마다 `browser_snapshot`으로 상태 확인 → 액션 수행 → `browser_take_screenshot`으로 캡처
3. 스크린샷 파일은 프로젝트 루트에 저장

## 스크린샷 저장 위치
`/home/lol/lol-ui/screenshots/todomvc/` 디렉토리에 저장
