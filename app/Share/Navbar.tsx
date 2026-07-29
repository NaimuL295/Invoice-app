"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  UserRoundPen,
  PlusCircle,
  LayoutDashboard,
  ReceiptText,
  FilePenLine,
  LogIn,
  LogOut,
  PackagePlus,
  Boxes,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200/80 z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="bg-green-600 p-2 rounded-xl text-white shadow-md shadow-green-200">
              <ReceiptText size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              QuickBill
            </span>
          </div>

          <nav className="space-y-1.5">
            <DesktopNavLink
              href="/transition"
              icon={<LayoutDashboard size={20} />}
              label="Transition"
              active={pathname === "/transition" || pathname === "/"}
            />

            <DesktopNavLink
              href="/create"
              icon={<PlusCircle size={20} />}
              label="New Invoice"
              active={pathname === "/create"}
            />

            <DesktopNavLink
              href="/products/create"
              icon={<PackagePlus size={20} />}
              label="Product Details"
              active={pathname === "/products/create"}
            />

            <DesktopNavLink
              href="/allproducts"
              icon={<Boxes size={20} />}
              label="All Products"
              active={pathname === "/allproducts"}
            />

            <DesktopNavLink
              href="/profile"
              icon={<UserRoundPen size={20} />}
              label="Profile"
              active={pathname === "/profile"}
            />

            <DesktopNavLink
              href="/print-settings"
              icon={<FilePenLine size={20} />}
              label="Print Settings"
              active={pathname === "/print-settings"}
            />
          </nav>
        </div>

        {/* Desktop Bottom Section */}
        <div className="mt-auto p-6 border-t border-slate-100">
          {!user ? (
            <DesktopNavLink
              href="/auth/login"
              icon={<LogIn size={20} />}
              label="Log In"
              active={pathname === "/auth/login"}
            />
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 w-full text-sm"
            >
              <LogOut size={20} />
              Log Out
            </button>
          )}
        </div>
      </aside>

      {/* --- MOBILE BOTTOM BAR --- */}
    {/* --- MOBILE BOTTOM BAR --- */}
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-1 z-50 shadow-lg">
  <ul className="flex justify-between items-center max-w-md mx-auto">
    <MobileTab
      href="/transition"
      icon={<LayoutDashboard size={18} />}
      active={pathname === "/transition" || pathname === "/"}
    />

    <MobileTab
      href="/allproducts"
      icon={<Boxes size={18} />}
      active={pathname === "/allproducts"}
    />

    {/* Floating Action Button */}
    <li className="-mt-6">
      <Link
        href="/create"
        className="flex items-center justify-center bg-green-600 p-2.5 rounded-full text-white shadow-lg shadow-green-200 border-4 border-white active:scale-95 transition-transform"
      >
        <PlusCircle size={20} />
      </Link>
    </li>

    <MobileTab
      href="/print-settings"
      icon={<FilePenLine size={18} />}
      active={pathname === "/print-settings"}
    />

    <MobileTab
      href="/profile"
      icon={<UserRoundPen size={18} />}
      active={pathname === "/profile"}
    />
  </ul>
</nav>
    </>
  );
}

// --- SUB-COMPONENTS ---

function DesktopNavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all font-semibold ${
        active
          ? "bg-green-50 text-green-700 shadow-sm"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileTab({
  href,
  icon,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors relative ${
          active ? "text-green-600" : "text-slate-400 hover:text-slate-600"
        }`}
      >
        {icon}
        {active && (
          <span className="absolute -bottom-1 w-1 h-1 bg-green-600 rounded-full" />
        )}
      </Link>
    </li>
  );
}