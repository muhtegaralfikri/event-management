"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

type PasswordFieldProps = {
  label?: string;
  name?: string;
  placeholder?: string;
  minLength?: number;
  required?: boolean;
};

export const PasswordField = ({
  label = "Password",
  name = "password",
  placeholder = "Password",
  minLength,
  required,
}: PasswordFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-stone-700">{label}</label>
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          name={name}
          type={isVisible ? "text" : "password"}
          required={required}
          minLength={minLength}
          className="w-full rounded-md border border-stone-300 py-2 pl-10 pr-11 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          aria-label={isVisible ? "Sembunyikan password" : "Tampilkan password"}
          aria-pressed={isVisible}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
};
