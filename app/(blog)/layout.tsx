import Script from 'next/script'
import { getVerticalConfig } from '@/lib/vertical'
import { BlogConfigProvider } from '@Immoral-marketing/motor-blog/lib/BlogConfigContext'
import { blogConfig } from '@/lib/blog-config'
import './blog-globals.css'

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const vertical = await getVerticalConfig()

  return (
    <BlogConfigProvider config={blogConfig}>
      <div className="blog-shell">
        {children}

      {/* GTM — capa blog */}
      {vertical?.google_tag_manager_id && (
        <Script
          id="gtm-blog"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${vertical.google_tag_manager_id}');
          ` }}
        />
      )}

      {/* GA — solo si NO hay GTM */}
      {vertical?.google_analytics_id && !vertical?.google_tag_manager_id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${vertical.google_analytics_id}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga-blog"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${vertical.google_analytics_id}');
            ` }}
          />
        </>
      )}

      {/* Scripts custom */}
      {vertical?.custom_head_scripts && (
        <div
          style={{ display: 'none' }}
          dangerouslySetInnerHTML={{ __html: vertical.custom_head_scripts }}
        />
      )}
      </div>
    </BlogConfigProvider>
  )
}
