"use client";

import React, { useState, useMemo } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { semestersData, gradingScale1to2, gradingScale3to6 } from "@/lib/data";
import { GradeSheetPDF } from "@/components/GradeSheetPDF";

export default function Home() {
  const [studentDetails, setStudentDetails] = useState({
    name: "",
    rollNo: "",
    branch: "Electrical Engineering",
  });

  const [grades, setGrades] = useState<Record<number, Record<string, string>>>({});
  const [currentSemesterId, setCurrentSemesterId] = useState(1);
  const [pdfTheme, setPdfTheme] = useState<"light" | "dark">("light");
  const [validationError, setValidationError] = useState<string | null>(null);

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

  const currentSemester = semestersData.find((s) => s.id === currentSemesterId)!;
  const currentScale = currentSemesterId <= 2 ? gradingScale1to2 : gradingScale3to6;
  const gradeOptions = Object.keys(currentScale);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-body)] font-sans">
      <header className="h-16 border-b border-[var(--color-hairline)] flex items-center px-6 md:px-12 sticky top-0 z-10 bg-[var(--color-canvas)]/80 backdrop-blur-md">
        <div className="font-medium text-xl text-[var(--color-ink)] title-display italic">
          Cal.CGPA
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-[var(--color-ink)] mb-4 title-display">
            Calculate your Academic Performance
          </h1>
          <p className="text-[var(--color-muted)] text-lg max-w-xl mx-auto font-light">
            A beautiful, simple tool to track your semester grades, compute your SGPA and CGPA, and generate a personalized grade sheet.
          </p>
        </div>

        <div className="space-y-12">
          {/* Personal Details */}
          <section>
            <Card className="bg-[var(--color-surface-card)]">
              <CardHeader>
                <CardTitle className="text-xl">Personal Details</CardTitle>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select
                      id="branch"
                      name="branch"
                      value={studentDetails.branch}
                      onChange={handleDetailChange}
                    >
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Calculated Year</Label>
                    <div className="flex h-10 w-full items-center rounded-md border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] px-3.5 text-sm text-[var(--color-muted)]">
                      {year}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Progressive Semester Selection */}
          <section>
            <Card className="bg-[var(--color-surface-card)]">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-hairline)] pb-6">
                <div>
                  <CardTitle className="text-xl mb-1">Semester Grades</CardTitle>
                  <p className="text-sm text-[var(--color-muted)]">Select a semester and fill out your grades.</p>
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
                <div className="divide-y divide-[var(--color-hairline)]">
                  {currentSemester.subjects.map((sub) => (
                    <div key={sub.code} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-[var(--color-surface-soft)] transition-colors">
                      <div className="mb-3 sm:mb-0 sm:pr-4 flex-1">
                        <div className="font-medium text-[var(--color-ink)]">{sub.name}</div>
                        <div className="text-sm text-[var(--color-muted)] mt-1 font-mono">
                          {sub.code} • {sub.credit} Credits
                        </div>
                      </div>
                      <div className="w-full sm:w-40 shrink-0">
                        <Select
                          value={grades[currentSemesterId]?.[sub.code] || ""}
                          onChange={(e) => handleGradeChange(currentSemesterId, sub.code, e.target.value)}
                        >
                          <option value="">Select Grade</option>
                          {gradeOptions.map((g) => (
                            <option key={g} value={g}>
                              {g} ({currentScale[g]} pts)
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="bg-[var(--color-surface-soft)] border-t border-[var(--color-hairline)] p-4 sm:p-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentSemesterId((prev) => Math.max(1, prev - 1))}
                  disabled={currentSemesterId === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <div className="text-sm font-medium text-[var(--color-ink)] flex items-center px-4">
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
            <div className="bg-[var(--color-primary-disabled)] border border-[var(--color-primary)] text-[var(--color-ink)] px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-[var(--color-primary)]" />
              <div className="text-sm font-medium leading-relaxed">{validationError}</div>
            </div>
          )}

          {/* Results & Download */}
          <section>
            <Card className="bg-transparent border-none shadow-none text-center pt-8 pb-4">
              <h2 className="text-xl md:text-2xl font-medium title-display text-[var(--color-muted)] mb-2">Overall CGPA</h2>
              <div className="text-6xl md:text-8xl font-bold title-display tracking-tight text-[var(--color-ink)] mb-8">
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
                <Button size="lg" className="w-full font-bold tracking-wide shadow-md" onClick={() => {
                  if (checkValidation()) handleDownload();
                }}>
                  <Download className="mr-2 h-5 w-5" />
                  Download Grade Sheet
                </Button>
              </div>
            </Card>
          </section>
        </div>
      </main>

      <footer className="border-t border-[var(--color-hairline)] py-12 mt-24">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[var(--color-muted)]">
          <div>Author: Anshuman Pattnaik</div>
          <div className="flex gap-6">
            <a href="https://github.com/ANSHPG" target="_blank" rel="noreferrer" className="hover:text-[var(--color-ink)] transition-colors">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/anshuman-pattnaik-9694a3255/" target="_blank" rel="noreferrer" className="hover:text-[var(--color-ink)] transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
