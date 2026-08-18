"use client"

import type * as React from "react"
import {
  Dialog as DialogPrimitive,
  Heading as HeadingPrimitive,
  Modal as ModalPrimitive,
  ModalOverlay as ModalOverlayPrimitive,
  type ModalOverlayProps,
} from "react-aria-components"

import { cn } from "@/lib/utils"

function Dialog({
  className,
  children,
  ...props
}: Omit<ModalOverlayProps, "className" | "children"> & {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <ModalOverlayPrimitive
      data-slot="dialog-overlay"
      isDismissable
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 duration-100 data-entering:animate-in data-entering:fade-in-0 data-exiting:animate-out data-exiting:fade-out-0"
      {...props}
    >
      <ModalPrimitive
        data-slot="dialog"
        className={cn(
          "w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.25)] outline-none duration-100 data-entering:animate-in data-entering:zoom-in-95 data-exiting:animate-out data-exiting:zoom-out-95",
          className
        )}
      >
        <DialogPrimitive className="outline-none">{children}</DialogPrimitive>
      </ModalPrimitive>
    </ModalOverlayPrimitive>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof HeadingPrimitive>) {
  return (
    <HeadingPrimitive
      slot="title"
      data-slot="dialog-title"
      className={cn("text-base font-bold text-zinc-900", className)}
      {...props}
    />
  )
}

export { Dialog, DialogTitle }
