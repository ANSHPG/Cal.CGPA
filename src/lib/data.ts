export type Subject = {
  name: string;
  code: string;
  credit: number;
};

export type Semester = {
  id: number;
  label: string;
  subjects: Subject[];
};

export const semestersData: Semester[] = [
  {
    id: 1,
    label: "Semester I",
    subjects: [
      { name: "UNIVERSAL HUMAN VALUES", code: "BH1421", credit: 2.0 },
      { name: "MATHEMATICS-I", code: "BH1441", credit: 3.0 },
      { name: "PHYSICS", code: "BH1461", credit: 3.0 },
      { name: "PHYSICS LABORATORY", code: "BH1561", credit: 1.5 },
      { name: "Yoga", code: "BH1583", credit: 1.0 },
      { name: "PROGRAMMING IN C AND DATA STRUCTURES", code: "CS1401", credit: 3.0 },
      { name: "PROGRAMMING LABORATORY", code: "CS1501", credit: 1.5 },
      { name: "BASIC ELECTRICAL ENGINEERING", code: "EE1401", credit: 2.0 },
      { name: "BASIC ELECTRICAL ENGINEERING LABORATORY", code: "EE1501", credit: 1.5 },
      { name: "BASIC CIVIL ENGINEERING", code: "IP1401", credit: 2.0 },
      { name: "ENGINEERING GRAPHICS & DESIGN LABORATORY", code: "IP1501", credit: 1.5 }
    ]
  },
  {
    id: 2,
    label: "Semester II",
    subjects: [
      { name: "CHEMISTRY", code: "BH1401", credit: 3.0 },
      { name: "ENGLISH FOR TECHNICAL WRITING", code: "BH1423", credit: 2.0 },
      { name: "MATHEMATICS-II", code: "BH1442", credit: 3.0 },
      { name: "Chemistry Laboratory", code: "BH1501", credit: 1.5 },
      { name: "Communicative English & Report Writing Laboratory", code: "BH1521", credit: 1.5 },
      { name: "NSS", code: "BH1587", credit: 1.0 },
      { name: "BASIC ELECTRONICS", code: "EI1401", credit: 2.0 },
      { name: "Basic Electronics Laboratory", code: "EI1501", credit: 1.5 },
      { name: "BASIC MECHANICAL ENGINEERING", code: "MS1401", credit: 2.0 },
      { name: "ENGINEERING MECHANICS", code: "MS1403", credit: 3.0 },
      { name: "Workshop & Digital Manufacturing Laboratory", code: "MS1501", credit: 1.5 }
    ]
  },
  {
    id: 3,
    label: "Semester III",
    subjects: [
      { name: "ENGINEERING ECONOMICS", code: "BH2439", credit: 2.0 },
      { name: "MATHEMATICS-III", code: "BH2459", credit: 3.0 },
      { name: "ANALOG AND DIGITAL ELECTRONICS", code: "EE2101", credit: 3.0 },
      { name: "ELECTRICAL CIRCUIT ANALYSIS", code: "EE2103", credit: 3.0 },
      { name: "ELECTRICAL MACHINES-I", code: "EE2105", credit: 3.0 },
      { name: "SOFT COMPUTING", code: "EE2107", credit: 2.0 },
      { name: "ANALOG AND DIGITAL ELECTRONICS LABORATORY", code: "EE2501", credit: 1.5 },
      { name: "ELECTRICAL CIRCUIT LABORATORY", code: "EE2503", credit: 1.5 },
      { name: "ELECTRICAL MACHINES-I LABORATORY", code: "EE2505", credit: 1.5 },
      { name: "SOFT COMPUTING LABORATORY", code: "EE2507", credit: 1.5 }
    ]
  },
  {
    id: 4,
    label: "Semester IV",
    subjects: [
      { name: "ORGANIZATIONAL BEHAVIOUR", code: "BH2437", credit: 2.0 },
      { name: "CONTROL SYSTEM-I", code: "EE2102", credit: 3.0 },
      { name: "ELECTRICAL MACHINES-II", code: "EE2104", credit: 3.0 },
      { name: "ELECTRICAL MEASUREMENT AND INSTRUMENTATION", code: "EE2106", credit: 3.0 },
      { name: "SIGNALS AND SYSTEMS", code: "EE2108", credit: 3.0 },
      { name: "INTRODUCTION TO IOT", code: "EE2110", credit: 2.0 },
      { name: "CONTROL SYSTEM-I LABORATORY", code: "EE2502", credit: 1.5 },
      { name: "ELECTRICAL MACHINES-II LABORATORY", code: "EE2504", credit: 1.5 },
      { name: "ELECTRICAL MEASUREMENT AND INSTRUMENTATION LABORATORY", code: "EE2506", credit: 1.5 },
      { name: "SIGNALS AND SYSTEMS LABORATORY", code: "EE2508", credit: 1.5 }
    ]
  },
  {
    id: 5,
    label: "Semester V",
    subjects: [
      { name: "ENTREPRENEURSHIP DEVELOPMENT", code: "BH3403", credit: 2.0 },
      { name: "OOPS", code: "CS3511", credit: 1.5 },
      { name: "ELECTRICAL POWER TRANSMISSION AND DISTRIBUTION", code: "EE3101", credit: 3.0 },
      { name: "POWER ELECTRONICS", code: "EE3103", credit: 3.0 },
      { name: "MICROPROCESSORS AND MICROCONTROLLERS", code: "EE3105", credit: 3.0 },
      { name: "CONTROL SYSTEMS-II", code: "EE3203", credit: 3.0 },
      { name: "POWER ELECTRONICS LAB", code: "EE3501", credit: 1.5 },
      { name: "MICROPROCESSORS AND MICROCONTROLLERS LAB", code: "EE3503", credit: 1.5 },
      { name: "SEMINAR ON SIRE-I", code: "EE3701", credit: 1.5 },
      { name: "INDUSTRIAL SAFETY ENGINEERING", code: "IP3403", credit: 2.0 }
    ]
  },
  {
    id: 6,
    label: "Semester VI",
    subjects: [
      { name: "BUSINESS MANAGEMENT", code: "BH3401", credit: 2.0 },
      { name: "POWER SYSTEM ANALYSIS AND OPERATION", code: "EE3102", credit: 3.0 },
      { name: "DIGITAL SIGNAL PROCESSING", code: "EE3104", credit: 3.0 },
      { name: "ELECTRIC VEHICLE", code: "EE3206", credit: 3.0 },
      { name: "POWER SYSTEM PROTECTION", code: "EE3212", credit: 3.0 },
      { name: "POWER SYSTEM LABORATORY", code: "EE3502", credit: 1.5 },
      { name: "DIGITAL SIGNAL PROCESSING LABORATORY", code: "EE3504", credit: 1.5 },
      { name: "PROJECT FOR PRODUCT DEVELOPMENT-I", code: "EE3602", credit: 3.0 },
      { name: "ENVIRONMENTAL ENGINEERING", code: "IP3401", credit: 2.0 }
    ]
  }
];

export const gradingScale1to2: Record<string, number> = {
  "O": 10,
  "E": 9,
  "A": 8,
  "B": 7,
  "C": 6,
  "D": 5,
  "F": 2,
  "SA": 0,
  "M": 0
};

export const gradingScale3to6: Record<string, number> = {
  "O": 10,
  "A": 9,
  "B": 8,
  "C": 7,
  "D": 6,
  "P": 5,
  "F": 2,
  "SA": 0,
  "M": 0
};
