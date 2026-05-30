import { api } from "@/shared/api";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

export async function login(dto: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/users/login", dto);
  return data;
}
