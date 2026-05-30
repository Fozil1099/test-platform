import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button, Input } from "@/shared/ui";
import { login } from "../api";
import { useAuthStore } from "../model/store";

const loginSchema = z.object({
  username: z.string().min(1, "Введите имя пользователя"),
  password: z.string().min(1, "Введите пароль"),
});

export function LoginForm() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { token } = await login(result.data);
      setToken(token);
      navigate("/");
    } catch {
      setServerError("Неверное имя пользователя или пароль");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}
      <Input
        id="username"
        label="Имя пользователя"
        value={form.username}
        onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
        error={errors.username}
      />
      <Input
        id="password"
        label="Пароль"
        type="password"
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        error={errors.password}
      />
      <Button type="submit" isLoading={isLoading}>
        Войти
      </Button>
    </form>
  );
}
