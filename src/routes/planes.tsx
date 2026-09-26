import { createFileRoute } from "@tanstack/react-router";
import { AgendiaApp } from "@/components/agendia-app";
export const Route = createFileRoute("/planes")({
  head: () => ({
    meta: [
      { title: "Planes | AgendIA-UIB" },
      { name: "description", content: "Conoce tu espacio personal en AgendIA-UIB." },
      { property: "og:title", content: "Planes | AgendIA-UIB" },
      { property: "og:description", content: "Conoce tu espacio personal en AgendIA-UIB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AgendiaApp view="planes" />,
});
