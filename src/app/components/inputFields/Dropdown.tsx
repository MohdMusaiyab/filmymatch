import React from "react";

interface DropdownProps {
  label?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  error?: string;
  id?: string;
  name?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  className = "",
  error,
  id,
  name,
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label className="block text-sm font-small text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          id={id}
          name={name}
          className={`w-full px-3 py-2.5 border border-[#94BBFF] rounded-3xl bg-[#E1E9F2] focus:outline-none focus:ring-1 focus:ring-[#94BBFF] focus:border-[#94BBFF] text-black text-sm${
            error ? "border-red-500" : ""
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-black">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 px-2 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Dropdown;
