"use client";

import { Camera, Home, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "~/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/snaps", label: "Snap", icon: Camera },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white pb-4 shadow-md md:hidden">
      <ul className="flex items-center justify-around py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));

          return (
            <li key={href}>
              <Link
                href={href}
                className="flex flex-col items-center justify-center text-xs"
              >
                <Icon
                  className={cn(
                    "size-6 transition-colors",
                    isActive ? "text-black" : "text-gray-500",
                  )}
                />
                <span
                  className={cn(
                    "mt-0.5 transition-colors",
                    isActive ? "text-black" : "text-gray-500",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
