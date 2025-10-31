import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Nomi Money MVP",
    description: "Privacy invoices with Self + Nightfall"
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="h-full">
      <body className="min-h-screen bg-nomi.bg text-slate-100">
        <div className="max-w-5xl mx-auto py-8">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              Nomi Money
            </h1>
            <nav className="flex gap-4 text-sm">
              <a href="/" className="hover:text-nomi.accent">Overview</a>
              <a href="/invoice" className="hover:text-nomi.accent">Create Invoice</a>
              <a href="/pay" className="hover:text-nomi.accent">Pay</a>
              <a href="/receipts" className="hover:text-nomi.accent">Receipts</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
	);
}
