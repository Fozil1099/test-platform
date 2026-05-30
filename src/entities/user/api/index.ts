import { api } from "@/shared/api";
import type { User, CreateUserDto, UpdateUserDto } from "../model/types";

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users/user");
  return data;
}

export async function createUser(dto: CreateUserDto): Promise<User> {
  const { data } = await api.post<User>("/users/user", dto);
  return data;
}

export async function updateUser(
  id: string,
  dto: UpdateUserDto,
): Promise<User> {
  const { data } = await api.put<User>(`/users/user/${id}`, dto);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/user/${id}`);
}
