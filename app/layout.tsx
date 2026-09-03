import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "JobTrack | Job Application Tracker",
    template: "%s | JobTrack",
  },
  description:
    "JobTrack helps job seekers organize applications, track hiring progress, and manage their job search in one place.",
  openGraph: {
    title: "JobTrack | Job Application Tracker",
    description:
      "Organize job applications and track your progress through the hiring process with JobTrack.",
    type: "website",
    siteName: "JobTrack",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
