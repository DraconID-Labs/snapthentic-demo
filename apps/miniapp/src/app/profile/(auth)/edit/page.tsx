"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { api } from "~/trpc/react";

interface ProfileForm {
  nickname?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  isPublic?: boolean;
}

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isProfileLoading } =
    api.userProfile.getMyProfile.useQuery();

  const upsertProfile = api.userProfile.upsert.useMutation({
    onSuccess: async () => {
      router.push("/profile");
      await queryClient.invalidateQueries();
    },
  });

  const [form, setForm] = useState<ProfileForm>({
    bio: "",
    location: "",
    twitterHandle: "",
    instagramHandle: "",
    isPublic: true,
  });

  useEffect(() => {
    if (profile) {
      // @ts-expect-error - whatever
      setForm((prev) => ({
        ...prev,
        ...profile,
      }));
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    // @ts-expect-error - whatever
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [name]: type === "checkbox" ? checked : value === "" ? undefined : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    upsertProfile.mutate(form);
  };

  if (isProfileLoading) return <Loader />;

  return (
    <div className="flex min-h-screen flex-col gap-4">
      <h1 className="text-xl font-semibold">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Bio */}
        <div>
          <label htmlFor="bio" className="mb-1 block text-sm">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={form.bio ?? ""}
            onChange={handleChange}
            placeholder="Tell us something about yourself"
            className="h-28 w-full rounded border border-gray-300 p-2 focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="mb-1 block text-sm">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={form.location ?? ""}
            onChange={handleChange}
            placeholder="Where do you live?"
            className="w-full rounded border border-gray-300 p-2 focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Twitter Handle */}
        <div>
          <label htmlFor="twitterHandle" className="mb-1 block text-sm">
            Twitter Handle
          </label>
          <input
            id="twitterHandle"
            name="twitterHandle"
            type="text"
            value={form.twitterHandle ?? ""}
            onChange={handleChange}
            placeholder="@yourtwitter"
            className="w-full rounded border border-gray-300 p-2 focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Instagram Handle */}
        <div>
          <label htmlFor="instagramHandle" className="mb-1 block text-sm">
            Instagram Handle
          </label>
          <input
            id="instagramHandle"
            name="instagramHandle"
            type="text"
            value={form.instagramHandle ?? ""}
            onChange={handleChange}
            placeholder="@yourinstagram"
            className="w-full rounded border border-gray-300 p-2 focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Public profile toggle */}
        <div className="flex items-center gap-2">
          <input
            id="isPublic"
            name="isPublic"
            type="checkbox"
            checked={form.isPublic ?? false}
            onChange={handleChange}
            className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPublic" className="text-sm">
            Make profile public
          </label>
        </div>

        <Button
          type="submit"
          disabled={upsertProfile.isPending}
          className="w-full"
        >
          {upsertProfile.isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  );
}
