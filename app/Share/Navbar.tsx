"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  UserRoundPen,
  PlusCircle,
  LayoutDashboard,
  ReceiptText,
  FilePenLine,
  GalleryVerticalEnd,
  LogIn,
  LogOut,
  PackagePlus,
  Boxes,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-slate-200/80 z-40 transaction-all duration-200 ${collapsed ? "w-24" : "w-64"
          }`}
      >
        <div className="p-6">
          <div
            className={`flex items-center mb-8 ${collapsed ? "justify-center px-0" : "gap-3 px-2 justify-between"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-xl text-white shadow-md shadow-green-200 shrink-0">
                <ReceiptText size={22} />
              </div>
              {!collapsed && (
                <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
                <Link href="/">QuickBill</Link>
                </span>
              )}
            </div>

            {/* Toggle icon */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className={`text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg p-1.5 ${collapsed ? "mt-3" : ""
                }`}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>

          <nav className="space-y-1.5">


            <DesktopNavLink
              href="/create"
              icon={<PlusCircle size={20} />}
              label="New Invoice"
              active={pathname === "/create"}
              collapsed={collapsed}
            />

            <DesktopNavLink
              href="/products/create"
              icon={<PackagePlus size={20} />}
              label="Product Details"
              active={pathname === "/products/create"}
              collapsed={collapsed}
            />

            <DesktopNavLink
              href="/allproducts"
              icon={<Boxes size={20} />}
              label="All Products"
              active={pathname === "/allproducts"}
              collapsed={collapsed}
            />

            <DesktopNavLink
              href="/profile"
              icon={<UserRoundPen size={20} />}
              label="Profile"
              active={pathname === "/profile"}
              collapsed={collapsed}
            />
            <DesktopNavLink
              href="/transaction"
              icon={<LayoutDashboard size={20} />}
              label="Transaction"
              active={pathname === "/transaction" || pathname === "/"}
              collapsed={collapsed}
            />
            <DesktopNavLink
              href="/transaction-history"
              icon={<GalleryVerticalEnd size={20} />}
              label="Transaction-History"
              active={pathname === "/transaction-history" || pathname === "/"}
              collapsed={collapsed}
            />



            <DesktopNavLink
              href="/print-settings"
              icon={<FilePenLine size={20} />}
              label="Print Settings"
              active={pathname === "/print-settings"}
              collapsed={collapsed}
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
              collapsed={collapsed}
            />
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className={`flex items-center rounded-xl transaction-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 w-full text-sm ${collapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
                }`}
              title={collapsed ? "Log Out" : undefined}
            >
              <LogOut size={20} />
              {!collapsed && "Log Out"}
            </button>
          )}
        </div>
      </aside>

      {/* --- MOBILE BOTTOM BAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-1 z-50 shadow-lg">
        <ul className="flex justify-between items-center max-w-md mx-auto">



          <MobileTab
            href="/allproducts"
            icon={<Boxes size={18} />}
            active={pathname === "/allproducts"}
          />

          {/* Floating Action Button */}
          <li className="-mt-6">
            <Link
              href="/create"
              className="flex items-center justify-center bg-green-600 p-2.5 rounded-full text-white shadow-lg shadow-green-200 border-4 border-white active:scale-95 transaction-transform"
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
          <MobileTab
            href="/transaction"
            icon={<LayoutDashboard size={18} />}
            active={pathname === "/transaction" || pathname === "/"}
          />


          <MobileTab
            href="/transaction-history"
            icon={<GalleryVerticalEnd size={20} />}
            active={pathname === "/transaction-history" || pathname === "/"}

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
  collapsed,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center rounded-xl text-sm transaction-all font-semibold ${collapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
        } ${active
          ? "bg-green-50 text-green-700 shadow-sm"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }`}
    >
      {icon}
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
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
        className={`flex flex-col items-center justify-center p-2 rounded-xl transaction-colors relative ${active ? "text-green-600" : "text-slate-400 hover:text-slate-600"
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