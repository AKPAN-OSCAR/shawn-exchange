import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: any, operation: FirestoreErrorInfo['operationType'], path: string | null = null) {
  if (error?.code === 'permission-denied') {
    const info: FirestoreErrorInfo = {
      error: error.message,
      operationType: operation,
      path,
      authInfo: {
        uid: "REDACTED",
        email: "REDACTED"
      }
    };
    console.error("Firestore Permission denied:", JSON.stringify(info, null, 2));
  }
  throw error;
}

export function generateUsername(base = "ShawnUser") {
  return `${base}${Math.floor(Math.random() * 8999) + 1000}`;
}
