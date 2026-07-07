import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./require-auth";
import { AppLayout } from "@/widgets/layout";
import { LoginPage } from "@/pages/login";
import { UsersPage } from "@/pages/users";
import { TestsPage } from "@/pages/tests";
import { TestDetailsPage } from "@/pages/test-details";
import { SolveTestPage } from "@/pages/solve-test";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/solve",
    element: <SolveTestPage />,
  },
  {
    path: "/solve/:test_id",
    element: <SolveTestPage />,
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
          { path: "tests/:test_id", element: <TestDetailsPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
