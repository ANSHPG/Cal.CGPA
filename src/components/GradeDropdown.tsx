import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { gradeDisplayLabels, gradingScale3to6, getSemestersData } from "@/lib/data";

interface GradeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  semesterId: number;
  cycle?: number;
}

const getOptionStyle = (g: string) => {
  if (g === "O") return { backgroundColor: "#1e3a1e", color: "#6ee7b7" };
  if (g === "E") return { backgroundColor: "#143a2e", color: "#34d399" };
  if (g === "A") return { backgroundColor: "#063d3b", color: "#2dd4bf" };
  if (g === "B") return { backgroundColor: "#1e3b4a", color: "#38bdf8" };
  if (g === "C") return { backgroundColor: "#2e2e48", color: "#818cf8" };
  if (g === "D") return { backgroundColor: "#3a2a45", color: "#c084fc" };
  if (g === "F") return { backgroundColor: "#451e1e", color: "#f87171" };
  if (g === "SA" || g === "M") return { backgroundColor: "#2a2a2a", color: "#a1a1aa" };
  if (g === "O_BACK") return { backgroundColor: "#45241e", color: "#fca5a5" };
  if (g === "A_BACK") return { backgroundColor: "#3f2b1d", color: "#fed7aa" };
  if (g === "B_BACK") return { backgroundColor: "#372e1c", color: "#fef08a" };
  if (g === "C_BACK") return { backgroundColor: "#2e311b", color: "#d9f99d" };
  if (g === "D_BACK") return { backgroundColor: "#22351f", color: "#bbf7d0" };
  if (g === "P_BACK") return { backgroundColor: "#1d352d", color: "#99f6e4" };
  if (g === "F_BACK") return { backgroundColor: "#3f1c1c", color: "#fca5a5" };
  if (g === "SA_BACK" || g === "M_BACK") return { backgroundColor: "#242424", color: "#d4d4d8" };
  if (g === "P") return { backgroundColor: "#3f3f2a", color: "#eab308" };
  return {};
};

const oldScheme = ["O", "E", "A", "B", "C", "D", "F", "SA", "M"];
const oldSchemeBack = ["O_BACK", "A_BACK", "B_BACK", "C_BACK", "D_BACK", "P_BACK", "F_BACK", "SA_BACK", "M_BACK"];
const newScheme = ["O", "A", "B", "C", "D", "P", "F", "SA", "M"];

export function GradeDropdown({ value, onChange, semesterId, cycle = 1 }: GradeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (g: string) => {
    onChange(g);
    setIsOpen(false);
  };

  const semestersData = React.useMemo(() => getSemestersData(cycle), [cycle]);
  const currentSem = semestersData.find((s) => s.id === semesterId);
  const isOldSchemeSem = currentSem?.isOldScheme || semesterId <= 2;

  const renderOption = (g: string, isBack = false) => {
    let label = g;
    if (!isOldSchemeSem) {
      label = `${g} (${gradingScale3to6[g]} pts)`;
    } else {
      label = gradeDisplayLabels[g] || g;
    }
    const isSelected = value === g;
    return (
      <div
        key={g}
        onClick={() => handleSelect(g)}
        className={`px-3 py-2 cursor-pointer flex items-center justify-between text-sm transition-colors hover:opacity-80`}
        style={getOptionStyle(g)}
      >
        <span className="font-medium">{label}</span>
        {isSelected && <Check className="w-4 h-4 opacity-70" />}
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className="flex h-12 sm:h-10 w-full appearance-none rounded-md border border-hairline bg-canvas px-3.5 py-2 pr-8 text-base sm:text-sm text-ink placeholder:text-muted-soft focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink transition-colors cursor-pointer items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {value 
            ? (!isOldSchemeSem && gradingScale3to6[value] !== undefined
                ? `${value} (${gradingScale3to6[value]} pts)`
                : (gradeDisplayLabels[value] || value)) 
            : "Select Grade"}
        </span>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted">
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface-card border border-hairline rounded-md shadow-lg max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isOldSchemeSem ? (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-muted bg-surface-soft uppercase tracking-wider">
                Old Scheme (Original)
              </div>
              {oldScheme.map((g) => renderOption(g))}
              
              <div className="px-3 py-1.5 text-xs font-semibold text-muted bg-surface-soft uppercase tracking-wider">
                New Scheme / Back Paper Cleared
              </div>
              {oldSchemeBack.map((g) => renderOption(g, true))}
            </>
          ) : (
            <div className="py-1">
              {newScheme.map((g) => renderOption(g))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
