import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import Providers from "./providers";

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
        default: "Serie Neuro Path",
        template: "%s | Serie Neuro Path",
    },
    description:
        "AI-powered learning roadmap generator that helps you master any topic through dynamic, personalized study paths. Built on top of large language models, it turns goals into guided knowledge journeys—step by step, smart and structured.",
    keywords: [
        "Neuro Path",
        "Serie Neuro Path",
        "Roadmap",
        "Learning",
        "Study",
        "Roadmap Generator",
        "AI-powered roadmap generator",
        "Roadmap AI",
    ],
    authors: [
        {
            name: "LichtLabs <sena@lichtlabs.org>",
            url: "https://lichtlabs.org",
        },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
