import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./require-auth";
import { AppLayout } from "@/widgets/layout";
import { LoginPage } from "@/pages/login";
import { UsersPage } from "@/pages/users";
import { TestsPage } from "@/pages/tests";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/tests" replace /> },
          { path: "users", element: <UsersPage /> },
          { path: "tests", element: <TestsPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
