import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

export const TypographyH1 = ({ children, className }: TypographyProps) => {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        "text-gray-900 dark:text-gray-50",
        className
      )}
    >
      {children}
    </h1>
  );
};

export const TypographyH2 = ({ children, className }: TypographyProps) => {
  return (
    <h2
      className={cn(
        "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0",
        "text-gray-800 dark:text-gray-100",
        className
      )}
    >
      {children}
    </h2>
  );
};

export const TypographyH3 = ({ children, className }: TypographyProps) => {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        "text-gray-800 dark:text-gray-100",
        className
      )}
    >
      {children}
    </h3>
  );
};

export const TypographyH4 = ({ children, className }: TypographyProps) => {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        "text-gray-800 dark:text-gray-100",
        className
      )}
    >
      {children}
    </h4>
  );
};

export const TypographyH5 = ({ children, className }: TypographyProps) => {
  return (
    <h5
      className={cn(
        "scroll-m-20 text-lg font-semibold tracking-tight",
        "text-gray-800 dark:text-gray-100",
        className
      )}
    >
      {children}
    </h5>
  );
};

export const TypographyP = ({ children, className }: TypographyProps) => {
  return (
    <p
      className={cn(
        "leading-7 [&:not(:first-child)]:mt-6",
        "text-gray-700 dark:text-gray-300",
        className
      )}
    >
      {children}
    </p>
  );
};

export const TypographySmall = ({ children, className }: TypographyProps) => {
  return (
    <small
      className={cn(
        "text-sm font-medium leading-none",
        "text-gray-500 dark:text-gray-400",
        className
      )}
    >
      {children}
    </small>
  );
};

export const TypographyLead = ({ children, className }: TypographyProps) => {
  return (
    <p
      className={cn(
        "text-xl text-muted-foreground",
        "text-gray-600 dark:text-gray-400",
        className
      )}
    >
      {children}
    </p>
  );
};

export const TypographyLarge = ({ children, className }: TypographyProps) => {
  return (
    <div
      className={cn(
        "text-lg font-semibold",
        "text-gray-900 dark:text-gray-50",
        className
      )}
    >
      {children}
    </div>
  );
};

export const TypographyMuted = ({ children, className }: TypographyProps) => {
  return (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        "text-gray-500 dark:text-gray-400",
        className
      )}
    >
      {children}
    </p>
  );
};
