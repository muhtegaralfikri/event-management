"use client";

import { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
}

export function InputField({ label, helperText, className = "", ...props }: InputFieldProps) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 disabled:bg-stone-50 disabled:text-stone-500"
        {...props}
      />
      {helperText && (
        <p className="mt-1 text-xs text-stone-500">{helperText}</p>
      )}
    </div>
  );
}
