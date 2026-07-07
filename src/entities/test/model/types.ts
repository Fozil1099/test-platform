export interface Test {
  id: number;
  name: string;
  created_date: string;
}

export interface CreateTestDto {
  name: string;
}

export interface TestTableResponse {
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  count: number;
  total_pages: number;
  results: Test[];
}

export interface Question {
  id: number;
  answer: string | null;
  type: string;
  deadline?: string;
}

export interface UpdateQuestionsDto {
  data: {
    id: number;
    answer: string;
  }[];
  deadline?: string;
}

export interface TestResult {
  tg_id: string;
  correct_question_count: number;
}

export interface TestResultResponse {
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  count: number;
  total_pages: number;
  results: TestResult[];
}

export interface SubmitTestResultDto {
  test: string;
  data: {
    id: number;
    answer: string;
  }[];
}
