import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import { semestersData } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentDetails, grades, sgpaData, cgpa } = body;

    // Load template
    const templatePath = path.join(process.cwd(), "public", "Student_Academic_Record_Template.xlsx");
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: "Excel template file not found" }, { status: 404 });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    // 1. Populate the "Overall" Sheet
    const overallSheet = workbook.getWorksheet("Student Summary");
    if (overallSheet) {
      // Cell A7: Label
      overallSheet.getCell("A7").value = "CGPA (Till 6 Semester)";
      // Cell B3: Student Name
      overallSheet.getCell("B3").value = studentDetails.name || "N/A";
      // Cell B4: Registration No.
      overallSheet.getCell("B4").value = studentDetails.rollNo || "N/A";
      // Cell B5: Branch
      overallSheet.getCell("B5").value = studentDetails.branch || "Electrical Engineering";
      // Cell B6: Current Year
      overallSheet.getCell("B6").value = studentDetails.year || "1st Year";
      // Cell B7: CGPA
      overallSheet.getCell("B7").value = cgpa ? Number(cgpa.toFixed(2)) : 0.00;
    }

    // Identify filled base semesters
    const filledSems = semestersData.filter((sem) => {
      const semGrades = grades[sem.id] || {};
      return Object.values(semGrades).some((g) => g !== "");
    });
    const filledBaseSems = new Set(filledSems.map((sem) => sem.baseSem || sem.id));

    // Delete unused semester sheets
    [1, 2, 3, 4, 5, 6].forEach((baseId) => {
      if (!filledBaseSems.has(baseId)) {
        const sheet = workbook.getWorksheet(`Semester ${baseId}`);
        if (sheet) {
          workbook.removeWorksheet(sheet.id);
        }
      }
    });

    // 2. Populate Semester Sheets
    filledSems.forEach((sem) => {
      const baseId = sem.baseSem || sem.id;
      const sheetName = `Semester ${baseId}`;
      const sheet = workbook.getWorksheet(sheetName);
      if (!sheet) return;

      const semGrades = grades[sem.id] || {};

      // Find Total Credits and SGPA rows dynamically based on the template
      let totalCreditsRow = 16; // default fallback
      for (let r = 4; r <= 30; r++) {
        const val = sheet.getCell(r, 4).value;
        if (val === "Total Credits") {
          totalCreditsRow = r;
          break;
        }
      }
      const sgpaRow = totalCreditsRow + 1;

      // Clear all existing subject rows in the template before writing
      for (let r = 4; r < totalCreditsRow; r++) {
        sheet.getCell(r, 1).value = ""; // A (Sl. No.)
        sheet.getCell(r, 2).value = ""; // B (Code)
        sheet.getCell(r, 3).value = ""; // C (Name)
        sheet.getCell(r, 4).value = ""; // D (Credits)
        sheet.getCell(r, 5).value = ""; // E (Grade)
      }

      sem.subjects.forEach((sub, idx) => {
        const rowNum = 4 + idx;
        const gradeKey = semGrades[sub.code] || "";

        const isBack = gradeKey.endsWith("_BACK");
        const baseGrade = isBack ? gradeKey.replace("_BACK", "") : gradeKey;

        // Write Subject Details
        sheet.getCell(rowNum, 1).value = idx + 1; // Sl. No. (Column A)
        sheet.getCell(rowNum, 2).value = sub.code; // Subject Code (Column B)
        
        const nameCell = sheet.getCell(rowNum, 3); // Subject Name (Column C)
        nameCell.value = sub.name;
        
        sheet.getCell(rowNum, 4).value = sub.credit; // Credits (Column D)
        
        const gradeCell = sheet.getCell(rowNum, 5); // Grade (Column E)
        gradeCell.value = baseGrade || "";

        if (isBack && baseGrade) {
          if (!sub.name.includes("(back cleared)")) {
            nameCell.value = `${sub.name} (back cleared)`;
          }
          nameCell.font = { color: { argb: "FFD87D5D" }, bold: true };
          gradeCell.font = { color: { argb: "FFD87D5D" }, bold: true };
        }
      });

      const sgpa = sgpaData[sem.id] || 0;
      const totalCredits = sem.subjects.reduce((acc, curr) => acc + curr.credit, 0);

      // Write Total Credits & SGPA in Column E (5)
      sheet.getCell(totalCreditsRow, 5).value = totalCredits;
      sheet.getCell(sgpaRow, 5).value = Number(sgpa.toFixed(2));
    });

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=Student_Academic_Record.xlsx`,
      },
    });
  } catch (error: any) {
    console.error("Excel generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate Excel sheet" }, { status: 500 });
  }
}
