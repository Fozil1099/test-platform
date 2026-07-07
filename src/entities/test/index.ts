export type {
  Test,
  CreateTestDto,
  TestTableResponse,
  Question,
  UpdateQuestionsDto,
  TestResult,
  TestResultResponse,
  SubmitTestResultDto,
} from "./model/types";
export type { GetTestTableParams } from "./api";
export {
  getTestTable,
  createTest,
  getQuestions,
  getPublicQuestions,
  getPublicQuestionsByName,
  updateQuestions,
  getTestResults,
  checkTestResult,
  downloadExcel,
} from "./api";
