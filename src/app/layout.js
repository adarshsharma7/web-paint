import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "SyncDraw - Real-time Collaborative Drawing",
  description: "SyncDraw is a cutting-edge collaborative platform that allows users to draw together in real-time on a shared whiteboard. Features include voice chat, text-based notifications that appear briefly and fade away, split and merge screen options for enhanced collaboration, and intuitive drawing tools. Perfect for creative teamwork, brainstorming, and interactive sessions.",
  keywords: "SyncDraw, real-time collaboration, drawing app, voice chat, text notifications, split screen, merge screen, collaborative whiteboard, online creativity, WebRTC drawing",
  author: "Adarsh Sharma",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        < Toaster />

      </body>
    </html>
  );
}
