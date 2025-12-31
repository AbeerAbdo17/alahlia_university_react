import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const API_BASE = "http://localhost:5000/api";

const TermResult = () => {
  const navigate = useNavigate();

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

  // ===== Result Data
  const [savedRows, setSavedRows] = useState([]);
  const [skippedRows, setSkippedRows] = useState([]);

  // ===== Loading flags
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  const [computingResult, setComputingResult] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);

  // ===== Step logic
  const canPickDepartment = !!selectedFacultyId;
  const canPickProgramType = !!selectedDepartmentId;

  const canPickPostgraduateProgram = programType === "postgraduate";
  const canProceedAfterProgram = programType === "undergraduate" ? true : !!postgraduateProgram.trim();

  const canPickYear = canPickProgramType && canProceedAfterProgram;
  const canPickLevel = !!academicYear.trim();
  const canPickTerm = !!levelName.trim();

  const canComputeTerm =
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
    setSavedRows([]);
    setSkippedRows([]);

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

    setSavedRows([]);
    setSkippedRows([]);
  };

  const resetBelowDepartment = () => {
    setProgramType("undergraduate");
    setPostgraduateProgram("");

    setAcademicYear("");
    setLevelName("");
    setTermName("");

    setSavedRows([]);
    setSkippedRows([]);
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
  // Result APIs
  // =========================
  const computeAndSaveResult = async () => {
    if (!canComputeTerm) return showToast("كمّل الاختيارات أولاً", "error");

    setComputingResult(true);
    setSkippedRows([]);
    setSavedRows([]);

    try {
      const payload = {
        faculty_id: Number(selectedFacultyId),
        department_id: Number(selectedDepartmentId),
        program_type: programType,
        postgraduate_program: programType === "postgraduate" ? postgraduateProgram.trim() : null,
        academic_year: academicYear.trim(),
        level_name: levelName.trim(),
        term_name: termName.trim(),
      };

      const res = await fetch(`${API_BASE}/term-results/calculate-save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل حساب النتيجة");

      setSavedRows(Array.isArray(data.saved) ? data.saved : []);
      setSkippedRows(Array.isArray(data.skipped) ? data.skipped : []);

      showToast(data.message || "تم حساب النتيجة", "success");
    } catch (e) {
      console.error(e);
      showToast(e.message || "مشكلة في حساب النتيجة", "error");
    } finally {
      setComputingResult(false);
    }
  };

const loadSavedResult = async () => {
  if (!canComputeTerm) return;

  setLoadingResult(true);
  setSkippedRows([]);
  setSavedRows([]);

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

    const res = await fetch(`${API_BASE}/term-results/list?${qs}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "فشل تحميل النتيجة");

    const rows = Array.isArray(data) ? data : [];
    setSavedRows(rows);

    // ✅ لو ما في نتائج محفوظة -> احسب وخزن تلقائي
    if (rows.length === 0) {
      await computeAndSaveResult();
    }
  } catch (e) {
    console.error(e);
    showToast(e.message || "مشكلة في تحميل النتيجة", "error");
  } finally {
    setLoadingResult(false);
  }
};

useEffect(() => {
  if (!canComputeTerm) return;

  // حمّل النتيجة تلقائياً عند اكتمال الاختيارات
  loadSavedResult();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [canComputeTerm]);

  return (
    <div className="admission-layout">
      <header className="library-header">
        <div className="library-header-title">
          <span style={{ fontSize: 22 }}></span>
          <span> حساب النتيجة</span>
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
                      name="programTypeResult"
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
                      name="programTypeResult"
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
                  list="years_list_result"
                  placeholder="مثال: 2024/2025"
                  value={academicYear}
                  onChange={(e) => {
                    setAcademicYear(e.target.value);
                    setLevelName("");
                    setTermName("");
                    setSavedRows([]);
                    setSkippedRows([]);
                  }}
                  disabled={!canPickYear || loadingPeriods}
                />
                <datalist id="years_list_result">
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
                  list="levels_list_result"
                  placeholder="مثال: المستوى الأول"
                  value={levelName}
                  onChange={(e) => {
                    setLevelName(e.target.value);
                    setTermName("");
                    setSavedRows([]);
                    setSkippedRows([]);
                  }}
                  disabled={!canPickLevel}
                />
                <datalist id="levels_list_result">
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
                  list="terms_list_result"
                  placeholder="مثال: الفصل الأول"
                  value={termName}
                  onChange={(e) => {
                    setTermName(e.target.value);
                    setSavedRows([]);
                    setSkippedRows([]);
                  }}
                  disabled={!canPickTerm}
                />
                <datalist id="terms_list_result">
                  {termOptions.map((x) => (
                    <option key={x} value={x} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <h2 className="card-title">حساب النتيجة (GPA + تصنيف)</h2>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={computeAndSaveResult}
                disabled={!canComputeTerm || computingResult}
              >
                {computingResult ? "جاري الحساب ..." : "حساب النتيجة"}
              </button>

              <div style={{ color: "#6b7280", fontWeight: 800, alignSelf: "center" }}>
                عدد النتائج: {savedRows.length}
              </div>
            </div>

            {skippedRows.length > 0 && (
              <div style={{ marginTop: 10, overflowX: "auto" }}>
                <div style={{ color: "#b91c1c", fontWeight: 900, marginBottom: 8 }}>
                 يوجد (مواد/درجات ناقصة)
                </div>

                <table className="simple-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>الطالب</th>
                      <th>الرقم الجامعي</th>
                      <th>عدد المواد الناقصة</th>
                      <th>السبب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skippedRows.map((m, idx) => (
                      <tr key={`${m.student_id}-${idx}`}>
                        <td>{idx + 1}</td>
                        <td>{m.full_name}</td>
                        <td>{m.university_id}</td>
                        <td>{m.missing_courses}</td>
                        <td>{m.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ overflowX: "auto", marginTop: 10 }}>
              {!canComputeTerm ? (
                <p style={{ color: "#6b7280" }}>كمّل اختيار الفصل أولاً.</p>
              ) : computingResult || loadingResult ? (
                <p>جارٍ التحميل...</p>
              ) : savedRows.length === 0 ? (
                <p style={{ color: "#6b7280" }}>لا توجد نتيجة محفوظة/محسوبة لهذا الفصل بعد.</p>
              ) : (
                <table className="simple-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>الاسم</th>
                      <th>الرقم الجامعي</th>
                      <th>GPA فصلي</th>
                      <th>GPA تراكمي</th>
                      <th>التصنيف</th>
                      <th>نقاط الفصل</th>
                      <th>ساعات الفصل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedRows.map((r, idx) => (
                      <tr key={`${r.student_id}-${idx}`}>
                        <td>{idx + 1}</td>
                        <td>{r.full_name}</td>
                        <td>{r.university_id}</td>
                        <td>{r.term_gpa ?? "—"}</td>
                        <td>{r.cumulative_gpa ?? "—"}</td>
                        <td>{r.classification_label ?? "—"}</td>
                        <td>{r.term_total_points ?? "—"}</td>
                        <td>{r.term_total_hours ?? "—"}</td>

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

export default TermResult;
