// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { IoArrowBack } from "react-icons/io5";
// import html2pdf from 'html2pdf.js';

// const API_BASE = "http://localhost:5000/api";

// const getAllowedFaculties = () => {
//   try {
//     const user = JSON.parse(sessionStorage.getItem('user') || '{}');
//     if (user.role === 'admin') return null;
//     return Array.isArray(user.allowed_faculties) ? user.allowed_faculties : [];
//   } catch (e) {
//     console.warn("مشكلة في قراءة allowed_faculties", e);
//     return [];
//   }
// };

// // ====================== صلاحيات نوع البرنامج ======================
// const getAllowedProgramTypes = () => {
//   try {
//     const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
//     if (user.role === 'admin') {
//       return ["diploma", "bachelor", "postgraduate"];
//     }

//     const allowed = Array.isArray(user.allowed_program_types) 
//       ? user.allowed_program_types 
//       : ["bachelor"];   // default آمن

//     return allowed;
//   } catch (e) {
//     console.warn("مشكلة في قراءة allowed_program_types", e);
//     return ["bachelor"];
//   }
// };

// const TermResult = () => {
//   const navigate = useNavigate();

//   const [toast, setToast] = useState(null);
//   const showToast = (message, type = "success") => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 4000);
//   };

//   // ===== Lists
//   const [faculties, setFaculties] = useState([]);
//   const [departments, setDepartments] = useState([]);

//   const [periods, setPeriods] = useState([]);
//   const [yearOptions, setYearOptions] = useState([]);
//   const [levelOptions, setLevelOptions] = useState([]);
//   const [termOptions, setTermOptions] = useState([]);

//   const pgSmart = usePostgradProgramsSmartList();

//   // ===== Filters
//   const [selectedFacultyId, setSelectedFacultyId] = useState("");
//   const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

//   const [programType, setProgramType] = useState("bachelor"); 
//   const [postgraduateProgram, setPostgraduateProgram] = useState("");

//   const [academicYear, setAcademicYear] = useState("");
//   const [levelName, setLevelName] = useState("");
//   const [termName, setTermName] = useState("");

//   // ===== Result Data
//   const [savedRows, setSavedRows] = useState([]);
//   const [skippedRows, setSkippedRows] = useState([]);
//   const [hasSavedResults, setHasSavedResults] = useState(false);

//   // ===== Loading flags
//   const [loadingFaculties, setLoadingFaculties] = useState(false);
//   const [loadingDeps, setLoadingDeps] = useState(false);
//   const [loadingPeriods, setLoadingPeriods] = useState(false);

//   const [computingResult, setComputingResult] = useState(false);
//   const [loadingResult, setLoadingResult] = useState(false);

//   // ===== Step logic
//   const canPickDepartment = !!selectedFacultyId;
//   const canPickProgramType = !!selectedDepartmentId;

//   const canPickPostgraduateProgram = programType === "postgraduate";
// const canProceedAfterProgram =
//     (programType === "bachelor" || programType === "diploma") 
//       ? true 
//       : !!postgraduateProgram.trim();

//   const canPickYear = canPickProgramType && canProceedAfterProgram;
//   const canPickLevel = !!academicYear.trim();
//   const canPickTerm = !!levelName.trim();
  
//   const [detailedGrades, setDetailedGrades] = useState({});
//   const [repeatedCoursesMap, setRepeatedCoursesMap] = useState({});
//   const [loadingDetails, setLoadingDetails] = useState(false);

//   const canComputeTerm =
//     selectedFacultyId &&
//     selectedDepartmentId &&
//     canProceedAfterProgram &&
//     academicYear.trim() &&
//     levelName.trim() &&
//     termName.trim();


//     useEffect(() => {
//     if (programType === "postgraduate") {
//       pgSmart.fetchPrograms();
//     } else {
//       setPostgraduateProgram("");
//     }
//   }, [programType]);
//   // =========================
//   // Load faculties
//   // =========================
// useEffect(() => {
//   const loadFaculties = async () => {
//     setLoadingFaculties(true);
//     try {
//       const res = await fetch(`${API_BASE}/faculties-list`);
//       const allFaculties = await res.json();

//       const allowed = getAllowedFaculties();

//       let filtered = allFaculties;
//       if (allowed !== null) {
//         filtered = allFaculties.filter(fac => allowed.includes(fac.id));
//       }

//       setFaculties(Array.isArray(filtered) ? filtered : []);

//       if (filtered.length === 0 && allowed !== null) {
//         showToast("لا توجد كليات مسموح لك الوصول إليها", "error");
//       }

//       // إعادة التحقق من الكلية المختارة
//       if (selectedFacultyId) {
//         const stillAllowed = filtered.find(f => f.id === Number(selectedFacultyId));
//         if (!stillAllowed) {
//           setSelectedFacultyId("");
//         }
//       }
//     } catch (e) {
//       console.error(e);
//       showToast("مشكلة في تحميل الكليات", "error");
//     } finally {
//       setLoadingFaculties(false);
//     }
//   };

//   loadFaculties();
// }, []);

//   useEffect(() => {
//   if (savedRows.length === 0 || !canComputeTerm) {
//     setRepeatedCoursesMap({});
//     return;
//   }

// const fetchRepeated = async () => {
//   const map = {};

//   try {
//     for (const student of savedRows) {
//       const sid = student.student_id;

//       const params = new URLSearchParams({
//         student_id: sid,
//         academic_year: academicYear.trim(),
//         level_name: levelName.trim(),
//         term_name: termName.trim(),
//         program_type: programType,
//       });

//       if (programType === "postgraduate" && postgraduateProgram.trim()) {
//         params.append("postgraduate_program", postgraduateProgram.trim());
//       }

//       const url = `${API_BASE}/student-repeated-courses?${params.toString()}`;
//       console.log(`جاري طلب مواد إعادة الطالب ${sid}: ${url}`);

//       const res = await fetch(url);

//       console.log(`حالة الرد للطالب ${sid}: ${res.status} ${res.statusText}`);

//       if (!res.ok) {
//         const errorText = await res.text();
//         console.warn(`فشل جلب مواد إعادة الطالب ${sid} - الرد:`, errorText);
//         map[sid] = [];
//         continue;
//       }

//       const data = await res.json();
//       console.log(`البيانات اللي رجعت للطالب ${sid}:`, data);

//       map[sid] = Array.isArray(data.repeated) ? data.repeated : [];
//     }

//     setRepeatedCoursesMap(map);
//   } catch (err) {
//     console.error("خطأ عام في fetchRepeated:", err);
//   }
// };

//   fetchRepeated();
// }, [savedRows, canComputeTerm, academicYear, levelName, termName, programType, postgraduateProgram]);


// function usePostgradProgramsSmartList() {
//   const [programs, setPrograms] = useState([]);

//   const fetchPrograms = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/postgraduate-programs`);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error || "فشل تحميل البرامج");
//       setPrograms(Array.isArray(data) ? data : []);
//     } catch (e) {
//       console.error(e);
//       setPrograms([]);
//     }
//   };

//   return { programs, fetchPrograms };
// }

//   // =========================
//   // Load departments
//   // =========================
//   const fetchDepartmentsByFaculty = async (facultyId) => {
//     if (!facultyId) return;
//     setLoadingDeps(true);
//     try {
//       const res = await fetch(`${API_BASE}/departments/${facultyId}`);
//       const data = await res.json();
//       setDepartments(Array.isArray(data) ? data : []);
//     } catch (e) {
//       console.error(e);
//       setDepartments([]);
//       showToast("مشكلة في تحميل الأقسام", "error");
//     } finally {
//       setLoadingDeps(false);
//     }
//   };

//   // =========================
//   // Load academic periods
//   // =========================
//   const fetchAcademicPeriods = async (pType, pgProg) => {
//     setLoadingPeriods(true);
//     try {
//       const pt = (pType || "bachelor").trim();
//       const pg = (pgProg || "").trim();

//       let url = `${API_BASE}/academic-periods?program_type=${encodeURIComponent(pt)}`;
//       if (pt === "postgraduate" && pg) url += `&postgraduate_program=${encodeURIComponent(pg)}`;

//       const res = await fetch(url);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error || "فشل تحميل الفترات");

//       const rows = Array.isArray(data) ? data : [];
//       setPeriods(rows);

//       const ys = Array.from(new Set(rows.map((r) => (r.academic_year || "").trim()).filter(Boolean)));
//       setYearOptions(ys);
//     } catch (e) {
//       console.error(e);
//       setPeriods([]);
//       setYearOptions([]);
//       setLevelOptions([]);
//       setTermOptions([]);
//     } finally {
//       setLoadingPeriods(false);
//     }
//   };

//   const rebuildLevelAndTermOptions = (rows, year, level) => {
//     const y = (year || "").trim();
//     const l = (level || "").trim();

//     const levels = Array.from(
//       new Set(
//         rows
//           .filter((r) => (r.academic_year || "").trim() === y)
//           .map((r) => (r.level_name || "").trim())
//           .filter(Boolean)
//       )
//     );
//     setLevelOptions(levels);

//     const terms = Array.from(
//       new Set(
//         rows
//           .filter((r) => (r.academic_year || "").trim() === y && (r.level_name || "").trim() === l)
//           .map((r) => (r.term_name || "").trim())
//           .filter(Boolean)
//       )
//     );
//     setTermOptions(terms);
//   };

//   useEffect(() => {
//     rebuildLevelAndTermOptions(periods, academicYear, levelName);
//   }, [periods, academicYear, levelName]);

//   useEffect(() => {
//     setAcademicYear("");
//     setLevelName("");
//     setTermName("");
//     setSavedRows([]);
//     setSkippedRows([]);

//     if (selectedDepartmentId) fetchAcademicPeriods(programType, postgraduateProgram);
//   }, [programType, postgraduateProgram]);

//   useEffect(() => {
//     if (programType !== "postgraduate") setPostgraduateProgram("");
//   }, [programType]);

//   // =========================
//   // Reset helpers
//   // =========================
//   const resetBelowFaculty = () => {
//     setDepartments([]);
//     setSelectedDepartmentId("");

//     setProgramType("bachelor");
//     setPostgraduateProgram("");

//     setAcademicYear("");
//     setLevelName("");
//     setTermName("");

//     setSavedRows([]);
//     setSkippedRows([]);
//   };

//   const resetBelowDepartment = () => {
//     setProgramType("bachelor");
//     setPostgraduateProgram("");

//     setAcademicYear("");
//     setLevelName("");
//     setTermName("");

//     setSavedRows([]);
//     setSkippedRows([]);
//   };

//   const onSelectFaculty = (facultyId) => {
//     setSelectedFacultyId(facultyId);
//     resetBelowFaculty();
//     if (facultyId) fetchDepartmentsByFaculty(facultyId);
//   };

//   const onSelectDepartment = (deptId) => {
//     setSelectedDepartmentId(deptId);
//     resetBelowDepartment();
//     if (deptId) fetchAcademicPeriods(programType, postgraduateProgram);
//   };

//   // =========================
//   // Result APIs
//   // =========================
// const computeAndSaveResult = async () => {
//     if (!canComputeTerm) return showToast("كمّل الاختيارات أولاً", "error");

//     if (hasSavedResults) {
//       const confirmed = window.confirm(
//         "النتائج محفوظة بالفعل لهذا الفصل.\n\nهل تريد إعادة الحساب والتجاوز على القديم؟"
//       );
//       if (!confirmed) return;
//     }

//     setComputingResult(true);
//     setSkippedRows([]);
//     setSavedRows([]);

//     try {
//       const payload = {
//         faculty_id: Number(selectedFacultyId),
//         department_id: Number(selectedDepartmentId),
//         program_type: programType,
//         postgraduate_program: programType === "postgraduate" ? postgraduateProgram.trim() : null,
//         academic_year: academicYear.trim(),
//         level_name: levelName.trim(),
//         term_name: termName.trim(),
//       };

//       const res = await fetch(`${API_BASE}/term-results/calculate-save`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error || "فشل حساب النتيجة");

//       setSavedRows(Array.isArray(data.saved) ? data.saved : []);
//       setSkippedRows(Array.isArray(data.skipped) ? data.skipped : []);
//       setHasSavedResults(true);   

//       showToast(data.message || "تم حساب النتائج", "success");
//     } catch (e) {
//       console.error(e);
//       showToast(e.message || "مشكلة في حساب النتيجة", "error");
//     } finally {
//       setComputingResult(false);
//     }
//   };

// const loadSavedResult = async () => {
//     if (!canComputeTerm) return;

//     setLoadingResult(true);
//     setSkippedRows([]);
//     setSavedRows([]);

//     try {
//       const qs =
//         `faculty_id=${encodeURIComponent(selectedFacultyId)}` +
//         `&department_id=${encodeURIComponent(selectedDepartmentId)}` +
//         `&program_type=${encodeURIComponent(programType)}` +
//         (programType === "postgraduate"
//           ? `&postgraduate_program=${encodeURIComponent(postgraduateProgram.trim())}`
//           : `&postgraduate_program=`) +
//         `&academic_year=${encodeURIComponent(academicYear.trim())}` +
//         `&level_name=${encodeURIComponent(levelName.trim())}` +
//         `&term_name=${encodeURIComponent(termName.trim())}`;

//       const res = await fetch(`${API_BASE}/term-results/list?${qs}`);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error || "فشل تحميل النتيجة");

//       const rows = Array.isArray(data) ? data : [];
//       setSavedRows(rows);
//       setHasSavedResults(rows.length > 0);   

//       // if (rows.length === 0) {
//       //   await computeAndSaveResult();
//       // }
//     } catch (e) {
//       console.error(e);
//       showToast(e.message || "مشكلة في تحميل النتيجة", "error");
//     } finally {
//       setLoadingResult(false);
//     }
//   };

// useEffect(() => {
//   if (!canComputeTerm) return;

//   // حمّل النتيجة تلقائياً عند اكتمال الاختيارات
//   loadSavedResult();
// }, [canComputeTerm]);

// // جلب تفاصيل درجات كل طالب بعد تحميل النتائج
// useEffect(() => {
//   if (savedRows.length === 0 || !canComputeTerm) {
//     setDetailedGrades({});
//     return;
//   }

//   const fetchStudentGrades = async () => {
//     setLoadingDetails(true);
//     const gradesMap = {};

//     try {
//       for (const student of savedRows) {
//         const sid = student.student_id;

//         const params = new URLSearchParams({
//           student_id: sid,
//           academic_year: academicYear.trim(),
//           level_name: levelName.trim(),
//           term_name: termName.trim(),
//           program_type: programType,
//         });

//         if (programType === "postgraduate" && postgraduateProgram.trim()) {
//           params.append("postgraduate_program", postgraduateProgram.trim());
//         }

//         const response = await fetch(`${API_BASE}/student-term-grades?${params.toString()}`);

//         if (!response.ok) {
//           console.warn(`فشل جلب درجات الطالب ${sid} - حالة: ${response.status}`);
//           gradesMap[sid] = [];
//           continue;
//         }

//         const data = await response.json();
//         gradesMap[sid] = Array.isArray(data) ? data : [];
//       }

//       setDetailedGrades(gradesMap);
//     } catch (err) {
//       console.error("خطأ أثناء جلب تفاصيل الدرجات:", err);
//       showToast("تعذر جلب تفاصيل درجات بعض الطلاب", "error");
//     } finally {
//       setLoadingDetails(false);
//     }
//   };

//   fetchStudentGrades();
// }, [savedRows, canComputeTerm, academicYear, levelName, termName, programType, postgraduateProgram]);

// //  طباعه النتيجه
// const printResults = (mode = 'letter') => {
//   if (savedRows.length === 0) {
//     return showToast("لا توجد نتائج للطباعة بعد", "error");
//   }

//   const isLetterMode = mode === 'letter';

//   let programTypeText = "";
//   if (programType === "diploma") programTypeText = "دبلوم";
//   else if (programType === "bachelor") programTypeText = "بكالوريوس";
//   else if (programType === "postgraduate") programTypeText = "دراسات عليا";

//   const programNameText = (programType === "postgraduate" && postgraduateProgram.trim())
//     ? ` - ${postgraduateProgram.trim()}`
//     : "";

//   const honorStudents = savedRows
//     .filter(r => Number(r.term_gpa || 0) >= 3.00)
//     .sort((a, b) => Number(b.cumulative_gpa || 0) - Number(a.cumulative_gpa || 0));

//   const allStudents = [...savedRows].sort((a, b) => Number(b.term_gpa || 0) - Number(a.term_gpa || 0));

//   const facultyName = faculties.find(f => f.id === Number(selectedFacultyId))?.faculty_name || "غير محدد";
//   const departmentName = departments.find(d => d.id === Number(selectedDepartmentId))?.department_name || "غير محدد";

//   const commonHeader = `
//     <div style="text-align: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid #ccc;">
//       <h1 style="margin: 0; color: #0a3753; font-size: 22px;">
//         جامعة بورتسودان الأهلية
//       </h1>
//       <p style="margin: 8px 0 4px; font-weight: bold; font-size: 16px;">
//         ${facultyName} - ${departmentName}
//       </p>
//       <p style="margin: 4px 0; font-size: 14px; font-weight: bold;">
//         ${programTypeText}${programNameText}
//       </p>
//       <p style="margin: 4px 0; font-size: 14px;">
//         السنة الدراسية: ${academicYear} | المستوى: ${levelName} | الفصل: ${termName}
//       </p>
//     </div>
//   `;

//   // صفحة الشرف
//   let honorPage = '';
//   if (honorStudents.length > 0) {
//     honorPage = `
//       <div style="direction: rtl; font-family: 'Cairo', 'Tajawal', sans-serif; padding: 30px; font-size: 14px; break-after: page; page-break-after: always;">
//         ${commonHeader}
//         <h2 style="color: #0a3753; text-align: center; margin: 35px 0 25px; font-size: 18px;">
//           قائمة الشرف
//         </h2>
//         <table style="width: 100%; border-collapse: collapse; margin-top: 15px; break-inside: avoid; page-break-inside: avoid;">
//           <thead>
//             <tr style="background: #6e6e6e; color: white;">
//               <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">#</th>
//               <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الاسم</th>
//               <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الرقم الجامعي</th>
//               <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الموقف الأكاديمي</th>
//               <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">GPA فصلي</th>
//               <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">GPA تراكمي</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${honorStudents.map((r, i) => `
//               <tr style="background: ${i % 2 === 0 ? '#f8f9fa' : '#ffffff'}; break-inside: avoid;">
//                 <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${i + 1}</td>
//                 <td style="padding: 11px; border: 1px solid #ddd;">${r.full_name}</td>
//                 <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${r.university_id}</td>
//                 <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${r.academic_status || 'غير محدد'}</td>
//                 <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${Number(r.term_gpa || 0).toFixed(2)}</td>
//                 <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${Number(r.cumulative_gpa || 0).toFixed(2)}</td>
//               </tr>
//             `).join('')}
//           </tbody>
//         </table>
//       </div>
//     `;
//   }

//   // صفحة النتائج العامة
//   const mainResultsPage = `
//     <div style="direction: rtl; font-family: 'Cairo', 'Tajawal', sans-serif; padding: 30px; font-size: 14px; break-after: page;">
//       ${commonHeader}
//       <h2 style="color: #0a3753; text-align: center; margin: 35px 0 25px; font-size: 18px;">
//         نتائج الطلاب
//       </h2>
//       <table style="width: 100%; border-collapse: collapse; margin-top: 15px; break-inside: avoid; page-break-inside: avoid;">
//         <thead>
//           <tr style="background: #6e6e6e; color: white;">
//             <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">#</th>
//             <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الاسم</th>
//             <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الرقم الجامعي</th>
//             <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الموقف الأكاديمي</th>
//             <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">GPA فصلي</th>
//             <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">GPA تراكمي</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${allStudents.map((r, i) => `
//             <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8f9fa'}; break-inside: avoid;">
//               <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${i + 1}</td>
//               <td style="padding: 11px; border: 1px solid #ddd;">${r.full_name}</td>
//               <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${r.university_id}</td>
//               <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${r.academic_status || 'غير محدد'}</td>
//               <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${Number(r.term_gpa || 0).toFixed(2)}</td>
//               <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${Number(r.cumulative_gpa || 0).toFixed(2)}</td>
//             </tr>
//           `).join('')}
//         </tbody>
//       </table>
//     </div>
//   `;

//   // تحضير المواد
//   const allCourses = new Set();
//   Object.values(detailedGrades).forEach(grades => {
//     grades.forEach(grade => {
//       if (grade.course_name) allCourses.add(grade.course_name);
//     });
//   });
//   const uniqueCourses = Array.from(allCourses).sort();

//   if (uniqueCourses.length === 0) {
//     showToast("لا توجد أسماء مواد متاحة للعرض", "error");
//     return;
//   }

//   // صفحة التفاصيل
//   const detailsPage = `
//     <div style="direction: rtl; font-family: 'Cairo', 'Tajawal', sans-serif; padding: 30px; font-size: 14px;">
//       ${commonHeader}
//       <h2 style="color: #0a3753; text-align: center; margin: 35px 0 25px; font-size: 18px;">
//         تفاصيل درجات المواد ${isLetterMode ? '(الحرفية)' : '(الرقمية)'}
//       </h2>

//       <table style="width: 100%; border-collapse: collapse; margin-top: 15px; break-inside: auto;">
//         <thead>
//           <tr style="background: #6e6e6e; color: white;">
//             <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">#</th>
//             <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الاسم</th>
//             <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الرقم الجامعي</th>
//             <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">الموقف الأكاديمي</th>
//             ${uniqueCourses.map(courseName => `
//               <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px; text-align: center;">
//                 ${courseName}
//               </th>
//             `).join('')}

//             ${Object.values(repeatedCoursesMap).some(arr => arr.length > 0) ? `
//               <th style="padding: 12px; border: 1px solid #ccc; font-size: 13px;">إزالة الرسوب</th>
//             ` : ''}
//           </tr>
//         </thead>
//         <tbody>
//           ${allStudents.map((r, i) => {
//             const studentGrades = detailedGrades[r.student_id] || [];
//             const gradesMap = {};
//             studentGrades.forEach(grade => {
//               if (grade.course_name) gradesMap[grade.course_name] = grade;
//             });

//             const repeatedData = repeatedCoursesMap[r.student_id] || [];
//             let repeatedDisplay = "—";
//             if (repeatedData.length > 0) {
//               repeatedDisplay = repeatedData.map(item => `
//                 ${item.course_name}: 
//                 <strong>${item.grade_letter || '—'}</strong> 
//                 (${item.total_mark ?? '—'})
//               `).join("<br>");
//             }

//             return `
//               <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8f9fa'}; break-inside: avoid;">
//                 <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${i + 1}</td>
//                 <td style="padding: 11px; border: 1px solid #ddd;">${r.full_name}</td>
//                 <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${r.university_id}</td>
//                 <td style="padding: 11px; border: 1px solid #ddd; text-align: center;">${r.academic_status || 'غير محدد'}</td>

//                 ${uniqueCourses.map(courseName => {
//                   const grade = gradesMap[courseName];
//                   if (!grade) {
//                     return `<td style="padding: 11px; border: 1px solid #ddd; text-align: center;">—</td>`;
//                   }

//                   const displayValue = isLetterMode 
//                     ? (grade.grade_letter || '—') 
//                     : (grade.total_mark ?? '—');

//                   return `
//                     <td style="padding: 11px; border: 1px solid #ddd; text-align: center; font-weight: bold; font-size: 13px;">
//                       ${displayValue}
//                     </td>
//                   `;
//                 }).join('')}

//                 ${Object.values(repeatedCoursesMap).some(arr => arr.length > 0) ? `
//                   <td style="padding: 11px; border: 1px solid #ddd; text-align: right; font-size: 12px; font-weight: bold; line-height: 1.6;">
//                     ${repeatedDisplay}
//                   </td>
//                 ` : ''}
//               </tr>
//             `;
//           }).join('')}
//         </tbody>
//       </table>
//     </div>
//   `;

//   const fullContent = honorPage + mainResultsPage + detailsPage;

//   const element = document.createElement('div');
//   element.innerHTML = fullContent;

//   const options = {
//     margin: 0.5,
//     filename: `نتائج_${isLetterMode ? 'حرفية' : 'رقمية'}_${academicYear.replace('/', '-')}_${termName.replace(/ /g, '_')}.pdf`,
//     image: { type: 'jpeg', quality: 0.98 },
//     html2canvas: { scale: 2, useCORS: true, logging: false },
//     jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
//     pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
//   };

//   html2pdf().from(element).set(options).save();

//   showToast(`جاري إنشاء ملف PDF ${isLetterMode ? 'الحرفي' : 'الرقمي'}...`, "success");
// };

//   return (
//     <div className="admission-layout">
//       <header className="library-header">
//         <div className="library-header-title">
//           <span style={{ fontSize: 22 }}></span>
//           <span> حساب النتيجة</span>
//         </div>

//         <button
//           onClick={() => navigate(-1)}
//           style={{
//             background: "none",
//             border: "none",
//             cursor: "pointer",
//             color: "white",
//             fontSize: "26px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//           title="رجوع"
//         >
//           <IoArrowBack />
//         </button>
//       </header>

//       <main className="library-main">
//         <div className="library-container">
//           <div className="card" style={{ marginTop: 14 }}>
//             <h2 className="card-title">اختيار الفصل</h2>

//             <div className="two-col-grid" style={{ marginBottom: 12 }}>
//               <div className="input-group">
//                 <label className="input-label">الكلية</label>
//                 <select
//                   className="input-field"
//                   value={selectedFacultyId}
//                   onChange={(e) => onSelectFaculty(e.target.value)}
//                   disabled={loadingFaculties}
//                 >
//                   <option value="">{loadingFaculties ? "جارٍ التحميل..." : "— اختار —"}</option>
//                   {faculties.map((f) => (
//                     <option key={f.id} value={f.id}>
//                       {f.faculty_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="input-group">
//                 <label className="input-label">القسم</label>
//                 <select
//                   className="input-field"
//                   value={selectedDepartmentId}
//                   onChange={(e) => onSelectDepartment(e.target.value)}
//                   disabled={!canPickDepartment || loadingDeps}
//                 >
//                   <option value="">
//                     {!canPickDepartment ? "اختار كلية أولاً" : loadingDeps ? "جارٍ تحميل الأقسام..." : "— اختار —"}
//                   </option>
//                   {departments.map((d) => (
//                     <option key={d.id} value={d.id}>
//                       {d.department_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

// <div className="input-group" style={{ gridColumn: "1 / -1" }}>
//   <label className="input-label">نوع البرنامج</label>

//   <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
//     {getAllowedProgramTypes().map((type) => (
//       <label 
//         key={type}
//         style={{ 
//           display: "flex", 
//           gap: 8, 
//           alignItems: "center", 
//           fontWeight: 700,
//           opacity: !canPickProgramType ? 0.6 : 1,
//           cursor: !canPickProgramType ? "not-allowed" : "pointer"
//         }}
//       >
//         <input
//           type="radio"
//           name="programTypeGrades"
//           value={type}
//           checked={programType === type}
//           onChange={(e) => setProgramType(e.target.value)}
//           disabled={!canPickProgramType}
//         />
//         {type === "diploma" && "دبلوم"}
//         {type === "bachelor" && "بكالوريوس"}
//         {type === "postgraduate" && "دراسات عليا"}
//       </label>
//     ))}
//   </div>
// </div>

// {programType === "postgraduate" && (
//   <div className="input-group" style={{ gridColumn: "1 / -1" }}>
//     <label className="input-label">اسم برنامج الدراسات العليا</label>
//     <input
//       className="input-field"
//       dir="rtl"
//       list="postgrad_programs_list"
//       placeholder="مثال: ماجستير إدارة أعمال"
//       value={postgraduateProgram}
//       onChange={(e) => setPostgraduateProgram(e.target.value)}
//       disabled={!canPickProgramType}
//     />
//     <datalist id="postgrad_programs_list">
//       {pgSmart.programs.map((prog, idx) => (
//         <option key={idx} value={prog} />
//       ))}
//     </datalist>
//   </div>
// )}

//               <div className="input-group">
//                 <label className="input-label">السنة الدراسية</label>
//                 <input
//                   className="input-field"
//                   dir="rtl"
//                   list="years_list_result"
//                   placeholder="مثال: 2024/2025"
//                   value={academicYear}
//                   onChange={(e) => {
//                     setAcademicYear(e.target.value);
//                     setLevelName("");
//                     setTermName("");
//                     setSavedRows([]);
//                     setSkippedRows([]);
//                   }}
//                   disabled={!canPickYear || loadingPeriods}
//                 />
//                 <datalist id="years_list_result">
//                   {yearOptions.map((x) => (
//                     <option key={x} value={x} />
//                   ))}
//                 </datalist>
//               </div>

//               <div className="input-group">
//        <label className="input-label">
//     {programType === "postgraduate" ? "الدفعة" : "المستوى"}
//   </label>                <input
//                   className="input-field"
//                   dir="rtl"
//                   list="levels_list_result"
//     placeholder={programType === "postgraduate" ? "مثال: الدفعة الأولى" : "مثال: المستوى الأول"}
//                   value={levelName}
//                   onChange={(e) => {
//                     setLevelName(e.target.value);
//                     setTermName("");
//                     setSavedRows([]);
//                     setSkippedRows([]);
//                   }}
//                   disabled={!canPickLevel}
//                 />
//                 <datalist id="levels_list_result">
//                   {levelOptions.map((x) => (
//                     <option key={x} value={x} />
//                   ))}
//                 </datalist>
//               </div>

//               <div className="input-group">
//                 <label className="input-label">الفصل الدراسي</label>
//                 <input
//                   className="input-field"
//                   dir="rtl"
//                   list="terms_list_result"
//                   placeholder="مثال: الفصل الأول"
//                   value={termName}
//                   onChange={(e) => {
//                     setTermName(e.target.value);
//                     setSavedRows([]);
//                     setSkippedRows([]);
//                   }}
//                   disabled={!canPickTerm}
//                 />
//                 <datalist id="terms_list_result">
//                   {termOptions.map((x) => (
//                     <option key={x} value={x} />
//                   ))}
//                 </datalist>
//               </div>
//             </div>
//           </div>

//           <div className="card" style={{ marginTop: 14 }}>
//             <h2 className="card-title">حساب النتيجة (GPA + تصنيف)</h2>

//             <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
//               <button
//                 type="button"
//                 className="btn btn-primary"
//                 onClick={computeAndSaveResult}
//                 disabled={!canComputeTerm || computingResult}
//               >
//                 {computingResult ? "جاري الحساب ..." : "حساب النتيجة"}
//               </button>

// {savedRows.length > 0 && (
//   <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
//     <button
//       type="button"
//       className="btn btn-primary"
//       onClick={() => printResults('letter')}
//       disabled={computingResult || loadingResult || loadingDetails}
//     >
//        طباعة النتيجة الحرفية
//     </button>

//     <button
//       type="button"
//       className="btn btn-success"
//       onClick={() => printResults('numeric')}
//       disabled={computingResult || loadingResult || loadingDetails}
//     >
//        طباعة النتيجة الرقمية
//     </button>
//   </div>
// )}
//               <div style={{ color: "#6b7280", fontWeight: 800, alignSelf: "center" }}>
//                 عدد النتائج: {savedRows.length}
//               </div>
//             </div>

//             {skippedRows.length > 0 && (
//               <div style={{ marginTop: 10, overflowX: "auto" }}>
//                 <div style={{ color: "#b91c1c", fontWeight: 900, marginBottom: 8 }}>
//                  يوجد (مواد/درجات ناقصة)
//                 </div>

//                 <table className="simple-table" style={{ width: "100%" }}>
//                   <thead>
//                     <tr>
//                       <th>#</th>
//                       <th>الطالب</th>
//                       <th>الرقم الجامعي</th>
//                       <th>الموقف الأكاديمي</th>
//                       <th>عدد المواد الناقصة</th>
//                       <th>السبب</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {skippedRows.map((m, idx) => (
//                       <tr key={`${m.student_id}-${idx}`}>
//                         <td>{idx + 1}</td>
//                         <td>{m.full_name}</td>
//                         <td>{m.university_id}</td>
//                         <td>{m.academic_status}</td>
//                         <td>{m.missing_courses}</td>
//                         <td>{m.reason}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             <div style={{ overflowX: "auto", marginTop: 10 }}>
//               {!canComputeTerm ? (
//                 <p style={{ color: "#6b7280" }}>كمّل اختيار الفصل أولاً.</p>
//               ) : computingResult || loadingResult ? (
//                 <p>جارٍ التحميل...</p>
//               ) : savedRows.length === 0 ? (
//                 <p style={{ color: "#6b7280" }}>لا توجد نتيجة محفوظة/محسوبة لهذا الفصل بعد.</p>
//               ) : (
//                 <table className="simple-table" style={{ width: "100%" }}>
//                   <thead>
//                     <tr>
//                       <th>#</th>
//                       <th>الاسم</th>
//                       <th>الرقم الجامعي</th>
//                       <th>الموقف الأكاديمي</th>
//                       <th>GPA فصلي</th>
//                       <th>GPA تراكمي</th>
//                       {/* <th>التصنيف</th> */}
//                       <th>نقاط الفصل</th>
//                       <th>ساعات الفصل</th>
//                       <th>ساعات الرسوب</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {savedRows.map((r, idx) => (
//                       <tr key={`${r.student_id}-${idx}`}>
//                         <td>{idx + 1}</td>
//                         <td>{r.full_name}</td>
//                         <td>{r.university_id}</td>
//                         <td>{r.academic_status}</td>
//                         <td>{r.term_gpa ?? "—"}</td>
//                         <td>{r.cumulative_gpa ?? "—"}</td>
//                         {/* <td>{r.classification_label ?? "—"}</td> */}
//                         <td>{r.term_total_points ?? "—"}</td>
//                         <td>{r.term_total_hours ?? "—"}</td>
//                         <td style={{color: Number(r.failed_hours || 0) > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold'}}> {r.failed_hours ?? "—"}</td>

//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>

//       {toast && (
//         <div className={"toast " + (toast.type === "error" ? "toast-error" : "toast-success")}>
//           {toast.message}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TermResult;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import html2pdf from 'html2pdf.js';

const API_BASE = "http://localhost:5000/api";

const getAllowedFaculties = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.role === 'admin') return null;
    return Array.isArray(user.allowed_faculties) ? user.allowed_faculties : [];
  } catch (e) { return []; }
};

const getAllowedProgramTypes = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.role === 'admin') return ["diploma", "bachelor", "postgraduate"];
    return Array.isArray(user.allowed_program_types) ? user.allowed_program_types : ["bachelor"];
  } catch (e) { return ["bachelor"]; }
};

// ── حساب حالة النتيجة ─────────────────────────────────────────
function computeResultStatus(failedHours, termTotalHours, repeatCount) {
  const failed = Number(failedHours  || 0);
  const total  = Number(termTotalHours || 0);
  if (total === 0) return { status: "—", color: "#6b7280", detail: "" };

  const oneThird  = total / 3;
  const twoThirds = (total * 2) / 3;

  if (failed > twoThirds)
    return { status: "فصل", color: "#7c3aed",
      detail: `${failed} ساعة رسوب من ${total} (أكثر من الثلثين ${twoThirds.toFixed(1)})` };

  if (failed > oneThird && Number(repeatCount || 0) >= 2)
    return { status: "فصل (إعادة ثانية)", color: "#7c3aed",
      detail: `إعادة للمرة الثانية — ${failed} ساعة فاشلة` };

  if (failed > oneThird)
    return { status: "إعادة", color: "#ea580c",
      detail: `${failed} ساعة رسوب من ${total} (بين الثلث ${oneThird.toFixed(1)} والثلثين ${twoThirds.toFixed(1)})` };

  if (failed > 0)
    return { status: "ملحق", color: "#dc2626",
      detail: `${failed} ساعة رسوب من ${total} (أقل من الثلث ${oneThird.toFixed(1)})` };

  return { status: "ناجح", color: "#16a34a", detail: "" };
}

function usePostgradProgramsSmartList() {
  const [programs, setPrograms] = useState([]);
  const fetchPrograms = async () => {
    try {
      const res  = await fetch(`${API_BASE}/postgraduate-programs`);
      const data = await res.json();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (e) { setPrograms([]); }
  };
  return { programs, fetchPrograms };
}

// ═══════════════════════════════════════════════════════════════
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

  // توصيات القسم — { [student_id]: string }
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

  // أعلى ساعات فصل بين الطلاب (مرجع حساب الثلث والثلثين)
  const maxTermHours = savedRows.length > 0
    ? Math.max(...savedRows.map(r => Number(r.term_total_hours || 0)))
    : 0;

  const repeatStudents  = savedRows.filter(r =>
    computeResultStatus(r.failed_hours, maxTermHours, r.repeat_count).status === "إعادة");
  const dismissStudents = savedRows.filter(r =>
    computeResultStatus(r.failed_hours, maxTermHours, r.repeat_count).status.startsWith("فصل"));

  // ── تحميل الكليات ────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingFaculties(true);
      try {
        const res  = await fetch(`${API_BASE}/faculties-list`);
        const all  = await res.json();
        const allowed = getAllowedFaculties();
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

  // ── تحميل التوصيات المحفوظة ──────────────────────────────────
  const loadRecommendations = async () => {
    if (!canComputeTerm) return;
    try {
      const qs = new URLSearchParams({
        faculty_id: selectedFacultyId, department_id: selectedDepartmentId,
        academic_year: academicYear.trim(), level_name: levelName.trim(),
        term_name: termName.trim(), program_type: programType,
        ...(programType === "postgraduate" && postgraduateProgram.trim()
          ? { postgraduate_program: postgraduateProgram.trim() } : {})
      });
      const res  = await fetch(`${API_BASE}/api/term-results/list?${qs}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const map = {};
        data.forEach(r => { map[r.student_id] = r.recommendation || ""; });
        setRecommendations(map);
      }
    } catch (e) { console.error("فشل تحميل التوصيات", e); }
  };

useEffect(() => {
  if (savedRows.length > 0) {
    const map = {};
    savedRows.forEach(r => { map[r.student_id] = r.recommendation || ""; });
    setRecommendations(map);
  }
}, [savedRows]);

  // ── حفظ التوصيات دفعة واحدة ──────────────────────────────────
const saveRecommendations = async () => {
  setSavingRecs(true);
  try {
    const token = sessionStorage.getItem("token");
    for (const [student_id, recommendation] of Object.entries(recommendations)) {
      await fetch(`${API_BASE}/term-results/save-recommendation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          student_id: Number(student_id),
          faculty_id: selectedFacultyId,
          department_id: selectedDepartmentId,
          academic_year: academicYear.trim(),
          level_name: levelName.trim(),
          term_name: termName.trim(),
          program_type: programType,
          postgraduate_program: programType === "postgraduate" ? postgraduateProgram.trim() : null,
          recommendation,
        }),
      });
    }
    showToast("تم حفظ التوصيات بنجاح");
  } catch (e) {
    showToast(e.message || "خطأ في حفظ التوصيات", "error");
  } finally { setSavingRecs(false); }
};

  // ── الفترات الأكاديمية ────────────────────────────────────────
  const fetchAcademicPeriods = async (pType, pgProg) => {
    setLoadingPeriods(true);
    try {
      const pt = (pType || "bachelor").trim();
      const pg = (pgProg || "").trim();
      let url = `${API_BASE}/academic-periods?program_type=${encodeURIComponent(pt)}`;
      if (pt === "postgraduate" && pg) url += `&postgraduate_program=${encodeURIComponent(pg)}`;
      const res  = await fetch(url);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];
      setPeriods(rows);
      setYearOptions(Array.from(new Set(rows.map(r => (r.academic_year || "").trim()).filter(Boolean))));
    } catch { setPeriods([]); setYearOptions([]); setLevelOptions([]); setTermOptions([]); }
    finally { setLoadingPeriods(false); }
  };

  const rebuildOptions = (rows, year, level) => {
    const y = (year || "").trim(), l = (level || "").trim();
    setLevelOptions(Array.from(new Set(
      rows.filter(r => (r.academic_year || "").trim() === y).map(r => (r.level_name || "").trim()).filter(Boolean)
    )));
    setTermOptions(Array.from(new Set(
      rows.filter(r => (r.academic_year || "").trim() === y && (r.level_name || "").trim() === l)
          .map(r => (r.term_name || "").trim()).filter(Boolean)
    )));
  };

  useEffect(() => { rebuildOptions(periods, academicYear, levelName); }, [periods, academicYear, levelName]);

  useEffect(() => {
    setAcademicYear(""); setLevelName(""); setTermName(""); setSavedRows([]); setSkippedRows([]);
    if (selectedDepartmentId) fetchAcademicPeriods(programType, postgraduateProgram);
  }, [programType, postgraduateProgram]);

  // ── مواد الإعادة وتفاصيل الدرجات ────────────────────────────
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
  }, [savedRows]);

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
  }, [savedRows]);

  // ── Resets ────────────────────────────────────────────────────
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

  const onSelectFaculty = (id) => {
    setSelectedFacultyId(id); resetBelowFaculty();
    if (id) fetchDepartmentsByFaculty(id);
  };
  const onSelectDepartment = (id) => {
    setSelectedDepartmentId(id); resetBelowDepartment();
    if (id) fetchAcademicPeriods(programType, postgraduateProgram);
  };

  const fetchDepartmentsByFaculty = async (facultyId) => {
    setLoadingDeps(true);
    try {
      const res  = await fetch(`${API_BASE}/departments/${facultyId}`);
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch { setDepartments([]); showToast("مشكلة في تحميل الأقسام", "error"); }
    finally { setLoadingDeps(false); }
  };

  // ── Result APIs ───────────────────────────────────────────────
  const computeAndSaveResult = async () => {
    if (!canComputeTerm) return showToast("كمّل الاختيارات أولاً", "error");
    if (hasSavedResults && !window.confirm(
      "النتائج محفوظة بالفعل.\n\nهل تريد إعادة الحساب والتجاوز على القديم؟"
    )) return;
    setComputingResult(true); setSkippedRows([]); setSavedRows([]);
    try {
      const res  = await fetch(`${API_BASE}/term-results/calculate-save`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faculty_id:           Number(selectedFacultyId),
          department_id:        Number(selectedDepartmentId),
          program_type:         programType,
          postgraduate_program: programType === "postgraduate" ? postgraduateProgram.trim() : null,
          academic_year:        academicYear.trim(),
          level_name:           levelName.trim(),
          term_name:            termName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل حساب النتيجة");
      setSavedRows(Array.isArray(data.saved)   ? data.saved   : []);
      setSkippedRows(Array.isArray(data.skipped) ? data.skipped : []);
      setHasSavedResults(true);
      showToast(data.message || "تم حساب النتائج");
    } catch (e) { showToast(e.message || "مشكلة في حساب النتيجة", "error"); }
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
        (programType === "postgraduate"
          ? `&postgraduate_program=${encodeURIComponent(postgraduateProgram.trim())}`
          : `&postgraduate_program=`) +
        `&academic_year=${encodeURIComponent(academicYear.trim())}` +
        `&level_name=${encodeURIComponent(levelName.trim())}` +
        `&term_name=${encodeURIComponent(termName.trim())}`;
      const res  = await fetch(`${API_BASE}/term-results/list?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل تحميل النتيجة");
      const rows = Array.isArray(data) ? data : [];
      setSavedRows(rows);
      setHasSavedResults(rows.length > 0);
    } catch (e) { showToast(e.message || "مشكلة في تحميل النتيجة", "error"); }
    finally { setLoadingResult(false); }
  };

  useEffect(() => { if (canComputeTerm) loadSavedResult(); }, [canComputeTerm]);

  // ── طباعة PDF ─────────────────────────────────────────────────
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

  // ══════════════════════════════════════════════════════════
  // UI
  // ══════════════════════════════════════════════════════════
  const oneThird  = maxTermHours > 0 ? (maxTermHours / 3).toFixed(1)     : "—";
  const twoThirds = maxTermHours > 0 ? (maxTermHours * 2 / 3).toFixed(1) : "—";

  return (
    <div className="admission-layout">
      <header className="library-header">
        <div className="library-header-title">
          <span style={{ fontSize: 22 }}>📊</span>
          <span> حساب النتيجة</span>
        </div>
        <button onClick={() => navigate(-1)}
          style={{ background:"none",border:"none",cursor:"pointer",color:"white",fontSize:"26px",
            display:"flex",alignItems:"center",justifyContent:"center" }} title="رجوع">
          <IoArrowBack />
        </button>
      </header>

      <main className="library-main">
        <div className="library-container">

          {/* ── اختيار الفصل ─── */}
          <div className="card" style={{ marginTop: 14 }}>
            <h2 className="card-title">اختيار الفصل</h2>
            <div className="two-col-grid" style={{ marginBottom: 12 }}>

              <div className="input-group">
                <label className="input-label">الكلية</label>
                <select className="input-field" value={selectedFacultyId}
                  onChange={e => onSelectFaculty(e.target.value)} disabled={loadingFaculties}>
                  <option value="">{loadingFaculties ? "جارٍ التحميل..." : "— اختار —"}</option>
                  {faculties.map(f => <option key={f.id} value={f.id}>{f.faculty_name}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">القسم</label>
                <select className="input-field" value={selectedDepartmentId}
                  onChange={e => onSelectDepartment(e.target.value)}
                  disabled={!canPickDepartment || loadingDeps}>
                  <option value="">{!canPickDepartment?"اختار كلية أولاً":loadingDeps?"جارٍ التحميل...":"— اختار —"}</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                </select>
              </div>

              <div className="input-group" style={{ gridColumn:"1 / -1" }}>
                <label className="input-label">نوع البرنامج</label>
                <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
                  {getAllowedProgramTypes().map(type => (
                    <label key={type} style={{ display:"flex",gap:8,alignItems:"center",fontWeight:700,
                      opacity:!canPickProgramType?0.6:1,cursor:!canPickProgramType?"not-allowed":"pointer" }}>
                      <input type="radio" name="pgTypeResult" value={type}
                        checked={programType===type}
                        onChange={e => setProgramType(e.target.value)}
                        disabled={!canPickProgramType} />
                      {type==="diploma"&&"دبلوم"}{type==="bachelor"&&"بكالوريوس"}{type==="postgraduate"&&"دراسات عليا"}
                    </label>
                  ))}
                </div>
              </div>

              {programType === "postgraduate" && (
                <div className="input-group" style={{ gridColumn:"1 / -1" }}>
                  <label className="input-label">اسم برنامج الدراسات العليا</label>
                  <input className="input-field" dir="rtl" list="pg_res"
                    placeholder="مثال: ماجستير إدارة أعمال"
                    value={postgraduateProgram} onChange={e => setPostgraduateProgram(e.target.value)}
                    disabled={!canPickProgramType} />
                  <datalist id="pg_res">
                    {pgSmart.programs.map((p, i) => <option key={i} value={p} />)}
                  </datalist>
                </div>
              )}

              <div className="input-group">
                <label className="input-label">السنة الدراسية</label>
                <input className="input-field" dir="rtl" list="yr_res" placeholder="مثال: 2024/2025"
                  value={academicYear}
                  onChange={e => { setAcademicYear(e.target.value); setLevelName(""); setTermName(""); setSavedRows([]); }}
                  disabled={!canPickYear || loadingPeriods} />
                <datalist id="yr_res">{yearOptions.map(x => <option key={x} value={x} />)}</datalist>
              </div>

              <div className="input-group">
                <label className="input-label">{programType==="postgraduate"?"الدفعة":"المستوى"}</label>
                <input className="input-field" dir="rtl" list="lv_res"
                  placeholder={programType==="postgraduate"?"مثال: الدفعة الأولى":"مثال: المستوى الأول"}
                  value={levelName}
                  onChange={e => { setLevelName(e.target.value); setTermName(""); setSavedRows([]); }}
                  disabled={!canPickLevel} />
                <datalist id="lv_res">{levelOptions.map(x => <option key={x} value={x} />)}</datalist>
              </div>

              <div className="input-group">
                <label className="input-label">الفصل الدراسي</label>
                <input className="input-field" dir="rtl" list="tm_res" placeholder="مثال: الفصل الأول"
                  value={termName}
                  onChange={e => { setTermName(e.target.value); setSavedRows([]); }}
                  disabled={!canPickTerm} />
                <datalist id="tm_res">{termOptions.map(x => <option key={x} value={x} />)}</datalist>
              </div>
            </div>
          </div>

          {/* ── النتائج ─── */}
          <div className="card" style={{ marginTop: 14 }}>
            <h2 className="card-title">حساب النتيجة (GPA + تصنيف)</h2>

            {/* أزرار */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
              <button className="btn btn-primary" onClick={computeAndSaveResult}
                disabled={!canComputeTerm || computingResult}>
                {computingResult ? "جاري الحساب..." : "حساب النتيجة"}
              </button>
              {savedRows.length > 0 && (<>
                <button className="btn btn-primary" onClick={() => printResults('letter')}
                  disabled={loadingDetails}>طباعة الحرفية</button>
                <button className="btn btn-success" onClick={() => printResults('numeric')}
                  disabled={loadingDetails}>طباعة الرقمية</button>
                <button className="btn" onClick={saveRecommendations} disabled={savingRecs}
                  style={{ background:"#0a3753", color:"#fff", fontWeight:700 }}>
                  {savingRecs ? "جاري الحفظ..." : " حفظ التوصيات"}
                </button>
              </>)}
              <span style={{ color:"#6b7280", fontWeight:800, alignSelf:"center" }}>
                عدد النتائج: {savedRows.length}
              </span>
            </div>

            {/* بطاقات الثلث والثلثين */}
            {savedRows.length > 0 && maxTermHours > 0 && (
              <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
                <div style={{ background:"#fff7ed",border:"1px solid #fb923c",borderRadius:8,
                  padding:"8px 16px",fontSize:13,fontWeight:700 }}>
                   حد الإعادة &gt; <span style={{color:"#ea580c"}}>{oneThird}</span> ساعة
                </div>
                <div style={{ background:"#fdf4ff",border:"1px solid #c084fc",borderRadius:8,
                  padding:"8px 16px",fontSize:13,fontWeight:700 }}>
                   حد الفصل &gt; <span style={{color:"#7c3aed"}}>{twoThirds}</span> ساعة
                </div>
                {repeatStudents.length > 0 && (
                  <div style={{ background:"#fff7ed",border:"1px solid #fb923c",borderRadius:8,
                    padding:"8px 16px",fontSize:13,fontWeight:700 }}>
                    طلاب الإعادة: <span style={{color:"#ea580c"}}>{repeatStudents.length}</span>
                  </div>
                )}
                {dismissStudents.length > 0 && (
                  <div style={{ background:"#fdf4ff",border:"1px solid #c084fc",borderRadius:8,
                    padding:"8px 16px",fontSize:13,fontWeight:700 }}>
                    طلاب الفصل: <span style={{color:"#7c3aed"}}>{dismissStudents.length}</span>
                  </div>
                )}
              </div>
            )}

            {/* درجات ناقصة */}
            {skippedRows.length > 0 && (
              <div style={{ marginTop:10, overflowX:"auto" }}>
                <div style={{ color:"#b91c1c",fontWeight:900,marginBottom:8 }}>يوجد (مواد/درجات ناقصة)</div>
                <table className="simple-table" style={{ width:"100%" }}>
                  <thead><tr><th>#</th><th>الطالب</th><th>الرقم الجامعي</th>
                    <th>الموقف الأكاديمي</th><th>المواد الناقصة</th><th>السبب</th></tr></thead>
                  <tbody>
                    {skippedRows.map((m, idx) => (
                      <tr key={idx}><td>{idx+1}</td><td>{m.full_name}</td><td>{m.university_id}</td>
                        <td>{m.academic_status}</td><td>{m.missing_courses}</td><td>{m.reason}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* الجدول الرئيسي */}
            <div style={{ overflowX:"auto", marginTop:10 }}>
              {!canComputeTerm ? (
                <p style={{ color:"#6b7280" }}>كمّل اختيار الفصل أولاً.</p>
              ) : computingResult || loadingResult ? (
                <p>جارٍ التحميل...</p>
              ) : savedRows.length === 0 ? (
                <p style={{ color:"#6b7280" }}>لا توجد نتيجة محفوظة/محسوبة لهذا الفصل بعد.</p>
              ) : (
                <table className="simple-table" style={{ width:"100%" }}>
                  <thead>
                    <tr>
                      <th>#</th><th>الاسم</th><th>الرقم الجامعي</th>
                      <th>الموقف الأكاديمي</th>
                      <th>حالة النتيجة</th>
                      <th>GPA فصلي</th><th>GPA تراكمي</th>
                      <th>نقاط الفصل</th><th>ساعات الفصل</th>
                      <th>ساعات الرسوب</th>
                      <th style={{minWidth:200}}>توصية القسم / المجلس العلمي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedRows.map((r, idx) => {
                      const { status, color, detail } = computeResultStatus(
                        r.failed_hours, maxTermHours, r.repeat_count
                      );
                      const rowBg =
                        status.startsWith("فصل") ? "#fdf4ff" :
                        status === "إعادة"       ? "#fff7ed" :
                        status === "ملحق"  ? "#fef2f2" : "";
                      return (
                        <tr key={`${r.student_id}-${idx}`} style={{ background: rowBg }}>
                          <td>{idx+1}</td>
                          <td>{r.full_name}</td>
                          <td>{r.university_id}</td>
                          <td>{r.academic_status}</td>

                          {/* ── حالة النتيجة ── */}
                          <td>
                            <span style={{ color, fontWeight:"bold", fontSize:13 }}>{status}</span>
                            {detail && (
                              <div style={{ fontSize:11, color:"#6b7280", marginTop:2, lineHeight:1.4 }}>
                                {detail}
                              </div>
                            )}
                          </td>

                          <td>{r.term_gpa ?? "—"}</td>
                          <td>{r.cumulative_gpa ?? "—"}</td>
                          <td>{r.term_total_points ?? "—"}</td>
                          <td>{r.term_total_hours ?? "—"}</td>
                          <td style={{ color:Number(r.failed_hours||0)>0?'#dc2626':'#16a34a', fontWeight:'bold' }}>
                            {r.failed_hours ?? "—"}
                          </td>

                          {/* ── توصية القسم / المجلس العلمي ── */}
                          <td style={{ minWidth: 200 }}>
                            <textarea
                              rows={2}
                              value={recommendations[r.student_id] || ""}
                              onChange={e => setRecommendations(prev => ({
                                ...prev, [r.student_id]: e.target.value
                              }))}
                              placeholder="اكتب التوصية هنا..."
                              style={{
                                width:"100%", fontSize:12, border:"1px solid #d1d5db",
                                borderRadius:6, padding:"4px 8px", resize:"vertical",
                                fontFamily:"inherit", direction:"rtl", lineHeight:1.5
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </main>

      {toast && (
        <div className={"toast " + (toast.type==="error"?"toast-error":"toast-success")}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default TermResult;
