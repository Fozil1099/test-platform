import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/shared/ui";
import {
  type Question,
  getQuestions,
  updateQuestions,
  getTestResults,
  type TestResultResponse,
  downloadExcel,
} from "@/entities/test";

export function TestDetailsPage() {
  const { test_id } = useParams<{ test_id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [deadline, setDeadline] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [resultsData, setResultsData] = useState<TestResultResponse | null>(null);
  const [isResultsLoading, setIsResultsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    if (!test_id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getQuestions(test_id);
      setQuestions(data);
      // Initialize answers from data
      const initialAnswers: Record<number, string> = {};
      data.forEach((q) => {
        if (q.answer) {
          initialAnswers[q.id] = q.answer;
        }
      });
      setAnswers(initialAnswers);
      
      if (data.length > 0 && data[0].deadline) {
        const d = new Date(data[0].deadline);
        const localDateTime = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setDeadline(localDateTime);
      }
    } catch {
      setError("Не удалось загрузить вопросы");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResults = async () => {
    if (!test_id) return;
    setIsResultsLoading(true);
    setResultsError(null);
    try {
      const data = await getTestResults(test_id, { page: 1, page_size: 10 });
      setResultsData(data);
    } catch {
      setResultsError("Не удалось загрузить результаты");
    } finally {
      setIsResultsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchResults();
  }, [test_id]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSave = async () => {
    if (!test_id) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const data = Object.entries(answers).map(([id, answer]) => ({
        id: Number(id),
        answer,
      }));
      const payload: any = { data };
      if (deadline) {
        payload.deadline = new Date(deadline).toISOString();
      }
      await updateQuestions(test_id, payload);
      setSaveSuccess("Успешно сохранено");
      // Optional: refresh data to match server state
      // await fetchQuestions();
    } catch {
      setSaveError("Не удалось сохранить ответы");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!test_id) return;
    setIsDownloading(true);
    try {
      const blob = await downloadExcel(test_id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `test_${test_id}_results.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Ошибка при скачивании", error);
      setResultsError("Не удалось скачать файл");
    } finally {
      setIsDownloading(false);
    }
  };

  // Clear success message when answering changes
  useEffect(() => {
    if (saveSuccess) setSaveSuccess(null);
  }, [answers]);

  return (
    <div className="flex min-h-0 flex-1 gap-6">
      {/* Left Section - Placeholder */}
      <div className="flex w-1/2 flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Вопросы</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="deadline" className="text-sm font-medium text-gray-700">Дедлайн:</label>
              <input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <Button onClick={handleSave} isLoading={isSaving} disabled={isLoading}>
            Сохранить
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {saveError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
            {saveSuccess}
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-500">Загрузка вопросов...</p>
        ) : (
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto pr-2">
            {questions.map((q, index) => (
              <div key={q.id} className="flex flex-col gap-3 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                <div className="font-medium text-gray-800">{index + 1}.</div>
                {q.type === "ABC" ? (
                  <div className="flex gap-6">
                    {["A", "B", "C", "D"].map((option) => (
                      <label key={option} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={option}
                          checked={answers[q.id] === option}
                          onChange={() => handleAnswerChange(q.id, option)}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">
                    Неизвестный тип вопроса: {q.type}
                  </div>
                )}
              </div>
            ))}
            {questions.length === 0 && !error && (
              <p className="text-gray-500">Нет вопросов для отображения.</p>
            )}
          </div>
        )}
      </div>

      {/* Right Section - Results */}
      <div className="w-1/2 flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Результаты</h2>
          <Button onClick={handleDownloadExcel} isLoading={isDownloading} variant="secondary">
            Скачать в Excel
          </Button>
        </div>
        {resultsError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {resultsError}
          </div>
        )}
        {isResultsLoading ? (
          <p className="text-gray-500">Загрузка результатов...</p>
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto">
            {resultsData?.results && resultsData.results.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Telegram ID</th>
                      <th className="px-4 py-3">Правильных ответов</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsData.results.map((result, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="px-4 py-3 text-gray-500">{result.tg_id}</td>
                        <td className="px-4 py-3 font-medium text-green-600">{result.correct_question_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-400">
                Нет результатов для отображения
              </div>
            )}
            {resultsData && resultsData.total_pages > 1 && (
              <div className="mt-4 text-sm text-gray-500">
                Показана 1 страница из {resultsData.total_pages}. Всего: {resultsData.count}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
