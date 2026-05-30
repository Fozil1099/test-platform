import { useEffect, useState } from "react";
import { z } from "zod";
import { Button, Input, Select, Modal, ConfirmDialog } from "@/shared/ui";
import {
  type User,
  type CreateUserDto,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/entities/user";

const userSchema = z.object({
  username: z.string().min(1, "Обязательное поле"),
  password: z.string().min(1, "Обязательное поле"),
  role: z.enum(["admin", "teacher", "student"], { message: "Выберите роль" }),
});

const roleOptions = [
  { value: "admin", label: "Администратор" },
  { value: "teacher", label: "Преподаватель" },
  { value: "student", label: "Ученик" },
];

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState<CreateUserDto>({
    username: "",
    password: "",
    role: "student",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await getUsers();
        if (!ignore) setUsers(data);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const data = await getUsers();
    setUsers(data);
    setIsLoading(false);
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm({ username: "", password: "", role: "student" });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({ username: user.username, password: "", role: user.role });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const result = userSchema.safeParse(form);
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
      if (editingUser) {
        await updateUser(editingUser.id, result.data);
      } else {
        await createUser(result.data);
      }
      setIsModalOpen(false);
      fetchUsers();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      fetchUsers();
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <Button onClick={openCreate}>Добавить</Button>
      </div>

      <Input
        placeholder="Поиск по имени..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-xs"
      />

      {isLoading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Имя пользователя</th>
                <th className="px-4 py-3">Роль</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="flex justify-end gap-2 px-4 py-3">
                    <Button variant="secondary" onClick={() => openEdit(user)}>
                      Изменить
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setDeleteTarget(user)}
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    Пользователи не найдены
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
        title={
          editingUser ? "Редактировать пользователя" : "Новый пользователь"
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            id="username"
            label="Имя пользователя"
            value={form.username}
            onChange={(e) =>
              setForm((f) => ({ ...f, username: e.target.value }))
            }
            error={errors.username}
          />
          <Input
            id="password"
            label="Пароль"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            error={errors.password}
          />
          <Select
            id="role"
            label="Роль"
            options={roleOptions}
            value={form.role}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                role: e.target.value as CreateUserDto["role"],
              }))
            }
            error={errors.role}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              {editingUser ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Удалить пользователя"
        message={`Вы уверены, что хотите удалить пользователя "${deleteTarget?.username}"?`}
        isLoading={isSaving}
      />
    </div>
  );
}
