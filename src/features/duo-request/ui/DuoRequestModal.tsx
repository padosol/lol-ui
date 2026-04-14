"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Mic, MicOff } from "lucide-react";
import { useCreateDuoRequest } from "@/entities/duo";
import { LaneSelector } from "@/shared/ui/lane-selector";
import {
  duoRequestSchema,
  type DuoRequestFormData,
} from "../model/duoRequestSchema";

interface DuoRequestModalProps {
  open: boolean;
  onClose: () => void;
  postId: number;
}

export default function DuoRequestModal({
  open,
  onClose,
  postId,
}: DuoRequestModalProps) {
  const createRequest = useCreateDuoRequest();

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
    reset,
  } = useForm<DuoRequestFormData>({
    resolver: zodResolver(duoRequestSchema),
    defaultValues: {
      primaryLane: undefined,
      secondaryLane: undefined,
      hasMicrophone: false,
      memo: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const onSubmit = (data: DuoRequestFormData) => {
    createRequest.mutate(
      { postId, data },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface-4 rounded-lg border border-divider w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-on-surface">듀오 신청</h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-on-surface-disabled hover:text-on-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="primaryLane"
            control={control}
            render={({ field }) => (
              <LaneSelector
                label="주 라인"
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.primaryLane?.message}
              />
            )}
          />

          <Controller
            name="secondaryLane"
            control={control}
            render={({ field }) => (
              <LaneSelector
                label="부 라인"
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.secondaryLane?.message}
              />
            )}
          />

          <Controller
            name="hasMicrophone"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm text-on-surface-medium mb-2">
                  마이크
                </label>
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                    field.value
                      ? "bg-primary text-on-primary"
                      : "bg-surface-4 border border-divider text-on-surface-medium hover:bg-surface-8"
                  }`}
                >
                  {field.value ? (
                    <Mic className="w-4 h-4" />
                  ) : (
                    <MicOff className="w-4 h-4" />
                  )}
                  {field.value ? "마이크 사용" : "마이크 미사용"}
                </button>
              </div>
            )}
          />

          <div>
            <label className="block text-sm text-on-surface-medium mb-1">
              메모
            </label>
            <textarea
              {...register("memo")}
              placeholder="하고 싶은 말을 적어주세요 (최대 500자)"
              maxLength={500}
              rows={2}
              className="w-full bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-disabled focus:outline-none focus:border-primary resize-none"
            />
            {errors.memo && (
              <p className="mt-1 text-xs text-red-400">
                {errors.memo.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={createRequest.isPending}
            className="cursor-pointer w-full bg-primary hover:bg-primary/80 text-on-surface font-medium py-2.5 rounded-md transition-colors disabled:opacity-50"
          >
            {createRequest.isPending ? "신청 중..." : "듀오 신청하기"}
          </button>

          {createRequest.isError && (
            <p className="text-xs text-red-400 text-center">
              {createRequest.error?.message || "신청에 실패했습니다."}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
