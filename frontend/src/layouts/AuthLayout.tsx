import { Icon } from "../components/Icon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary py-12 px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-base-100 p-8 shadow-2xl">
        <div className="relative z-10">
          <div className="mb-8 text-center">
            <div className="mb-4 text-6xl animate-float">
              <Icon name="school" className="text-5xl" />
            </div>
            <h1 className="text-3xl font-extrabold text-gradient">Edu Learn Pro</h1>
            <p className="mt-2 text-sm font-medium text-base-content">Empowering learners and instructors worldwide</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
