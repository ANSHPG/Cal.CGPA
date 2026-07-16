"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regNo, setRegNo] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("Electrical Engineering");
  const [error, setError] = useState("");
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const reputableDomains = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "icloud.com"];
    const domain = email.split('@')[1];
    if (!domain || !reputableDomains.includes(domain.toLowerCase())) {
      setError("Please use a reputable email provider (e.g., gmail.com, hotmail.com, yahoo.com).");
      return;
    }

    try {
      // Check if regNo already exists
      const q = query(collection(db, "users"), where("regNo", "==", regNo));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError("Caution: Roll number is already registered.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        regNo: regNo,
        branch: branch,
        role: "student", // default role
        password: password, // As requested by user
      });

      setError("Registration successful! Redirecting to login...");
      
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to register.");
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError("Google sign-in failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-[#E0E0E0] font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold font-serif italic text-[#F5F5DC]">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#2A2A2A] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[#333333]">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#404040] rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-[#d97757] focus:border-[#d97757] sm:text-sm bg-[#1E1E1E] text-white"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="regNo" className="block text-sm font-medium text-gray-300">
                Registration Number (RedgNo)
              </label>
              <div className="mt-1">
                <input
                  id="regNo"
                  name="regNo"
                  type="text"
                  required
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#404040] rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-[#d97757] focus:border-[#d97757] sm:text-sm bg-[#1E1E1E] text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-300">
                Branch
              </label>
              <div className="mt-1">
                <select
                  id="branch"
                  name="branch"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="block w-full px-3 py-2 border border-[#404040] rounded-md shadow-sm focus:outline-none focus:ring-[#d97757] focus:border-[#d97757] sm:text-sm bg-[#1E1E1E] text-white"
                >
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  {/* Later we will add other branches */}
                </select>
              </div>
            </div>

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
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#404040] rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-[#d97757] focus:border-[#d97757] sm:text-sm bg-[#1E1E1E] text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#d97757] hover:bg-[#c66646] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d97757] focus:ring-offset-[#1E1E1E] transition-colors"
              >
                Register
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#404040]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#2A2A2A] text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex justify-center py-2 px-4 border border-[#404040] rounded-md shadow-sm bg-[#1E1E1E] text-sm font-medium text-gray-300 hover:bg-[#333333] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#d97757] hover:text-[#c66646]">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
