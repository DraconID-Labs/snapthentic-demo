"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

interface ProfileForm {
  bio?: string;
  location?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  isPublic?: boolean;
}

export default function EditProfilePage() {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: profile, isLoading: isProfileLoading } =
    api.userProfile.me.useQuery();

  const upsertProfile = api.userProfile.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.userProfile.me.invalidate(),
        utils.snaps.getMySnaps.invalidate(),
      ]);
      router.push("/profile/me");
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
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
      setForm({
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        twitterHandle: profile.twitterHandle ?? "",
        instagramHandle: profile.instagramHandle ?? "",
        isPublic: profile.isPublic ?? true,
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertProfile.mutate(form);
  };

  if (isProfileLoading) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-screen flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link href="/profile/me">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
        {/* Bio */}
        <div>
          <label htmlFor="bio" className="mb-1 block text-sm font-medium">
            Bio
          </label>
          <Textarea
            id="bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Tell us something about yourself"
            rows={3}
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-medium">
            Location
          </label>
          <Input
            id="location"
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            placeholder="Where do you live?"
          />
        </div>

        {/* Twitter Handle */}
        <div>
          <label
            htmlFor="twitterHandle"
            className="mb-1 block text-sm font-medium"
          >
            Twitter Handle
          </label>
          <Input
            id="twitterHandle"
            name="twitterHandle"
            type="text"
            value={form.twitterHandle}
            onChange={handleChange}
            placeholder="@yourtwitter"
          />
        </div>

        {/* Instagram Handle */}
        <div>
          <label
            htmlFor="instagramHandle"
            className="mb-1 block text-sm font-medium"
          >
            Instagram Handle
          </label>
          <Input
            id="instagramHandle"
            name="instagramHandle"
            type="text"
            value={form.instagramHandle}
            onChange={handleChange}
            placeholder="@yourinstagram"
          />
        </div>

        {/* Visibility */}
        <div className="flex items-center gap-2">
          <input
            id="isPublic"
            name="isPublic"
            type="checkbox"
            checked={form.isPublic}
            onChange={handleChange}
            className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPublic" className="text-sm font-medium">
            Make profile public
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={upsertProfile.isPending}
          className="w-full"
        >
          {upsertProfile.isPending ? (
            <>
              <Loader className="mr-2 size-4" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Save Changes
            </>
          )}
        </Button>

        {upsertProfile.error && (
          <p className="text-sm text-red-600">
            Error: {upsertProfile.error.message}
          </p>
        )}
      </form>
    </div>
  );
}
