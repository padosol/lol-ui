/**
 * 테스트용 in-memory `localStorage`.
 *
 * 이 Node 런타임은 jsdom 의 `localStorage` 를 `undefined` 로 가린다. 저장소가 필요한 테스트는
 * `vi.stubGlobal("localStorage", createMemoryStorage())` 로 끼워 넣는다. zustand persist 처럼
 * 모듈이 만들어질 때 저장소를 잡는 코드는 stub 한 뒤에 import 해야 한다.
 */
export function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const items = new Map(Object.entries(initial));
  return {
    get length() {
      return items.size;
    },
    key: (index: number) => [...items.keys()][index] ?? null,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, String(value));
    },
    removeItem: (key: string) => {
      items.delete(key);
    },
    clear: () => {
      items.clear();
    },
  };
}
