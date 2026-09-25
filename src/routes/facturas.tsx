import { createFileRoute } from "@tanstack/react-router";
import { AgendiaApp } from "@/components/agendia-app";
export const Route = createFileRoute("/facturas")({head:()=>({meta:[{title:"Facturas | AgendIA-UIB"},{name:"description",content:"Mantén un registro de tus facturas en AgendIA-UIB."},{property:"og:title",content:"Facturas | AgendIA-UIB"},{property:"og:description",content:"Mantén un registro de tus facturas en AgendIA-UIB."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:()=> <AgendiaApp view="facturas"/>});
