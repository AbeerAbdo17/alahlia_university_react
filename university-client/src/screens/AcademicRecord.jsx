import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

const API_BASE = "http://localhost:5000/api";

const ui = {
  page: {
    fontFamily: `"Cairo", "Tajawal", system-ui, -apple-system, "Segoe UI", Arial, sans-serif`,
    fontSize: 16,
    minHeight: "100vh",
    background: "#f8fafc",
  },
  header: {
    background: "#0a3753",
    color: "#fff",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
  },
  title: {
    margin: "0 0 0 16px",
    fontSize: 22,
    fontWeight: 800,
  },
  card: {
    border: "1px solid #e6e8ee",
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    margin: "20px auto",
    maxWidth: 1100,
    boxShadow: "0 4px 16px rgba(10,55,83,0.06)",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0a3753",
    margin: "0 0 20px 0",
  },
  field: {
    position: "relative",
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: 700,
    color: "#334155",
    marginBottom: 8,
    display: "block",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 16,
    fontFamily: `"Cairo", "Tajawal", sans-serif`,
    outline: "none",
    transition: "border-color 0.2s",
  },
  suggestions: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    maxHeight: 320,
    overflowY: "auto",
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
    zIndex: 10,
    marginTop: 4,
  },
  suggestionItem: {
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.15s",
  },
  primaryBtn: {
    padding: "14px 32px",
    background: "#0a3753",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 20,
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    marginTop: 16,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 15,
  },
  th: {
    background: "#f8fafc",
    padding: "12px 16px",
    textAlign: "right",
    fontWeight: 700,
    color: "#0f172a",
    borderBottom: "2px solid #e2e8f0",
  },
  td: {
    padding: "12px 16px",
    textAlign: "right",
    borderBottom: "1px solid #f1f5f9",
    color: "#1e293b",
  },
  gpaBox: {
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: 8,
    padding: "12px 16px",
    margin: "8px 0",
    textAlign: "center",
  },
};

const AcademicRecord = () => {
  const navigate = useNavigate();
  const printRef = useRef();
    const [toast, setToast] = useState(null);
    const showToast = (message, type = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    };

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [latestReg, setLatestReg] = useState(null);
  const [grades, setGrades] = useState([]);          // درجات المواد
  const [termGpas, setTermGpas] = useState([]);     // المعدلات   
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // live search (debounce)
  useEffect(() => {
    if (searchQuery.trim() === "") {
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedStudent(null);
    setLatestReg(null);
    setGrades([]);
    setTermGpas([]);
    return;
  }
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/search-students-live?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSuggestions(data.slice(0, 12));
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setSearchQuery(student.full_name || student.university_id || "");
    setShowSuggestions(false);
    setSuggestions([]);

    setLoading(true);
    try {
      // آخر تسجيل
      const regRes = await fetch(`${API_BASE}/student-registrations?student_id=${student.id}&latest=true`);
      if (regRes.ok) {
        const regData = await regRes.json();
        setLatestReg(regData);
      }

      // جلب الدرجات + المعدلات
      const gradesRes = await fetch(`${API_BASE}/course-grades?student_id=${student.id}`);
      if (gradesRes.ok) {
        const data = await gradesRes.json();
        setGrades(data.grades || []);
        setTermGpas(data.term_gpas || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupTermGpasByLevel = () => {
    const byLevel = {};

    termGpas.forEach(term => {
      const level = term.level_name || "غير محدد";
      if (!byLevel[level]) byLevel[level] = {};

      const termKey = `${term.academic_year}-${term.term_name}`;
      byLevel[level][termKey] = {
        academic_year: term.academic_year,
        term_name: term.term_name,
        term_gpa: term.term_gpa || "—",
        cumulative_gpa: term.cumulative_gpa || "—",
      };
    });

    return byLevel;
  };

  const groupedTermGpas = groupTermGpasByLevel();

const levelOrder = [
  "المستوى الأول",
  "المستوى الثاني",
  "المستوى الثالث",
  "المستوى الرابع",
  "المستوى الخامس",
  "المستوى السادس"  
];

const sortByLevelOrder = (levelsObj) => {
  return Object.entries(levelsObj).sort(([levelA], [levelB]) => {
    const indexA = levelOrder.indexOf(levelA);
    const indexB = levelOrder.indexOf(levelB);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
};

const buildAcademicData = (isAr) => {
  const byLevel = {};

  grades.forEach(grade => {
    let level = grade.level_name || "غير محدد";
    if (!isAr) {
      const levelMap = {
        "المستوى الأول": "First Year", "المستوى الثاني": "Second Year",
        "المستوى الثالث": "Third Year", "المستوى الرابع": "Fourth Year",
        "المستوى الخامس": "Fifth Year", "المستوى السادس": "Sixth Year",
      };
      level = levelMap[level] || level;
    }

    const termKey = `${grade.academic_year}-${grade.term_name}`;

    if (!byLevel[level]) byLevel[level] = {};
    if (!byLevel[level][termKey]) {
      byLevel[level][termKey] = {
        academic_year: grade.academic_year,
        term_name: isAr 
          ? grade.term_name 
          : (grade.term_name?.includes("الأول") || grade.term_name?.includes("اول") ? "First Semester" : "Second Semester"),
        courses: [],
        term_gpa: "—",
        cumulative_gpa: "—"
      };
    }

    const term = byLevel[level][termKey];
    term.courses.push({
      name: isAr ? (grade.course_name || "—") : (grade.course_name_en || grade.course_name || "—"),
      letter: grade.letter || "—",
      hours: Number(grade.credit_hours) || "—"
    });
  });

  // دمج المعدلات
  termGpas.forEach(term => {
    let levelLookup = term.level_name || "غير محدد";
    if (!isAr) {
      const levelMap = {
        "المستوى الأول": "First Year", "المستوى الثاني": "Second Year",
        "المستوى الثالث": "Third Year", "المستوى الرابع": "Fourth Year",
        "المستوى الخامس": "Fifth Year", "المستوى السادس": "Sixth Year",
      };
      levelLookup = levelMap[levelLookup] || levelLookup;
    }

    const termKey = `${term.academic_year}-${term.term_name}`;

    if (byLevel[levelLookup] && byLevel[levelLookup][termKey]) {
      byLevel[levelLookup][termKey].term_gpa = term.term_gpa || "—";
      byLevel[levelLookup][termKey].cumulative_gpa = term.cumulative_gpa || "—";
    }
  });

  return byLevel;
};

const handlePrint = (lang = 'ar') => {
  if (!selectedStudent || grades.length === 0) {
    alert(lang === 'ar' ? "لا توجد بيانات كافية للطباعة" : "No data available to print");
    return;
  }

  const isAr = lang === 'ar';

  const facultyName = isAr 
    ? (grades[0]?.faculty_name || "غير محدد") 
    : (grades[0]?.faculty_name_en || grades[0]?.faculty_name || "Not Specified");

  const departmentName = isAr 
    ? (grades[0]?.department_name || "غير محدد") 
    : (grades[0]?.department_name_en || grades[0]?.department_name || "Not Specified");

  const studentName = isAr 
    ? selectedStudent.full_name 
    : (selectedStudent.full_name_en || selectedStudent.full_name || "Student");

  const byLevel = {};

  grades.forEach(grade => {
    let level = grade.level_name || "غير محدد";
    if (!isAr) {
      const levelMap = {
        "المستوى الأول": "First Year",
        "المستوى الثاني": "Second Year",
        "المستوى الثالث": "Third Year",
        "المستوى الرابع": "Fourth Year",
        "المستوى الخامس": "Fifth Year",
        "المستوى السادس": "Sixth Year",
      };
      level = levelMap[level] || level;
    }

    const termKey = `${grade.academic_year}-${grade.term_name}`;

    if (!byLevel[level]) byLevel[level] = {};
    if (!byLevel[level][termKey]) {
      byLevel[level][termKey] = {
        academic_year: grade.academic_year,
        term_name: isAr 
          ? grade.term_name 
          : (grade.term_name?.includes("الأول") || grade.term_name?.includes("اول") ? "First Semester" : "Second Semester"),
        courses: [],
        term_gpa: "—",
        cumulative_gpa: "—"
      };
    }

    const term = byLevel[level][termKey];
    term.courses.push({
      name: isAr ? (grade.course_name || "—") : (grade.course_name_en || grade.course_name || "—"),
      letter: grade.letter || "—",
      hours: Number(grade.credit_hours) || "—"
    });
  });

  // دمج المعدلات
termGpas.forEach(term => {                    
    let levelLookup = term.level_name || "غير محدد";

    if (!isAr) {
      const levelMap = {
        "المستوى الأول": "First Year",
        "المستوى الثاني": "Second Year",
        "المستوى الثالث": "Third Year",
        "المستوى الرابع": "Fourth Year",
        "المستوى الخامس": "Fifth Year",
        "المستوى السادس": "Sixth Year",
      };
      levelLookup = levelMap[levelLookup] || levelLookup;
    }

    const termKey = `${term.academic_year}-${term.term_name}`;

    if (byLevel[levelLookup] && byLevel[levelLookup][termKey]) {
      byLevel[levelLookup][termKey].term_gpa = term.term_gpa || "—";
      byLevel[levelLookup][termKey].cumulative_gpa = term.cumulative_gpa || "—";
    }
  });

  // ====================== ترتيب المستويات ======================
  const levelOrderAr = ["المستوى الأول","المستوى الثاني","المستوى الثالث","المستوى الرابع","المستوى الخامس","المستوى السادس"];
  const levelOrderEn = ["First Year","Second Year","Third Year","Fourth Year","Fifth Year","Sixth Year"];
  const levelOrder = isAr ? levelOrderAr : levelOrderEn;

  const sortedLevels = Object.entries(byLevel).sort((a, b) => {
    const indexA = levelOrder.indexOf(a[0]);
    const indexB = levelOrder.indexOf(b[0]);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  let content = `
    <div style="direction: ${isAr ? 'rtl' : 'ltr'}; 
                font-family: 'Cairo', 'Arial', sans-serif; 
                padding: 20px 25px; 
                color: #1e293b; 
                line-height: 1.75; 
                font-size: 14.5px;">

      <!-- Header -->
      <div style="page-break-inside: avoid; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #0a3753;">
        <div style="text-align: center;">
          <h1 style="margin:0; color:#0a3753; font-size:26px; font-weight:900;">
            ${isAr ? 'جامعة بورتسودان الأهلية' : 'Port Sudan Ahlia University'}
          </h1>
          <h3 style="margin:10px 0 5px; color:#0f766e;">${facultyName}</h3>
          <h4 style="margin:4px 0;">${isAr ? 'القسم' : 'Department'}: ${departmentName}</h4>
        </div>
        
        <div style="text-align: center; margin-top: 25px;">
          <h2 style="margin:0; color:#0f172a; font-size:21px;">
            ${isAr ? 'السجل الأكاديمي' : 'Academic Transcript'}
          </h2>
          <p style="font-size:17.5px; margin:10px 0 4px;">
            <strong>${isAr ? 'اسم الطالب' : 'Student Name'}:</strong> ${studentName}
          </p>
          <p><strong>${isAr ? 'الرقم الجامعي' : 'Student ID'}:</strong> ${selectedStudent.university_id || "—"}</p>
        </div>
      </div>
  `;

  // عرض المستويات + ترتيب الفصول داخل كل مستوى
  sortedLevels.forEach(([level, termsObj]) => {
    content += `
      <h3 style="background: white; color:#0a3753; padding:12px 18px; border-radius:6px; margin:35px 0 18px 0;">
        ${level}
      </h3>
    `;

    // ترتيب الفصول (الأول قبل الثاني)
    const orderedTerms = Object.values(termsObj).sort((a, b) => {
      const aIsFirst = a.term_name.includes("الأول") || a.term_name.includes("اول") || 
                      a.term_name.includes("First");
      const bIsFirst = b.term_name.includes("الأول") || b.term_name.includes("اول") || 
                      b.term_name.includes("First");
      if (aIsFirst && !bIsFirst) return -1;
      if (!aIsFirst && bIsFirst) return 1;
      return 0;
    });

    orderedTerms.forEach(term => {
      content += `
        <div style="margin-bottom: 32px; page-break-inside: avoid; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
          <div style="background: #f8fafc; padding: 12px; text-align: center; font-weight: bold;">
            ${term.academic_year} — ${term.term_name}
          </div>
          
          <table style="width:100%; border-collapse:collapse; font-size:14px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:11px; text-align:${isAr?'right':'left'}; border-bottom:2px solid #cbd5e1;">${isAr ? 'المادة' : 'Course'}</th>
                <th style="padding:11px; text-align:center; border-bottom:2px solid #cbd5e1; width:85px;">${isAr ? 'التقدير' : 'Grade'}</th>
                <th style="padding:11px; text-align:center; border-bottom:2px solid #cbd5e1; width:75px;">${isAr ? 'الساعات' : 'Hours'}</th>
              </tr>
            </thead>
            <tbody>
              ${term.courses.map(c => `
                <tr style="page-break-inside: avoid;">
                  <td style="padding:10px; border-bottom:1px solid #e5e7eb; text-align:${isAr?'right':'left'};">${c.name}</td>
                  <td style="padding:10px; border-bottom:1px solid #e5e7eb; text-align:center; font-weight:bold;">${c.letter}</td>
                  <td style="padding:10px; border-bottom:1px solid #e5e7eb; text-align:center;">${c.hours}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="padding:13px; background:#f0f9ff; display:flex; justify-content:space-between; font-weight:bold; font-size:15px; border-top:1px solid #bae6fd;">
            <span>${isAr ? 'المعدل الفصلي' : 'Term GPA'}: <strong>${term.term_gpa}</strong></span>
            <span>${isAr ? 'المعدل التراكمي' : 'Cumulative GPA'}: <strong>${term.cumulative_gpa}</strong></span>
          </div>
        </div>
      `;
    });
  });

  content += `</div>`;

  const element = document.createElement("div");
  element.innerHTML = content;

  html2pdf()
    .set({
      margin: [10, 12, 15, 12],
      filename: `Academic_Transcript_${selectedStudent.university_id || 'Student'}_${lang.toUpperCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css'] }
    })
    .from(element)
    .save();
};

const exportToExcel = (lang = 'ar') => {
  if (!selectedStudent || grades.length === 0) {
    return showToast(lang === 'ar' ? "لا توجد بيانات كافية للتصدير" : "No data available to export", "error");
  }

  const isAr = lang === 'ar';

  const facultyName = isAr 
    ? (grades[0]?.faculty_name || "غير محدد") 
    : (grades[0]?.faculty_name_en || grades[0]?.faculty_name || "Not Specified");

  const departmentName = isAr 
    ? (grades[0]?.department_name || "غير محدد") 
    : (grades[0]?.department_name_en || grades[0]?.department_name || "Not Specified");

  const byLevel = buildAcademicData(isAr);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([]);

  const header = [
    ["", isAr ? "جامعة بورتسودان الأهلية" : "Port Sudan Ahlia University"],
    ["", `${facultyName} - ${departmentName}`],
    ["", isAr ? `السجل الأكاديمي - ${selectedStudent.full_name}` : `Academic Transcript - ${selectedStudent.full_name_en || selectedStudent.full_name || "Student"}`],
    ["", isAr ? `الرقم الجامعي: ${selectedStudent.university_id || "—"}` : `Student ID: ${selectedStudent.university_id || "—"}`],
    []
  ];

  XLSX.utils.sheet_add_aoa(ws, header, { origin: "A1" });

  let row = 7;

  const levelOrderAr = ["المستوى الأول","المستوى الثاني","المستوى الثالث","المستوى الرابع","المستوى الخامس","المستوى السادس"];
  const levelOrderEn = ["First Year","Second Year","Third Year","Fourth Year","Fifth Year","Sixth Year"];
  const levelOrder = isAr ? levelOrderAr : levelOrderEn;

  const sortedLevels = Object.entries(byLevel).sort((a, b) => {
    const indexA = levelOrder.indexOf(a[0]);
    const indexB = levelOrder.indexOf(b[0]);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  sortedLevels.forEach(([level, termsObj]) => {
    XLSX.utils.sheet_add_aoa(ws, [[`${isAr ? 'المستوى' : 'Level'}: ${level}`]], { origin: `A${row}` });
    row++;

    const orderedTerms = Object.values(termsObj).sort((a, b) => {
      const aIsFirst = a.term_name?.includes("الأول") || a.term_name?.includes("اول") || a.term_name?.includes("First");
      const bIsFirst = b.term_name?.includes("الأول") || b.term_name?.includes("اول") || b.term_name?.includes("First");
      return aIsFirst && !bIsFirst ? -1 : !aIsFirst && bIsFirst ? 1 : 0;
    });

    orderedTerms.forEach(term => {
      const courses = Array.isArray(term.courses) ? term.courses : [];

      // عنوان الفصل + المعدلات
      XLSX.utils.sheet_add_aoa(ws, [[
        `${term.academic_year} - ${term.term_name}     ${isAr ? 'معدل الفصل' : 'Term GPA'}: ${term.term_gpa}     ${isAr ? 'التراكمي' : 'Cumulative GPA'}: ${term.cumulative_gpa}`
      ]], { origin: `A${row}` });
      row++;

      // رأس الجدول
      XLSX.utils.sheet_add_aoa(ws, [[
        isAr ? "اسم المادة" : "Course Name",
        isAr ? "التقدير" : "Grade",
        isAr ? "الساعات المعتمدة" : "Credit Hours"
      ]], { origin: `A${row}` });
      row++;

      // المواد
      if (courses.length > 0) {
        courses.forEach(course => {
          XLSX.utils.sheet_add_aoa(ws, [[
            course.name || "—",
            course.letter || "—",
            course.hours || "—"
          ]], { origin: `A${row}` });
          row++;
        });
      } else {
        XLSX.utils.sheet_add_aoa(ws, [[isAr ? "لا توجد مواد" : "No courses"]], { origin: `A${row}` });
        row++;
      }

      row += 2;
    });

    row += 1;
  });

  ws['!cols'] = [{ wch: 52 }, { wch: 15 }, { wch: 20 }];
  
  if (!ws['!merges']) ws['!merges'] = [];
  for (let i = 0; i <= 4; i++) {
    ws['!merges'].push({ s: { r: i, c: 1 }, e: { r: i, c: 3 } });
  }

  XLSX.utils.book_append_sheet(wb, ws, isAr ? "السجل الأكاديمي" : "Academic Transcript");

  const fileName = `سجل_اكاديمي_${selectedStudent.university_id || "Student"}_${isAr ? 'AR' : 'EN'}.xlsx`;
  XLSX.writeFile(wb, fileName);

  showToast(isAr ? "تم تصدير الملف بنجاح " : "File exported successfully ", "success");
};

  return (
    <div style={ui.page}>
      <header className="library-header">
        <div className="library-header-title">
          <span style={{ fontSize: 22, fontWeight: 800 }}>السجل الأكاديمي</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            fontSize: "32px",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="رجوع"
        >
          <IoArrowBack />
        </button>
      </header>

      <main style={{ padding: "24px 16px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={ui.card}>
          <h2 style={ui.sectionTitle}>البحث عن الطالب</h2>

          <div style={ui.field}>
            <input
              type="text"
              style={ui.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اكتب الاسم أو الرقم الجامعي..."
              autoComplete="off"
            />

            {showSuggestions && suggestions.length > 0 && (
              <div style={ui.suggestions}>
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    style={ui.suggestionItem}
                    onClick={() => handleSelectStudent(s)}
                  >
                    <strong>{s.full_name}</strong>
                    <span style={{ color: "#64748b", marginRight: 12, fontSize: 14 }}>
                      — {s.university_id || "بدون رقم جامعي"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {showSuggestions && suggestions.length === 0 && searchQuery.trim().length >= 2 && !loading && (
              <div style={{ ...ui.suggestions, padding: "16px", color: "#64748b", textAlign: "center" }}>
                لا يوجد نتائج مطابقة
              </div>
            )}
          </div>
        </div>

        {selectedStudent && (
          <div ref={printRef} style={ui.card}>
            <h2 style={ui.sectionTitle}>
              السجل الأكاديمي — {selectedStudent.full_name}
            </h2>

            <div style={{ marginBottom: 24 }}>
              <strong>الرقم الجامعي:</strong> {selectedStudent.university_id || "—"}
            </div>

            {latestReg && (
              <div style={{ margin: "24px 0", padding: 16, background: "#f8fafc", borderRadius: 10 }}>
                <h3 style={{ margin: "0 0 12px 0", color: "#0a3753" }}>آخر تسجيل</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <div><strong>السنة:</strong> {latestReg.academic_year}</div>
                  <div><strong>المستوى/الدفعة:</strong> {latestReg.level_name}</div>
                  <div><strong>الفصل:</strong> {latestReg.term_name}</div>
                  <div><strong>الموقف الأكاديمي:</strong> {latestReg.academic_status || "—"}</div>
                </div>
              </div>
            )}

            {grades.length > 0 ? (
              <>
                <h3 style={{ margin: "32px 0 16px 0", color: "#0a3753" }}>
                  نتائج الطالب
                </h3>

                <div style={ui.tableWrap}>
                  <table style={ui.table}>
<thead>
  <tr>
    <th>المستوى/الدفعة</th>
    <th>الفصل الأول</th>
    <th>الفصل الثاني</th>
    {Object.values(groupedTermGpas).some(termsObj =>
      Object.values(termsObj).find(t => t.term_name.includes("الثالث") || t.term_name.includes("ثالث"))
    ) && <th>الفصل الثالث</th>}
  </tr>
</thead>
                    <tbody>
{sortByLevelOrder(groupedTermGpas).map(([level, termsObj]) => {
  const terms = Object.values(termsObj);
  const firstTerm  = terms.find(t => t.term_name.includes("الأول") || t.term_name.includes("اول"));
  const secondTerm = terms.find(t => t.term_name.includes("الثاني") || t.term_name.includes("ثاني"));
  const thirdTerm  = terms.find(t => t.term_name.includes("الثالث") || t.term_name.includes("ثالث"));

  const hasThirdTerm = Object.values(groupedTermGpas).some(obj =>
    Object.values(obj).find(t => t.term_name.includes("الثالث") || t.term_name.includes("ثالث"))
  );

  return (
    <tr key={level}>
      <td style={{ fontWeight: "bold", verticalAlign: "middle" }}>{level}</td>
      <td>
        {firstTerm ? (
          <div style={ui.gpaBox}>
            <div>الفصلي: {firstTerm.term_gpa}</div>
            <div>التراكمي: {firstTerm.cumulative_gpa}</div>
          </div>
        ) : "لا توجد بيانات"}
      </td>
      <td>
        {secondTerm ? (
          <div style={ui.gpaBox}>
            <div>الفصلي: {secondTerm.term_gpa}</div>
            <div>التراكمي: {secondTerm.cumulative_gpa}</div>
          </div>
        ) : "لا توجد بيانات"}
      </td>
      {hasThirdTerm && (
        <td>
          {thirdTerm ? (
            <div style={ui.gpaBox}>
              <div>الفصلي: {thirdTerm.term_gpa}</div>
              <div>التراكمي: {thirdTerm.cumulative_gpa}</div>
            </div>
          ) : "—"}
        </td>
      )}
    </tr>
  );
})}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p style={{ textAlign: "center", color: "#64748b", padding: "40px 0" }}>
                لا توجد درجات مسجلة بعد
              </p>
            )}

{/* أزرار التصدير والطباعة - Dropdown Menu */}
<div style={{ textAlign: "center", marginTop: 40 }}>
  <div style={{ position: "relative", display: "inline-block" }}>
    <button
      className="btn btn-primary"
      onClick={() => setShowExportMenu(prev => !prev)}
      disabled={grades.length === 0}
      style={{ padding: "14px 32px", fontSize: 16, fontWeight: 700 }}
    >
      طباعة / تصدير السجل ▾
    </button>

    {showExportMenu && (
      <div style={{
        position: "absolute",
        top: "110%",
        right: 0,
        background: "#fff",
        border: "1px solid #d1d5db",
        borderRadius: 8,
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        zIndex: 999,
        minWidth: 220,
        overflow: "hidden",
        padding: "6px 0"
      }}>
        
        {/* عربي PDF */}
        <button
          onClick={() => { handlePrint('ar'); setShowExportMenu(false); }}
          style={{
            display: "block", width: "100%", padding: "12px 20px",
            background: "none", border: "none", textAlign: "right",
            cursor: "pointer", fontSize: 14, fontWeight: 700,
            color: "#1e40af", borderBottom: "1px solid #f3f4f6"
          }}
          onMouseEnter={e => e.target.style.background = "#eff6ff"}
          onMouseLeave={e => e.target.style.background = "none"}
        >
            PDF عربي
        </button>

                {/* English PDF */}
        <button
          onClick={() => { handlePrint('en'); setShowExportMenu(false); }}
          style={{
            display: "block", width: "100%", padding: "12px 20px",
            background: "none", border: "none", textAlign: "right",
            cursor: "pointer", fontSize: 14, fontWeight: 700,
            color: "#1e40af", borderBottom: "1px solid #f3f4f6"
          }}
          onMouseEnter={e => e.target.style.background = "#eff6ff"}
          onMouseLeave={e => e.target.style.background = "none"}
        >
            PDF انجليزي
        </button>

        {/* عربي Excel */}
        <button
          onClick={() => { exportToExcel('ar'); setShowExportMenu(false); }}
          style={{
            display: "block", width: "100%", padding: "12px 20px",
            background: "none", border: "none", textAlign: "right",
            cursor: "pointer", fontSize: 14, fontWeight: 700,
            color: "#166534"
          }}
          onMouseEnter={e => e.target.style.background = "#f0fdf4"}
          onMouseLeave={e => e.target.style.background = "none"}
        >
            Excel عربي
        </button>

        {/* English Excel */}
        <button
          onClick={() => { exportToExcel('en'); setShowExportMenu(false); }}
          style={{
            display: "block", width: "100%", padding: "12px 20px",
            background: "none", border: "none", textAlign: "right",
            cursor: "pointer", fontSize: 14, fontWeight: 700,
            color: "#166534"
          }}
          onMouseEnter={e => e.target.style.background = "#f0fdf4"}
          onMouseLeave={e => e.target.style.background = "none"}
        >
           Excel انجليزي
        </button>
      </div>
    )}
  </div>
</div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            جاري التحميل...
          </div>
        )}
      </main>
    </div>
  );
};

export default AcademicRecord;