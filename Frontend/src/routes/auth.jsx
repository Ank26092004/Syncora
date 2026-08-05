import { createFileRoute } from "@tanstack/react-router";
import Authentication from "../pages/Authentication.jsx";
const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create your Syncora account" },
      {
        name: "description",
        content: "Log in or register for Syncora to host secure HD video meetings and keep your meeting history in sync."
      },
      { property: "og:title", content: "Sign in to Syncora" },
      {
        property: "og:description",
        content: "Log in or register for Syncora video meetings."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ]
  }),
  component: Authentication
});
export {
  Route
};
