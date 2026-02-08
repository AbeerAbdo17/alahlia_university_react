import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const API_BASE = "http://localhost:5000/api";
const DEFAULT_REGISTRAR = "المسجل";

const TERM_OPTIONS = ["الفصل الأول", "الفصل الثاني"];

const ui = {
  page: {
    fontFamily: `"Cairo", "Tajawal", system-ui, -apple-system, "Segoe UI", Arial, sans-serif`,
    fontSize: 16,
  },

  titleH2: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0a3753",
    margin: "10px 0 16px",
  },

  card: {
    border: "1px solid #e6e8ee",
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
    boxShadow: "0 4px 16px rgba(10,55,83,0.06)",
  },

  sectionTitle: {
    marginTop: 0,
    fontSize: 18,
    fontWeight: 800,
    color: "#0a3753",
    marginBottom: 12,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  label: {
    fontSize: 14,
    fontWeight: 800,
    color: "#334155",
  },

  hint: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 10,
    border: "1px solid #d9dee8",
    outline: "none",
    fontSize: 16,
    fontFamily: `"Cairo", "Tajawal", Arial, sans-serif`,
    background: "#fff",
  },

  select: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 10,
    border: "1px solid #d9dee8",
    outline: "none",
    fontSize: 16,
    fontFamily: `"Cairo", "Tajawal", Arial, sans-serif`,
    background: "#fff",
    cursor: "pointer",
  },

  textarea: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 10,
    border: "1px solid #d9dee8",
    outline: "none",
    fontSize: 16,
    fontFamily: `"Cairo", "Tajawal", Arial, sans-serif`,
    background: "#fff",
    resize: "vertical",
  },

  primaryBtn: {
    marginTop: 16,
    padding: "12px 18px",
    background: "#0a3753",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 16,
    fontFamily: `"Cairo", "Tajawal", Arial, sans-serif`,
  },

  secondaryBtn: {
    marginTop: 16,
    padding: "12px 18px",
    background: "#0f766e",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 16,
    fontFamily: `"Cairo", "Tajawal", Arial, sans-serif`,
  },

  tabsRow: {
    display: "flex",
     justifyContent: "center",
    gap: 10,
    marginBottom: 18,
    borderBottom: "1px solid #e6e8ee",
    paddingBottom: 10,
    flexWrap: "wrap",  
  },

  tabBtn: (active) => ({
    padding: "10px 16px",
    borderRadius: 12,
    border: active ? "1px solid #0a3753" : "1px solid #e6e8ee",
    background: active ? "rgba(10,55,83,0.08)" : "#fff",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 15,
    color: "#0a3753",
    fontFamily: `"Cairo", "Tajawal", Arial, sans-serif`,
  }),

  tableWrap: {
    overflowX: "auto",
    border: "1px solid #e6e8ee",
    borderRadius: 12,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 15,
  },

  th: {
    borderBottom: "1px solid #e6e8ee",
    padding: "10px 10px",
    textAlign: "right",
    background: "#f8fafc",
    color: "#0a3753",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  td: {
    borderBottom: "1px solid #f1f5f9",
    padding: "10px 10px",
    textAlign: "right",
    color: "#0f172a",
  },
};


const ACADEMIC_STATUS_OPTIONS = [
  "نظامي",
  "إعاده",
  "محوّل",
  "مجمّد",
  "منسحب",
  "تجسير",
  "فصل",
];

const REGISTRATION_STATUS_OPTIONS = ["مسجّل", "غير مسجّل"];

function useAcademicPeriodsSmartList({ programType, postgraduateProgram }) {
  const [periods, setPeriods] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [termOptions, setTermOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    navigate('/login', { replace: true });
  }
}, [navigate]);

  const fetchAcademicPeriods = async () => {
    try {
      const qs = new URLSearchParams({
        program_type: programType || "bachelor",
      });
      if ((programType || "bachelor") === "postgraduate" && (postgraduateProgram || "").trim()) {
        qs.set("postgraduate_program", postgraduateProgram.trim());
      }

      const res = await fetch(`${API_BASE}/academic-periods?${qs.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل تحميل الفترات");

      const rows = Array.isArray(data) ? data : [];
      setPeriods(rows);

      const ys = Array.from(new Set(rows.map(r => (r.academic_year || "").trim()).filter(Boolean)));
      setYearOptions(ys);
    } catch (e) {
      console.error(e);
      setPeriods([]);
      setYearOptions([]);
      setLevelOptions([]);
      setTermOptions([]);
    }
  };

  const rebuildOptions = (academicYear, levelName) => {
    const y = (academicYear || "").trim();
    const l = (levelName || "").trim();

    const levels = Array.from(
      new Set(
        periods
          .filter(r => (r.academic_year || "").trim() === y)
          .map(r => (r.level_name || "").trim())
          .filter(Boolean)
      )
    );
    setLevelOptions(levels);

    const terms = Array.from(
      new Set(
        periods
          .filter(r =>
            (r.academic_year || "").trim() === y &&
            (r.level_name || "").trim() === l
          )
          .map(r => (r.term_name || "").trim())
          .filter(Boolean)
      )
    );
    setTermOptions(terms);
  };

  const ensurePeriodSaved = async (academicYear, levelName, termName) => {
    const y = (academicYear || "").trim();
    const l = (levelName || "").trim();
    const t = (termName || "").trim();
    if (!y || !l || !t) return;

    try {
      const res = await fetch(`${API_BASE}/academic-periods/ensure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academic_year: y,
          level_name: l,
          term_name: t,
          program_type: programType || "bachelor",
          postgraduate_program:
            (programType || "bachelor") === "postgraduate"
              ? (postgraduateProgram || "").trim() || null
              : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل حفظ الفترة");

      await fetchAcademicPeriods();
    } catch (e) {
      console.error(e);
    }
  };

  return {
    periods,
    yearOptions,
    levelOptions,
    termOptions,
    fetchAcademicPeriods,
    rebuildOptions,
    ensurePeriodSaved,
  };
}


function RegistrationTabs() {
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("promotion");
  

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };




  return (
    <div className="admission-layout" dir="rtl" style={ui.page}>
  
      <header className="library-header">
        <div className="library-header-title">
          <span style={{ fontSize: 22, fontWeight: 800 }}>القبول والتسجيل </span>
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

 
      <main className="library-main">
        <div className="library-container">
          {/* Tabs */}
<div style={ui.tabsRow}>
  <button
    onClick={() => setActiveTab("promotion")}
    style={ui.tabBtn(activeTab === "promotion")}
  >
    بدء سنة/فصل جديد
  </button>

  <button
    onClick={() => setActiveTab("single")}
    style={ui.tabBtn(activeTab === "single")}
  >
    تسجيل طالب
  </button>

  <button
    onClick={() => setActiveTab("failed-courses")}
    style={ui.tabBtn(activeTab === "failed-courses")}
  >
    تسجيل المواد 
  </button>
</div>

{activeTab === "promotion" ? (
  <PromotionTab showToast={showToast} />
) : activeTab === "single" ? (
  <SingleRegistrationTab showToast={showToast} />
) : activeTab === "failed-courses" ? (
  <FailedCoursesRegistrationTab showToast={showToast} />
) : null}

          {toast && (
  <div className={"toast " + (toast.type === "error" ? "toast-error" : "toast-success")}>
    {toast.message}
  </div>
)}

        </div>
      </main>
    </div>
  );
}

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

/* =========================================================
   تاب 1 – بدء سنة/فصل جديد (ترحيل جماعي)
   ========================================================= */
function PromotionTab({ showToast }) {
  const [postgradProgram, setPostgradProgram] = useState("");
  const [programType, setProgramType] = useState("bachelor");
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const pgSmart = usePostgradProgramsSmartList();

  const [fromYear, setFromYear] = useState("");
  const [fromLevel, setFromLevel] = useState("");
  const [fromTerm, setFromTerm] = useState("");

  const [toYear, setToYear] = useState("");
  const [toLevel, setToLevel] = useState("");
  const [termName, setTermName] = useState("");

  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchTransferring, setBatchTransferring] = useState(false); 
  const [promotionResults, setPromotionResults] = useState(null);

  useEffect(() => {
    if (programType === "postgraduate") {
      pgSmart.fetchPrograms();
    } else {
      setPostgradProgram("");
    }
  }, [programType]);

  const smart = useAcademicPeriodsSmartList({
    programType,
    postgraduateProgram: postgradProgram,
  });

  // =========================
  // (1) تحميل الفترات عند اختيار القسم
  // =========================
  useEffect(() => {
    if (!departmentId) {
      setFromYear("");
      setFromLevel("");
      setFromTerm("");
      return;
    }

    if (programType === "postgraduate" && !postgradProgram.trim()) {
      setFromYear("");
      setFromLevel("");
      setFromTerm("");
      return;
    }

    smart.fetchAcademicPeriods();
  }, [departmentId, programType, postgradProgram]);

  // =========================
  // (2) خيارات المستوى الحالي حسب السنة الحالية
  // =========================
  const [fromLevelOptions, setFromLevelOptions] = useState([]);
  useEffect(() => {
    const y = (fromYear || "").trim();
    const rows = smart.periods;

    const levels = Array.from(
      new Set(
        rows
          .filter((r) => (r.academic_year || "").trim() === y)
          .map((r) => (r.level_name || "").trim())
          .filter(Boolean)
      )
    );
    setFromLevelOptions(levels);
  }, [fromYear, smart.periods]);

  // =========================
  // (3) لما يختار السنة + المستوى الحالي → جيب آخر فصل تلقائي
  // =========================
  useEffect(() => {
    if (!departmentId) return;
    if (!fromYear || !fromLevel) {
      setFromTerm("");
      return;
    }

    if (programType === "postgraduate" && !postgradProgram.trim()) {
      setFromTerm("");
      return;
    }

    const qs = new URLSearchParams({
      department_id: departmentId,
      program_type: programType,
      academic_year: fromYear,
      level_name: fromLevel,
    });

    if (programType === "postgraduate") {
      qs.set("postgraduate_program", postgradProgram.trim());
    }

    fetch(`${API_BASE}/registrations/last-period?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const lp = data?.lastPeriod;
        setFromTerm(lp?.term_name || "");
      })
      .catch(() => setFromTerm(""));
  }, [departmentId, programType, postgradProgram, fromYear, fromLevel]);

  // =========================
  // (4) حساب الفترة الجديدة تلقائياً بناءً على الفصل الحالي
  // =========================
useEffect(() => {
  if (!fromTerm || !fromYear || !fromLevel) {
    setToYear("");
    setToLevel("");
    setTermName("");
    return;
  }

  const currentOrder = termOrder(fromTerm);
  // console.log("Debug → الفصل الحالي:", fromTerm, "→ ترتيبه:", currentOrder);

  if (currentOrder === 1) {
    setToYear(fromYear);
    setToLevel(fromLevel);
    setTermName("الفصل الثاني");
  } 
  else if (currentOrder === 2) {
    const nextYear = getNextAcademicYear(fromYear);
    const nextLevel = getNextLevel(fromLevel);

    setToYear(nextYear);
    setToLevel(nextLevel);
    setTermName("الفصل الأول");

    // console.log("اقتراح انتقال → سنة:", nextYear, "مستوى:", nextLevel, "فصل: الأول");
  } 
  else {
    // console.log("ترتيب فصل غير معروف → مفيش اقتراح تلقائي");
    setToYear("");
    setToLevel("");
    setTermName("");
  }
}, [fromTerm, fromYear, fromLevel]);

  // =========================
  // (5) جلب الكليات والأقسام
  // =========================
  useEffect(() => {
    fetch(`${API_BASE}/faculties-list`)
      .then((res) => res.json())
      .then(setFaculties)
      .catch((err) => console.error("Error loading faculties", err));
  }, []);

  useEffect(() => {
    if (!selectedFacultyId) {
      setDepartments([]);
      return;
    }
    fetch(`${API_BASE}/departments/${selectedFacultyId}`)
      .then((res) => res.json())
      .then(setDepartments)
      .catch((err) => console.error("Error loading departments", err));
  }, [selectedFacultyId]);

  // =========================
  // (6) عرض المرشحين ( fromYear + fromLevel + fromTerm)
  // =========================
  const loadCandidates = () => {
    if (!departmentId) {
      showToast("اختاري القسم أولاً", "error");
      return;
    }
    if (programType === "postgraduate" && !postgradProgram.trim()) {
      showToast("اختاري/اكتبي برنامج الدراسات العليا أولاً", "error");
      return;
    }

    if (!fromYear || !fromLevel || !fromTerm) {
      showToast("اختاري السنة الدراسية الحالية والمستوى والفصل أولاً", "error");
      return;
    }

    setLoading(true);

    const qs = new URLSearchParams({
      department_id: departmentId,
      from_year: fromYear,
      from_level: fromLevel,
      from_term: fromTerm || "",
      program_type: programType,
    });

    if (programType === "postgraduate") {
      qs.set("postgraduate_program", postgradProgram.trim());
    }

    fetch(`${API_BASE}/promotion/candidates?${qs.toString()}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "فشل جلب المرشحين");
        return data;
      })
      .then((data) => {
        setCandidates(data);
        setSelectedIds(data.map((s) => s.student_id));
      })
      .catch((err) => {
        console.error("Error loading candidates", err);
        showToast(err.message || "خطأ في جلب الطلاب المرشحين", "error");
      })
      .finally(() => setLoading(false));
  };

  const resetPromotion = () => {
    setProgramType("bachelor");
    setPostgradProgram("");

    setSelectedFacultyId("");
    setDepartmentId("");
    setDepartments([]);

    setFromYear("");
    setFromLevel("");
    setFromTerm("");

    setToYear("");
    setToLevel("");
    setTermName("");

    setCandidates([]);
    setSelectedIds([]);
    setLoading(false);
    setBatchTransferring(false);
  };

  const toggleStudent = (studentId) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // =========================
  // (7) دالة الترحيل الجماعي الجديدة 
  // =========================
  // const startPromotion = async () => {
  //   if (!toYear || !toLevel || !termName) {
  //     showToast("الفترة الجديدة ناقصة (السنة أو المستوى أو الفصل)", "error");
  //     return;
  //   }

  //   if (!selectedIds.length) {
  //     showToast("لايوجد طلاب مختارين", "error");
  //     return;
  //   }

  //   setBatchTransferring(true);

  //   try {
  //     const currentTermOrder = termOrder(fromTerm); // جديد: تحديد النوع
  //     let transferType = "";

  //     if (currentTermOrder === 1) {
  //       transferType = "insideYear";
  //     } else if (currentTermOrder === 2) {
  //       transferType = "newYear";
  //     } else {
  //       throw new Error("الفصل الحالي غير مدعوم للترحيل");
  //     }

  //     const body = {
  //       faculty_id: selectedFacultyId,
  //       department_id: departmentId,
  //       academic_year: fromYear,
  //       level_name: fromLevel,
  //       term_name: fromTerm,
  //       program_type: programType,
  //       postgraduate_program:
  //         programType === "postgraduate" ? (postgradProgram || "").trim() || null : null,
  //       transfer_type: transferType,
  //       new_academic_year: toYear,
  //       new_level_name: toLevel,
  //       new_term_name: termName,
  //       student_ids: selectedIds, // جديد: إرسال الطلاب المختارين فقط
  //     };

  //     const response = await fetch(`${API_BASE}/batch-transfer-students`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(body),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.error || "فشل في عملية الترحيل الجماعي");
  //     }

  //     showToast(
  //       `تم ترحيل ${data.transferred_count || 0} طالب بنجاح`,
  //       "success"
  //     );

  //     resetPromotion();

  //   } catch (err) {
  //     console.error("Batch transfer error:", err);
  //     showToast("حدث خطأ أثناء الترحيل: " + (err.message || "غير معروف"), "error");
  //   } finally {
  //     setBatchTransferring(false);
  //   }
  // };

const handleBatchPromote = async () => {
    if (!toYear || !toLevel || !termName) {
      showToast("الفترة الجديدة ناقصة (السنة أو المستوى أو الفصل)", "error");
      return;
    }
    if (!selectedIds.length) {
      showToast("لا يوجد طلاب مختارين", "error");
      return;
    }
    setBatchTransferring(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        showToast("انتهت الجلسة – يرجى تسجيل الدخول مرة أخرى", "error");
        return;
      }

      console.log("Sending batch promote:", {
        current_academic_year: fromYear,
        current_level_name: fromLevel,
        current_term_name: fromTerm,
        new_academic_year: toYear,
        new_level_name: toLevel,
        new_term_name: termName,
        program_type: programType,
        postgraduate_program: programType === "postgraduate" ? postgradProgram || null : null,
        department_id: departmentId,
        student_ids: selectedIds
      });

      const response = await fetch(`${API_BASE}/batch-promote-to-next-level`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_academic_year: fromYear,
          current_level_name: fromLevel,
          current_term_name: fromTerm,
          new_academic_year: toYear,
          new_level_name: toLevel,
          new_term_name: termName,
          program_type: programType,
          postgraduate_program: programType === "postgraduate" ? postgradProgram || null : null,
          department_id: departmentId,
          student_ids: selectedIds
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "فشل في عملية الترحيل الجماعي");
      }

      setPromotionResults(data.data);

      let message = `تم الترحيل: ${data.data.success.length} ناجح`;
      if (data.data.already_promoted?.length) {
        message += `, ${data.data.already_promoted.length} تم ترحيلهم سابقًا`;
      }
      message += `, ${data.data.failed.length} مرفوض, ${data.data.required_repeat.length} إعادة`;

      showToast(message, "success");
      resetPromotion();
    } catch (err) {
      console.error("Batch promote error:", err);
      showToast("حدث خطأ أثناء الترحيل: " + (err.message || "غير معروف"), "error");
    } finally {
      setBatchTransferring(false);
    }
  };

const termOrder = (t) => {
  if (!t) return 0;
  const term = (t || "").toString().trim();
  if (term.includes("أول") || term === "الفصل الأول" || term === "فصل أول") return 1;
  if (term.includes("ثان") || term === "الفصل الثاني" || term === "فصل ثاني") return 2;

  return 0;
};

const getNextLevel = (currentLevel) => {
  if (!currentLevel) return "";

  const cleanLevel = (currentLevel || "").trim();

  const levelMap = {
    "المستوى الأول":   "المستوى الثاني",
    "المستوى الثاني":  "المستوى الثالث",
    "المستوى الثالث":  "المستوى الرابع",
    "المستوى الرابع":  "المستوى الخامس",
    "المستوى الخامس":  "المستوى السادس",
    // أضيفي أي صيغ أخرى ممكن تكتبها
    "مستوى أول":       "المستوى الثاني",
    "مستوى ثاني":      "المستوى الثالث",
    "مستوى ثالث":      "المستوى الرابع",
  };

  return levelMap[cleanLevel] || cleanLevel; 
};

const getNextAcademicYear = (year) => {
  if (!year || !year.includes("/")) return year;
  
  const [start, end] = year.split("/").map(Number);
  if (isNaN(start) || isNaN(end)) return year;
  
  return `${start + 1}/${end + 1}`;
};


  return (
    <div>
      <h2 style={ui.titleH2}>بدء سنة / فصل دراسي جديد (جماعي)</h2>

      <div style={ui.card}>
        <h3 style={ui.sectionTitle}>نوع البرنامج</h3>

        <div style={{ display: "flex", gap: 20 }}>
          <label>
            <input
              type="radio"
              value="diploma"
              checked={programType === "diploma"}
              onChange={(e) => setProgramType(e.target.value)}
            />
            دبلوم
          </label>
          <label>
            <input
              type="radio"
              value="bachelor"
              checked={programType === "bachelor"}
              onChange={(e) => setProgramType(e.target.value)}
            />
            بكالوريوس
          </label>

          <label>
            <input
              type="radio"
              value="postgraduate"
              checked={programType === "postgraduate"}
              onChange={(e) => setProgramType(e.target.value)}
            />
            دراسات عليا
          </label>
        </div>
      </div>

      {programType === "postgraduate" && (
        <div style={ui.card}>
          <h3 style={ui.sectionTitle}>برنامج الدراسات العليا</h3>

          <input
            type="text"
            list="pg_programs_list"
            value={postgradProgram}
            onChange={(e) => setPostgradProgram(e.target.value)}
            placeholder="مثال: ماجستير إدارة أعمال"
            style={ui.input}
          />
          <datalist id="pg_programs_list">
            {pgSmart.programs.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
      )}

      <div style={ui.card}>
        <div style={ui.grid}>
          <div style={ui.field}>
            <label style={ui.label}>الكلية</label>
            <select
              value={selectedFacultyId}
              onChange={(e) => {
                const newFacultyId = e.target.value;
                setSelectedFacultyId(newFacultyId);

                setDepartmentId("");
                setDepartments([]);

                setFromYear("");
                setFromLevel("");
                setFromTerm("");

                setToYear("");
                setToLevel("");
                setTermName("");

                setCandidates([]);
                setSelectedIds([]);
              }}
              style={ui.select}
            >
              <option value="">اختر الكلية</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.faculty_name}
                </option>
              ))}
            </select>
          </div>

          <div style={ui.field}>
            <label style={ui.label}>القسم</label>
            <select
              value={departmentId}
              onChange={(e) => {
                const newDept = e.target.value;
                setDepartmentId(newDept);

                setFromYear("");
                setFromLevel("");
                setFromTerm("");

                setToYear("");
                setToLevel("");
                setTermName("");

                setCandidates([]);
                setSelectedIds([]);
              }}
              style={ui.select}
            >
              <option value="">اختر القسم</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>

          <div style={ui.field}>
            <label style={ui.label}>السنة الدراسية الحالية</label>
            <input
              type="text"
              list="promo_from_years"
              placeholder="اختار السنة"
              value={fromYear}
              onChange={(e) => {
                setFromYear(e.target.value);
                setFromLevel("");
                setFromTerm("");
                setToYear("");
                setToLevel("");
                setTermName("");
              }}
              style={ui.input}
            />
            <datalist id="promo_from_years">
              {smart.yearOptions.map((x) => (
                <option key={x} value={x} />
              ))}
            </datalist>
          </div>

          <div style={ui.field}>
            <label style={ui.label}>المستوى الحالي</label>
            <input
              type="text"
              list="promo_from_levels"
              placeholder="اختار المستوى"
              value={fromLevel}
              onChange={(e) => {
                setFromLevel(e.target.value);
                setFromTerm("");
                setToYear("");
                setToLevel("");
                setTermName("");
              }}
              style={ui.input}
            />
            <datalist id="promo_from_levels">
              {fromLevelOptions.map((x) => (
                <option key={x} value={x} />
              ))}
            </datalist>
          </div>

          <div style={ui.field}>
            <label style={ui.label}>الفصل الحالي (آخر فصل مسجل)</label>
            <input
              type="text"
              list="promo_from_terms" // إضافة datalist إذا كان لديك خيارات للفصول
              placeholder="اختار الفصل"
              value={fromTerm}
              onChange={(e) => {
                setFromTerm(e.target.value);
                setToYear("");
                setToLevel("");
                setTermName("");
              }}
              style={ui.input}
            />
            <datalist id="promo_from_terms">
              {TERM_OPTIONS.map((x) => ( // افتراضاً إن TERM_OPTIONS موجودة في الكود
                <option key={x} value={x} />
              ))}
            </datalist>
          </div>

          <div style={ui.field}>
            <label style={ui.label}>السنة الدراسية الجديدة</label>
            <input
              type="text"
              list="promo_to_years" // إضافة datalist للسنوات
              placeholder="اختار السنة الجديدة"
              value={toYear}
              onChange={(e) => {
                setToYear(e.target.value);
                setToLevel("");
                setTermName("");
              }}
              style={ui.input}
            />
            <datalist id="promo_to_years">
              {smart.yearOptions.map((x) => ( // استخدام نفس الخيارات أو خيارات مخصصة
                <option key={x} value={x} />
              ))}
            </datalist>
          </div>

          <div style={ui.field}>
            <label style={ui.label}>المستوى الجديد</label>
            <input
              type="text"
              list="promo_to_levels" // إضافة datalist للمستويات
              placeholder="اختار المستوى الجديد"
              value={toLevel}
              onChange={(e) => {
                setToLevel(e.target.value);
                setTermName("");
              }}
              style={ui.input}
            />
            <datalist id="promo_to_levels">
              {smart.levelOptions.map((x) => ( // افتراضاً إن smart.levelOptions موجودة
                <option key={x} value={x} />
              ))}
            </datalist>
          </div>

          <div style={ui.field}>
            <label style={ui.label}>الفصل الدراسي (الجديد)</label>
            <input
              type="text"
              list="promo_terms" // إضافة datalist للفصول
              placeholder="اختار الفصل الجديد"
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              style={ui.input}
            />
            <datalist id="promo_terms">
              {TERM_OPTIONS.map((x) => (
                <option key={x} value={x} />
              ))}
            </datalist>
          </div>
        </div>

        <button onClick={loadCandidates} disabled={loading} style={ui.primaryBtn}>
          {loading ? "جاري التحميل..." : "عرض الطلاب"}
        </button>
      </div>

      {candidates.length > 0 && (
        <div style={ui.card}>
          <h3 style={ui.sectionTitle}>الطلاب</h3>

          <div style={ui.tableWrap}>
            <table style={ui.table}>
              <thead>
                <tr>
                  <th style={ui.th}>اختيار</th>
                  <th style={ui.th}>الرقم الجامعي</th>
                  <th style={ui.th}>اسم الطالب</th>
                  <th style={ui.th}>السنة الدراسية</th>
                  <th style={ui.th}>المستوى</th>
                  <th style={ui.th}>الفصل الدراسي</th>
                  <th style={ui.th}>الموقف الأكاديمي</th>
                  <th style={ui.th}>النجاح</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.student_id}>
                    <td style={ui.td}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.student_id)}
                        onChange={() => toggleStudent(c.student_id)}
                      />
                    </td>
                    <td style={ui.td}>{c.university_id}</td>
                    <td style={ui.td}>{c.full_name}</td>
                    <td style={ui.td}>{c.current_year}</td>
                    <td style={ui.td}>{c.current_level}</td>
                    <td style={ui.td}>{c.current_term || "-"}</td>
                    <td style={ui.td}>{c.academic_status || "غير محدد"}</td>
                    <td style={ui.td}>{c.passed_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

  <button onClick={handleBatchPromote} disabled={batchTransferring} style={ui.secondaryBtn}>
  {batchTransferring ? "جاري الترحيل..." : "بدء سنة / فصل جديد"}
</button>

{promotionResults && (
  <div style={{ marginTop: 24, padding: 16, background: "#f8f9fa", borderRadius: 12, border: "1px solid #e6e8ee" }}>
    <h3 style={ui.sectionTitle}>نتيجة الترحيل الجماعي</h3>

    <div style={{ color: "#16a34a", fontWeight: 800, marginBottom: 12 }}>
      تم ترحيل: {promotionResults.success.length} طالب
    </div>

{promotionResults.already_promoted?.length > 0 && (
      <div style={{ marginBottom: 16 }}>
        <strong style={{ color: "#0891b2" }}>
          تم ترحيلهم سابقًا ({promotionResults.already_promoted.length}):
        </strong>
        <ul style={{ paddingRight: 20, marginTop: 8, listStyleType: "disc" }}>
          {promotionResults.already_promoted.map((a, idx) => (
            <li key={idx} style={{ marginBottom: 6, color: "#0891b2" }}>
              {a.full_name || a.student_id} - {a.reason}
            </li>
          ))}
        </ul>
      </div>
    )}

    {promotionResults.failed.length > 0 && (
      <div style={{ marginBottom: 16 }}>
        <strong style={{ color: "#b91c1c" }}>مرفوضين ({promotionResults.failed.length}):</strong>
        <ul style={{ paddingRight: 20, marginTop: 8, listStyleType: "disc" }}>
          {promotionResults.failed.map((f, idx) => (
            <li key={idx} style={{ marginBottom: 6, color: "#b91c1c" }}>
              {f.full_name || f.student_id} - {f.reason}
            </li>
          ))}
        </ul>
      </div>
    )}

    {promotionResults.required_repeat.length > 0 && (
      <div>
        <strong style={{ color: "#b45309" }}>مطلوب إعادة ({promotionResults.required_repeat.length}):</strong>
        <ul style={{ paddingRight: 20, marginTop: 8, listStyleType: "disc" }}>
          {promotionResults.required_repeat.map((r, idx) => (
            <li key={idx} style={{ marginBottom: 6, color: "#b45309" }}>
              {r.full_name || r.student_id} - {r.reason}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}
        </div>
      )}

      {candidates.length === 0 && !loading && (
        <div style={{ color: "#64748b", fontWeight: 700 }}>
          لم يتم تحميل أي طلاب بعد. اضغط "عرض الطلاب".
        </div>
      )}
    </div>
  );
}



/* =========================================================
   تاب 2 – تسجيل طالب (فردي)
   ========================================================= */
function SingleRegistrationTab({ showToast }) {
  const [hasSearched, setHasSearched] = useState(false);
  const [programType, setProgramType] = useState("bachelor");

  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [lastRegistration, setLastRegistration] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const pgSmart = usePostgradProgramsSmartList();


  const [studentForm, setStudentForm] = useState({
    full_name: "",
    university_id: "",
    phone: "",
  });

  const [form, setForm] = useState({
    academic_year: "",
    level_name: "",
    term_name: "",
    academic_status: "منتظم",
    registration_status: "مسجّل",
    notes: "",
    postgraduate_program: "",

    prev_degree: "",
    prev_university: "",
    prev_grad_year: "",
    study_type: "",
  });


  useEffect(() => {
  if (programType === "postgraduate") {
    pgSmart.fetchPrograms();
  } else {
    setForm((p) => ({
      ...p,
      postgraduate_program: "",
      prev_degree: "",
      prev_university: "",
      prev_grad_year: "",
      study_type: "",
    }));
  }
}, [programType]);

  const smart = useAcademicPeriodsSmartList({
    programType,
    postgraduateProgram: form.postgraduate_program,
  });

  useEffect(() => {
    fetch(`${API_BASE}/faculties-list`)
      .then((res) => res.json())
      .then(setFaculties)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (programType !== "postgraduate") {
      setForm((p) => ({
        ...p,
        postgraduate_program: "",
        prev_degree: "",
        prev_university: "",
        prev_grad_year: "",
        study_type: "",
      }));
    }
  }, [programType]);

  useEffect(() => {
    if (!selectedFacultyId) {
      setDepartments([]);
      return;
    }

    fetch(`${API_BASE}/departments/${selectedFacultyId}`)
      .then((res) => res.json())
      .then(setDepartments)
      .catch(() => {});
  }, [selectedFacultyId]);

  useEffect(() => {
    if (departmentId) smart.fetchAcademicPeriods();
  }, [departmentId, programType, form.postgraduate_program]);

  useEffect(() => {
    smart.rebuildOptions(form.academic_year, form.level_name);
  }, [form.academic_year, form.level_name, smart.periods]);


const searchStudents = async (q) => {
  const text = (q ?? query).trim();

  if (!text) {
    setSearchResults([]);
    setHasSearched(false);
    setSearchLoading(false);
    setSearchError("");
    return;
  }

  try {
    setHasSearched(true);
    setSearchLoading(true);
    setSearchError("");

    const res = await fetch(
      `${API_BASE}/students/search?q=${encodeURIComponent(text)}`
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "خطأ في البحث");
    }

    setSearchResults(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error(err);
    setSearchResults([]);
    setSearchError(err.message || "خطأ في البحث عن الطلاب");
  } finally {
    setSearchLoading(false);
  }
};
useEffect(() => {


  const t = setTimeout(() => {
    searchStudents(query);
  }, 350); 

  return () => clearTimeout(t);
}, [query]);



const selectStudent = (studentId) => {
  fetch(`${API_BASE}/students/${studentId}`)
    .then((res) => res.json())
    .then((data) => {
      setSelectedStudent(data.student);
      setLastRegistration(data.lastRegistration || null);

      const lastProgType = data.lastRegistration?.program_type || "bachelor";
      setProgramType(lastProgType);

      const lastPGProgram = data.lastRegistration?.postgraduate_program || "";

      const pgData = data.lastRegistration?.postgraduate_data || {};

      setForm((prev) => ({
        ...prev,

        academic_year: data.lastRegistration ? data.lastRegistration.academic_year : "",
        level_name: data.lastRegistration ? data.lastRegistration.level_name : "",
        term_name: data.lastRegistration ? (data.lastRegistration.term_name || "") : "",
        academic_status: data.lastRegistration ? data.lastRegistration.academic_status : "منتظم",
        registration_status: data.lastRegistration ? data.lastRegistration.registration_status : "مسجّل",
        notes: "",

        postgraduate_program: lastPGProgram,
        prev_degree: pgData.prev_degree || "",
        prev_university: pgData.prev_university || "",
        prev_grad_year: pgData.prev_grad_year || "",
        study_type: pgData.study_type || "",
      }));

      setStudentForm({
        full_name: data.student.full_name || "",
        university_id: Number(data.student.university_id) === 0 ? "" : String(data.student.university_id),
        phone: data.student.phone || "",
      });

if (data.student?.faculty_id) {
  setSelectedFacultyId(String(data.student.faculty_id));
} else {
  setSelectedFacultyId("");
}

if (data.student?.department_id) {
  setDepartmentId(String(data.student.department_id));
} else {
  setDepartmentId("");
}

    })
    .catch((err) => {
      console.error(err);
     showToast("خطأ في جلب بيانات الطالب", "error");
    });
};


const resetStudentForm = () => {
  setSelectedStudent(null);
  setLastRegistration(null);
  setQuery("");
  setSearchResults([]);
  setHasSearched(false);

  setStudentForm({
    full_name: "",
    university_id: "",
    phone: "",
  });

  setForm({
    academic_year: "",
    level_name: "",
    term_name: "",
    academic_status: "منتظم",
    registration_status: "مسجّل",
    notes: "",
    postgraduate_program: "",

    prev_degree: "",
    prev_university: "",
    prev_grad_year: "",
    study_type: "",
  });

  setProgramType("bachelor");
  setSelectedFacultyId("");
  setDepartmentId("");
};


  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const saveStudentOnly = async () => {
  if (!studentForm.full_name.trim()) {
    showToast("الاسم الرباعي مطلوب", "error");

    return;
  }

  try {
    if (!selectedStudent?.id) {
      const studentBody = {
        full_name: studentForm.full_name,
        university_id: (studentForm.university_id || "").trim(),
        phone: studentForm.phone || null,
        receipt_number: null,
        department_id: departmentId ? Number(departmentId) : null,
        notes: null,
        registrar: DEFAULT_REGISTRAR,
      };

      const res = await fetch(`${API_BASE}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentBody),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "فشل إضافة الطالب", "error");
        return;
      }

      showToast("تم حفظ بيانات الطالب", "success");
     resetStudentForm();
window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const updStudentBody = {
      full_name: studentForm.full_name,
      university_id: (studentForm.university_id || "").trim(),
      phone: studentForm.phone || null,
      department_id: departmentId ? Number(departmentId) : null,
    };

    const resUpd = await fetch(`${API_BASE}/students/${selectedStudent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updStudentBody),
    });

    const dataUpd = await resUpd.json();
    if (!resUpd.ok) {
      showToast(dataUpd.message || "فشل تحديث بيانات الطالب", "error");
      return;
    }

    showToast("تم تحديث بيانات الطالب", "success");

    resetStudentForm();
window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    console.error(e);
   showToast("حدث خطأ أثناء تعديل بيانات الطالب", "error");

  }
};


//   const saveRegistration = async () => {
//     if (!studentForm.full_name.trim()) {
//      showToast("الاسم الرباعي مطلوب", "error");

//       return;
//     }
// if (programType === "postgraduate" && !form.postgraduate_program?.trim()) {
//   showToast("اختاري/اكتبي برنامج الدراسات العليا", "error");
//   return;
// }

//     if (!form.academic_year || !form.level_name) {
//      showToast("السنة الدراسية والمستوى مطلوبان", "error");
//       return;
//     }

//     try {
//       let studentId = selectedStudent ? selectedStudent.id : null;

// if (studentId) {
//   const updStudentBody = {
//     full_name: studentForm.full_name,
//     university_id: (studentForm.university_id || "").trim(),
//     phone: studentForm.phone || null,
//     department_id: departmentId ? Number(departmentId) : null,
//   };

//   const resUpd = await fetch(`${API_BASE}/students/${studentId}`, {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(updStudentBody),
//   });

//   const dataUpd = await resUpd.json();
//   if (!resUpd.ok) {
//     showToast(dataUpd.message || "فشل تحديث بيانات الطالب", "error");
//     return;
//   }
// }


//       if (!studentId) {
//         const studentBody = {
//           full_name: studentForm.full_name,
//           university_id: (studentForm.university_id || "").trim(),
//           phone: studentForm.phone || null,
//           receipt_number: null,
//           department_id: departmentId ? Number(departmentId) : null,
//           notes: null,
//           registrar: DEFAULT_REGISTRAR,
//         };

//         const resStudent = await fetch(`${API_BASE}/students`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(studentBody),
//         });

//         const dataStudent = await resStudent.json();
//         if (!resStudent.ok) {
//           showToast(dataStudent.message || "فشل في إضافة الطالب الجديد", "error");
//           return;
//         }
//         studentId = dataStudent.student_id;
//       }

// const regBody = {
//   student_id: studentId,
//   academic_year: form.academic_year,
//   level_name: form.level_name,
//   term_name: form.term_name || null,
//   academic_status: form.academic_status,
//   registration_status: form.registration_status,
//   notes: form.notes || null,
//   registrar: DEFAULT_REGISTRAR,

//   program_type: programType, 
//   postgraduate_data:
//     programType === "postgraduate"
//       ? {
//           prev_degree: form.prev_degree,
//           prev_university: form.prev_university,
//           prev_grad_year: form.prev_grad_year,
//           study_type: form.study_type,
//         }
//       : null,
//       postgraduate_program: programType === "postgraduate" ? (form.postgraduate_program || null) : null,

// };


//       const resReg = await fetch(`${API_BASE}/registrations`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(regBody),
//       });

//       const dataReg = await resReg.json();
//       if (!resReg.ok) {
//        showToast(dataReg.message || "فشل في حفظ التسجيل", "error");
//         return;
//       }

//       showToast(dataReg.message || "تم تسجيل الطالب بنجاح", "success");

//       resetStudentForm();
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } catch (err) {
//       console.error(err);
//       showToast("حدث خطأ أثناء حفظ التسجيل", "error");

//     }
//   };

const saveRegistration = async () => {
  if (!studentForm.full_name.trim()) {
    showToast("الاسم الرباعي مطلوب", "error");
    return;
  }

  if (programType === "postgraduate" && !form.postgraduate_program?.trim()) {
    showToast("اختاري/اكتبي برنامج الدراسات العليا", "error");
    return;
  }

  if (!form.academic_year || !form.level_name) {
    showToast("السنة الدراسية والمستوى مطلوبان", "error");
    return;
  }

  try {
    // جيب التوكن من localStorage (ده اللي بيحصل بعد اللوجن)
const token = sessionStorage.getItem("token");
    if (!token) {
      showToast("انتهت الجلسة – يرجى تسجيل الدخول مرة أخرى", "error");
      // لو عايزة توجهيها لصفحة اللوجن مباشرة:
      // navigate("/login");
      return;
    }

    let studentId = selectedStudent ? selectedStudent.id : null;

    // 1. تحديث بيانات الطالب إذا موجود
    if (studentId) {
      const updStudentBody = {
        full_name: studentForm.full_name,
        university_id: (studentForm.university_id || "").trim(),
        phone: studentForm.phone || null,
        department_id: departmentId ? Number(departmentId) : null,
      };

      const resUpd = await fetch(`${API_BASE}/students/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,   // ← مهم جدًا
        },
        body: JSON.stringify(updStudentBody),
      });

      if (!resUpd.ok) {
        const errData = await resUpd.json();
        showToast(errData.message || "فشل تحديث بيانات الطالب", "error");
        return;
      }
    }

    // 2. إنشاء طالب جديد إذا مش موجود
    if (!studentId) {
      const studentBody = {
        full_name: studentForm.full_name,
        university_id: (studentForm.university_id || "").trim(),
        phone: studentForm.phone || null,
        receipt_number: null,
        department_id: departmentId ? Number(departmentId) : null,
        notes: null,
        registrar: DEFAULT_REGISTRAR,
      };

      const resStudent = await fetch(`${API_BASE}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,   // ← مهم هنا كمان
        },
        body: JSON.stringify(studentBody),
      });

      const dataStudent = await resStudent.json();

      if (!resStudent.ok) {
        showToast(dataStudent.message || "فشل في إضافة الطالب الجديد", "error");
        return;
      }

      studentId = dataStudent.student_id;
    }

    // 3. التحقق من وجود تسجيل سابق مطابق للفترة
    if (
      lastRegistration &&
      lastRegistration.academic_year === form.academic_year &&
      lastRegistration.level_name === form.level_name &&
      lastRegistration.term_name === form.term_name
    ) {
      // تعديل الموقف الأكاديمي فقط (PUT)
      const regBody = {
        academic_status: form.academic_status,
      };

      const resReg = await fetch(`${API_BASE}/registrations/${lastRegistration.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,   // ← الحل الرئيسي للـ 401
        },
        body: JSON.stringify(regBody),
      });

      const dataReg = await resReg.json();

      if (!resReg.ok) {
        if (resReg.status === 401) {
          showToast("انتهت الجلسة – يرجى تسجيل الدخول مرة أخرى", "error");
        } else {
          showToast(dataReg.message || "فشل في تعديل الموقف الأكاديمي", "error");
        }
        return;
      }

      showToast("تم تعديل الموقف الأكاديمي فقط في السجل الحالي", "success");
    } 
    else {
      // إنشاء تسجيل جديد (POST)
      const regBody = {
        student_id: studentId,
        academic_year: form.academic_year,
        level_name: form.level_name,
        term_name: form.term_name || null,
        academic_status: form.academic_status,
        registration_status: form.registration_status,
        notes: form.notes || null,
        program_type: programType,
        postgraduate_data:
          programType === "postgraduate"
            ? {
                prev_degree: form.prev_degree,
                prev_university: form.prev_university,
                prev_grad_year: form.prev_grad_year,
                study_type: form.study_type,
              }
            : null,
        postgraduate_program: programType === "postgraduate" ? (form.postgraduate_program || null) : null,
      };

      const resReg = await fetch(`${API_BASE}/registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,   // ← مهم جدًا هنا كمان
        },
        body: JSON.stringify(regBody),
      });

      const dataReg = await resReg.json();

      if (!resReg.ok) {
        showToast(dataReg.message || "فشل في حفظ التسجيل الجديد", "error");
        return;
      }

      showToast("تم تسجيل الطالب بنجاح", "success");
    }

    resetStudentForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("خطأ في عملية التسجيل:", err);
    showToast("حدث خطأ غير متوقع أثناء حفظ التسجيل", "error");
  }
};

  return (
    <div>
      <h2 style={ui.titleH2}>تسجيل طالب (فردي)</h2>

      <div style={ui.card}>
        <h3 style={ui.sectionTitle}>البحث عن الطالب</h3>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="اكتب الاسم أو الرقم الجامعي"
            value={query}
            onChange={(e) => {
  setQuery(e.target.value);
  setSelectedStudent(null);   
  setLastRegistration(null); 
}}

            style={ui.input}
          />
          {searchLoading && (
  <div style={{ marginTop: 10, color: "#64748b", fontWeight: 700 }}>
    جاري البحث...
  </div>
)}

{!!searchError && (
  <div style={{ marginTop: 10, color: "#b91c1c", fontWeight: 800 }}>
    {searchError}
  </div>
)}

        </div>

        {searchResults.length > 0 && (
          <div style={{ marginTop: 12, ...ui.tableWrap }}>
            <table style={ui.table}>
              <thead>
                <tr>
                  <th style={ui.th}>اختيار</th>
                  <th style={ui.th}>الاسم</th>
                  <th style={ui.th}>الرقم الجامعي</th>
                  <th style={ui.th}>القسم</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((s) => (
                  <tr key={s.id}>
                    <td style={ui.td}>
                      <button
                        onClick={() => selectStudent(s.id)}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #0a3753",
                          background: "#fff",
                          cursor: "pointer",
                          borderRadius: 10,
                          fontWeight: 800,
                          fontFamily: `"Cairo", Arial`,
                        }}
                      >
                        اختر
                      </button>
                    </td>
                    <td style={ui.td}>{s.full_name}</td>
                    <td style={ui.td}>{s.university_id}</td>
                    <td style={ui.td}>{s.department_name || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

{hasSearched && !searchLoading && searchResults.length === 0 && (
  <div style={{ marginTop: 10, color: "#64748b", fontWeight: 700 }}>
    لا توجد نتائج
  </div>
)}

      </div>

      <div style={ui.card}>
        <div style={ui.card}>
  <h3 style={ui.sectionTitle}>نوع البرنامج</h3>

  <div style={{ display: "flex", gap: 20 }}>
                        <label>
            <input
              type="radio"
              value="diploma"
              checked={programType === "diploma"}
              onChange={(e) => setProgramType(e.target.value)}
            />
            دبلوم
          </label>
    <label>
      <input
        type="radio"
        value="bachelor"
        checked={programType === "bachelor"}
        onChange={(e) => setProgramType(e.target.value)}
      />
      بكالوريوس
    </label>

    <label>
      <input
        type="radio"
        value="postgraduate"
        checked={programType === "postgraduate"}
        onChange={(e) => setProgramType(e.target.value)}
      />
      دراسات عليا
    </label>
  </div>
</div>

        <h3 style={ui.sectionTitle}>بيانات الطالب الأساسية</h3>

        <div style={ui.grid}>
          <div style={ui.field}>
            <label style={ui.label}>الاسم الرباعي</label>
            <input
              type="text"
              value={studentForm.full_name}
              onChange={(e) =>
                setStudentForm((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="اكتب الاسم الرباعي"
              style={ui.input}
            />
          </div>

          <div style={ui.field}>
            <label style={ui.label}>الرقم الجامعي</label>
            <input
              type="text"
              value={studentForm.university_id}
              onChange={(e) =>
                setStudentForm((prev) => ({ ...prev, university_id: e.target.value }))
              }
              placeholder=" مثال: 20260001"
              style={ui.input}
            />
          </div>

          <div style={ui.field}>
            <label style={ui.label}>رقم الهاتف</label>
            <input
              type="text"
              value={studentForm.phone}
              onChange={(e) =>
                setStudentForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="مثال: 09xxxxxxxx"
              style={ui.input}
            />
          </div>

          <div style={ui.field}>
            <label style={ui.label}>الكلية</label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              style={ui.select}
            >
              <option value="">اختر الكلية</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.faculty_name}
                </option>
              ))}
            </select>
          </div>

          <div style={ui.field}>
            <label style={ui.label}>القسم</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              style={ui.select}
              disabled={!selectedFacultyId}
            >
              <option value="">اختر القسم</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>
        </div>
{hasSearched && selectedStudent && (
  <button onClick={saveStudentOnly} style={ui.secondaryBtn}>
    تعديل بيانات الطالب 
  </button>
)}

        {selectedStudent && (
          <div style={{ marginTop: 12, color: "#334155", fontWeight: 800 }}>
            يتم استخدام بيانات الطالب: <span style={{ color: "#0a3753" }}>{selectedStudent.full_name}</span>
          </div>
        )}
      </div>
      <div>
        {programType === "postgraduate" && (
  <div style={ui.card}>
    <h3 style={ui.sectionTitle}>بيانات الدراسات العليا</h3>

    <div style={ui.grid}>
      <div style={ui.field}>
        <label style={ui.label}>المؤهل السابق</label>
        <select
          value={form.prev_degree || ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, prev_degree: e.target.value }))
          }
          style={ui.select}
        >
          <option value="">اختر</option>
          <option value="بكالوريوس">بكالوريوس</option>
          <option value="دبلوم عالي">دبلوم عالي</option>
          <option value="ماجستير">ماجستير</option>
        </select>
      </div>

      <div style={ui.field}>
        <label style={ui.label}>الجامعة</label>
        <input
          type="text"
          value={form.prev_university || ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, prev_university: e.target.value }))
          }
          style={ui.input}
        />
      </div>

      <div style={ui.field}>
        <label style={ui.label}>سنة التخرج</label>
        <input
          type="text"
          value={form.prev_grad_year || ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, prev_grad_year: e.target.value }))
          }
          style={ui.input}
        />
      </div>

      <div style={ui.field}>
        <label style={ui.label}>نوع الدراسة</label>
        <select
          value={form.study_type || ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, study_type: e.target.value }))
          }
          style={ui.select}
        >
          <option value="">اختر</option>
          <option value="بالبحث">بحث</option>
          <option value="بالكورسات">كورسات</option>
        </select>
      </div>
<div style={ui.field}>
  <label style={ui.label}>برنامج الدراسات العليا</label>
  <input
    type="text"
    list="single_pg_programs"
    value={form.postgraduate_program || ""}
    onChange={(e) => setForm((p) => ({ ...p, postgraduate_program: e.target.value }))}
    placeholder="مثال: ماجستير إدارة أعمال"
    style={ui.input}
  />
  <datalist id="single_pg_programs">
    {pgSmart.programs.map((p) => (
      <option key={p} value={p} />
    ))}
  </datalist>
</div>

    </div>
  </div>
)}
</div>

      <div style={ui.card}>
        <h3 style={ui.sectionTitle}>تسجيل جديد لسنة/فصل دراسي</h3>

        <div style={ui.grid}>
          <div style={ui.field}>
            <label style={ui.label}>السنة الدراسية</label>
<input
  type="text"
  name="academic_year"
  list="single_years"
  placeholder="مثال: 2025/2026"
  value={form.academic_year}
  onChange={(e) => {
    setForm((p) => ({ ...p, academic_year: e.target.value, level_name: "", term_name: "" }));
  }}
  style={ui.input}
/>
<datalist id="single_years">
  {smart.yearOptions.map((x) => <option key={x} value={x} />)}
</datalist>

          </div>

          <div style={ui.field}>
            <label style={ui.label}>المستوى الدراسي</label>
<input
  type="text"
  name="level_name"
  list="single_levels"
  placeholder="مثال: المستوى الثاني"
  value={form.level_name}
  onChange={(e) => {
    setForm((p) => ({ ...p, level_name: e.target.value, term_name: "" }));
  }}
  style={ui.input}
/>
<datalist id="single_levels">
  {smart.levelOptions.map((x) => <option key={x} value={x} />)}
</datalist>

          </div>

          <div style={ui.field}>
            <label style={ui.label}>الفصل الدراسي</label>
<input
  type="text"
  name="term_name"
  list="single_terms"
  placeholder="مثال:الفصل الأول/الفصل الثاني"
  value={form.term_name}
  onChange={(e) => setForm((p) => ({ ...p, term_name: e.target.value }))}
  onBlur={() => smart.ensurePeriodSaved(form.academic_year, form.level_name, form.term_name)}
  style={ui.input}
/>
<datalist id="single_terms">
  {smart.termOptions.map((x) => <option key={x} value={x} />)}
</datalist>

            <datalist id="termOptionsSingle">
              {TERM_OPTIONS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div style={ui.field}>
            <label style={ui.label}>الموقف الأكاديمي</label>
            <select
              name="academic_status"
              value={form.academic_status}
              onChange={handleFormChange}
              style={ui.select}
            >
              {ACADEMIC_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div style={ui.field}>
            <label style={ui.label}>حالة التسجيل</label>
            <select
              name="registration_status"
              value={form.registration_status}
              onChange={handleFormChange}
              style={ui.select}
            >
              {REGISTRATION_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div style={{ ...ui.field, gridColumn: "1 / span 2" }}>
            <label style={ui.label}>ملاحظات</label>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleFormChange}
              style={ui.textarea}
              placeholder="أي ملاحظات إضافية..."
            />
          </div>
        </div>

        <button onClick={saveRegistration} style={ui.primaryBtn}>
          حفظ التسجيل
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   تاب 3 – تسجيل مواد الرسوب / إعادة المواد
   ========================================================= */
function FailedCoursesRegistrationTab({ showToast }) {
  const [programType, setProgramType] = useState("bachelor");
  const [postgradProgram, setPostgradProgram] = useState("");

  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [academicYear, setAcademicYear] = useState("");
  const [levelName, setLevelName] = useState("");
  const [termName, setTermName] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [failedCourses, setFailedCourses] = useState([]);
  const [registeredInCurrentPeriod, setRegisteredInCurrentPeriod] = useState([]);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const pgSmart = usePostgradProgramsSmartList();
  const smart = useAcademicPeriodsSmartList({
    programType,
    postgraduateProgram: postgradProgram,
  });

  // تحميل الكليات
  useEffect(() => {
    fetch(`${API_BASE}/faculties-list`)
      .then((res) => res.json())
      .then(setFaculties)
      .catch(() => showToast("خطأ في تحميل الكليات", "error"));
  }, []);

  // تحميل الأقسام
  useEffect(() => {
    if (!selectedFacultyId) {
      setDepartments([]);
      setDepartmentId("");
      return;
    }
    fetch(`${API_BASE}/departments/${selectedFacultyId}`)
      .then((res) => res.json())
      .then(setDepartments)
      .catch(() => showToast("خطأ في تحميل الأقسام", "error"));
  }, [selectedFacultyId]);

  useEffect(() => {
    if (departmentId || (programType === "postgraduate" && postgradProgram.trim())) {
      smart.fetchAcademicPeriods();
    }
  }, [departmentId, programType, postgradProgram]);

  useEffect(() => {
    smart.rebuildOptions(academicYear, levelName);
  }, [academicYear, levelName, smart.periods]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      fetch(`${API_BASE}/students/search?q=${encodeURIComponent(query.trim())}`)
        .then(r => r.json())
        .then(data => setSearchResults(Array.isArray(data) ? data : []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const selectStudent = (id) => {
    fetch(`${API_BASE}/students/${id}`)
      .then(r => r.json())
      .then(data => {
        setSelectedStudent(data.student || null);
        setPostgradProgram(data.lastRegistration?.postgraduate_program || "");
        setProgramType(data.lastRegistration?.program_type || "bachelor");

        if (data.student?.faculty_id) setSelectedFacultyId(String(data.student.faculty_id));
        if (data.student?.department_id) setDepartmentId(String(data.student.department_id));

        loadFailedCourses(id);
      })
      .catch(() => showToast("خطأ في جلب بيانات الطالب", "error"));
  };

  const loadFailedCourses = async (studentId) => {
    try {
      const res = await fetch(`${API_BASE}/student-failed-courses?student_id=${studentId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      setFailedCourses(Array.isArray(data) ? data : []);
      setRegisteredInCurrentPeriod([]); 
    } catch (err) {
      showToast(err.message || "تعذر جلب مواد الرسوب", "error");
      setFailedCourses([]);
    }
  };

  const resetPeriodForm = () => {
    setAcademicYear("");
    setLevelName("");
    setTermName("");
    setRegisteredInCurrentPeriod([]);
  };

  const registerFailedCourse = async (course) => {
    if (!departmentId || !academicYear || !levelName || !termName) {
      showToast("املئي السنة والمستوى والفصل أولاً", "error");
      return;
    }

    try {
      const body = {
        student_id: selectedStudent.id,
        course_id: course.course_id,
        academic_year: academicYear,
        level_name: levelName,
        term_name: termName,
        program_type: programType,
        postgraduate_program: programType === "postgraduate" ? postgradProgram : null,
        registration_status: "مسجل",
        notes: "إعادة مادة راسبة"
      };

      const res = await fetch(`${API_BASE}/register-failed-course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          showToast(
            `المادة "${course.course_name}" مسجلة بالفعل في الفترة: ${academicYear} - ${levelName} - ${termName}`,
            "warning"
          );
          setRegisteredInCurrentPeriod(prev => [...new Set([...prev, course.course_id])]);
        } else {
          throw new Error(data.error || "فشل التسجيل");
        }
        return;
      }

      showToast("تم تسجيل إعادة المادة بنجاح", "success");

      setRegisteredInCurrentPeriod(prev => [...new Set([...prev, course.course_id])]);
      setFailedCourses(prev => prev.filter(c => c.course_id !== course.course_id));
      resetPeriodForm();

    } catch (err) {
      showToast(err.message || "حدث خطأ أثناء التسجيل", "error");
    }
  };

  const isCourseRegisteredInPeriod = (courseId) => {
    return registeredInCurrentPeriod.includes(courseId);
  };

  return (
    <div>
      <h2 style={ui.titleH2}>تسجيل مواد الرسوب / إعادة المواد</h2>

      {/* نوع البرنامج */}
      <div style={ui.card}>
        <h3 style={ui.sectionTitle}>نوع البرنامج</h3>
        <div style={{ display: "flex", gap: 20 }}>
                              <label>
            <input
              type="radio"
              value="diploma"
              checked={programType === "diploma"}
              onChange={(e) => setProgramType(e.target.value)}
            />
            دبلوم
          </label>
          <label>
            <input
              type="radio"
              value="bachelor"
              checked={programType === "bachelor"}
              onChange={(e) => setProgramType(e.target.value)}
            />
            بكالوريوس
          </label>
          <label>
            <input
              type="radio"
              value="postgraduate"
              checked={programType === "postgraduate"}
              onChange={(e) => setProgramType(e.target.value)}
            />
            دراسات عليا
          </label>
        </div>
      </div>

      {/* برنامج الدراسات العليا */}
      {programType === "postgraduate" && (
        <div style={ui.card}>
          <h3 style={ui.sectionTitle}>برنامج الدراسات العليا</h3>
          <input
            type="text"
            list="pg_programs_failed"
            value={postgradProgram}
            onChange={(e) => setPostgradProgram(e.target.value)}
            placeholder="مثال: ماجستير إدارة أعمال"
            style={ui.input}
          />
          <datalist id="pg_programs_failed">
            {pgSmart.programs.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
      )}

      {/* الكلية + القسم */}
      <div style={ui.card}>
        <div style={ui.grid}>
          <div style={ui.field}>
            <label style={ui.label}>الكلية</label>
            <select
              value={selectedFacultyId}
              onChange={(e) => {
                setSelectedFacultyId(e.target.value);
                setDepartmentId("");
              }}
              style={ui.select}
            >
              <option value="">اختر الكلية</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.faculty_name}
                </option>
              ))}
            </select>
          </div>

          <div style={ui.field}>
            <label style={ui.label}>القسم</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={!selectedFacultyId}
              style={ui.select}
            >
              <option value="">اختر القسم</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* البحث عن الطالب */}
      <div style={ui.card}>
        <h3 style={ui.sectionTitle}>البحث عن الطالب</h3>
        <input
          type="text"
          placeholder="اكتب الاسم أو الرقم الجامعي"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={ui.input}
        />

        {searchLoading && <div style={{ marginTop: 10, color: "#64748b" }}>جاري البحث...</div>}

        {searchResults.length > 0 && (
          <div style={{ marginTop: 12, ...ui.tableWrap }}>
            <table style={ui.table}>
              <thead>
                <tr>
                  <th style={ui.th}>اختيار</th>
                  <th style={ui.th}>الاسم</th>
                  <th style={ui.th}>الرقم الجامعي</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((s) => (
                  <tr key={s.id}>
                    <td style={ui.td}>
                      <button
                        onClick={() => selectStudent(s.id)}
                        style={{
                          padding: "6px 12px",
                          background: "#0a3753",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      >
                        اختر
                      </button>
                    </td>
                    <td style={ui.td}>{s.full_name}</td>
                    <td style={ui.td}>{s.university_id || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* فلاتر الفترة الجديدة - بالطريقة الذكية زي PromotionTab */}
      {selectedStudent && departmentId && (
        <>
          <div style={ui.card}>
            <h3 style={ui.sectionTitle}>الفترة الدراسية لإعادة المواد</h3>
            <div style={ui.grid}>
              {/* السنة الدراسية */}
              <div style={ui.field}>
                <label style={ui.label}>السنة الدراسية</label>
                <input
                  type="text"
                  list="re_year_list"
                  placeholder="مثال: 2025/2026"
                  value={academicYear}
                  onChange={(e) => {
                    setAcademicYear(e.target.value);
                    setLevelName("");
                    setTermName("");
                    setRegisteredInCurrentPeriod([]);
                  }}
                  style={ui.input}
                />
                <datalist id="re_year_list">
                  {smart.yearOptions.map((y) => (
                    <option key={y} value={y} />
                  ))}
                </datalist>
              </div>

              {/* المستوى */}
              <div style={ui.field}>
                <label style={ui.label}>المستوى</label>
                <input
                  type="text"
                  list="re_level_list"
                  placeholder="مثال: المستوى الثاني"
                  value={levelName}
                  onChange={(e) => {
                    setLevelName(e.target.value);
                    setTermName("");
                    setRegisteredInCurrentPeriod([]);
                  }}
                  style={ui.input}
                  disabled={!academicYear}
                />
                <datalist id="re_level_list">
                  {smart.levelOptions.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </div>

              {/* الفصل */}
              <div style={ui.field}>
                <label style={ui.label}>الفصل الدراسي</label>
                <input
                  type="text"
                  list="re_term_list"
                  placeholder="مثال: فصل أول"
                  value={termName}
                  onChange={(e) => {
                    setTermName(e.target.value);
                    setRegisteredInCurrentPeriod([]);
                  }}
                  onBlur={() => {
                    if (academicYear && levelName && termName) {
                      smart.ensurePeriodSaved(academicYear, levelName, termName);
                    }
                  }}
                  style={ui.input}
                  disabled={!levelName}
                />
                <datalist id="re_term_list">
                  {smart.termOptions.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* قائمة المواد الراسبة */}
          <div style={ui.card}>
            <h3 style={ui.sectionTitle}>
              مواد الرسوب للطالب: {selectedStudent?.full_name || "غير محدد"}
            </h3>

            {failedCourses.length === 0 ? (
              <p style={{ color: "#64748b", fontWeight: 700 }}>
                لا توجد مواد  تم الرسوب فيها   لهذا الطالب
              </p>
            ) : (
              <div style={ui.tableWrap}>
                <table style={ui.table}>
                  <thead>
                    <tr>
                      <th style={ui.th}>اسم المادة</th>
                      <th style={ui.th}>السنة السابقة</th>
                      <th style={ui.th}>المستوى السابق</th>
                      <th style={ui.th}>الفصل السابق</th>
                      <th style={ui.th}>الدرجة</th>
                      <th style={ui.th}>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedCourses.map((c) => {
                      const isRegistered = isCourseRegisteredInPeriod(c.course_id);
                      return (
                        <tr key={c.course_id}>
                          <td style={ui.td}>{c.course_name}</td>
                          <td style={ui.td}>{c.academic_year}</td>
                          <td style={ui.td}>{c.level_name}</td>
                          <td style={ui.td}>{c.term_name}</td>
                          <td style={ui.td}>
                            {c.total_mark ? `${c.total_mark}/100` : "—"} ({c.letter || "غير مدخلة"})
                          </td>
                          <td style={ui.td}>
                            {isRegistered ? (
                              <span style={{ color: "#16a34a", fontWeight: 800 }}>
                                تم تسجيلها بالفعل في {academicYear} - {levelName} - {termName}
                              </span>
                            ) : (
                              <button
                                onClick={() => registerFailedCourse(c)}
                                style={{
                                  padding: "8px 16px",
                                  background: "#b45309",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 8,
                                  cursor: "pointer",
                                  fontWeight: 700,
                                }}
                              >
                                سجّل إعادة
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!departmentId && selectedStudent && (
        <div style={{ color: "#b91c1c", fontWeight: 700, margin: "20px 0" }}>
          يرجى اختيار الكلية والقسم أولاً لتحديد الفترة الدراسية الجديدة
        </div>
      )}
    </div>
  );
}

export default RegistrationTabs;