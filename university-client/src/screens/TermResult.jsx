import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import html2pdf from 'html2pdf.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const API_BASE = "http://localhost:5000/api";

const getAllowedFaculties = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.role === 'admin') return null;
    return Array.isArray(user.allowed_faculties) ? user.allowed_faculties : [];
  } catch { return []; }
};
const getAllowedProgramTypes = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.role === 'admin') return ["diploma", "bachelor", "postgraduate"];
    return Array.isArray(user.allowed_program_types) ? user.allowed_program_types : ["bachelor"];
  } catch { return ["bachelor"]; }
};

function statusStyle(status) {
  switch (status) {
    case "ناجح":               return { color: "#16a34a", bg: "" };
    case "ملحق":               return { color: "#0369a1", bg: "#eff6ff" };
    case "تعليق دراسة":       return { color: "#b45309", bg: "#fffbeb" };
    case "إعادة":              return { color: "#ea580c", bg: "#fff7ed" };
    case "فصل":                return { color: "#7c3aed", bg: "#fdf4ff" };
    case "فصل (إعادة ثانية)": return { color: "#7c3aed", bg: "#fdf4ff" };
    default:                   return { color: "#6b7280", bg: "" };
  }
}

function usePostgradProgramsSmartList() {
  const [programs, setPrograms] = useState([]);
  const fetchPrograms = async () => {
    try {
      const res = await fetch(`${API_BASE}/postgraduate-programs`);
      const data = await res.json();
      setPrograms(Array.isArray(data) ? data : []);
    } catch { setPrograms([]); }
  };
  return { programs, fetchPrograms };
}

const TermResult = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [faculties,    setFaculties]    = useState([]);
  const [departments,  setDepartments]  = useState([]);
  const [periods,      setPeriods]      = useState([]);
  const [yearOptions,  setYearOptions]  = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [termOptions,  setTermOptions]  = useState([]);
  const pgSmart = usePostgradProgramsSmartList();

  const [selectedFacultyId,    setSelectedFacultyId]    = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [programType,          setProgramType]          = useState("bachelor");
  const [postgraduateProgram,  setPostgraduateProgram]  = useState("");
  const [academicYear,         setAcademicYear]         = useState("");
  const [levelName,            setLevelName]            = useState("");
  const [termName,             setTermName]             = useState("");

  const [savedRows,       setSavedRows]       = useState([]);
  const [skippedRows,     setSkippedRows]     = useState([]);
  const [hasSavedResults, setHasSavedResults] = useState(false);
  const [recommendations, setRecommendations] = useState({});
  const [savingRecs,      setSavingRecs]      = useState(false);
  const [detailedGrades,     setDetailedGrades]     = useState({});
  const [repeatedCoursesMap, setRepeatedCoursesMap] = useState({});
  const [loadingDetails,     setLoadingDetails]     = useState(false);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingDeps,      setLoadingDeps]      = useState(false);
  const [loadingPeriods,   setLoadingPeriods]   = useState(false);
  const [computingResult,  setComputingResult]  = useState(false);
  const [loadingResult,    setLoadingResult]    = useState(false);

  const [showStats, setShowStats] = useState(false);

const [courseStats, setCourseStats] = useState({});

  const canPickDepartment  = !!selectedFacultyId;
  const canPickProgramType = !!selectedDepartmentId;
  const canProceedAfterProgram =
    programType === "bachelor" || programType === "diploma"
      ? true : !!postgraduateProgram.trim();
  const canPickYear  = canPickProgramType && canProceedAfterProgram;
  const canPickLevel = !!academicYear.trim();
  const canPickTerm  = !!levelName.trim();
  const canComputeTerm =
    selectedFacultyId && selectedDepartmentId && canProceedAfterProgram &&
    academicYear.trim() && levelName.trim() && termName.trim();

  const countByStatus = (s) => savedRows.filter(r => r.result_status === s).length;

  // إجماليات الفصلين — من الباك مباشرة
  const sampleRow       = savedRows[0] || {};
  const bothTotalHours  = Number(sampleRow.both_total_hours  || 0);
  const bothOneThird    = bothTotalHours > 0 ? (bothTotalHours / 3).toFixed(1)     : "—";
  const bothTwoThirds   = bothTotalHours > 0 ? (bothTotalHours * 2 / 3).toFixed(1) : "—";

  useEffect(() => {
    const load = async () => {
      setLoadingFaculties(true);
      try {
        const res = await fetch(`${API_BASE}/faculties-list`);
        const all = await res.json();
        const allowed  = getAllowedFaculties();
        const filtered = allowed === null ? all : all.filter(f => allowed.includes(f.id));
        setFaculties(Array.isArray(filtered) ? filtered : []);
        if (filtered.length === 0 && allowed !== null)
          showToast("لا توجد كليات مسموح لك الوصول إليها", "error");
      } catch { showToast("مشكلة في تحميل الكليات", "error"); }
      finally { setLoadingFaculties(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (programType === "postgraduate") pgSmart.fetchPrograms();
    else setPostgraduateProgram("");
  }, [programType]);

  useEffect(() => {
    if (savedRows.length === 0) return;
    const map = {};
    savedRows.forEach(r => { map[r.student_id] = r.recommendation || ""; });
    setRecommendations(map);
  }, [savedRows]);

  useEffect(() => {
    if (savedRows.length === 0 || !canComputeTerm) { setRepeatedCoursesMap({}); return; }
    const run = async () => {
      const map = {};
      for (const s of savedRows) {
        const params = new URLSearchParams({
          student_id: s.student_id, academic_year: academicYear.trim(),
          level_name: levelName.trim(), term_name: termName.trim(), program_type: programType,
          ...(programType === "postgraduate" && postgraduateProgram.trim()
            ? { postgraduate_program: postgraduateProgram.trim() } : {})
        });
        try {
          const res  = await fetch(`${API_BASE}/student-repeated-courses?${params}`);
          const data = res.ok ? await res.json() : {};
          map[s.student_id] = Array.isArray(data.repeated) ? data.repeated : [];
        } catch { map[s.student_id] = []; }
      }
      setRepeatedCoursesMap(map);
    };
    run();
  }, [savedRows, canComputeTerm]);

  useEffect(() => {
    if (savedRows.length === 0 || !canComputeTerm) { setDetailedGrades({}); return; }
    const run = async () => {
      setLoadingDetails(true);
      const map = {};
      for (const s of savedRows) {
        const params = new URLSearchParams({
          student_id: s.student_id, academic_year: academicYear.trim(),
          level_name: levelName.trim(), term_name: termName.trim(), program_type: programType,
          ...(programType === "postgraduate" && postgraduateProgram.trim()
            ? { postgraduate_program: postgraduateProgram.trim() } : {})
        });
        try {
          const res  = await fetch(`${API_BASE}/student-term-grades?${params}`);
          const data = res.ok ? await res.json() : [];
          map[s.student_id] = Array.isArray(data) ? data : [];
        } catch { map[s.student_id] = []; }
      }
      setDetailedGrades(map);
      setLoadingDetails(false);
    };
    run();
  }, [savedRows, canComputeTerm]);

const saveRecommendations = async () => {
  if (Object.keys(recommendations).length === 0) {
    return showToast("لا توجد ملاحظات للحفظ", "error");
  }

  setSavingRecs(true);
  try {
    const token = sessionStorage.getItem("token");

    const payload = Object.entries(recommendations).map(([student_id, recommendation]) => ({
      student_id: Number(student_id),
      faculty_id: Number(selectedFacultyId),
      department_id: Number(selectedDepartmentId),
      academic_year: academicYear.trim(),
      level_name: levelName.trim(),
      term_name: termName.trim(),
      program_type: programType,
      postgraduate_program: programType === "postgraduate" ? postgraduateProgram.trim() : null,
      recommendation: recommendation.trim()
    }));

    const res = await fetch(`${API_BASE}/term-results/save-recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ recommendations: payload })
    });

        if (res.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      showToast("انتهت الجلسة، يرجى تسجيل الدخول", "error");
      navigate("/login");
      return; 
    }

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "فشل الحفظ");

    showToast("تم الحفظ", "success");

    await loadSavedResult();

  } catch (e) {
    console.error(e);
    showToast(e.message || "خطأ في الحفظ", "error");
  } finally {
    setSavingRecs(false);
  }
};

// حساب إحصائيات كل مادة
useEffect(() => {
  if (Object.keys(detailedGrades).length === 0) {
    setCourseStats({});
    return;
  }

  const stats = {};

  Object.values(detailedGrades).flat().forEach(grade => {
    const course = grade.course_name || "غير معروف";
    if (!stats[course]) {
      stats[course] = { total: 0, passed: 0, failed: 0 };
    }

    stats[course].total++;

    const mark = Number(grade.total_mark || 0);
    const letter = String(grade.grade_letter || "").toUpperCase();

    if (letter === "F" || mark < 50) {
      stats[course].failed++;
    } else {
      stats[course].passed++;
    }
  });

  setCourseStats(stats);
}, [detailedGrades]);

  const fetchAcademicPeriods = async (pType, pgProg) => {
    setLoadingPeriods(true);
    try {
      const pt = (pType || "bachelor").trim(), pg = (pgProg || "").trim();
      let url = `${API_BASE}/academic-periods?program_type=${encodeURIComponent(pt)}`;
      if (pt === "postgraduate" && pg) url += `&postgraduate_program=${encodeURIComponent(pg)}`;
      const res  = await fetch(url);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];
      setPeriods(rows);
      setYearOptions(Array.from(new Set(rows.map(r => (r.academic_year||"").trim()).filter(Boolean))));
    } catch { setPeriods([]); setYearOptions([]); setLevelOptions([]); setTermOptions([]); }
    finally { setLoadingPeriods(false); }
  };

  const rebuildOptions = (rows, year, level) => {
    const y=(year||"").trim(), l=(level||"").trim();
    setLevelOptions(Array.from(new Set(
      rows.filter(r=>(r.academic_year||"").trim()===y).map(r=>(r.level_name||"").trim()).filter(Boolean)
    )));
    setTermOptions(Array.from(new Set(
      rows.filter(r=>(r.academic_year||"").trim()===y&&(r.level_name||"").trim()===l)
          .map(r=>(r.term_name||"").trim()).filter(Boolean)
    )));
  };

  useEffect(() => { rebuildOptions(periods, academicYear, levelName); }, [periods, academicYear, levelName]);
  useEffect(() => {
    setAcademicYear(""); setLevelName(""); setTermName(""); setSavedRows([]); setSkippedRows([]);
    if (selectedDepartmentId) fetchAcademicPeriods(programType, postgraduateProgram);
  }, [programType, postgraduateProgram]);
  useEffect(() => { if (programType !== "postgraduate") setPostgraduateProgram(""); }, [programType]);

  const resetBelowFaculty = () => {
    setDepartments([]); setSelectedDepartmentId("");
    setProgramType("bachelor"); setPostgraduateProgram("");
    setAcademicYear(""); setLevelName(""); setTermName("");
    setSavedRows([]); setSkippedRows([]); setRecommendations({});
  };
  const resetBelowDepartment = () => {
    setProgramType("bachelor"); setPostgraduateProgram("");
    setAcademicYear(""); setLevelName(""); setTermName("");
    setSavedRows([]); setSkippedRows([]); setRecommendations({});
  };
  const onSelectFaculty    = (id) => { setSelectedFacultyId(id);    resetBelowFaculty();     if (id) fetchDepts(id); };
  const onSelectDepartment = (id) => { setSelectedDepartmentId(id); resetBelowDepartment();  if (id) fetchAcademicPeriods(programType, postgraduateProgram); };
  const fetchDepts = async (fid) => {
    setLoadingDeps(true);
    try { const res=await fetch(`${API_BASE}/departments/${fid}`); const d=await res.json(); setDepartments(Array.isArray(d)?d:[]); }
    catch { setDepartments([]); showToast("مشكلة في تحميل الأقسام","error"); }
    finally { setLoadingDeps(false); }
  };

  const computeAndSaveResult = async () => {
    if (!canComputeTerm) return showToast("كمّل الاختيارات أولاً","error");
    if (hasSavedResults && !window.confirm("النتائج محفوظة بالفعل.\n\nهل تريد إعادة الحساب؟")) return;
    setComputingResult(true); setSkippedRows([]); setSavedRows([]);
    try {
      const res = await fetch(`${API_BASE}/term-results/calculate-save`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          faculty_id: Number(selectedFacultyId), department_id: Number(selectedDepartmentId),
          program_type: programType,
          postgraduate_program: programType==="postgraduate"?postgraduateProgram.trim():null,
          academic_year: academicYear.trim(), level_name: levelName.trim(), term_name: termName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error||"فشل حساب النتيجة");
      setSavedRows(Array.isArray(data.saved)?data.saved:[]);
      setSkippedRows(Array.isArray(data.skipped)?data.skipped:[]);
      setHasSavedResults(true);
      showToast(data.message||"تم حساب النتائج");
    } catch (e) { showToast(e.message||"مشكلة في حساب النتيجة","error"); }
    finally { setComputingResult(false); }
  };

  const loadSavedResult = async () => {
    if (!canComputeTerm) return;
    setLoadingResult(true); setSkippedRows([]); setSavedRows([]);
    try {
      const qs =
        `faculty_id=${encodeURIComponent(selectedFacultyId)}` +
        `&department_id=${encodeURIComponent(selectedDepartmentId)}` +
        `&program_type=${encodeURIComponent(programType)}` +
        (programType==="postgraduate"?`&postgraduate_program=${encodeURIComponent(postgraduateProgram.trim())}`:`&postgraduate_program=`) +
        `&academic_year=${encodeURIComponent(academicYear.trim())}` +
        `&level_name=${encodeURIComponent(levelName.trim())}` +
        `&term_name=${encodeURIComponent(termName.trim())}`;
      const res  = await fetch(`${API_BASE}/term-results/list?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error||"فشل تحميل النتيجة");
      const rows = Array.isArray(data)?data:[];
      setSavedRows(rows); setHasSavedResults(rows.length>0);
    } catch (e) { showToast(e.message||"مشكلة في تحميل النتيجة","error"); }
    finally { setLoadingResult(false); }
  };

  useEffect(() => { if (canComputeTerm) loadSavedResult(); }, [canComputeTerm]);

const printResults = (mode = 'letter') => {
  if (savedRows.length === 0) {
    return showToast("لا توجد نتائج للطباعة بعد", "error");
  }

  const isLetterMode = mode === 'letter';

  let programTypeText = "";
  if (programType === "diploma") programTypeText = "دبلوم";
  else if (programType === "bachelor") programTypeText = "بكالوريوس";
  else if (programType === "postgraduate") programTypeText = "دراسات عليا";

  const programNameText = (programType === "postgraduate" && postgraduateProgram.trim())
    ? ` - ${postgraduateProgram.trim()}`
    : "";

  const honorStudents = savedRows
    .filter(r => Number(r.term_gpa || 0) >= 3.00)
    .sort((a, b) => Number(b.cumulative_gpa || 0) - Number(a.cumulative_gpa || 0));

  const allStudents = [...savedRows].sort((a, b) => Number(b.term_gpa || 0) - Number(a.term_gpa || 0));

  const facultyName = faculties.find(f => f.id === Number(selectedFacultyId))?.faculty_name || "غير محدد";
  const departmentName = departments.find(d => d.id === Number(selectedDepartmentId))?.department_name || "غير محدد";

  const commonHeader = `
    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid #ccc;">
      <h1 style="margin: 0; color: #0a3753; font-size: 22px;">
        جامعة بورتسودان الأهلية
      </h1>
      <p style="margin: 8px 0 4px; font-weight: bold; font-size: 16px;">
        ${facultyName} - ${departmentName}
      </p>
      <p style="margin: 4px 0; font-size: 14px; font-weight: bold;">
        ${programTypeText}${programNameText}
      </p>
      <p style="margin: 4px 0; font-size: 14px;">
        السنة الدراسية: ${academicYear} | المستوى: ${levelName} | الفصل: ${termName}
      </p>
    </div>
  `;

  // صفحة الشرف
  let honorPage = '';
  if (honorStudents.length > 0) {
    honorPage = `
      <div style="direction: rtl; font-family: 'Cairo', 'Tajawal', sans-serif; padding: 30px; font-size: 14px; break-after: page; page-break-after: always;">
        ${commonHeader}
        <h2 style="color: #0a3753; text-align: center; margin: 35px 0 25px; font-size: 18px;">
          قائمة الشرف
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; break-inside: avoid; page-break-inside: avoid;">
          <thead>
            <tr style="background: #6e6e6e; color: white;">
              <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">#</th>
              <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الاسم</th>
              <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الرقم الجامعي</th>
              <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الموقف الأكاديمي</th>
              <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">GPA فصلي</th>
              <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">GPA تراكمي</th>
            </tr>
          </thead>
          <tbody>
            ${honorStudents.map((r, i) => `
              <tr style="background: ${i % 2 === 0 ? '#f8f9fa' : '#ffffff'}; break-inside: avoid;">
                <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${i + 1}</td>
                <td style="padding: 11px; border: 1px solid #ddd;">${r.full_name}</td>
                <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${r.university_id}</td>
                <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${r.academic_status || 'غير محدد'}</td>
                <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${Number(r.term_gpa || 0).toFixed(2)}</td>
                <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${Number(r.cumulative_gpa || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // صفحة النتائج العامة
  const mainResultsPage = `
    <div style="direction: rtl; font-family: 'Cairo', 'Tajawal', sans-serif; padding: 30px; font-size: 14px; break-after: page;">
      ${commonHeader}
      <h2 style="color: #0a3753; text-align: center; margin: 35px 0 25px; font-size: 18px;">
        نتائج الطلاب
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; break-inside: avoid; page-break-inside: avoid;">
        <thead>
          <tr style="background: #6e6e6e; color: white;">
            <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">#</th>
            <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الاسم</th>
            <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الرقم الجامعي</th>
            <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الموقف الأكاديمي</th>
            <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">GPA فصلي</th>
            <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">GPA تراكمي</th>
          </tr>
        </thead>
        <tbody>
          ${allStudents.map((r, i) => `
            <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8f9fa'}; break-inside: avoid;">
              <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${i + 1}</td>
              <td style="padding: 11px; border: 1px solid #ddd;">${r.full_name}</td>
              <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${r.university_id}</td>
              <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${r.academic_status || 'غير محدد'}</td>
              <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${Number(r.term_gpa || 0).toFixed(2)}</td>
              <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${Number(r.cumulative_gpa || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // تحضير المواد
  const allCourses = new Set();
  Object.values(detailedGrades).forEach(grades => {
    grades.forEach(grade => {
      if (grade.course_name) allCourses.add(grade.course_name);
    });
  });
  const uniqueCourses = Array.from(allCourses).sort();

  if (uniqueCourses.length === 0) {
    showToast("لا توجد أسماء مواد متاحة للعرض", "error");
    return;
  }

  // صفحة التفاصيل
  const detailsPage = `
    <div style="direction: rtl; font-family: 'Cairo', 'Tajawal', sans-serif; padding: 30px; font-size: 14px;">
      ${commonHeader}
      <h2 style="color: #0a3753; text-align: center; margin: 35px 0 25px; font-size: 18px;">
        تفاصيل درجات المواد ${isLetterMode ? '(الحرفية)' : '(الرقمية)'}
      </h2>

      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; break-inside: auto;">
        <thead>
          <tr style="background: #6e6e6e; color: white;">
            <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">#</th>
            <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الاسم</th>
            <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الرقم الجامعي</th>
            <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الموقف الأكاديمي</th>
            ${uniqueCourses.map(courseName => `
              <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px; text-align: center;">
                ${courseName}
              </th>
            `).join('')}

            ${Object.values(repeatedCoursesMap).some(arr => arr.length > 0) ? `
              <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">إزالة الرسوب</th>
            ` : ''}
          </tr>
        </thead>
        <tbody>
          ${allStudents.map((r, i) => {
            const studentGrades = detailedGrades[r.student_id] || [];
            const gradesMap = {};
            studentGrades.forEach(grade => {
              if (grade.course_name) gradesMap[grade.course_name] = grade;
            });

            const repeatedData = repeatedCoursesMap[r.student_id] || [];
            let repeatedDisplay = "—";
            if (repeatedData.length > 0) {
              repeatedDisplay = repeatedData.map(item => `
                ${item.course_name}: 
                <strong>${item.grade_letter || '—'}</strong> 
                (${item.total_mark ?? '—'})
              `).join("<br>");
            }

            return `
              <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8f9fa'}; break-inside: avoid;">
                <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${i + 1}</td>
                <td style="padding: 11px; border: 1px solid #ddd;">${r.full_name}</td>
                <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${r.university_id}</td>
                <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${r.academic_status || 'غير محدد'}</td>

                ${uniqueCourses.map(courseName => {
                  const grade = gradesMap[courseName];
                  if (!grade) {
                    return `<td style="padding: 11px; border: 1px solid #ddd; text-align: center;">—</td>`;
                  }

                  const displayValue = isLetterMode 
                    ? (grade.grade_letter || '—') 
                    : (grade.total_mark ?? '—');

                  return `
                    <td style="padding: 11px; border: 1px solid #ddd; text-align: center; font-weight: bold; font-size: 13px;">
                      ${displayValue}
                    </td>
                  `;
                }).join('')}

                ${Object.values(repeatedCoursesMap).some(arr => arr.length > 0) ? `
                  <td style="padding: 11px; border: 1px solid #ddd; text-align: right; font-size: 12px; font-weight: bold; line-height: 1.6;">
                    ${repeatedDisplay}
                  </td>
                ` : ''}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  const fullContent = honorPage + mainResultsPage + detailsPage;

  const element = document.createElement('div');
  element.innerHTML = fullContent;

  const options = {
    margin: 0.5,
    filename: `نتائج_${isLetterMode ? 'حرفية' : 'رقمية'}_${academicYear.replace('/', '-')}_${termName.replace(/ /g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().from(element).set(options).save();

  showToast(`جاري إنشاء ملف PDF ${isLetterMode ? 'الحرفي' : 'الرقمي'}...`, "success");
};

  return (
    <div className="admission-layout">
      <header className="library-header">
        <div className="library-header-title"><span style={{fontSize:22}}></span><span> حساب النتيجة</span></div>
        <button onClick={()=>navigate(-1)} style={{background:"none",border:"none",cursor:"pointer",color:"white",fontSize:"26px",display:"flex",alignItems:"center"}} title="رجوع"><IoArrowBack /></button>
      </header>

      <main className="library-main">
        <div className="library-container">

          <div className="card" style={{marginTop:14}}>
            <h2 className="card-title">اختيار الفصل</h2>
            <div className="two-col-grid" style={{marginBottom:12}}>

              <div className="input-group">
                <label className="input-label">الكلية</label>
                <select className="input-field" value={selectedFacultyId} onChange={e=>onSelectFaculty(e.target.value)} disabled={loadingFaculties}>
                  <option value="">{loadingFaculties?"جارٍ التحميل...":"— اختار —"}</option>
                  {faculties.map(f=><option key={f.id} value={f.id}>{f.faculty_name}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">القسم</label>
                <select className="input-field" value={selectedDepartmentId} onChange={e=>onSelectDepartment(e.target.value)} disabled={!canPickDepartment||loadingDeps}>
                  <option value="">{!canPickDepartment?"اختار كلية أولاً":loadingDeps?"جارٍ التحميل...":"— اختار —"}</option>
                  {departments.map(d=><option key={d.id} value={d.id}>{d.department_name}</option>)}
                </select>
              </div>

              <div className="input-group" style={{gridColumn:"1 / -1"}}>
                <label className="input-label">نوع البرنامج</label>
                <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                  {getAllowedProgramTypes().map(type=>(
                    <label key={type} style={{display:"flex",gap:8,alignItems:"center",fontWeight:700,opacity:!canPickProgramType?0.6:1,cursor:!canPickProgramType?"not-allowed":"pointer"}}>
                      <input type="radio" name="pgTypeResult" value={type} checked={programType===type} onChange={e=>setProgramType(e.target.value)} disabled={!canPickProgramType}/>
                      {type==="diploma"&&"دبلوم"}{type==="bachelor"&&"بكالوريوس"}{type==="postgraduate"&&"دراسات عليا"}
                    </label>
                  ))}
                </div>
              </div>

              {programType==="postgraduate"&&(
                <div className="input-group" style={{gridColumn:"1 / -1"}}>
                  <label className="input-label">اسم برنامج الدراسات العليا</label>
                  <input className="input-field" dir="rtl" list="pg_res" placeholder="مثال: ماجستير إدارة أعمال"
                    value={postgraduateProgram} onChange={e=>setPostgraduateProgram(e.target.value)} disabled={!canPickProgramType}/>
                  <datalist id="pg_res">{pgSmart.programs.map((p,i)=><option key={i} value={p}/>)}</datalist>
                </div>
              )}

              <div className="input-group">
                <label className="input-label">السنة الدراسية</label>
                <input className="input-field" dir="rtl" list="yr_res" placeholder="مثال: 2024/2025" value={academicYear}
                  onChange={e=>{setAcademicYear(e.target.value);setLevelName("");setTermName("");setSavedRows([]);}} disabled={!canPickYear||loadingPeriods}/>
                <datalist id="yr_res">{yearOptions.map(x=><option key={x} value={x}/>)}</datalist>
              </div>

              <div className="input-group">
                <label className="input-label">{programType==="postgraduate"?"الدفعة":"المستوى"}</label>
                <input className="input-field" dir="rtl" list="lv_res"
                  placeholder={programType==="postgraduate"?"مثال: الدفعة الأولى":"مثال: المستوى الأول"} value={levelName}
                  onChange={e=>{setLevelName(e.target.value);setTermName("");setSavedRows([]);}} disabled={!canPickLevel}/>
                <datalist id="lv_res">{levelOptions.map(x=><option key={x} value={x}/>)}</datalist>
              </div>

              <div className="input-group">
                <label className="input-label">الفصل الدراسي</label>
                <input className="input-field" dir="rtl" list="tm_res" placeholder="مثال: الفصل الأول" value={termName}
                  onChange={e=>{setTermName(e.target.value);setSavedRows([]);}} disabled={!canPickTerm}/>
                <datalist id="tm_res">{termOptions.map(x=><option key={x} value={x}/>)}</datalist>
              </div>
            </div>
          </div>

          <div className="card" style={{marginTop:14}}>
            <h2 className="card-title">حساب النتيجة (GPA + تصنيف)</h2>

            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
              <button className="btn btn-primary" onClick={computeAndSaveResult} disabled={!canComputeTerm||computingResult}>
                {computingResult?"جاري الحساب...":"حساب النتيجة"}
              </button>
              {savedRows.length>0&&(<>
                <button className="btn btn-primary" onClick={()=>printResults('letter')} disabled={loadingDetails}>طباعة الحرفية</button>
                <button className="btn btn-success" onClick={()=>printResults('numeric')} disabled={loadingDetails}>طباعة الرقمية</button>
                <button className="btn" onClick={saveRecommendations} disabled={savingRecs}
                  style={{background:"#0a3753",color:"#fff",fontWeight:700}}>
                  {savingRecs?"جاري الحفظ...":" حفظ الملاحظات "}
                </button>
                {savedRows.length > 0 && (
  <button
    className="btn"
    onClick={() => setShowStats(!showStats)}
    style={{
      background: showStats ? "#0a998d" : "#0f766e",
      color: "#fff",
      fontWeight: 700,
      marginLeft: 8
    }}
  >
    {showStats ? "إخفاء الإحصائيات" : " عرض الإحصائيات"}
  </button>
)}
              </>)}
              <span style={{color:"#6b7280",fontWeight:800,alignSelf:"center"}}>عدد النتائج: {savedRows.length}</span>
            </div>

            {/* بطاقات الحالات */}
            {savedRows.length>0&&(
              <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
                {[
                  {label:"ناجح",color:"#16a34a",bg:"#f0fdf4"},
                  {label:"ملحق",color:"#0369a1",bg:"#eff6ff"},
                  {label:"تعليق دراسة",color:"#b45309",bg:"#fffbeb"},
                  {label:"إعادة",color:"#ea580c",bg:"#fff7ed"},
                  {label:"فصل",color:"#7c3aed",bg:"#fdf4ff"},
                ].map(item=>{
                  const cnt=countByStatus(item.label);
                  if(cnt===0)return null;
                  return <div key={item.label} style={{background:item.bg,border:`1px solid ${item.color}`,borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:700}}>
                    <span style={{color:item.color}}>{item.label}: {cnt}</span>
                  </div>;
                })}
                {bothTotalHours>0&&(
                  <div style={{background:"#f3f4f6",border:"1px solid #d1d5db",borderRadius:8,padding:"6px 12px",fontSize:11,color:"#374151"}}>
                    إجمالي الفصلين: {bothTotalHours}س &nbsp;|&nbsp; حد الإعادة: {bothOneThird}–{bothTwoThirds}س
                  </div>
                )}
              </div>
            )}

            {skippedRows.length>0&&(
              <div style={{marginTop:10,overflowX:"auto"}}>
                <div style={{color:"#b91c1c",fontWeight:900,marginBottom:8}}>يوجد (مواد/درجات ناقصة)</div>
                <table className="simple-table" style={{width:"100%"}}>
                  <thead><tr><th>#</th><th>الطالب</th><th>الرقم الجامعي</th><th>الموقف الأكاديمي</th><th>المواد الناقصة</th><th>السبب</th></tr></thead>
                  <tbody>{skippedRows.map((m,idx)=>(
                    <tr key={idx}><td>{idx+1}</td><td>{m.full_name}</td><td>{m.university_id}</td>
                      <td>{m.academic_status}</td><td>{m.missing_courses}</td><td>{m.reason}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}

            <div style={{overflowX:"auto",marginTop:10}}>
              {!canComputeTerm?(
                <p style={{color:"#6b7280"}}>كمّل اختيار الفصل أولاً.</p>
              ):computingResult||loadingResult?(
                <p>جارٍ التحميل...</p>
              ):savedRows.length===0?(
                <p style={{color:"#6b7280"}}>لا توجد نتيجة محفوظة/محسوبة لهذا الفصل بعد.</p>
              ):(
<table style={{
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",   // ← المفتاح: يوزع الأعمدة بالتساوي
  fontSize: 11,
}}>
  <colgroup>
    <col style={{width:"3%"}}/>   {/* # */}
    <col style={{width:"12%"}}/>  {/* الاسم */}
    <col style={{width:"8%"}}/>   {/* الرقم الجامعي */}
    <col style={{width:"7%"}}/>   {/* الموقف الأكاديمي */}
    <col style={{width:"7%"}}/>   {/* حالة النتيجة */}
    <col style={{width:"6%"}}/>   {/* GPA فصلي */}
    <col style={{width:"6%"}}/>   {/* GPA تراكمي */}
    <col style={{width:"6%"}}/>   {/* نقاط الفصل */}
    <col style={{width:"6%"}}/>   {/* ساعات الفصل */}
    <col style={{width:"6%"}}/>   {/* رسوب الفصل */}
    <col style={{width:"7%"}}/>   {/* ساعات الفصلين */}
    <col style={{width:"7%"}}/>   {/* رسوب الفصلين */}
    <col style={{width:"15%"}}/>  {/* ملاحظات */}
  </colgroup>
  <thead>
    <tr style={{background:"#1e4a6e", color:"#fff"}}>
      {[
        "#","الاسم","الرقم الجامعي","الموقف الأكاديمي","حالة النتيجة",
        "GPA فصلي","GPA تراكمي","نقاط الفصل","ساعات الفصل",
        "رسوب الفصل","ساعات الفصلين","رسوب الفصلين"," ملاحظات"
      ].map(h => (
        <th key={h} style={{
          padding:"6px 4px", border:"1px solid #e5e7eb",
          fontSize:10, fontWeight:700, textAlign:"center",
          wordBreak:"break-word", whiteSpace:"normal"
        }}>{h}</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {savedRows.map((r, idx) => {
      const {color, bg} = statusStyle(r.result_status);
      const cellStyle = {
        padding:"5px 4px", border:"1px solid #e5e7eb",
        textAlign:"center", fontSize:11,
        wordBreak:"break-word", whiteSpace:"normal"
      };
      return (
        <tr key={`${r.student_id}-${idx}`} style={{background: idx%2===0 ? bg||"#fff" : bg||"#f9fafb"}}>
          <td style={cellStyle}>{idx+1}</td>
          <td style={{...cellStyle, textAlign:"right", paddingRight:6}}>{r.full_name}</td>
          <td style={cellStyle}>{r.university_id}</td>
          <td style={cellStyle}>{r.academic_status}</td>
          <td style={cellStyle}>
            <span style={{color, fontWeight:"bold", fontSize:12}}>{r.result_status||"—"}</span>
          </td>
          <td style={cellStyle}>{r.term_gpa ?? "—"}</td>
          <td style={cellStyle}>{r.cumulative_gpa ?? "—"}</td>
          <td style={cellStyle}>{r.term_total_points ?? "—"}</td>
          <td style={cellStyle}>{r.term_total_hours ?? "—"}</td>
          <td style={{...cellStyle, color: Number(r.failed_hours||0)>0 ? '#dc2626':'#16a34a', fontWeight:'bold'}}>
            {r.failed_hours ?? "—"}
          </td>
          <td style={cellStyle}>{r.both_total_hours ?? "—"}</td>
          <td style={{...cellStyle, color: Number(r.both_failed_hours||0)>0 ? '#ea580c':'#16a34a', fontWeight:'bold'}}>
            {r.both_failed_hours ?? "—"}
          </td>
          <td style={{...cellStyle, textAlign:"right"}}>
            <textarea
              rows={2}
              value={recommendations[r.student_id]||""}
              onChange={e => setRecommendations(prev=>({...prev,[r.student_id]:e.target.value}))}
              placeholder="اكتب الملاحظة هنا.."
              style={{
                width:"100%", fontSize:10, border:"1px solid #d1d5db",
                borderRadius:4, padding:"2px 4px", resize:"vertical",
                fontFamily:"inherit", direction:"rtl", lineHeight:1.4
              }}
            />
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
              )}
{/* ====================== قسم الإحصائيات والرسوم البيانية ====================== */}
{showStats && Object.keys(courseStats).length > 0 && (
  <div className="card" style={{ marginTop: 20, background: "#f8fafc" }}>
    <h3 style={{ 
      color: "#0a3753", 
      marginBottom: 24, 
      textAlign: "center", 
      fontSize: "19px" 
    }}>
       إحصائيات النجاح والرسوب حسب المادة
    </h3>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",   // ← يسمح بـ 5 في الصف
      gap: 16
    }}>
      {Object.entries(courseStats).map(([courseName, data]) => {
        const passRate = data.total > 0 ? ((data.passed / data.total) * 100).toFixed(1) : 0;

        const barData = {
          labels: [courseName],
          datasets: [
            { label: "ناجحين", data: [data.passed], backgroundColor: "#16a34a" },
            { label: "راسبين", data: [data.failed], backgroundColor: "#dc2626" },
          ],
        };

        const doughnutData = {
          labels: ["ناجحين", "راسبين"],
          datasets: [{
            data: [data.passed, data.failed],
            backgroundColor: ["#16a34a", "#dc2626"],
            borderWidth: 2,
          }],
        };

        return (
          <div key={courseName} style={{
            background: "#fff",
            borderRadius: 10,
            padding: 12,
            boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0"
          }}>
            <h4 style={{ 
              marginBottom: 12, 
              color: "#1e2937", 
              fontSize: 14.5, 
              fontWeight: 700,
              textAlign: "center"
            }}>
              {courseName}
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Bar Chart - صغير جداً */}
              <div style={{ height: "110px" }}>
                <Bar 
                  data={barData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false } 
                    },
                    scales: {
                      y: { beginAtZero: true, ticks: { font: { size: 9 } } },
                      x: { ticks: { font: { size: 10 } } }
                    }
                  }} 
                />
              </div>

              {/* Doughnut + نسبة - أصغر */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "95px", height: "95px" }}>
                  <Doughnut 
                    data={doughnutData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "75%",
                      plugins: { legend: { display: false } }
                    }} 
                  />
                </div>

                <div style={{ marginTop: 8, textAlign: "center" }}>
                  <strong style={{ fontSize: 19, color: "#16a34a" }}>{passRate}%</strong>
                  <p style={{ margin: "2px 0 4px", fontSize: 12.5, color: "#64748b" }}>
                    نجاح
                  </p>
                  <p style={{ fontSize: 12.5, color: "#334155" }}>
                    {data.passed} / {data.total}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
            </div>
          </div>
        </div>
      </main>

      {toast&&(
        <div className={"toast "+(toast.type==="error"?"toast-error":"toast-success")}>{toast.message}</div>
      )}
    </div>
  );
};

export default TermResult;