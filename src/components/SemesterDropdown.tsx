import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, GraduationCap } from "lucide-react";
import { getSemestersData } from "@/lib/data";

interface SemesterDropdownProps {
  value: number;
  onChange: (value: number) => void;
  cycle?: number;
}

export function SemesterDropdown({ value, onChange, cycle = 1 }: SemesterDropdownProps) {
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

  const handleSelect = (id: number) => {
    onChange(id);
    setIsOpen(false);
  };

  const semestersData = React.useMemo(() => getSemestersData(cycle), [cycle]);

  const selectedSem = semestersData.find((s) => s.id === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className="flex h-12 w-full appearance-none rounded-lg border border-hairline bg-surface-card px-4 py-2 pr-10 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all cursor-pointer items-center justify-between shadow-sm hover:border-muted/30 hover:bg-surface-soft"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 truncate">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-medium truncate">
            {selectedSem ? selectedSem.label : "Select Semester"}
          </span>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted">
          <ChevronDown className={`h-5 w-5 opacity-70 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-surface-card border border-hairline rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 pb-2 pt-1">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Available Semesters
            </div>
            <div className="flex flex-col gap-1">
              {semestersData.map((sem) => {
                const isSelected = value === sem.id;
                const isOldScheme = sem.isOldScheme;

                return (
                  <div
                    key={sem.id}
                    onClick={() => handleSelect(sem.id)}
                    className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-sm transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-ink hover:bg-surface-soft hover:pl-4"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{sem.label}</span>
                      {isOldScheme && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded border border-amber-500/20">
                          Repeating
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
