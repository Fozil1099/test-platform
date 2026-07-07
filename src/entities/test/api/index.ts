import { api, publicApi } from "@/shared/api";
import type { Test, CreateTestDto, TestTableResponse, Question, UpdateQuestionsDto, TestResultResponse, SubmitTestResultDto } from "../model/types";

export interface GetTestTableParams {
  page?: number;
  page_size?: number;
}

export async function getTestTable(
  params?: GetTestTableParams,
): Promise<TestTableResponse> {
  const { data } = await api.get<TestTableResponse>("/tests/get_test_table/", {
    params,
  });
  return data;
}

export async function createTest(dto: CreateTestDto): Promise<Test> {
  const { data } = await api.post<Test>("/tests/create_test/", dto);
  return data;
}

export async function getQuestions(testId: string): Promise<Question[]> {
  const { data } = await api.get<Question[]>(`/tests/get_question/${testId}/`);
  return data;
}

export async function getPublicQuestions(testId: string): Promise<Question[]> {
  const { data } = await publicApi.get<Question[]>(`/tests/get_question/${testId}/`);
  return data;
}

export async function getPublicQuestionsByName(name: string): Promise<Question[]> {
  const { data } = await publicApi.get<Question[]>(`/tests/get_test_question/${name}/`);
  return data;
}

export async function updateQuestions(
  testId: string,
  dto: UpdateQuestionsDto,
): Promise<void> {
  await api.patch(`/tests/update_question/${testId}/`, dto);
}

export async function getTestResults(
  testId: string,
  params?: GetTestTableParams,
): Promise<TestResultResponse> {
  const { data } = await api.get<TestResultResponse>(`/tests/get_resalt/${testId}/`, {
    params,
  });
  return data;
}

export async function checkTestResult(
  tgAccountId: string,
  dto: SubmitTestResultDto,
): Promise<void> {
  await publicApi.post(`/tests/check_test_result/${tgAccountId}/`, dto);
}

export async function downloadExcel(testId: string): Promise<Blob> {
  const { data } = await api.get<Blob>(`/tests/download_excel/${testId}/`, {
    responseType: "blob",
  });
  return data;
}
