import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button, Input, Modal } from "@/shared/ui";
import {
  type Test,
  type TestTableResponse,
  type GetTestTableParams,
  getTestTable,
  createTest,
} from "@/entities/test";

const PAGE_SIZE = 10;

const testSchema = z.object({
  name: z.string().min(1, "Введите название теста"),
});

export function TestsPage() {
  const [tableData, setTableData] = useState<TestTableResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchTests = async (params: GetTestTableParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTestTable(params);
      setTableData(data);
    } catch {
      setError("Не удалось загрузить тесты");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests({ page: currentPage, page_size: PAGE_SIZE });
  }, [currentPage]);

  const openCreate = () => {
    setName("");
    setNameError(null);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    const result = testSchema.safeParse({ name });
    if (!result.success) {
      setNameError(result.error.issues[0].message);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await createTest(result.data);
      closeModal();
      fetchTests({ page: currentPage, page_size: PAGE_SIZE });
    } catch {
      setSaveError("Не удалось создать тест");
    } finally {
      setIsSaving(false);
    }
  };

  const tests: Test[] = useMemo(
    () => tableData?.results ?? [],
    [tableData],
  );

  const totalPages = tableData?.total_pages ?? 1;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Тесты</h1>
        <Button onClick={openCreate}>Создать тест</Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Название</th>
                  <th className="px-4 py-3">Дата создания</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id} className="border-b last:border-0">
                    <td className="px-4 py-3 text-gray-500">{test.id}</td>
                    <td className="px-4 py-3 font-medium">
                      <Link to={`/tests/${test.id}`} className="text-blue-600 hover:underline">
                        {test.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {test.created_date}
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Страница {tableData?.page} из {totalPages} (всего:{" "}
                {tableData?.count})
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={!tableData?.previous}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ← Назад
                </Button>
                <Button
                  variant="secondary"
                  disabled={!tableData?.next}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Вперёд →
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Новый тест">
        <div className="flex flex-col gap-4">
          {saveError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {saveError}
            </div>
          )}
          <Input
            id="test-name"
            label="Название теста"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            error={nameError ?? undefined}
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={closeModal}>
              Отмена
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              Создать
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
