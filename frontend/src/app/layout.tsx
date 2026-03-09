import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ComplianceScout",
  description: "Autonomous regulatory compliance monitoring",
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/rules", label: "Rules" },
  { href: "/results", label: "Results" },
  { href: "/audit-logs", label: "Audit Logs" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Navbar */}
        <header className="bg-brand-700 text-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              🐟 ComplianceScout
            </Link>
            <nav className="flex gap-6 text-sm font-medium">
              {navItems.map((n) => (
                <Link key={n.href} href={n.href} className="hover:underline underline-offset-4">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-100 text-center text-xs text-gray-500 py-4">
          ComplianceScout · Built with TinyFish Web Agent API
        </footer>
      </body>
    </html>
  );
}
