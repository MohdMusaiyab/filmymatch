"use client";
import React, { useState } from "react";
import PasswordInput from "./components/inputFields/PasswordInput";
import EmailInput from "./components/inputFields/EmailInput";
import PhoneNumberInput from "./components/inputFields/PhoneNumberInput";
import TextInput from "./components/inputFields/TextInput";

const HomePage: React.FC = () => {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [phoneNumber, setPhoneNumber] = useState("");
  // const [countryCode, setCountryCode] = useState("+1");
  // const [name, setName] = useState("");

  // const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setEmail(e.target.value);
  // };

  // const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setPassword(e.target.value);
  // };

  //   const handlePhoneNumberChange = (value: string, country: any) => {
  //   setPhoneNumber(value);
  // };

  // const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setCountryCode(e.target.value);
  // };

  // const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setName(e.target.value);
  // };

  // // Check if all fields are filled
  // const isFormValid =
  //   email.trim() !== "" &&
  //   password.trim() !== "" &&
  //   phoneNumber.trim() !== "" &&
  //   name.trim() !== "";

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (isFormValid) {
  //     console.log("Form submitted with:", { email, password, phoneNumber, countryCode, name });
  //   } else {
  //     console.log("Please fill out all fields.");
  //   }
  // };

  return (
    <div>
      hello!!user Created
    </div>
    // <div className="min-h-screen flex items-center justify-center bg-black">
    //   <div className="p-8 rounded-lg shadow-md w-96">
    //     <h1 className="text-2xl font-bold mb-6 text-center text-white">Login</h1>
    //     <form onSubmit={handleSubmit}>
    //       <TextInput
    //         label="Full Name"
    //         placeholder="Enter your full name"
    //         value={name}
    //         onChange={handleNameChange}
    //         id="name"
    //         name="name"
    //       />
    //       <EmailInput
    //         label="Email"
    //         placeholder="Enter your email"
    //         value={email}
    //         onChange={handleEmailChange}
    //         id="email"
    //         name="email"
    //       />
    //       <PasswordInput
    //         label="Password"
    //         placeholder="Enter your password"
    //         value={password}
    //         onChange={handlePasswordChange}
    //         showStrength={true}
    //         id="password"
    //         name="password"
    //       />
    //       <PhoneNumberInput
    //         label="Phone Number"
    //         value={phoneNumber}
    //         onChange={handlePhoneNumberChange}
    //         id="phone"
    //         name="phone"
    //       />
    //       <button
    //         type="submit"
    //         disabled={!isFormValid}
    //         className={`w-full mt-4 px-4 py-2 bg-[#94BBFF] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#94BBFF] focus:ring-opacity-50 ${
    //           !isFormValid ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
    //         }`}
    //       >
    //         Submit
    //       </button>
    //     </form>
    //   </div>
    // </div>
  );
};

export default HomePage;
