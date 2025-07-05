"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
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
});

export function StepDetails({ data, updateData, next }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title ?? "",
      description: data.description ?? "",
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    updateData({ title: data.title, description: data.description });
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
        </div>

        <Button type="submit" className="self-end">
          Next
        </Button>
      </form>
    </div>
  );
}
