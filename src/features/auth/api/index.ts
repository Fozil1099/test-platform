import { api } from "@/shared/api";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

export async function login(dto: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/staff/login/", dto);
  return data;
}
