import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Input } from "@/shared/ui";
import {
  type Question,
  getPublicQuestionsByName,
  checkTestResult,
} from "@/entities/test";

export function SolveTestPage() {
  const [searchParams] = useSearchParams();
  const tgAccountId = searchParams.get("tg_id");

  const [testName, setTestName] = useState("");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchQuestions = async () => {
    if (!testName.trim()) {
      setError("Введите название теста");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setQuestions(null);
    setAnswers({});
    
    try {
      const data = await getPublicQuestionsByName(testName.trim());
      setQuestions(data);
    } catch {
      setError("Не удалось найти тест или загрузить вопросы");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!tgAccountId) {
      setSubmitError("Не найден Telegram ID в ссылке (параметр ?tg_id)");
      return;
    }
    if (!questions) return;
    
    // Validate that all questions have answers
    const unansweredCount = questions.filter(q => !answers[q.id]).length;
    if (unansweredCount > 0) {
      setSubmitError(`Пожалуйста, ответьте на все вопросы. Осталось без ответа: ${unansweredCount}`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const data = Object.entries(answers).map(([id, answer]) => ({
        id: Number(id),
        answer,
      }));
      // Assuming 'test' field in payload expects testName or something, using testName
      await checkTestResult(tgAccountId, { test: testName.trim(), data });
      setIsSuccess(true);
    } catch {
      setSubmitError("Не удалось отправить результаты теста");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Тест завершен!</h2>
          <p className="text-gray-600">Ваши ответы успешно отправлены.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-3xl flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Прохождение теста</h1>
          {!tgAccountId && (
            <div className="mt-2 rounded-lg bg-orange-50 p-3 text-sm text-orange-600">
              Внимание: в ссылке отсутствует параметр tg_id. Вы не сможете отправить результаты.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              id="test-name"
              label="Название теста"
              placeholder="Введите название теста"
              value={testName}
              onChange={(e) => {
                setTestName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchQuestions();
              }}
            />
          </div>
          <Button onClick={fetchQuestions} isLoading={isLoading}>
            Найти
          </Button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {questions !== null && (
          <div className="flex flex-col gap-8 py-4">
            {questions.map((q, index) => (
              <div key={q.id} className="flex flex-col gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="font-medium text-gray-800 text-lg">Вопрос {index + 1}</div>
                {q.type === "ABC" ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                    {["A", "B", "C", "D"].map((option) => (
                      <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-colors">
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={option}
                          checked={answers[q.id] === option}
                          onChange={() => handleAnswerChange(q.id, option)}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">{option}</span>
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
              <p className="text-gray-500 text-center py-8">В этом тесте пока нет вопросов.</p>
            )}
          </div>
        )}

        {questions && questions.length > 0 && (
          <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
            {submitError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 text-center">
                {submitError}
              </div>
            )}
            <Button
              className="w-full sm:w-auto self-end py-3 px-8 text-lg"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!tgAccountId}
            >
              Отправить ответы
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
