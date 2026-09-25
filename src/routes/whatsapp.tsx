import { createFileRoute } from "@tanstack/react-router";
import { AgendiaApp } from "@/components/agendia-app";
export const Route = createFileRoute("/whatsapp")({head:()=>({meta:[{title:"WhatsApp | AgendIA-UIB"},{name:"description",content:"Comparte tu agenda por WhatsApp con AgendIA-UIB."},{property:"og:title",content:"WhatsApp | AgendIA-UIB"},{property:"og:description",content:"Comparte tu agenda por WhatsApp con AgendIA-UIB."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:()=> <AgendiaApp view="whatsapp"/>});
