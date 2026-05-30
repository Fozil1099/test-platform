import { api } from "@/shared/api";
import type { Test, CreateTestDto, UpdateTestDto } from "../model/types";

export async function getTests(): Promise<Test[]> {
  const { data } = await api.get<Test[]>("/tests");
  return data;
}

export async function getTestById(id: string): Promise<Test> {
  const { data } = await api.get<Test>(`/tests/${id}`);
  return data;
}

export async function createTest(dto: CreateTestDto): Promise<Test> {
  const { data } = await api.post<Test>("/tests", dto);
  return data;
}

export async function updateTest(
  id: string,
  dto: UpdateTestDto,
): Promise<Test> {
  const { data } = await api.put<Test>(`/tests/${id}`, dto);
  return data;
}

export async function deleteTest(id: string): Promise<void> {
  await api.delete(`/tests/${id}`);
}
