"use client";

import { Camera, Check, Home, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/utils/cn";

interface NavItem {
  href: string | null;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
}

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/contests", label: "Contests", icon: Trophy },
    {
      href: "/snaps/take",
      label: "Snap",
      icon: Camera,
    },
    { href: "/verify", label: "Verify", icon: Check },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white pb-4 shadow-md">
        <ul className="flex items-center justify-around pt-3">
          {navItems.map(({ href, label, icon: Icon, onClick }) => {
            const isActive =
              href &&
              (pathname === href ||
                (href !== "/" && pathname.startsWith(href)));

            const ItemContent = (
              <>
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
              </>
            );

            return (
              <li key={label}>
                {href ? (
                  <Link
                    href={href}
                    className="relative z-10 flex flex-col items-center justify-center text-xs"
                  >
                    {ItemContent}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={onClick}
                    className="relative z-10 flex flex-col items-center justify-center text-xs"
                  >
                    {ItemContent}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
