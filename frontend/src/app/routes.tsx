import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Hero } from "./components/Hero";
import { Lab } from "./components/Lab";
import { Vault } from "./components/Vault";
import { Admin } from "./components/Admin";
import { About } from "./components/About";
import { Contact } from "./components/Contact";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Hero },
      { path: "about", Component: About },
      { path: "lab", Component: Lab },
      { path: "vault", Component: Vault },
      { path: "contact", Component: Contact },
      { path: "admin", Component: Admin },
    ],
  },
]);