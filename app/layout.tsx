import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers";
import { LocaleProvider } from "@/lib/locale-provider";
import { Suspense } from "react";
import ModelLinks from "./components/model-links";
import { LanguageSelector } from "./components/language-selector";
 
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
          {/* copyright @twk all rights reserved */}
          <a className='pt-1 text-teal-700 whitespace-nowrap overflow-x-hidden' href="https://twitter.com/twk" target="_blank" rel="noopener noreferrer">author: @twk</a>
          <Suspense>
            {/* <ModelLinks
              className="focus-visible:outline-none ml-2 mr-1 hover:text-teal-100 active:text-teal-50" /> */}
            <LanguageSelector
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
