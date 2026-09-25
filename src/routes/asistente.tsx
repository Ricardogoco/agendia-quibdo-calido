import { createFileRoute } from "@tanstack/react-router";
import { AgendiaApp } from "@/components/agendia-app";
export const Route = createFileRoute("/asistente")({head:()=>({meta:[{title:"Asistente | AgendIA-UIB"},{name:"description",content:"Consulta tu día y finanzas con AgendIA-UIB."},{property:"og:title",content:"Asistente | AgendIA-UIB"},{property:"og:description",content:"Consulta tu día y finanzas con AgendIA-UIB."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:()=> <AgendiaApp view="asistente"/>});
