import type { Metadata } from "next";
import { ServicesPage } from "@/components/pages-legacy/ServicesPage";
import { getBaseUrl } from "@/lib/site-url";

const title = "Servicios | Imcontent";
const description =
  "Vídeos cortos, contenido para redes y piezas audiovisuales creadas con IA. Cada formato responde a un objetivo distinto: te ayudamos a elegir el que mejor encaje con tu marca.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getBaseUrl()}/servicios`,
    siteName: "Imcontent",
    type: "website",
  },
};

export default function Page() {
  return <ServicesPage />;
}
