"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  disabled?: boolean;
}

export default function Tooltip({ content, children, disabled }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [positioned, setPositioned] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const rect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const gap = 8;

    let top = rect.bottom + gap;
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

    // Flip to top if overflowing bottom
    if (top + tooltipRect.height > window.innerHeight - 8) {
      top = rect.top - tooltipRect.height - gap;
    }

    // Clamp left
    if (left < 8) {
      left = 8;
    } else if (left + tooltipRect.width > window.innerWidth - 8) {
      left = window.innerWidth - tooltipRect.width - 8;
    }

    setPosition({ top, left });
    setPositioned(true);
  }, []);

  const handleEnter = useCallback(() => {
    if (disabled) return;
    timerRef.current = setTimeout(() => {
      setOpen(true);
    }, 150);
  }, [disabled]);

  const handleLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(false);
    setPositioned(false);
  }, []);

  // Update position after tooltip renders
  useEffect(() => {
    if (open) {
      // Use rAF to wait for DOM paint
      const frame = requestAnimationFrame(updatePosition);
      return () => cancelAnimationFrame(frame);
    }
  }, [open, updatePosition]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!isValidElement(children)) return children;

  const childProps = children.props as Record<string, unknown>;

  const child = cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      // Preserve existing ref
      const childRef = (children as { ref?: unknown }).ref;
      if (typeof childRef === "function") {
        childRef(node);
      } else if (childRef && typeof childRef === "object" && "current" in childRef) {
        (childRef as { current: unknown }).current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      handleEnter();
      (childProps.onMouseEnter as ((e: React.MouseEvent) => void) | undefined)?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleLeave();
      (childProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined)?.(e);
    },
  } as Record<string, unknown>);

  return (
    <>
      {child}
      {mounted && open && createPortal(
        <div
          ref={tooltipRef}
          className={`fixed z-[100] pointer-events-none ${positioned ? "animate-tooltip-fade-in" : "opacity-0"}`}
          style={{ top: position.top, left: position.left }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}
