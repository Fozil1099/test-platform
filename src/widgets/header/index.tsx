import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth";
import { Button } from "@/shared/ui";

const navItems = [
  { to: "/tests", label: "Тесты" },
];

export function Header() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <nav className="flex gap-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Button variant="secondary" onClick={handleLogout}>
        Выйти
      </Button>
    </header>
  );
}
