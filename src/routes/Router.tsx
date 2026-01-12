import { lazy } from "react";
import { Navigate } from "react-router";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

// Layouts
const FullLayout = lazy(() => import("../layouts/full/FullLayout"));
const BlankLayout = lazy(() => import("../layouts/blank/BlankLayout"));

// Pages - Magazine Platform
const MagazineDashboard = lazy(
  () => import("../views/dashboard/MagazineDashboard")
);
const ArticlesListPage = lazy(
  () => import("../views/articles/ArticlesListPage")
);
const ArticleEditorPage = lazy(
  () => import("../views/articles/ArticleEditorPage")
);
const SubmissionsPage = lazy(() => import("../views/articles/SubmissionsPage"));
const UsersManagementPage = lazy(
  () => import("../views/users/UsersManagementPage")
);
const CategoriesPage = lazy(() => import("../views/categories/CategoriesPage"));
const IssuesPage = lazy(() => import("../views/issues/IssuesPage"));
const CommentsPage = lazy(() => import("../views/comments/CommentsPage"));
const MediaLibraryPage = lazy(() => import("../views/media/MediaLibraryPage"));
const AuditLogsPage = lazy(() => import("../views/audit/AuditLogsPage"));
const SubscriptionsPage = lazy(
  () => import("../views/subscriptions/SubscriptionsPage")
);
const Login = lazy(() => import("../views/authentication/Login"));

const Router = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="/admin/dashboard" />,
      },
      {
        path: "/admin",
        element: <Navigate to="/admin/dashboard" />,
      },
      {
        path: "/admin/dashboard",
        element: (
          <ProtectedRoute>
            <MagazineDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/articles",
        element: (
          <ProtectedRoute>
            <ArticlesListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/articles/new",
        element: (
          <ProtectedRoute>
            <ArticleEditorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/articles/:id/edit",
        element: (
          <ProtectedRoute>
            <ArticleEditorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/articles/:id/preview",
        element: (
          <ProtectedRoute>
            <ArticleEditorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/articles/:articleId/review/:revisionId",
        element: (
          <ProtectedRoute>
            <ArticleEditorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/submissions",
        element: (
          <ProtectedRoute>
            <SubmissionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <ProtectedRoute>
            <UsersManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/categories",
        element: (
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/issues",
        element: (
          <ProtectedRoute>
            <IssuesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/comments",
        element: (
          <ProtectedRoute>
            <CommentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/media",
        element: (
          <ProtectedRoute>
            <MediaLibraryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/analytics",
        element: (
          <ProtectedRoute>
            <MagazineDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/audit-logs",
        element: (
          <ProtectedRoute>
            <AuditLogsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/subscriptions",
        element: (
          <ProtectedRoute>
            <SubscriptionsPage />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: "/auth",
    element: <BlankLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "*", element: <Navigate to="/auth/login" /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/auth/login" replace />,
  },
];

export default Router;
