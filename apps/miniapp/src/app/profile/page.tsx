"use client";

import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function Page() {
  const {
    data: profile,
    isLoading,
    isError,
  } = api.userProfile.getMyProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile || isError) {
    return <div>No profile found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Button Showcase */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Button Variants
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="dark">Dark</Button>
            <Button variant="light">Light</Button>
            <Button variant="destructive">Delete</Button>
          </div>

          <h3 className="mb-2 mt-6 text-sm font-semibold text-gray-700">
            Sizes
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🎯</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
