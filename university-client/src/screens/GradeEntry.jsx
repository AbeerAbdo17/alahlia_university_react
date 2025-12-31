import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const API_BASE = "http://localhost:5000/api";

const GradeEntry = () => {
  const navigate = useNavigate();

  // ✅ الصفحة بقت إدخال درجات فقط (مفيش Tabs)
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

  const [courses, setCourses] = useState([]);

  // ===== Filters
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const [programType, setProgramType] = useState("undergraduate"); // undergraduate | postgraduate
  const [postgraduateProgram, setPostgraduateProgram] = useState("");

  const [academicYear, setAcademicYear] = useState("");
  const [levelName, setLevelName] = useState("");
  const [termName, setTermName] = useState("");

  const [selectedCourseId, setSelectedCourseId] = useState("");

  // ===== Grade Entry Data
  const [courseInfo, setCourseInfo] = useState(null);
  const [students, setStudents] = useState([]);

  // ===== Loading flags
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingGrades, setSavingGrades] = useState(false);

  // ===== Step logic
  const canPickDepartment = !!selectedFacultyId;
  const canPickProgramType = !!selectedDepartmentId;

  const canPickPostgraduateProgram = programType === "postgraduate";
  const canProceedAfterProgram =
    programType === "undergraduate" ? true : !!postgraduateProgram.trim();

  const canPickYear = canPickProgramType && canProceedAfterProgram;
  const canPickLevel = !!academicYear.trim();
  const canPickTerm = !!levelName.trim();

  const canLoadCourses =
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
  // Load academic periods (حسب البرنامج)
  // =========================
  const fetchAcademicPeriods = async (pType, pgProg) => {
    setLoadingPeriods(true);
    try {
      const pt = (pType || "undergraduate").trim();
      const pg = (pgProg || "").trim();

      let url = `${API_BASE}/academic-periods?program_type=${encodeURIComponent(pt)}`;
      if (pt === "postgraduate" && pg) {
        url += `&postgraduate_program=${encodeURIComponent(pg)}`;
      }

      const res = await fetch(url);
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
          .filter(
            (r) =>
              (r.academic_year || "").trim() === y &&
              (r.level_name || "").trim() === l
          )
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

  // لما نوع البرنامج/اسم PG يتغير: reset وتحديث الفترات
  useEffect(() => {
    setAcademicYear("");
    setLevelName("");
    setTermName("");
    setCourses([]);
    setSelectedCourseId("");
    setCourseInfo(null);
    setStudents([]);

    if (selectedDepartmentId) {
      fetchAcademicPeriods(programType, postgraduateProgram);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programType, postgraduateProgram]);

  useEffect(() => {
    if (programType !== "postgraduate") setPostgraduateProgram("");
  }, [programType]);

  // =========================
  // Load courses after filters complete
  // =========================
  const fetchCourses = async () => {
    if (!canLoadCourses) return;
    setLoadingCourses(true);
    try {
      const qs =
        `faculty_id=${selectedFacultyId}` +
        `&department_id=${selectedDepartmentId}` +
        `&academic_year=${encodeURIComponent(academicYear.trim())}` +
        `&level_name=${encodeURIComponent(levelName.trim())}` +
        `&term_name=${encodeURIComponent(termName.trim())}` +
        `&program_type=${encodeURIComponent(programType)}` +
        (programType === "postgraduate"
          ? `&postgraduate_program=${encodeURIComponent(postgraduateProgram.trim())}`
          : "");

      const res = await fetch(`${API_BASE}/courses?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل تحميل المواد");
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setCourses([]);
      showToast(e.message || "مشكلة في تحميل المواد", "error");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    setSelectedCourseId("");
    setCourseInfo(null);
    setStudents([]);

    if (canLoadCourses) fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedFacultyId,
    selectedDepartmentId,
    academicYear,
    levelName,
    termName,
    programType,
    postgraduateProgram,
  ]);

  const courseMeta = useMemo(() => {
    if (!courseInfo) return null;
    return {
      instructor: courseInfo.instructor || "—",
      hours: courseInfo.credit_hours ?? "—",
      cwMax: Number(courseInfo.coursework_max ?? 40),
      feMax: Number(courseInfo.final_exam_max ?? 60),
      total: Number(courseInfo.total_mark ?? 100),
    };
  }, [courseInfo]);

  // =========================
  // ✅ Local grades calculation
  // =========================
  const clampNum = (v, min, max) => {
    const n = Number(v);
    if (Number.isNaN(n)) return null;
    return Math.max(min, Math.min(max, n));
  };

  // ⚠️ عدّلي السلم حسب نظامكم
  const getLetterAndPoints = (total) => {
    if (total == null) return { letter: null, points: null };
    if (total >= 80) return { letter: "A", points: 4.0 };
    if (total >= 70) return { letter: "B", points: 3.0 };
    if (total >= 60) return { letter: "C", points: 2.0 };
    if (total >= 50) return { letter: "D", points: 1.0 };
    return { letter: "F", points: 0.0 };
  };

  const calcStudentRow = (student) => {
    const cwMax = courseMeta?.cwMax ?? 40;
    const feMax = courseMeta?.feMax ?? 60;
    const totalMax = courseMeta?.total ?? cwMax + feMax;

    const cw =
      student.coursework_mark === "" || student.coursework_mark == null
        ? null
        : clampNum(student.coursework_mark, 0, cwMax);

    const fe =
      student.final_exam_mark === "" || student.final_exam_mark == null
        ? null
        : clampNum(student.final_exam_mark, 0, feMax);

    const total =
      cw == null || fe == null ? null : clampNum(cw + fe, 0, totalMax);

    const { letter, points } = getLetterAndPoints(total);

    return {
      ...student,
      coursework_mark: cw == null ? "" : cw,
      final_exam_mark: fe == null ? "" : fe,
      total_mark: total,
      letter,
      points,
    };
  };

  // =========================
  // Fetch students for selected course
  // =========================
  const fetchStudentsForCourse = async (courseId) => {
    if (!courseId) return;
    setLoadingStudents(true);
    try {
      const res = await fetch(
        `${API_BASE}/grade-entry/students?course_id=${courseId}`
      );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  // =========================
  // UI handlers
  // =========================
  const resetBelowFaculty = () => {
    setDepartments([]);
    setSelectedDepartmentId("");

    setProgramType("undergraduate");
    setPostgraduateProgram("");

    setAcademicYear("");
    setLevelName("");
    setTermName("");
    setCourses([]);
    setSelectedCourseId("");
    setCourseInfo(null);
    setStudents([]);
  };

  const resetBelowDepartment = () => {
    setProgramType("undergraduate");
    setPostgraduateProgram("");

    setAcademicYear("");
    setLevelName("");
    setTermName("");
    setCourses([]);
    setSelectedCourseId("");
    setCourseInfo(null);
    setStudents([]);
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

  const onChangeMark = (studentId, field, value) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.student_id !== studentId) return s;
        const updated = { ...s, [field]: value };
        return calcStudentRow(updated);
      })
    );
  };

  const saveGrades = async () => {
    if (!selectedCourseId) return showToast("اختار المادة أولاً", "error");

    setSavingGrades(true);
    try {
      const payload = {
        course_id: Number(selectedCourseId),
        grades: students.map((s) => ({
          student_id: s.student_id,
          coursework_mark: s.coursework_mark === "" ? null : Number(s.coursework_mark),
          final_exam_mark: s.final_exam_mark === "" ? null : Number(s.final_exam_mark),
        })),
      };

      const res = await fetch(`${API_BASE}/grade-entry/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل حفظ الدرجات");

      showToast(data.message || "تم حفظ الدرجات", "success");
      await fetchStudentsForCourse(selectedCourseId);
    } catch (e) {
      console.error(e);
      showToast(e.message || "مشكلة في حفظ الدرجات", "error");
    } finally {
      setSavingGrades(false);
    }
  };

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
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="رجوع للصفحة الرئيسية"
        >
          <IoArrowBack />
        </button>
      </header>

      <main className="library-main">
        <div className="library-container">
          {/* ===== Filters Card ===== */}
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
                    <option key={f.id} value={f.id}>
                      {f.faculty_name}
                    </option>
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
                    {!canPickDepartment
                      ? "اختار كلية أولاً"
                      : loadingDeps
                      ? "جارٍ تحميل الأقسام..."
                      : "— اختار —"}
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.department_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3) نوع البرنامج */}
              <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                <label className="input-label">نوع البرنامج</label>

                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                  <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 700 }}>
                    <input
                      type="radio"
                      name="programTypeGrades"
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
                      name="programTypeGrades"
                      value="postgraduate"
                      checked={programType === "postgraduate"}
                      onChange={(e) => setProgramType(e.target.value)}
                      disabled={!canPickProgramType}
                    />
                    دراسات عليا
                  </label>
                </div>
              </div>

              {/* 4) اسم برنامج الدراسات العليا */}
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

              {/* 5) السنة */}
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
                    setLevelName("");
                    setTermName("");
                    setCourses([]);
                    setSelectedCourseId("");
                    setCourseInfo(null);
                    setStudents([]);
                  }}
                  disabled={!canPickYear || loadingPeriods}
                />
                <datalist id="years_list_grades">
                  {yearOptions.map((x) => (
                    <option key={x} value={x} />
                  ))}
                </datalist>
              </div>

              {/* 6) المستوى */}
              <div className="input-group">
                <label className="input-label">المستوى</label>
                <input
                  className="input-field"
                  dir="rtl"
                  list="levels_list_grades"
                  placeholder="مثال: المستوى الأول"
                  value={levelName}
                  onChange={(e) => {
                    setLevelName(e.target.value);
                    setTermName("");
                    setCourses([]);
                    setSelectedCourseId("");
                    setCourseInfo(null);
                    setStudents([]);
                  }}
                  disabled={!canPickLevel}
                />
                <datalist id="levels_list_grades">
                  {levelOptions.map((x) => (
                    <option key={x} value={x} />
                  ))}
                </datalist>
              </div>

              {/* 7) الفصل */}
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
                    setCourseInfo(null);
                    setStudents([]);
                  }}
                  disabled={!canPickTerm}
                />
                <datalist id="terms_list_grades">
                  {termOptions.map((x) => (
                    <option key={x} value={x} />
                  ))}
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
                    {!canLoadCourses
                      ? "كمّل الاختيارات أولاً"
                      : loadingCourses
                      ? "جارٍ تحميل المواد..."
                      : "— اختار —"}
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Info عن المادة */}
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

          {/* =========================
              Entry Only
             ========================= */}
          <div className="card" style={{ marginTop: 14 }}>
            <h2 className="card-title">الطلاب والدرجات</h2>

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
                <p style={{ color: "#6b7280" }}>اختار المادة أولاً عشان نجيب الطلاب.</p>
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
                      <th>أعمال السنة</th>
                      <th>النهائي</th>
                      <th>المجموع</th>
                      <th>التقدير</th>
                      <th>النقاط</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={s.student_id}>
                        <td>{idx + 1}</td>
                        <td>{s.full_name}</td>
                        <td>{s.university_id}</td>

                        <td>
                          <input
                            className="input-field"
                            type="number"
                            value={s.coursework_mark ?? ""}
                            onChange={(e) =>
                              onChangeMark(s.student_id, "coursework_mark", e.target.value)
                            }
                            placeholder="0"
                          />
                        </td>

                        <td>
                          <input
                            className="input-field"
                            type="number"
                            value={s.final_exam_mark ?? ""}
                            onChange={(e) =>
                              onChangeMark(s.student_id, "final_exam_mark", e.target.value)
                            }
                            placeholder="0"
                          />
                        </td>

                        <td>{s.total_mark ?? "—"}</td>
                        <td>{s.letter ?? "—"}</td>
                        <td>{s.points ?? "—"}</td>
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
