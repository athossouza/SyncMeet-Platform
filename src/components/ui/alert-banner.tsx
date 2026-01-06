import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps } from "framer-motion";
import { X, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

// Variants for the banner container and icon
const alertBannerVariants = cva(
    "group relative flex w-full items-start gap-4 overflow-hidden rounded-lg border p-4 shadow-md",
    {
        variants: {
            variant: {
                default: "border-border bg-background text-foreground",
                success: "border-emerald-500/50 bg-emerald-950/40 text-emerald-200 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-200",
                destructive: "border-red-500/50 bg-red-950/40 text-red-200 dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-200",
                warning: "border-amber-500/50 bg-amber-950/40 text-amber-200 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-200",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const iconVariants = cva("mt-0.5 size-6 flex-shrink-0", {
    variants: {
        variant: {
            default: "text-foreground",
            success: "text-emerald-400",
            destructive: "text-red-400",
            warning: "text-amber-400",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

// Define props for the component
export interface AlertBannerProps extends HTMLMotionProps<"div">, VariantProps<typeof alertBannerVariants> {
    title: string;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    onDismiss: () => void;
    primaryAction?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
}

const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
    ({ className, variant, title, description, icon, onDismiss, primaryAction, secondaryAction, ...props }, ref) => {

        // Default icons based on variant
        const DefaultIcon = {
            success: <CheckCircle2 />,
            destructive: <XCircle />,
            warning: <AlertCircle />,
            default: <CheckCircle2 />,
        }[variant || "default"];

        return (
            <motion.div
                ref={ref}
                role="alert"
                aria-live="assertive"
                className={cn(alertBannerVariants({ variant }), className)}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                {...props}
            >
                {/* Close Button */}
                <button
                    onClick={onDismiss}
                    aria-label="Dismiss notification"
                    className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className={cn(iconVariants({ variant }))}>
                    {icon || DefaultIcon}
                </div>

                {/* Content & Actions */}
                <div className="flex flex-1 flex-col pr-6">
                    <h3 className="font-semibold">{title}</h3>
                    {description && <div className="mt-1 text-sm opacity-90">{description}</div>}

                    {(primaryAction || secondaryAction) && (
                        <div className="mt-4 flex items-center gap-4">
                            {secondaryAction && (
                                <button
                                    onClick={secondaryAction.onClick}
                                    className="text-sm font-medium opacity-70 transition-colors hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    {secondaryAction.label}
                                </button>
                            )}
                            {primaryAction && (
                                <button
                                    onClick={primaryAction.onClick}
                                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    {primaryAction.label}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }
);
AlertBanner.displayName = "AlertBanner";

export { AlertBanner };
