import type { Metadata } from "next";
import { HomePage } from "@/components/pages-legacy/HomePage";
import { getBaseUrl } from "@/lib/site-url";

const title = "Imcontent | Contenido audiovisual creado con IA";
const description =
  "Contenido audiovisual creado con IA. Más rapidez, más eficiencia y foco en resultados para tu marca.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: getBaseUrl() || undefined,
    siteName: "Imcontent",
    type: "website",
  },
};

export default function Page() {
  return <HomePage />;
}
