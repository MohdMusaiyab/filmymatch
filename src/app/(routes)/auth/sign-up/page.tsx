"use client";
import React, { useState } from "react";
import PasswordInput from "@/app/components/inputFields/PasswordInput";
import EmailInput from "@/app/components/inputFields/EmailInput";
import PhoneNumberInput from "@/app/components/inputFields/PhoneNumberInput";
import TextInput from "@/app/components/inputFields/TextInput";
import Dropdown from "@/app/components/inputFields/Dropdown";
import Button from "@/app/components/Button";
import api from "@/lib/api";

import { useRouter } from "next/navigation";


const SignupPage: React.FC = () => {
  const router = useRouter(); // Initialize router
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUserName] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(
    "MOTHERS_MAIDEN_NAME"
  );
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: "" }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: "" }));
  };

  const handlePhoneNumberChange = (value: string) => {
    const formattedPhoneNumber = value.startsWith("+") ? value : `+${value}`;
    setPhoneNumber(formattedPhoneNumber);
    setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    setErrors((prev) => ({ ...prev, username: "" }));
  };

  const handleSecurityQuestionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSecurityQuestion(e.target.value);
    setErrors((prev) => ({ ...prev, securityQuestion: "" }));
  };

  const handleSecurityAnswerChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSecurityAnswer(e.target.value);
    setErrors((prev) => ({ ...prev, securityAnswer: "" }));
  };

  const isFormValid =
    email.trim() !== "" &&
    password.trim() !== "" &&
    phoneNumber.trim() !== "" &&
    username.trim() !== "" &&
    securityQuestion.trim() !== "" &&
    securityAnswer.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrors({ form: "Please fill out all fields." });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload = {
        email,
        password,
        username: username,
        phone: phoneNumber,
        securityQuestion,
        securityAnswer,
      };

      // Axios implementation
      const { data } = await api.post("/auth/sign-up", payload);

      console.log("Signup successful:", data);
      router.push("/auth/sign-in");
    } catch (error: any) {
      console.error("Error during signup:", error);

      // Axios error handling

      if (error.response) {
        // Server responded with error status (4xx/5xx)
        if (error.response.data.errors) {
          const fieldErrors: { [key: string]: string } = {};
          error.response.data.errors.forEach(
            (err: { field: string; message: string }) => {
              fieldErrors[err.field] = err.message;
            }
          );
          setErrors(fieldErrors);
        } else {
          setErrors({ form: error.response.data.message });
        }
      } else {
        // Network or other errors
        setErrors({
          form: "An error occurred during signup. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">
          Sign Up
        </h1>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Userame"
            placeholder="Enter your Username"
            value={username}
            onChange={handleUserNameChange}
            id="name"
            name="name"
          />
          <EmailInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            id="email"
            name="email"
            error={errors.email}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            showStrength={true}
            id="password"
            name="password"
            error={errors.password}
          />
          <PhoneNumberInput
            label="Phone Number"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            id="phone"
            name="phone"
            error={errors.phone}
          />
          <Dropdown
            label="Security Question"
            options={[
              {
                value: "MOTHERS_MAIDEN_NAME",
                label: "What is your mother's maiden name?",
              },
              {
                value: "FIRST_PET_NAME",
                label: "What is the name of your first pet?",
              },
              { value: "BIRTH_CITY", label: "What city were you born in?" },
              {
                value: "FAVORITE_TEACHER",
                label: "Who was your favorite teacher?",
              },
              {
                value: "CHILDHOOD_NICKNAME",
                label: "What was your childhood nickname?",
              },
              {
                value: "FIRST_CAR_MODEL",
                label: "What was your first car model?",
              },
              {
                value: "HIGH_SCHOOL_MASCOT",
                label: "What was your high school mascot?",
              },
            ]}
            value={securityQuestion}
            onChange={handleSecurityQuestionChange}
            error={errors.securityQuestion}
          />
          <TextInput
            label="Security Answer"
            placeholder="Enter your answer"
            value={securityAnswer}
            onChange={handleSecurityAnswerChange}
            id="securityAnswer"
            name="securityAnswer"
          />
          {errors.form && (
            <p className="text-red-500 text-sm mt-4 text-center">
              {errors.form}
            </p>
          )}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full mt-4 px-4 py-2 bg-[#94BBFF] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#94BBFF] focus:ring-opacity-50 ${
              !isFormValid || loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-600"
            }`}
          >
            {loading ? "Signing up..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
