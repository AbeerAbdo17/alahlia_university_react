import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import html2pdf from 'html2pdf.js';


const API_BASE = "http://localhost:5000/api";
const DEFAULT_REGISTRAR = "";

const TERM_OPTIONS = ["الفصل الأول", "الفصل الثاني"];

const TERMS_NORMAL = ["الفصل الأول", "الفصل الثاني"];
const TERMS_POSTGRAD = ["الفصل الأول", "الفصل الثاني", "الفصل الثالث"];

const INSTALLMENT_OPTIONS = [
  // { label: "بدون أقساط (دفع كامل)", value: 0 },
  { label: "قسط واحد", value: 1 },
  { label: "قسطين", value: 2 },
  { label: "3 أقساط", value: 3 },
  { label: "4 أقساط", value: 4 },
  { label: "5 أقساط", value: 5 },
  { label: "6 أقساط", value: 6 },
];

const SCHOLARSHIP_OPTIONS = [
  { type: "لا منحة", percentage: 0 },
  { type: "منحة أبناء مؤسسين", percentage: 100 },
  { type: "منحة أبناء عاملين", percentage: 75 },
  { type: "منحة تفوق", percentage: 100 },
  { type: "منحة أشقاء", percentage: null },
  { type: "تخفيضات المدير", percentage: null },
  { type: "أخرى", percentage: null },
];

const ALLOWED_LEVELS = [
  "المستوى الأول",
  "المستوى الثاني",
  "المستوى الثالث",
  "المستوى الرابع",
  "المستوى الخامس",
  "المستوى السادس"
];

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

const isValidYearFormat = (year) => /^\d{4}\/\d{4}$/.test(year);

const handleYearInput = (value, setter) => {
  const filtered = value.replace(/[^\d/]/g, ''); 
  setter(filtered);
};

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
const ACADEMIC_STATUS_OPTIONS = [
  "منتظم",
  "إعادة",
  " محوّل داخلي",
  "محول خارجي",
  "مجمّد",
  "منسحب",
  "تجسير",
  "فصل",
  "حملة درجات علمية",
];

const ACADEMIC_STATUS_PG = ["منتظم", "فصل"];

const REGISTRATION_STATUS_OPTIONS = [" مسجّل", " غير مسجّل"];

function useAcademicPeriodsSmartList({ programType, postgraduateProgram }) {
  const [periods, setPeriods] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [termOptions, setTermOptions] = useState([]);
  const navigate = useNavigate();



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

function useNationalitySmartList() {
  const [nationalities, setNationalities] = useState([]);

const fetchNationalities = async () => {
    try {
      const res = await fetch(`${API_BASE}/students/nationalities`);
      const data = await res.json();
      setNationalities(data);
    } catch (err) {
      console.error("Error fetching nationalities", err);
    }
  };

  return { nationalities, fetchNationalities };
}


function RegistrationTabs() {
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("promotion");
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const regTabsPerm = user?.registration_tab_permissions || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [studentSuggestions, setStudentSuggestions] = useState([]);
  const [selectedFeesStudent, setSelectedFeesStudent] = useState(null);
  const [feesData, setFeesData] = useState({
    faculty_name: "",
    department_name: "",
    academic_year: "",
    level_name: "",
    term_name: "",
    registration_fee: "",
    tuition_fee: "",
    late_fee: "",
    installment_1: "",
    installment_2: "",
    installment_3: "",
    installment_4: "",
    installment_5: "",   
    installment_6: "",
    scholarship_type: "لا منحة",
    scholarship_percentage: 0,
    scholarship_granted_by: "",
    currency: "SDG",
    payment_start_date: "",
    payment_end_date: "",
  });
  const [loadingFees, setLoadingFees] = useState(false);
  const [isDefaultFeesMode, setIsDefaultFeesMode] = useState(true); 

  const [feesProgramType, setFeesProgramType] = useState("bachelor");
  const [feesPostgradProgram, setFeesPostgradProgram] = useState("");
  const [feesFacultyId, setFeesFacultyId] = useState("");
  const [feesDepartmentId, setFeesDepartmentId] = useState("");
  const [feesAcademicYear, setFeesAcademicYear] = useState("");
  const [feesLevelName, setFeesLevelName] = useState("");
  const [feesTermName, setFeesTermName] = useState("");

  const [feesFaculties, setFeesFaculties] = useState([]);
  const [feesDepartments, setFeesDepartments] = useState([]);

  const [installmentCount, setInstallmentCount] = useState(0);

  const feesSmart = useAcademicPeriodsSmartList({
    programType: feesProgramType,
    postgraduateProgram: feesPostgradProgram,
  });

  useEffect(() => {
    fetch(`${API_BASE}/faculties-list`)
      .then(res => res.json())
      .then(setFeesFaculties)
      .catch(() => showToast("خطأ في تحميل الكليات", "error"));
  }, []);

  useEffect(() => {
    if (!feesFacultyId) {
      setFeesDepartments([]);
      setFeesDepartmentId("");
      return;
    }
    fetch(`${API_BASE}/departments/${feesFacultyId}`)
      .then(res => res.json())
      .then(setFeesDepartments)
      .catch(() => showToast("خطأ في تحميل الأقسام", "error"));
  }, [feesFacultyId]);

  useEffect(() => {
    if (feesDepartmentId || (feesProgramType === "postgraduate" && feesPostgradProgram.trim())) {
      feesSmart.fetchAcademicPeriods();
    }
  }, [feesDepartmentId, feesProgramType, feesPostgradProgram, feesSmart]);

  useEffect(() => {
    feesSmart.rebuildOptions(feesAcademicYear, feesLevelName);
  }, [feesAcademicYear, feesLevelName, feesSmart.periods]);
  
  

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
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
  {[
    { id: "promotion",      title: "بدء سنة/فصل جديد",  key: "promotion"      },
    { id: "single",         title: "تسجيل طالب",        key: "single"         },
    { id: "failed-courses", title: "تسجيل المواد",      key: "failed-courses" },
    { id: "fees",           title: "الرسوم",            key: "fees"           },
  ]
    .filter(tab => {
      if (user.role === 'admin') return true;
      if (Object.keys(regTabsPerm).length === 0) return true;
      if (regTabsPerm[tab.key] === true) return true;
      return false;
    })
    .map(tab => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        style={ui.tabBtn(activeTab === tab.id)}
      >
        {tab.title}
      </button>
    ))}
</div>

{(() => {
  if (activeTab === "promotion") return <PromotionTab showToast={showToast} />;
  if (activeTab === "single")    return <SingleRegistrationTab showToast={showToast} />;
  if (activeTab === "failed-courses") return <FailedCoursesRegistrationTab showToast={showToast} />;
  if (activeTab === "fees")      return <FeesTab showToast={showToast} />;
  return null;
})()}

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

  const navigate = useNavigate();

useEffect(() => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    const timer = setTimeout(() => {
      showToast("انتهت الجلسة", "error");
      navigate("/login", { replace: true });
    }, 0);
    return () => clearTimeout(timer);
  }
}, [navigate]); 

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
  // (3)  السنة + المستوى الحالي → جيب آخر فصل تلقائي
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
// useEffect(() => {
//   if (!fromTerm || !fromYear || !fromLevel) {
//     setToYear("");
//     setToLevel("");
//     setTermName("");
//     return;
//   }

//   const currentOrder = termOrder(fromTerm);

//   if (currentOrder === 1) {
//     setToYear(fromYear);
//     setToLevel(fromLevel);
//     setTermName("الفصل الثاني");
//   } 
//   else if (currentOrder === 2) {
//     const nextYear = getNextAcademicYear(fromYear);
//     const nextLevel = getNextLevel(fromLevel);

//     setToYear(nextYear);
//     setToLevel(nextLevel);
//     setTermName("الفصل الأول");

//   } 
//   else {
//     setToYear("");
//     setToLevel("");
//     setTermName("");
//   }
// }, [fromTerm, fromYear, fromLevel]);

useEffect(() => {
  if (!fromTerm || !fromYear || !fromLevel) {
    setToYear("");
    setToLevel("");
    setTermName("");
    return;
  }

  const currentOrder = termOrder(fromTerm);

  // --- وضع الدراسات العليا ---
  if (programType === "postgraduate") {
    if (currentOrder === 1) {
      setToYear(fromYear);
      setToLevel(fromLevel); // تبقى نفس الدفعة
      setTermName("الفصل الثاني");
    } else if (currentOrder === 2) {
      setToYear(fromYear);
      setToLevel(fromLevel); // تبقى نفس الدفعة
      setTermName("الفصل الثالث");
    } else if (currentOrder === 3) {
      // ننتقل للسنة التالية ولكن نفس الدفعة تبدأ فصل أول جديد
      setToYear(getNextAcademicYear(fromYear));
      setToLevel(fromLevel);
      setTermName("الفصل الأول");
    }
  } 
  // --- وضع البكالوريوس والدبلوم الأصلي (كما هو) ---
  else {
    if (currentOrder === 1) {
      setToYear(fromYear);
      setToLevel(fromLevel);
      setTermName("الفصل الثاني");
    } else if (currentOrder === 2) {
      setToYear(getNextAcademicYear(fromYear));
      setToLevel(getNextLevel(fromLevel));
      setTermName("الفصل الأول");
    } else {
      setToYear("");
      setToLevel("");
      setTermName("");
    }
  }
}, [fromTerm, fromYear, fromLevel, programType]); // أضفنا programType هنا

  // =========================
  // (5) جلب الكليات والأقسام
  // =========================
useEffect(() => {
  fetch(`${API_BASE}/faculties-list`)
    .then(res => res.json())
    .then(allFaculties => {
      const allowed = getAllowedFaculties();
      if (allowed === null) {
        // admin → كل الكليات
        setFaculties(allFaculties);
      } else {
        // فلتر حسب المسموح
        const filtered = allFaculties.filter(f => allowed.includes(f.id));
        setFaculties(filtered);
        if (filtered.length === 0) {
          showToast("لا توجد كليات مسموح لك الوصول إليها", "error");
        }
      }
    })
    .catch(err => {
      // console.error("Error loading faculties", err);
      showToast("خطأ في تحميل الكليات", "error");
    });
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
      showToast("اختار/اكتب برنامج الدراسات العليا أولاً", "error");
      return;
    }

    if (!fromYear || !fromLevel || !fromTerm) {
      showToast("اختار السنة الدراسية الحالية والمستوى والفصل أولاً", "error");
      return;
    }

    setLoading(true);
    const token = sessionStorage.getItem("token");

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
        if (res.status === 401) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            showToast("انتهت الجلسة، يرجى إعادة تسجيل الدخول", "error");
            navigate("/login");
            return null;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "فشل جلب المرشحين");
        return data;
      })
      .then((data) => {
        setCandidates(data);
        setSelectedIds(data.map((s) => s.student_id));
      })
      .catch((err) => {
        // console.error("Error loading candidates", err);
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
  // (7) دالة الترحيل الجماعي  
  // =========================


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
          navigate("/login");
        return;
      }

      // console.log("Sending batch promote:", {
      //   current_academic_year: fromYear,
      //   current_level_name: fromLevel,
      //   current_term_name: fromTerm,
      //   new_academic_year: toYear,
      //   new_level_name: toLevel,
      //   new_term_name: termName,
      //   program_type: programType,
      //   postgraduate_program: programType === "postgraduate" ? postgradProgram || null : null,
      //   department_id: departmentId,
      //   student_ids: selectedIds
      // });

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

      if (response.status === 401) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            showToast("انتهت الجلسة – يرجى تسجيل الدخول مرة أخرى", "error");
            navigate("/login");
            return;
        }

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
      // resetPromotion();
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
  if (term.includes("ثالث") || term === "الفصل الثالث" || term === "فصل ثالث") return 3;
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
  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
    {getAllowedProgramTypes().map(type => (
      <label key={type} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input
          type="radio"
          value={type}
          checked={programType === type}
          onChange={(e) => setProgramType(e.target.value)}
        />
        {type === "diploma" && "دبلوم"}
        {type === "bachelor" && "بكالوريوس"}
        {type === "postgraduate" && "دراسات عليا"}
      </label>
    ))}
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
              placeholder="مثلاً: 2023/2024"
              value={fromYear}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d/]/g, "");
                setFromYear(val);
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
  <label style={ui.label}>
    {programType === "postgraduate" ? "الدفعة " : "المستوى الحالي"}
  </label>
  <input
    type="text"
    list="promo_from_levels"
    placeholder={programType === "postgraduate" ? "مثلاً: الدفعة الأولى" : "اختر المستوى"}
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
  <label style={ui.label}>الفصل الحالي</label>
  <select
    value={fromTerm}
    onChange={(e) => {
      setFromTerm(e.target.value);
      setToYear("");
      setToLevel("");
      setTermName("");
    }}
    style={ui.select}
  >
    <option value="">اختر الفصل</option>
    {(programType === "postgraduate" ? TERMS_POSTGRAD : TERMS_NORMAL).map((x) => (
      <option key={x} value={x}>{x}</option>
    ))}
  </select>
</div>

          <div style={ui.field}>
            <label style={ui.label}>السنة الدراسية الجديدة</label>
            <input
              type="text"
              list="promo_to_years"
              placeholder="2024/2025"
              value={toYear}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d/]/g, "");
                setToYear(val);
                setToLevel("");
                setTermName("");
              }}
              style={ui.input}
            />
            <datalist id="promo_to_years">
              {smart.yearOptions.map((x) => (
                <option key={x} value={x} />
              ))}
            </datalist>
          </div>

<div style={ui.field}>
  <label style={ui.label}>
    {programType === "postgraduate" ? "الدفعة (تأكيد)" : "المستوى الجديد"}
  </label>
  <input
    type="text"
    list="promo_to_levels"
    placeholder={programType === "postgraduate" ? "مثلاً: الدفعة الأولى" : "اختر المستوى"}
    value={toLevel}
    onChange={(e) => {
      setToLevel(e.target.value);
      setTermName("");
    }}
    style={ui.input}
  />
  {/* الداتالست تظهر فقط في غير الدراسات العليا */}
  {programType !== "postgraduate" && (
    <datalist id="promo_to_levels">
      {smart.levelOptions.map((x) => (
        <option key={x} value={x} />
      ))}
    </datalist>
  )}
</div>

<div style={ui.field}>
  <label style={ui.label}>الفصل الدراسي (الجديد)</label>
  <select
    value={termName}
    onChange={(e) => setTermName(e.target.value)}
    style={ui.select}
  >
    <option value="">اختر الفصل الجديد</option>
    {(programType === "postgraduate" ? TERMS_POSTGRAD : TERMS_NORMAL).map((x) => (
      <option key={x} value={x}>{x}</option>
    ))}
  </select>
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
                  <th style={ui.th}>{programType === "postgraduate" ? "الدفعة" : "المستوى"}</th>
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
  <div style={{ marginTop: 24, padding: 20, background: "#fff", borderRadius: 12, border: "2px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
    <h3 style={{ ...ui.sectionTitle, color: "#1e293b", borderBottom: "2px solid #f1f5f9", pb: 10 }}>ملخص عملية الترحيل</h3>

    <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
      
      {promotionResults.success.length > 0 && (
        <div style={{ padding: "10px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
          <strong style={{ color: "#16a34a" }}> تم ترحيلهم بنجاح ({promotionResults.success.length})</strong>
        </div>
      )}

      {promotionResults.failed.length > 0 && (
        <div style={{ padding: "10px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
          <strong style={{ color: "#b91c1c" }}> طلاب لم يتم ترحيلهم ({promotionResults.failed.length}):</strong>
          <ul style={{ paddingRight: "25px", marginTop: "10px", listStyleType: "disc" }}>
            {promotionResults.failed.map((f, idx) => (
              <li key={idx} style={{ marginBottom: "8px", color: "#451a03" }}>
                <span style={{ fontWeight: "bold" }}>{f.full_name}</span>: 
                <span style={{ color: "#b91c1c", marginRight: "5px" }}>{f.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {promotionResults.required_repeat.length > 0 && (
        <div style={{ padding: "10px", background: "#fffbeb", borderRadius: "8px", border: "1px solid #fef3c7" }}>
          <strong style={{ color: "#d97706" }}> طلاب تقرر لهم الإعادة ({promotionResults.required_repeat.length}):</strong>
          <ul style={{ paddingRight: "25px", marginTop: "10px" }}>
            {promotionResults.required_repeat.map((r, idx) => (
              <li key={idx} style={{ color: "#92400e" }}>{r.full_name} - {r.reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>

    <button 
      onClick={() => {
        setPromotionResults(null); 
        resetPromotion();          
      }} 
      style={{ 
        marginTop: "20px", 
        width: "100%", 
        padding: "12px", 
        background: "#00274c", 
        color: "white", 
        borderRadius: "8px", 
        cursor: "pointer",
        fontWeight: "bold",
        border: "none"
      }}
    >
      تم 
    </button>
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
  const navigate = useNavigate();

useEffect(() => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    const timer = setTimeout(() => {
      showToast("انتهت الجلسة", "error");
      navigate("/login", { replace: true });
    }, 0);
    return () => clearTimeout(timer);
  }
}, [navigate]); 

  const [studentForm, setStudentForm] = useState({
    firstName: "",
    secondName: "",
    thirdName: "",
    fourthName: "",
    full_name: "",
    university_id: "",
    phone: "",
    nationality: "",       
    gender: "",              
    status: "",           
  });

  const [form, setForm] = useState({
    academic_year: "",
    level_name: "",
    term_name: "",
    academic_status: "منتظم",
    registration_status: "غير مسجّل",
    notes: "",
    postgraduate_program: "",

    prev_degree: "",
    prev_university: "",
    prev_grad_year: "",
    study_type: "",
  });


const isAlpha = (text) => /^[a-zA-Z\u0600-\u06FF\s]*$/.test(text);

const getFullName = (f) => {
  return `${f.firstName} ${f.secondName} ${f.thirdName} ${f.fourthName}`.trim();
};

const natSmart = useNationalitySmartList();

useEffect(() => {
  natSmart.fetchNationalities();
}, []);

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
    .then(res => res.json())
    .then(allFaculties => {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      
      if (user.role === 'admin') {
        setFaculties(allFaculties);
        return;
      }

      const allowedIds = Array.isArray(user.allowed_faculties) 
        ? user.allowed_faculties 
        : [];

      const filtered = allFaculties.filter(fac => allowedIds.includes(fac.id));

      setFaculties(filtered);

      if (filtered.length === 0) {
        showToast("لا توجد كليات مسموح لك الوصول إليها", "error");
      }
    })
    .catch(err => {
      console.error("Error loading faculties", err);
      showToast("خطأ في تحميل الكليات", "error");
    });
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
        registration_status: data.lastRegistration ? data.lastRegistration.registration_status : "غير مسجّل",
        notes: "",

        postgraduate_program: lastPGProgram,
        prev_degree: pgData.prev_degree || "",
        prev_university: pgData.prev_university || "",
        prev_grad_year: pgData.prev_grad_year || "",
        study_type: pgData.study_type || "",
      }));

      setStudentForm({
        firstName: data.student.first_name || "",
        secondName: data.student.second_name || "",
        thirdName: data.student.third_name || "",
        fourthName: data.student.fourth_name || "",
        full_name: data.student.full_name || "",
        university_id: Number(data.student.university_id) === 0 ? "" : String(data.student.university_id),
        phone: data.student.phone || "",
        nationality: data.student.nationality || "",     
        gender: data.student.gender || "",                    
        status: data.student.status || "نشط",
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
    firstName: "",
    secondName: "",
    thirdName: "",
    fourthName: "",
    full_name: "",
    university_id: "",
    phone: "",
  });

  setForm({
    academic_year: "",
    level_name: "",
    term_name: "",
    academic_status: "منتظم",
    registration_status: "غير مسجّل",
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
  // 1. التحقق من وجود الأسماء الأربعة وعدم احتوائها على أرقام أو رموز
  const nameFields = ['firstName', 'secondName', 'thirdName', 'fourthName'];
  const isAllNamesValid = nameFields.every(field => 
    studentForm[field] && studentForm[field].trim() !== "" && isAlpha(studentForm[field])
  );

  if (!isAllNamesValid) {
    showToast("يرجى إدخال الاسم الرباعي بشكل صحيح (حروف فقط وبدون ترك حقول فارغة)", "error");
    return;
  }

  // 2. التحقق من رقم الهاتف (يجب أن يكون 10 أرقام بالضبط)
  const phoneRegex = /^\d{10}$/;
  if (studentForm.phone && !phoneRegex.test(studentForm.phone)) {
    showToast("رقم الهاتف يجب أن يتكون من 10 أرقام فقط", "error");
    return;
  }

  // 3. تجميع الاسم الكامل لاستخدامه في قاعدة البيانات
  const fullNameValue = getFullName(studentForm);

  try {

    const token = sessionStorage.getItem("token");
    if (!token) {
      showToast("انتهت الجلسة، يرجى إعادة تسجيل الدخول", "error");
      navigate("/login");
      return;
    }

    // تجهيز البيانات المشتركة (سواء للإضافة أو التحديث)
    const studentData = {
      first_name: studentForm.firstName.trim(),
      second_name: studentForm.secondName.trim(),
      third_name: studentForm.thirdName.trim(),
      fourth_name: studentForm.fourthName.trim(),
      full_name: fullNameValue,
      university_id: (studentForm.university_id || "").trim(),
      phone: studentForm.phone || null,
      nationality: studentForm.nationality?.trim() || null,
      gender: studentForm.gender || null,
      status: studentForm.status || "نشط",
      department_id: departmentId ? Number(departmentId) : null,
    };

    // حالة الإضافة (POST)
    if (!selectedStudent?.id) {
      const res = await fetch(`${API_BASE}/students`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...studentData,
          receipt_number: null,
          notes: null,
          registrar: DEFAULT_REGISTRAR,
        }),
      });
      if (res.status === 401) {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  showToast("انتهت الجلسة، يرجى إعادة تسجيل الدخول", "error");
  navigate("/login");
  return null;
}
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "فشل إضافة الطالب", "error");
        return;
      }

      showToast("تم إضافة وحفظ بيانات الطالب بنجاح", "success");
    } 
    // حالة التحديث (PUT)
    else {
      const resUpd = await fetch(`${API_BASE}/students/${selectedStudent.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(studentData),
      });

      if (resUpd.status === 401) {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  showToast("انتهت الجلسة، يرجى إعادة تسجيل الدخول", "error");
  navigate("/login");
  return null;
}
      const dataUpd = await resUpd.json();
      if (!resUpd.ok) {
        showToast(dataUpd.message || "فشل تحديث بيانات الطالب", "error");
        return;
      }

      showToast("تم تحديث بيانات الطالب بنجاح", "success");
    }

    // إعادة ضبط النموذج والرجوع للأعلى
    resetStudentForm();
    window.scrollTo({ top: 0, behavior: "smooth" });

  } catch (e) {
    console.error(e);
    showToast("حدث خطأ غير متوقع أثناء معالجة البيانات", "error");
  }
};

function incrementAcademicYear(yearStr) {
  if (!yearStr) return yearStr;
  const parts = yearStr.split("/");
  if (parts.length !== 2) return yearStr;
  const y1 = parseInt(parts[0]);
  const y2 = parseInt(parts[1]);
  if (isNaN(y1) || isNaN(y2)) return yearStr;
  return `${y1 + 1}/${y2 + 1}`;
}

const saveRegistration = async () => {
  // 1. تجميع الاسم الكامل والتحقق من الحقول الأربعة
  const fullNameValue = getFullName(studentForm);
  const isNameComplete = studentForm.firstName && studentForm.secondName && 
                         studentForm.thirdName && studentForm.fourthName;

  if (!isNameComplete) {
    showToast("الاسم الرباعي مطلوب كاملاً (4 حقول)", "error");
    return;
  }

  if (studentForm.phone && studentForm.phone.length !== 10) {
    showToast("رقم الهاتف يجب أن يكون 10 أرقام", "error");
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
if (programType !== "postgraduate") {
  if (!ALLOWED_LEVELS.includes(form.level_name.trim())) {
    showToast("يرجى اختيار مستوى صحيح من القائمة (المستوى الأول - المستوى السادس)", "error");
    return;
  }
} else {
  if (!form.level_name || !form.level_name.trim()) {
    showToast("يرجى إدخال الدفعة (مثال: الدفعة الأولى)", "error");
    return;
  }
}

  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      showToast("انتهت الجلسة – يرجى تسجيل الدخول مرة أخرى", "error");
      navigate("/login");
      return;
    }

    let studentId = selectedStudent ? selectedStudent.id : null;

    const studentDataPayload = {
      first_name: studentForm.firstName.trim(),
      second_name: studentForm.secondName.trim(),
      third_name: studentForm.thirdName.trim(),
      fourth_name: studentForm.fourthName.trim(),
      full_name: fullNameValue,
      university_id: (studentForm.university_id || "").trim(),
      phone: studentForm.phone || null,
      department_id: departmentId ? Number(departmentId) : null,
    };

    // 1. تحديث بيانات الطالب إذا كان موجوداً مسبقاً
    if (studentId) {
      const resUpd = await fetch(`${API_BASE}/students/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,  
        },
        body: JSON.stringify(studentDataPayload),
      });

    if (resUpd.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      showToast("انتهت الجلسة، يرجى إعادة تسجيل الدخول", "error");
      navigate("/login");
      return null;
    }

      if (!resUpd.ok) {
        const errData = await resUpd.json();
        showToast(errData.message || "فشل تحديث بيانات الطالب", "error");
        return;
      }
    }

    // 2. إنشاء طالب جديد إذا لم يكن موجوداً
    if (!studentId) {
      const resStudent = await fetch(`${API_BASE}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,  
        },
        body: JSON.stringify({
          ...studentDataPayload,
          nationality: studentForm.nationality?.trim() || null,     
          gender: studentForm.gender || null,                       
          status: studentForm.status || "نشط",                     
          receipt_number: null,
          notes: null,
          registrar: DEFAULT_REGISTRAR,
        }),
      });

    if (resStudent.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      showToast("انتهت الجلسة، يرجى إعادة تسجيل الدخول", "error");
      navigate("/login");
      return null;
    }

      const dataStudent = await resStudent.json();

      if (!resStudent.ok) {
        showToast(dataStudent.message || "فشل في إضافة الطالب الجديد", "error");
        return;
      }

      studentId = dataStudent.student_id;
    }

    // 3. منطق التسجيل (الأكاديمي) كما هو مع استخدام الـ studentId الصحيح
if (
  lastRegistration &&
  lastRegistration.academic_year === form.academic_year &&
  lastRegistration.level_name === form.level_name &&
  lastRegistration.term_name === form.term_name
) {
  // تعديل الموقف الأكاديمي
  const resReg = await fetch(`${API_BASE}/registrations/${lastRegistration.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ academic_status: form.academic_status }),
  });
  if (resReg.status === 401) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    showToast("انتهت الجلسة، يرجى إعادة تسجيل الدخول", "error");
    navigate("/login");
    return null;
  }
  if (!resReg.ok) {
    showToast("فشل في تعديل الموقف الأكاديمي", "error");
    return;
  }

  //  لو الموقف الأكاديمي "مجمّد" → أنشئي تسجيل جديد بنفس البيانات + سنة جديدة
  if (form.academic_status === "مجمّد") {
    const nextYear = incrementAcademicYear(form.academic_year);

    const frozenRegBody = {
      student_id: studentId,
      academic_year: nextYear,               // السنة الجديدة
      level_name: form.level_name,           // نفس المستوى
      term_name: form.term_name || null,     // نفس الفصل
      academic_status: "منتظم",              // يبدأ بموقف منتظم في السنة الجديدة
      registration_status: "غير مسجّل",
      notes: `تسجيل تلقائي بعد التجميد من سنة ${form.academic_year}`,
      program_type: programType,
      postgraduate_data: programType === "postgraduate" ? {
        prev_degree: form.prev_degree,
        prev_university: form.prev_university,
        prev_grad_year: form.prev_grad_year,
        study_type: form.study_type,
      } : null,
      postgraduate_program: programType === "postgraduate"
        ? (form.postgraduate_program || null)
        : null,
    };

    const resFrozen = await fetch(`${API_BASE}/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(frozenRegBody),
    });

    if (resFrozen.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      showToast("انتهت الجلسة، يرجى إعادة تسجيل الدخول", "error");
      navigate("/login");
      return null;
    }

    if (!resFrozen.ok) {
      const errData = await resFrozen.json();
      // التسجيل الأصلي اتعدل بنجاح لكن التسجيل الجديد فشل
      showToast(
        `تم التجميد لكن فشل إنشاء تسجيل ${nextYear}: ${errData.message || ""}`,
        "error"
      );
      return;
    }

    showToast(
      `تم تجميد الطالب وإنشاء تسجيل جديد للسنة ${nextYear}`,
      "success"
    );
  } else {
    showToast("تم تعديل الموقف الأكاديمي", "success");
  }
}
    else {
      // إنشاء تسجيل جديد
      const regBody = {
        student_id: studentId,
        academic_year: form.academic_year,
        level_name: form.level_name,
        term_name: form.term_name || null,
        academic_status: form.academic_status,
        registration_status: form.registration_status,
        notes: form.notes || null,
        program_type: programType,
        postgraduate_data: programType === "postgraduate" ? {
          prev_degree: form.prev_degree,
          prev_university: form.prev_university,
          prev_grad_year: form.prev_grad_year,
          study_type: form.study_type,
        } : null,
        postgraduate_program: programType === "postgraduate" ? (form.postgraduate_program || null) : null,
      };

      const resReg = await fetch(`${API_BASE}/registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,  
        },
        body: JSON.stringify(regBody),
      });
      if (resReg.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      showToast("انتهت الجلسة، يرجى إعادة تسجيل الدخول", "error");
      navigate("/login");
      return null;
    }

      if (!resReg.ok) {
        const dataReg = await resReg.json();
        showToast(dataReg.message || "فشل في حفظ التسجيل الجديد", "error");
        return;
      }

      showToast("تم تسجيل الطالب بنجاح", "success");
    }

    resetStudentForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("خطأ في عملية التسجيل:", err);
    showToast("حدث خطأ غير متوقع", "error");
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

{selectedStudent && (
  <div style={{ 
    marginTop: 12, padding: 10, 
    background: "#f0f9ff", borderRadius: 8, color: "#0a3753",
    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
  }}>
    <strong>الطالب المختار:</strong> {selectedStudent.full_name} ({selectedStudent.university_id || "—"})
    <button
      onClick={resetStudentForm}
      style={{
        padding: "4px 12px", fontSize: 13,
        background: "#ef4444", color: "white", 
        border: "none", borderRadius: 6, cursor: "pointer",
      }}
    >
      إلغاء الاختيار
    </button>
  </div>
)}

      </div>

      <div style={ui.card}>
<div style={ui.card}>
  <h3 style={ui.sectionTitle}>نوع البرنامج</h3>
  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
    {getAllowedProgramTypes().map(type => (
      <label key={type} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input
          type="radio"
          value={type}
          checked={programType === type}
          onChange={(e) => setProgramType(e.target.value)}
        />
        {type === "diploma" && "دبلوم"}
        {type === "bachelor" && "بكالوريوس"}
        {type === "postgraduate" && "دراسات عليا"}
      </label>
    ))}
  </div>
</div>

        <h3 style={ui.sectionTitle}>بيانات الطالب الأساسية</h3>

        <div style={ui.grid}>
          {[
            { label: "الاسم الأول", key: "firstName" },
            { label: "الاسم الثاني", key: "secondName" },
            { label: "الاسم الثالث", key: "thirdName" },
            { label: "الاسم الرابع", key: "fourthName" }
          ].map((item) => (
            <div style={ui.field} key={item.key}>
              <label style={ui.label}>{item.label}</label>
              <input
                type="text"
                value={studentForm[item.key]}
                onChange={(e) => {
                const val = e.target.value;
                if (isAlpha(val) || val === "") { 
                setStudentForm(prev => ({ ...prev, [item.key]: val }));
              }
             }}
                placeholder={item.label}
                style={ui.input}
              />
            </div>
          ))}

          <div style={ui.field}>
            <label style={ui.label}>الرقم الجامعي</label>
<input
  type="text"
  value={studentForm.university_id}
  onChange={(e) => {
    const val = e.target.value;
    if (/^[0-9/]*$/.test(val)) {
      setStudentForm(prev => ({ ...prev, university_id: val }));
    }
  }}
  placeholder=" مثال: 2020001/25"
  style={ui.input}
/>
          </div>

         <div style={ui.field}>
            <label style={ui.label}>رقم الهاتف </label>
            <input
              type="text"
              maxLength={10}
              value={studentForm.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ""); 
                setStudentForm(prev => ({ ...prev, phone: val }));
              }}
              placeholder="مثال: 0912345678 (10 أرقام)"
              style={ui.input}
            />
          </div>

<div style={ui.field}>
  <label style={ui.label}>الجنسية</label>
  <input
    type="text"
    list="nationality_list"
    maxLength={10}
    value={studentForm.nationality || ""}
    onChange={(e) => {
      const val = e.target.value;
      if ((isAlpha(val) || val === "") && val.length <= 10) {
        setStudentForm(prev => ({ ...prev, nationality: val }));
      }
    }}
    placeholder="مثال: سوداني"
    style={ui.input}
  />
  <datalist id="nationality_list">
    {natSmart.nationalities.map((nat, index) => (
      <option key={index} value={nat} />
    ))}
  </datalist>
</div>

<div style={ui.field}>
  <label style={ui.label}>الجنس</label>
  <select
    value={studentForm.gender || ""}
    onChange={e =>
      setStudentForm(prev => ({ ...prev, gender: e.target.value }))
    }
    style={ui.select}
  >
    <option value="">— اختر —</option>
    <option value="male">ذكر</option>
    <option value="female">أنثى</option>
  </select>
</div>

<div style={ui.field}>
  <label style={ui.label}>حالة الطالب</label>
  <select
    value={studentForm.status || ""}         
    onChange={e =>
      setStudentForm(prev => ({ ...prev, status: e.target.value }))
    }
    style={ui.select}
  >
    <option value="">— اختر الحالة —</option>
    <option value="active">نشط</option>          
    <option value="inactive">غير نشط</option>   
  </select>
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
    {/* حقل السنة الدراسية - ثابت للكل */}
    <div style={ui.field}>
      <label style={ui.label}>السنة الدراسية</label>
      <input
        type="text"
        name="academic_year"
        list="single_years"
        placeholder="مثال: 2025/2026"
        value={form.academic_year}
        onChange={(e) => {
          const val = e.target.value.replace(/[^\d/]/g, "");
          setForm((p) => ({ ...p, academic_year: val, level_name: "", term_name: "" }));
        }}
        style={ui.input}
      />
      <datalist id="single_years">
        {smart.yearOptions.map((x) => <option key={x} value={x} />)}
      </datalist>
    </div>

    {/* حقل المستوى الدراسي / الدفعة - يتغير حسب البرنامج */}
{/* حقل المستوى الدراسي / الدفعة - يتغير حسب البرنامج */}
<div style={ui.field}>
  <label style={ui.label}>
    {programType === "postgraduate" ? "الدفعة" : "المستوى الدراسي"}
  </label>
  <input
    type="text"
    name="level_name"
    // نغير الـ list ديناميكياً بناءً على نوع البرنامج
    list={programType === "postgraduate" ? "pg_levels_list" : "single_levels"} 
    placeholder={programType === "postgraduate" ? "مثال: الدفعة الأولى" : "مثال: المستوى الثاني"}
    value={form.level_name}
    onChange={(e) => {
      setForm((p) => ({ ...p, level_name: e.target.value, term_name: "" }));
    }}
    style={ui.input}
  />

  {/* 1. قائمة ذكية للدراسات العليا - تظهر فقط الدفعات المسجلة سابقاً في الدراسات العليا */}
  {programType === "postgraduate" && (
    <datalist id="pg_levels_list">
      {smart.levelOptions.map((lvl) => (
        <option key={lvl} value={lvl} />
      ))}
    </datalist>
  )}

  {/* 2. قائمة المستويات الثابتة للبكالوريوس والدبلوم */}
  {programType !== "postgraduate" && (
    <datalist id="single_levels">
      {/* عرض الخيارات المقترحة الثابتة */}
      {ALLOWED_LEVELS.map((lvl) => (
        <option key={lvl} value={lvl} />
      ))}
      {/* وأيضاً إضافة أي مستويات فريدة موجودة في الداتا بيز لهذا النوع */}
      {smart.levelOptions
        .filter(lvl => !ALLOWED_LEVELS.includes(lvl))
        .map((lvl) => (
          <option key={lvl} value={lvl} />
        ))}
    </datalist>
  )}
</div>

    {/* حقل الفصل الدراسي - ثابت للكل */}
<div style={ui.field}>
  <label style={ui.label}>الفصل الدراسي</label>
  <select
    name="term_name"
    value={form.term_name}
    onChange={(e) => setForm((p) => ({ ...p, term_name: e.target.value }))}
    onBlur={() => smart.ensurePeriodSaved(form.academic_year, form.level_name, form.term_name)}
    style={ui.select}
  >
    <option value="">-- اختر الفصل --</option>
    {/* تبديل المصفوفة بناءً على نوع البرنامج */}
    {(programType === "postgraduate" ? TERMS_POSTGRAD : TERMS_NORMAL).map((t) => (
      <option key={t} value={t}>{t}</option>
    ))}
  </select>
</div>

    {/* حقل الموقف الأكاديمي - يتغير حسب البرنامج */}
    <div style={ui.field}>
      <label style={ui.label}>الموقف الأكاديمي</label>
      <select
        name="academic_status"
        value={form.academic_status}
        onChange={handleFormChange}
        style={ui.select}
      >
        {/* شرط عرض الخيارات بناءً على نوع البرنامج */}
        {(programType === "postgraduate" ? ACADEMIC_STATUS_PG : ACADEMIC_STATUS_OPTIONS).map((opt) => (
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
    .then(res => res.json())
    .then(allFaculties => {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      
      if (user.role === 'admin') {
        setFaculties(allFaculties);
        return;
      }

      const allowedIds = Array.isArray(user.allowed_faculties) 
        ? user.allowed_faculties 
        : [];

      const filtered = allFaculties.filter(fac => allowedIds.includes(fac.id));

      setFaculties(filtered);

      if (filtered.length === 0) {
        showToast("لا توجد كليات مسموح لك الوصول إليها", "error");
      }
    })
    .catch(err => {
      console.error("Error loading faculties", err);
      showToast("خطأ في تحميل الكليات", "error");
    });
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

const fetchPeriodsRef = React.useRef(smart.fetchAcademicPeriods);
React.useEffect(() => {
  fetchPeriodsRef.current = smart.fetchAcademicPeriods;
});

useEffect(() => {
  if (departmentId || (programType === "postgraduate" && postgradProgram.trim())) {
    fetchPeriodsRef.current();
  }

  if (programType === "postgraduate") {
    pgSmart.fetchPrograms();
  } else {
    setPostgradProgram("");
  }
}, [departmentId, programType, postgradProgram]);

useEffect(() => {
  smart.rebuildOptions(academicYear, levelName);
}, [academicYear, levelName]);

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
      showToast("ادخل السنة والمستوى والفصل أولاً", "error");
      return;
    }
    const yearRegex = /^\d{4}\/\d{4}$/; 
  if (!yearRegex.test(academicYear.trim())) {
    showToast("صيغة السنة الدراسية غير صحيحة، مثال: 2025/2026", "error");
    return;
  }

  if (!ALLOWED_LEVELS.includes(levelName.trim())) {
    showToast("يرجى اختيار مستوى صحيح من القائمة (المستوى الأول - السادس)", "error");
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
  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
    {getAllowedProgramTypes().map(type => (
      <label key={type} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input
          type="radio"
          value={type}
          checked={programType === type}
          onChange={(e) => setProgramType(e.target.value)}
        />
        {type === "diploma" && "دبلوم"}
        {type === "bachelor" && "بكالوريوس"}
        {type === "postgraduate" && "دراسات عليا"}
      </label>
    ))}
  </div>
</div>

      {/* برنامج الدراسات العليا */}
{programType === "postgraduate" && (
  <div style={ui.card}>
    <h3 style={ui.sectionTitle}>برنامج الدراسات العليا</h3>
    <input
      type="text"
      list="fees_pg_list"
      value={postgradProgram}
      onChange={e => setPostgradProgram(e.target.value)}
      placeholder="مثال: ماجستير إدارة أعمال"
      style={ui.input}
    />
    <datalist id="fees_pg_list">
      {pgSmart.programs.map((p, index) => (
        <option key={index} value={p} />
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

        {selectedStudent && (
          <div style={{ 
            marginTop: 12, padding: 10, 
            background: "#f0f9ff", borderRadius: 8, color: "#0a3753",
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
          }}>
            <strong>الطالب المختار:</strong> {selectedStudent.full_name} ({selectedStudent.university_id || "—"})
            <button
              onClick={() => {
                setSelectedStudent(null);
                setQuery("");
                setSearchResults([]);
                setFailedCourses([]);
                setRegisteredInCurrentPeriod([]);
                setSelectedFacultyId("");
                setDepartmentId("");
                setAcademicYear("");
                setLevelName("");
                setTermName("");
              }}
              style={{
                padding: "4px 12px", fontSize: 13,
                background: "#ef4444", color: "white", 
                border: "none", borderRadius: 6, cursor: "pointer",
              }}
            >
              إلغاء الاختيار
            </button>
          </div>
        )}
      </div>

      {selectedStudent && departmentId && (
        <>
          <div style={ui.card}>
            <h3 style={ui.sectionTitle}>الفترة الدراسية لإعادة المواد</h3>
<div style={ui.grid}>
  <div style={ui.field}>
    <label style={ui.label}>السنة الدراسية</label>
    <input
      type="text"
      list="re_year_list"
      placeholder="مثال: 2025/2026"
      value={academicYear}
      onChange={(e) => {
        const val = e.target.value.replace(/[^\d/]/g, "");
        setAcademicYear(val);
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

  <div style={ui.field}>
    <label style={ui.label}>الفصل الدراسي</label>
    <select
      value={termName}
      onChange={(e) => {
        const val = e.target.value;
        setTermName(val);
        setRegisteredInCurrentPeriod([]);
        if (academicYear && levelName && val) {
          smart.ensurePeriodSaved(academicYear, levelName, val);
        }
      }}
      style={ui.select} 
      disabled={!levelName}
    >
      <option value="">اختر الفصل</option>
      <option value="الفصل الأول">الفصل الأول</option>
      <option value="الفصل الثاني">الفصل الثاني</option>
    </select>
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

/* =========================================================
   تاب 4 – إدارة الرسوم (على مستوى كامل - بدون فصل)
   ========================================================= */
function FeesTab({ showToast }) {
  const [programType, setProgramType] = useState("bachelor");
  const [postgradProgram, setPostgradProgram] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [levelName, setLevelName] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [installmentCount, setInstallmentCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [studentSuggestions, setStudentSuggestions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudentFees, setLoadingStudentFees] = useState(false);
  const [feesSource, setFeesSource] = useState("");
  const [isDefaultMode, setIsDefaultMode] = useState(true);
  

  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();
  // const [currency, setCurrency] = useState("SDG");

  const defaultFeesData = {
    registration_fee: "",
    tuition_fee: "",
    tuition_fee_original: "",
    late_fee: "",
    freeze_fee: "0",
    unfreeze_fee: "0",
    repeat_discount: "50",
    scholarship_type: "لا منحة",
    scholarship_percentage: 0,
    scholarship_granted_by: "",
    currency: "SDG",
    installment_1: "", installment_1_start: "", installment_1_end: "",
    installment_2: "", installment_2_start: "", installment_2_end: "",
    installment_3: "", installment_3_start: "", installment_3_end: "",
    installment_4: "", installment_4_start: "", installment_4_end: "",
    installment_5: "", installment_5_start: "", installment_5_end: "",
    installment_6: "", installment_6_start: "", installment_6_end: "",
    term_name: "",
  };

  const [feesData, setFeesData] = useState(defaultFeesData);

  const [calculatedFees, setCalculatedFees] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [academicStatus, setAcademicStatus] = useState("");
  const [facultyType, setFacultyType] = useState("");

  const [paidInstallments, setPaidInstallments] = useState({
  1: false, 2: false, 3: false, 4: false, 5: false, 6: false
 });

 const paidCount = React.useMemo(() => {
  return Object.values(paidInstallments).filter(Boolean).length;
 }, [paidInstallments]);

 const minAllowedInstallments = paidCount >= 6 ? 6 : paidCount + 1;

  const smart = useAcademicPeriodsSmartList({
    programType,
    postgraduateProgram: postgradProgram,
  });
const pgSmart = usePostgradProgramsSmartList();
  const cleanNumber = (val) => {
    if (!val && val !== 0) return 0;
    const cleaned = String(val).replace(/,/g, '').replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const handleNumericInput = (fieldName, value, callback = null) => {
  const regex = /^[0-9]*$/; 
  if (regex.test(value) || value === "") {
    if (callback) {
      callback(value);
    } else {
      setFeesData(prev => ({ ...prev, [fieldName]: value }));
    }
  }
 };

 const formatCurrency = (amount) => {
  const value = cleanNumber(amount);
  const symbol = feesData.currency === "USD" ? " $" : " ج.س";
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + symbol;
 };

  // الإجمالي المستحق الأساسي (بدون أي أقساط)
  const mainTotal = React.useMemo(() => {
    return (
      cleanNumber(feesData.registration_fee) +
      cleanNumber(feesData.tuition_fee) +
      cleanNumber(feesData.late_fee) +
      cleanNumber(feesData.freeze_fee) +
      cleanNumber(feesData.unfreeze_fee)
    );
  }, [feesData]);

  // مجموع الأقساط (منفصل تمامًا - للعرض فقط)
  const installmentsTotal = React.useMemo(() => {
    return (
      cleanNumber(feesData.installment_1) +
      cleanNumber(feesData.installment_2) +
      cleanNumber(feesData.installment_3) +
      cleanNumber(feesData.installment_4) +
      cleanNumber(feesData.installment_5) +
      cleanNumber(feesData.installment_6)
    );
  }, [feesData]);

 const autoDivideInstallments = () => {
  if (installmentCount <= 0) return;

  // ─── 1. نحسب الإجمالي المستحق الأساسي ───
  const totalDue = cleanNumber(mainTotal); //  الإجمالي الكلي المستحق

  // ─── 2. نحسب مجموع الأقساط المدفوعة فعليًا (من الـ feesData) ───
  let paidTotal = 0;
  for (let i = 1; i <= 6; i++) {
    if (paidInstallments[i]) { // لو القسط ده مدفوع
      paidTotal += cleanNumber(feesData[`installment_${i}`]);
    }
  }

  // ─── 3. المتبقي اللي هنقسمه = الإجمالي - المدفوع ───
  const remaining = totalDue - paidTotal;

  if (remaining <= 0) {
    showToast("لايوجد مبلغ متبقي للتقسيم (كل الأقساط مدفوعة أو الإجمالي صفر)", "warning");
    return;
  }

  // ─── 4. نحسب عدد الأقساط الغير مدفوعة اللي هنوزع عليها ───
  let availableSlots = 0;
  for (let i = 1; i <= installmentCount; i++) {
    if (!paidInstallments[i]) availableSlots++;
  }

  if (availableSlots === 0) {
    showToast("كل الأقساط المختارة مدفوعة ", "warning");
    return;
  }

  // ─── 5. التقسيم على عدد الاقساط المتاحة فقط ───
  const totalPiastres = Math.round(remaining * 100);
  const basePiastres = Math.floor(totalPiastres / availableSlots);
  const remainderPiastres = totalPiastres % availableSlots;

  setFeesData(prev => {
    const newData = { ...prev };

    let slotIndex = 1; 
    let distributed = 0;

    for (let i = 1; i <= installmentCount; i++) {
      if (paidInstallments[i]) {
        continue;
      }

      // القسط غير مدفوع → نوزع عليه
      let amountPiastres = basePiastres;
      if (slotIndex <= remainderPiastres) {
        amountPiastres += 1;
      }

      const amountInEGP = (amountPiastres / 100).toFixed(2);
      newData[`installment_${i}`] = amountInEGP;
      distributed += parseFloat(amountInEGP);

      slotIndex++;
    }

    for (let i = installmentCount + 1; i <= 6; i++) {
      newData[`installment_${i}`] = "";
      newData[`installment_${i}_start`] = "";
      newData[`installment_${i}_end`] = "";
    }

    const diff = remaining - distributed;
    if (Math.abs(diff) > 0.01 && slotIndex > 1) {
      const lastIdx = installmentCount;
      const lastVal = cleanNumber(newData[`installment_${lastIdx}`]);
      newData[`installment_${lastIdx}`] = (lastVal + diff).toFixed(2);
    }

    return newData;
  });

  showToast(`تم تقسيم المتبقي (${formatCurrency(remaining)}) على ${availableSlots} أقساط غير مدفوعة`, "success");
 };

  // تطبيق خصم المنحة بدقة
  const applyScholarshipDiscount = (percentage) => {
    setFeesData(prev => {
      let base = cleanNumber(prev.tuition_fee_original) || cleanNumber(prev.tuition_fee) || 0;

      if (academicStatus === "إعادة") {
        const repeatPerc = cleanNumber(prev.repeat_discount) / 100 || 0.5;
        base = base * (1 - repeatPerc);
      }

      const discounted = Math.round(base * (1 - (percentage / 100)) * 100) / 100;

      return {
        ...prev,
        scholarship_percentage: percentage,
        tuition_fee: discounted.toFixed(2),
      };
    });
  };

  // تغيير نوع المنحة
  const handleScholarshipChange = (e) => {
    const val = e.target.value;
    const opt = SCHOLARSHIP_OPTIONS.find(o => o.type === val);
    
    let perc = opt?.percentage ?? 0;
    if (perc === null) perc = 0;

    setFeesData(prev => {
      let base = cleanNumber(prev.tuition_fee_original) || cleanNumber(prev.tuition_fee) || 0;

      if (academicStatus === "إعادة") {
        const repeatPerc = cleanNumber(prev.repeat_discount) / 100 || 0.5;
        base = base * (1 - repeatPerc);
      }

      return {
        ...prev,
        scholarship_type: val,
        scholarship_percentage: perc,
        tuition_after_repeat: base.toFixed(2),
        tuition_fee: base.toFixed(2),
      };
    });

    if (perc > 0) {
      applyScholarshipDiscount(perc);
    }
  };

  // دالة جلب الرسوم العامة 
 const loadDefaultFeesForLevel = async () => {
  try {
    const params = new URLSearchParams({
      academic_year: academicYear,
      level_name: levelName,
      program_type: programType,
      term_name: feesData.term_name || "",
      faculty_id: facultyId || "", 
      department_id: departmentId || "",
      ...(postgradProgram.trim() && { postgraduate_program: postgradProgram.trim() }),
    });

    const res = await fetch(`${API_BASE}/term-default-fees?${params}`);

    if (res.ok) {
      const data = await res.json();
      fillFeesData(data);
      setFeesSource("default");
      
      // حساب عدد الأقساط
      let count = 0;
      for (let i = 1; i <= 6; i++) {
        if (data[`installment_${i}`]) count = i;
      }
      setInstallmentCount(count);
      showToast("تم جلب الرسوم العامة لهذه التخصص", "success");
    } 
    else if (res.status === 404) {
      setFeesData(defaultFeesData);
      setInstallmentCount(0);
      setFeesSource("");
      showToast("لا توجد رسوم عامة لهذا التخصص/المستوى", "info");
    } 
    else {
      throw new Error(await res.text() || "مشكلة في السيرفر");
    }
  } catch (err) {
    console.error("خطأ جلب رسوم عامة:", err);
    showToast("تعذر جلب الرسوم العامة", "error");
  }
 };

 //  دالة جلب رسوم الطالب
 const loadFees = async () => {
  setPaidInstallments({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false });
  setLoadingStudentFees(true);
  try {
    const params = new URLSearchParams({
      student_id: selectedStudent.id,
      academic_year: academicYear,
      level_name: levelName,
    });

    // 1. محاولة جلب رسوم الطالب الخاصة
    let res = await fetch(`${API_BASE}/student-fees?${params}`);
    let feesToUse = null;
    let source = "";

    if (res.ok) {
      feesToUse = await res.json();
      source = "student";
    } else {
      // 2. إذا لم توجد رسوم خاصة، جلب الرسوم العامة (Default)
      const defParams = new URLSearchParams({
        academic_year: academicYear,
        level_name: levelName,
        program_type: programType,
        faculty_id: facultyId, // نرسل الكلية والقسم لضمان دقة الرسوم العامة
        department_id: departmentId,
        ...(postgradProgram && { postgraduate_program: postgradProgram.trim() }),
      });
      res = await fetch(`${API_BASE}/term-default-fees?${defParams}`);
      if (res.ok) {
        feesToUse = await res.json();
        source = "default";
      }
    }

    const calcRes = await fetch(`${API_BASE}/student-fees-calculated?${params}`);
    let calculatedData = null;
    if (calcRes.ok) {
      calculatedData = await calcRes.json();
      setCalculatedFees(calculatedData);
      setAcademicStatus(calculatedData.academic_status || "نظامي");
      setFacultyType(calculatedData.faculty_type || "غير محدد");
    }

    if (feesToUse) {
      fillFeesData(feesToUse); 
      setFeesSource(source);

if (calculatedData) {
  setFeesData(prev => ({
    ...prev,
    registration_fee: calculatedData.registration_fee?.toString() || prev.registration_fee,
    tuition_fee: calculatedData.tuition_fee?.toString() || prev.tuition_fee,
    freeze_fee: calculatedData.total_extra && calculatedData.notes?.includes("تجميد") 
                ? calculatedData.total_extra.toString() : "0",

    // مهم: نحافظ على بيانات المنحة من calculated
    scholarship_type: calculatedData.scholarship_type || prev.scholarship_type || "لا منحة",
    scholarship_percentage: Number(calculatedData.scholarship_percentage) || 0,
    scholarship_granted_by: calculatedData.scholarship_granted_by || prev.scholarship_granted_by || "",
  }));
}
    }

    const statusRes = await fetch(`${API_BASE}/student-installments-status?${params}`);
    if (statusRes.ok) {
      const statusData = await statusRes.json();
      const newPaid = {};
      for (let i = 1; i <= 6; i++) {
        newPaid[i] = !!(statusData[`installment_${i}_paid`]);
      }
      setPaidInstallments(newPaid);
    }

    if (source === "default") {
        showToast("لم يتم العثور على رسوم مخصصة، تم تحميل الرسوم العامة للمستوى", "info");
    } else if (source === "student") {
        showToast("تم تحميل رسوم الطالب المخصصة", "success");
    }

  } catch (err) {
    console.error(err);
    showToast("خطأ أثناء تحميل بيانات الرسوم", "error");
  } finally {
    setLoadingStudentFees(false);
  }
 };

  // تحميل الكليات
 useEffect(() => {
  fetch(`${API_BASE}/faculties-list`)
    .then(res => res.json())
    .then(allFaculties => {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      
      if (user.role === 'admin') {
        setFaculties(allFaculties);
        return;
      }

      const allowedIds = Array.isArray(user.allowed_faculties) 
        ? user.allowed_faculties 
        : [];

      const filtered = allFaculties.filter(fac => allowedIds.includes(fac.id));

      setFaculties(filtered);

      if (filtered.length === 0) {
        showToast("لا توجد كليات مسموح لك الوصول إليها", "error");
      }
    })
    .catch(err => {
      console.error("Error loading faculties", err);
      showToast("خطأ في تحميل الكليات", "error");
    });
 }, []);

  // تحميل الأقسام
  useEffect(() => {
    if (!facultyId) {
      setDepartments([]);
      setDepartmentId("");
      return;
    }
    fetch(`${API_BASE}/departments/${facultyId}`)
      .then(res => res.json())
      .then(setDepartments)
      .catch(() => showToast("خطأ في تحميل الأقسام", "error"));
  }, [facultyId]);

  // تحميل الفترات
const fetchPeriodsRef = React.useRef(smart.fetchAcademicPeriods);
React.useEffect(() => {
  fetchPeriodsRef.current = smart.fetchAcademicPeriods;
});

useEffect(() => {
  if (departmentId || (programType === "postgraduate" && postgradProgram.trim())) {
    fetchPeriodsRef.current();
  }

  if (programType === "postgraduate") {
    pgSmart.fetchPrograms();
  } else {
    setPostgradProgram("");
  }
}, [departmentId, programType, postgradProgram]);

useEffect(() => {
  smart.rebuildOptions(academicYear, levelName);
}, [academicYear, levelName]);

  // بحث الطالب
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setStudentSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`${API_BASE}/students/search?q=${encodeURIComponent(searchQuery.trim())}`)
        .then(res => res.json())
        .then(data => setStudentSuggestions(Array.isArray(data) ? data : []))
        .catch(() => setStudentSuggestions([]));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // اختيار الطالب
  const selectStudent = (student) => {
    setSelectedStudent(student);
    setSearchQuery("");
    setStudentSuggestions([]);

    setPaidInstallments({1:false,2:false,3:false,4:false,5:false,6:false});
    setLoadingStudentFees(true);
    setFeesSource("");

    setFeesData(defaultFeesData);
    setInstallmentCount(0);
    setCalculatedFees(null);
    setAcademicStatus("");
    setFacultyType("");

    fetch(`${API_BASE}/students/${student.id}`)
      .then(res => {
        if (!res.ok) throw new Error("فشل جلب بيانات الطالب");
        return res.json();
      })
      .then(data => {
        const studentData = data.student;
        const lastReg = data.lastRegistration || {};

        setFacultyId(studentData?.faculty_id ? String(studentData.faculty_id) : "");
        setDepartmentId(studentData?.department_id ? String(studentData.department_id) : "");
        setProgramType(lastReg?.program_type || programType);
        setPostgradProgram(lastReg?.postgraduate_program || postgradProgram);
      })
      .catch(err => showToast("خطأ في جلب بيانات الطالب", "error"))
      .finally(() => setLoadingStudentFees(false));
  };

  // جلب الرسوم + الموقف الأكاديمي
 useEffect(() => {
  if (!academicYear || !levelName) {
    setFeesData(defaultFeesData);
    setInstallmentCount(0);
    setFeesSource("");
    setCalculatedFees(null);
    setAcademicStatus("");
    setFacultyType("");
    return;
  }

  if (selectedStudent) {
    setIsDefaultMode(false);
    loadFees();
    return;
  }

  setIsDefaultMode(true);
  loadDefaultFeesForLevel();

 }, [selectedStudent, academicYear, levelName, programType, postgradProgram]);


useEffect(() => {
  if (!selectedStudent || !academicYear || !levelName) {
    setCalculatedFees(null);
    setAcademicStatus("");
    setFacultyType("");
    return;
  }

  const fetchCalculatedFees = async () => {
    setCalculating(true);
    try {
      const params = new URLSearchParams({
        student_id: selectedStudent.id,
        academic_year: academicYear,
        level_name: levelName,
      });

      const res = await fetch(`${API_BASE}/student-fees-calculated?${params}`);
      if (!res.ok) throw new Error((await res.json()).error || "فشل في حساب الرسوم");

      const data = await res.json();

      setCalculatedFees(data);
      setAcademicStatus(data.academic_status || "نظامي");
      setFacultyType(data.faculty_type || "غير محدد");

      // ==================== حساب بعد المنحة ====================
      let baseTuition = cleanNumber(data.tuition_fee);
      let tuitionAfterDiscount = baseTuition;

      if (data.scholarship_type && data.scholarship_type !== "لا منحة" && Number(data.scholarship_percentage) > 0) {
        const perc = Number(data.scholarship_percentage);
        tuitionAfterDiscount = Math.round(baseTuition * (1 - perc / 100) * 100) / 100;
      }

      setFeesData(prev => ({
        ...prev,
        tuition_fee: tuitionAfterDiscount.toFixed(2),
        tuition_fee_original: baseTuition.toFixed(2),
        tuition_after_repeat: tuitionAfterDiscount.toFixed(2),

        scholarship_type: data.scholarship_type || "لا منحة",
        scholarship_percentage: Number(data.scholarship_percentage) || 0,
        scholarship_granted_by: data.scholarship_granted_by || "",

        freeze_fee: data.total_extra && data.notes?.includes("تجميد") 
                    ? data.total_extra.toString() : "0",
        unfreeze_fee: "0",
      }));

      if (data.scholarship_type && data.scholarship_type !== "لا منحة") {
        showToast(`تم تطبيق منحة "${data.scholarship_type}" بنسبة ${data.scholarship_percentage}%`, "success");
      }

    } catch (err) {
      console.error(err);
      showToast("خطأ أثناء حساب الرسوم: " + err.message, "error");
    } finally {
      setCalculating(false);
    }
  };

  fetchCalculatedFees();
}, [selectedStudent, academicYear, levelName]);

  const fillFeesData = (fees) => {
    const tuition = fees.tuition_fee?.toString() || "";
    let original = tuition;
    let afterRepeat = tuition;

    if (academicStatus === "إعادة" && fees.repeat_discount) {
      const repeatPerc = cleanNumber(fees.repeat_discount) / 100 || 0.5;
      original = (cleanNumber(tuition) / (1 - repeatPerc)).toFixed(2);
    }

    setFeesData(prev => ({
      ...prev,
      term_name: fees.term_name || "",
      registration_fee: fees.registration_fee?.toString() || "",
      tuition_fee: tuition,
      tuition_fee_original: original,
      tuition_after_repeat: afterRepeat,
      late_fee: fees.late_fee?.toString() || "",
      freeze_fee: fees.freeze_fee?.toString() || "0",
      unfreeze_fee: fees.unfreeze_fee?.toString() || "0",
      repeat_discount: fees.repeat_discount?.toString() || "50",
scholarship_type: fees.scholarship_type || "لا منحة",
scholarship_percentage: Number(fees.scholarship_percentage) || 0,
scholarship_granted_by: fees.scholarship_granted_by || "",
      currency: fees.currency || "SDG",
      installment_1: fees.installment_1?.toString() || "",
      installment_1_start: fees.installment_1_start || "",
      installment_1_end: fees.installment_1_end || "",
      installment_2: fees.installment_2?.toString() || "",
      installment_2_start: fees.installment_2_start || "",
      installment_2_end: fees.installment_2_end || "",
      installment_3: fees.installment_3?.toString() || "",
      installment_3_start: fees.installment_3_start || "",
      installment_3_end: fees.installment_3_end || "",
      installment_4: fees.installment_4?.toString() || "",
      installment_4_start: fees.installment_4_start || "",
      installment_4_end: fees.installment_4_end || "",
      installment_5: fees.installment_5?.toString() || "",
      installment_5_start: fees.installment_5_start || "",
      installment_5_end: fees.installment_5_end || "",
      installment_6: fees.installment_6?.toString() || "",
      installment_6_start: fees.installment_6_start || "",
      installment_6_end: fees.installment_6_end || "",
    }));

    let count = 0;
    if (fees.installment_6) count = 6;
    else if (fees.installment_5) count = 5;
    else if (fees.installment_4) count = 4;
    else if (fees.installment_3) count = 3;
    else if (fees.installment_2) count = 2;
    else if (fees.installment_1) count = 1;
    setInstallmentCount(count);

    if (fees.scholarship_percentage > 0) {
      // applyScholarshipDiscount(fees.scholarship_percentage);
    }
  };

  const calculateFinalFees = async () => {
    if (!selectedStudent || !academicYear || !levelName) {
      showToast("يرجى اختيار طالب وسنة ومستوى", "error");
      return;
    }
    setCalculating(true);
    try {
      const params = new URLSearchParams({
        student_id: selectedStudent.id,
        academic_year: academicYear,
        level_name: levelName,
      });
      const res = await fetch(`${API_BASE}/student-fees-calculated?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل في حساب الرسوم");

      setCalculatedFees(data);
      setAcademicStatus(data.academic_status || "نظامي");
      setFacultyType(data.faculty_type || "غير محدد");

      let original = data.tuition_fee?.toString() || "";
      let afterRepeat = original;

      if (data.academic_status === "إعادة" && data.repeat_discount) {
        const repeatPerc = cleanNumber(data.repeat_discount) / 100 || 0.5;
        original = (cleanNumber(afterRepeat) / (1 - repeatPerc)).toFixed(2);
      }

      setFeesData(prev => ({
        ...prev,
        tuition_fee: data.tuition_fee?.toString() || prev.tuition_fee,
        tuition_fee_original: original,
        tuition_after_repeat: afterRepeat,
        freeze_fee: data.total_extra && data.notes?.includes("تجميد") ? data.total_extra.toString() : "0",
        unfreeze_fee: "0",
      }));

      showToast("تم حساب الرسوم النهائية بنجاح", "success");
    } catch (err) {
      showToast("خطأ أثناء الحساب: " + err.message, "error");
    } finally {
      setCalculating(false);
    }
  };
 const resetAllForm = () => {
  setFeesData({ ...defaultFeesData });   

  setInstallmentCount(0);

  setSelectedStudent(null);
  setSearchQuery("");
  setStudentSuggestions([]);

  setAcademicYear("");
  setLevelName("");

  setCalculatedFees(null);
  setAcademicStatus("");
  setFacultyType("");
  setFeesSource("");

 };

 const saveFees = async () => {
  if (!academicYear || !levelName) {
    showToast("يرجى اختيار السنة والمستوى", "error");
    return;
  }

if (programType === "postgraduate" && selectedStudent && !feesData.term_name?.trim()) {
    showToast("يجب اختيار الفصل الدراسي عند حفظ رسوم طالب في الدراسات العليا", "error");
    return;
  }

  const totalDue = cleanNumber(mainTotal);
  const totalInstallments = cleanNumber(installmentsTotal);

  if (selectedStudent) {
    if (Math.abs(totalDue - totalInstallments) > 0.1) {
      const diff = totalDue - totalInstallments;
      showToast(
        `لا يمكن الحفظ: مجموع الأقساط (${formatCurrency(totalInstallments)}) ` +
        `لا يساوي الإجمالي المستحق للطلاب (${formatCurrency(totalDue)}). ` +
        `الفرق: ${formatCurrency(diff)}`, 
        "error"
      );
      return; 
    }
  }

  const token = sessionStorage.getItem("token");
  if (!token) {
    // showToast("يرجى تسجيل الدخول أولاً", "error");
    navigate("/login");
    return;
  }

  const errors = [];

  for (let i = 1; i <= installmentCount; i++) {
    const amount = cleanNumber(feesData[`installment_${i}`]);
    const start = feesData[`installment_${i}_start`];
    const end   = feesData[`installment_${i}_end`];

    if (amount > 0) {
      if (!start) {
        errors.push(`القسط ${i}: تاريخ بداية الدفع مطلوب`);
      }
      if (!end) {
        errors.push(`القسط ${i}: تاريخ نهاية الدفع مطلوب`);
      }
      if (start && end && start > end) {
        errors.push(`القسط ${i}: تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية`);
      }
    }
  }

  if (errors.length > 0) {
    const errorMessage = "يرجى إكمال التواريخ للأقساط المختارة:\n" + errors.join("\n");
    showToast(errorMessage, "error");
    // alert(errorMessage);
    return;
  }

  try {
    const body = {
      academic_year: academicYear,
      level_name: levelName,
      term_name: programType === "postgraduate" ? feesData.term_name : null,
      program_type: programType,
      postgraduate_program: programType === "postgraduate" ? postgradProgram || null : null,
      department_id: departmentId ? Number(departmentId) : null,
      currency: feesData.currency || "SDG",
      registration_fee: Number(feesData.registration_fee) || 0,
      tuition_fee: Number(feesData.tuition_fee) || 0,
      late_fee: Number(feesData.late_fee) || 0,
      freeze_fee: Number(feesData.freeze_fee) || 0,
      unfreeze_fee: Number(feesData.unfreeze_fee) || 0,
      repeat_discount: Number(feesData.repeat_discount) || 50,
      scholarship_type: feesData.scholarship_type,
      scholarship_percentage: Number(feesData.scholarship_percentage) || 0,
      scholarship_granted_by: feesData.scholarship_granted_by || null,
      installment_1: feesData.installment_1 || null,
      installment_1_start: feesData.installment_1_start || null,
      installment_1_end: feesData.installment_1_end || null,
      installment_2: feesData.installment_2 || null,
      installment_2_start: feesData.installment_2_start || null,
      installment_2_end: feesData.installment_2_end || null,
      installment_3: feesData.installment_3 || null,
      installment_3_start: feesData.installment_3_start || null,
      installment_3_end: feesData.installment_3_end || null,
      installment_4: feesData.installment_4 || null,
      installment_4_start: feesData.installment_4_start || null,
      installment_4_end: feesData.installment_4_end || null,
      installment_5: feesData.installment_5 || null,
      installment_5_start: feesData.installment_5_start || null,
      installment_5_end: feesData.installment_5_end || null,
      installment_6: feesData.installment_6 || null,
      installment_6_start: feesData.installment_6_start || null,
      installment_6_end: feesData.installment_6_end || null,
    };

    let url = `${API_BASE}/term-default-fees`;
    if (selectedStudent) {
      url = `${API_BASE}/student-fees`;
      body.student_id = selectedStudent.id;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

        if (res.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      showToast("انتهت الجلسة، يرجى تسجيل الدخول", "error");
      navigate("/login");
      return;
    }

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || `فشل الحفظ (كود: ${res.status})`);
    }

    showToast(
      selectedStudent ? "تم حفظ/تحديث رسوم الطالب بنجاح" : "تم حفظ الرسوم المبدئية بنجاح",
      "success"
    );
    
    resetAllForm();
    setSelectedStudent(null);
    setSearchQuery("");
    setFeesData(defaultFeesData);
    setInstallmentCount(0);
    setCalculatedFees(null);
    setAcademicStatus("");
    setFacultyType("");
    setFeesSource("");

    // if (selectedStudent) {
    //   selectStudent(selectedStudent);
    // }
  } catch (err) {
    showToast("خطأ أثناء الحفظ: " + err.message, "error");
  }
 };

const printFeesReport = async () => {
  if (!selectedStudent || !academicYear || !levelName) {
    showToast("اختر طالب وحدد السنة والمستوى أولاً", "error");
    return;
  }

  try {
    const params = new URLSearchParams({
      student_id: selectedStudent.id,
      academic_year: academicYear,
      level_name: levelName,
    });

    const url = `${API_BASE}/student-installments-status?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("فشل جلب بيانات الرسوم");
    }

    const data = await response.json();

    let totalPaid = 0;
    let totalRemaining = 0;
    let totalDue = 0;

    const installmentsRows = [];

    for (let i = 1; i <= 6; i++) {
      const amount = cleanNumber(data[`installment_${i}`] || 0);
      if (amount <= 0) continue;

      const isPaid = data[`installment_${i}_paid`] === 1 || data[`installment_${i}_paid`] === true;
      const paidDateRaw = data[`installment_${i}_paid_at`];
      const paidDate = (isPaid && paidDateRaw && paidDateRaw !== '0000-00-00') ? paidDateRaw : "—";

      const startDate = feesData[`installment_${i}_start`] || data[`installment_${i}_start`] || "—";
      const endDate   = feesData[`installment_${i}_end`]   || data[`installment_${i}_end`]   || "—";

      totalDue += amount;
      if (isPaid) {
        totalPaid += amount;
      } else {
        totalRemaining += amount;
      }

      installmentsRows.push(`
        <tr style="background: ${i % 2 === 0 ? '#f9fafb' : '#ffffff'};">
          <td style="padding: 12px; border: 1px solid #d1d5db; text-align: center;">قسط ${i}</td>
          <td style="padding: 12px; border: 1px solid #d1d5db; text-align: center;">${formatCurrency(amount)}</td>
          <td style="padding: 12px; border: 1px solid #d1d5db; text-align: center;">${startDate}</td>
          <td style="padding: 12px; border: 1px solid #d1d5db; text-align: center;">${endDate}</td>
          <td style="padding: 12px; border: 1px solid #d1d5db; text-align: center; color: ${isPaid ? '#059669' : '#dc2626'}; font-weight: bold;">
            ${isPaid ? 'مدفوع' : 'غير مدفوع'}
          </td>
          <td style="padding: 12px; border: 1px solid #d1d5db; text-align: center;">${paidDate}</td>
        </tr>
      `);
    }

    const headerHTML = `
      <div style="text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #0a3753; direction: rtl; font-family: 'Cairo', sans-serif;">
        <h1 style="margin: 0; color: #0a3753; font-size: 22px; font-weight: bold;">جامعة بورتسودان الأهلية</h1>
        <p style="margin: 5px 0; font-size: 16px; font-weight: bold; color: #0a3753;">تقرير الموقف المالي للأقساط</p>
        <p style="margin: 4px 0; font-size: 14px; color: #374151;">السنة الدراسية: ${academicYear} | ${levelName}</p>
        <p style="margin: 10px 0; font-size: 15px; color: #1f2937; font-weight: bold;">
          الطالب/ة: ${selectedStudent.full_name} | الرقم الجامعي: )${selectedStudent.university_id || "—"}(
        </p>
      </div>
    `;

    const summaryTable = `
      <div style="margin-bottom: 25px; direction: rtl; font-family: 'Cairo', sans-serif;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; direction: rtl; font-family: 'Cairo', sans-serif; font-size: 13px;">
          <tr style="background: #6e6e6e; color: white;">
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center;">إجمالي المستحق</th>
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center;">إجمالي المتحصل</th>
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center;">إجمالي المتبقي</th>
          </tr>
          <tr style="text-align: center; font-size: 17px; font-weight: bold; background-color: white;">
            <td style="padding: 12px; border: 1px solid #9ca3af;">${formatCurrency(totalDue)}</td>
            <td style="padding: 12px; border: 1px solid #9ca3af; color: #059669;">${formatCurrency(totalPaid)}</td>
            <td style="padding: 12px; border: 1px solid #9ca3af; color: #dc2626;">${formatCurrency(totalRemaining)}</td>
          </tr>
        </table>
      </div>
    `;

    const installmentsTable = `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; direction: rtl; font-family: 'Cairo', sans-serif; font-size: 13px;">
        <thead>
          <tr style="background: #6e6e6e; color: white;">
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center;">بيان القسط</th>
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center;">المبلغ</th>
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center;">بداية الدفع</th>
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center;">نهاية الدفع</th>
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center;">الحالة</th>
            <th style="padding: 10px; border: 1px solid #9ca3af; text-align: center;">تاريخ السداد</th>
          </tr>
        </thead>
        <tbody>
          ${installmentsRows.length > 0
            ? installmentsRows.join('')
            : '<tr><td colspan="6" style="padding: 15px; text-align: center;">لا توجد أقساط مجدولة</td></tr>'
          }
        </tbody>
      </table>
    `;

    const footerHTML = `
      <div style="margin-top: 40px; direction: rtl; font-family: 'Cairo', sans-serif;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div style="text-align: center; width: 40%;"></div>
          <div style="text-align: center; width: 40%;">
            <p style="font-weight: bold; margin-bottom: 30px;">توقيع المسجل :</p>
            <p>........................................</p>
          </div>
        </div>
        <div style="text-align: center; color: #6b7280; font-size: 11px; border-top: 1px solid #eee; padding-top: 10px;">
          صدر هذا التقرير بتاريخ ${new Date().toLocaleDateString('EG')}
        </div>
      </div>
    `;

    const fullContent = `
      <div style="padding: 20px; direction: rtl;">
        ${headerHTML}
        ${summaryTable}
        <h4 style="margin: 0 0 10px; color: #374151; font-family: 'Cairo', sans-serif;">تفاصيل الأقساط:</h4>
        ${installmentsTable}
        ${footerHTML}
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = fullContent;

    html2pdf()
      .from(element)
      .set({
        margin: [0.5, 0.5],
        filename: `تقرير_مالي_${selectedStudent.full_name}.pdf`,
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        html2canvas: { scale: 2 }
      })
      .save();

  } catch (err) {
    console.error("خطأ التقرير:", err);
    showToast("حدث خطأ أثناء استخراج التقرير", "error");
  }
};

  return (
    <div>
      <h2 style={ui.titleH2}>إدارة الرسوم</h2>

      {/* بحث الطالب */}
      <div style={ui.card}>
        <div style={ui.field}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="اكتب اسم الطالب أو الرقم الجامعي..."
            style={ui.input}
          />
        </div>

        {studentSuggestions.length > 0 && (
          <div style={{ marginTop: 8, border: "1px solid #d9dee8", borderRadius: 10, maxHeight: 220, overflowY: "auto" }}>
            {studentSuggestions.map(s => (
              <div
                key={s.id}
                onClick={() => selectStudent(s)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  background: "#fff",
                }}
              >
                {s.full_name} – {s.university_id || "بدون رقم"}
              </div>
            ))}
          </div>
        )}

        {selectedStudent && (
          <div style={{ marginTop: 12, padding: 10, background: "#f0f9ff", borderRadius: 8, color: "#0a3753" }}>
            <strong>الطالب المختار:</strong> {selectedStudent.full_name} ({selectedStudent.university_id || "—"})
            <button
              onClick={() => {
                setSelectedStudent(null);
                setFeesData(defaultFeesData);
                setInstallmentCount(0);
                setFacultyId(""); setDepartmentId("");
                setAcademicYear(""); setLevelName("");
                setFeesSource("");
                setCalculatedFees(null);
                setAcademicStatus("");
                setFacultyType("");
              }}
              style={{
                marginRight: 12, marginLeft: 12,
                padding: "4px 12px", fontSize: 13,
                background: "#ef4444", color: "white", border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              إلغاء الاختيار
            </button>
          </div>
        )}
      </div>

      {/* نوع البرنامج */}
 <div style={ui.card}>
  <h3 style={ui.sectionTitle}>نوع البرنامج</h3>
  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
    {getAllowedProgramTypes().map(type => (
      <label key={type} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input
          type="radio"
          value={type}
          checked={programType === type}
          onChange={(e) => setProgramType(e.target.value)}
        />
        {type === "diploma" && "دبلوم"}
        {type === "bachelor" && "بكالوريوس"}
        {type === "postgraduate" && "دراسات عليا"}
      </label>
    ))}
  </div>
 </div>

{programType === "postgraduate" && (
  <div style={ui.card}>
    <h3 style={ui.sectionTitle}>برنامج الدراسات العليا</h3>
    <input
      type="text"
      list="fees_pg_list"
      value={postgradProgram}
      onChange={e => setPostgradProgram(e.target.value)}
      placeholder="مثال: ماجستير إدارة أعمال"
      style={ui.input}
    />
    <datalist id="fees_pg_list">
      {pgSmart.programs.map((p, index) => (
        <option key={index} value={p} />
      ))}
    </datalist>
  </div>
)}

      {/* الفترة الدراسية */}
      <div style={ui.card}>
        <h3 style={ui.sectionTitle}>الفترة الدراسية</h3>
        {selectedStudent && (!academicYear || !levelName) && (
          <p style={{ color: "#d97706", fontWeight: 600, margin: "8px 0" }}>
            يرجى اختيار السنة والمستوى كاملين لعرض الرسوم
          </p>
        )}
        <div style={ui.grid}>
          <div style={ui.field}>
            <label>الكلية</label>
            <select value={facultyId} onChange={e => setFacultyId(e.target.value)} style={ui.select}>
              <option value="">اختر الكلية</option>
              {faculties.map(f => <option key={f.id} value={f.id}>{f.faculty_name}</option>)}
            </select>
          </div>
          <div style={ui.field}>
            <label>القسم</label>
            <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} disabled={!facultyId} style={ui.select}>
              <option value="">اختر القسم</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
            </select>
          </div>
 <div style={ui.field}>
  <label>السنة الدراسية</label>
  <input 
    list="fees_years" 
    value={academicYear} 
    onChange={e => {
      const val = e.target.value.replace(/[^\d/]/g, "");
      setAcademicYear(val);
    }} 
    placeholder="مثال: 2025/2026" 
    style={ui.input} 
  />
  <datalist id="fees_years">
    {smart.yearOptions.map(y => <option key={y} value={y} />)}
  </datalist>
 </div>

 <div style={ui.inputGroup}>
    <label style={ui.label}>
      {programType === "postgraduate" ? "الدفعة" : "المستوى"}
    </label>
    <select
      value={levelName}
      onChange={(e) => setLevelName(e.target.value)}
      style={ui.input}
    >
      <option value="">-- اختر --</option>
      {smart.levelOptions.map(l => <option key={l} value={l}>{l}</option>)}
    </select>
  </div>
        </div>

{programType === "postgraduate" && selectedStudent && (
      <div style={ui.field}>
        <label style={ui.label}>
          الفصل الدراسي <span style={{ color: "red" }}>*</span>
        </label>
        <select 
          value={feesData.term_name || ""} 
          onChange={e => setFeesData(prev => ({ ...prev, term_name: e.target.value }))}
          style={ui.select}
          required
        >
          <option value="">اختر الفصل</option>
          <option value="الفصل الأول">الفصل الأول</option>
          <option value="الفصل الثاني">الفصل الثاني</option>
          <option value="الفصل الثالث">الفصل الثالث</option>
        </select>
      </div>
    )}
      </div>

      {academicYear && levelName && (
        <div style={ui.card}>
          <h3 style={ui.sectionTitle}>
            {selectedStudent ? `رسوم الطالب: ${selectedStudent.full_name}` : "الرسوم المبدئية "}
          </h3>

          {academicStatus && (
            <div style={{
              padding: 12,
              background: "#f0f9ff",
              borderRadius: 10,
              marginBottom: 16,
              textAlign: "center",
              fontWeight: 600,
              fontSize: 16,
            }}>
              الموقف الأكاديمي: <span style={{ color: academicStatus === "مجمّد" ? "#b91c1c" : "#0f766e" }}>{academicStatus}</span> ({facultyType})
            </div>
          )}

          {/* عرض الإجماليات */}
          <div style={{
            background: "#f8fafc",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            marginBottom: 24,
          }}>
            <div style={{
              textAlign: "center",
              fontSize: 28,
              fontWeight: 900,
              color: "#0a3753",
              padding: 16,
              background: "#e0f2fe",
              borderRadius: 12,
              margin: "12px 0",
            }}>
              الإجمالي المستحق: {formatCurrency(mainTotal)}
            </div>

            {installmentsTotal > 0 && (
              <div style={{
                textAlign: "center",
                fontSize: 18,
                color: installmentsTotal === mainTotal ? "#166534" : "#b91c1c",
                marginTop: 12,
                fontWeight: installmentsTotal === mainTotal ? "bold" : "normal",
              }}>
                مجموع الأقساط المدخلة: {formatCurrency(installmentsTotal)}
                {installmentsTotal !== mainTotal && " (غير متطابق مع الإجمالي المستحق)"}
              </div>
            )}

            {feesSource && (
              <div style={{
                marginTop: 16,
                padding: 12,
                background: feesSource === "student" ? "#dbeafe" : "#fefce8",
                borderRadius: 10,
                textAlign: "center",
                fontWeight: 700,
                fontSize: 15,
                color: feesSource === "student" ? "#1d4ed8" : "#92400e",
              }}>
                {feesSource === "student" ? "رسوم خاصة بالطالب" : "رسوم عامة"}
              </div>
            )}
          </div>

          {/* {selectedStudent && (
            <button
              onClick={calculateFinalFees}
              disabled={calculating}
              style={{
                ...ui.primaryBtn,
                background: calculating ? "#94a3b8" : "#0a3753",
                marginBottom: 20,
                width: "100%",
              }}
            >
              {calculating ? "جاري الحساب..." : "حساب الرسوم النهائية"}
            </button>
          )} */}

          {calculatedFees && (
            <div style={{ marginBottom: 24, padding: 16, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 16px", color: "#0a3753", fontSize: 18 }}>الرسوم المحسوبة</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><strong>رسوم التسجيل:</strong> {formatCurrency(calculatedFees.registration_fee || 0)}</div>
                <div><strong>رسوم الدراسة:</strong> {formatCurrency(calculatedFees.tuition_fee || 0)}</div>
                <div><strong>رسوم المتأخرات:</strong> {formatCurrency(calculatedFees.late_fee || 0)}</div>
                {calculatedFees.total_extra > 0 && (
                  <div><strong>إضافي (تجميد/فك):</strong> {formatCurrency(calculatedFees.total_extra)}</div>
                )}
                {calculatedFees.scholarship_type && calculatedFees.scholarship_type !== "لا منحة" && (
        <>
          <div><strong>نوع المنحة:</strong> {calculatedFees.scholarship_type}</div>
          <div><strong>نسبة الخصم:</strong> {calculatedFees.scholarship_percentage}%</div>
          <div><strong>الجهة المانحة:</strong> {calculatedFees.scholarship_granted_by || "غير محدد"}</div>
        </>
      )}
                <div><strong>سنة الدخول الأولى:</strong> {calculatedFees.first_enrollment_year || "غير محددة"}</div>
                <div><strong>آخر سنة نشطة:</strong> {calculatedFees.last_active_year || "غير محددة"}</div>
                <div><strong>سنوات الغياب:</strong> {Math.max(0, calculatedFees.years_absent || 0)}</div>
                <div style={{ gridColumn: "1 / -1", color: calculatedFees.notes?.includes("غياب") ? "#b91c1c" : "#0f766e" }}>
                  <strong>ملاحظات:</strong> {calculatedFees.notes || "لا ملاحظات خاصة"}
                </div>
              </div>
            </div>
          )}

          {loadingStudentFees ? (
            <p style={{ color: "#0a3753", textAlign: "center", fontWeight: 600 }}>جاري التحميل...</p>
          ) : (
            <div style={ui.grid}>
 <div style={ui.field}>
  <label>رسوم التسجيل</label>
  <input 
    type="text" 
    inputMode="numeric"
    value={feesData.registration_fee} 
    onChange={e => handleNumericInput("registration_fee", e.target.value)} 
    style={ui.input} 
  />
 </div>

 <div style={ui.field}>
  <label>رسوم الدراسة</label>
  <input 
    type="text" 
    inputMode="numeric"
    value={feesData.tuition_fee} 
    onChange={e => {
      handleNumericInput("tuition_fee", e.target.value, (val) => {
        setFeesData(prev => ({
          ...prev,
          tuition_fee: val,
          tuition_fee_original: val,
        }));
      });
    }}
    style={ui.input} 
  />
 </div>

 <div style={ui.field}>
  <label>رسوم المتأخرات</label>
  <input 
    type="text" 
    inputMode="numeric"
    value={feesData.late_fee} 
    onChange={e => handleNumericInput("late_fee", e.target.value)} 
    style={ui.input} 
  />
 </div>

 {academicStatus === "مجمّد" && (
  <>
    <div style={ui.field}>
      <label>رسوم التجميد</label>
      <input 
        type="text" 
        inputMode="numeric"
        value={feesData.freeze_fee} 
        onChange={e => handleNumericInput("freeze_fee", e.target.value)} 
        style={ui.input} 
      />
    </div>

    <div style={ui.field}>
      <label>رسوم فك التجميد</label>
      <input 
        type="text" 
        inputMode="numeric"
        value={feesData.unfreeze_fee} 
        onChange={e => handleNumericInput("unfreeze_fee", e.target.value)} 
        style={ui.input} 
      />
    </div>
  </>
 )}

              {academicStatus === "إعادة" && (
                <div style={ui.field}>
                  <label>نسبة خصم الإعادة (%)</label>
                  <input type="number" value={feesData.repeat_discount} onChange={e => setFeesData({...feesData, repeat_discount: e.target.value})} style={ui.input} placeholder="50" />
                </div>
              )}

 <div style={ui.field}>
  <label>نوع المنحة</label>
  <select 
    value={feesData.scholarship_type} 
    onChange={handleScholarshipChange} 
    style={ui.select}
  >
    {SCHOLARSHIP_OPTIONS.map(opt => (
      <option key={opt.type} value={opt.type}>
        {opt.type}
        {opt.percentage !== null && opt.percentage !== 0 ? ` (${opt.percentage}%)` : ""}
        {opt.percentage === null ? " (نسبة يدوية)" : ""}
      </option>
    ))}
  </select>
 </div>

 {/* الحقل ده يظهر لكل المنح ما عدا "لا منحة" */}
 {feesData.scholarship_type !== "لا منحة" && (
  <>
    {/* نسبة الخصم – تظهر بس للمنح اليدوية */}
    {["منحة أشقاء", "تخفيضات المدير", "أخرى"].includes(feesData.scholarship_type) && (
 <div style={ui.field}>
  <label>نسبة الخصم (%)</label>
  <input 
    type="text" 
    inputMode="decimal"
    value={feesData.scholarship_percentage || ""} 
    onChange={e => {
      const val = e.target.value;
      const regex = /^[0-9]*\.?[0-9]*$/;
      
      if (regex.test(val) || val === "") {
        const numValue = parseFloat(val);
        
        if (numValue > 100) {
          showToast("لا يمكن أن تتجاوز النسبة 100%", "warning");
          return;
        }
        applyScholarshipDiscount(val === "" ? 0 : Number(val));
      }
    }} 
    style={ui.input} 
    placeholder="مثال: 35" 
  />
 </div>
    )}

    {/* حقل مانح المنحة – يظهر لكل أنواع المنح */}
    <div style={ui.field}>
      <label> الجهة المانحة</label>
      <input 
        type="text" 
        value={feesData.scholarship_granted_by || ""} 
        onChange={e => setFeesData(prev => ({
          ...prev,
          scholarship_granted_by: e.target.value
        }))} 
        style={ui.input} 
        placeholder="اكتب اسم الشخص أو الجهة المانحة (مطلوب)"
        required
      />
      <small style={{ color: "#64748b", fontSize: 12, marginTop: 4, display: "block" }}>
        مطلوب لكل أنواع المنح لتوثيق مصدر المنحة
      </small>
    </div>
  </>
 )}

              {feesData.scholarship_percentage > 0 && (
                <div style={{
                  gridColumn: "1 / -1",
                  padding: 14,
                  background: "#ecfdf5",
                  borderRadius: 10,
                  border: "1px solid #86efac",
                  textAlign: "center",
                  margin: "12px 0",
                  fontWeight: 600,
                  color: "#166534",
                  fontSize: 16,
                }}>
                  تم تطبيق خصم {feesData.scholarship_percentage}% بسبب "{feesData.scholarship_type}"<br />
                  رسوم الدراسة بعد الخصم: {formatCurrency(feesData.tuition_fee)}
                </div>
              )}

 <div style={{ gridColumn: "1 / -1", marginBottom: 16 }}>
  <label style={ui.label}>نوع العملة</label>
  <div style={{ display: "flex", gap: 30, marginTop: 8 }}>
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <input
        type="radio"
        name="currency"
        value="SDG"
        checked={feesData.currency === "SDG"}        
        onChange={() => setFeesData(prev => ({ ...prev, currency: "SDG" }))}   
      />
      جنيه سوداني (SDG)
    </label>

    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <input
        type="radio"
        name="currency"
        value="USD"
        checked={feesData.currency === "USD"}        
        onChange={() => setFeesData(prev => ({ ...prev, currency: "USD" }))}   
      />
      دولار أمريكي (USD)
    </label>
  </div>
 </div>
 {selectedStudent && (
 <div style={{ gridColumn: "1 / -1" }}>
  <label style={ui.label}>عدد الأقساط</label>

  {/* رسالة توضيحية مهمة جدًا */}
  {selectedStudent && (
    <div
      style={{
        margin: "12px 0 16px",
        padding: "12px 16px",
        background: paidCount === 6 ? "#ecfdf5" : "#fefce8",
        borderRadius: 10,
        border: paidCount === 6 ? "1px solid #10b981" : "1px solid #facc15",
        color: paidCount === 6 ? "#065f46" : "#92400e",
        fontWeight: 600,
        fontSize: 15,
        textAlign: "center",
      }}
    >
      {paidCount === 6 
        ? "جميع الأقساط مدفوعة بالكامل – لا يمكن تغيير عدد الأقساط"
        : `الطالب دفع ${paidCount} قسط/أقساط –  أقل عدد مسموح: ${minAllowedInstallments}`}
    </div>
  )}

  <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 10 }}>
    {INSTALLMENT_OPTIONS.map(opt => {
      // معطل لو أقل من minAllowedInstallments
      // أو لو كله مدفوع (paidCount === 6) ومش بنعرض الرقم الحالي بس
      const isDisabled = 
        opt.value < minAllowedInstallments || 
        (paidCount === 6 && opt.value !== installmentCount);

      return (
        <label
          key={opt.value}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: isDisabled ? 0.5 : 1,
            cursor: isDisabled ? "not-allowed" : "pointer",
            color: isDisabled ? "#9ca3af" : "#0f172a",
          }}
        >
          <input
            type="radio"
            name="installment_count"
            checked={installmentCount === opt.value}
            onChange={() => {
              if (isDisabled) {
                if (paidCount === 6) {
                  showToast("جميع الأقساط مدفوعة – لا يمكن التعديل", "info");
                } else {
                  showToast(
                  `أقل عدد مسموح هو ${minAllowedInstallments} (مدفوع ${paidCount} + قسط متبقي على الأقل)`,
                  "warning"
                );
                }
                return;
              }

              setInstallmentCount(opt.value);
              // إعادة تقسيم تلقائي بعد التغيير
              setTimeout(autoDivideInstallments, 100);
            }}
            disabled={isDisabled}
          />
          {opt.label}
          {isDisabled && opt.value < minAllowedInstallments && (
            <span style={{ fontSize: 12, color: "#dc2626", fontWeight: "bold" }}>
              غير مسموح
            </span>
          )}
        </label>
      );
    })}
  </div>

  {installmentCount > 0 && (
    <button
      onClick={autoDivideInstallments}
      style={{
        marginTop: 12,
        padding: "8px 16px",
        background: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      تقسيم الأقساط تلقائيًا
    </button>
  )}
 </div>
 )}

 {installmentCount > 0 && (
  <div style={{ gridColumn: "1 / -1" }}>
    {/* عنوان القسم */}
    <h4 
      style={{ 
        margin: "32px 0 24px", 
        color: "#0a3753", 
        fontSize: 22, 
        fontWeight: 800, 
        textAlign: "center",
        direction: "rtl"
      }}
    >
      تفاصيل الأقساط
    </h4>

    {/* شبكة الأقساط */}
    <div 
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        gap: 24,
      }}
    >
      {Array.from({ length: installmentCount }).map((_, i) => {
        const idx = i + 1;

        return (
          <div
            key={idx}
            style={{
              position: 'relative',
              border: paidInstallments[idx] 
                ? '1px solid #86efac' 
                : '1px solid #cbd5e1',
              borderRadius: 16,
              padding: '24px 20px',
              background: paidInstallments[idx] 
                ? 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)' 
                : '#ffffff',
              boxShadow: paidInstallments[idx] 
                ? '0 6px 20px rgba(16,185,129,0.18)' 
                : '0 4px 12px rgba(0,0,0,0.06)',
              transition: 'all 0.25s ease',
              borderTop: paidInstallments[idx] 
                ? '5px solid #10b981' 
                : '5px solid #3b82f6',
            }}
          >
            {/* عنوان القسط + حالة */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: paidInstallments[idx] ? '#065f46' : '#1e40af',
                }}
              >
                القسط {idx}
              </div>

              <div
                style={{
                  padding: '6px 18px',
                  borderRadius: 9999,
                  fontSize: 13.5,
                  fontWeight: 700,
                  background: paidInstallments[idx] ? '#10b981' : '#eff6ff',
                  color: paidInstallments[idx] ? 'white' : '#1d4ed8',
                  boxShadow: paidInstallments[idx] ? '0 2px 8px rgba(16,185,129,0.3)' : 'none',
                }}
              >
                {paidInstallments[idx] ? 'مدفوع' : 'متبقي'}
              </div>
            </div>

            {/* المبلغ */}
            <div style={{ marginBottom: 22 }}>
              <label
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                المبلغ المستحق
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={feesData[`installment_${idx}`] || ""}
                  onChange={(e) => {
                    if (paidInstallments[idx]) return;
                    setFeesData((prev) => ({
                      ...prev,
                      [`installment_${idx}`]: e.target.value,
                    }));
                  }}
                  disabled={paidInstallments[idx]}
                  style={{
                    ...ui.input,
                    fontSize: 17,
                    fontWeight: 700,
                    paddingRight: 55,
                    background: paidInstallments[idx] ? '#ecfdf5' : 'white',
                    borderColor: paidInstallments[idx] ? '#6ee7b7' : '#9ca3af',
                    color: paidInstallments[idx] ? '#065f46' : '#0f172a',
                    borderRadius: 10,
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: paidInstallments[idx] ? '#10b981' : '#64748b',
                    fontWeight: 700,
                    fontSize: 15,
                    pointerEvents: 'none',
                  }}
                >
                </span>
              </div>

              {paidInstallments[idx] && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13.5,
                    color: '#065f46',
                    fontWeight: 500,
                  }}
                >
                  تم الدفع – لا يمكن تعديل هذا القسط
                </div>
              )}
            </div>

            {/* التواريخ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: 8,
                    display: 'block',
                  }}
                >
                  بداية الدفع
                </label>
                <input
                  type="date"
                  value={feesData[`installment_${idx}_start`] || ''}
                  onChange={(e) => {
                    if (paidInstallments[idx]) return;
                    setFeesData((prev) => ({
                      ...prev,
                      [`installment_${idx}_start`]: e.target.value,
                    }));
                  }}
                  disabled={paidInstallments[idx]}
                  style={{
                    ...ui.input,
                    fontSize: 14,
                    background: paidInstallments[idx] ? '#ecfdf5' : 'white',
                    borderColor: paidInstallments[idx] ? '#6ee7b7' : '#d1d5db',
                    borderRadius: 10,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: 8,
                    display: 'block',
                  }}
                >
                  نهاية الدفع
                </label>
                <input
                  type="date"
                  value={feesData[`installment_${idx}_end`] || ''}
                  onChange={(e) => {
                    if (paidInstallments[idx]) return;
                    setFeesData((prev) => ({
                      ...prev,
                      [`installment_${idx}_end`]: e.target.value,
                    }));
                  }}
                  disabled={paidInstallments[idx]}
                  style={{
                    ...ui.input,
                    fontSize: 14,
                    background: paidInstallments[idx] ? '#ecfdf5' : 'white',
                    borderColor: paidInstallments[idx] ? '#6ee7b7' : '#d1d5db',
                    borderRadius: 10,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
 )}

            </div>
          )}

          <button onClick={saveFees} style={ui.primaryBtn}>
            {selectedStudent ? "حفظ/تحديث رسوم الطالب" : "حفظ الرسوم المبدئية"}
          </button>
          {selectedStudent && (
  <button
    onClick={printFeesReport}
    style={{
      ...ui.primaryBtn,
      background: "#0f766e", 
      marginTop: 15,
      // width: "100%",
    }}
  >
    طباعة تقرير الرسوم
  </button>
 )}
        </div>
      )}
    </div>
  );
}

export default RegistrationTabs;