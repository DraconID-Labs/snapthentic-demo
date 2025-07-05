"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import type { StepProps } from "./types";

const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(40, {
    message: "Title must be less than 40 characters",
  }),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(100, {
      message: "Description must be less than 100 characters",
    }),
  contestId: z.string().optional(),
});

export function StepDetails({ data, updateData, next }: StepProps) {
  const { data: activeContests, isLoading: contestsLoading } =
    api.contests.getActive.useQuery();

  // Get user's existing contest entries to prevent duplicates
  const { data: userEntries } = api.contests.getMyEntries.useQuery({});

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title ?? "",
      description: data.description ?? "",
      contestId: data.contestId ?? "none",
    },
  });

  const onSubmit = (formData: z.infer<typeof schema>) => {
    updateData({
      title: formData.title,
      description: formData.description,
      contestId: formData.contestId === "none" ? undefined : formData.contestId,
    });
    next();
  };

  // Get list of contest IDs user has already entered
  const enteredContestIds = userEntries?.map((entry) => entry.contest.id) ?? [];

  // Filter out contests user has already entered
  const availableContests =
    activeContests?.filter(
      (contest) => !enteredContestIds.includes(contest.id),
    ) ?? [];

  return (
    <div className="flex flex-col">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
        <div className="space-y-4">
          <div>
            <Input {...register("title")} placeholder="Title" />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div>
            <Textarea {...register("description")} placeholder="Description" />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Contest Selection */}
          <div>
            <div className="mb-2 block text-sm font-medium">
              Enter a Contest (Optional)
            </div>
            <Controller
              name="contestId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? "none"}
                  onValueChange={field.onChange}
                  disabled={contestsLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a contest or share publicly" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      No contest - just share publicly
                    </SelectItem>
                    {availableContests.map((contest) => (
                      <SelectItem key={contest.id} value={contest.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{contest.title}</span>
                          <div className="flex gap-2 text-xs text-gray-500">
                            {contest.entryPrice && (
                              <span>
                                Entry: {Number(contest.entryPrice).toFixed(2)}{" "}
                                WLD
                              </span>
                            )}
                            {contest.prize && (
                              <span>
                                Prize: {Number(contest.prize).toFixed(2)} WLD
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {contestsLoading && (
              <p className="mt-1 text-sm text-gray-500">Loading contests...</p>
            )}
            {!contestsLoading &&
              availableContests.length === 0 &&
              (activeContests?.length ?? 0) > 0 && (
                <p className="mt-1 text-sm text-orange-600">
                  You&apos;ve already entered all available contests
                </p>
              )}
            {!contestsLoading && !activeContests?.length && (
              <p className="mt-1 text-sm text-gray-500">
                No active contests available
              </p>
            )}
          </div>
        </div>

        <Button type="submit" className="self-end">
          Next
        </Button>
      </form>
    </div>
  );
}
