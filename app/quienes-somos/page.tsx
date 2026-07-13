import type { Metadata } from "next";
import { AboutUsPage } from "@/components/pages-legacy/AboutUsPage";
import { getBaseUrl } from "@/lib/site-url";

const title = "Quiénes somos | Imcontent";
const description =
  "Somos imcontent, parte de Immoral Group. Producimos contenido audiovisual con estructuras ligeras y equipos flexibles, combinando creatividad e inteligencia artificial.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getBaseUrl()}/quienes-somos`,
    siteName: "Imcontent",
    type: "website",
  },
};

export default function Page() {
  return <AboutUsPage />;
}
