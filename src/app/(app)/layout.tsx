import type { Metadata } from "next";
import "../globals.css";
import AuthGate from "@/components/AuthGate";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "MVP App",
  description: "Internal MVP",
};

export default function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="min-h-screen block md:grid grid-cols-[240px_1fr]">
        <Sidebar />
        <main className="p-6">{children}</main>
      </div>
    </AuthGate>
  );
}
