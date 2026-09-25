import { createFileRoute } from "@tanstack/react-router";
import { AgendiaApp } from "@/components/agendia-app";
export const Route = createFileRoute("/notas")({head:()=>({meta:[{title:"Bloc de notas | AgendIA-UIB"},{name:"description",content:"Guarda tus apuntes rápidos en AgendIA-UIB."},{property:"og:title",content:"Bloc de notas | AgendIA-UIB"},{property:"og:description",content:"Guarda tus apuntes rápidos en AgendIA-UIB."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:()=> <AgendiaApp view="notas"/>});
