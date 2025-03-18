"use client";
import React, { useState } from "react";
import PasswordInput from "./components/inputFields/PasswordInput";
import EmailInput from "./components/inputFields/EmailInput";

const HomePage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  // Check if both email and password are filled
  const isFormValid = email.trim() !== "" && password.trim() !== "";

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (isFormValid) {
      // Perform form submission logic here
      console.log("Form submitted with:", { email, password });
    } else {
      console.log("Please fill out all fields.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">
          Login
        </h1>
        <form onSubmit={handleSubmit}>
          <EmailInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            id="email"
            name="email"
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            showStrength={true}
            id="password"
            name="password"
          />
          <button
            type="submit"
            disabled={!isFormValid} // Disable button if form is not valid
            className={`w-full mt-4 px-4 py-2 bg-[#94BBFF] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#94BBFF] focus:ring-opacity-50 ${
              !isFormValid
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-600"
            }`}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;