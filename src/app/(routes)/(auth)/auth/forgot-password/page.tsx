"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmailInput from "@/app/components/inputFields/EmailInput";
import {
  sendPasswordResetToken,
  verifyToken,
} from "@/actions/auth/passwordActions";
import { changePassword } from "@/actions/user/changePassword";
import PasswordInput from "@/app/components/inputFields/PasswordInput";
import Button from "@/app/components/Button";

const Page = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (expiresAt) {
      interval = setInterval(() => {
        const now = new Date();
        const diffMs = expiresAt.getTime() - now.getTime();

        if (diffMs <= 0) {
          setTimeRemaining("Expired");
          setExpiresAt(null);
          clearInterval(interval);
        } else {
          const minutes = Math.floor(diffMs / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [expiresAt]);

  const handleSendResetToken = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const result = await sendPasswordResetToken(email);

      if (result.success) {
        setMessage(result.message);
        setExpiresAt(new Date(result.data!.expiresAt));
        setShowVerification(true);
      } else {
        setError(result.message);

        // If there's an existing token, show verification screen with remaining time
        if (
          result.code === "TOKEN_ALREADY_SENT" &&
          result.message.includes("minutes")
        ) {
          const match = result.message.match(/in (\d+) minutes/);
          if (match && match[1]) {
            const minutes = parseInt(match[1], 10);
            setExpiresAt(new Date(Date.now() + minutes * 60 * 1000));
            setShowVerification(true);
          }
        }
      }
    } catch (error: any) {
      setError("An unexpected error occurred. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setError("Please enter the verification code");
      return;
    }

    try {
      setVerifying(true);
      setError("");
      setMessage("");

      const result = await verifyToken(email, otp);

      if (result.success) {
        setMessage(result.message);
        setShowVerification(false);
        setShowPasswordReset(true);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError("Failed to verify token. Please try again.");
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setResetting(true);
      setError("");
      setMessage("");

      // Use the server action to reset password
      const result = await changePassword(newPassword, email);

      if (result.success) {
        setSuccess(true);
        setMessage(result.message || "Password has been reset successfully");

        // Redirect to sign-in after delay
        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 2000);
      } else {
        setError(result.message || "Failed to reset password");
      }
    } catch (error: any) {
      setError("An unexpected error occurred. Please try again.");
      console.error(error);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Forgot Password
        </h1>

        {success ? (
          <div className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{message}</h3>
            <p className="text-sm text-gray-500">Redirecting to sign in...</p>
          </div>
        ) : showPasswordReset ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600">Reset your password for:</p>
              <p className="font-medium text-gray-800 mt-1">{email}</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <PasswordInput
                  label="New Password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  showStrength={true} // Optional: remove if you don’t want strength bar
                  className="mb-4" // Optional: keep layout spacing consistent
                />
              </div>

              <div>
                <PasswordInput
                  label="Confirm Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="mb-4" // Optional: ensures spacing is consistent
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {message && (
                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{message}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={resetting}
                className="w-full flex justify-center items-center gap-2"
                variant="gradient-blue"
                size="md"
              >
                {resetting && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {resetting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </div>
        ) : showVerification ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600">
                We've sent a verification code to:
              </p>
              <p className="font-medium text-gray-800 mt-1">{email}</p>

              {timeRemaining && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-500">
                    Code expires in
                  </div>
                  <div
                    className={`text-xl font-semibold mt-1 ${
                      timeRemaining === "Expired"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {timeRemaining}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleVerifyToken} className="space-y-6">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    autoComplete="one-time-code"
                    required
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {message && (
                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{message}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={verifying || timeRemaining === "Expired"}
                className="w-full flex justify-center items-center gap-2"
                variant="gradient-blue" // or your preferred variant
                size="md"
              >
                {verifying && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {verifying ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendResetToken}
                  disabled={
                    loading ||
                    (timeRemaining !== null && timeRemaining !== "Expired")
                  }
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
                >
                  {loading
                    ? "Sending..."
                    : timeRemaining && timeRemaining !== "Expired"
                    ? "Code already sent"
                    : "Resend verification code"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600">
                Enter your email address to reset your password
              </p>
            </div>

            <EmailInput
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error.includes("email") ? error : ""}
              id="reset-email"
              name="email"
            />

            {message && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{message}</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleSendResetToken}
              disabled={loading || !email}
              className="w-full flex justify-center items-center gap-2 py-3"
              variant="gradient-blue" // or another variant if preferred
              size="md"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {loading ? "Sending..." : "Send Verification Code"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
