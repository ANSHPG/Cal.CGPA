"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSending(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent! Check your inbox.");
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-[#E0E0E0] font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      
      <div className="absolute top-6 left-6 md:top-12 md:left-12">
        <Link href="/login" className="flex items-center text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to login
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold font-serif italic text-[#F5F5DC]">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Enter your email address and we will send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#2A2A2A] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[#333333]">
          <form className="space-y-6" onSubmit={handleResetPassword}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {message && (
              <div className="bg-primary/10 border border-primary/50 text-primary p-3 rounded-md text-sm">
                {message}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#404040] rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-[#d97757] focus:border-[#d97757] sm:text-sm bg-[#1E1E1E] text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSending || !email}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#d97757] hover:bg-[#c66646] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d97757] focus:ring-offset-[#1E1E1E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
