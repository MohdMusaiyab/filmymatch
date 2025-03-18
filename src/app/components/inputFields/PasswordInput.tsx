import React, { useState } from 'react';

interface PasswordInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  error?: string;
  showStrength?: boolean; // Optional prop to show password strength calculator
  id?: string; // Add id prop
  name?: string; // Add name prop
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  placeholder = 'Enter your password',
  value,
  onChange,
  className = '',
  error,
  showStrength = false, // Default to false
  id,
  name,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Password strength validation rules
  const hasMinLength = value.length >= 8;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          id={id} // Pass id to input
          name={name} // Pass name to input
          className={`w-full px-3 py-2 border border-[#94BBFF] rounded-2xl bg-[#E1E9F2] focus:outline-none focus:ring-2 focus:ring-[#94BBFF] focus:border-[#94BBFF] text-black ${
            error ? 'border-red-500' : ''
          }`}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
        >
          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Password Strength Calculator */}
      {showStrength && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center">
            <span
              className={`w-4 h-4 inline-block mr-2 rounded-full ${
                hasMinLength ? 'bg-green-500' : 'bg-gray-300'
              }`}
            ></span>
            <span className="text-sm text-white">At least 8 characters</span>
          </div>
          <div className="flex items-center">
            <span
              className={`w-4 h-4 inline-block mr-2 rounded-full ${
                hasUpperCase ? 'bg-green-500' : 'bg-gray-300'
              }`}
            ></span>
            <span className="text-sm text-white">At least one uppercase letter</span>
          </div>
          <div className="flex items-center">
            <span
              className={`w-4 h-4 inline-block mr-2 rounded-full ${
                hasLowerCase ? 'bg-green-500' : 'bg-gray-300'
              }`}
            ></span>
            <span className="text-sm text-white">At least one lowercase letter</span>
          </div>
          <div className="flex items-center">
            <span
              className={`w-4 h-4 inline-block mr-2 rounded-full ${
                hasNumber ? 'bg-green-500' : 'bg-gray-300'
              }`}
            ></span>
            <span className="text-sm text-white">At least one number</span>
          </div>
          <div className="flex items-center">
            <span
              className={`w-4 h-4 inline-block mr-2 rounded-full ${
                hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'
              }`}
            ></span>
            <span className="text-sm text-white">At least one special character</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default PasswordInput;