import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { ClipLoader } from "react-spinners";

const Header = lazy(() => import("./components/Header"));
const Create = lazy(() => import("./components/Create"));
const View = lazy(() => import("./components/View"));
const Update = lazy(() => import("./components/Update"));

const LoadingSpinner = () => (
  <div className="vh-100 d-flex justify-content-center align-items-center">
    <ClipLoader
      color={"#123abc"}
      size={150}
      aria-label="Loading Spinner"
      data-testid="loader"
    />
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
        <Create />
      </Suspense>
    ),
  },
  {
    path: "/create",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
        <Create />
      </Suspense>
    ),
  },
  {
    path: "/view",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
        <View />
      </Suspense>
    ),
  },
  {
    path: "/view/edit/:id",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Header />
        <Update />
      </Suspense>
    ),
  },
]);

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
