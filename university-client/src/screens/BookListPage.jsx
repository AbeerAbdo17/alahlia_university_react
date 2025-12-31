import React, { useEffect, useState, useCallback } from "react";
import { FaBook, FaFilePdf, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function createBookFromJson(json) {
  return {
    id: json.id,
    title: json.title || "",
    description: json.description || "",
    author: json.author || "",
    isPdf: json.is_pdf === 1,
    pdfUrl: json.pdf_url || "",
    copies: json.copies ?? 1,
    location: json.location || "",
    facultyId: json.faculty_id ?? null,
    facultyName: json.faculty_name || "",
  };
}

const API_BASE = "http://localhost:5000/api";

const BookListPage = () => {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [faculties, setFaculties] = useState([]); // [{id, faculty_name}]
  const [facultyFilter, setFacultyFilter] = useState(null); // faculty_id
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const [selectedBook, setSelectedBook] = useState(null);

  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    author: "",
    faculty_id: "",
    copies: "",
    location: "",
  });

  const [pickedFile, setPickedFile] = useState(null);

  const [borrowValues, setBorrowValues] = useState({ name: "", student_id: "" });
  const [returnValues, setReturnValues] = useState({ name: "", student_id: "" });

  const [borrowLookupLoading, setBorrowLookupLoading] = useState(false);
  const [returnLookupLoading, setReturnLookupLoading] = useState(false);

  // ✅ Toast System
  const [toast, setToast] = useState({ open: false, type: "success", text: "" });

  const showToast = useCallback((text, type = "success") => {
    setToast({ open: true, type, text });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      setToast((p) => ({ ...p, open: false }));
    }, 2500);
  }, []);

  // fetch
  const fetchBooks = async () => {
    try {
      let url = `${API_BASE}/books`;
      const params = new URLSearchParams();

      if (facultyFilter) params.append("faculty_id", facultyFilter);
      if (searchQuery) params.append("search", searchQuery);

      if (Array.from(params).length > 0) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("fetchBooks failed");
      const data = await res.json();
      setBooks(data.map(createBookFromJson));
    } catch (err) {
      console.error("Error fetching books:", err);
      showToast("حدث خطأ أثناء جلب الكتب", "error");
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await fetch(`${API_BASE}/library/faculties`);
      if (!res.ok) return;
      const data = await res.json();
      setFaculties(data);
    } catch (err) {
      console.error("Error fetching faculties:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchFaculties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyFilter, searchQuery]);

  // lookup borrow student name
  useEffect(() => {
    const uni = (borrowValues.student_id || "").trim();
    if (!showBorrowModal) return;

    if (!uni) {
      setBorrowValues((prev) => ({ ...prev, name: "" }));
      return;
    }

    const t = setTimeout(async () => {
      try {
        setBorrowLookupLoading(true);
        const res = await fetch(
          `${API_BASE}/library/student-by-uni?university_id=${encodeURIComponent(uni)}`
        );

        if (!res.ok) {
          setBorrowValues((prev) => ({ ...prev, name: "" }));
          return;
        }

        const st = await res.json();
        setBorrowValues((prev) => ({ ...prev, name: st.full_name || "" }));
      } catch {
        setBorrowValues((prev) => ({ ...prev, name: "" }));
      } finally {
        setBorrowLookupLoading(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [borrowValues.student_id, showBorrowModal]);

  // lookup return student name
  useEffect(() => {
    const uni = (returnValues.student_id || "").trim();
    if (!showReturnModal) return;

    if (!uni) {
      setReturnValues((prev) => ({ ...prev, name: "" }));
      return;
    }

    const t = setTimeout(async () => {
      try {
        setReturnLookupLoading(true);
        const res = await fetch(
          `${API_BASE}/library/student-by-uni?university_id=${encodeURIComponent(uni)}`
        );

        if (!res.ok) {
          setReturnValues((prev) => ({ ...prev, name: "" }));
          return;
        }

        const st = await res.json();
        setReturnValues((prev) => ({ ...prev, name: st.full_name || "" }));
      } catch {
        setReturnValues((prev) => ({ ...prev, name: "" }));
      } finally {
        setReturnLookupLoading(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [returnValues.student_id, showReturnModal]);

  const handleDownloadPdf = (url) => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", "");
    a.target = "_blank";
    a.click();
  };

  const handleChangeForm = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  // add
  const openAddModal = () => {
    setFormValues({
      title: "",
      description: "",
      author: "",
      faculty_id: "",
      copies: "",
      location: "",
    });
    setPickedFile(null);
    setShowAddModal(true);
  };

  const submitAddBook = async () => {
    if (!formValues.title.trim()) {
      showToast("العنوان مطلوب!", "error");
      return;
    }

    const formData = new FormData();
    formData.append("title", formValues.title);
    formData.append("copies", formValues.copies);
    formData.append("description", formValues.description);
    formData.append("author", formValues.author);
    formData.append("faculty_id", formValues.faculty_id);
    formData.append("location", formValues.location);

    if (pickedFile) formData.append("pdf", pickedFile, pickedFile.name);

    try {
      const res = await fetch(`${API_BASE}/books`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        showToast(data?.message || "حدث خطأ أثناء إضافة الكتاب", "error");
        return;
      }

      setShowAddModal(false);
      fetchBooks();
      showToast("تمت إضافة الكتاب بنجاح", "success");
    } catch (err) {
      console.error("Error adding book:", err);
      showToast("حدث خطأ أثناء إضافة الكتاب", "error");
    }
  };

  // edit
  const openEditModal = (book) => {
    setSelectedBook(book);
    setFormValues({
      title: book.title,
      description: book.description,
      author: book.author,
      faculty_id: book.facultyId ? String(book.facultyId) : "",
      copies: String(book.copies ?? ""),
      location: book.location,
    });

    setPickedFile(null);
    setShowEditModal(true);
  };

  const submitEditBook = async () => {
    if (!selectedBook) return;
    if (!formValues.title.trim()) {
      showToast("العنوان مطلوب!", "error");
      return;
    }

    const formData = new FormData();
    formData.append("title", formValues.title);
    formData.append("copies", formValues.copies);
    formData.append("description", formValues.description);
    formData.append("author", formValues.author);
    formData.append("faculty_id", formValues.faculty_id);
    formData.append("location", formValues.location);
    if (pickedFile) formData.append("pdf", pickedFile, pickedFile.name);

    try {
      const res = await fetch(`${API_BASE}/books/${selectedBook.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        showToast(data?.message || "فشل تعديل الكتاب", "error");
        return;
      }

      setShowEditModal(false);
      setSelectedBook(null);
      fetchBooks();
      showToast("تم تعديل الكتاب بنجاح", "success");
    } catch (err) {
      console.error("Error editing book:", err);
      showToast("حدث خطأ أثناء تعديل الكتاب", "error");
    }
  };

  // delete
  const deleteBook = async (book) => {
    const ok = window.confirm("هل أنت متأكد من حذف هذا الكتاب؟");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/books/${book.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchBooks();
        showToast("تم حذف الكتاب بنجاح", "success");
      } else {
        showToast("فشل حذف الكتاب", "error");
      }
    } catch (err) {
      console.error("Error deleting book:", err);
      showToast("حدث خطأ أثناء حذف الكتاب", "error");
    }
  };

  // borrow
  const openBorrowModal = (book) => {
    setSelectedBook(book);
    setBorrowValues({ name: "", student_id: "" });
    setShowBorrowModal(true);
  };

  const submitBorrow = async () => {
    if (!selectedBook) return;
    if (!borrowValues.student_id) {
      showToast("الرقم الجامعي مطلوب!", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/borrow/${selectedBook.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          student_id: borrowValues.student_id,
        }).toString(),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        showToast(data?.error || "فشل الاستعارة", "error");
        return;
      }

      showToast(data?.message || "تمت الاستعارة", "success");
      setShowBorrowModal(false);
      setSelectedBook(null);
      fetchBooks();
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ أثناء الاتصال بالسيرفر", "error");
    }
  };

  // return
  const openReturnModal = (book) => {
    setSelectedBook(book);
    setReturnValues({ name: "", student_id: "" });
    setShowReturnModal(true);
  };

  const submitReturn = async () => {
    if (!selectedBook) return;

    const uni = (returnValues.student_id || "").trim();
    if (!uni) {
      showToast("الرقم الجامعي مطلوب!", "error");
      return;
    }

    if (!returnValues.name) {
      showToast("الطالب غير موجود، تأكدي من الرقم الجامعي", "error");
      return;
    }

    try {
      const checkRes = await fetch(
        `${API_BASE}/borrow/check?book_id=${selectedBook.id}&student_id=${encodeURIComponent(uni)}`
      );
      const checkData = await checkRes.json().catch(() => null);

      if (!checkRes.ok) {
        showToast(checkData?.error || "فشل التحقق من الاستعارة", "error");
        return;
      }

      if (!checkData?.active) {
        showToast("هذا الطالب لم يستعر هذا الكتاب أو قام بإرجاعه مسبقاً", "error");
        return;
      }

      const res = await fetch(`${API_BASE}/return/${selectedBook.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ student_id: uni }).toString(),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        showToast(data?.message || "تم إرجاع الكتاب بنجاح", "success");
        setShowReturnModal(false);
        setSelectedBook(null);
        fetchBooks();
      } else {
        showToast(data?.error || "فشل إرجاع الكتاب", "error");
      }
    } catch (err) {
      console.error("Error returning book:", err);
      showToast("حدث خطأ في الاتصال بالسيرفر", "error");
    }
  };

  return (
    <div className="library-layout">
      {/* ✅ Toast */}
      {toast.open && (
        <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
          {toast.text}
        </div>
      )}

      {/* الهيدر */}
      <header className="library-header">
        <div className="library-header-title">
          <span style={{ fontSize: 24 }}></span>
          <span>المكتبة</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            fontSize: "32px",
            color: "white",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          <IoArrowBack />
        </button>
      </header>

      {/* المحتوى */}
      <main className="library-main">
        <div className="library-container">
          {/* شريط الفلاتر والبحث */}
<div className="toolbar">
  <div className="faculties-scroll">
    <div className="chips-wrap">
      {faculties.map((f) => {
        const isSelected = facultyFilter === f.id;
        return (
          <button
            key={f.id}
            className={"chip" + (isSelected ? " chip--selected" : "")}
            onClick={() => setFacultyFilter((prev) => (prev === f.id ? null : f.id))}
          >
            {f.faculty_name}
          </button>
        );
      })}
    </div>
  </div>

  <div className="toolbar-right">
    <div className="search-box">
      <input
        type="text"
        className="search-input"
        placeholder="بحث عن كتاب (عنوان، مؤلف، كلية...)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <span className="search-icon"></span>
    </div>

    {/*  زر إضافة كتاب  */}
    <button className="add-book-btn" onClick={openAddModal} title="إضافة كتاب">
      <FaPlus />
      <span className="add-book-text">إضافة كتاب</span>
    </button>
  </div>
</div>


          {/* شبكة الكتب */}
          <div className="book-grid">
            {books.map((b) => (
              <div key={b.id} className="book-card">
                <div>
                  <div className="book-icon-wrapper">
                    <span
                      className="book-icon"
                      style={{ color: b.isPdf ? "#dc2626" : "#5e5f61d2" }}
                      onClick={() => {
                        if (b.isPdf) handleDownloadPdf(b.pdfUrl);
                      }}
                      title={b.isPdf ? "تحميل PDF" : ""}
                    >
                      {b.isPdf ? <FaFilePdf /> : <FaBook />}
                    </span>
                  </div>

                  <div className="book-info-title">{b.title}</div>
                  <div className="book-info-meta">
                    الكاتب: <strong>{b.author}</strong>
                  </div>
                  <div className="book-info-meta">
                    الكلية: <strong>{b.facultyName || "-"}</strong>
                  </div>

                  {b.location && (
                    <div className="book-location">
                      الموقع: <span>{b.location}</span>
                    </div>
                  )}

                  {!b.isPdf && (
                    <div className="book-availability">
                      <div className="book-availability-title">في المكتبة</div>
                      <div>عدد النسخ: {b.copies}</div>
                    </div>
                  )}
                </div>

                {!b.isPdf && (
                  <div className="actions-main">
                    {b.copies > 0 ? (
                      <button className="btn btn-primary" onClick={() => openBorrowModal(b)}>
                        استعارة
                      </button>
                    ) : (
                      <div
                        style={{
                          color: "var(--danger)",
                          fontSize: 12,
                          textAlign: "center",
                        }}
                      >
                        لا توجد نسخ متاحة حالياً
                      </div>
                    )}

                    <button className="btn btn-muted" onClick={() => openReturnModal(b)}>
                      إرجاع كتاب
                    </button>
                  </div>
                )}

                <div className="btn-icon-row">
                  <button className="icon-btn edit" title="تعديل" onClick={() => openEditModal(b)}>
                    <FaEdit />
                  </button>

                  <button className="icon-btn delete" title="حذف" onClick={() => deleteBook(b)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* زر إضافة كتاب */}
          {/* <button className="fab" onClick={openAddModal} title="إضافة كتاب">
            <FaPlus />
          </button> */}
        </div>
      </main>

      {/* مودال إضافة / تعديل */}
      {(showAddModal || showEditModal) && (
        <Modal
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
          }}
        >
          <h2>{showAddModal ? "إضافة كتاب" : "تعديل كتاب"}</h2>

          <TextInput
            label="عنوان الكتاب"
            value={formValues.title}
            onChange={(v) => handleChangeForm("title", v)}
          />

          <TextInput
            label="عدد النسخ"
            type="number"
            value={formValues.copies}
            onChange={(v) => handleChangeForm("copies", v)}
          />

          <TextInput
            label="الوصف"
            value={formValues.description}
            onChange={(v) => handleChangeForm("description", v)}
          />

          <TextInput
            label="المؤلف"
            value={formValues.author}
            onChange={(v) => handleChangeForm("author", v)}
          />

          <div className="input-group">
            <label className="input-label">الكلية</label>
            <select
              className="input-field"
              value={formValues.faculty_id}
              onChange={(e) => handleChangeForm("faculty_id", e.target.value)}
            >
              <option value="">-- اختر الكلية --</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.faculty_name}
                </option>
              ))}
            </select>
          </div>

          <TextInput
            label="موقع الكتاب في المكتبة"
            value={formValues.location}
            onChange={(v) => handleChangeForm("location", v)}
          />

          <div className="input-group">
            <span className="input-label">
              {showAddModal ? "إرفاق PDF (اختياري)" : "تغيير PDF (اختياري)"}
            </span>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setPickedFile(file);
              }}
            />

            <div className="file-hint">
              {pickedFile ? (
                <>
                  تم اختيار: <strong>{pickedFile.name}</strong>
                </>
              ) : (
                "يمكنك تركه فارغاً إذا لا تريد رفع ملف PDF"
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn btn-outline"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
            >
              إلغاء
            </button>

            <button className="btn btn-primary" onClick={showAddModal ? submitAddBook : submitEditBook}>
              {showAddModal ? "إضافة" : "حفظ"}
            </button>
          </div>
        </Modal>
      )}

      {/* مودال الاستعارة */}
      {showBorrowModal && (
        <Modal onClose={() => setShowBorrowModal(false)}>
          <h2>استعارة كتاب</h2>

          <div className="input-group">
            <label className="input-label">
              اسم الطالب {borrowLookupLoading ? "(جارٍ البحث...)" : ""}
            </label>

            <input
              type="text"
              className="input-field"
              value={borrowValues.name || ""}
              readOnly
              onClick={() => showToast("أدخل الرقم الجامعي أولاً", "error")}
              style={{ cursor: "pointer" }}
            />
          </div>

          <TextInput
            label="الرقم الجامعي"
            value={borrowValues.student_id}
            onChange={(v) => setBorrowValues((prev) => ({ ...prev, student_id: v }))}
          />

          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowBorrowModal(false)}>
              إلغاء
            </button>
            <button className="btn btn-primary" onClick={submitBorrow}>
              تأكيد
            </button>
          </div>
        </Modal>
      )}

      {/* مودال الإرجاع */}
      {showReturnModal && (
        <Modal onClose={() => setShowReturnModal(false)}>
          <h2>إرجاع كتاب</h2>

          <div className="input-group">
            <label className="input-label">
              اسم الطالب {returnLookupLoading ? "(جارٍ البحث...)" : ""}
            </label>

            <input
              type="text"
              className="input-field"
              value={returnValues.name || ""}
              readOnly
              onClick={() => showToast("أدخل الرقم الجامعي أولاً", "error")}
              style={{ cursor: "pointer" }}
            />
          </div>

          <TextInput
            label="الرقم الجامعي للطالب"
            value={returnValues.student_id}
            onChange={(v) => setReturnValues((prev) => ({ ...prev, student_id: v }))}
          />

          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowReturnModal(false)}>
              إلغاء
            </button>
            <button className="btn btn-primary" onClick={submitReturn}>
              تأكيد
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// كومبوننتات مساعدة
const Modal = ({ children, onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const TextInput = ({ label, value, onChange, type = "text" }) => (
  <div className="input-group">
    <label className="input-label">{label}</label>
    <input
      type={type}
      className="input-field"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default BookListPage;
