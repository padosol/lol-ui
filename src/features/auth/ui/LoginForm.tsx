"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
  password: z.string().min(1, "비밀번호를 입력하세요"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
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
          이메일
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
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          disabled
          placeholder="비밀번호"
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
        이메일 로그인 (준비중)
      </button>
    </form>
  );
}
