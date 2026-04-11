import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

const logSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-log-dashboard",
});

export const metadata: Metadata = {
  title: "Lighthouse — Log console",
};

export default function LogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${logSans.variable} ${logSans.className} tracking-tight antialiased`}>
      {children}
    </div>
  );
}
