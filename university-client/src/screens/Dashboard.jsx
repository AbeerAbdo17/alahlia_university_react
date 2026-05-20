import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoDocumentText, IoLogOut } from "react-icons/io5";
import EnrollmentStats from "./EnrollmentStats";

import {
  FaUsers,
  FaUniversity,
  FaBookOpen,
  FaClipboardCheck,
  FaCalculator,
  FaChalkboardTeacher,
  FaChartPie,
  FaUserCog,
  FaCalendarAlt,
  FaGraduationCap,
  FaClipboardList,
  FaSyncAlt,
} from "react-icons/fa";

import "./Dashboard.css";

const API_BASE = "http://localhost:5000/api";

const portalLinks = [
  { title: "المكتبة",                  icon: <FaBookOpen />,         path: "/books",            tone: "purple" },
  { title: "القبول والتسجيل",          icon: <IoDocumentText />,      path: "/RegistrationTabs", tone: "teal"   },
  { title: "إعدادات النظام الأكاديمي", icon: <FaUniversity />,        path: "/faculty",          tone: "slate"  },
  { title: "إدخال الدرجات",            icon: <FaClipboardCheck />,    path: "/GradeEntry",       tone: "indigo" },
  { title: "حساب النتائج",             icon: <FaCalculator />,        path: "/TermResult",       tone: "amber"  },
  { title: "قوائم الطلاب",             icon: <FaUsers />,             path: "/StudentsTermList", tone: "blue"   },
  { title: "أعضاء هيئة التدريس",       icon: <FaChalkboardTeacher />, path: "/StaffMembers",     tone: "green"  },
  { title: "الجداول الدراسية",          icon: <FaCalendarAlt />,       path: "/schedule",         tone: "cyan"   },
  { title: "الشهادات",                 icon: <FaGraduationCap />,     path: "/certificates",     tone: "pink"   },
  { title: "السجل الأكاديمي",          icon: <FaClipboardList />,     path: "/academic-record",  tone: "red"    },
  { title: "تقارير الرسوم",            icon: <FaChartPie />,          path: "/reports",          tone: "orange" },
  { title: "المستخدمين والصلاحيات",    icon: <FaUserCog />,           path: "/UsersManagement",  tone: "gray"   },
];

/* ─── Stat Card ─────────────────────────────── */
function StatCard({ label, value, icon }) {
  return (
    <div className="dash-stat">
      <div className="dash-stat-icon">{icon}</div>
      <div className="dash-stat-body">
        <div className="dash-stat-value">{value ?? "—"}</div>
        <div className="dash-stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ─── Dashboard ─────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);
  const [showEnrollment, setShowEnrollment] = useState(false);

  /* Auth guard */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) navigate("/login", { replace: true });
  }, [navigate]);

  /* Toast helper */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* Load summary */
  const loadSummary = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل تحميل ملخص لوحة التحكم");
      setSummary(data);
    } catch (e) {
      console.error(e);
      setSummary(null);
      showToast(e.message || "مشكلة في تحميل الملخص", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSummary(); }, []);

  /* Stats array */
  const stats = useMemo(() => [
    { label: "الطلاب",             value: summary?.students,      icon: <FaUsers /> },
    { label: "الذكور",             value: summary?.male_count,    icon: <FaUsers /> },
    { label: "الإناث",             value: summary?.female_count,  icon: <FaUsers /> },
    { label: "التسجيلات",          value: summary?.registrations, icon: <FaUniversity /> },
    { label: "المواد",             value: summary?.courses,       icon: <FaClipboardCheck /> },
    { label: "نتائج الفصول",       value: summary?.term_results,  icon: <FaCalculator /> },
    { label: "الكتب",              value: summary?.books,         icon: <FaBookOpen /> },
    { label: "أعضاء هيئة التدريس", value: summary?.staff_members, icon: <FaChalkboardTeacher /> },
    { label: "الكليات",            value: summary?.faculties,     icon: <FaUniversity /> },
    { label: "الأقسام",            value: summary?.departments,   icon: <FaUniversity /> },
  ], [summary]);

  /* Permissions */
  const user         = JSON.parse(sessionStorage.getItem("user") || "{}");
  const allowedPages = Array.isArray(user.allowed_pages) ? user.allowed_pages : [];
  const visibleLinks = portalLinks.filter(
    (link) => user.role === "admin" || allowedPages.includes(link.title.trim())
  );

  /* Logout */
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setTimeout(() => navigate("/login"), 500);
  };

  /* Greeting time */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "صباح الخير" :
    hour < 17 ? "مساء الخير" :
                "مساء النور";

  return (
    <div className="admission-layout">

      {/* ══ Header ══════════════════════════════ */}
      <header className="library-header">
          <h1>جامعة بورتسودان الأهلية</h1>

        <button className="logout-btn" onClick={handleLogout}>
          <IoLogOut size={18} />
          تسجيل الخروج
        </button>
      </header>

      {/* ══ Main ════════════════════════════════ */}
      <main className="library-main">
        <div className="library-container">

          {/* Hero */}
          <div className="dash-hero">
            <div className="dash-hero-row">
              <div className="dash-hero-left">
                <div className="dash-hero-title">
                  <span className="wave"></span>
                  {greeting}،&nbsp;
                  <strong>{user.full_name || user.username || "المستخدم"}</strong>
                </div>
                <div className="dash-hero-subtitle">
                  مرحباً بك في النظام الأكاديمي 
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div className="dash-badge">
                  آخر تحديث:{" "}
                  {summary?.updated_at
                    ? new Date(summary.updated_at).toLocaleString("ar")
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Stats section */}
          <div className="stats-section">
            <div className="section-header">
              <div>
                <div className="section-title">ملخص سريع</div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowEnrollment(true)}
                  style={{ background: "linear-gradient(135deg, #0a3753, #0b4985)" }}
                >
                  <FaChartPie size={13} />
                  إحصائيات الطلاب
                </button>

                <button
                  className="btn btn-outline"
                  onClick={loadSummary}
                  disabled={loading}
                >
                  <FaSyncAlt
                    size={13}
                    style={{
                      animation: loading ? "spin 1s linear infinite" : "none",
                    }}
                  />
                  {loading ? "جارٍ التحديث…" : "تحديث"}
                </button>
              </div>
            </div>

            <div className="dash-stats-grid">
              {stats.map((s) => (
                <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
              ))}
            </div>
          </div>

          {/* Portal links */}
          <div className="card">
            <h2 className="card-title">أنظمة الكلية</h2>

            <div className="dash-links-grid">
              {visibleLinks.map((x) => (
                <div
                  key={x.title}
                  className={`dash-link dash-link--${x.tone}`}
                  onClick={() => navigate(x.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(x.path)}
                >
                  <div className="dash-link-icon">{x.icon}</div>
                  <div className="dash-link-title">{x.title}</div>
                  <div className="dash-link-hint">فتح</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="dash-footer">
            جامعة بورتسودان الأهلية — النظام الأكاديمي<br />
            جميع الحقوق محفوظة © kian24
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
            {toast.message}
          </div>
        )}

        {/* Enrollment modal */}
        {showEnrollment && (
          <EnrollmentStats onClose={() => setShowEnrollment(false)} />
        )}
      </main>

      {/* Spin keyframe for refresh icon */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}