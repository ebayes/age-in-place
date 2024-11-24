// lib/utils.ts

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useContextSafely<T>(context: React.Context<T | null>): T {
  const ctx = React.useContext(context);
  if (ctx === null) {
    throw new Error("Context not found. Please ensure your component is wrapped with the appropriate provider.");
  }
  return ctx;
}