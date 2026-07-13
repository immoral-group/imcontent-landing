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

        {/* GTM — capa 2: cobertura completa del dominio */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <Script
            id="gtm-root"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
            ` }}
          />
        )}
      </body>
    </html>
  );
}
