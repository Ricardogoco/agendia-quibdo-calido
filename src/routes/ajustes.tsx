import { createFileRoute } from "@tanstack/react-router";
import { AgendiaApp } from "@/components/agendia-app";
export const Route = createFileRoute("/ajustes")({head:()=>({meta:[{title:"Ajustes | AgendIA-UIB"},{name:"description",content:"Personaliza tu experiencia en AgendIA-UIB."},{property:"og:title",content:"Ajustes | AgendIA-UIB"},{property:"og:description",content:"Personaliza tu experiencia en AgendIA-UIB."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:()=> <AgendiaApp view="ajustes"/>});
