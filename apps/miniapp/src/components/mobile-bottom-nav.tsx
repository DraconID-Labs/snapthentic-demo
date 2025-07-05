"use client";

import {
  ArrowLeft,
  Camera,
  Check,
  Home,
  Lock,
  RedoDot,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader } from "~/components/ui/drawer";
import { cn } from "~/utils/cn";
import {
  type SnapData,
  SnapDrawerContent,
} from "~/app/snaps/_components/snap-drawer-content";
import { Button } from "./ui/button";
import { useSessionWithProfile } from "~/hooks/use-session-with-profile";

interface NavItem {
  href: string | null;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export default function MobileBottomNav() {
  const session = useSessionWithProfile();
  const pathname = usePathname();
  const [isSnapDrawerOpen, setIsSnapDrawerOpen] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [snapData, setSnapData] = useState<SnapData>({});

  const handleRedo = useCallback(() => {
    setCurrentStepIdx(0);
    setSnapData({});
  }, []);

  const handleSnapClick = useCallback(() => {
    setIsSnapDrawerOpen(true);
  }, []);

  const navItems: NavItem[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    {
      href: null,
      label: "Snap",
      icon: Camera,
      isHighlighted: true,
      onClick: handleSnapClick,
    },
    { href: "/verify", label: "Verify", icon: Check },
    { href: "/profile", label: "Profile", icon: User },
  ];

  // biome-ignore lint/correctness/useExhaustiveDependencies: bro please
  useEffect(() => {
    setIsSnapDrawerOpen(false);
  }, [pathname]);

  const updateSnapData = useCallback((partial: Partial<SnapData>) => {
    setSnapData((prev) => ({ ...prev, ...partial }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIdx((idx) => Math.min(idx + 1, 3));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStepIdx((idx) => Math.max(idx - 1, 0));
  }, []);

  return (
    <>
      <Drawer open={isSnapDrawerOpen} onOpenChange={setIsSnapDrawerOpen}>
        <DrawerContent>
          {session.status !== "authenticated" && (
            <DrawerHeader className="flex w-full justify-between">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={prevStep}>
                  <ArrowLeft />
                </Button>
                <Button variant="ghost" onClick={handleRedo}>
                  <RedoDot className="-scale-x-100" />
                </Button>
              </div>
            </DrawerHeader>
          )}
          <div className="mb-10 size-full px-4">
            {session.status !== "authenticated" ? (
              <SnapDrawerContent
                data={snapData}
                updateData={updateSnapData}
                currentStepIdx={currentStepIdx}
                next={nextStep}
                prev={prevStep}
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center ">
                <Lock className="size-[100px] text-gray-400" />
                <p className="mb-4 text-xl font-bold">No profile!</p>
                <Link href="/profile">
                  <Button>Create Profile</Button>
                </Link>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white pb-4 shadow-md">
        <ul className="flex items-center justify-around pt-3">
          {navItems.map(
            ({ href, label, icon: Icon, isHighlighted, onClick }) => {
              const isActive =
                href &&
                (pathname === href ||
                  (href !== "/" && pathname.startsWith(href)));

              const ItemContent = (
                <>
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
            },
          )}
        </ul>
      </nav>
    </>
  );
}
