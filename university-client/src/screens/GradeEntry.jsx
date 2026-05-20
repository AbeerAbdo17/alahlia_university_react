import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

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

const PENALTY_OPTIONS = [
  { value: "none",       label: "لا يوجد" },
  { value: "warning",    label: "إنذار" },
  { value: "fail_zero",  label: "صفر في المادة" },
  { value: "suspension", label: "إيقاف" },
  { value: "expulsion",  label: "فصل نهائي" },
];

const SUSPENSION_OPTIONS = [
  { value: "one_year",    label: "سنة دراسية" },
  { value: "two_years",   label: "سنتين دراسيتين" },
  { value: "three_years", label: "ثلاث سنوات دراسية" },
];

// =====================================================
// Hook مساعد لبرامج الدراسات العليا
// =====================================================
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

// =====================================================
// المكوّن الرئيسي
// =====================================================
const GradeEntry = () => {
  const navigate = useNavigate();

  // ===== Toast =====
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ===== بيانات الفلترة =====
  const [faculties,   setFaculties]   = useState([]);
  const [departments, setDepartments] = useState([]);
  const [periods,     setPeriods]     = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [levelOptions,setLevelOptions]= useState([]);
  const [termOptions, setTermOptions] = useState([]);
  const [courses,     setCourses]     = useState([]);

  const pgSmart = usePostgradProgramsSmartList();

  // ===== الاختيارات =====
  const [selectedFacultyId,    setSelectedFacultyId]    = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [programType,          setProgramType]          = useState("bachelor");
  const [postgraduateProgram,  setPostgraduateProgram]  = useState("");
  const [academicYear,         setAcademicYear]         = useState("");
  const [levelName,            setLevelName]            = useState("");
  const [termName,             setTermName]             = useState("");
  const [selectedCourseId,     setSelectedCourseId]     = useState("");

  // ===== بيانات الدرجات =====
  const [courseInfo, setCourseInfo] = useState(null);
  const [students,   setStudents]   = useState([]);
  const [facultyScale, setFacultyScale] = useState([]);

  // ===== حالات التحميل =====
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingDeps,      setLoadingDeps]      = useState(false);
  const [loadingPeriods,   setLoadingPeriods]   = useState(false);
  const [loadingCourses,   setLoadingCourses]   = useState(false);
  const [loadingStudents,  setLoadingStudents]  = useState(false);
  const [savingGrades,     setSavingGrades]     = useState(false);

  // ===== شروط التفعيل =====
  const canPickDepartment  = !!selectedFacultyId;
  const canPickProgramType = !!selectedDepartmentId;
  const canProceedAfterProgram =
    programType === "bachelor" || programType === "diploma"
      ? true
      : !!postgraduateProgram.trim();
  const canPickYear  = canPickProgramType && canProceedAfterProgram;
  const canPickLevel = !!academicYear.trim();
  const canPickTerm  = !!levelName.trim();
  const canLoadCourses =
    selectedFacultyId &&
    selectedDepartmentId &&
    canProceedAfterProgram &&
    academicYear.trim() &&
    levelName.trim() &&
    termName.trim();

  // =====================================================
  // جلب مقياس التقديرات
  // =====================================================
  useEffect(() => {
    const fetchFacultyScale = async () => {
      if (!selectedFacultyId) { setFacultyScale([]); return; }
      try {
        const res  = await fetch(`${API_BASE}/grading-scale/${selectedFacultyId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.scale)) {
          setFacultyScale(data.scale);
        } else {
          setFacultyScale([]);
          showToast(data.error || "مشكلة في جلب مقياس الدرجات", "error");
        }
      } catch {
        setFacultyScale([]);
        showToast("خطأ في جلب مقياس الدرجات", "error");
      }
    };
    fetchFacultyScale();
  }, [selectedFacultyId]);

  // =====================================================
  // حساب التقدير والنقاط من المقياس
  // =====================================================
  const getLetterAndPointsPreview = (total) => {
    if (total == null || facultyScale.length === 0) return { letter: null, points: null };

    const sortedRules = [...facultyScale]
      .map((rule) => {
        const min = Math.min(Number(rule.min_mark), Number(rule.max_mark));
        const max = Math.max(Number(rule.min_mark), Number(rule.max_mark));
        return { ...rule, min_mark: min, max_mark: max };
      })
      .sort((a, b) => b.min_mark - a.min_mark);

    for (const rule of sortedRules) {
      if (total >= Number(rule.min_mark) && total <= Number(rule.max_mark)) {
        return { letter: rule.letter || "F", points: Number(rule.points) || 0.0 };
      }
    }
    return { letter: "F", points: 0.0 };
  };

  // =====================================================
  // جلب الكليات
  // =====================================================
  useEffect(() => {
    const loadFaculties = async () => {
      setLoadingFaculties(true);
      try {
        const res         = await fetch(`${API_BASE}/faculties-list`);
        const allFaculties = await res.json();
        const allowed     = getAllowedFaculties();
        let filtered      = allFaculties;
        if (allowed !== null) {
          filtered = allFaculties.filter((fac) => allowed.includes(fac.id));
        }
        setFaculties(Array.isArray(filtered) ? filtered : []);
        if (filtered.length === 0 && allowed !== null) {
          showToast("لا توجد كليات مسموح لك الوصول إليها", "error");
        }
        if (selectedFacultyId) {
          const stillAllowed = filtered.find((f) => f.id === Number(selectedFacultyId));
          if (!stillAllowed) setSelectedFacultyId("");
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

  // =====================================================
  // جلب الأقسام
  // =====================================================
  const fetchDepartmentsByFaculty = async (facultyId) => {
    if (!facultyId) return;
    setLoadingDeps(true);
    try {
      const res  = await fetch(`${API_BASE}/departments/${facultyId}`);
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

  // =====================================================
  // جلب الفترات الدراسية
  // =====================================================
  const fetchAcademicPeriods = async (pType, pgProg) => {
    setLoadingPeriods(true);
    try {
      const pt  = (pType  || "bachelor").trim();
      const pg  = (pgProg || "").trim();
      let url   = `${API_BASE}/academic-periods?program_type=${encodeURIComponent(pt)}`;
      if (pt === "postgraduate" && pg) {
        url += `&postgraduate_program=${encodeURIComponent(pg)}`;
      }
      const res  = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل تحميل الفترات");
      const rows = Array.isArray(data) ? data : [];
      setPeriods(rows);
      const ys = Array.from(
        new Set(rows.map((r) => (r.academic_year || "").trim()).filter(Boolean))
      );
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
    const y = (year  || "").trim();
    const l = (level || "").trim();
    const levels = Array.from(
      new Set(
        rows
          .filter((r) => (r.academic_year || "").trim() === y)
          .map((r)   => (r.level_name    || "").trim())
          .filter(Boolean)
      )
    );
    setLevelOptions(levels);
    const terms = Array.from(
      new Set(
        rows
          .filter(
            (r) =>
              (r.academic_year || "").trim() === y &&
              (r.level_name    || "").trim() === l
          )
          .map((r) => (r.term_name || "").trim())
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
    setCourses([]);
    setSelectedCourseId("");
    setCourseInfo(null);
    setStudents([]);
    if (selectedDepartmentId) fetchAcademicPeriods(programType, postgraduateProgram);
  }, [programType, postgraduateProgram]);

  useEffect(() => {
    if (programType === "postgraduate") {
      pgSmart.fetchPrograms();
    } else {
      setPostgraduateProgram("");
    }
  }, [programType]);

  // =====================================================
  // جلب المواد
  // =====================================================
  const fetchCourses = async () => {
    if (!canLoadCourses) return;
    setLoadingCourses(true);
    try {
      const params = new URLSearchParams({
        faculty_id:    selectedFacultyId,
        department_id: selectedDepartmentId,
        academic_year: academicYear.trim(),
        level_name:    levelName.trim(),
        term_name:     termName.trim(),
        program_type:  programType,
      });
      if (programType === "postgraduate" && postgraduateProgram.trim()) {
        params.append("postgraduate_program", postgraduateProgram.trim());
      }
      const res  = await fetch(`${API_BASE}/grade-entry-courses?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل تحميل المواد");
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("خطأ في fetchCourses:", e);
      showToast(e.message || "مشكلة في تحميل المواد", "error");
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    setSelectedCourseId("");
    setCourseInfo(null);
    setStudents([]);
    if (canLoadCourses) fetchCourses();
  }, [
    selectedFacultyId, selectedDepartmentId,
    academicYear, levelName, termName,
    programType, postgraduateProgram,
  ]);

  // =====================================================
  // بيانات المادة المختارة
  // =====================================================
  const courseMeta = useMemo(() => {
    if (!courseInfo) return null;
    return {
      instructor: courseInfo.instructor   || "—",
      hours:      courseInfo.credit_hours ?? "—",
      cwMax:      Number(courseInfo.coursework_max  ?? 40),
      feMax:      Number(courseInfo.final_exam_max  ?? 60),
      total:      Number(courseInfo.total_mark      ?? 100),
    };
  }, [courseInfo]);

  // =====================================================
  // دوال مساعدة للحسابات
  // =====================================================
  const clampNum = (v, min, max, fieldName = "") => {
    const n = Number(v);
    if (isNaN(n)) return null;
    if (n > max) {
      showToast(`الحد الأقصى لـ ${fieldName} هو ${max}، تم تعديل القيمة`, "error");
      return max;
    }
    if (n < min) return min;
    return n;
  };

  // =====================================================
  // calcStudentRow - الآن يأخذ بعين الاعتبار السنة السابقة
  // =====================================================
  const calcStudentRow = (student) => {
    const cwMax    = courseMeta?.cwMax ?? 40;
    const feMax    = courseMeta?.feMax ?? 60;
    const totalMax = courseMeta?.total ?? cwMax + feMax;

    const prev = student.prev_repeat_info;

    // ── حالة 1: كان إعادة السنة السابقة وناجح → عرض فقط
    if (prev?.was_repeat_student && prev?.prev_passed) {
      return {
        ...student,
        coursework_mark:    prev.prev_coursework_mark,
        final_exam_mark:    prev.prev_final_exam_mark,
        total_mark:         prev.prev_total_mark,
        letter:             prev.prev_letter,
        points:             prev.prev_points,
        is_absent:          !!prev.prev_is_absent,
        penalty_type:       "none",
        suspension_duration:null,
        is_readonly:        true,
        repeat_status_label:`إعادة (ناجح من ${prev.prev_year})`,
        prev_total_mark_ref: null,
      };
    }

    // ── حالة 2: كان إعادة السنة السابقة وراسب → يدخل درجات جديدة
    if (prev?.was_repeat_student && !prev?.prev_passed) {
      const cw    = clampNum(student.coursework_mark, 0, cwMax, "أعمال السنة");
      const fe    = clampNum(student.final_exam_mark, 0, feMax, "النهائي");
      const total = cw != null && fe != null
        ? clampNum(cw + fe, 0, totalMax, "المجموع")
        : null;
      const { letter, points } = getLetterAndPointsPreview(total);
      return {
        ...student,
        coursework_mark:    cw ?? "",
        final_exam_mark:    fe ?? "",
        is_absent:          student.is_absent || false,
        total_mark:         total,
        letter,
        points,
        is_readonly:        false,
        repeat_status_label:`إعادة (راسب من ${prev.prev_year})`,
        prev_total_mark_ref: prev.prev_total_mark, // نعرضها كمرجع
      };
    }

    // ── حالة 3: طالب عادي
    const cw    = clampNum(student.coursework_mark, 0, cwMax, "أعمال السنة");
    const fe    = clampNum(student.final_exam_mark, 0, feMax, "النهائي");
    const total = cw != null && fe != null
      ? clampNum(cw + fe, 0, totalMax, "المجموع")
      : null;
    const { letter, points } = getLetterAndPointsPreview(total);
    return {
      ...student,
      coursework_mark:    cw ?? "",
      final_exam_mark:    fe ?? "",
      is_absent:          student.is_absent || false,
      total_mark:         total,
      letter,
      points,
      is_readonly:        false,
      repeat_status_label:null,
      prev_total_mark_ref:null,
    };
  };

  // =====================================================
  // جلب الطلاب
  // =====================================================
  const fetchStudentsForCourse = async (courseId) => {
    if (!courseId) return;
    setLoadingStudents(true);
    try {
      const params = new URLSearchParams({
        course_id:     courseId,
        academic_year: academicYear.trim(),
        level_name:    levelName.trim(),
        term_name:     termName.trim(),
        program_type:  programType,
        ...(programType === "postgraduate" && {
          postgraduate_program: postgraduateProgram || null,
        }),
      });
      const res  = await fetch(`${API_BASE}/grade-entry/students?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل تحميل الطلاب");
      setCourseInfo(data.course || null);
      const raw = Array.isArray(data.students) ? data.students : [];
      setStudents(raw.map(calcStudentRow));
    } catch (e) {
      console.error(e);
      setCourseInfo(null);
      setStudents([]);
      showToast(e.message || "مشكلة في تحميل الطلاب", "error");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    setCourseInfo(null);
    setStudents([]);
    if (selectedCourseId) fetchStudentsForCourse(selectedCourseId);
  }, [selectedCourseId]);

  // =====================================================
  // Reset helpers
  // =====================================================
  const resetBelowFaculty = () => {
    setDepartments([]);
    setSelectedDepartmentId("");
    setProgramType("bachelor");
    setPostgraduateProgram("");
    setAcademicYear(""); setLevelName(""); setTermName("");
    setCourses([]); setSelectedCourseId("");
    setCourseInfo(null); setStudents([]);
  };

  const resetBelowDepartment = () => {
    setProgramType("bachelor");
    setPostgraduateProgram("");
    setAcademicYear(""); setLevelName(""); setTermName("");
    setCourses([]); setSelectedCourseId("");
    setCourseInfo(null); setStudents([]);
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

  // =====================================================
  // تغيير الغياب - مع منع التعديل على الـ readonly
  // =====================================================
  const onChangeAbsent = (studentId, checked) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.student_id !== studentId) return s;
        if (s.is_readonly) return s; // لا تعديل على الطالب الناجح
        if (checked && s.penalty_type && s.penalty_type !== "none") {
          showToast("لا يمكن اختيار غائب لطالب لديه عقوبة مسجلة", "error");
          return s;
        }
        if (checked) {
          return {
            ...s,
            is_absent: true,
            penalty_type: "none",
            coursework_mark: 0,
            final_exam_mark: 0,
            total_mark: 0,
            letter: "F",
            points: 0.0,
          };
        }
        return { ...s, is_absent: false, coursework_mark: "", final_exam_mark: "", total_mark: 0 };
      })
    );
  };

  // =====================================================
  // تغيير العقوبة - مع منع التعديل على الـ readonly
  // =====================================================
  const onChangePenalty = (studentId, penaltyValue) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.student_id !== studentId) return s;
        if (s.is_readonly) return s;
        if (penaltyValue !== "none" && s.is_absent) {
          showToast("لا يمكن اختيار عقوبة لطالب مسجل كغائب", "error");
          return s;
        }
        let updatedStudent = { ...s, penalty_type: penaltyValue };
        if (penaltyValue === "fail_zero") {
          updatedStudent.coursework_mark = 0;
          updatedStudent.final_exam_mark = 0;
          updatedStudent.total_mark      = 0;
          updatedStudent.letter          = "F";
          updatedStudent.points          = 0.0;
        }
        return updatedStudent;
      })
    );
  };

  // =====================================================
  // تغيير الدرجة - مع منع التعديل على الـ readonly
  // =====================================================
  const onChangeMark = (studentId, field, value) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.student_id !== studentId) return s;
        if (s.is_readonly) return s;

        let clampedValue = value ? Number(value) : null;
        if (field === "coursework_mark") {
          clampedValue = clampNum(clampedValue, 0, courseMeta.cwMax, "أعمال السنة");
        } else if (field === "final_exam_mark") {
          clampedValue = clampNum(clampedValue, 0, courseMeta.feMax, "النهائي");
        }

        const newData    = { ...s, [field]: clampedValue };
        const coursework = Number(newData.coursework_mark || 0);
        const final      = Number(newData.final_exam_mark || 0);
        newData.total_mark = coursework + final;

        if (s.is_repeat) {
          newData.letter = newData.total_mark >= 50 ? "C*" : "F";
          newData.points = newData.total_mark >= 50 ? 2.00 : 0.00;
        } else {
          const { letter, points } = getLetterAndPointsPreview(newData.total_mark);
          newData.letter = letter ?? "—";
          newData.points = points ?? "—";
        }

        return newData;
      })
    );
  };

// =====================================================
// حفظ الدرجات - النسخة المحدثة
// =====================================================
const saveGrades = async () => {
  if (savingGrades || !selectedCourseId) return;

  // تحقق من مدة الإيقاف
  for (const s of students) {
    if (s.penalty_type === "suspension" && !s.suspension_duration) {
      showToast(`يرجى تحديد مدة الإيقاف للطالب: ${s.full_name}`, "error");
      return;
    }
  }

  setSavingGrades(true);
  const token = sessionStorage.getItem("token");

  if (!token) {
    showToast("انتهت الجلسة، يرجى تسجيل الدخول", "error");
    navigate("/login");
    return;
  }

  const payload = {
    course_id: selectedCourseId,
    grades: students.map((s) => ({
      student_id: s.student_id,
      coursework_mark: s.coursework_mark ?? null,
      final_exam_mark: s.final_exam_mark ?? null,
      is_absent: s.is_absent ? 1 : 0,
      is_repeat: s.is_repeat,
      penalty_type: s.penalty_type || "none",
      suspension_duration: s.suspension_duration || null,
      // حتى لو readonly، بنرسل القيم عشان تتحفظ
    })),
    academic_year: academicYear.trim(),
    level_name: levelName.trim(),
    term_name: termName.trim(),
    program_type: programType,
    postgraduate_program: programType === "postgraduate" ? postgraduateProgram.trim() : null,
  };

  try {
    const res = await fetch(`${API_BASE}/save-grades`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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

    showToast("تم حفظ الدرجات بنجاح");
    await fetchStudentsForCourse(selectedCourseId); // refresh
  } catch (err) {
    showToast(err.message || "خطأ في الحفظ", "error");
  } finally {
    setSavingGrades(false);
  }
};

  // =====================================================
  // مساعد لتحديد لون الصف
  // =====================================================
  const getRowStyle = (s) => {
    if (s.is_readonly)           return { backgroundColor: "#e8f5e9" }; // أخضر فاتح - إعادة ناجح
    if (s.repeat_status_label)   return { backgroundColor: "#fff3e0" }; // برتقالي - إعادة راسب
    if (s.is_absent)             return { backgroundColor: "#ffebee" }; // أحمر فاتح - غائب
    if (s.is_repeat)             return { backgroundColor: "#fff3e0" }; // برتقالي - إعادة مادة
    return {};
  };

  // =====================================================
  // الـ JSX
  // =====================================================
  return (
    <div className="admission-layout">
      <header className="library-header">
        <div className="library-header-title">
          <span style={{ fontSize: 22 }}></span>
          <span> إدخال الدرجات</span>
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "white", fontSize: "26px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          title="رجوع للصفحة الرئيسية"
        >
          <IoArrowBack />
        </button>
      </header>

      <main className="library-main">
        <div className="library-container">

          {/* ===== بطاقة الفلترة ===== */}
          <div className="card" style={{ marginTop: 14 }}>
            <h2 className="card-title">اختيار الفصل</h2>

            <div className="two-col-grid" style={{ marginBottom: 12 }}>

              {/* 1) الكلية */}
              <div className="input-group">
                <label className="input-label">الكلية</label>
                <select
                  className="input-field"
                  value={selectedFacultyId}
                  onChange={(e) => onSelectFaculty(e.target.value)}
                  disabled={loadingFaculties}
                >
                  <option value="">
                    {loadingFaculties ? "جارٍ التحميل..." : "— اختار —"}
                  </option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>{f.faculty_name}</option>
                  ))}
                </select>
              </div>

              {/* 2) القسم */}
              <div className="input-group">
                <label className="input-label">القسم</label>
                <select
                  className="input-field"
                  value={selectedDepartmentId}
                  onChange={(e) => onSelectDepartment(e.target.value)}
                  disabled={!canPickDepartment || loadingDeps}
                >
                  <option value="">
                    {!canPickDepartment ? "اختار كلية أولاً"
                      : loadingDeps ? "جارٍ تحميل الأقسام..."
                      : "— اختار —"}
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.department_name}</option>
                  ))}
                </select>
              </div>

              {/* 3) نوع البرنامج */}
              <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                <label className="input-label">نوع البرنامج</label>
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                  {getAllowedProgramTypes().map((type) => (
                    <label
                      key={type}
                      style={{
                        display: "flex", gap: 8, alignItems: "center", fontWeight: 700,
                        opacity: !canPickProgramType ? 0.6 : 1,
                        cursor:  !canPickProgramType ? "not-allowed" : "pointer",
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
                      {type === "diploma"       && "دبلوم"}
                      {type === "bachelor"      && "بكالوريوس"}
                      {type === "postgraduate"  && "دراسات عليا"}
                    </label>
                  ))}
                </div>
              </div>

              {/* 4) برنامج الدراسات العليا */}
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

              {/* 5) السنة الدراسية */}
              <div className="input-group">
                <label className="input-label">السنة الدراسية</label>
                <input
                  className="input-field"
                  dir="rtl"
                  list="years_list_grades"
                  placeholder="مثال: 2024/2025"
                  value={academicYear}
                  onChange={(e) => {
                    setAcademicYear(e.target.value);
                    setLevelName(""); setTermName("");
                    setCourses([]); setSelectedCourseId("");
                    setCourseInfo(null); setStudents([]);
                  }}
                  disabled={!canPickYear || loadingPeriods}
                />
                <datalist id="years_list_grades">
                  {yearOptions.map((x) => <option key={x} value={x} />)}
                </datalist>
              </div>

              {/* 6) المستوى */}
              <div className="input-group">
                <label className="input-label">
                  {programType === "postgraduate" ? "الدفعة" : "المستوى"}
                </label>
                <input
                  className="input-field"
                  dir="rtl"
                  list="levels_list_grades"
                  placeholder={
                    programType === "postgraduate"
                      ? "مثال: الدفعة الأولى"
                      : "مثال: المستوى الأول"
                  }
                  value={levelName}
                  onChange={(e) => {
                    setLevelName(e.target.value);
                    setTermName("");
                    setCourses([]); setSelectedCourseId("");
                    setCourseInfo(null); setStudents([]);
                  }}
                  disabled={!canPickLevel}
                />
                <datalist id="levels_list_grades">
                  {levelOptions.map((x) => <option key={x} value={x} />)}
                </datalist>
              </div>

              {/* 7) الفصل الدراسي */}
              <div className="input-group">
                <label className="input-label">الفصل الدراسي</label>
                <input
                  className="input-field"
                  dir="rtl"
                  list="terms_list_grades"
                  placeholder="مثال: الفصل الأول"
                  value={termName}
                  onChange={(e) => {
                    setTermName(e.target.value);
                    setSelectedCourseId("");
                    setCourseInfo(null); setStudents([]);
                  }}
                  disabled={!canPickTerm}
                />
                <datalist id="terms_list_grades">
                  {termOptions.map((x) => <option key={x} value={x} />)}
                </datalist>
              </div>

              {/* 8) المادة */}
              <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                <label className="input-label">المادة</label>
                <select
                  className="input-field"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  disabled={!canLoadCourses || loadingCourses}
                >
                  <option value="">
                    {!canLoadCourses ? "كمّل الاختيارات أولاً"
                      : loadingCourses ? "جارٍ تحميل المواد..."
                      : "— اختار —"}
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.course_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* معلومات المادة */}
            {courseMeta && (
              <div className="card" style={{ padding: 14, background: "#fff" }}>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontWeight: 800, color: "#0a3753" }}>
                  <div>الأستاذ: {courseMeta.instructor}</div>
                  <div>عدد الساعات: {courseMeta.hours}</div>
                  <div>أعمال السنة: {courseMeta.cwMax}</div>
                  <div>النهائي: {courseMeta.feMax}</div>
                  <div>المجموع: {courseMeta.total}</div>
                </div>
              </div>
            )}
          </div>

          {/* ===== بطاقة الطلاب والدرجات ===== */}
          <div className="card" style={{ marginTop: 14 }}>
            <h2 className="card-title">الطلاب والدرجات</h2>

            {/* مفتاح الألوان */}
            {/* {students.length > 0 && (
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10, fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: "#e8f5e9", border: "1px solid #a5d6a7", display: "inline-block" }} />
                  إعادة ناجح (عرض فقط)
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: "#fff3e0", border: "1px solid #ffcc80", display: "inline-block" }} />
                  إعادة راسب (يدخل درجات)
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: "#ffebee", border: "1px solid #ef9a9a", display: "inline-block" }} />
                  غائب
                </span>
              </div>
            )} */}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveGrades}
                disabled={!selectedCourseId || savingGrades || loadingStudents}
              >
                {savingGrades ? "جاري الحفظ..." : "حفظ الدرجات"}
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => fetchStudentsForCourse(selectedCourseId)}
                disabled={!selectedCourseId || loadingStudents}
              >
                {loadingStudents ? "جارٍ التحميل..." : "إعادة تحميل"}
              </button>

              <div style={{ color: "#6b7280", fontWeight: 800, alignSelf: "center" }}>
                عدد الطلاب: {students.length}
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              {!selectedCourseId ? (
                <p style={{ color: "#6b7280" }}>اختار المادة أولاً ليتم جلب الطلاب.</p>
              ) : loadingStudents ? (
                <p>جارٍ تحميل الطلاب...</p>
              ) : students.length === 0 ? (
                <p>لا توجد بيانات طلاب لهذه المادة/الفصل.</p>
              ) : (
                <table className="simple-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>الاسم</th>
                      <th>الرقم الجامعي</th>
                      <th>الحالة</th>
                      <th>غائب؟</th>
                      <th>عقوبة حالة الغش</th>
                      <th>أعمال السنة</th>
                      <th>النهائي</th>
                      <th>المجموع</th>
                      <th>التقدير</th>
                      <th>النقاط</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={s.student_id} style={getRowStyle(s)}>

                        {/* # */}
                        <td>{idx + 1}</td>

                        {/* الاسم */}
                        <td>{s.full_name}</td>

                        {/* الرقم الجامعي */}
                        <td>{s.university_id}</td>

                        {/* ── عمود الحالة (جديد) ── */}
                        <td style={{ textAlign: "center", minWidth: 150 }}>
                          {s.repeat_status_label ? (
                            <>
                              <span style={{
                                background:   s.is_readonly ? "#e8f5e9" : "#fff3e0",
                                color:        s.is_readonly ? "#2e7d32" : "#e65100",
                                padding:      "3px 8px",
                                borderRadius: 8,
                                fontSize:     12,
                                fontWeight:   700,
                                border:       `1px solid ${s.is_readonly ? "#a5d6a7" : "#ffcc80"}`,
                                display:      "inline-block",
                              }}>
                                {s.repeat_status_label}
                              </span>
                              {/* درجة السنة السابقة كمرجع للراسب */}
                              {!s.is_readonly && s.prev_total_mark_ref != null && (
                                <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>
                                  درجته السابقة: {s.prev_total_mark_ref}
                                </div>
                              )}
                            </>
                          ) : "—"}
                        </td>

                        {/* غائب */}
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={!!s.is_absent}
                            onChange={(e) => onChangeAbsent(s.student_id, e.target.checked)}
                            disabled={
                              s.is_readonly ||
                              (s.penalty_type && s.penalty_type !== "none")
                            }
                            style={{ transform: "scale(1.5)" }}
                          />
                        </td>

                        {/* عقوبة الغش */}
                        <td style={{ minWidth: 180 }}>
                          <select
                            className="input-field"
                            value={s.penalty_type || "none"}
                            onChange={(e) => onChangePenalty(s.student_id, e.target.value)}
                            disabled={s.is_readonly || !!s.is_absent}
                            style={{
                              borderColor: s.penalty_type && s.penalty_type !== "none" ? "red" : "",
                              cursor: (s.is_readonly || s.is_absent) ? "not-allowed" : "pointer",
                            }}
                          >
                            {PENALTY_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>

                          {s.penalty_type === "suspension" && (
                            <select
                              className="input-field"
                              style={{ marginTop: 5, border: "1px solid orange", backgroundColor: "#fffaf0" }}
                              value={s.suspension_duration || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setStudents((prev) =>
                                  prev.map((item) =>
                                    item.student_id === s.student_id
                                      ? { ...item, suspension_duration: val }
                                      : item
                                  )
                                );
                              }}
                              disabled={s.is_readonly || !!s.is_absent}
                            >
                              <option value="">-- اختر مدة الإيقاف --</option>
                              {SUSPENSION_OPTIONS.map((period) => (
                                <option key={period.value} value={period.value}>{period.label}</option>
                              ))}
                            </select>
                          )}
                        </td>

                        {/* أعمال السنة */}
                        <td>
                          <input
                            className="input-field"
                            type="number"
                            value={s.coursework_mark ?? ""}
                            onChange={(e) => onChangeMark(s.student_id, "coursework_mark", e.target.value)}
                            disabled={
                              s.is_readonly ||
                              s.is_absent   ||
                              (s.penalty_type && s.penalty_type !== "none" && s.penalty_type !== "warning")
                            }
                            placeholder={s.is_readonly ? "—" : s.is_absent ? "غائب" : "0"}
                            style={s.is_readonly ? { background: "#f9f9f9", color: "#555" } : {}}
                          />
                        </td>

                        {/* النهائي */}
                        <td>
                          <input
                            className="input-field"
                            type="number"
                            value={s.final_exam_mark ?? ""}
                            onChange={(e) => onChangeMark(s.student_id, "final_exam_mark", e.target.value)}
                            disabled={
                              s.is_readonly ||
                              s.is_absent   ||
                              (s.penalty_type && s.penalty_type !== "none" && s.penalty_type !== "warning")
                            }
                            placeholder={s.is_readonly ? "—" : s.is_absent ? "غائب" : "0"}
                            style={s.is_readonly ? { background: "#f9f9f9", color: "#555" } : {}}
                          />
                        </td>

                        {/* المجموع */}
                        <td>
                          {s.is_absent ? "غائب" : (s.total_mark ?? "—")}
                        </td>

                        {/* التقدير */}
                        <td style={{ color: s.is_absent ? "red" : s.is_readonly ? "#2e7d32" : "inherit", fontWeight: s.is_readonly ? 700 : "normal" }}>
                          {s.letter ?? "—"}
                        </td>

                        {/* النقاط */}
                        <td style={{ fontWeight: s.is_readonly ? 700 : "normal" }}>
                          {s.points ?? "—"}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div className={"toast " + (toast.type === "error" ? "toast-error" : "toast-success")}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default GradeEntry;
