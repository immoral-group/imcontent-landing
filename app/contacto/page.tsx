import type { Metadata } from "next";
import { ContactPage } from "@/components/pages-legacy/ContactPage";
import { getBaseUrl } from "@/lib/site-url";

const title = "Contacto | Imcontent";
const description =
  "Cuéntanos qué tienes en mente y te ayudamos a definir el formato, el enfoque y el presupuesto de tu contenido audiovisual. Sin compromiso, sin procesos largos.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getBaseUrl()}/contacto`,
    siteName: "Imcontent",
    type: "website",
  },
};

export default function Page() {
  return <ContactPage />;
}
