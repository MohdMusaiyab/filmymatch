import React, { useState, useEffect } from "react";

interface PasswordInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  error?: string;
  showStrength?: boolean;
  id?: string;
  name?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  placeholder = "Enter your password",
  value,
  onChange,
  className = "",
  error,
  showStrength = false,
  id,
  name,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Debounce password strength calculation for performance optimization
  useEffect(() => {
    const timer = setTimeout(() => {
      let strengthScore = 0;
      if (value.length >= 8) strengthScore++;
      if (/[A-Z]/.test(value)) strengthScore++;
      if (/[a-z]/.test(value)) strengthScore++;
      if (/[0-9]/.test(value)) strengthScore++;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) strengthScore++;
      setStrength(strengthScore);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-white mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          id={id}
          name={name}
          autoComplete="new-password"
          required
          minLength={8}
          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
          aria-describedby={showStrength ? "password-strength" : undefined}
          className={`w-full px-3 py-2 border border-[#94BBFF] rounded-3xl bg-[#E1E9F2] focus:outline-none focus:ring-1 focus:ring-[#94BBFF] text-black ${
            error ? "border-red-500" : ""
          }`}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
          aria-label="Toggle password visibility"
        >
          {showPassword ? "👁️" : "🔒"}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {showStrength && (
        <div id="password-strength" className="mt-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${strength >= 1 ? "bg-green-500" : "bg-gray-300"}`}></div>
            <div className={`w-2 h-2 rounded-full ${strength >= 3 ? "bg-green-500" : "bg-gray-300"}`}></div>
            <div className={`w-2 h-2 rounded-full ${strength >= 5 ? "bg-green-500" : "bg-gray-300"}`}></div>
            <span className="text-xs text-white">{["Weak", "Medium", "Strong"][Math.min(strength - 1, 2)]}</span>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default PasswordInput;
