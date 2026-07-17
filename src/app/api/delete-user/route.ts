import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin App if not already initialized
if (!getApps().length) {
  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
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
    if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      console.error("Firebase Admin credentials not set.");
      return NextResponse.json(
        { error: "Server configuration error: Missing Firebase Admin credentials." },
        { status: 500 }
      );
    }

    // Delete the user from Firebase Authentication
    await getAuth().deleteUser(uid);

    return NextResponse.json({ message: "User deleted successfully from Authentication" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting user from Auth:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user from Authentication" },
      { status: 500 }
    );
  }
}
