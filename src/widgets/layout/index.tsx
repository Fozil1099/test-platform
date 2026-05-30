import { Outlet } from "react-router-dom";
import { Header } from "@/widgets/header";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
