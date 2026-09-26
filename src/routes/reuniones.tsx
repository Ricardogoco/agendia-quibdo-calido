import { createFileRoute } from "@tanstack/react-router";
import { AgendiaApp } from "@/components/agendia-app";
export const Route = createFileRoute("/reuniones")({
  head: () => ({
    meta: [
      { title: "Reuniones | AgendIA-UIB" },
      { name: "description", content: "Organiza tus reuniones con AgendIA-UIB." },
      { property: "og:title", content: "Reuniones | AgendIA-UIB" },
      { property: "og:description", content: "Organiza tus reuniones con AgendIA-UIB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AgendiaApp view="reuniones" />,
});
