import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';


const API_BASE = "http://localhost:5000/api";

const getAllowedFaculties = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.role === 'admin') return null;
    return Array.isArray(user.allowed_faculties) ? user.allowed_faculties : [];
  } catch (e) {
    console.warn("مشكلة في قراءة allowed_faculties", e);
    return [];
  }
};

const getAllowedProgramTypes = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    if (user.role === 'admin') {
      return ["diploma", "bachelor", "postgraduate"];
    }

    const allowed = Array.isArray(user.allowed_program_types) 
      ? user.allowed_program_types 
      : ["bachelor"];   

    return allowed;
  } catch (e) {
    console.warn("مشكلة في قراءة allowed_program_types", e);
    return ["bachelor"];
  }
};

// ====================== Constants للفلاتر ======================
const ACADEMIC_STATUS_OPTIONS = [
  "منتظم",
  "إعادة",
  "محوّل داخلي",
  "محول خارجي",
  "مجمّد",
  "منسحب",
  "تجسير",
  "فصل",
  "حملة درجات علمية",
];

const ACADEMIC_STATUS_PG = ["منتظم", "فصل"];

const SCHOLARSHIP_OPTIONS = [
  { type: "لا منحة", percentage: 0 },
  { type: "منحة أبناء مؤسسين", percentage: 100 },
  { type: "منحة أبناء عاملين", percentage: 75 },
  { type: "منحة تفوق", percentage: 100 },
  { type: "منحة أشقاء", percentage: null },
  { type: "تخفيضات المدير", percentage: null },
  { type: "أخرى", percentage: null },
];

const StudentsTermList = () => {
  const navigate = useNavigate();

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Lists
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [periods, setPeriods] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [termOptions, setTermOptions] = useState([]);

  // Filters
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const [programType, setProgramType] = useState("bachelor");
  const [postgraduateProgram, setPostgraduateProgram] = useState("");

  const [academicYear, setAcademicYear] = useState("");
  const [levelName, setLevelName] = useState("");
  const [termName, setTermName] = useState("");

  const [registrationFilter, setRegistrationFilter] = useState("all");
  const [academicStatusFilter, setAcademicStatusFilter] = useState("");
  const [scholarshipTypeFilter, setScholarshipTypeFilter] = useState("");

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  const canPickDepartment = !!selectedFacultyId;
  const canPickProgramType = !!selectedDepartmentId;
  const canPickPostgraduateProgram = programType === "postgraduate";
  const canProceedAfterProgram =
    (programType === "bachelor" || programType === "diploma") 
      ? true 
      : !!postgraduateProgram.trim();

  const canPickYear = canPickProgramType && canProceedAfterProgram;
  const canPickLevel = !!academicYear.trim();
  const canPickTerm = !!levelName.trim();

  const canLoadStudents =
    selectedFacultyId &&
    selectedDepartmentId &&
    canProceedAfterProgram &&
    academicYear.trim() &&
    levelName.trim() &&
    termName.trim();

  const pgSmart = usePostgradProgramsSmartList();

  useEffect(() => {
    if (programType === "postgraduate") {
      pgSmart.fetchPrograms();
    } else {
      setPostgraduateProgram("");
    }
  }, [programType]);

  // Load faculties
  useEffect(() => {
    const loadFaculties = async () => {
      setLoadingFaculties(true);
      try {
        const res = await fetch(`${API_BASE}/faculties-list`);
        const allFaculties = await res.json();

        const allowed = getAllowedFaculties();

        let filtered = allFaculties;
        if (allowed !== null) {
          filtered = allFaculties.filter(fac => allowed.includes(fac.id));
        }

        setFaculties(Array.isArray(filtered) ? filtered : []);

        if (filtered.length === 0 && allowed !== null) {
          showToast("لا توجد كليات مسموح لك الوصول إليها", "error");
        }

        if (selectedFacultyId) {
          const stillAllowed = filtered.find(f => f.id === Number(selectedFacultyId));
          if (!stillAllowed) {
            setSelectedFacultyId("");
          }
        }
      } catch (e) {
        console.error(e);
        showToast("مشكلة في تحميل الكليات", "error");
      } finally {
        setLoadingFaculties(false);
      }
    };

    loadFaculties();
  }, []);

  function usePostgradProgramsSmartList() {
    const [programs, setPrograms] = useState([]);

    const fetchPrograms = async () => {
      try {
        const res = await fetch(`${API_BASE}/postgraduate-programs`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "فشل تحميل البرامج");
        setPrograms(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setPrograms([]);
      }
    };

    return { programs, fetchPrograms };
  }

  const fetchDepartmentsByFaculty = async (facultyId) => {
    if (!facultyId) return;
    setLoadingDeps(true);
    try {
      const res = await fetch(`${API_BASE}/departments/${facultyId}`);
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setDepartments([]);
      showToast("مشكلة في تحميل الأقسام", "error");
    } finally {
      setLoadingDeps(false);
    }
  };

  const fetchAcademicPeriods = async (pType, pgProg) => {
    setLoadingPeriods(true);
    try {
      const pt = (pType || "bachelor").trim();
      const pg = (pgProg || "").trim();

      let url = `${API_BASE}/academic-periods?program_type=${encodeURIComponent(pt)}`;
      if (pt === "postgraduate" && pg) url += `&postgraduate_program=${encodeURIComponent(pg)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل تحميل الفترات");

      const rows = Array.isArray(data) ? data : [];
      setPeriods(rows);

      const ys = Array.from(new Set(rows.map(r => r.academic_year?.trim()).filter(Boolean)));
      setYearOptions(ys);
    } catch (e) {
      console.error(e);
      setPeriods([]);
      setYearOptions([]);
      setLevelOptions([]);
      setTermOptions([]);
    } finally {
      setLoadingPeriods(false);
    }
  };

  const rebuildLevelAndTermOptions = (rows, year, level) => {
    const y = (year || "").trim();
    const l = (level || "").trim();

    const levels = Array.from(
      new Set(rows.filter(r => r.academic_year?.trim() === y).map(r => r.level_name?.trim()).filter(Boolean))
    );
    setLevelOptions(levels);

    const terms = Array.from(
      new Set(
        rows
          .filter(r => r.academic_year?.trim() === y && r.level_name?.trim() === l)
          .map(r => r.term_name?.trim())
          .filter(Boolean)
      )
    );
    setTermOptions(terms);
  };

  useEffect(() => {
    rebuildLevelAndTermOptions(periods, academicYear, levelName);
  }, [periods, academicYear, levelName]);

  useEffect(() => {
    setAcademicYear("");
    setLevelName("");
    setTermName("");
    setStudents([]);
    setSearchText("");
    setAcademicStatusFilter("");
    setScholarshipTypeFilter("");
    setAcademicStatusFilter(""); 

    if (selectedDepartmentId) fetchAcademicPeriods(programType, postgraduateProgram);
  }, [programType, postgraduateProgram, selectedDepartmentId]);

  useEffect(() => {
    if (programType !== "postgraduate") setPostgraduateProgram("");
  }, [programType]);

  const resetBelowFaculty = () => {
    setDepartments([]);
    setSelectedDepartmentId("");
    setProgramType("bachelor");
    setPostgraduateProgram("");
    setAcademicYear("");
    setLevelName("");
    setTermName("");
    setStudents([]);
    setSearchText("");
    setAcademicStatusFilter("");
    setScholarshipTypeFilter("");
  };

  const resetBelowDepartment = () => {
    setProgramType("bachelor");
    setPostgraduateProgram("");
    setAcademicYear("");
    setLevelName("");
    setTermName("");
    setStudents([]);
    setSearchText("");
    setAcademicStatusFilter("");
    setScholarshipTypeFilter("");
  };

  const onSelectFaculty = (facultyId) => {
    setSelectedFacultyId(facultyId);
    resetBelowFaculty();
    if (facultyId) fetchDepartmentsByFaculty(facultyId);
  };

  const onSelectDepartment = (deptId) => {
    setSelectedDepartmentId(deptId);
    resetBelowDepartment();
    if (deptId) fetchAcademicPeriods(programType, postgraduateProgram);
  };

  const loadStudents = async () => {
    if (!canLoadStudents) return showToast("كمّل الاختيارات أولاً", "error");

    setLoadingStudents(true);
    setStudents([]);

    try {
      const qs =
        `department_id=${encodeURIComponent(selectedDepartmentId)}` +
        `&program_type=${encodeURIComponent(programType)}` +
        (programType === "postgraduate"
          ? `&postgraduate_program=${encodeURIComponent(postgraduateProgram.trim())}`
          : `&postgraduate_program=`) +
        `&academic_year=${encodeURIComponent(academicYear.trim())}` +
        `&level_name=${encodeURIComponent(levelName.trim())}` +
        `&term_name=${encodeURIComponent(termName.trim())}`;

      const res = await fetch(`${API_BASE}/term-students?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل تحميل الطلاب");

      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showToast(e.message || "مشكلة في تحميل الطلاب", "error");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (canLoadStudents) loadStudents();
  }, [canLoadStudents]);

  // ====================== Filtering Logic ======================
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // فلترة حسب حالة التسجيل
    if (registrationFilter === "registered") {
      result = result.filter(s => 
        (s.registration_status || "").trim() === "مسجّل" ||
        (s.registration_status || "").trim() === "مسجل"
      );
    } else if (registrationFilter === "unregistered") {
      result = result.filter(s => {
        const status = (s.registration_status || "").trim();
        return status === "غير مسجّل" || 
               status === "غير مسجل" || 
               status === "";
      });
    }

    // فلترة حسب الموقف الأكاديمي
    if (academicStatusFilter.trim()) {
      result = result.filter(s => 
        (s.academic_status || "").trim() === academicStatusFilter.trim()
      );
    }

    // فلترة حسب نوع المنحة
    if (scholarshipTypeFilter.trim()) {
      result = result.filter(s => 
        (s.scholarship_type || "").trim() === scholarshipTypeFilter.trim()
      );
    }

    // فلترة البحث
    const q = (searchText || "").trim().toLowerCase();
    if (!q) return result;

    return result.filter(s => {
      const name = (s.full_name || "").toLowerCase();
      const uni = String(s.university_id || "").toLowerCase();
      return name.includes(q) || uni.includes(q);
    });
  }, [students, searchText, registrationFilter, academicStatusFilter, scholarshipTypeFilter]);

  // ====================== Print Function ======================
  const printTermStudentsList = () => {
    if (filteredStudents.length === 0) {
      showToast("لا توجد بيانات للطباعة", "error");
      return;
    }

    const facultyName = faculties.find(f => f.id === Number(selectedFacultyId))?.faculty_name || "غير محدد";
    const departmentName = departments.find(d => d.id === Number(selectedDepartmentId))?.department_name || "غير محدد";

    let programLabel = "";

    if (programType === "postgraduate") {
      programLabel = `دراسات عليا - ${postgraduateProgram || "غير محدد"}`;
    } else if (programType === "diploma") {
      programLabel = "دبلوم";
    } else {
      programLabel = "بكالوريوس";
    }
    const filterText = [];
    if (registrationFilter === "registered") filterText.push("المسجلين");
    if (registrationFilter === "unregistered") filterText.push("غير المسجلين");
    if (academicStatusFilter.trim()) filterText.push(`موقف: ${academicStatusFilter}`);
    if (scholarshipTypeFilter.trim()) filterText.push(`منحة: ${scholarshipTypeFilter}`);

    const filterTextStr = filterText.length > 0 ? ` - ${filterText.join(" | ")}` : "";

    const headerHTML = `
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid #ccc; direction: rtl; font-family: 'Cairo', 'Tajawal', sans-serif; margin-top: -20px;">
        <h1 style="margin: 0; color: #0a3753; font-size: 22px;">
          جامعة بورتسودان الأهلية
        </h1>
        <p style="margin: 8px 0 4px; font-weight: bold; font-size: 16px;">
          ${facultyName} - ${departmentName}
        </p>
        <p style="margin: 4px 0; font-weight: bold; color: #0a3753; font-size: 15px;">
          نوع البرنامج: ${programLabel}
        </p>
        <p style="margin: 4px 0; font-size: 14px;">
          السنة الدراسية: ${academicYear} |  ${levelName} |  ${termName}
        </p>
        <p style="margin: 12px 0 0; color: #4b5563; font-size: 13px;">
          قوائم الطلاب${filterTextStr}
        </p>
      </div>
    `;

    const tableHTML = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; direction: rtl; font-family: 'Cairo', 'Tajawal', sans-serif; font-size: 12px;">
        <thead>
          <tr style="background: #6e6e6e; color: white;">
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center; font-weight: bold; font-size: 11px;">#</th>
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center; font-weight: bold; font-size: 11px;">الرقم الجامعي</th>
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: right; font-weight: bold; font-size: 11px;">اسم الطالب</th>
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center; font-weight: bold; font-size: 11px;">الموقف الأكاديمي</th>
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center; font-weight: bold; font-size: 11px;">نوع المنحة</th>
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center; font-weight: bold; font-size: 11px;">النسبة</th>
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center; font-weight: bold; font-size: 11px;">حالة التسجيل</th>
          </tr>
        </thead>
        <tbody>
          ${filteredStudents.map((s, idx) => `
            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
              <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center;">${idx + 1}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center; font-size: 11px;">${s.university_id || '—'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; text-align: right; font-size: 11px;">${s.full_name || '—'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center; font-size: 11px;">${s.academic_status || '—'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center; font-size: 11px;">${s.scholarship_type || '—'}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center; font-size: 11px;">
                ${s.scholarship_percentage !== undefined && s.scholarship_percentage !== null ? `${s.scholarship_percentage}%` : '—'}
              </td>
              <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center; font-size: 11px;">
                ${s.registration_status || 'غير مسجل'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const fullContent = `<div style="padding: 20px 40px;">${headerHTML}${tableHTML}</div>`;
    const element = document.createElement('div');
    element.innerHTML = fullContent;

    html2pdf()
      .from(element)
      .set({
        margin: 1,
        filename: `قائمة_طلاب_${academicYear.replace('/', '-')}_${termName.replace(/ /g, '_')}.pdf`,
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        html2canvas: { scale: 2 }
      })
      .save();

    showToast("جاري تجهيز القائمة للطباعة...", "success");
  };

  const getHeaderInfo = () => {
    const facultyName = faculties.find(f => f.id === Number(selectedFacultyId))?.faculty_name || "غير محدد";
    const departmentName = departments.find(d => d.id === Number(selectedDepartmentId))?.department_name || "غير محدد";
    let programLabel = "";
    if (programType === "postgraduate") programLabel = `دراسات عليا - ${postgraduateProgram || "غير محدد"}`;
    else if (programType === "diploma") programLabel = "دبلوم";
    else programLabel = "بكالوريوس";

    const filterParts = [];
    if (registrationFilter === "registered") filterParts.push("المسجلين");
    if (registrationFilter === "unregistered") filterParts.push("غير المسجلين");
    if (academicStatusFilter.trim()) filterParts.push(`موقف: ${academicStatusFilter}`);
    if (scholarshipTypeFilter.trim()) filterParts.push(`منحة: ${scholarshipTypeFilter}`);

    return { facultyName, departmentName, programLabel, filterParts };
  };


  const exportToExcel = () => {
  if (filteredStudents.length === 0) {
    return showToast("لا توجد بيانات للتصدير", "error");
  }

  const { facultyName, departmentName, programLabel, filterParts } = getHeaderInfo();

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([]);

  // ==================== الهيدر الجديد (في العمود الثاني) ====================
  const headerInfo = [
    ["", "جامعة بورتسودان الأهلية"],                    // B1
    ["", `${facultyName} - ${departmentName}`],           // B2
    ["", `نوع البرنامج: ${programLabel}`],               // B3
    ["", `السنة الدراسية: ${academicYear} | ${levelName} | ${termName}`], // B4
  ];

  if (filterParts.length > 0) {
    headerInfo.push(["", `الفلاتر: ${filterParts.join(" | ")}`]); // B5
  }

  // إضافة الهيدر
  XLSX.utils.sheet_add_aoa(ws, headerInfo, { origin: "A1" });

  // مسافة فارغة
  XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 });

  // رؤوس الأعمدة (تبدأ من A7)
  const colHeaders = ["#", "الرقم الجامعي", "اسم الطالب", "الموقف الأكاديمي", "نوع المنحة", "نسبة المنحة", "حالة التسجيل"];
  XLSX.utils.sheet_add_aoa(ws, [colHeaders], { origin: -1 });

  // البيانات
  const dataRows = filteredStudents.map((s, idx) => [
    idx + 1,
    s.university_id || "—",
    s.full_name || "—",
    s.academic_status || "—",
    s.scholarship_type || "—",
    s.scholarship_percentage !== undefined && s.scholarship_percentage !== null
      ? `${s.scholarship_percentage}%`
      : "—",
    s.registration_status || "غير مسجل",
  ]);

  XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: -1 });

  // تنسيق الأعمدة
  ws['!cols'] = [
    { wch: 6 },   // #
    { wch: 18 },  // الرقم الجامعي
    { wch: 35 },  // الاسم
    { wch: 20 },  // الموقف
    { wch: 25 },  // نوع المنحة
    { wch: 12 },  // النسبة
    { wch: 16 },  // حالة التسجيل
  ];

  // دمج الخلايا في الهيدر (اختياري - يعطي شكل أفضل)
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 0, c: 1 }, e: { r: 0, c: 6 } }); // دمج اسم الجامعة
  ws['!merges'].push({ s: { r: 1, c: 1 }, e: { r: 1, c: 6 } });
  ws['!merges'].push({ s: { r: 2, c: 1 }, e: { r: 2, c: 6 } });
  ws['!merges'].push({ s: { r: 3, c: 1 }, e: { r: 3, c: 6 } });
  if (filterParts.length > 0) {
    ws['!merges'].push({ s: { r: 4, c: 1 }, e: { r: 4, c: 6 } });
  }

  XLSX.utils.book_append_sheet(wb, ws, "قائمة الطلاب");

  const fileName = `قائمة_طلاب_${academicYear.replace('/', '-')}_${termName.replace(/ /g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);

  showToast("تم تصدير ملف Excel بنجاح ", "success");
  };

  return (
    <div className="admission-layout">
      <header className="library-header">
        <div className="library-header-title">
          <span> قوائم الطلاب</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="رجوع"
        >
          <IoArrowBack />
        </button>
      </header>

      <main className="library-main">
        <div className="library-container">
          {/* ====================== اختيار الفصل ====================== */}
          <div className="card" style={{ marginTop: 14 }}>
            <h2 className="card-title">اختيار الفصل</h2>

            <div className="two-col-grid" style={{ marginBottom: 12 }}>
              <div className="input-group">
                <label className="input-label">الكلية</label>
                <select
                  className="input-field"
                  value={selectedFacultyId}
                  onChange={(e) => onSelectFaculty(e.target.value)}
                  disabled={loadingFaculties}
                >
                  <option value="">{loadingFaculties ? "جارٍ التحميل..." : "— اختار —"}</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.faculty_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">القسم</label>
                <select
                  className="input-field"
                  value={selectedDepartmentId}
                  onChange={(e) => onSelectDepartment(e.target.value)}
                  disabled={!canPickDepartment || loadingDeps}
                >
                  <option value="">
                    {!canPickDepartment ? "اختار كلية أولاً" : loadingDeps ? "جارٍ تحميل الأقسام..." : "— اختار —"}
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.department_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                <label className="input-label">نوع البرنامج</label>

                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                  {getAllowedProgramTypes().map((type) => (
                    <label 
                      key={type}
                      style={{ 
                        display: "flex", 
                        gap: 8, 
                        alignItems: "center", 
                        fontWeight: 700,
                        opacity: !canPickProgramType ? 0.6 : 1,
                        cursor: !canPickProgramType ? "not-allowed" : "pointer"
                      }}
                    >
                      <input
                        type="radio"
                        name="programTypeGrades"
                        value={type}
                        checked={programType === type}
                        onChange={(e) => setProgramType(e.target.value)}
                        disabled={!canPickProgramType}
                      />
                      {type === "diploma" && "دبلوم"}
                      {type === "bachelor" && "بكالوريوس"}
                      {type === "postgraduate" && "دراسات عليا"}
                    </label>
                  ))}
                </div>
              </div>

              {programType === "postgraduate" && (
                <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="input-label">اسم برنامج الدراسات العليا</label>
                  <input
                    className="input-field"
                    dir="rtl"
                    list="postgrad_programs_list"
                    placeholder="مثال: ماجستير إدارة أعمال"
                    value={postgraduateProgram}
                    onChange={(e) => setPostgraduateProgram(e.target.value)}
                    disabled={!canPickProgramType}
                  />
                  <datalist id="postgrad_programs_list">
                    {pgSmart.programs.map((prog, idx) => (
                      <option key={idx} value={prog} />
                    ))}
                  </datalist>
                </div>
              )}

              <div className="input-group">
                <label className="input-label">السنة الدراسية</label>
                <input
                  className="input-field"
                  dir="rtl"
                  list="years_list_students"
                  placeholder="مثال: 2024/2025"
                  value={academicYear}
                  onChange={(e) => {
                    setAcademicYear(e.target.value);
                    setLevelName("");
                    setTermName("");
                    setStudents([]);
                    setSearchText("");
                  }}
                  disabled={!canPickYear || loadingPeriods}
                />
                <datalist id="years_list_students">
                  {yearOptions.map((x) => (
                    <option key={x} value={x} />
                  ))}
                </datalist>
              </div>

              <div className="input-group">
                <label className="input-label">
                  {programType === "postgraduate" ? "الدفعة" : "المستوى"}
                </label>
                <input
                  className="input-field"
                  dir="rtl"
                  list="levels_list_students"
                  placeholder={programType === "postgraduate" ? "مثال: الدفعة الأولى" : "مثال: المستوى الأول"}
                  value={levelName}
                  onChange={(e) => {
                    setLevelName(e.target.value);
                    setTermName("");
                    setStudents([]);
                    setSearchText("");
                  }}
                  disabled={!canPickLevel}
                />
                <datalist id="levels_list_students">
                  {levelOptions.map((x) => (
                    <option key={x} value={x} />
                  ))}
                </datalist>
              </div>

              <div className="input-group">
                <label className="input-label">الفصل الدراسي</label>
                <select
                  className="input-field"
                  dir="rtl"
                  value={termName}
                  onChange={(e) => {
                    setTermName(e.target.value);
                    setStudents([]); 
                    setSearchText("");
                  }}
                  disabled={!canPickTerm}
                >
                  <option value="">— اختر الفصل —</option>
                  {termOptions.length > 0 ? (
                    termOptions.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="الفصل الأول">الفصل الأول</option>
                      <option value="الفصل الثاني">الفصل الثاني</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* ====================== قائمة الطلاب ====================== */}
          <div className="card" style={{ marginTop: 14 }}>
            <h2 className="card-title">قائمة الطلاب</h2>

            {/* ====================== الفلاتر والأزرار ====================== */}
            <div style={{ display: "flex", gap: 12, flexDirection: "column", marginBottom: 16 }}>
              {/* الصف الأول: الزر والعدد وفلتر التسجيل */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={printTermStudentsList}
                  disabled={!canLoadStudents || loadingStudents || filteredStudents.length === 0}
                  style={{ backgroundColor: "#0a3753", borderColor: "#0a3753", display: "flex", alignItems: "center", gap: 6 }}
                >
                  طباعة PDF
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={exportToExcel}
                  disabled={!canLoadStudents || loadingStudents || filteredStudents.length === 0}
                  style={{ backgroundColor: "#16a34a", borderColor: "#16a34a", display: "flex", alignItems: "center", gap: 6 }}
                >
                  تصدير Excel
                </button>

                <div style={{ color: "#6b7280", fontWeight: 800 }}>
                  {academicStatusFilter.trim() || scholarshipTypeFilter.trim()
                    ? `المعروضون: ${filteredStudents.length} / ${students.length}`
                    : `الإجمالي: ${students.length}`
                  }
                </div>

                {/* فلتر حالة التسجيل */}
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="registrationFilter"
                      checked={registrationFilter === "all"}
                      onChange={() => setRegistrationFilter("all")}
                      disabled={loadingStudents || students.length === 0}
                    />
                    الكل
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="registrationFilter"
                      checked={registrationFilter === "registered"}
                      onChange={() => setRegistrationFilter("registered")}
                      disabled={loadingStudents || students.length === 0}
                    />
                    مسجلين
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="registrationFilter"
                      checked={registrationFilter === "unregistered"}
                      onChange={() => setRegistrationFilter("unregistered")}
                      disabled={loadingStudents || students.length === 0}
                    />
                    غير مسجلين
                  </label>
                </div>
              </div>

              {/* الصف الثاني: فلاتر الموقف والمنحة والبحث */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                {/* فلتر الموقف الأكاديمي */}
{/* فلتر الموقف الأكاديمي */}
<div style={{ minWidth: 220 }}>
  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#374151" }}>
    الموقف الأكاديمي
  </label>
  <select
    className="input-field"
    value={academicStatusFilter}
    onChange={(e) => setAcademicStatusFilter(e.target.value)}
    disabled={loadingStudents || students.length === 0}
    style={{ padding: "8px 12px", fontSize: 13, height: 40 }}
  >
    <option value="">— الكل —</option>
    
    {/* التعديل هنا: نتحقق من نوع البرنامج */}
    {(programType === "postgraduate" ? ACADEMIC_STATUS_PG : ACADEMIC_STATUS_OPTIONS).map((status) => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>
</div>

                {/* فلتر نوع المنحة */}
                <div style={{ minWidth: 220 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#374151" }}>
                    نوع المنحة
                  </label>
                  <select
                    className="input-field"
                    value={scholarshipTypeFilter}
                    onChange={(e) => setScholarshipTypeFilter(e.target.value)}
                    disabled={loadingStudents || students.length === 0}
                    style={{ padding: "8px 12px", fontSize: 13, height: 40 }}
                  >
                    <option value="">— الكل —</option>
                    {SCHOLARSHIP_OPTIONS.map((option) => (
                      <option key={option.type} value={option.type}>
                        {option.type}
                        {option.percentage !== null && ` (${option.percentage}%)`}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1 }} />

                {/* البحث */}
                <input
                  className="input-field"
                  dir="rtl"
                  placeholder="بحث بالاسم أو الرقم الجامعي..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ maxWidth: 320, padding: "8px 12px", fontSize: 13, height: 40 }}
                  disabled={students.length === 0}
                />
              </div>
            </div>

            {/* ====================== حالة عدم وجود طلاب ====================== */}
            {students.length === 0 && canLoadStudents && !loadingStudents && (
              <div style={{ color: "#6b7280", fontWeight: 800, textAlign: "center", padding: 20 }}>
                لا يوجد طلاب (أو لم يتم تسجيل طلاب لهذا الفصل).
              </div>
            )}

            {/* ====================== جدول الطلاب ====================== */}
            {filteredStudents.length > 0 && (
              <div style={{ marginTop: 10, overflowX: "auto" }}>
                <table className="simple-table" style={{ width: "100%", fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f3f4f6" }}>
                      <th style={{ whiteSpace: "nowrap", padding: 12 }}>#</th>
                      <th style={{ whiteSpace: "nowrap", padding: 12 }}>الرقم الجامعي</th>
                      <th style={{ whiteSpace: "nowrap", padding: 12 }}>اسم الطالب</th>
                      <th style={{ whiteSpace: "nowrap", padding: 12 }}>الموقف الأكاديمي</th>
                      <th style={{ whiteSpace: "nowrap", padding: 12 }}>نوع المنحة</th>
                      <th style={{ whiteSpace: "nowrap", padding: 12 }}>نسبة المنحة</th>
                      <th style={{ whiteSpace: "nowrap", padding: 12 }}>حالة التسجيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, idx) => (
                      <tr 
                        key={s.student_id ?? idx}
                        style={{ 
                          backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                          borderBottom: "1px solid #e5e7eb"
                        }}
                      >
                        <td style={{ textAlign: "right", padding: 12 }}>{idx + 1}</td>
                        <td style={{ whiteSpace: "nowrap", textAlign: "right", padding: 12 }}>
                          {s.university_id || "—"}
                        </td>
                        <td style={{ fontWeight: 700, padding: 12 }}>
                          {s.full_name || "—"}
                        </td>
                        <td style={{ whiteSpace: "nowrap", textAlign: "right", padding: 12 }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: 4,
                            backgroundColor: s.academic_status === "فصل" ? "#fee2e2" : "#dbeafe",
                            color: s.academic_status === "فصل" ? "#991b1b" : "#1e40af",
                            fontSize: 12,
                            fontWeight: 600,
                            display: "inline-block"
                          }}>
                            {s.academic_status || "—"}
                          </span>
                        </td>
                        <td style={{ whiteSpace: "nowrap", textAlign: "right", padding: 12 }}>
                          {s.scholarship_type || "—"}
                        </td>
                        <td style={{ whiteSpace: "nowrap", textAlign: "right", padding: 12 }}>
                          {s.scholarship_percentage !== undefined && s.scholarship_percentage !== null
                            ? `${s.scholarship_percentage}%`
                            : "—"
                          }
                        </td>
                        <td style={{ whiteSpace: "nowrap", textAlign: "right", padding: 12 }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: 4,
                            backgroundColor: (s.registration_status === "مسجّل" || s.registration_status === "مسجل") ? "#dcfce7" : "#fecaca",
                            color: (s.registration_status === "مسجّل" || s.registration_status === "مسجل") ? "#166534" : "#991b1b",
                            fontSize: 12,
                            fontWeight: 600,
                            display: "inline-block"
                          }}>
                            {s.registration_status || "غير مسجل"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ====================== حالة عدم وجود نتائج بعد الفلترة ====================== */}
            {filteredStudents.length === 0 && students.length > 0 && (
              <div style={{ color: "#6b7280", fontWeight: 800, textAlign: "center", padding: 20 }}>
                لا توجد نتائج تطابق الفلاتر المختارة
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ====================== Toast ====================== */}
      {toast && (
        <div
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            background: toast.type === "error" ? "#dc2626" : "#16a34a",
            color: "white",
            padding: "12px 16px",
            borderRadius: 10,
            fontWeight: 900,
            boxShadow: "0 12px 30px rgba(0,0,0,.25)",
            zIndex: 9999,
            maxWidth: 400,
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default StudentsTermList;