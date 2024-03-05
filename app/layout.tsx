import type { Metadata } from "next";
import { AI } from "./action";
import "./globals.css";
 
export const metadata: Metadata = {
  title: "Mulai3",
  description: "Generated by create next app",
};
 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <AI>
          {children}
        </AI>
      </body>
    </html>
  );
}