"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

function createLoginSchema(
  t: (key: "invalidEmail" | "passwordRequired") => string
) {
  return z.object({
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(1, t("passwordRequired")),
  });
}

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export default function LoginForm() {
  const t = useTranslations("auth");
  const tValidation = useTranslations("auth.validation");
  const schema = useMemo(() => createLoginSchema(tValidation), [tValidation]);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <form
      onSubmit={handleSubmit(() => {})}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-on-surface-medium mb-1"
        >
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          disabled
          placeholder="example@email.com"
          className="w-full px-3 py-2 bg-surface-4 border border-divider rounded-lg text-on-surface placeholder:text-on-surface-medium/50 disabled:opacity-50 disabled:cursor-not-allowed"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-loss">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-on-surface-medium mb-1"
        >
          {t("password")}
        </label>
        <input
          id="password"
          type="password"
          disabled
          placeholder={t("password")}
          className="w-full px-3 py-2 bg-surface-4 border border-divider rounded-lg text-on-surface placeholder:text-on-surface-medium/50 disabled:opacity-50 disabled:cursor-not-allowed"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-loss">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled
        className="w-full py-2.5 bg-primary/50 text-on-surface rounded-lg font-medium cursor-not-allowed opacity-50"
      >
        {t("emailLoginForm")}
      </button>
    </form>
  );
}
