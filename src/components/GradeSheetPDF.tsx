import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { getSemestersData, gradingScale1to2, gradingScale3to6 } from "@/lib/data";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4QxlF.ttf" },
  ],
});

interface GradeSheetPDFProps {
  studentDetails: { name: string; rollNo: string; branch: string; year: string; cycle?: number };
  grades: Record<number, Record<string, string>>;
  sgpaData: Record<number, number>;
  cgpa: number;
  theme: "light" | "dark";
}

export const GradeSheetPDF: React.FC<GradeSheetPDFProps> = ({
  studentDetails,
  grades,
  sgpaData,
  cgpa,
  theme,
}) => {
  const isDark = theme === "dark";

  // Light theme colors
  const lightColors = {
    bg: "#ffffff",
    text: "#000000",
    headerText: "#1c4878",
    border: "#000000",
    borderLight: "#cccccc",
    altRow: "#eef8ef",
  };

  // Dark theme colors (Claude inspired)
  const darkColors = {
    bg: "#201e1b",
    text: "#e6e2d3",
    headerText: "#d97757",
    border: "#8c877a",
    borderLight: "#3c3933",
    altRow: "#272521",
  };

  const c = isDark ? darkColors : lightColors;

  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: "Helvetica",
      fontSize: 10,
      backgroundColor: c.bg,
      color: c.text,
    },
    headerContainer: {
      alignItems: "center",
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingBottom: 10,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: c.headerText,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: c.headerText,
      marginTop: 15,
      marginBottom: 10,
    },
    personalDetailsRow: {
      flexDirection: "row",
      marginBottom: 5,
    },
    personalDetailsLabel: {
      width: "15%",
      fontWeight: "bold",
    },
    personalDetailsValue: {
      width: "35%",
    },
    table: {
      width: "100%",
      marginBottom: 10,
    },
    tableHeaderRow: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      minHeight: 24,
      backgroundColor: isDark ? "#2d2b26" : "#ffffff",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderColor: c.borderLight,
      alignItems: "center",
      minHeight: 24,
    },
    tableRowAlt: {
      backgroundColor: c.altRow,
    },
    colSl: { width: "10%", textAlign: "center" },
    colSubj: { width: "50%", paddingLeft: 5 },
    colCode: { width: "15%", textAlign: "center" },
    colCred: { width: "12%", textAlign: "center" },
    colGrad: { width: "13%", textAlign: "center" },
    summaryContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 5,
      marginBottom: 15,
    },
    summaryText: {
      fontWeight: "bold",
      marginLeft: 20,
    },
    overallContainer: {
      alignItems: "center",
      marginTop: 20,
      marginBottom: 20,
    },
    overallBox: {
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: c.border,
      paddingVertical: 5,
      paddingHorizontal: 20,
      flexDirection: "row",
      gap: 20,
    },
    conversionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
    conversionBox: {
      width: "45%",
      alignItems: "center",
    },
    conversionTitle: {
      fontWeight: "bold",
      marginBottom: 5,
    },
    convTable: {
      width: "100%",
    },
    convRow: {
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderColor: c.borderLight,
      paddingVertical: 3,
    },
    convHeader: {
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: c.border,
    },
    convCol: {
      width: "50%",
      textAlign: "center",
    },
  });

  const semestersData = getSemestersData(studentDetails.cycle || 1);

  const filledSemesters = semestersData
    .filter((sem) => {
      const semGrades = grades[sem.id];
      return semGrades && Object.values(semGrades).some((g) => g !== "");
    })
    .sort((a, b) => (a.baseSem || a.id) - (b.baseSem || b.id));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Academic Grade Sheet</Text>
        </View>

        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.personalDetailsRow}>
          <Text style={styles.personalDetailsLabel}>Name</Text>
          <Text style={styles.personalDetailsValue}>{studentDetails.name || "N/A"}</Text>
          <Text style={styles.personalDetailsLabel}>Roll No.</Text>
          <Text style={styles.personalDetailsValue}>{studentDetails.rollNo || "N/A"}</Text>
        </View>
        <View style={styles.personalDetailsRow}>
          <Text style={styles.personalDetailsLabel}>Year</Text>
          <Text style={styles.personalDetailsValue}>{studentDetails.year}</Text>
          <Text style={styles.personalDetailsLabel}>Branch</Text>
          <Text style={styles.personalDetailsValue}>{studentDetails.branch}</Text>
        </View>

        {filledSemesters.map((sem) => {
          const sgpa = sgpaData[sem.id] || 0;
          const totalCredits = sem.subjects.reduce((acc, curr) => acc + curr.credit, 0);

          return (
            <View key={sem.id} wrap={false}>
              <Text style={styles.sectionTitle}>{sem.label}</Text>
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.colSl, { fontWeight: "bold" }]}>Sl. No.</Text>
                  <Text style={[styles.colSubj, { fontWeight: "bold" }]}>Subject</Text>
                  <Text style={[styles.colCode, { fontWeight: "bold" }]}>Code</Text>
                  <Text style={[styles.colCred, { fontWeight: "bold" }]}>Credit</Text>
                  <Text style={[styles.colGrad, { fontWeight: "bold" }]}>Grade</Text>
                </View>
                {sem.subjects.map((sub, idx) => {
                  const gradeKey = grades[sem.id]?.[sub.code] || "-";
                  const isBack = gradeKey.endsWith("_BACK");
                  const displayGrade = isBack ? gradeKey.replace("_BACK", "") : gradeKey;
                  const isAlt = idx % 2 !== 0;

                  const subjectNameStyle = isBack
                    ? [styles.colSubj, { color: "#d97757", fontWeight: "bold" }]
                    : styles.colSubj;

                  const gradeTextStyle = isBack
                    ? [styles.colGrad, { color: "#d97757", fontWeight: "bold" }]
                    : styles.colGrad;

                  return (
                    <View key={sub.code} style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}>
                      <Text style={styles.colSl}>{idx + 1}</Text>
                      <Text style={subjectNameStyle}>
                        {sub.name}{isBack ? " (back cleared)" : ""}
                      </Text>
                      <Text style={styles.colCode}>{sub.code}</Text>
                      <Text style={styles.colCred}>{sub.credit.toFixed(1)}</Text>
                      <Text style={gradeTextStyle}>{displayGrade}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>Total Credits: {totalCredits}</Text>
                <Text style={styles.summaryText}>SGPA: {sgpa.toFixed(2)}</Text>
              </View>
            </View>
          );
        })}

        {filledSemesters.length > 0 && (
          <View style={styles.overallContainer} wrap={false}>
            <Text style={styles.sectionTitle}>Overall Performance</Text>
            <View style={styles.overallBox}>
              <Text style={{ fontWeight: "bold" }}>CGPA</Text>
              <Text style={{ fontWeight: "bold" }}>{cgpa.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <View style={styles.conversionContainer} wrap={false}>
          <View style={styles.conversionBox}>
            <Text style={styles.conversionTitle}>Old Scheme / Sem I-II</Text>
            <View style={styles.convTable}>
              <View style={[styles.convRow, styles.convHeader]}>
                <Text style={styles.convCol}>Grade</Text>
                <Text style={styles.convCol}>Point</Text>
              </View>
              {Object.entries(gradingScale1to2).map(([g, p]) => (
                <View key={g} style={styles.convRow}>
                  <Text style={styles.convCol}>{g}</Text>
                  <Text style={styles.convCol}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.conversionBox}>
            <Text style={styles.conversionTitle}>New Scheme / Sem III onwards</Text>
            <View style={styles.convTable}>
              <View style={[styles.convRow, styles.convHeader]}>
                <Text style={styles.convCol}>Grade</Text>
                <Text style={styles.convCol}>Point</Text>
              </View>
              {Object.entries(gradingScale3to6).map(([g, p]) => (
                <View key={g} style={styles.convRow}>
                  <Text style={styles.convCol}>{g}</Text>
                  <Text style={styles.convCol}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
