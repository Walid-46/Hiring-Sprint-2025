"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Upload, LayoutGrid } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/upload-images", label: "Upload Images", icon: Upload },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen shadow-lg fixed left-0 top-0 flex flex-col">
      {/* Logo/Title */}
      <div className="px-6 py-8 border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight">DamageDetect</h1>
        <p className="text-gray-400 text-sm mt-1">Vehicle Inspection AI</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                pathname === href
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800 text-gray-400 text-sm">
        <p>© 2025 DamageDetect</p>
      </div>
    </aside>
  );
}
