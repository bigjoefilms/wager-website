import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ContextProvider from '../context'
import localFont from 'next/font/local'
import {twMerge } from "tailwind-merge";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });


const Aeonik = localFont({
  src: [
    {
      path: '../fonts/A-Bold.otf',
      weight: '500',
      style: 'bold',
    },
    {
      path: '../fonts/A-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/A-Light.otf',
      weight: '400',
      style: 'light',
    },
   
  ],
})

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "WagerWise",
  description: "Sonic Gaming Platform: Earn $SONIC While You Play!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={twMerge(Aeonik.className, "bg-[#efefef] text-black antialised)")}>
         <ContextProvider>  {children}</ContextProvider>
      </body>
    </html>
  );
}
