import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Main from './routes/Main';
import store from './app/store';
import Login from './routes/Login';
import Signup from './routes/Signup';
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Navigate } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
const router = createBrowserRouter([{
  path: "/", children: [
    { path: "", element: (<PublicRoute><Login /></PublicRoute>) },
    { path: "signup", element: (<PublicRoute><Signup /></PublicRoute>) },
    { path: "chat", element: <PrivateRoute><Main /></PrivateRoute> },
  ]
}])

function isAuthenticated() {
  const isAuthenticated = localStorage.getItem("jwt");
  if (isAuthenticated !== null) {
    return true;
  }
  else {
    return false;
  }
}

function PrivateRoute({ children }) {
  const auth = isAuthenticated();
  return auth == true ? children : <Navigate to="/" />;
}

function PublicRoute({ children }) {
  const auth = isAuthenticated();
  console.log(auth)
  return auth == true ? (
    <Navigate to="/chat" />
  ) : (
    children
  );
}
root.render(
  <Provider store={store}>
    {/* <Root /> */}
    <RouterProvider router={router} />
  </Provider>
);