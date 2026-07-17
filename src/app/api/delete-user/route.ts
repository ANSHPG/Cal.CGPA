import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin App if not already initialized
if (!getApps().length) {
  try {
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
    // If the key comes surrounded by quotes from Vercel, strip them
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && privateKey) {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey,
        }),
      });
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export async function POST(request: Request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: "User ID (uid) is required" },
        { status: 400 }
      );
    }

    // Verify admin SDK is initialized properly
    if (!getApps().length) {
      console.error("Firebase Admin credentials not set or invalid.");
      return NextResponse.json(
        { error: "Server configuration error: Invalid Firebase Admin credentials." },
        { status: 500 }
      );
    }

    // Delete the user from Firebase Authentication
    await getAuth().deleteUser(uid);

    // Delete the user from Firestore using Admin SDK to bypass security rules
    const db = getFirestore();
    await db.collection("users").doc(uid).delete();
    await db.collection("grades").doc(uid).delete();

    return NextResponse.json({ message: "User deleted successfully from Authentication and Firestore" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting user from Auth:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user from Authentication" },
      { status: 500 }
    );
  }
}
