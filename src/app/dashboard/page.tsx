"use client";

import React, { useState, useMemo } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, ChevronRight, ChevronLeft, AlertCircle, Save, LogOut, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { semestersData, gradingScale1to2, gradingScale3to6, gradeDisplayLabels } from "@/lib/data";
import { GradeSheetPDF } from "@/components/GradeSheetPDF";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { GradeDropdown } from "@/components/GradeDropdown";
import { doc, getDoc, setDoc, updateDoc, query, collection, where, getDocs } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const [studentDetails, setStudentDetails] = useState({
    name: "",
    rollNo: "",
    branch: "Electrical Engineering",
  });
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const [grades, setGrades] = useState<Record<number, Record<string, string>>>({});
  const [currentSemesterId, setCurrentSemesterId] = useState(1);
  const [pdfTheme, setPdfTheme] = useState<"light" | "dark">("light");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/home");
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    async function fetchData() {
      if (user) {
        setStudentDetails((prev) => ({
          ...prev,
          name: user.displayName || prev.name,
          rollNo: user.regNo || prev.rollNo,
          branch: user.branch || prev.branch,
        }));

        try {
          const docRef = doc(db, "grades", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.grades) setGrades(data.grades);
            if (data.studentDetails) setStudentDetails(data.studentDetails);
          }
        } catch (error) {
          console.error("Error fetching grades:", error);
        }
      }
    }
    fetchData();
  }, [user]);

  const handleSaveToCloud = async (): Promise<boolean> => {
    if (!user) return false;
    setIsSaving(true);
    setSaveMessage("");
    try {
      if (!/^\d+$/.test(studentDetails.rollNo)) {
        setSaveMessage("Error: Registration number can only contain numbers.");
        setIsSaving(false);
        return false;
      }

      // Check if regNo already exists on another account
      const q = query(collection(db, "users"), where("regNo", "==", studentDetails.rollNo));
      const querySnapshot = await getDocs(q);
      const isUsedByOther = querySnapshot.docs.some(docSnap => docSnap.id !== user.uid);
      if (isUsedByOther) {
        setSaveMessage("Error: Roll number is already registered to another account.");
        setIsSaving(false);
        return false;
      }

      await setDoc(doc(db, "grades", user.uid), {
        studentDetails,
        grades,
        updatedAt: new Date().toISOString(),
      });
      // Ensure details sync to the users collection for the Admin panel and future logins
      await updateDoc(doc(db, "users", user.uid), {
        displayName: studentDetails.name,
        regNo: studentDetails.rollNo,
        branch: studentDetails.branch
      });
      setSaveMessage("Progress saved to cloud!");
      setTimeout(() => setSaveMessage(""), 3000);
      return true;
    } catch (error) {
      console.error("Error saving to cloud:", error);
      setSaveMessage("Error: Failed to save progress.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !newPassword) return;
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setPasswordMessage("Session expired. Please log in again.");
      return;
    }
    setIsChangingPassword(true);
    try {
      await updatePassword(currentUser, newPassword);
      setPasswordMessage("Password updated successfully!");
      setNewPassword("");
      setTimeout(() => setPasswordMessage(""), 4000);
    } catch (error: any) {
      console.error("Error updating password:", error);
      setPasswordMessage(error.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };


  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setStudentDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGradeChange = (semesterId: number, subjectCode: string, grade: string) => {
    setGrades((prev) => ({
      ...prev,
      [semesterId]: {
        ...(prev[semesterId] || {}),
        [subjectCode]: grade,
      },
    }));
    setValidationError(null); // Clear error on change
  };

  // Compute Year based on max semester filled
  const isDetailsComplete = !!(studentDetails.name && studentDetails.rollNo && studentDetails.branch);

  const currentUser = auth.currentUser;
  const hasPasswordProvider = currentUser?.providerData.some((p: any) => p.providerId === "password");
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);

  const year = useMemo(() => {
    const filledSemesters = Object.keys(grades)
      .filter((semId) => {
        const semGrades = grades[Number(semId)];
        return Object.values(semGrades).some((g) => g !== "");
      })
      .map(Number);

    if (filledSemesters.length === 0) return "1st Year";
    const maxSem = Math.max(...filledSemesters);
    if (maxSem <= 2) return "1st Year";
    if (maxSem <= 4) return "2nd Year";
    if (maxSem <= 6) return "3rd Year";
    return "4th Year";
  }, [grades]);

  // Compute SGPA for each semester
  const sgpaData = useMemo(() => {
    const data: Record<number, number> = {};
    semestersData.forEach((sem) => {
      const scale = sem.id <= 2 ? gradingScale1to2 : gradingScale3to6;
      const semGrades = grades[sem.id];
      if (!semGrades) return;

      let totalPoints = 0;
      let totalCredits = 0;

      sem.subjects.forEach((sub) => {
        const grade = semGrades[sub.code];
        if (grade && grade in scale) {
          totalPoints += scale[grade] * sub.credit;
          totalCredits += sub.credit;
        }
      });

      if (totalCredits > 0) {
        data[sem.id] = totalPoints / totalCredits;
      }
    });
    return data;
  }, [grades]);

  // Compute overall CGPA
  const cgpa = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;

    semestersData.forEach((sem) => {
      const scale = sem.id <= 2 ? gradingScale1to2 : gradingScale3to6;
      const semGrades = grades[sem.id];
      if (!semGrades) return;

      sem.subjects.forEach((sub) => {
        const grade = semGrades[sub.code];
        if (grade && grade in scale) {
          totalPoints += scale[grade] * sub.credit;
          totalCredits += sub.credit;
        }
      });
    });

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }, [grades]);

  // Validation logic
  const checkValidation = () => {
    const filledSemesters = Object.keys(grades)
      .map(Number)
      .filter((semId) => {
        const semGrades = grades[semId];
        return Object.values(semGrades).some((g) => g !== "");
      })
      .sort((a, b) => a - b);

    if (filledSemesters.length === 0) {
      setValidationError("Please fill in at least one semester.");
      return false;
    }

    const maxSem = filledSemesters[filledSemesters.length - 1];

    for (let i = 1; i <= maxSem; i++) {
      const semData = semestersData.find((s) => s.id === i);
      if (!semData) continue;

      const semGrades = grades[i] || {};
      const missingSubjects = semData.subjects.filter((sub) => !semGrades[sub.code]);

      if (missingSubjects.length > 0) {
        setValidationError(`Missing grades in Semester ${i}: ${missingSubjects.map((s) => s.name).join(", ")}`);
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const handleDownload = async () => {
    if (!checkValidation()) {
      return;
    }

    const doc = (
      <GradeSheetPDF
        studentDetails={{ ...studentDetails, year }}
        grades={grades}
        sgpaData={sgpaData}
        cgpa={cgpa}
        theme={pdfTheme}
      />
    );
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    const url = URL.createObjectURL(blob);
    
    const safeName = studentDetails.name.trim().replace(/\s+/g, "+") || "Student";
    const filename = `${safeName}+grade+sheet.pdf`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = async () => {
    if (!checkValidation()) {
      return;
    }

    try {
      setValidationError(null);
      const response = await fetch("/api/download-excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentDetails: { ...studentDetails, year },
          grades,
          sgpaData,
          cgpa,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate Excel sheet");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const safeName = studentDetails.name.trim().replace(/\s+/g, "_") || "Student";
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}_Academic_Record.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || "Something went wrong downloading the Excel sheet.");
    }
  };

  const currentSemester = semestersData.find((s) => s.id === currentSemesterId)!;
  
  // Custom styling for successive option colors to avoid grade confusion
  const getOptionStyle = (g: string) => {
    // Old Scheme - greens/blues
    if (g === "O") return { backgroundColor: "#1e3a1e", color: "#6ee7b7" };
    if (g === "E") return { backgroundColor: "#143a2e", color: "#34d399" };
    if (g === "A") return { backgroundColor: "#063d3b", color: "#2dd4bf" };
    if (g === "B") return { backgroundColor: "#1e3b4a", color: "#38bdf8" };
    if (g === "C") return { backgroundColor: "#2e2e48", color: "#818cf8" };
    if (g === "D") return { backgroundColor: "#3a2a45", color: "#c084fc" };
    if (g === "F") return { backgroundColor: "#451e1e", color: "#f87171" };
    if (g === "SA" || g === "M") return { backgroundColor: "#2a2a2a", color: "#a1a1aa" };

    // New Scheme / Back Paper - warm terracotta/yellows
    if (g === "O_BACK") return { backgroundColor: "#45241e", color: "#fca5a5" };
    if (g === "A_BACK") return { backgroundColor: "#3f2b1d", color: "#fed7aa" };
    if (g === "B_BACK") return { backgroundColor: "#372e1c", color: "#fef08a" };
    if (g === "C_BACK") return { backgroundColor: "#2e311b", color: "#d9f99d" };
    if (g === "D_BACK") return { backgroundColor: "#22351f", color: "#bbf7d0" };
    if (g === "P_BACK") return { backgroundColor: "#1d352d", color: "#99f6e4" };
    if (g === "F_BACK") return { backgroundColor: "#3f1c1c", color: "#fca5a5" };
    if (g === "SA_BACK" || g === "M_BACK") return { backgroundColor: "#242424", color: "#d4d4d8" };

    // Sem 3+ Pass grade
    if (g === "P") return { backgroundColor: "#3f3f2a", color: "#eab308" };

    return {};
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-[#E0E0E0] text-xl font-serif italic">Loading...</div>
      </div>
    );
  }

  if (!user) return null; // Prevent flash of content before redirect

  return (
    <div className="min-h-screen bg-canvas text-body font-sans">
      <header className="h-16 border-b border-hairline flex items-center justify-between px-6 md:px-12 sticky top-0 z-10 bg-canvas/80 backdrop-blur-md">
        <div className="font-medium text-xl text-ink title-display italic">
          Cal.CGPA
        </div>
        <div className="flex items-center gap-4">
          {user?.role === "admin" && (
            <Link href="/admin" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" /> Admin Panel
            </Link>
          )}
          <div className="text-sm text-muted hidden sm:block">
            {user?.email}
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="border-hairline text-xs py-1 h-8">
            <LogOut className="w-3 h-3 mr-2" /> Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-ink mb-4 title-display">
            Calculate your Academic Performance
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto font-light">
            A beautiful, simple tool to track your semester grades, compute your SGPA and CGPA, and generate a personalized grade sheet.
          </p>
        </div>

        <div className="space-y-12">
          {/* Personal Details */}
          <section>
            <Card className="bg-surface-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-3">
                  Personal Details
                  {isDetailsComplete ? (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Completed</span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">Missing</span>
                  )}
                  {!hasPasswordProvider && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">No Assigned Password</span>
                  )}
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-hairline h-8"
                  onClick={async () => {
                    if (isEditingDetails) {
                      const success = await handleSaveToCloud();
                      if (success) {
                        setIsEditingDetails(false);
                      }
                    } else {
                      setIsEditingDetails(true);
                    }
                  }}
                >
                  {isEditingDetails ? "Lock Details" : "Edit Details"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g. Anshuman Pattnaik"
                      value={studentDetails.name}
                      onChange={handleDetailChange}
                      disabled={!isEditingDetails}
                      className={!isEditingDetails ? "opacity-70 bg-surface-soft cursor-not-allowed" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rollNo">Registration No.</Label>
                    <Input
                      id="rollNo"
                      name="rollNo"
                      placeholder="e.g. 23110409"
                      value={studentDetails.rollNo}
                      onChange={handleDetailChange}
                      disabled={!isEditingDetails}
                      className={!isEditingDetails ? "opacity-70 bg-surface-soft cursor-not-allowed" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select
                      id="branch"
                      name="branch"
                      value={studentDetails.branch}
                      onChange={handleDetailChange}
                      disabled={!isEditingDetails}
                    >
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      {/* Later we will add other branches */}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Calculated Year</Label>
                    <div className="flex h-10 w-full items-center rounded-md border border-hairline bg-surface-soft px-3.5 text-sm text-muted">
                      {year}
                    </div>
                  </div>
                </div>

                {/* Password Change UI */}
                {isEditingDetails && (
                  <div className="mt-8 pt-6 border-t border-hairline">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-ink">Security</h3>
                        <p className="text-sm text-muted">
                          {hasPasswordProvider ? "Your account is secured with a password." : "Password not setup."}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPasswordSetup(!showPasswordSetup)}
                      >
                        {showPasswordSetup ? "Cancel" : (hasPasswordProvider ? "Change Password" : "Set up Password")}
                      </Button>
                    </div>

                    {showPasswordSetup && (
                      <div className="flex flex-col sm:flex-row gap-4 items-end mt-4 p-4 bg-surface-soft rounded-lg border border-hairline">
                        <div className="space-y-2 flex-1 max-w-sm">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={!isEditingDetails}
                          />
                        </div>
                        <Button
                          onClick={handleChangePassword}
                          disabled={isChangingPassword || !newPassword || !isEditingDetails}
                          className="bg-surface-dark text-on-dark hover:bg-surface-dark-elevated h-10"
                        >
                          {isChangingPassword ? "Saving..." : "Save Password"}
                        </Button>
                      </div>
                    )}
                    {passwordMessage && (
                      <p className={`mt-2 text-sm ${passwordMessage.includes("success") ? "text-emerald-500" : "text-rose-500"}`}>
                        {passwordMessage}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Progressive Semester Selection */}
          <section>
            <Card className="bg-surface-card">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-6">
                <div>
                  <CardTitle className="text-xl mb-1">Semester Grades</CardTitle>
                  <p className="text-sm text-muted">Select a semester and fill out your grades.</p>
                </div>
                <div className="w-full sm:w-48">
                  <Select
                    value={currentSemesterId}
                    onChange={(e) => setCurrentSemesterId(Number(e.target.value))}
                  >
                    {semestersData.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-hairline">
                  {currentSemester.subjects.map((sub) => {
                    const selectedGrade = grades[currentSemesterId]?.[sub.code] || "";
                    const isBackCleared = selectedGrade.endsWith("_BACK");

                    return (
                      <div key={sub.code} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-surface-soft transition-colors even:bg-surface-soft/40 sm:even:bg-transparent">
                        <div className="mb-3 sm:mb-0 sm:pr-4 flex-1">
                          <div className="font-medium text-ink flex flex-wrap items-center gap-2">
                            <span>{sub.name}</span>
                            {isBackCleared && (
                              <span className="text-[10px] uppercase tracking-wider font-semibold bg-primary/20 text-primary px-2.5 py-0.5 rounded-full border border-primary/30 animate-pulse">
                                back cleared
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted mt-1 font-mono">
                            {sub.code} • {sub.credit} Credits
                          </div>
                        </div>
                        <div className="w-full sm:w-48 shrink-0">
                          <GradeDropdown
                            value={selectedGrade}
                            onChange={(val) => handleGradeChange(currentSemesterId, sub.code, val)}
                            semesterId={currentSemesterId}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="bg-surface-soft border-t border-hairline p-4 sm:p-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentSemesterId((prev) => Math.max(1, prev - 1))}
                  disabled={currentSemesterId === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <div className="text-sm font-medium text-ink flex items-center px-4">
                  SGPA: {sgpaData[currentSemesterId]?.toFixed(2) || "0.00"}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentSemesterId((prev) => Math.min(6, prev + 1))}
                  disabled={currentSemesterId === 6}
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </section>

          {/* Validation Error */}
          {validationError && (
            <div className="bg-primary-disabled border border-primary text-ink px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
              <div className="text-sm font-medium leading-relaxed">{validationError}</div>
            </div>
          )}

          {/* Results & Download */}
          <section>
            <Card className="bg-transparent border-none shadow-none text-center pt-8 pb-4">
              <h2 className="text-xl md:text-2xl font-medium title-display text-muted mb-2">Overall CGPA</h2>
              <div className="text-6xl md:text-8xl font-bold title-display tracking-tight text-ink mb-8">
                {cgpa.toFixed(2)}
              </div>
              
              <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                <div className="w-full space-y-2 text-left">
                  <Label htmlFor="pdfTheme">PDF Theme</Label>
                  <Select
                    id="pdfTheme"
                    value={pdfTheme}
                    onChange={(e) => setPdfTheme(e.target.value as "light" | "dark")}
                  >
                    <option value="light">Light Theme</option>
                    <option value="dark">Dark Theme</option>
                  </Select>
                </div>
                
                <div className="w-full space-y-3">
                  <Button size="lg" className="w-full font-bold tracking-wide shadow-md bg-[#2A2A2A] hover:bg-[#333333] text-white border border-[#404040]" onClick={handleSaveToCloud} disabled={isSaving}>
                    <Save className="mr-2 h-5 w-5" />
                    {isSaving ? "Saving..." : "Save Progress to Cloud"}
                  </Button>
                  
                  {saveMessage && (
                    <div className="text-sm text-center font-medium" style={{ color: saveMessage.includes("Error") ? "#fca5a5" : "#34d399" }}>
                      {saveMessage}
                    </div>
                  )}

                  <Button size="lg" className="w-full font-bold tracking-wide shadow-md" onClick={handleDownload}>
                    <Download className="mr-2 h-5 w-5" />
                    Download Grade Sheet (PDF)
                  </Button>
                  
                  <Button size="lg" variant="outline" className="w-full font-bold tracking-wide border-hairline" onClick={handleDownloadExcel}>
                    <Download className="mr-2 h-5 w-5" />
                    Download Record (Excel)
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>

      <footer className="border-t border-hairline py-12 mt-24">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted">
          <div>Author: Anshuman Pattnaik</div>
          <div className="flex gap-6">
            <a href="https://github.com/ANSHPG" target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/anshuman-pattnaik-9694a3255/" target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
