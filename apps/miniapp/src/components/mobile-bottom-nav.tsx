"use client";

import { Camera, Check, Home, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "~/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isHighlighted?: boolean;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/snaps", label: "Snap", icon: Camera, isHighlighted: true },
  { href: "/verify", label: "Verify", icon: Check },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white pb-4 shadow-md">
      <ul className="flex items-center justify-around pt-3">
        {navItems.map(({ href, label, icon: Icon, isHighlighted }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));

          return (
            <li key={href}>
              <Link
                href={href}
                className="relative z-10 flex flex-col items-center justify-center text-xs"
              >
                {isHighlighted && (
                  <div className="absolute -top-[10px] z-[-1] h-[100px] w-20 rounded-full bg-yellow-600/20" />
                )}
                <Icon
                  className={cn(
                    "size-6 transition-colors",
                    isHighlighted && "size-8",
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
