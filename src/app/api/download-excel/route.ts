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

    // 2. Populate Semester Sheets
    semestersData.forEach((sem) => {
      const sheetName = `Semester ${sem.id}`;
      const sheet = workbook.getWorksheet(sheetName);
      if (!sheet) return;

      const semGrades = grades[sem.id] || {};
      const isSemesterFilled = Object.values(semGrades).some((g) => g !== "");

      const totalCreditsRow = 4 + sem.subjects.length + 1;
      const sgpaRow = totalCreditsRow + 1;

      sem.subjects.forEach((sub, idx) => {
        const rowNum = 4 + idx;
        const gradeKey = semGrades[sub.code] || "";

        if (isSemesterFilled) {
          const isBack = gradeKey.endsWith("_BACK");
          const baseGrade = isBack ? gradeKey.replace("_BACK", "") : gradeKey;

          // Set Grade
          const gradeCell = sheet.getCell(rowNum, 5); // Column E
          gradeCell.value = baseGrade || "";

          if (isBack && baseGrade) {
            // Append (back cleared) to subject name
            const nameCell = sheet.getCell(rowNum, 3); // Column C
            const originalName = nameCell.value ? String(nameCell.value) : sub.name;
            if (!originalName.includes("(back cleared)")) {
              nameCell.value = `${originalName} (back cleared)`;
            }
            // Style cells with color #D87D5D (ARGB: FFD87D5D)
            nameCell.font = {
              color: { argb: "FFD87D5D" },
              bold: true,
            };
            gradeCell.font = {
              color: { argb: "FFD87D5D" },
              bold: true,
            };
          }
        } else {
          // Empty semester: clear pre-filled grades
          sheet.getCell(rowNum, 5).value = "";
        }
      });

      if (isSemesterFilled) {
        const sgpa = sgpaData[sem.id] || 0;
        const totalCredits = sem.subjects.reduce((acc, curr) => acc + curr.credit, 0);

        // Update Total Credits & SGPA in Column E (Column 5)
        sheet.getCell(totalCreditsRow, 5).value = totalCredits;
        sheet.getCell(sgpaRow, 5).value = Number(sgpa.toFixed(2));
      } else {
        // Clear Total Credits & SGPA cells
        sheet.getCell(totalCreditsRow, 5).value = "";
        sheet.getCell(sgpaRow, 5).value = "";
      }
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
