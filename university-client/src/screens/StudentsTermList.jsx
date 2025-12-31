// StudentsTermList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const API_BASE = "http://localhost:5000/api";

const StudentsTermList = () => {
  const navigate = useNavigate();

  // ===== Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ===== Lists
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [periods, setPeriods] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [termOptions, setTermOptions] = useState([]);

  // ===== Filters
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const [programType, setProgramType] = useState("undergraduate"); // undergraduate | postgraduate
  const [postgraduateProgram, setPostgraduateProgram] = useState("");

  const [academicYear, setAcademicYear] = useState("");
  const [levelName, setLevelName] = useState("");
  const [termName, setTermName] = useState("");

  // ===== Students Data
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ===== UI helpers
  const [searchText, setSearchText] = useState("");

  // ===== Loading flags
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  // ===== Step logic
  const canPickDepartment = !!selectedFacultyId;
  const canPickProgramType = !!selectedDepartmentId;

  const canPickPostgraduateProgram = programType === "postgraduate";
  const canProceedAfterProgram = programType === "undergraduate" ? true : !!postgraduateProgram.trim();

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

  // =========================
  // Load faculties
  // =========================
  useEffect(() => {
    const fetchFaculties = async () => {
      setLoadingFaculties(true);
      try {
        const res = await fetch(`${API_BASE}/faculties-list`);
        const data = await res.json();
        setFaculties(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        showToast("مشكلة في تحميل الكليات", "error");
      } finally {
        setLoadingFaculties(false);
      }
    };
    fetchFaculties();
  }, []);

  // =========================
  // Load departments
  // =========================
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

  // =========================
  // Load academic periods
  // =========================
  const fetchAcademicPeriods = async (pType, pgProg) => {
    setLoadingPeriods(true);
    try {
      const pt = (pType || "undergraduate").trim();
      const pg = (pgProg || "").trim();

      let url = `${API_BASE}/academic-periods?program_type=${encodeURIComponent(pt)}`;
      if (pt === "postgraduate" && pg) url += `&postgraduate_program=${encodeURIComponent(pg)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل تحميل الفترات");

      const rows = Array.isArray(data) ? data : [];
      setPeriods(rows);

      const ys = Array.from(new Set(rows.map((r) => (r.academic_year || "").trim()).filter(Boolean)));
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
      new Set(
        rows
          .filter((r) => (r.academic_year || "").trim() === y)
          .map((r) => (r.level_name || "").trim())
          .filter(Boolean)
      )
    );
    setLevelOptions(levels);

    const terms = Array.from(
      new Set(
        rows
          .filter((r) => (r.academic_year || "").trim() === y && (r.level_name || "").trim() === l)
          .map((r) => (r.term_name || "").trim())
          .filter(Boolean)
      )
    );
    setTermOptions(terms);
  };

  useEffect(() => {
    rebuildLevelAndTermOptions(periods, academicYear, levelName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periods, academicYear, levelName]);

  // تغيّر programType/pgProg → reset + reload periods
  useEffect(() => {
    setAcademicYear("");
    setLevelName("");
    setTermName("");
    setStudents([]);
    setSearchText("");

    if (selectedDepartmentId) fetchAcademicPeriods(programType, postgraduateProgram);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programType, postgraduateProgram]);

  useEffect(() => {
    if (programType !== "postgraduate") setPostgraduateProgram("");
  }, [programType]);

  // =========================
  // Reset helpers
  // =========================
  const resetBelowFaculty = () => {
    setDepartments([]);
    setSelectedDepartmentId("");

    setProgramType("undergraduate");
    setPostgraduateProgram("");

    setAcademicYear("");
    setLevelName("");
    setTermName("");

    setStudents([]);
    setSearchText("");
  };

  const resetBelowDepartment = () => {
    setProgramType("undergraduate");
    setPostgraduateProgram("");

    setAcademicYear("");
    setLevelName("");
    setTermName("");

    setStudents([]);
    setSearchText("");
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

  // =========================
  // Load students API
  // =========================
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
      showToast(`تم تحميل ${Array.isArray(data) ? data.length : 0} طالب`, "success");
    } catch (e) {
      console.error(e);
      showToast(e.message || "مشكلة في تحميل الطلاب", "error");
    } finally {
      setLoadingStudents(false);
    }
  };

  // تحميل تلقائي عند اكتمال الاختيارات
  useEffect(() => {
    if (!canLoadStudents) return;
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoadStudents]);

  // ===== Filtered list
  const filteredStudents = useMemo(() => {
    const q = (searchText || "").trim().toLowerCase();
    if (!q) return students;

    return students.filter((s) => {
      const name = (s.full_name || "").toLowerCase();
      const uni = String(s.university_id || "").toLowerCase();
      return name.includes(q) || uni.includes(q);
    });
  }, [students, searchText]);

  return (
    <div className="admission-layout">
      <header className="library-header">
        <div className="library-header-title">
          <span style={{ fontSize: 22 }}></span>
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
          {/* اختيار الفصل */}
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
                  <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 700 }}>
                    <input
                      type="radio"
                      name="programTypeStudents"
                      value="undergraduate"
                      checked={programType === "undergraduate"}
                      onChange={(e) => setProgramType(e.target.value)}
                      disabled={!canPickProgramType}
                    />
                    بكالوريوس
                  </label>

                  <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 700 }}>
                    <input
                      type="radio"
                      name="programTypeStudents"
                      value="postgraduate"
                      checked={programType === "postgraduate"}
                      onChange={(e) => setProgramType(e.target.value)}
                      disabled={!canPickProgramType}
                    />
                    دراسات عليا
                  </label>
                </div>
              </div>

              {canPickPostgraduateProgram && (
                <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="input-label">اسم برنامج الدراسات العليا</label>
                  <input
                    className="input-field"
                    dir="rtl"
                    placeholder="مثال: ماجستير إدارة أعمال"
                    value={postgraduateProgram}
                    onChange={(e) => setPostgraduateProgram(e.target.value)}
                    disabled={!canPickProgramType}
                  />
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
                <label className="input-label">المستوى</label>
                <input
                  className="input-field"
                  dir="rtl"
                  list="levels_list_students"
                  placeholder="مثال: المستوى الأول"
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
                <input
                  className="input-field"
                  dir="rtl"
                  list="terms_list_students"
                  placeholder="مثال: الفصل الأول"
                  value={termName}
                  onChange={(e) => {
                    setTermName(e.target.value);
                    setStudents([]);
                    setSearchText("");
                  }}
                  disabled={!canPickTerm}
                />
                <datalist id="terms_list_students">
                  {termOptions.map((x) => (
                    <option key={x} value={x} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* قائمة الطلاب */}
          <div className="card" style={{ marginTop: 14 }}>
            <h2 className="card-title">قائمة الطلاب المسجلين</h2>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={loadStudents}
                disabled={!canLoadStudents || loadingStudents}
              >
                {loadingStudents ? "جارٍ التحميل..." : "تحديث القائمة"}
              </button>

              <div style={{ color: "#6b7280", fontWeight: 800 }}>
                العدد: {filteredStudents.length} / {students.length}
              </div>

              <div style={{ flex: 1 }} />

              <input
                className="input-field"
                dir="rtl"
                placeholder="بحث بالاسم أو الرقم الجامعي..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ maxWidth: 320 }}
                disabled={students.length === 0}
              />
            </div>

            {students.length === 0 && canLoadStudents && !loadingStudents && (
              <div style={{ color: "#6b7280", fontWeight: 800 }}>
                لا يوجد طلاب (أو لم يتم تسجيل طلاب لهذا الفصل).
              </div>
            )}

            {filteredStudents.length > 0 && (
              <div style={{ marginTop: 10, overflowX: "auto" }}>
                <table className="simple-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ whiteSpace: "nowrap" }}>#</th>
                      <th style={{ whiteSpace: "nowrap" }}>الرقم الجامعي</th>
                      <th style={{ whiteSpace: "nowrap" }}>اسم الطالب</th>
                      <th style={{ whiteSpace: "nowrap" }}>الحالة الأكاديمية</th>
                      <th style={{ whiteSpace: "nowrap" }}>حالة التسجيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, idx) => (
                      <tr key={s.student_id ?? idx}>
                        <td>{idx + 1}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{s.university_id || "-"}</td>
                        <td style={{ fontWeight: 800 }}>{s.full_name || "-"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{s.academic_status || "-"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{s.registration_status || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Toast */}
          {toast && (
            <div
              style={{
                position: "fixed",
                right: 16,
                bottom: 16,
                background: toast.type === "error" ? "#dc2626" : "#16a34a",
                color: "white",
                padding: "12px 14px",
                borderRadius: 10,
                fontWeight: 900,
                boxShadow: "0 12px 30px rgba(0,0,0,.25)",
                zIndex: 9999,
              }}
            >
              {toast.message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentsTermList;
