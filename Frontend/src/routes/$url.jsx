import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
const VideoMeet = lazy(() => import("../pages/VideoMeet.jsx"));
const Route = createFileRoute("/$url")({
  head: () => ({
    meta: [
      { title: "Syncora meeting room \u2014 live video call" },
      {
        name: "description",
        content: "You're in a Syncora meeting room. Share your camera, mic, screen and chat in real time."
      },
      { property: "og:title", content: "Syncora meeting room" },
      {
        property: "og:description",
        content: "Join a live Syncora video meeting with screen share and chat."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ]
  }),
  component: MeetingRoute
});
function MeetingRoute() {
  return <ClientOnly fallback={null}>
      <Suspense fallback={null}>
        <VideoMeet />
      </Suspense>
    </ClientOnly>;
}
export {
  Route
};
