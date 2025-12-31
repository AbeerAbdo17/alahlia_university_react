import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const API_BASE = "http://localhost:5000/api";

const QUALIFICATION_TYPES = ["ثانوي", "دبلوم", "تأهيلي", "بكالوريوس"];
const GRADES = ["ممتاز", "جيد جداً", "جيد", "مقبول"];
const CURRENT_YEAR = new Date().getFullYear();

const AdmissionFormPage = () => {
      const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // 🔹 كليات وأقسام من الباك
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);  

  // Step 1
  const [personal, setPersonal] = useState({
    firstName: "",
    secondName: "",
    thirdName: "",
    fourthName: "",
    nationality: "",
    gender: "",
    nationalId: "",
    universityId: "",
    phone: "",
    email: "",
    studentStatus: "",
  });
  const [uniIdError, setUniIdError] = useState("");
  const [isCheckingUniId, setIsCheckingUniId] = useState(false);

  // Step 2
  const [admission, setAdmission] = useState({
    college: "",     // هنا بنخزن اسم الكلية
    department: "",  // وهنا اسم القسم
    degreeType: "",
    studyType: "",
    admissionYear: "",
  });
  const [deptLoading, setDeptLoading] = useState(false);

  // Step 3
  const [qualifications, setQualifications] = useState([
    {
      id: 1,
      type: "ثانوي",
      institution: "",
      gradYear: "",
      grade: "",
    },
  ]);

  // Step 4
  const [documents, setDocuments] = useState({
    highSchool: null,
    idCard: null,
    personalPhoto: null,
    extras: [],
  });

  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 🔹 تحميل الكليات من الباك عند فتح الصفحة
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await fetch(`${API_BASE}/faculties-list`);
        const data = await res.json(); // متوقع: [{id, faculty_name}]
        setFaculties(data);
      } catch (e) {
        console.error(e);
        showToast("مشكلة في تحميل الكليات", "error");
      }
    };
    fetchFaculties();
  }, []);

  const handlePersonalChange = (field, value) => {
    setPersonal((prev) => ({ ...prev, [field]: value }));
    if (field === "universityId") {
      setUniIdError("");
    }
  };

  const handleAdmissionChange = (field, value) => {
    setAdmission((prev) => ({ ...prev, [field]: value }));
  };

  const handleQualificationChange = (id, field, value) => {
    setQualifications((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const addQualificationRow = () => {
    setQualifications((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "",
        institution: "",
        gradYear: "",
        grade: "",
      },
    ]);
  };

  const removeQualificationRow = (id) => {
    setQualifications((prev) => prev.filter((q) => q.id !== id));
  };

  // ====== فحص الرقم الجامعي من الباك ======
  const checkUniversityIdUnique = async () => {
    const value = personal.universityId.trim();
    if (!value) return;
    setIsCheckingUniId(true);
    try {
      const res = await fetch(
        `${API_BASE}/admissions/check-university-id?value=${encodeURIComponent(
          value
        )}`
      );
      const data = await res.json();
      setUniIdError(
        data.available ? "" : "الرقم الجامعي مستخدم مسبقًا"
      );
    } catch (e) {
      console.error(e);
      showToast("مشكلة في الاتصال بالسيرفر أثناء التحقق", "error");
    } finally {
      setIsCheckingUniId(false);
    }
  };

  // 🔹 الكلية (هنا بنجيب الأقسام من الباك)
  const handleCollegeChange = async (facultyName) => {
    // نخزن اسم الكلية في الـ admission
    setAdmission((prev) => ({
      ...prev,
      college: facultyName,
      department: "",
    }));

    if (!facultyName) {
      setDepartments([]);
      return;
    }

    const selectedFaculty = faculties.find(
      (f) => f.faculty_name === facultyName
    );
    if (!selectedFaculty) {
      setDepartments([]);
      return;
    }

    setDeptLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/departments/${selectedFaculty.id}`
      );
      const data = await res.json(); // متوقع: [{id, department_name}]
      setDepartments(data.map((d) => d.department_name));
    } catch (e) {
      console.error(e);
      showToast("مشكلة في تحميل الأقسام", "error");
    } finally {
      setDeptLoading(false);
    }
  };

  // المستندات
  const handleDocChange = (key, file) => {
    setDocuments((prev) => ({
      ...prev,
      [key]: file,
    }));
  };

  const handleExtraDocsAdd = (files) => {
    const arr = Array.from(files);
    setDocuments((prev) => ({
      ...prev,
      extras: [...prev.extras, ...arr],
    }));
  };

  const deleteExtraDoc = (index) => {
    setDocuments((prev) => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index),
    }));
  };

  // ====== Validation ======
  const isStep1Valid = () => {
    const {
      firstName,
      secondName,
      nationality,
      gender,
      nationalId,
      phone,
      email,
      studentStatus,
      universityId,
    } = personal;

    if (
      !firstName.trim() ||
      !secondName.trim() ||
      !nationality ||
      !gender ||
      !nationalId.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !studentStatus
    )
      return false;

    if (studentStatus === "تحويل داخلي" && !universityId.trim()) {
      return false;
    }

    if (uniIdError) return false;

    return true;
  };

  const isStep2Valid = () => {
    const { college, department, degreeType, studyType, admissionYear } =
      admission;
    return (
      college &&
      department &&
      degreeType &&
      studyType &&
      admissionYear &&
      admissionYear.length === 4
    );
  };

const isStep3Valid = () => {
  const secondary = qualifications.find((q) => q.type === "ثانوي");

  if (!secondary) {
    // لازم يكون في مؤهل ثانوي واحد على الأقل
    return false;
  }

  if (!secondary.gradYear) {
    // سنة التخرج مطلوبة للثانوي
    return false;
  }

  return true;
};


  const isStep4Valid = () => {
    return true;
  };

  const isFormValid =
    isStep1Valid() && isStep2Valid() && isStep3Valid() && isStep4Valid();

  // ====== تنقل بين الخطوات ======
  const goNext = () => {
    if (step === 1 && !isStep1Valid()) {
      showToast("أكمِل البيانات الشخصية أولاً", "error");
      return;
    }
    if (step === 2 && !isStep2Valid()) {
      showToast("أكمِل بيانات القبول أولاً", "error");
      return;
    }
    if (step === 3 && !isStep3Valid()) {
      showToast("أكمِل المؤهلات السابقة أولاً", "error");
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  // ====== تجهيز FormData مشترك ======
  const buildFormData = () => {
    const formData = new FormData();
    formData.append("personal", JSON.stringify(personal));
    formData.append("admission", JSON.stringify(admission));
    formData.append("qualifications", JSON.stringify(qualifications));

    if (documents.highSchool)
      formData.append("highSchool", documents.highSchool);
    if (documents.idCard) formData.append("idCard", documents.idCard);
    if (documents.personalPhoto)
      formData.append("personalPhoto", documents.personalPhoto);
    documents.extras.forEach((f, i) =>
      formData.append(`extra_${i}`, f)
    );

    return formData;
  };

  // ====== حفظ كمسودة ======
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const formData = buildFormData();
      const res = await fetch(`${API_BASE}/admissions/draft`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "تم حفظ المسودة بنجاح", "success");
      } else {
        showToast(data.error || "حدث خطأ أثناء حفظ المسودة", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("مشكلة في الاتصال بالسيرفر", "error");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // ====== حفظ نهائي ======
  const handleSubmit = async () => {
    if (!isFormValid) {
      showToast("تأكدي من إكمال كل الحقول الإلزامية", "error");
      return;
    }

    setIsSaving(true);
    try {
      const formData = buildFormData();
      const res = await fetch(`${API_BASE}/admissions`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "تم حفظ بيانات الطالب بنجاح", "success");
        // هنا ممكن تعملي redirect لصفحة "سجل الطلاب"
        // navigate("/students");
      } else {
        showToast(data.error || "حدث خطأ أثناء الحفظ", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("مشكلة في الاتصال بالسيرفر", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ====== UI ======
  return (
    <div className="admission-layout">
      <header className="library-header">
        <div className="library-header-title">
          <span style={{ fontSize: 24 }}></span>
          <span>نموذج قبول طالب جديد</span>
        </div>
        <div className="library-header-badge">خطوة {step} من 4</div>
                  <button
            onClick={() => navigate("/")} // أو navigate(-1) لو عايزا يرجع خطوة بس
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
          <Stepper current={step} />

          {step === 1 && (
            <Step1Personal
              data={personal}
              onChange={handlePersonalChange}
              uniIdError={uniIdError}
              checkUniId={checkUniversityIdUnique}
              isCheckingUniId={isCheckingUniId}
            />
          )}
          {step === 2 && (
            <Step2Admission
              data={admission}
              onChange={handleAdmissionChange}
              onCollegeChange={handleCollegeChange}
              deptLoading={deptLoading}
              faculties={faculties}
              departments={departments}
            />
          )}
          {step === 3 && (
            <Step3Qualifications
              qualifications={qualifications}
              onChange={handleQualificationChange}
              onAddRow={addQualificationRow}
              onRemoveRow={removeQualificationRow}
            />
          )}
          {step === 4 && (
            <Step4Documents
              documents={documents}
              onDocChange={handleDocChange}
              onExtrasAdd={handleExtraDocsAdd}
              onExtraDelete={deleteExtraDoc}
            />
          )}

          <div className="steps-nav">
            <button
              className="btn btn-outline"
              onClick={goBack}
              disabled={step === 1}
            >
              رجوع
            </button>
            {step < 4 && (
              <button className="btn btn-primary" onClick={goNext}>
                التالي
              </button>
            )}
          </div>

          <div className="final-actions">
            <button
              className="btn btn-outline"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
            >
              {isSavingDraft ? "جاري الحفظ..." : "حفظ كمسودة"}
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!isFormValid || isSaving}
            >
              {isSaving ? "جاري حفظ البيانات..." : "حفظ بيانات الطالب"}
            </button>
          </div>
        </div>
      </main>

      {toast && (
        <div
          className={
            "toast " +
            (toast.type === "error" ? "toast-error" : "toast-success")
          }
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

/* ===== Stepper ===== */
const Stepper = ({ current }) => {
  const steps = [
    "البيانات الشخصية",
    "بيانات القبول",
    "المؤهلات السابقة",
    "المستندات",
  ];
  return (
    <div className="stepper">
      {steps.map((label, index) => {
        const num = index + 1;
        const isActive = num === current;
        const isDone = num < current;
        return (
          <div key={label} className="stepper-item">
            <div
              className={
                "stepper-circle " +
                (isDone ? "stepper-circle-done" : "") +
                (isActive ? " stepper-circle-active" : "")
              }
            >
              {isDone ? "✔" : num}
            </div>
            <div className="stepper-label">{label}</div>
            {num < steps.length && <div className="stepper-line" />}
          </div>
        );
      })}
    </div>
  );
};

/* ===== Step 1 ===== */
const Step1Personal = ({
  data,
  onChange,
  uniIdError,
  checkUniId,
  isCheckingUniId,
}) => {
  return (
    <div className="card">
      <h2 className="card-title">1️⃣ البيانات الشخصية</h2>
      <div className="two-col-grid">
        <TextInput
          label="الاسم الأول *"
          placeholder="أدخل الاسم الأول"
          value={data.firstName}
          onChange={(v) => onChange("firstName", v)}
        />
        <TextInput
          label="الاسم الثاني *"
          placeholder="أدخل الاسم الثاني"
          value={data.secondName}
          onChange={(v) => onChange("secondName", v)}
        />
        <TextInput
          label="الاسم الثالث"
          placeholder="أدخل الاسم الثالث"
          value={data.thirdName}
          onChange={(v) => onChange("thirdName", v)}
        />
        <TextInput
          label="الاسم الرابع"
          placeholder="أدخل الاسم الرابع"
          value={data.fourthName}
          onChange={(v) => onChange("fourthName", v)}
        />

        <SelectInput
          label="الجنسية *"
          placeholder="اختر الجنسية"
          value={data.nationality}
          options={["سوداني", "غير سوداني"]}
          onChange={(v) => onChange("nationality", v)}
        />
        <SelectInput
          label="النوع *"
          placeholder="اختر النوع"
          value={data.gender}
          options={["ذكر", "أنثى"]}
          onChange={(v) => onChange("gender", v)}
        />

        <SelectInput
          label="حالة الطالب *"
          placeholder="اختر حالة الطالب"
          value={data.studentStatus}
          options={["طالب جديد", "تحويل داخلي", "تحويل خارجي"]}
          onChange={(v) => onChange("studentStatus", v)}
        />

        <TextInput
          label={
            data.studentStatus === "تحويل داخلي"
              ? "الرقم الجامعي (إلزامي في حالة التحويل الداخلي)"
              : "الرقم الجامعي (اختياري)"
          }
          placeholder="أدخل الرقم الجامعي"
          value={data.universityId}
          onChange={(v) => onChange("universityId", v)}
          onBlur={checkUniId}
          error={uniIdError}
          suffix={
            isCheckingUniId ? (
              <span className="suffix-text">جارِ التحقق...</span>
            ) : null
          }
        />

        <TextInput
          label="الرقم الوطني *"
          placeholder="أدخل الرقم الوطني"
          value={data.nationalId}
          onChange={(v) => onChange("nationalId", v)}
        />
        <TextInput
          label="رقم الهاتف *"
          placeholder="أدخل رقم الهاتف"
          value={data.phone}
          onChange={(v) => onChange("phone", v)}
        />
        <TextInput
          label="البريد الإلكتروني *"
          placeholder="example@domain.com"
          value={data.email}
          onChange={(v) => onChange("email", v)}
        />
      </div>
    </div>
  );
};

/* ===== Step 2 ===== */
const Step2Admission = ({
  data,
  onChange,
  onCollegeChange,
  deptLoading,
  faculties,
  departments,
}) => {
  return (
    <div className="card">
      <h2 className="card-title">2️⃣ بيانات القبول</h2>

      <div className="two-col-grid">
        <SelectInput
          label="الكلية *"
          placeholder="اختر الكلية"
          value={data.college}
          options={faculties.map((f) => f.faculty_name)}
          onChange={onCollegeChange}
        />

        <SelectInput
          label="القسم *"
          placeholder={
            deptLoading
              ? "جاري تحميل الأقسام..."
              : "اختر القسم"
          }
          value={data.department}
          options={departments}
          disabled={deptLoading || !data.college}
          onChange={(v) => onChange("department", v)}
        />
      </div>

      <div className="field-group">
        <label className="input-label">نوع المؤهل المطلوب *</label>
        <div className="radio-group">
          {["بكالوريوس", "دبلوم عالي", "تأهيلي", "ماجستير", "دكتوراه"].map(
            (type) => (
              <label key={type} className="radio-item">
                <input
                  type="radio"
                  name="degreeType"
                  value={type}
                  checked={data.degreeType === type}
                  onChange={(e) =>
                    onChange("degreeType", e.target.value)
                  }
                />
                <span>{type}</span>
              </label>
            )
          )}
        </div>
        <div className="field-hint">
         
        </div>
      </div>

      <div className="two-col-grid">
        <SelectInput
          label="نوع الدراسة *"
          placeholder="اختر نوع الدراسة"
          value={data.studyType}
          options={["نظامي", "موازٍ", "انتساب"]}
          onChange={(v) => onChange("studyType", v)}
        />
        <TextInput
          label="سنة القبول *"
          placeholder="مثال: 2025"
          type="number"
          min={2000}
          max={CURRENT_YEAR + 1}
          value={data.admissionYear}
          onChange={(v) => onChange("admissionYear", v)}
        />
      </div>
    </div>
  );
};

/* ===== Step 3 ===== */
const Step3Qualifications = ({
  qualifications,
  onChange,
  onAddRow,
  onRemoveRow,
}) => {
  return (
    <div className="card">
      <h2 className="card-title">3️⃣ المؤهلات السابقة</h2>

      <div className="table-header">
        <div>نوع المؤهل</div>
        {/* <div>المؤسسة</div> */}
        <div>سنة التخرج</div>
        <div></div>
      </div>

      {qualifications.map((row, index) => (
        <div key={row.id} className="table-row">
          <div>
            <select
              className="input-field"
              value={row.type}
              onChange={(e) =>
                onChange(row.id, "type", e.target.value)
              }
            >
              <option value="">اختر نوع المؤهل</option>
              {QUALIFICATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {/* <div>
            <input
              className="input-field"
              placeholder="اسم المؤسسة"
              value={row.institution}
              onChange={(e) =>
                onChange(row.id, "institution", e.target.value)
              }
            />
          </div> */}
          <div>
            <input
              type="number"
              className="input-field"
              placeholder="مثال: 2022"
              min={1980}
              max={CURRENT_YEAR}
              value={row.gradYear}
              onChange={(e) =>
                onChange(row.id, "gradYear", e.target.value)
              }
            />
          </div>
          <div>
       
          </div>
          <div style={{ textAlign: "center" }}>
            {index > 0 && (
              <button
                type="button"
                className="btn-text-danger"
                onClick={() => onRemoveRow(row.id)}
              >
                حذف
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-outline"
        onClick={onAddRow}
        style={{ marginTop: 10 }}
      >
        + إضافة مؤهل آخر
      </button>
    </div>
  );
};

/* ===== Step 4 ===== */
const Step4Documents = ({
  documents,
  onDocChange,
  onExtrasAdd,
  onExtraDelete,
}) => {
  return (

      <div style={{ marginTop: 16 }}>
        <label className="input-label">رفع مستندات </label>
        <div
          className="dropzone extra-drop"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.length) {
              onExtrasAdd(e.dataTransfer.files);
            }
          }}
        >
          <p className="dropzone-title">
            اسحب المستندات الإضافية هنا أو اضغط للرفع
          </p>
          <input
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files?.length) {
                onExtrasAdd(e.target.files);
              }
            }}
          />
        </div>

        {documents.extras.length > 0 && (
          <div className="extra-files-list">
            {documents.extras.map((f, i) => (
              <div key={i} className="file-badge">
                <span>
                  {f.name}{" "}
                  <small>({(f.size / 1024).toFixed(1)} KB)</small>
                </span>
                <button
                  type="button"
                  onClick={() => onExtraDelete(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    
  );
};

/* ===== Inputs & DropZone ===== */
const TextInput = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  min,
  max,
  error,
  onBlur,
  suffix,
}) => (
  <div className="input-group">
    <label className="input-label">{label}</label>
    <div className="input-with-suffix">
      <input
        className={
          "input-field" + (error ? " input-field-error" : "")
        }
        type={type}
        placeholder={placeholder}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      {suffix && <div className="input-suffix">{suffix}</div>}
    </div>
    {error && <div className="input-error-text">{error}</div>}
  </div>
);

const SelectInput = ({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled,
}) => (
  <div className="input-group">
    <label className="input-label">{label}</label>
    <select
      className="input-field"
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const DropZone = ({ label, file, onFileChange }) => {
  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onFileChange(f);
  };

  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <p className="dropzone-title">
          اسحب المستند هنا أو اضغط للرفع
        </p>
        <input
          type="file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileChange(f);
          }}
        />
      </div>
      {file && (
        <div className="file-chip">
          <span>
            ✔ {file.name}{" "}
            <small>({(file.size / 1024).toFixed(1)} KB)</small>
          </span>
          <button type="button" onClick={() => onFileChange(null)}>
            حذف
          </button>
        </div>
      )}
    </div>
  );
};

export default AdmissionFormPage;
