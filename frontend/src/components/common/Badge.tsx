import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-teal-200/60 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/50",
        success:
          "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/50",
        warning:
          "border-amber-200/60 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/50",
        destructive:
          "border-rose-200/60 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/50",
        info:
          "border-sky-200/60 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/50",
        secondary:
          "border-slate-200/60 bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60",
        outline:
          "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

