import './index.css';
import React from 'react';
import store from './app/store';
import Main from './routes/Main';
import Login from './routes/Login';
import Signup from './routes/Signup';
import Root from './components/Root';
import { Provider } from "react-redux";
import ReactDOM from 'react-dom/client';
import { Navigate } from "react-router-dom";
import ChatBodyMod from './components/ChatBodyMod';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * Configuring our routes for routing at client side.
 */
const router = createBrowserRouter([
  {
    element:(<PrivateRoute><Root/></PrivateRoute>),
    children:[
    {
      path: "chat",
      element: <Main />
    },
    {
      path: "chat/:id",
      element: <ChatBodyMod />
    }
  ]},
  { path: "/", element: (<PublicRoute><Login /></PublicRoute>) },
  { path: "signup", element: (<PublicRoute><Signup /></PublicRoute>) },
])

/**
 * Used to verify if the user is authenticated.
 * @returns {True} If user is authenticated(JWT exists).
 * @returns {False} If user is not authenticated(JWT doesnt exists).
 */

function isAuthenticated() {
  const isAuthenticated = localStorage.getItem("jwt");
  if (isAuthenticated !== null) {
    return true;
  }
  else {
    return false;
  }
}

/**
 * Defines how to process the route based on if user is authenticated or not. 
 * @returns {children} If user is authenticated we will allow to return children components.
 * @returns {Redirect} If user is not authenticated we will not allow and redirect to login page.
 */

function PrivateRoute({ children }) {
  const auth = isAuthenticated();
  return auth == true ? children : <Navigate to="" />;
}

/**
 * Defines how to process the route based on if user is authenticated or not. 
 * @returns {children} If user is authenticated we will not allow and redirect to chat page.
 * @returns {Redirect} If user is not authenticated we will allow to return children components.
 */

function PublicRoute({ children }) {
  const auth = isAuthenticated();
  return auth == true ? (
    <Navigate to="/chat" />
  ) : (
    children
  );
}
root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);