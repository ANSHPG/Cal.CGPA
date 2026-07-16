"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { gradingScale1to2, gradingScale3to6, semestersData } from "@/lib/data";

interface Student {
  uid: string;
  email: string;
  displayName: string;
  regNo: string;
  branch?: string;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentGrades, setStudentGrades] = useState<any>(null);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [currentSemesterId, setCurrentSemesterId] = useState(1);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/");
      } else {
        fetchStudents();
      }
    }
  }, [user, loading, router]);

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const studentsList: Student[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "student") {
          studentsList.push(data as Student);
        }
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

  // Utility to calculate CGPA for a student to show in the UI
  const calculateCgpa = (grades: any) => {
    if (!grades) return 0;
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

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

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
        {/* Student List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted" />
            </div>
            <Input
              type="text"
              placeholder="Search by name, RedgNo, or email..."
              className="pl-10 bg-surface-soft border-hairline text-ink placeholder-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="bg-surface-card h-[calc(100vh-200px)] overflow-y-auto">
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
                      <div className="font-medium text-ink truncate">{student.displayName || "Unknown Name"}</div>
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
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-ink font-serif italic mb-1">
                      {selectedStudent.displayName || "Unknown Student"}
                    </CardTitle>
                    <div className="text-sm text-muted font-mono flex gap-4 mt-2">
                      <span>{selectedStudent.regNo || "No RegNo"}</span>
                      <span>•</span>
                      <span>{selectedStudent.email}</span>
                      {selectedStudent.branch && (
                        <>
                          <span>•</span>
                          <span>{selectedStudent.branch}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {studentGrades && (
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-wider text-muted font-semibold">Current CGPA</div>
                      <div className="text-3xl font-bold text-primary title-display">
                        {calculateCgpa(studentGrades.grades)}
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loadingGrades ? (
                  <div className="text-center py-12 text-muted">Loading grades...</div>
                ) : studentGrades && Object.keys(studentGrades.grades || {}).length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-6">
                      <div>
                        <h3 className="text-xl font-medium title-display text-ink">Semester Grades</h3>
                      </div>
                      <div className="w-full sm:w-48 shrink-0">
                        <select
                          className="w-full px-3 py-2 border border-hairline rounded-md bg-surface-soft text-ink focus:outline-none"
                          value={currentSemesterId}
                          onChange={(e) => setCurrentSemesterId(Number(e.target.value))}
                        >
                          {semestersData.map((sem) => (
                            <option key={sem.id} value={sem.id}>
                              {sem.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="divide-y divide-hairline border border-hairline rounded-lg overflow-hidden bg-surface-card">
                      {semestersData.find(s => s.id === currentSemesterId)?.subjects.map((sub) => {
                        const gradesObj = studentGrades.grades[currentSemesterId] || {};
                        const grade = gradesObj[sub.code];
                        const isBackCleared = grade && grade.endsWith("_BACK");
                        const displayGrade = grade ? grade.replace("_BACK", "") : "Not filled";

                        return (
                          <div key={sub.code} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-surface-soft transition-colors">
                            <div className="mb-2 sm:mb-0">
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
                            <div className="shrink-0 flex items-center justify-end sm:w-32">
                              {grade ? (
                                <div className="font-bold text-lg text-ink bg-surface-soft px-4 py-1 rounded-md border border-hairline">
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
                  <div className="text-center py-12 text-muted">
                    This student hasn't saved any grades yet.
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
