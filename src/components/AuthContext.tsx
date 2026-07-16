"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  regNo?: string;
  branch?: string;
  role: "student" | "admin";
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    if (!auth) {
      console.error("Firebase auth is not initialized. Checking env variables.");
      setConfigError(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch additional user data from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userProfile: UserProfile;

          if (userDoc.exists()) {
            userProfile = userDoc.data() as UserProfile;
          } else {
            // If the user document doesn't exist, create it
            userProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: "student",
            };
            await setDoc(userDocRef, userProfile);
          }

          setUser(userProfile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase auth not initialized");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (configError) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-[#E0E0E0] font-sans flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-[#2A2A2A] p-8 rounded-lg border border-[#333333] max-w-lg space-y-6">
          <h2 className="text-2xl font-bold text-red-400 font-serif italic">
            Firebase Connection Failed
          </h2>
          <p className="text-sm text-gray-300">
            The application is missing valid Firebase credentials. If you are viewing the deployed version, please make sure you have:
          </p>
          <ol className="text-left text-xs space-y-2 text-gray-400 list-decimal pl-5">
            <li>Added the Firebase environment variables to your <strong>Vercel Project Settings &gt; Environment Variables</strong>.</li>
            <li>Triggered a <strong>Redeploy</strong> of your Vercel project after adding them (Vercel does not apply new variables to old builds automatically).</li>
          </ol>
          <div className="text-xs text-left bg-[#1E1E1E] p-3 rounded font-mono text-gray-500 space-y-1">
            <div>NEXT_PUBLIC_FIREBASE_API_KEY</div>
            <div>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</div>
            <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID</div>
            <div>...</div>
          </div>
          <p className="text-xs text-[#d97757]">
            Please check your Vercel logs or browser developer console for detailed error outputs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
