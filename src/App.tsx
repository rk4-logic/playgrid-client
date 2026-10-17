import { createBrowserRouter, RouterProvider } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import "./App.css";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import TurfDetailsPage from "./pages/turf/TurfDetailsPage";
import TurfListPage from "./pages/turf/TurfListPage";
import MyBookingsPage from "./pages/booking/MyBookingsPage";
import AdminCatalogPage from "./pages/admin/AdminCatalogPage";
import AdminVenuesPage from "./pages/admin/AdminVenuesPage";
import AdminTurfsPage from "./pages/admin/AdminTurfsPage";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "turfs",
        element: <TurfListPage />,
      },
      {
        path: "turfs/:turfId",
        element: <TurfDetailsPage />,
      },
      {
        path: "bookings",
        element: <MyBookingsPage />,
      },
      {
        path: "admin/catalog",
        element: <AdminCatalogPage />,
      },
      {
        path: "admin/venues",
        element: <AdminVenuesPage />,
      },
      {
        path: "admin/turfs",
        element: <AdminTurfsPage />,
      },
      {
        path: "owner/dashboard",
        element: <OwnerDashboardPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;