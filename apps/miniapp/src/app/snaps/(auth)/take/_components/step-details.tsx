"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
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
  const { data: activeContests, isLoading: contestsLoading } = api.contests.getActive.useQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title ?? "",
      description: data.description ?? "",
      contestId: data.contestId ?? "",
    },
  });

  const onSubmit = (formData: z.infer<typeof schema>) => {
    updateData({ 
      title: formData.title, 
      description: formData.description,
      contestId: formData.contestId ?? undefined,
    });
    next();
  };

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
            <label className="mb-2 block text-sm font-medium">
              Enter a Contest (Optional)
            </label>
            <select
              {...register("contestId")}
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={contestsLoading}
            >
              <option value="">No contest - just share publicly</option>
              {activeContests?.map((contest) => (
                <option key={contest.id} value={contest.id}>
                  {contest.title}
                  {contest.entryPrice && ` - Entry: $${Number(contest.entryPrice).toFixed(2)}`}
                  {contest.prize && ` - Prize: $${Number(contest.prize).toFixed(2)}`}
                </option>
              ))}
            </select>
            {contestsLoading && (
              <p className="mt-1 text-sm text-gray-500">Loading contests...</p>
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
