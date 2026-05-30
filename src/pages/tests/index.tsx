import { useEffect, useState } from "react";
import { z } from "zod";
import { Button, Input, Modal, ConfirmDialog } from "@/shared/ui";
import {
  type Test,
  type CreateTestDto,
  getTests,
  createTest,
  updateTest,
  deleteTest,
} from "@/entities/test";

const QUESTIONS_COUNT = 20;
const MIN_ANSWER = 1;
const MAX_ANSWER = 4;

const testSchema = z.object({
  title: z.string().min(1, "Введите название теста"),
  answers: z
    .array(z.number().min(MIN_ANSWER).max(MAX_ANSWER))
    .length(QUESTIONS_COUNT, `Необходимо ${QUESTIONS_COUNT} ответов`),
});

function emptyAnswers(): number[] {
  return Array.from({ length: QUESTIONS_COUNT }, () => 1);
}

export function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Test | null>(null);
  const [title, setTitle] = useState("");
  const [answers, setAnswers] = useState<number[]>(emptyAnswers());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await getTests();
        if (!ignore) setTests(data);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const fetchTests = async () => {
    setIsLoading(true);
    const data = await getTests();
    setTests(data);
    setIsLoading(false);
  };

  const openCreate = () => {
    setEditingTest(null);
    setTitle("");
    setAnswers(emptyAnswers());
    setErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (test: Test) => {
    setEditingTest(test);
    setTitle(test.title);
    setAnswers([...test.answers]);
    setErrors({});
    setIsModalOpen(true);
  };

  const setAnswer = (index: number, value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSave = async () => {
    const dto: CreateTestDto = { title, answers };
    const result = testSchema.safeParse(dto);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);
    try {
      if (editingTest) {
        await updateTest(editingTest.id, result.data);
      } else {
        await createTest(result.data);
      }
      setIsModalOpen(false);
      fetchTests();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      await deleteTest(deleteTarget.id);
      setDeleteTarget(null);
      fetchTests();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Тесты</h1>
        <Button onClick={openCreate}>Создать тест</Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Название</th>
                <th className="px-4 py-3">Вопросов</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{test.title}</td>
                  <td className="px-4 py-3">{test.answers.length}</td>
                  <td className="flex justify-end gap-2 px-4 py-3">
                    <Button variant="secondary" onClick={() => openEdit(test)}>
                      Изменить
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setDeleteTarget(test)}
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
              {tests.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    Тесты не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTest ? "Редактировать тест" : "Новый тест"}
      >
        <div className="flex flex-col gap-4">
          <Input
            id="test-title"
            label="Название теста"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          {errors.answers && (
            <span className="text-xs text-red-500">{errors.answers}</span>
          )}

          <div className="grid grid-cols-4 gap-2">
            {answers.map((answer, index) => (
              <div key={index} className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">В.{index + 1}</label>
                <select
                  value={answer}
                  onChange={(e) => setAnswer(index, Number(e.target.value))}
                  className="rounded border border-gray-300 px-2 py-1 text-sm"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              {editingTest ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Удалить тест"
        message={`Вы уверены, что хотите удалить тест "${deleteTarget?.title}"?`}
        isLoading={isSaving}
      />
    </div>
  );
}
