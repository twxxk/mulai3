import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers";
import { LocaleProvider } from "@/lib/client/locale-context";
import { Suspense } from "react";
import ModelLinks from "./components/model-links";
import { LanguageSelector } from "../components/client/language-selector";
import InfoLinks from "@/lib/client/info-links";
 
export const metadata: Metadata = {
  title: (process.env.NODE_ENV === 'development' ? '(dev) ' : '')
   + "Mulai3",
  description: "RSC AIs Chat",
};
 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = headers().get('x-negotiated-locale') ?? 'en' as string

  return (
    // suppressHydrationWarnings to deal with grammarly and other extentions
    // https://stackoverflow.com/questions/75337953/what-causes-nextjs-warning-extra-attributes-from-the-server-data-new-gr-c-s-c    
    <html lang={locale} className="overscroll-none" suppressHydrationWarning>
      <body className="flex flex-col h-dvh overscroll-none" suppressHydrationWarning>
      <LocaleProvider locale={locale}>
        <header className="w-screen bg-teal-600 text-white text-xs p-4 h-14 flex flex-row">
          <a className='flex-1 text-xl hover:text-teal-100 active:text-teal-50  whitespace-nowrap' href="/"><h1>
          <strong className="font-bold">MulAI3</strong>
          </h1></a>
          <a className="mx-4 text-lg" 
                    href="https://forms.gle/7TrHHb1mfRmwjg8R6"
                    target="_blank" rel="noopener noreferrer">{
                      (locale == 'ja') ? 'アンケートにご協力ください!' : 'Plase help us improve the service!'
                    }</a>            
          <Suspense>
            {/* <ModelLinks
              className="focus-visible:outline-none ml-2 mr-1 hover:text-teal-100 active:text-teal-50" /> */}
            <LanguageSelector
              className="focus-visible:outline-none ml-1 hover:text-teal-100 active:text-teal-50" />
            <InfoLinks selectedService="mulai3"
              className="focus-visible:outline-none ml-1 hover:text-teal-100 active:text-teal-50" />
          </Suspense>
        </header>
        {/* without min-h-0, main has scrollbars when child contents grow. perhaps the browser bug */}
        <main className="flex-1 min-h-0">
          {children}
        </main>
      </LocaleProvider>
      </body>
    </html>
  );
}

export const runtime = 'edge';
