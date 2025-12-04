import type { HTMLInputTypeAttribute } from "react";

interface FormFieldProps {
  label: string;
  id: string;
  type?: HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}

export function FormField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  textarea,
}: FormFieldProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2 text-sm font-medium text-base-content">
      <span>{label}</span>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className="min-h-[120px] rounded-xl border-2 border-base-300 bg-base-100 px-4 py-3 text-base-content shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className="rounded-xl border-2 border-base-300 bg-base-100 px-4 py-3 text-base-content shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
        />
      )}
    </label>
  );
}
