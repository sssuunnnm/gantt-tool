import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 w-full max-w-sm text-center">
        <div className="mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <rect x="3" y="4" width="18" height="2" rx="1" fill="currentColor" />
              <rect x="3" y="9" width="12" height="2" rx="1" fill="currentColor" />
              <rect x="3" y="14" width="15" height="2" rx="1" fill="currentColor" />
              <rect x="3" y="19" width="9" height="2" rx="1" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gantt Tool</h1>
          <p className="text-slate-500 mt-1 text-sm">Task Tree 기반 협업 일정 관리</p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
              <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.52V5.45H1.83a8 8 0 0 0 0 7.1l2.67-2.07z" />
              <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8 8 0 0 0 1.83 5.45L4.5 7.52A4.77 4.77 0 0 1 8.98 3.58z" />
            </svg>
            Google로 계속하기
          </button>
        </form>
      </div>
    </div>
  );
}
