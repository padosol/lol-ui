interface LogContext {
  method?: string;
  url?: string;
  status?: number;
  duration?: number;
  error?: string;
  [key: string]: unknown;
}

function formatContext(ctx?: LogContext): string {
  if (!ctx) return "";
  const parts: string[] = [];
  if (ctx.method && ctx.url) parts.push(`${ctx.method} ${ctx.url}`);
  else if (ctx.url) parts.push(ctx.url);
  if (ctx.status !== undefined) parts.push(`status ${ctx.status}`);
  if (ctx.duration !== undefined) parts.push(`${ctx.duration}ms`);
  if (ctx.error) parts.push(ctx.error);
  return parts.length > 0 ? ` | ${parts.join(" | ")}` : "";
}

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(message: string, ctx?: LogContext): void {
    if (process.env.NODE_ENV !== "development") return;
    console.log(`[MMRTR] [INFO] [${timestamp()}] ${message}${formatContext(ctx)}`);
  },

  warn(message: string, ctx?: LogContext): void {
    console.warn(`[MMRTR] [WARN] [${timestamp()}] ${message}${formatContext(ctx)}`);
  },

  error(message: string, ctx?: LogContext): void {
    console.error(`[MMRTR] [ERROR] [${timestamp()}] ${message}${formatContext(ctx)}`);
  },
};
