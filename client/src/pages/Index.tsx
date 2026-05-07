import { useThemeStore } from '@/stores/themeStore.ts';

export default function Index() {
  const { theme, nextTheme } = useThemeStore();

  return (
    <>
      {/* 테마 토글 버튼 */}
      <div className="p-10 text-center">
        <h1 className="mb-4 text-4xl font-bold">테마: {theme}</h1>
        <p className="py-4 text-base-content/80">
          Tailwind v4와 daisyUI, Zustand로 구현한 테마입니다.
        </p>
        <button className="btn btn-accent" onClick={nextTheme}>
          Toggle Button
        </button>
      </div>
    </>
  );
}
