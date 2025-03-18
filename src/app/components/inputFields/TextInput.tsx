import React, { useState } from "react";

interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  id?: string;
  name?: string;
  validate?: (value: string) => string | null;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder = "Enter text",
  value,
  onChange,
  className = "",
  id,
  name,
  validate = (value) => (!value.trim() ? "This field cannot be empty." : null),
}) => {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const handleBlur = () => {
    setTouched(true);
    setError(validate(value));
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-white mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            if (touched) setError(validate(e.target.value));
            onChange(e);
          }}
          onBlur={handleBlur}
          className={`w-full px-3 py-2 border rounded-3xl bg-[#E1E9F2] focus:outline-none focus:ring-1 focus:ring-[#94BBFF] focus:border-[#94BBFF] text-black transition-all ${
            error ? "border-red-500 focus:ring-red-500" : "border-[#94BBFF]"
          }`}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default TextInput;
