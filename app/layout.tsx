import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import Script from 'next/script'
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Providers from "./providers";
import { TrackingInjector } from "@Immoral-marketing/motor-blog";
import { getBaseUrl } from "@/lib/site-url";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Imcontent",
  description: "Contenido audiovisual creado con IA. Más rapidez, más eficiencia y foco en resultados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = getBaseUrl();

  // JSON-LD Organization/WebSite — base mínima de datos estructurados para
  // todas las páginas del sitio (SPEC-04). El JSON-LD `Article` de los
  // posts de blog queda fuera de este repo (paquete @Immoral-marketing/motor-blog).
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "imcontent",
      url: baseUrl || undefined,
      logo: baseUrl ? `${baseUrl}/assets/4b809f1bb00613cd9fd4d3b0f6724cf9516b9d57.png` : undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "imcontent",
      url: baseUrl || undefined,
    },
  ];

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${lexend.variable} antialiased min-h-screen bg-white relative`}>
        <script
          id="jsonld-organization-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <TrackingInjector verticalId={process.env.VERTICAL_ID} />
        <Providers>
          <Header />
          <main className="relative">
            {children}
          </main>
          <Footer />
        </Providers>

        {/* GA4 directo (SPEC-07 v2.0): decisión 14/07/2026, sin GTM — mismo
            patrón que el Catálogo de Procesos y que immoral.es. ID de la
            propiedad GA4 "imcontent.es" creada el mismo día. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WR0VBSQ3WF"
          strategy="afterInteractive"
        />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WR0VBSQ3WF');
          ` }}
        />
      </body>
    </html>
  );
}
