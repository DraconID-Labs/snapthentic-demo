"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { api } from "~/trpc/react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

interface SnapEditForm {
  title?: string;
  description?: string;
  isPublic?: boolean;
}

export default function EditSnapPage() {
  const params = useParams();
  const router = useRouter();
  const session = useSession();
  const snapId = params.id as string;

  const [form, setForm] = useState<SnapEditForm>({
    title: "",
    description: "",
    isPublic: true,
  });

  const {
    data: snap,
    isLoading: isSnapLoading,
    error: snapError,
  } = api.snaps.getById.useQuery({ snapId });

  const updateSnapMutation = api.snaps.update.useMutation({
    onSuccess: () => {
      // Invalidate queries to refresh the data
      void api.useUtils().snaps.getById.invalidate({ snapId });
      void api.useUtils().snaps.getMySnaps.invalidate();
      void api.useUtils().snaps.getFeed.invalidate();
      router.push(`/snaps/${snapId}`);
    },
    onError: (error) => {
      console.error("Failed to update snap:", error);
    },
  });

  // Check if user is the owner
  const isOwner = session.data?.user.id === snap?.userId;

  // Populate form with existing data
  useEffect(() => {
    if (snap) {
      setForm({
        title: snap.title ?? "",
        description: snap.description ?? "",
        isPublic: snap.isPublic ?? true,
      });
    }
  }, [snap]);

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
    updateSnapMutation.mutate({
      snapId,
      title: form.title,
      description: form.description,
      isPublic: form.isPublic,
    });
  };

  if (session.status === "loading" || isSnapLoading) {
    return <Loader />;
  }

  if (session.status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (snapError || !snap) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-xl font-bold">Snap not found</h1>
        <Link href="/feed">
          <Button variant="outline" className="mt-4">
            Back to Feed
          </Button>
        </Link>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p className="text-gray-600">You can only edit your own snaps.</p>
        <Link href={`/snaps/${snapId}`}>
          <Button variant="outline" className="mt-4">
            View Snap
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/snaps/${snapId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Edit Snap</h1>
      </div>

      {/* Preview of the snap */}
      <div className="w-full max-w-md">
        <img
          src={snap.photoUrl}
          alt={snap.title ?? "Snap"}
          className="w-full rounded-lg"
        />
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter a title for your snap"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium"
          >
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your snap"
            rows={3}
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
            Make snap public
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={updateSnapMutation.isPending}
          className="w-full"
        >
          {updateSnapMutation.isPending ? (
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

        {updateSnapMutation.error && (
          <p className="text-sm text-red-600">
            Error: {updateSnapMutation.error.message}
          </p>
        )}
      </form>
    </div>
  );
}
