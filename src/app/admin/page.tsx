"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, User as UserIcon, Save, Download, Trash2, CheckCircle, BadgeCheck, Users, GraduationCap, Archive } from "lucide-react";
import Link from "next/link";
import { semestersData, gradingScale1to2, gradingScale3to6, gradeDisplayLabels } from "@/lib/data";
import { SemesterDropdown } from "@/components/SemesterDropdown";
import { GradeDropdown } from "@/components/GradeDropdown";

interface Student {
  uid: string;
  email: string;
  displayName: string;
  regNo: string;
  branch?: string;
  role?: "student" | "admin";
  verified?: boolean;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [allGrades, setAllGrades] = useState<Record<string, any>>({});
  const [studentGrades, setStudentGrades] = useState<any>(null);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [currentSemesterId, setCurrentSemesterId] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [editCreds, setEditCreds] = useState({ displayName: "", regNo: "", email: "", branch: "" });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/dashboard");
      } else {
        fetchStudents();
      }
    }
  }, [user, loading, router]);

  const fetchStudents = async () => {
    try {
      const [usersSnap, gradesSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "grades"))
      ]);

      const gradesMap: Record<string, any> = {};
      gradesSnap.forEach((doc) => {
        gradesMap[doc.id] = doc.data();
      });
      setAllGrades(gradesMap);

      const studentsList: Student[] = [];
      usersSnap.forEach((doc) => {
        const data = doc.data();
        studentsList.push({ uid: doc.id, ...data } as Student);
      });
      // Sort students by regNo (ascending), putting empty regNo at bottom
      studentsList.sort((a, b) => {
        const hasRegA = a.regNo && a.regNo.trim() !== "";
        const hasRegB = b.regNo && b.regNo.trim() !== "";
        
        if (hasRegA && !hasRegB) return -1;
        if (!hasRegA && hasRegB) return 1;
        if (!hasRegA && !hasRegB) return 0;

        const regA = Number(a.regNo) || 0;
        const regB = Number(b.regNo) || 0;
        return regA - regB;
      });
      setStudents(studentsList);
      setFilteredStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredStudents(
      students.filter(
        (s) =>
          (s.displayName && s.displayName.toLowerCase().includes(term)) ||
          (s.regNo && s.regNo.toLowerCase().includes(term)) ||
          (s.email && s.email.toLowerCase().includes(term))
      )
    );
  }, [searchTerm, students]);

  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student);
    setLoadingGrades(true);
    setIsEditing(false);
    setIsEditingCredentials(false);
    setEditCreds({
      displayName: student.displayName || "",
      regNo: student.regNo || "",
      email: student.email || "",
      branch: student.branch || "Electrical Engineering"
    });
    setStudentGrades(null);
    setCurrentSemesterId(1);
    try {
      const docRef = doc(db, "grades", student.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStudentGrades(docSnap.data());
      } else {
        setStudentGrades({ grades: {} });
      }
    } catch (error) {
      console.error("Error fetching student grades:", error);
    } finally {
      setLoadingGrades(false);
    }
  };

  const handleGradeChange = (semesterId: number, subjectCode: string, grade: string) => {
    setStudentGrades((prev: any) => ({
      ...prev,
      grades: {
        ...(prev?.grades || {}),
        [semesterId]: {
          ...(prev?.grades?.[semesterId] || {}),
          [subjectCode]: grade,
        },
      },
    }));
  };

  const handleSaveToCloud = async () => {
    if (!selectedStudent || !studentGrades) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "grades", selectedStudent.uid), studentGrades, { merge: true });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving to cloud:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!selectedStudent) return;
    setIsSavingCredentials(true);
    try {
      await setDoc(doc(db, "users", selectedStudent.uid), editCreds, { merge: true });
      setSelectedStudent({ ...selectedStudent, ...editCreds });
      setIsEditingCredentials(false);
      setStudents(students.map(s => s.uid === selectedStudent.uid ? { ...s, ...editCreds } : s));
    } catch (error) {
      console.error("Error saving credentials:", error);
    } finally {
      setIsSavingCredentials(false);
    }
  };

  const handleVerifyStudent = async () => {
    if (!selectedStudent) return;
    try {
      const newStatus = !selectedStudent.verified;
      await setDoc(doc(db, "users", selectedStudent.uid), { verified: newStatus }, { merge: true });
      setSelectedStudent({ ...selectedStudent, verified: newStatus });
      setStudents(students.map(s => s.uid === selectedStudent.uid ? { ...s, verified: newStatus } : s));
      setFilteredStudents(filteredStudents.map(s => s.uid === selectedStudent.uid ? { ...s, verified: newStatus } : s));
    } catch (error) {
      console.error("Error verifying student:", error);
      alert("Failed to update verification status.");
    }
  };

  const handleDeleteStudentData = async () => {
    if (!selectedStudent) return;
    
    if (confirm(`Are you sure you want to permanently delete all data for ${selectedStudent.displayName || selectedStudent.email}? This cannot be undone.`)) {
      try {
        // Delete from Authentication and Firestore via our new backend API route
        const response = await fetch("/api/delete-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid: selectedStudent.uid }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete user from Authentication");
        }
        
        alert("User data has been completely deleted from Firestore and Authentication.");
        
        // Remove from local state
        const newStudents = students.filter(s => s.uid !== selectedStudent.uid);
        setStudents(newStudents);
        setFilteredStudents(newStudents);
        setSelectedStudent(null);
        setStudentGrades(null);
      } catch (error: any) {
        console.error("Error deleting student data:", error);
        alert(`Failed to delete student data: ${error.message || "Unknown error"}`);
      }
    }
  };

  const calculateSgpa = (grades: any, semId: number) => {
    if (!grades) return "0.00";
    const sem = semestersData.find(s => s.id === semId);
    if (!sem) return "0.00";
    const scale = sem.isOldScheme ? gradingScale1to2 : (sem.id <= 2 ? gradingScale1to2 : gradingScale3to6);
    const semGrades = grades[semId];
    if (!semGrades) return "0.00";

    let totalPoints = 0;
    let totalCredits = 0;

    sem.subjects.forEach((sub) => {
      const grade = semGrades[sub.code];
      if (grade && grade in scale) {
        totalPoints += scale[grade] * sub.credit;
        totalCredits += sub.credit;
      }
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  // Utility to calculate CGPA for a student to show in the UI
  const calculateCgpa = (grades: any) => {
    if (!grades) return "0.00";
    let totalPoints = 0;
    let totalCredits = 0;

    semestersData.forEach((sem) => {
      const scale = sem.isOldScheme ? gradingScale1to2 : (sem.id <= 2 ? gradingScale1to2 : gradingScale3to6);
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

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const handleDownloadExcel = async () => {
    if (!selectedStudent || !studentGrades?.grades) return;

    // Calculate year based on filled semesters
    const grades = studentGrades.grades;
    const filledSemesters = Object.keys(grades)
      .filter((semId) => {
        const semGrades = grades[Number(semId)];
        return Object.values(semGrades).some((g) => g !== "");
      })
      .map(Number);
    
    let year = "1st Year";
    if (filledSemesters.length > 0) {
      const maxBaseSem = Math.max(...filledSemesters.map(id => {
        const sem = semestersData.find(s => s.id === id);
        return sem?.baseSem || id;
      }));
      const yearNum = maxBaseSem % 2 === 0 ? (maxBaseSem / 2) + 1 : (maxBaseSem + 1) / 2;
      const suffix = yearNum === 1 ? "st" : yearNum === 2 ? "nd" : yearNum === 3 ? "rd" : "th";
      year = `${yearNum}${suffix} Year`;
    }

    const sgpaData: Record<number, number> = {};
    semestersData.forEach(sem => {
      sgpaData[sem.id] = Number(calculateSgpa(grades, sem.id));
    });

    const cgpa = Number(calculateCgpa(grades));

    try {
      const response = await fetch("/api/download-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentDetails: { 
            name: selectedStudent.displayName || "Unknown", 
            rollNo: selectedStudent.regNo || "", 
            branch: selectedStudent.branch || "Electrical Engineering", 
            year 
          },
          grades,
          sgpaData,
          cgpa,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate Excel sheet");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const safeName = (selectedStudent.displayName || "Student").trim().replace(/\s+/g, "_");
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}_Academic_Record.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Something went wrong downloading the Excel sheet.");
    }
  };

  const handleDownloadAllExcel = async () => {
    setIsDownloadingAll(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const folder = zip.folder("Student_Excel_Sheets");

      for (const student of students) {
        const studentGradeData = allGrades[student.uid];
        if (!studentGradeData || !studentGradeData.grades) continue;
        const grades = studentGradeData.grades;

        const filledSemesters = Object.keys(grades)
          .filter((semId) => {
            const semGrades = grades[Number(semId)];
            return Object.values(semGrades).some((g) => g !== "");
          })
          .map(Number);
        
        let year = "1st Year";
        if (filledSemesters.length > 0) {
          const maxBaseSem = Math.max(...filledSemesters.map(id => {
            const sem = semestersData.find(s => s.id === id);
            return sem?.baseSem || id;
          }));
          const yearNum = maxBaseSem % 2 === 0 ? (maxBaseSem / 2) + 1 : (maxBaseSem + 1) / 2;
          const suffix = yearNum === 1 ? "st" : yearNum === 2 ? "nd" : yearNum === 3 ? "rd" : "th";
          year = `${yearNum}${suffix} Year`;
        }

        const sgpaData: Record<number, number> = {};
        semestersData.forEach(sem => {
          sgpaData[sem.id] = Number(calculateSgpa(grades, sem.id));
        });

        const cgpa = Number(calculateCgpa(grades));

        const response = await fetch("/api/download-excel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentDetails: { 
              name: student.displayName || "Unknown", 
              rollNo: student.regNo || "", 
              branch: student.branch || "Electrical Engineering", 
              year 
            },
            grades,
            sgpaData,
            cgpa,
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const safeName = (student.displayName || "Student").trim().replace(/\s+/g, "_");
          folder?.file(`${safeName}_Academic_Record.xlsx`, blob);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `All_Student_Excel_Sheets.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Something went wrong generating the ZIP file.");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const totalStudents = students.length;
  const verifiedStudentsCount = students.filter(s => s.verified).length;
  const studentsCompleted6Sems = students.filter(s => {
    const sGrades = allGrades[s.uid]?.grades;
    if (!sGrades) return false;
    const filledSemsCount = Object.keys(sGrades).filter((semId) => {
      const semGrades = sGrades[Number(semId)];
      return Object.values(semGrades).some((g) => g !== "");
    }).length;
    return filledSemsCount >= 6;
  }).length;

  if (loading || (user && user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-[#E0E0E0] text-xl font-serif italic">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-body font-sans">
      <header className="h-16 border-b border-hairline flex items-center px-6 md:px-12 sticky top-0 z-10 bg-canvas/80 backdrop-blur-md">
        <Link href="/" className="mr-4 text-muted hover:text-ink transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="font-medium text-xl text-ink title-display italic">
          Admin Dashboard
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Metrics Row */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Card className="bg-surface-card border-hairline flex items-center p-4">
            <div className="p-3 bg-primary/10 rounded-full mr-4 text-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Registered</p>
              <h4 className="text-2xl font-bold text-ink">{totalStudents}</h4>
            </div>
          </Card>
          <Card className="bg-surface-card border-hairline flex items-center p-4">
            <div className="p-3 bg-emerald-500/10 rounded-full mr-4 text-emerald-500">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted">Filled 6 Semesters</p>
              <h4 className="text-2xl font-bold text-ink">{studentsCompleted6Sems}</h4>
            </div>
          </Card>
          <Card className="bg-surface-card border-hairline flex items-center p-4">
            <div className="p-3 bg-blue-500/10 rounded-full mr-4 text-blue-500">
              <BadgeCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted">Verified Students</p>
              <h4 className="text-2xl font-bold text-ink">{verifiedStudentsCount}</h4>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 flex justify-end">
          <Button 
            onClick={handleDownloadAllExcel}
            disabled={isDownloadingAll || students.length === 0}
            className="bg-primary hover:bg-primary-active text-white shadow-sm"
          >
            <Archive className="w-4 h-4 mr-2" />
            {isDownloadingAll ? "Generating ZIP..." : "Download All Excel Sheets (ZIP)"}
          </Button>
        </div>

        {/* Student List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted" />
            </div>
            <Input
              type="text"
              placeholder="Search by name, RegNo, or email..."
              className="pl-10 bg-surface-soft border-hairline text-ink placeholder-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="bg-surface-card max-h-64 lg:max-h-none lg:h-[calc(100vh-200px)] overflow-y-auto">
            <CardContent className="p-0 divide-y divide-hairline">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <button
                    key={student.uid}
                    onClick={() => handleStudentClick(student)}
                    className={`w-full text-left p-4 hover:bg-surface-soft transition-colors flex items-center gap-3 ${
                      selectedStudent?.uid === student.uid ? "bg-surface-soft border-l-2 border-primary" : ""
                    }`}
                  >
                    <div className="bg-[#2A2A2A] p-2 rounded-full text-muted">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-medium text-ink truncate flex items-center gap-2">
                        {student.displayName || "Unknown Name"}
                        {student.role === "admin" && (
                          <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-rose-500/10 text-rose-500 rounded border border-rose-500/20">Admin</span>
                        )}
                        {student.verified && (
                          <span title="Verified">
                            <BadgeCheck className="w-4 h-4 text-blue-500" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted font-mono">{student.regNo || "No RegNo"}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-muted text-sm">No students found.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student Details Panel */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <Card className="bg-surface-card min-h-[calc(100vh-200px)]">
              <CardHeader className="border-b border-hairline bg-surface-soft/50">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4">
                  <div className="flex-1 w-full sm:w-auto">
                    {!isEditingCredentials ? (
                      <>
                        <CardTitle className="text-2xl text-ink font-serif italic mb-1">
                          {selectedStudent.displayName || "Unknown Student"}
                        </CardTitle>
                        <div className="text-sm text-muted font-mono flex flex-wrap gap-4 mt-2">
                          <span>{selectedStudent.regNo || "No RegNo"}</span>
                          <span>•</span>
                          <span className="truncate">{selectedStudent.email}</span>
                          {selectedStudent.branch && (
                            <>
                              <span>•</span>
                              <span>{selectedStudent.branch}</span>
                            </>
                          )}
                          {selectedStudent.verified && (
                            <>
                              <span>•</span>
                              <span className="text-blue-500 font-bold flex items-center gap-1">
                                <BadgeCheck className="w-4 h-4" /> Verified
                              </span>
                            </>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <Button 
                            onClick={handleVerifyStudent}
                            variant="ghost" 
                            size="sm"
                            className="text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 h-6 px-2 -ml-2"
                          >
                            <BadgeCheck className="w-3 h-3 mr-1" /> 
                            {selectedStudent.verified ? "Unverify Student" : "Verify Student"}
                          </Button>
                          <Button 
                            onClick={() => setIsEditingCredentials(true)}
                            variant="ghost" 
                            size="sm"
                            className="text-xs text-primary hover:text-primary-active h-6 px-2 -ml-2"
                          >
                            Edit Credentials
                          </Button>
                          <Button 
                            onClick={handleDeleteStudentData}
                            variant="ghost" 
                            size="sm"
                            className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-6 px-2"
                          >
                            <Trash2 className="w-3 h-3 mr-1" /> Delete Data
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3 bg-surface-soft p-4 rounded-md border border-hairline w-full max-w-sm">
                        <div>
                          <label className="text-xs text-muted">Name</label>
                          <Input 
                            value={editCreds.displayName} 
                            onChange={e => setEditCreds({...editCreds, displayName: e.target.value})}
                            className="h-8 text-sm bg-surface-card"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted">RegNo</label>
                          <Input 
                            value={editCreds.regNo} 
                            onChange={e => setEditCreds({...editCreds, regNo: e.target.value})}
                            className="h-8 text-sm bg-surface-card"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted">Email (Read-Only)</label>
                          <Input 
                            value={editCreds.email} 
                            disabled
                            className="h-8 text-sm bg-surface-card opacity-50 cursor-not-allowed"
                          />
                          <p className="text-[10px] text-muted mt-1 leading-tight">
                            Email cannot be changed here because it is linked to the user's Firebase Auth credentials.
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-muted">Branch</label>
                          <select 
                            value={editCreds.branch} 
                            onChange={e => setEditCreds({...editCreds, branch: e.target.value})}
                            className="w-full h-8 text-sm border border-hairline bg-surface-card rounded px-2 text-ink focus:outline-none"
                          >
                            <option value="Electrical Engineering">Electrical Engineering</option>
                          </select>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button 
                            onClick={handleSaveCredentials} 
                            disabled={isSavingCredentials}
                            size="sm"
                            className="h-8 text-xs bg-primary hover:bg-primary-active text-white flex-1"
                          >
                            {isSavingCredentials ? "Saving..." : "Save Credentials"}
                          </Button>
                          <Button 
                            onClick={() => setIsEditingCredentials(false)}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  {studentGrades && (
                    <div className="text-left sm:text-right flex flex-col sm:items-end w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-hairline sm:border-0">
                      <div className="text-xs uppercase tracking-wider text-muted font-semibold">Current CGPA</div>
                      <div className="text-3xl font-bold text-primary title-display mb-2">
                        {calculateCgpa(studentGrades.grades)}
                      </div>
                      {isEditing ? (
                        <Button 
                          onClick={handleSaveToCloud} 
                          disabled={isSaving}
                          className="bg-primary hover:bg-primary-active text-white text-xs py-1 h-8 w-full sm:w-auto"
                        >
                          {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-1" /> Save Changes</>}
                        </Button>
                      ) : (
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          <Button 
                            onClick={handleDownloadExcel}
                            variant="outline" 
                            className="text-xs py-1 h-8 w-full border-primary text-primary hover:bg-primary/10"
                          >
                            <Download className="w-4 h-4 mr-1" /> Download Excel
                          </Button>
                          <Button 
                            onClick={() => {
                              if (!studentGrades) {
                                setStudentGrades({ grades: {} });
                              }
                              setIsEditing(true);
                            }}
                            variant="outline" 
                            className="text-xs py-1 h-8 w-full border-primary text-primary hover:bg-primary hover:text-white"
                          >
                            {studentGrades && Object.keys(studentGrades.grades || {}).length > 0 ? "Edit Grades" : "Assign Grades"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loadingGrades ? (
                  <div className="text-center py-12 text-muted">Loading grades...</div>
                ) : studentGrades ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-hairline pb-6">
                      <div className="flex items-baseline gap-4 w-full sm:w-auto">
                        <h3 className="text-xl font-medium title-display text-ink">Semester Grades</h3>
                        <div className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                          SGPA: {calculateSgpa(studentGrades.grades, currentSemesterId)}
                        </div>
                      </div>
                      <div className="w-full sm:w-[320px]">
                        <SemesterDropdown
                          value={currentSemesterId}
                          onChange={(val) => setCurrentSemesterId(val)}
                        />
                      </div>
                    </div>

                    <div className="divide-y divide-hairline border border-hairline rounded-lg bg-surface-card">
                      {semestersData.find(s => s.id === currentSemesterId)?.subjects.map((sub) => {
                        const gradesObj = studentGrades.grades?.[currentSemesterId] || {};
                        const grade = gradesObj[sub.code] || "";
                        const isBackCleared = grade && grade.endsWith("_BACK");
                        const displayGrade = grade ? grade.replace("_BACK", "") : "Not filled";

                        return (
                          <div key={sub.code} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-surface-soft transition-colors">
                            <div className="mb-2 sm:mb-0 flex-1">
                              <div className="font-medium text-ink flex items-center gap-2">
                                <span>{sub.name}</span>
                                {isBackCleared && (
                                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                                    back cleared
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted mt-1 font-mono">
                                {sub.code} • {sub.credit} Credits
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center justify-end w-full sm:w-48 mt-2 sm:mt-0">
                              {isEditing ? (
                                <GradeDropdown
                                  value={grade}
                                  onChange={(val) => handleGradeChange(currentSemesterId, sub.code, val)}
                                  semesterId={currentSemesterId}
                                />
                              ) : grade ? (
                                <div className="font-bold text-lg text-ink bg-surface-soft px-4 py-1 rounded-md border border-hairline min-w-[60px] text-center">
                                  {displayGrade}
                                </div>
                              ) : (
                                <div className="text-sm text-muted italic">--</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted flex flex-col items-center">
                    <p className="mb-4">This student hasn't saved any grades yet.</p>
                    <Button 
                      onClick={() => {
                        setStudentGrades({ grades: {} });
                        setIsEditing(true);
                      }}
                      variant="outline"
                      className="border-primary text-primary"
                    >
                      Assign Grades Manually
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-[calc(100vh-200px)] border border-hairline border-dashed rounded-xl flex items-center justify-center bg-surface-soft/20 text-muted">
              Select a student from the list to view their record.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
