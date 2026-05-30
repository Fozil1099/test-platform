import { LoginForm } from "@/features/auth";

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Вход в систему</h1>
        <LoginForm />
      </div>
    </div>
  );
}
