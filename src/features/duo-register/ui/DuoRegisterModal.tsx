"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useDuoStore } from "@/entities/duo";
import { duoRegisterSchema, type DuoRegisterFormData } from "../model/duoRegisterSchema";
import GameTypeSelector from "./GameTypeSelector";
import PositionSelector from "./PositionSelector";
import ChampionPicker from "./ChampionPicker";

const TIERS = [
  "IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM",
  "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER",
];
const RANKS = ["IV", "III", "II", "I"];
const TIER_LABELS: Record<string, string> = {
  IRON: "아이언", BRONZE: "브론즈", SILVER: "실버", GOLD: "골드",
  PLATINUM: "플래티넘", EMERALD: "에메랄드", DIAMOND: "다이아몬드",
  MASTER: "마스터", GRANDMASTER: "그랜드마스터", CHALLENGER: "챌린저",
};

interface DuoRegisterModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DuoRegisterModal({ open, onClose }: DuoRegisterModalProps) {
  const addListing = useDuoStore((s) => s.addListing);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<DuoRegisterFormData>({
    resolver: zodResolver(duoRegisterSchema),
    defaultValues: {
      summonerName: "",
      tagLine: "",
      tier: "",
      rank: "",
      gameType: undefined,
      position: undefined,
      champions: [],
      memo: "",
    },
  });

  const tier = watch("tier");
  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier);

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

  const onSubmit = (data: DuoRegisterFormData) => {
    addListing({
      summonerName: data.summonerName,
      tagLine: data.tagLine,
      tier: data.tier,
      rank: isMasterPlus ? "I" : data.rank,
      gameType: data.gameType,
      position: data.position,
      champions: data.champions,
      memo: data.memo ?? "",
    });
    reset();
    onClose();
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
          <h2 className="text-lg font-bold text-on-surface">듀오 등록</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-disabled hover:text-on-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-on-surface-medium mb-1">
                소환사명 <span className="text-red-400">*</span>
              </label>
              <input
                {...register("summonerName")}
                placeholder="소환사명"
                className="w-full bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-disabled focus:outline-none focus:border-primary"
              />
              {errors.summonerName && (
                <p className="mt-1 text-xs text-red-400">{errors.summonerName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-medium mb-1">
                태그 <span className="text-red-400">*</span>
              </label>
              <input
                {...register("tagLine")}
                placeholder="KR1"
                className="w-full bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-disabled focus:outline-none focus:border-primary"
              />
              {errors.tagLine && (
                <p className="mt-1 text-xs text-red-400">{errors.tagLine.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-on-surface-medium mb-1">
                티어 <span className="text-red-400">*</span>
              </label>
              <select
                {...register("tier")}
                className="w-full bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">선택</option>
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {TIER_LABELS[t]}
                  </option>
                ))}
              </select>
              {errors.tier && (
                <p className="mt-1 text-xs text-red-400">{errors.tier.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-medium mb-1">
                랭크 <span className="text-red-400">*</span>
              </label>
              <select
                {...register("rank")}
                disabled={isMasterPlus}
                className="w-full bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="">{isMasterPlus ? "-" : "선택"}</option>
                {!isMasterPlus &&
                  RANKS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
              </select>
              {errors.rank && !isMasterPlus && (
                <p className="mt-1 text-xs text-red-400">{errors.rank.message}</p>
              )}
            </div>
          </div>

          <Controller
            name="gameType"
            control={control}
            render={({ field }) => (
              <GameTypeSelector
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.gameType?.message}
              />
            )}
          />

          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <PositionSelector
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.position?.message}
              />
            )}
          />

          <Controller
            name="champions"
            control={control}
            render={({ field }) => (
              <ChampionPicker
                value={field.value}
                onChange={field.onChange}
                error={errors.champions?.message}
              />
            )}
          />

          <div>
            <label className="block text-sm font-medium text-on-surface-medium mb-1">
              메모
            </label>
            <textarea
              {...register("memo")}
              placeholder="하고 싶은 말을 적어주세요 (최대 100자)"
              maxLength={100}
              rows={2}
              className="w-full bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-disabled focus:outline-none focus:border-primary resize-none"
            />
            {errors.memo && (
              <p className="mt-1 text-xs text-red-400">{errors.memo.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/80 text-on-surface font-medium py-2.5 rounded-md transition-colors"
          >
            등록하기
          </button>
        </form>
      </div>
    </div>
  );
}
