const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // مهم جداً
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug
app.use((req, res, next) => {
    console.log("REQ:", req.method, req.url);
    next();
});

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '0000',
    database: process.env.DB_NAME || 'university_db'
});
const dbp = db.promise();
// Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


function buildFileUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}


function termOrder(t) {
  const x = (t || "").toString().trim();
  if (x === "فصل أول" || x === "الفصل الأول") return 1;
  if (x === "فصل ثاني" || x === "الفصل الثاني") return 2;
  return 0;
}

function parseAcademicYear(y) {
  const m = (y || "").toString().match(/(\d{4})\s*\/\s*(\d{4})/);
  if (!m) return [0, 0];
  return [Number(m[1]), Number(m[2])];
}

function parseLevelNumber(levelName) {
  const s = (levelName || "").toString().trim();

  const m = s.match(/(\d+)/);
  if (m) return Number(m[1]);

  const map = {
    "الأول": 1, "اول": 1,
    "الثاني": 2,
    "الثالث": 3,
    "الرابع": 4,
    "الخامس": 5,
    "السادس": 6,
    "السابع": 7,
    "الثامن": 8,
    "التاسع": 9,
    "العاشر": 10,
  };

  for (const k of Object.keys(map)) {
    if (s.includes(k)) return map[k];
  }

  return 0;
}


function comparePeriods(a, b) {
  const [a1, a2] = parseAcademicYear(a.academic_year);
  const [b1, b2] = parseAcademicYear(b.academic_year);

  if (a1 !== b1) return a1 - b1;
  if (a2 !== b2) return a2 - b2;

  const al = parseLevelNumber(a.level_name);
  const bl = parseLevelNumber(b.level_name);
  if (al !== bl) return al - bl;

  return termOrder(a.term_name) - termOrder(b.term_name);
}


function parseAcademicYear(y) {
  const m = (y || "").toString().match(/(\d{4})\s*\/\s*(\d{4})/);
  if (!m) return [0, 0];
  return [Number(m[1]), Number(m[2])];
}

function parseLevelNumber(levelName) {
  const m = (levelName || "").toString().match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

function comparePeriods(a, b) {
  const [a1, a2] = parseAcademicYear(a.academic_year);
  const [b1, b2] = parseAcademicYear(b.academic_year);
  if (a1 !== b1) return a1 - b1;
  if (a2 !== b2) return a2 - b2;

  const al = parseLevelNumber(a.level_name);
  const bl = parseLevelNumber(b.level_name);
  if (al !== bl) return al - bl;

  return termOrder(a.term_name) - termOrder(b.term_name);
}


function inferProgramModeFromRules(programType, rules) {
  if ((programType || "undergraduate").trim() === "postgraduate") return "general";

  const hasHonors = Array.isArray(rules?.classifications?.honors) && rules.classifications.honors.length > 0;
  const hasGeneral = Array.isArray(rules?.classifications?.general) && rules.classifications.general.length > 0;

  if (hasHonors) return "honors";
  if (hasGeneral) return "general";
  return "honors";
}


app.get("/api/library/faculties", (req, res) => {
  const sql = `SELECT id, faculty_name FROM faculties ORDER BY faculty_name`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("LIB FACULTIES ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});



// Add book
app.post("/api/books", upload.single("pdf"), (req, res) => {
  const { title, description, author, faculty_id, location, copies } = req.body;

  let pdfUrl = "";
  let isPdf = 0;
  if (req.file) {
    pdfUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    isPdf = 1;
  }

  const sql = `
    INSERT INTO books
      (title, description, author, faculty_id, location, pdf_url, is_pdf, copies)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      title || "",
      description || "",
      author || "",
      faculty_id ? Number(faculty_id) : null,
      location || "",
      pdfUrl,
      isPdf,
      copies ? Number(copies) : 1,
    ],
    (err) => {
      if (err) {
        console.error("ADD BOOK ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Book added successfully" });
    }
  );
});





// List books
app.get("/api/books", (req, res) => {
  const search = (req.query.search || "").trim();
  const facultyId = req.query.faculty_id ? Number(req.query.faculty_id) : null;

  let sql = `
    SELECT
      b.*,
      f.faculty_name
    FROM books b
    LEFT JOIN faculties f ON f.id = b.faculty_id
    WHERE 1=1
  `;
  const params = [];

  if (facultyId) {
    sql += ` AND b.faculty_id = ? `;
    params.push(facultyId);
  }

  if (search) {
    const like = `%${search}%`;
    sql += `
      AND (
        b.title LIKE ?
        OR b.author LIKE ?
        OR b.description LIKE ?
        OR f.faculty_name LIKE ?
      )
    `;
    params.push(like, like, like, like);
  }

  sql += " ORDER BY b.id DESC";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("LIST BOOKS ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});


app.get('/api/faculties', (req, res) => {
  const sql = "SELECT DISTINCT faculty FROM books WHERE faculty IS NOT NULL AND faculty != ''";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(result.map(r => r.faculty));
  });
});


// Edit book
app.put("/api/books/:id", upload.single("pdf"), (req, res) => {
  const bookId = Number(req.params.id);
  const { title, description, author, faculty_id, location, copies } = req.body;

  let pdfUrl = "";
  let isPdf = 0;

  if (req.file) {
    pdfUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    isPdf = 1;
  }

  let sql, params;

  if (req.file) {
    sql = `
      UPDATE books
      SET
        title = ?, description = ?, author = ?,
        faculty_id = ?, location = ?,
        pdf_url = ?, is_pdf = ?, copies = ?
      WHERE id = ?
    `;
    params = [
      title || "",
      description || "",
      author || "",
      faculty_id ? Number(faculty_id) : null,
      location || "",
      pdfUrl,
      isPdf,
      copies ? Number(copies) : 1,
      bookId,
    ];
  } else {
    sql = `
      UPDATE books
      SET
        title = ?, description = ?, author = ?,
        faculty_id = ?, location = ?, copies = ?
      WHERE id = ?
    `;
    params = [
      title || "",
      description || "",
      author || "",
      faculty_id ? Number(faculty_id) : null,
      location || "",
      copies ? Number(copies) : 1,
      bookId,
    ];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("EDIT BOOK ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (result.affectedRows === 0) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book updated successfully" });
  });
});



// Delete book
app.delete('/api/books/:id', (req, res) => {
  const bookId = req.params.id;

  const sql = "DELETE FROM books WHERE id = ?";
  db.query(sql, [bookId], (err, result) => {
    if (err) {
      console.log("MYSQL ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  });
});

// البحث عن طالب بالرقم الجامعي
app.get("/api/library/student-by-uni", async (req, res) => {
  try {
    const uni = (req.query.university_id || "").trim();
    if (!uni) return res.status(400).json({ error: "university_id مطلوب" });

    const [rows] = await dbp.query(
      `SELECT id, full_name, university_id
       FROM students
       WHERE university_id = ?
       LIMIT 1`,
      [uni]
    );

    if (rows.length === 0) return res.status(404).json({ error: "الطالب غير موجود" });
    res.json(rows[0]);
  } catch (e) {
    console.error("LOOKUP STUDENT ERROR:", e);
    res.status(500).json({ error: "Database error" });
  }
});


// استعار كتاب
app.post("/api/borrow/:id", async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const uni = (req.body.student_id || "").trim();

    if (!bookId || !uni) {
      return res.status(400).json({ error: "book_id و student_id مطلوبين" });
    }

    // 1) جيب الطالب
    const [stRows] = await dbp.query(
      `SELECT full_name, university_id FROM students WHERE university_id = ? LIMIT 1`,
      [uni]
    );
    if (stRows.length === 0) return res.status(404).json({ error: "الطالب غير موجود" });

    const studentName = stRows[0].full_name;

    // 2) جيب الكتاب + تحقق النسخ + هات اسم الكلية
    const [bookRows] = await dbp.query(
      `
      SELECT b.copies, f.faculty_name
      FROM books b
      LEFT JOIN faculties f ON f.id = b.faculty_id
      WHERE b.id = ?
      LIMIT 1
      `,
      [bookId]
    );

    if (bookRows.length === 0) return res.status(404).json({ error: "الكتاب غير موجود" });
    if (Number(bookRows[0].copies) <= 0) return res.status(400).json({ error: "لا توجد نسخ متاحة" });

    //  2.5) تحقق من استعارة نشطة لنفس الطالب ونفس الكتاب
    const [activeBorrow] = await dbp.query(
      `
      SELECT id
      FROM borrowed_books
      WHERE book_id = ? AND student_id = ? AND returned_at IS NULL
      LIMIT 1
      `,
      [bookId, uni]
    );
    if (activeBorrow.length > 0) {
      return res.status(400).json({ error: "الطالب مستعير هذا الكتاب بالفعل" });
    }

    // 3) انقص نسخة
    const [upd] = await dbp.query(
      `UPDATE books SET copies = copies - 1 WHERE id = ? AND copies > 0`,
      [bookId]
    );
    if (upd.affectedRows === 0) return res.status(400).json({ error: "لا توجد نسخ متاحة" });

    // 4) سجل الاستعارة
    await dbp.query(
      `
      INSERT INTO borrowed_books (book_id, student_id, student_name, faculty)
      VALUES (?, ?, ?, ?)
      `,
      [bookId, uni, studentName, bookRows[0].faculty_name || null]
    );

    res.json({ message: "تم استعارة الكتاب بنجاح", student_name: studentName });
  } catch (e) {
    console.error("BORROW ERROR:", e);
    res.status(500).json({ error: "Database error" });
  }
});




// إرجاع كتاب
app.post('/api/return/:id', (req, res) => {
  const bookId = req.params.id;
  const { student_id } = req.body;

  if (!student_id) {
    return res.status(400).json({ error: "student_id مطلوب" });
  }

  // 1) لقِ أقرب استعارة لنفس الطالب لسه ما اتقفلت
  const updateBorrowSql = `
    UPDATE borrowed_books
    SET returned_at = NOW()
    WHERE book_id = ? AND student_id = ? AND returned_at IS NULL
    ORDER BY borrowed_at ASC
    LIMIT 1
  `;

  db.query(updateBorrowSql, [bookId, student_id], (err, result) => {
    if (err) {
      console.error("RETURN UPDATE BORROW ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "لا توجد استعارة نشطة لهذا الطالب" });
    }

    // 2) زوِّد نسخة في books.copies
    const updateCopiesSql = `
      UPDATE books
      SET copies = copies + 1
      WHERE id = ?
    `;

    db.query(updateCopiesSql, [bookId], (err2, result2) => {
      if (err2) {
        console.error("RETURN UPDATE COPIES ERROR:", err2);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({ message: "تم إرجاع الكتاب بنجاح" });
    });
  });
});

// تحقق هل الطالب مستعير الكتاب حالياً (استعارة نشطة)
app.get("/api/borrow/check", async (req, res) => {
  try {
    const bookId = Number(req.query.book_id);
    const uni = (req.query.student_id || "").trim();

    if (!bookId || !uni) {
      return res.status(400).json({ error: "book_id و student_id مطلوبين" });
    }

    const [rows] = await dbp.query(
      `
      SELECT id, borrowed_at
      FROM borrowed_books
      WHERE book_id = ? AND student_id = ? AND returned_at IS NULL
      ORDER BY borrowed_at DESC
      LIMIT 1
      `,
      [bookId, uni]
    );

    if (rows.length === 0) {
      return res.json({ active: false });
    }

    return res.json({ active: true, borrowed_at: rows[0].borrowed_at });
  } catch (e) {
    console.error("BORROW CHECK ERROR:", e);
    return res.status(500).json({ error: "Database error" });
  }
});


// app.post('/api/borrow/:id', (req, res) => {
//     const bookId = req.params.id;
//     const { name, student_id } = req.body;

//     const sql = `
//       UPDATE books
//       SET copies = copies - 1,
//           is_borrowed = CASE WHEN copies = 1 THEN 1 ELSE 0 END,
//           borrower_name = ?,
//           borrower_id = ?
//       WHERE id = ? AND copies > 0
//     `;

//     db.query(sql, [name, student_id, bookId], (err, result) => {
//         if (err) return res.status(500).json({ error: "Database error" });
//         if (result.affectedRows === 0) return res.status(400).json({ error: "لا توجد نسخ متاحة" });
//         res.json({ message: "تم استعارة الكتاب بنجاح" });
//     });
// });

// app.post('/api/return/:id', (req, res) => {
//     const bookId = req.params.id;

//     const sql = `
//       UPDATE books
//       SET copies = copies + 1,
//           borrower_name = NULL,
//           borrower_id = NULL
//       WHERE id = ?
//     `;

//     db.query(sql, [bookId], (err, result) => {
//         if (err) return res.status(500).json({ error: "Database error" });
//         res.json({ message: "تم إرجاع الكتاب بنجاح" });
//     });
// });



app.get('/api/admissions/check-university-id', (req, res) => {
  const { value } = req.query;
  if (!value) {
    return res.json({ available: true });
  }

  const sql = `
    SELECT COUNT(*) AS cnt
    FROM admission_applications
    WHERE university_id = ? AND status <> 'draft'
  `;
  db.query(sql, [value], (err, rows) => {
    if (err) {
      console.error("CHECK UNI_ID ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    const count = rows[0].cnt;
    res.json({ available: count === 0 });
  });
});

// حفظ كمسودة
app.post('/api/admissions/draft', upload.any(), (req, res) => {
  handleSaveAdmission(req, res, 'draft');
});

// حفظ طلب قبول نهائي
app.post('/api/admissions', upload.any(), (req, res) => {
  handleSaveAdmission(req, res, 'submitted');
});

function handleSaveAdmission(req, res, status) {
  let personal, admission, qualifications;

  try {
    personal = JSON.parse(req.body.personal || '{}');
    admission = JSON.parse(req.body.admission || '{}');
    qualifications = JSON.parse(req.body.qualifications || '[]');
  } catch (e) {
    console.error("JSON PARSE ERROR:", e);
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  // 🔹 هنا نحدد قيمة الرقم الجامعي
  // لو الطالب تحويل داخلي والرقم موجود → نخزّنو كما هو
  // غير كدا نخليهو "0"
  const uniIdValue =
    personal.studentStatus === "تحويل داخلي" &&
    personal.universityId &&
    personal.universityId.toString().trim() !== ""
      ? personal.universityId.toString().trim()
      : "0";

  // تنظيف المؤهلات (نخلي بس المكتملة)
  if (!Array.isArray(qualifications)) {
    qualifications = [];
  }

  const filteredQuals = qualifications.filter((q) =>
    q &&
    (q.type || q.qualification_type) &&
    (q.institution || "").trim() &&
    (q.gradYear || q.grad_year) &&
    (q.grade || "").trim()
  );

  const qualificationsJson = JSON.stringify(filteredQuals);

  let documentsArray = [];
  if (req.files && req.files.length > 0) {
    documentsArray = req.files.map((file) => {
      const fieldName = file.fieldname; // highSchool / idCard / personalPhoto / extra_x
      let docType = fieldName;
      if (fieldName.startsWith("extra")) {
        docType = "extra";
      }
      return {
        doc_type: docType,
        file_url: buildFileUrl(req, file.filename),
        original_name: file.originalname,
        size_kb: Math.round(file.size / 1024),
      };
    });
  }
  const documentsJson = JSON.stringify(documentsArray);

  const insertAppSql = `
    INSERT INTO admission_applications (
      first_name, second_name, third_name, fourth_name,
      nationality, gender, national_id, university_id,
      student_status, phone, email,
      college, department, degree_type, study_type, admission_year,
      qualifications_json, documents_json,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const appParams = [
    personal.firstName || "",
    personal.secondName || "",
    personal.thirdName || "",
    personal.fourthName || "",
    personal.nationality || "",
    personal.gender || "",
    personal.nationalId || "",
    uniIdValue, // 👈 الآن المتغيّر مُعرّف
    personal.studentStatus || "",
    personal.phone || "",
    personal.email || "",
    admission.college || "",
    admission.department || "",
    admission.degreeType || "",
    admission.studyType || "",
    parseInt(admission.admissionYear || 0, 10),
    qualificationsJson,
    documentsJson,
    status,
  ];

  db.query(insertAppSql, appParams, (err, result) => {
    if (err) {
      console.error("INSERT ADMISSION ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const applicationId = result.insertId;

    return res.json({
      message:
        status === "draft"
          ? "تم حفظ المسودة بنجاح"
          : "تم حفظ بيانات الطالب بنجاح",
      applicationId,
    });
  });
}


app.get('/api/admissions', (req, res) => {
  const { status, search } = req.query; 
  let sql = `
    SELECT
      id,
      first_name,
      second_name,
      national_id,
      university_id,
      college,
      department,
      admission_year,
      status,
      created_at
    FROM admission_applications
    WHERE 1=1
  `;
  const params = [];

  // فلترة بالحالة (draft / submitted) لو موجودة
  if (status && (status === 'draft' || status === 'submitted')) {
    sql += " AND status = ?";
    params.push(status);
  }

  // بحث
  if (search && search.trim() !== "") {
    const like = `%${search}%`;
    sql += `
      AND (
        first_name LIKE ?
        OR second_name LIKE ?
        OR national_id LIKE ?
        OR university_id LIKE ?
      )
    `;
    params.push(like, like, like, like);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("LIST ADMISSIONS ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});


app.get('/api/admissions/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT *
    FROM admission_applications
    WHERE id = ?
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error("GET ADMISSION ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "الطلب غير موجود" });
    }

    const row = rows[0];

    let qualifications = [];
    let documents = [];

    try {
      qualifications = JSON.parse(row.qualifications_json || "[]");
    } catch (e) {}

    try {
      documents = JSON.parse(row.documents_json || "[]");
    } catch (e) {}

    res.json({
      id: row.id,
      personal: {
        firstName: row.first_name,
        secondName: row.second_name,
        thirdName: row.third_name,
        fourthName: row.fourth_name,
        nationality: row.nationality,
        gender: row.gender,
        nationalId: row.national_id,
        universityId: row.university_id,
        phone: row.phone,
        email: row.email,
        studentStatus: row.student_status,
      },
      admission: {
        college: row.college,
        department: row.department,
        degreeType: row.degree_type,
        studyType: row.study_type,
        admissionYear: row.admission_year ? row.admission_year.toString() : "",
      },
      qualifications,
      documents,
      status: row.status,
      createdAt: row.created_at,
    });
  });
});


////////

// تحديث كـ مسودة
app.put('/api/admissions/:id/draft', upload.any(), (req, res) => {
  handleUpdateAdmission(req, res, 'draft');
});

// تحديث نهائي (submitted)
app.put('/api/admissions/:id', upload.any(), (req, res) => {
  handleUpdateAdmission(req, res, 'submitted');
});

function handleUpdateAdmission(req, res, status) {
  let personal, admission, qualifications;

  try {
    personal = JSON.parse(req.body.personal || "{}");
    admission = JSON.parse(req.body.admission || "{}");
    qualifications = JSON.parse(req.body.qualifications || "[]");
  } catch (e) {
    console.error("JSON PARSE ERROR (update):", e);
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  const uniIdValue =
    personal.studentStatus === "تحويل داخلي" &&
    personal.universityId &&
    personal.universityId.toString().trim() !== ""
      ? personal.universityId.toString().trim()
      : "0";

  if (!Array.isArray(qualifications)) {
    qualifications = [];
  }

  // لو إنتِ خففتي المؤهلات في الفرونت، هنا ممكن تعملي فلتر بسيط بس على النوع + سنة التخرج
  const filteredQuals = qualifications.filter((q) =>
    q &&
    (q.type || q.qualification_type) &&
    (q.gradYear || q.grad_year)
  );

  const qualificationsJson = JSON.stringify(filteredQuals);

  let documentsArray = [];
  if (req.files && req.files.length > 0) {
    documentsArray = req.files.map((file) => {
      const fieldName = file.fieldname;
      let docType = fieldName;
      if (fieldName.startsWith("extra")) docType = "extra";
      return {
        doc_type: docType,
        file_url: buildFileUrl(req, file.filename),
        original_name: file.originalname,
        size_kb: Math.round(file.size / 1024),
      };
    });
  }
  const documentsJson = JSON.stringify(documentsArray);

  const sql = `
    UPDATE admission_applications
    SET
      first_name = ?, second_name = ?, third_name = ?, fourth_name = ?,
      nationality = ?, gender = ?, national_id = ?, university_id = ?,
      student_status = ?, phone = ?, email = ?,
      college = ?, department = ?, degree_type = ?, study_type = ?, admission_year = ?,
      qualifications_json = ?, documents_json = ?, status = ?
    WHERE id = ?
  `;

  const params = [
    personal.firstName || "",
    personal.secondName || "",
    personal.thirdName || "",
    personal.fourthName || "",
    personal.nationality || "",
    personal.gender || "",
    personal.nationalId || "",
    uniIdValue,
    personal.studentStatus || "",
    personal.phone || "",
    personal.email || "",
    admission.college || "",
    admission.department || "",
    admission.degreeType || "",
    admission.studyType || "",
    parseInt(admission.admissionYear || 0, 10),
    qualificationsJson,
    documentsJson,
    status,
    req.params.id,
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("UPDATE ADMISSION ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }

    return res.json({
      message:
        status === "draft"
          ? "تم تحديث المسودة بنجاح"
          : "تم تحديث بيانات الطالب بنجاح",
    });
  });
}


// قائمة الكليات (مع عدد الأقسام لكل كلية)
app.get("/api/faculties-list", (req, res) => {
  const sql = `
    SELECT f.id, f.faculty_name,
           COUNT(d.id) AS departments_count
    FROM faculties f
    LEFT JOIN departments d ON d.faculty_id = f.id
    GROUP BY f.id, f.faculty_name
    ORDER BY f.faculty_name
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("FACULTIES LIST ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// إضافة كلية
app.post("/api/faculties", (req, res) => {
  const { faculty_name } = req.body;
  if (!faculty_name || !faculty_name.trim()) {
    return res.status(400).json({ error: "اسم الكلية مطلوب" });
  }

  const sql = "INSERT INTO faculties (faculty_name) VALUES (?)";
  db.query(sql, [faculty_name.trim()], (err, result) => {
    if (err) {
      console.error("ADD FACULTY ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "تمت إضافة الكلية بنجاح", id: result.insertId });
  });
});

// تعديل كلية
app.put("/api/faculties/:id", (req, res) => {
  const { id } = req.params;
  const { faculty_name } = req.body;

  if (!faculty_name || !faculty_name.trim()) {
    return res.status(400).json({ error: "اسم الكلية مطلوب" });
  }

  const sql = "UPDATE faculties SET faculty_name = ? WHERE id = ?";
  db.query(sql, [faculty_name.trim(), id], (err, result) => {
    if (err) {
      console.error("UPDATE FACULTY ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "الكلية غير موجودة" });
    }
    res.json({ message: "تم تعديل الكلية بنجاح" });
  });
});

// حذف كلية (تلقائياً يحذف أقسامها بسبب ON DELETE CASCADE)
app.delete("/api/faculties/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM faculties WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DELETE FACULTY ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "الكلية غير موجودة" });
    }
    res.json({ message: "تم حذف الكلية بنجاح" });
  });
});


// جلب الأقسام لكلية معينة
app.get("/api/departments/:facultyId", (req, res) => {
  const { facultyId } = req.params;
  const sql = `
    SELECT id, department_name
    FROM departments
    WHERE faculty_id = ?
    ORDER BY department_name
  `;
  db.query(sql, [facultyId], (err, rows) => {
    if (err) {
      console.error("DEPARTMENTS LIST ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// إضافة قسم
app.post("/api/departments", (req, res) => {
  const { faculty_id, department_name } = req.body;

  if (!faculty_id || !department_name || !department_name.trim()) {
    return res.status(400).json({ error: "الكلية واسم القسم مطلوبان" });
  }

  const sql = `
    INSERT INTO departments (faculty_id, department_name)
    VALUES (?, ?)
  `;
  db.query(sql, [faculty_id, department_name.trim()], (err, result) => {
    if (err) {
      console.error("ADD DEPARTMENT ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "تمت إضافة القسم بنجاح", id: result.insertId });
  });
});

// تعديل قسم
app.put("/api/departments/:id", (req, res) => {
  const { id } = req.params;
  const { department_name } = req.body;

  if (!department_name || !department_name.trim()) {
    return res.status(400).json({ error: "اسم القسم مطلوب" });
  }

  const sql = `
    UPDATE departments
    SET department_name = ?
    WHERE id = ?
  `;
  db.query(sql, [department_name.trim(), id], (err, result) => {
    if (err) {
      console.error("UPDATE DEPARTMENT ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "القسم غير موجود" });
    }
    res.json({ message: "تم تعديل القسم بنجاح" });
  });
});

// حذف قسم
app.delete("/api/departments/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM departments WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DELETE DEPARTMENT ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "القسم غير موجود" });
    }
    res.json({ message: "تم حذف القسم بنجاح" });
  });
});



app.post("/add", (req, res) => {
  const data = req.body;

  const sql = `
    INSERT INTO students 
    (full_name, university_id, phone, receipt_number, college, level, academic_year, academic_status, registration_status, notes, registrar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    data.full_name,
    data.university_id || 0,
    data.phone,
    data.receipt_number,
    data.college,
    data.level,
    data.academic_year,
    data.academic_status,
    data.registration_status,
    data.notes,
    data.registrar
  ], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Student added successfully" });
  });
});

// إحصائيات الداشبورد
app.get("/stats", (req, res) => {
  db.query(`
      SELECT 
      (SELECT COUNT(*) FROM students WHERE DATE(created_at) = CURDATE()) AS today_students,
      (SELECT COUNT(*) FROM students) AS total_students,
      (SELECT COUNT(*) FROM students WHERE DATE(created_at) = CURDATE()) AS todays_updates
  `, (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows[0]);
  });
});


/* =========================================================
   🧍 جزء الطلاب (students) – إضافة + بحث + عرض طالب
   ========================================================= */

// إضافة طالب جديد (لو محتاجة شاشة تسجيل طالب أساسي)
// app.post('/api/students', (req, res) => {
//     const {
//         full_name,
//         university_id,
//         phone,
//         receipt_number,
//         department_id,
//         notes,
//         registrar
//     } = req.body;

//     if (!full_name) {
//         return res.status(400).json({ message: "الاسم الرباعي مطلوب" });
//     }

//         if (university_id && Number(university_id) !== 0) {
//       const checkSql = "SELECT id FROM students WHERE university_id = ?";
//       db.query(checkSql, [university_id], (err, rows) => {
//         if (err) return res.status(500).json({ message: "Database error" });
//         if (rows.length > 0) {
//           return res
//             .status(409)
//             .json({ message: "الرقم الجامعي مستخدم من قبل طالب آخر" });
//         }
//         insertStudent();
//       });
//     } else {
//       insertStudent();
//     }

//     function insertStudent() {
//       const sql = `
//         INSERT INTO students
//         (full_name, university_id, phone, receipt_number, department_id, notes, registrar)
//         VALUES (?, ?, ?, ?, ?, ?, ?)
//       `;
//       db.query(
//         sql,
//         [
//           full_name,
//           university_id || 0,
//           phone || null,
//           receipt_number || null,
//           department_id || null,
//           notes || null,
//           registrar || null,
//         ],
//         (err, result) => {
//           if (err) return res.status(500).json({ message: "Database error" });
//           res.json({ message: "تم إضافة الطالب", student_id: result.insertId });
//         }
//       );
//     }



//     const sql = `
//       INSERT INTO students
//         (full_name, university_id, phone, receipt_number, department_id, notes, registrar)
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//     `;

//     db.query(
//       sql,
//       [
//         full_name,
//         university_id || 0,
//         phone || null,
//         receipt_number || null,
//         department_id || null,
//         notes || null,
//         registrar || null
//       ],
//       (err, result) => {
//         if (err) {
//             console.log("MYSQL ERROR (add student):", err);
//             return res.status(500).json({ message: "Database error" });
//         }
//         res.json({ message: "تم إضافة الطالب", student_id: result.insertId });
//       }
//     );
// });
app.put("/api/students/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const { full_name, university_id, phone, department_id } = req.body;

    const name = (full_name || "").trim();
    if (!name) {
      return res.status(400).json({ message: "الاسم الرباعي مطلوب" });
    }

    const uniIdRaw = (university_id ?? "").toString().trim();
const uniId = uniIdRaw === "" ? "0" : uniIdRaw;   // خليه نص


    //  تحقق من تكرار الرقم الجامعي (لو ما 0)
    if (uniId && uniId !== "0") {
      const [rows] = await dbp.query(
        "SELECT id FROM students WHERE university_id = ? AND id <> ? LIMIT 1",
        [uniId, studentId]
      );

      if (rows.length > 0) {
        return res.status(409).json({ message: "الرقم الجامعي مستخدم من قبل طالب آخر" });
      }
    }

    const [result] = await dbp.query(
      `
      UPDATE students
      SET full_name = ?, university_id = ?, phone = ?, department_id = ?
      WHERE id = ?
      `,
      [name, uniId || "0", phone || null, department_id || null, studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    return res.json({ message: "تم تحديث بيانات الطالب" });
  } catch (e) {
    console.error("UPDATE STUDENT ERROR:", e);
    return res.status(500).json({ message: e.message });
  }
});



// app.put("/api/students/:id", (req, res) => {
//   const { university_id } = req.body;
//   const studentId = req.params.id;

//   if (university_id && Number(university_id) !== 0) {
//     const checkSql =
//       "SELECT id FROM students WHERE university_id = ? AND id <> ?";
//     db.query(checkSql, [university_id, studentId], (err, rows) => {
//       if (err) return res.status(500).json({ message: "Database error" });
//       if (rows.length > 0) {
//         return res
//           .status(409)
//           .json({ message: "الرقم الجامعي مستخدم من قبل طالب آخر" });
//       }
//       updateStudent();
//     });
//   } else {
//     updateStudent();
//   }

//   function updateStudent() {
//     const sql = "UPDATE students SET university_id = ? WHERE id = ?";
//     db.query(sql, [university_id || 0, studentId], (err, result) => {
//       if (err) return res.status(500).json({ message: "Database error" });
//       res.json({ message: "تم تحديث الرقم الجامعي" });
//     });
//   }
// });



// البحث عن الطلاب بالاسم أو الرقم الجامعي
app.get('/api/students/search', (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.json([]);

  const like = `%${q.trim()}%`;

  const sql = `
    SELECT
      s.*,
      d.department_name,
      f.faculty_name,

      -- آخر تسجيل (اختياري لكن مفيد)
      lr.academic_year      AS last_academic_year,
      lr.level_name         AS last_level_name,
      lr.term_name          AS last_term_name,
      lr.academic_status    AS last_academic_status,
      lr.registration_status AS last_registration_status,
      lr.program_type       AS last_program_type,
      lr.postgraduate_program AS last_postgraduate_program

    FROM students s
    LEFT JOIN departments d ON d.id = s.department_id
    LEFT JOIN faculties f ON f.id = d.faculty_id

    LEFT JOIN (
      SELECT sr1.*
      FROM student_registrations sr1
      JOIN (
        SELECT student_id, MAX(id) AS max_id
        FROM student_registrations
        GROUP BY student_id
      ) x ON x.max_id = sr1.id
    ) lr ON lr.student_id = s.id

    WHERE
      s.full_name LIKE ?
      OR CAST(s.university_id AS CHAR) LIKE ?
      OR CAST(s.phone AS CHAR) LIKE ?
      OR d.department_name LIKE ?
      OR f.faculty_name LIKE ?

    ORDER BY s.full_name
    LIMIT 100
  `;

  db.query(sql, [like, like, like, like, like], (err, rows) => {
    if (err) {
      console.log("MYSQL ERROR (search students full):", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(rows);
  });
});

// app.get('/api/students/search', (req, res) => {
//     const { q } = req.query;
//     if (!q) return res.json([]);

//     const like = `%${q}%`;

//     const sql = `
//       SELECT s.id, s.full_name, s.university_id, d.department_name
//       FROM students s
//       LEFT JOIN departments d ON d.id = s.department_id
//       WHERE s.full_name LIKE ? OR CAST(s.university_id AS CHAR) LIKE ?

//       ORDER BY s.full_name
//     `;

//     db.query(sql, [like, like], (err, rows) => {
//         if (err) {
//             console.log("MYSQL ERROR (search students):", err);
//             return res.status(500).json({ message: "Database error" });
//         }
//         res.json(rows);
//     });
// });

// جلب بيانات طالب + آخر تسجيل ليه
// app.get('/api/students/:id', (req, res) => {
//     const studentId = req.params.id;

//     const sqlStudent = `
//       SELECT s.*, d.department_name, f.faculty_name
//       FROM students s
//       LEFT JOIN departments d ON d.id = s.department_id
//       LEFT JOIN faculties f ON f.id = d.faculty_id
//       WHERE s.id = ?
//     `;

//   const sqlLastReg = `
//   SELECT *
//   FROM student_registrations
//   WHERE student_id = ?
//   ORDER BY created_at DESC, id DESC
//   LIMIT 1
// `;

//      db.query(sqlLastReg, [studentId], (err2, regRows) => {
//     if (err2) return res.status(500).json({ message: "Database error" });

//     const lastReg = regRows[0] || null;

//     if (lastReg && lastReg.postgraduate_data) {
//       try {
//         lastReg.postgraduate_data = JSON.parse(lastReg.postgraduate_data);
//       } catch (e) {
//         lastReg.postgraduate_data = null;
//       }
//     }

//     res.json({
//       student: studentRows[0],
//       lastRegistration: lastReg
//     });
//   });
// });

// جلب بيانات طالب + آخر تسجيل ليه
app.get("/api/students/:id", (req, res) => {
  const studentId = req.params.id;

  // const sqlStudent = `
  //   SELECT s.*, d.department_name, f.faculty_name
  //   FROM students s
  //   LEFT JOIN departments d ON d.id = s.department_id
  //   LEFT JOIN faculties f ON f.id = d.faculty_id
  //   WHERE s.id = ?
  // `;
  const sqlStudent = `
  SELECT s.*, d.department_name, d.faculty_id, f.faculty_name
  FROM students s
  LEFT JOIN departments d ON d.id = s.department_id
  LEFT JOIN faculties f ON f.id = d.faculty_id
  WHERE s.id = ?
`;


  const sqlLastReg = `
    SELECT *
    FROM student_registrations
    WHERE student_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `;

  db.query(sqlStudent, [studentId], (err, rowsStudent) => {
    if (err) {
      console.log("MYSQL ERROR (get student):", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!rowsStudent || rowsStudent.length === 0) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    db.query(sqlLastReg, [studentId], (err2, rowsReg) => {
      if (err2) {
        console.log("MYSQL ERROR (last registration):", err2);
        return res.status(500).json({ message: "Database error" });
      }

      const lastReg = rowsReg && rowsReg.length ? rowsReg[0] : null;

      //  فك postgraduate_data لو جاية JSON
      if (lastReg && lastReg.postgraduate_data) {
        try {
          lastReg.postgraduate_data = JSON.parse(lastReg.postgraduate_data);
        } catch (e) {
          lastReg.postgraduate_data = null;
        }
      }

      return res.json({
        student: rowsStudent[0],
        lastRegistration: lastReg,
      });
    });
  });
});


app.post('/api/registrations', (req, res) => {
  const {
    student_id,
    academic_year,
    level_name,
    term_name,
    academic_status,
    registration_status,
    notes,
    registrar,
    program_type,
    postgraduate_data,
    postgraduate_program,
  } = req.body;

  const programType = (program_type || "undergraduate").trim();

  const year = (academic_year || "").toString().trim();
  const level = (level_name || "").toString().trim();
  const term = (term_name || "").toString().trim(); //  إجباري الآن

  const pgProgram = (postgraduate_program || "").toString().trim() || null;

  //  Validation
  if (!student_id || !year || !level || !term) {
    return res.status(400).json({ message: "student_id + العام + المستوى + الفصل مطلوبة" });
  }

  if (programType === "postgraduate" && !pgProgram) {
    return res.status(400).json({ message: "postgraduate_program مطلوب للدراسات العليا" });
  }

  //  0) حماية: لا تسمح بتسجيل أقدم من آخر تسجيل لنفس الطالب (لنفس البرنامج)
  const lastSql = `
    SELECT academic_year, level_name, term_name
    FROM student_registrations
    WHERE student_id = ?
      AND program_type = ?
      AND (postgraduate_program <=> ?)
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `;

  db.query(lastSql, [student_id, programType, pgProgram], (lastErr, lastRows) => {
    if (lastErr) {
      console.log("MYSQL ERROR (last registration check):", lastErr);
      return res.status(500).json({ message: lastErr.message });
    }

    const last = lastRows && lastRows.length ? lastRows[0] : null;

    if (last) {
      const reqP = { academic_year: year, level_name: level, term_name: term };
      const lastP = {
        academic_year: last.academic_year,
        level_name: last.level_name,
        term_name: last.term_name,
      };

      // لو المطلوب أقدم من آخر تسجيل -> ارفض
      if (comparePeriods(reqP, lastP) <= 0) {
        return res.status(400).json({
           message: `لا يمكن التسجيل في نفس/أقدم فترة. آخر تسجيل كان: ${last.academic_year} - ${last.level_name} - ${last.term_name}`,
        });
      }
    }

    //  1) خزّن/ثبّت الفترة الدراسية في academic_periods
    const upsertPeriodSql = `
      INSERT INTO academic_periods
        (academic_year, level_name, term_name, program_type, postgraduate_program)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id = id
    `;

    db.query(
      upsertPeriodSql,
      [year, level, term, programType, programType === "postgraduate" ? pgProgram : null],
      (periodErr) => {
        if (periodErr) {
          console.log("MYSQL ERROR (upsert academic_periods):", periodErr);
        }

        // 2) هل في تسجيل موجود لنفس السنة/المستوى/الفصل/البرنامج؟
        const checkSql = `
          SELECT id
          FROM student_registrations
          WHERE student_id = ?
            AND academic_year = ?
            AND level_name = ?
            AND term_name = ?
            AND program_type = ?
            AND (postgraduate_program <=> ?)
          ORDER BY id DESC
          LIMIT 1
        `;

        db.query(
          checkSql,
          [student_id, year, level, term, programType, pgProgram],
          (err, rows) => {
            if (err) {
              console.log("MYSQL ERROR (check registration):", err);
              return res.status(500).json({ message: err.message });
            }

            const existing = rows && rows.length ? rows[0] : null;

            // لو موجود → UPDATE
            if (existing) {
              const updSql = `
                UPDATE student_registrations
                SET
                  academic_status = ?,
                  registration_status = ?,
                  notes = ?,
                  registrar = ?,
                  postgraduate_data = ?
                WHERE id = ?
              `;

              db.query(
                updSql,
                [
                  (academic_status || "منتظم").toString(),
                  (registration_status || "مسجّل").toString(),
                  notes || null,
                  registrar || null,
                  postgraduate_data ? JSON.stringify(postgraduate_data) : null,
                  existing.id,
                ],
                (err2) => {
                  if (err2) {
                    console.log("MYSQL ERROR (update registration):", err2);
                    return res.status(500).json({ message: err2.message });
                  }
                  return res.json({
                    message: "تم تحديث تسجيل الطالب لنفس السنة/الفصل",
                    registration_id: existing.id,
                    action: "updated",
                  });
                }
              );
            } else {
              // لو ما موجود → INSERT جديد
              const insSql = `
                INSERT INTO student_registrations
                (
                  student_id, academic_year, level_name, term_name,
                  academic_status, registration_status,
                  notes, registrar,
                  program_type, postgraduate_program, postgraduate_data
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;

              db.query(
                insSql,
                [
                  student_id,
                  year,
                  level,
                  term,
                  (academic_status || "منتظم").toString(),
                  (registration_status || "مسجّل").toString(),
                  notes || null,
                  registrar || null,
                  programType,
                  programType === "postgraduate" ? pgProgram : null,
                  postgraduate_data ? JSON.stringify(postgraduate_data) : null,
                ],
                (err3, result) => {
                  if (err3) {
                    console.log("MYSQL ERROR (insert registration):", err3);
                    return res.status(500).json({ message: err3.message });
                  }
                  return res.json({
                    message: "تم إضافة تسجيل جديد للطالب لهذا العام/الفصل",
                    registration_id: result.insertId,
                    action: "inserted",
                  });
                }
              );
            }
          }
        );
      }
    );
  });
});


// app.post('/api/registrations', (req, res) => {
//   const {
//     student_id,
//     academic_year,
//     level_name,
//     term_name,
//     academic_status,
//     registration_status,
//     notes,
//     registrar,
//     program_type,
//     postgraduate_data,
//     postgraduate_program,
//   } = req.body;

//   const programType = (program_type || "undergraduate").trim();

//   const year = (academic_year || "").toString().trim();
//   const level = (level_name || "").toString().trim();
//   const term = (term_name || "").toString().trim(); //  إجباري الآن

//   const pgProgram = (postgraduate_program || "").toString().trim() || null;

//   //  Validation: الفصل صار مطلوب
//   if (!student_id || !year || !level || !term) {
//     return res.status(400).json({ message: "student_id + العام + المستوى + الفصل مطلوبة" });
//   }

//   if (programType === "postgraduate" && !pgProgram) {
//     return res.status(400).json({ message: "postgraduate_program مطلوب للدراسات العليا" });
//   }

//   //  0) خزّن/ثبّت الفترة الدراسية في academic_periods (مرة واحدة)
//   // لو موجودة ما بتتكرر بسبب UNIQUE
//   const upsertPeriodSql = `
//     INSERT INTO academic_periods
//       (academic_year, level_name, term_name, program_type, postgraduate_program)
//     VALUES (?, ?, ?, ?, ?)
//     ON DUPLICATE KEY UPDATE id = id
//   `;

//   db.query(
//     upsertPeriodSql,
//     [year, level, term, programType, programType === "postgraduate" ? pgProgram : null],
//     (periodErr) => {
//       if (periodErr) {
//         console.log("MYSQL ERROR (upsert academic_periods):", periodErr);
//         // ما نوقف التسجيل، لكن لو دايراه توقف:
//         // return res.status(500).json({ message: "Database error (academic_periods)" });
//       }

//       // 1) هل في تسجيل موجود لنفس السنة/المستوى/الفصل/البرنامج؟
//       const checkSql = `
//         SELECT id
//         FROM student_registrations
//         WHERE student_id = ?
//           AND academic_year = ?
//           AND level_name = ?
//           AND term_name = ?
//           AND program_type = ?
//           AND (postgraduate_program <=> ?)
//         ORDER BY id DESC
//         LIMIT 1
//       `;

//       db.query(
//         checkSql,
//         [student_id, year, level, term, programType, pgProgram],
//         (err, rows) => {
//           if (err) {
//             console.log("MYSQL ERROR (check registration):", err);
//             return res.status(500).json({ message: err.message });
//           }

//           const existing = rows && rows.length ? rows[0] : null;

//           // لو موجود → UPDATE (بدل INSERT)
//           if (existing) {
//             const updSql = `
//               UPDATE student_registrations
//               SET
//                 academic_status = ?,
//                 registration_status = ?,
//                 notes = ?,
//                 registrar = ?,
//                 postgraduate_data = ?
//               WHERE id = ?
//             `;

//             db.query(
//               updSql,
//               [
//                 (academic_status || "منتظم").toString(),
//                 (registration_status || "مسجّل").toString(),
//                 notes || null,
//                 registrar || null,
//                 postgraduate_data ? JSON.stringify(postgraduate_data) : null,
//                 existing.id,
//               ],
//               (err2) => {
//                 if (err2) {
//                   console.log("MYSQL ERROR (update registration):", err2);
//                   return res.status(500).json({ message: err2.message });
//                 }
//                 return res.json({
//                   message: "تم تحديث تسجيل الطالب لنفس السنة/الفصل",
//                   registration_id: existing.id,
//                   action: "updated",
//                 });
//               }
//             );
//           } else {
//             // لو ما موجود → INSERT جديد
//             const insSql = `
//               INSERT INTO student_registrations
//               (
//                 student_id, academic_year, level_name, term_name,
//                 academic_status, registration_status,
//                 notes, registrar,
//                 program_type, postgraduate_program, postgraduate_data
//               )
//               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//             `;

//             db.query(
//               insSql,
//               [
//                 student_id,
//                 year,
//                 level,
//                 term,
//                 (academic_status || "منتظم").toString(),
//                 (registration_status || "مسجّل").toString(),
//                 notes || null,
//                 registrar || null,
//                 programType,
//                 programType === "postgraduate" ? pgProgram : null,
//                 postgraduate_data ? JSON.stringify(postgraduate_data) : null,
//               ],
//               (err3, result) => {
//                 if (err3) {
//                   console.log("MYSQL ERROR (insert registration):", err3);
//                   return res.status(500).json({ message: err3.message });
//                 }
//                 return res.json({
//                   message: "تم إضافة تسجيل جديد للطالب لهذا العام/الفصل",
//                   registration_id: result.insertId,
//                   action: "inserted",
//                 });
//               }
//             );
//           }
//         }
//       );
//     }
//   );
// });


// app.post('/api/registrations', (req, res) => {
//   const {
//     student_id,
//     academic_year,
//     level_name,
//     term_name,
//     academic_status,
//     registration_status,
//     notes,
//     registrar,
//     program_type,
//     postgraduate_data,
//     postgraduate_program, //  جديد
//   } = req.body;

//   const programType = program_type || "undergraduate";

//   if (!student_id || !academic_year || !level_name) {
//     return res.status(400).json({ message: "student_id + العام + المستوى مطلوبة" });
//   }

//   if (programType === "postgraduate" && !(postgraduate_program || "").trim()) {
//     return res.status(400).json({ message: "postgraduate_program مطلوب للدراسات العليا" });
//   }

//   const sql = `
//     INSERT INTO student_registrations
//     (
//       student_id, academic_year, level_name, term_name,
//       academic_status, registration_status,
//       notes, registrar,
//       program_type, postgraduate_program, postgraduate_data
//     )
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(
//     sql,
//     [
//       student_id,
//       academic_year,
//       level_name,
//       term_name || null,
//       academic_status || "منتظم",
//       registration_status || "مسجّل",
//       notes || null,
//       registrar || null,
//       programType,
//       programType === "postgraduate" ? (postgraduate_program || null) : null,
//       postgraduate_data ? JSON.stringify(postgraduate_data) : null,
//     ],
//     (err, result) => {
//       if (err) {
//         console.log("MYSQL ERROR (add registration):", err);
//         return res.status(500).json({ message: err.message });
//       }
//       return res.json({
//         message: "تم تسجيل الطالب لهذا العام/الفصل",
//         registration_id: result.insertId,
//       });
//     }
//   );
// });

//    app.post('/api/registrations', (req, res) => {
//   const {
//     student_id,
//     academic_year,
//     level_name,
//     term_name,
//     academic_status,
//     registration_status,
//     notes,
//     registrar,
//     program_type,
//     postgraduate_data
//   } = req.body;

//   if (!student_id || !academic_year || !level_name) {
//     return res.status(400).json({ message: "student_id + العام + المستوى مطلوبة" });
//   }

//   const sql = `
//     INSERT INTO student_registrations
//     (
//       student_id, academic_year, level_name, term_name,
//       academic_status, registration_status,
//       notes, registrar,
//       program_type, postgraduate_data
//     )
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(
//     sql,
//     [
//       student_id,
//       academic_year,
//       level_name,
//       term_name || null,
//       academic_status || "منتظم",
//       registration_status || "مسجّل",
//       notes || null,
//       registrar || null,
//       program_type || "undergraduate",
//       postgraduate_data ? JSON.stringify(postgraduate_data) : null,
//     ],
//     (err, result) => {
//       if (err) {
//         console.log("MYSQL ERROR (add registration):", err);
//         return res.status(500).json({ message: err.message });
//       }

//       return res.json({
//         message: "تم تسجيل الطالب لهذا العام/الفصل",
//         registration_id: result.insertId,
//       });
//     }
//   );
// });


// إضافة تسجيل جديد لطالب (تاب تسجيل طالب)
// app.post('/api/registrations', (req, res) => {
//     const {
//         student_id,
//         academic_year,
//         level_name,
//         term_name,
//         academic_status,
//         registration_status,
//         receipt_number,
//         notes,
//         registrar
//     } = req.body;

//     if (!student_id || !academic_year || !level_name) {
//         return res.status(400).json({ message: "student_id + العام + المستوى مطلوبة" });
//     }

//     const sql = `
//       INSERT INTO student_registrations
//         (student_id, academic_year, level_name, term_name,
//          academic_status, registration_status, receipt_number, notes, registrar)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     db.query(
//       sql,
//       [
//         student_id,
//         academic_year,
//         level_name,
//         term_name || null,
//         academic_status || 'منتظم',
//         registration_status || 'مسجّل',
//         receipt_number || null,
//         notes || null,
//         registrar || null
//       ],
//       (err, result) => {
//         if (err) {
//             console.log("MYSQL ERROR (add registration):", err);
//             return res.status(500).json({ message: "Database error" });
//         }
//         res.json({
//             message: "تم تسجيل الطالب لهذا العام/الفصل",
//             registration_id: result.insertId
//         });
//       }
//     );
// });
app.post('/api/students', (req, res) => {
  const {
    full_name,
    university_id,
    phone,
    receipt_number,
    department_id,
    notes,
    registrar
  } = req.body;

  const name = (full_name || "").trim();
  if (!name) {
    return res.status(400).json({ message: "الاسم الرباعي مطلوب" });
  }

 const uniIdRaw = (university_id ?? "").toString().trim();
const uniId = uniIdRaw === "" ? "0" : uniIdRaw;   // خليه نص


  // 1) امنع تكرار الاسم الرباعي (اختياري تربطيه بالقسم لو دايراه)
  const checkNameSql = `SELECT id FROM students WHERE full_name = ? LIMIT 1`;
  db.query(checkNameSql, [name], (err, nameRows) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (nameRows.length > 0) {
      return res.status(409).json({ message: "اسم الطالب موجود مسبقاً" });
    }

    // 2) امنع تكرار الرقم الجامعي لو ما 0
    const checkUniSql = `SELECT id FROM students WHERE university_id = ? LIMIT 1`;

    const doInsert = () => {
      const insertSql = `
        INSERT INTO students
        (full_name, university_id, phone, receipt_number, department_id, notes, registrar)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        insertSql,
        [
          name,
          uniId || "0",
          phone || null,
          receipt_number || null,
          department_id || null,
          notes || null,
          registrar || null,
        ],
        (err2, result) => {
          if (err2) {
            console.log("MYSQL ERROR (add student):", err2);
            return res.status(500).json({ message: err2.message });
          }
          return res.json({ message: "تم إضافة الطالب", student_id: result.insertId });
        }
      );
    };

    if (uniId && uniId !== "0") {
      return db.query(checkUniSql, [uniId], (err3, uniRows) => {
        if (err3) return res.status(500).json({ message: "Database error" });
        if (uniRows.length > 0) {
          return res.status(409).json({ message: "الرقم الجامعي مستخدم من قبل طالب آخر" });
        }
        return doInsert();
      });
    }

    return doInsert();
  });
});

// app.post('/api/students', (req, res) => {
//   const {
//     full_name,
//     university_id,
//     phone,
//     receipt_number,
//     department_id,
//     notes,
//     registrar
//   } = req.body;

//   if (!full_name || !full_name.trim()) {
//     return res.status(400).json({ message: "الاسم الرباعي مطلوب" });
//   }

//   const uniId = university_id ? Number(university_id) : 0;

//   const insertStudent = () => {
//     const sql = `
//       INSERT INTO students
//       (full_name, university_id, phone, receipt_number, department_id, notes, registrar)
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//     `;

//     db.query(
//       sql,
//       [
//         full_name.trim(),
//         uniId || 0,
//         phone || null,
//         receipt_number || null,
//         department_id || null,
//         notes || null,
//         registrar || null,
//       ],
//       (err, result) => {
//         if (err) {
//           console.log("MYSQL ERROR (add student):", err);
//           return res.status(500).json({ message: "Database error" });
//         }
//         return res.json({ message: "تم إضافة الطالب", student_id: result.insertId });
//       }
//     );
//   };

//   // لو الرقم الجامعي غير صفر → اتأكد ما مستخدم
//   if (uniId && uniId !== 0) {
//     const checkSql = "SELECT id FROM students WHERE university_id = ?";
//     return db.query(checkSql, [uniId], (err, rows) => {
//       if (err) return res.status(500).json({ message: "Database error" });
//       if (rows.length > 0) {
//         return res.status(409).json({ message: "الرقم الجامعي مستخدم من قبل طالب آخر" });
//       }
//       return insertStudent();
//     });
//   }

//   // لو 0 أو فاضي → أدخله مباشرة
//   return insertStudent();
// });


// كل تسجيلات طالب معيّن (history)
app.get('/api/registrations/by-student/:studentId', (req, res) => {
    const studentId = req.params.studentId;

    const sql = `
      SELECT *
      FROM student_registrations
      WHERE student_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [studentId], (err, rows) => {
        if (err) {
            console.log("MYSQL ERROR (registrations by student):", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(rows);
    });
});


/* =========================================================
   🔁 الترحيل الجماعي (بدء عام/فصل جديد)
   ========================================================= */

// المرشحين للترحيل (الطلاب الناجحين في قسم + عام + مستوى محدد)
// app.get('/api/promotion/candidates', (req, res) => {
//     const { department_id, from_year, from_level } = req.query;

//     if (!department_id || !from_year || !from_level) {
//         return res.status(400).json({ message: "department_id + from_year + from_level مطلوبة" });
//     }

//     const sql = `
//       SELECT
//         s.id AS student_id,
//         s.full_name,
//         s.university_id,
//         sr.academic_year,
//         sr.level_name,
//         sr.academic_status,
//         sr.registration_status
//       FROM students s
//       JOIN student_registrations sr ON sr.student_id = s.id
//       WHERE s.department_id = ?
//         AND sr.academic_year = ?
//         AND sr.level_name   = ?
//         AND sr.academic_status   = 'ناجح'
//         AND sr.registration_status = 'مسجّل'
//       ORDER BY s.full_name
//     `;

//     db.query(sql, [department_id, from_year, from_level], (err, rows) => {
//         if (err) {
//             console.log("MYSQL ERROR (promotion candidates):", err);
//             return res.status(500).json({ message: "Database error" });
//         }
//         res.json(rows);
//     });
// });


// app.get('/api/promotion/candidates', (req, res) => {
//   const { department_id, from_year } = req.query;

//   if (!department_id || !from_year) {
//     return res.status(400).json({ message: "department_id + from_year مطلوبة" });
//   }

//   const sql = `
//     SELECT
//       s.id AS student_id,
//       s.full_name,
//       s.university_id,
//       sr.academic_year,
//       sr.level_name,
//       sr.academic_status,
//       sr.registration_status
//     FROM students s
//     JOIN (
//       SELECT student_id, MAX(id) AS last_reg_id
//       FROM student_registrations
//       GROUP BY student_id
//     ) lr ON lr.student_id = s.id
//     JOIN student_registrations sr ON sr.id = lr.last_reg_id
//     WHERE s.department_id = ?
//       AND sr.academic_year = ?
//       AND sr.academic_status = 'ناجح'
//       AND sr.registration_status = 'مسجّل'
//     ORDER BY s.full_name
//   `;

//   db.query(sql, [department_id, from_year], (err, rows) => {
//     if (err) {
//       console.log("MYSQL ERROR (promotion candidates):", err);
//       return res.status(500).json({ message: "Database error" });
//     }
//     res.json(rows);
//   });
// });
app.get('/api/promotion/candidates', (req, res) => {
  const {
    department_id,
    from_year,
    from_level,
    from_term,
    program_type,
    postgraduate_program
  } = req.query;

  const programType = (program_type || "undergraduate").trim();

  if (!department_id || !from_year || !from_level) {
    return res.status(400).json({ message: "department_id + from_year + from_level مطلوبة" });
  }

  if (programType === "postgraduate" && !(postgraduate_program || "").trim()) {
    return res.status(400).json({ message: "postgraduate_program مطلوب للدراسات العليا" });
  }

  const pgFilterSql = programType === "postgraduate" ? " AND postgraduate_program = ? " : "";
  const pgFilterParams = programType === "postgraduate" ? [postgraduate_program] : [];

  const termFilterSql = (from_term || "").trim() ? " AND term_name = ? " : "";
  const termFilterParams = (from_term || "").trim() ? [from_term] : [];

  const sql = `
    SELECT
      s.id AS student_id,
      s.full_name,
      s.university_id,

      pass.academic_year  AS passed_year,
      pass.level_name     AS passed_level,
      pass.term_name      AS passed_term,
      CASE WHEN pass.result_status = 1 THEN 'ناجح' ELSE 'راسب' END AS passed_status,
      pass.result_status AS passed_flag,

      cur.academic_year   AS current_year,
      cur.level_name      AS current_level,
      cur.term_name       AS current_term,
      cur.academic_status AS current_status,
      cur.registration_status AS current_reg_status

    FROM students s

    JOIN (
      SELECT sr1.*
      FROM student_registrations sr1
      JOIN (
        SELECT student_id, MAX(id) AS max_id
        FROM student_registrations
        WHERE academic_year = ?
          AND level_name = ?
          ${termFilterSql}
          AND result_status = 1
          AND registration_status = 'مسجّل'
          AND program_type = ?
          ${pgFilterSql}
        GROUP BY student_id
      ) x ON x.max_id = sr1.id
    ) pass ON pass.student_id = s.id

    JOIN (
      SELECT sr2.*
      FROM student_registrations sr2
      JOIN (
        SELECT student_id, MAX(id) AS max_id
        FROM student_registrations
        WHERE program_type = ?
          ${pgFilterSql}
        GROUP BY student_id
      ) y ON y.max_id = sr2.id
    ) cur ON cur.student_id = s.id

    WHERE s.department_id = ?
    ORDER BY s.full_name
  `;

  const params = [
    from_year,
    from_level,
    ...termFilterParams,
    programType,
    ...pgFilterParams,
    programType,
    ...pgFilterParams,
    department_id
  ];

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.log("MYSQL ERROR (promotion candidates):", err);
      return res.status(500).json({ message: err.message });
    }
    res.json(rows);
  });
});

//4
// app.get('/api/promotion/candidates', (req, res) => {
//   const { department_id, from_year, program_type, postgraduate_program } = req.query;
//   const programType = program_type || "undergraduate";

//   if (!department_id || !from_year) {
//     return res.status(400).json({ message: "department_id + from_year مطلوبة" });
//   }

//   if (programType === "postgraduate" && !(postgraduate_program || "").trim()) {
//     return res.status(400).json({ message: "postgraduate_program مطلوب للدراسات العليا" });
//   }

//   // فلترة البرنامج (بس لو دراسات عليا)
//   const pgFilterSql = programType === "postgraduate" ? " AND postgraduate_program = ? " : "";
//   const pgFilterParams = programType === "postgraduate" ? [postgraduate_program] : [];

//   const sql = `
//     SELECT
//       s.id AS student_id,
//       s.full_name,
//       s.university_id,

//       pass.academic_year  AS passed_year,
//       pass.level_name     AS passed_level,
//       pass.term_name      AS passed_term,
//       CASE WHEN pass.result_status = 1 THEN 'ناجح' ELSE 'راسب' END AS passed_status,
//       pass.result_status AS passed_flag,

//       cur.academic_year   AS current_year,
//       cur.level_name      AS current_level,
//       cur.term_name       AS current_term,
//       cur.academic_status AS current_status,
//       cur.registration_status AS current_reg_status

//     FROM students s

//     JOIN (
//       SELECT sr1.*
//       FROM student_registrations sr1
//       JOIN (
//         SELECT student_id, MAX(id) AS max_id
//         FROM student_registrations
//         WHERE academic_year = ?
//           AND result_status = 1
//           AND registration_status = 'مسجّل'
//           AND program_type = ?
//           ${pgFilterSql}
//         GROUP BY student_id
//       ) x ON x.max_id = sr1.id
//     ) pass ON pass.student_id = s.id

//     JOIN (
//       SELECT sr2.*
//       FROM student_registrations sr2
//       JOIN (
//         SELECT student_id, MAX(id) AS max_id
//         FROM student_registrations
//         GROUP BY student_id
//       ) y ON y.max_id = sr2.id
//     ) cur ON cur.student_id = s.id

//     WHERE s.department_id = ?
//     ORDER BY s.full_name
//   `;

//   const params = [from_year, programType, ...pgFilterParams, department_id];

//   db.query(sql, params, (err, rows) => {
//     if (err) {
//       console.log("MYSQL ERROR (promotion candidates):", err);
//       return res.status(500).json({ message: err.message });
//     }
//     res.json(rows);
//   });
// });


// app.get('/api/promotion/candidates', (req, res) => {
// const { department_id, from_year, program_type } = req.query;
// const programType = program_type || "undergraduate";


//   if (!department_id || !from_year) {
//     return res.status(400).json({ message: "department_id + from_year مطلوبة" });
//   }

//   const sql = `
//     SELECT
//       s.id AS student_id,
//       s.full_name,
//       s.university_id,

//       -- سجل النجاح (للسنة المختارة)
//       pass.academic_year  AS passed_year,
//       pass.level_name     AS passed_level,
//       pass.term_name      AS passed_term,
//       CASE WHEN pass.result_status = 1 THEN 'ناجح' ELSE 'راسب' END AS passed_status,
//       pass.result_status AS passed_flag,


//       -- السجل الحالي (آخر تسجيل)
//       cur.academic_year   AS current_year,
//       cur.level_name      AS current_level,
//       cur.term_name       AS current_term,
//       cur.academic_status AS current_status,
//       cur.registration_status AS current_reg_status

//     FROM students s

//     -- آخر "نجاح" للطالب داخل السنة المطلوبة (عشان يكون مرشح)
//     JOIN (
//       SELECT sr1.*
//       FROM student_registrations sr1
//       JOIN (
//         SELECT student_id, MAX(id) AS max_id
//         FROM student_registrations
//         WHERE academic_year = ?
//           AND result_status = 1
//           AND registration_status = 'مسجّل'
//           AND program_type = ?
//           AND program_type = ?
//         GROUP BY student_id
//       ) x ON x.max_id = sr1.id
//     ) pass ON pass.student_id = s.id

//     -- آخر تسجيل للطالب (الحالي)
//     JOIN (
//       SELECT sr2.*
//       FROM student_registrations sr2
//       JOIN (
//         SELECT student_id, MAX(id) AS max_id
//         FROM student_registrations
//         GROUP BY student_id
//       ) y ON y.max_id = sr2.id
//     ) cur ON cur.student_id = s.id

//     WHERE s.department_id = ?
//     ORDER BY s.full_name
//   `;

//   db.query(sql, [from_year, programType, department_id], (err, rows) => {
//     if (err) {
//       console.log("MYSQL ERROR (promotion candidates):", err);
//       return res.status(500).json({ message: "Database error" });
//     }
//     res.json(rows);
//   });
// });



// تنفيذ الترحيل الجماعي
app.post('/api/promotion/start', (req, res) => {
  const { student_ids, to_year, to_level, term_name, registrar, program_type, postgraduate_program } = req.body;
  const programType = (program_type || "undergraduate").trim();
  const pgProgram = programType === "postgraduate" ? ((postgraduate_program || "").trim() || null) : null;

  if (!student_ids || !Array.isArray(student_ids) || !student_ids.length || !to_year || !to_level || !term_name) {
    return res.status(400).json({ message: "student_ids + to_year + to_level + term_name مطلوبة" });
  }

  if (programType === "postgraduate" && !pgProgram) {
    return res.status(400).json({ message: "postgraduate_program مطلوب للدراسات العليا" });
  }

  const target = {
    academic_year: String(to_year).trim(),
    level_name: String(to_level).trim(),
    term_name: String(term_name).trim(),
  };

  const lastSql = `
    SELECT academic_year, level_name, term_name
    FROM student_registrations
    WHERE student_id = ?
      AND program_type = ?
      AND (postgraduate_program <=> ?)
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `;

  const insertSql = `
    INSERT INTO student_registrations
      (student_id, academic_year, level_name, term_name,
       academic_status, registration_status, registrar,
       program_type, postgraduate_program)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  let completed = 0;
  let hasError = false;

  student_ids.forEach((sid) => {
    if (hasError) return;

    db.query(lastSql, [sid, programType, pgProgram], (eLast, rLast) => {
      if (hasError) return;

      if (eLast) {
        hasError = true;
        console.log("MYSQL ERROR (promotion last check):", eLast);
        return res.status(500).json({ message: eLast.message });
      }

      const last = rLast && rLast.length ? rLast[0] : null;

      if (last) {
        const lastP = {
          academic_year: last.academic_year,
          level_name: last.level_name,
          term_name: last.term_name || "",
        };

        
        if (comparePeriods(target, lastP) <= 0) {
          hasError = true;
          return res.status(400).json({
            message: `لا يمكن الترحيل لنفس/أقدم فترة. مثال الطالب ${sid}: آخر تسجيل ${last.academic_year} - ${last.level_name} - ${last.term_name}`,
          });
        }
      }

      
      db.query(
        insertSql,
        [
          sid,
          target.academic_year,
          target.level_name,
          target.term_name,
          "منتظم",
          "مسجّل",
          registrar || null,
          programType,
          pgProgram,
        ],
        (err) => {
          if (hasError) return;

          if (err) {
            hasError = true;
            console.log("MYSQL ERROR (promotion insert):", err);
            return res.status(500).json({ message: err.message });
          }

          completed++;
          if (completed === student_ids.length && !hasError) {
            return res.json({
              message: "تم ترحيل الطلاب وبداية العام/الفصل الجديد",
              count: student_ids.length,
            });
          }
        }
      );
    });
  });
});


// app.post('/api/promotion/start', (req, res) => {
//     const { student_ids, to_year, to_level, term_name, registrar, program_type } = req.body;
//     const programType = program_type || "undergraduate";


//     if (!student_ids || !Array.isArray(student_ids) || !student_ids.length || !to_year || !to_level) {
//         return res.status(400).json({ message: "student_ids + to_year + to_level مطلوبة" });
//     }

//     const sql = `
// INSERT INTO student_registrations
// (student_id, academic_year, level_name, term_name,
//  academic_status, registration_status, registrar, program_type)
// VALUES (?, ?, ?, ?, 'منتظم', 'مسجّل', ?, ?)

//     `;

//     // نعمل إدخال بسيط في حلقة (ممكن تتحسن لاحقاً بـ bulk insert)
//     let completed = 0;
//     let hasError = false;

//     student_ids.forEach((studentId) => {
//         if (hasError) return;

//         db.query(
//           sql,
//           [studentId, to_year, to_level, term_name || null, registrar || null, programType],
//           (err, result) => {
//             if (err) {
//                 hasError = true;
//                 console.log("MYSQL ERROR (promotion start):", err);
//                 return res.status(500).json({ message: "Database error أثناء الترحيل" });
//             }

//             completed++;
//             if (completed === student_ids.length && !hasError) {
//                 res.json({
//                     message: "تم ترحيل الطلاب وبداية العام/الفصل الجديد",
//                     count: student_ids.length
//                 });
//             }
//           }
//         );
//     });
// });

app.get("/api/grading-rules", async (req, res) => {
  try {
    const facultyId = Number(req.query.faculty_id);
    if (!facultyId) return res.status(400).json({ error: "faculty_id مطلوب" });

    //  لازم نجيب أعمدة settings كمان
    const [rows] = await dbp.query(
      `SELECT
         rule_type, program_mode, label, min_value, max_value, points,
         term_calc_mode, cumulative_calc_mode, gpa_max,
         sort_order, id
       FROM grading_rules
       WHERE faculty_id = ?
       ORDER BY rule_type, program_mode, sort_order, id`,
      [facultyId]
    );

    const gradeScale = rows
      .filter((r) => r.rule_type === "grade_scale")
      .map((r) => ({
        letter: r.label,
        min: Number(r.min_value),
        max: Number(r.max_value),
        points: Number(r.points || 0),
      }));

    const honorsRules = rows
      .filter((r) => r.rule_type === "gpa_classification" && r.program_mode === "honors")
      .map((r) => ({
        title: r.label,
        min: Number(r.min_value),
        max: Number(r.max_value),
      }));

    const generalRules = rows
      .filter((r) => r.rule_type === "gpa_classification" && r.program_mode === "general")
      .map((r) => ({
        title: r.label,
        min: Number(r.min_value),
        max: Number(r.max_value),
      }));

    //  settings row
    const settingsRow = rows.find((r) => r.rule_type === "gpa_settings");

    // Defaults
    let gpaSettings = {
      term_calc_mode: "courses",
      cumulative_calc_mode: "weighted_avg",
      gpa_max: 4.0,

      total_mark: 100,
      final_exam_max: 60,
      coursework_max: 40,
      rounding_decimals: 2,
    };

    if (settingsRow) {
      // 1) الأعمدة (لو موجودة)
      if (settingsRow.term_calc_mode) gpaSettings.term_calc_mode = settingsRow.term_calc_mode;
      if (settingsRow.cumulative_calc_mode) gpaSettings.cumulative_calc_mode = settingsRow.cumulative_calc_mode;
      if (settingsRow.gpa_max != null) gpaSettings.gpa_max = Number(settingsRow.gpa_max);

      // 2) JSON داخل label للإضافات
      if (settingsRow.label) {
        try {
          const parsed = JSON.parse(settingsRow.label);
          gpaSettings.total_mark = Number(parsed?.total_mark ?? gpaSettings.total_mark);
          gpaSettings.final_exam_max = Number(parsed?.final_exam_max ?? gpaSettings.final_exam_max);
          gpaSettings.coursework_max = Number(parsed?.coursework_max ?? gpaSettings.coursework_max);
          gpaSettings.rounding_decimals = Number(parsed?.rounding_decimals ?? gpaSettings.rounding_decimals);
        } catch (e) {
          // ignore
        }
      }
    }

    return res.json({ gradeScale, honorsRules, generalRules, gpaSettings });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Database error" });
  }
});


app.put("/api/grading-rules", async (req, res) => {
  const facultyId = Number(req.query.faculty_id);
  if (!facultyId) return res.status(400).json({ error: "faculty_id مطلوب" });

  const { gradeScale, honorsRules, generalRules, gpaSettings } = req.body;

  if (!Array.isArray(gradeScale) || !Array.isArray(honorsRules) || !Array.isArray(generalRules)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  //  نخزن جزء في أعمدة وجزء JSON في label
  const termCalc = gpaSettings?.term_calc_mode || "courses";
  const cumCalc = gpaSettings?.cumulative_calc_mode || "weighted_avg";
  const gpaMax = Number(gpaSettings?.gpa_max ?? 4.0);

  const settingsPayload = {
    total_mark: Number(gpaSettings?.total_mark ?? 100),
    final_exam_max: Number(gpaSettings?.final_exam_max ?? 60),
    coursework_max: Number(gpaSettings?.coursework_max ?? 40),
    rounding_decimals: Number(gpaSettings?.rounding_decimals ?? 2),
  };

  //  Validation
  const sumParts = (settingsPayload.final_exam_max || 0) + (settingsPayload.coursework_max || 0);
  if (sumParts !== settingsPayload.total_mark) {
    return res.status(400).json({
      error: `لازم مجموع (final_exam_max + coursework_max) = total_mark (${settingsPayload.total_mark})`,
    });
  }

  const conn = await dbp.getConnection();
  try {
    await conn.beginTransaction();

    // امسح كل قواعد الكلية القديمة
    await conn.query("DELETE FROM grading_rules WHERE faculty_id = ?", [facultyId]);

    // 1) settings row (الأعمدة + JSON داخل label)
    await conn.query(
      `INSERT INTO grading_rules
        (faculty_id, rule_type, program_mode, label, min_value, max_value, points,
         term_calc_mode, cumulative_calc_mode, gpa_max,
         sort_order, created_at, updated_at)
       VALUES (?, 'gpa_settings', NULL, ?, 0, 0, NULL,
               ?, ?, ?,
               0, NOW(), NOW())`,
      [facultyId, JSON.stringify(settingsPayload), termCalc, cumCalc, gpaMax]
    );

    // 2) grade_scale
    for (let i = 0; i < gradeScale.length; i++) {
      const r = gradeScale[i];
      await conn.query(
        `INSERT INTO grading_rules
          (faculty_id, rule_type, program_mode, label, min_value, max_value, points, sort_order, created_at, updated_at)
         VALUES (?, 'grade_scale', NULL, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          facultyId,
          r.letter || "",
          Number(r.min) || 0,
          Number(r.max) || 0,
          Number(r.points) || 0,
          i + 1,
        ]
      );
    }

    // 3) honors
    for (let i = 0; i < honorsRules.length; i++) {
      const r = honorsRules[i];
      await conn.query(
        `INSERT INTO grading_rules
          (faculty_id, rule_type, program_mode, label, min_value, max_value, points, sort_order, created_at, updated_at)
         VALUES (?, 'gpa_classification', 'honors', ?, ?, ?, NULL, ?, NOW(), NOW())`,
        [facultyId, r.title || "", Number(r.min) || 0, Number(r.max) || 0, i + 1]
      );
    }

    // 4) general
    for (let i = 0; i < generalRules.length; i++) {
      const r = generalRules[i];
      await conn.query(
        `INSERT INTO grading_rules
          (faculty_id, rule_type, program_mode, label, min_value, max_value, points, sort_order, created_at, updated_at)
         VALUES (?, 'gpa_classification', 'general', ?, ?, ?, NULL, ?, NOW(), NOW())`,
        [facultyId, r.title || "", Number(r.min) || 0, Number(r.max) || 0, i + 1]
      );
    }

    await conn.commit();
    return res.json({ message: "تم حفظ قواعد التصنيف + إعدادات الحساب للكلية" });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return res.status(500).json({ error: "Database error" });
  } finally {
    conn.release();
  }
});


app.get("/api/courses", async (req, res) => {
  try {
    const facultyId = Number(req.query.faculty_id);
    const departmentId = Number(req.query.department_id);
    const academicYear = (req.query.academic_year || "").trim();
    const levelName = (req.query.level_name || "").trim();
    const termName = (req.query.term_name || "").trim();

    
    const programType = (req.query.program_type || "undergraduate").trim(); // undergraduate | postgraduate
    const pgProgramRaw = (req.query.postgraduate_program || "").trim();
    const pgProgram = programType === "postgraduate" ? (pgProgramRaw || null) : null;

    if (!facultyId || !departmentId || !academicYear || !levelName || !termName) {
      return res.status(400).json({
        error:
          "faculty_id + department_id + academic_year + level_name + term_name مطلوبة",
      });
    }

    //  Validation للدراسات العليا
    if (programType === "postgraduate" && !pgProgram) {
      return res.status(400).json({ error: "postgraduate_program مطلوب للدراسات العليا" });
    }

    const [rows] = await dbp.query(
      `
      SELECT
        id, faculty_id, department_id,
        academic_year, level_name, term_name,
        program_type, postgraduate_program,
        course_name, instructor, credit_hours,
        total_mark, coursework_max, final_exam_max
      FROM courses
      WHERE faculty_id = ?
        AND department_id = ?
        AND academic_year = ?
        AND level_name = ?
        AND term_name = ?
        AND program_type = ?
        AND (postgraduate_program <=> ?)
      ORDER BY course_name
      `,
      [facultyId, departmentId, academicYear, levelName, termName, programType, pgProgram]
    );

    return res.json(rows);
  } catch (e) {
    console.error("LIST COURSES ERROR:", e);
    return res.status(500).json({ error: "Database error" });
  }
});



app.post("/api/courses", async (req, res) => {
  try {
    const {
      faculty_id,
      department_id,
      academic_year,
      level_name,
      term_name,
      course_name,
      instructor,
      credit_hours,
      total_mark,
      coursework_max,
      final_exam_max,


      program_type,
      postgraduate_program,
    } = req.body;

    const facultyId = Number(faculty_id);
    const deptId = Number(department_id);
    const year = (academic_year || "").trim();
    const level = (level_name || "").trim();
    const term = (term_name || "").trim();
    const name = (course_name || "").trim();
    const instr = (instructor || "").trim() || null;

    const programType = (program_type || "undergraduate").trim(); // undergraduate | postgraduate
    const pgProgramRaw = (postgraduate_program || "").toString().trim();
    const pgProgram = programType === "postgraduate" ? (pgProgramRaw || null) : null;

    const tm = Number(total_mark ?? 100);
    const cw = Number(coursework_max ?? 40);
    const fe = Number(final_exam_max ?? 60);

    let ch = null;
    if (credit_hours !== "" && credit_hours !== null && credit_hours !== undefined) {
      ch = Number(credit_hours);
      if (!Number.isFinite(ch) || ch <= 0)
        return res.status(400).json({ error: "عدد الساعات لازم يكون رقم > 0" });
    }

    if (!facultyId || !deptId || !year || !level || !term || !name) {
      return res.status(400).json({ error: "بيانات ناقصة" });
    }

    //  Validation للدراسات العليا
    if (programType === "postgraduate" && !pgProgram) {
      return res.status(400).json({ error: "postgraduate_program مطلوب للدراسات العليا" });
    }

    //  تحقق: أعمال السنة + الامتحان = total_mark
    if (cw + fe !== tm) {
      return res.status(400).json({ error: `لازم (أعمال السنة + الامتحان) = ${tm}` });
    }

    //  تأكد القسم تابع للكلية
    const [depRows] = await dbp.query(
      "SELECT id FROM departments WHERE id = ? AND faculty_id = ? LIMIT 1",
      [deptId, facultyId]
    );
    if (depRows.length === 0) {
      return res.status(400).json({ error: "القسم لا يتبع لهذه الكلية" });
    }

    const [result] = await dbp.query(
      `
      INSERT INTO courses
      (
        faculty_id, department_id,
        academic_year, level_name, term_name,
        program_type, postgraduate_program,
        course_name, instructor, credit_hours,
        total_mark, coursework_max, final_exam_max
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        facultyId,
        deptId,
        year,
        level,
        term,
        programType,
        pgProgram,
        name,
        instr,
        ch,
        tm,
        cw,
        fe,
      ]
    );

    return res.json({ message: "تمت إضافة المادة", id: result.insertId });
  } catch (e) {
    console.error("ADD COURSE ERROR:", e);

    // ملاحظة: ER_DUP_ENTRY ما حيحصل إلا لو عامل UNIQUE في DB
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "المادة موجودة مسبقاً لنفس السنة/المستوى/الفصل/البرنامج",
      });
    }
    return res.status(500).json({ error: "Database error" });
  }
});



app.put("/api/courses/:id", async (req, res) => {
  try {
    const courseId = Number(req.params.id);

    const {
      faculty_id,
      department_id,
      academic_year,
      level_name,
      term_name,
      course_name,
      instructor,
      credit_hours,
      total_mark,
      coursework_max,
      final_exam_max,

      program_type,
      postgraduate_program,
    } = req.body;

    const facultyId = Number(faculty_id);
    const deptId = Number(department_id);
    const year = (academic_year || "").trim();
    const level = (level_name || "").trim();
    const term = (term_name || "").trim();
    const name = (course_name || "").trim();
    const instr = (instructor || "").trim() || null;

    const programType = (program_type || "undergraduate").trim();
    const pgProgramRaw = (postgraduate_program || "").toString().trim();
    const pgProgram = programType === "postgraduate" ? (pgProgramRaw || null) : null;

    const tm = Number(total_mark ?? 100);
    const cw = Number(coursework_max ?? 40);
    const fe = Number(final_exam_max ?? 60);

    let ch = null;
    if (credit_hours !== "" && credit_hours !== null && credit_hours !== undefined) {
      ch = Number(credit_hours);
      if (!Number.isFinite(ch) || ch <= 0) {
        return res.status(400).json({ error: "عدد الساعات لازم يكون رقم > 0" });
      }
    }

    if (!courseId || !facultyId || !deptId || !year || !level || !term || !name) {
      return res.status(400).json({ error: "بيانات ناقصة" });
    }

    //  Validation للدراسات العليا
    if (programType === "postgraduate" && !pgProgram) {
      return res.status(400).json({ error: "postgraduate_program مطلوب للدراسات العليا" });
    }

    if (cw + fe !== tm) {
      return res.status(400).json({ error: `لازم (أعمال السنة + الامتحان) = ${tm}` });
    }

    const [result] = await dbp.query(
      `
      UPDATE courses
      SET
        faculty_id = ?, department_id = ?,
        academic_year = ?, level_name = ?, term_name = ?,
        program_type = ?, postgraduate_program = ?,
        course_name = ?, instructor = ?, credit_hours = ?,
        total_mark = ?, coursework_max = ?, final_exam_max = ?
      WHERE id = ?
      `,
      [
        facultyId,
        deptId,
        year,
        level,
        term,
        programType,
        pgProgram,
        name,
        instr,
        ch,
        tm,
        cw,
        fe,
        courseId,
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "المادة غير موجودة" });

    return res.json({ message: "تم تعديل المادة" });
  } catch (e) {
    console.error("UPDATE COURSE ERROR:", e);

    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "المادة موجودة مسبقاً لنفس السنة/المستوى/الفصل/البرنامج",
      });
    }
    return res.status(500).json({ error: "Database error" });
  }
});



app.delete("/api/courses/:id", async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const [result] = await dbp.query("DELETE FROM courses WHERE id = ?", [courseId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "المادة غير موجودة" });
    return res.json({ message: "تم حذف المادة" });
  } catch (e) {
    console.error("DELETE COURSE ERROR:", e);
    return res.status(500).json({ error: "Database error" });
  }
});



/* =========================================================
   📅 Academic Periods (Smart List)
   ========================================================= */

// جلب كل الفترات (ممكن نفلتر بالبرنامج)
app.get("/api/academic-periods", (req, res) => {
  const programType = (req.query.program_type || "undergraduate").trim();
  const pgProgram = (req.query.postgraduate_program || "").trim();

  let sql = `
    SELECT id, academic_year, level_name, term_name, program_type, postgraduate_program
    FROM academic_periods
    WHERE program_type = ?
  `;
  const params = [programType];

  if (programType === "postgraduate" && pgProgram) {
    sql += " AND postgraduate_program = ? ";
    params.push(pgProgram);
  }

  sql += " ORDER BY academic_year DESC, level_name, term_name";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.log("MYSQL ERROR (list academic_periods):", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// Ensure (لو ما موجودة يضيفها – لو موجودة ما يكرر)
app.post("/api/academic-periods/ensure", (req, res) => {
  const { academic_year, level_name, term_name, program_type, postgraduate_program } = req.body;

  const year = (academic_year || "").toString().trim();
  const level = (level_name || "").toString().trim();
  const term = (term_name || "").toString().trim();

  const programType = (program_type || "undergraduate").toString().trim();
  const pgProgram = (postgraduate_program || "").toString().trim() || null;

  if (!year || !level || !term) {
    return res.status(400).json({ error: "academic_year + level_name + term_name مطلوبة" });
  }
  if (programType === "postgraduate" && !pgProgram) {
    return res.status(400).json({ error: "postgraduate_program مطلوب للدراسات العليا" });
  }

  const sql = `
    INSERT INTO academic_periods (academic_year, level_name, term_name, program_type, postgraduate_program)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE id = id
  `;

  db.query(
    sql,
    [year, level, term, programType, programType === "postgraduate" ? pgProgram : null],
    (err, result) => {
      if (err) {
        console.log("MYSQL ERROR (ensure academic_periods):", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "ok" });
    }
  );
});


///////////الدرجات///////////
app.get("/api/grade-entry/students", async (req, res) => {
  try {
    const courseId = Number(req.query.course_id);
    if (!courseId) return res.status(400).json({ error: "course_id مطلوب" });

    // 1) معلومات المادة
    const [courseRows] = await dbp.query(
      `SELECT id, faculty_id, department_id, academic_year, level_name, term_name,
              program_type, postgraduate_program,
              course_name, instructor, credit_hours, total_mark, coursework_max, final_exam_max
       FROM courses
       WHERE id = ? LIMIT 1`,
      [courseId]
    );
    if (courseRows.length === 0) return res.status(404).json({ error: "المادة غير موجودة" });

    const course = courseRows[0];

    // === Normalizers داخل SQL ===
    // normalize level: يوحد "المستوي" و "المستوى" + يشيل المسافات
    const levelNormSql = (col) =>
      `REPLACE(REPLACE(${col}, 'المستوي', 'المستوى'), ' ', '')`;

    // normalize term: يوحد الفصل/فصل + الأول/أول + يشيل المسافات
    const termNormSql = (col) => `
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(REPLACE(${col}, ' ', ''), 'الفصل', 'فصل'),
                    'الأول','أول'),
                  'الاول','أول'),
                'الثاني','ثاني'),
              'الثانى','ثاني'),
            'الثالث','ثالث'),
          'الرابع','رابع'),
        'الخامس','خامس'),
      'السادس','سادس')
    `;

    // 2) الطلاب: كل المسجلين في نفس (year + level + term + program) + نفس القسم
    const [students] = await dbp.query(
      `
      SELECT
        s.id AS student_id,
        s.full_name,
        s.university_id,

        cg.coursework_mark,
        cg.final_exam_mark,
        cg.total_mark,
        cg.letter,
        cg.points

      FROM students s

      JOIN (
        SELECT sr.*
        FROM student_registrations sr
        JOIN (
          SELECT student_id, MAX(id) AS max_id
          FROM student_registrations
          WHERE academic_year = ?
            AND ${levelNormSql("level_name")} = ${levelNormSql("?")}
            AND ${termNormSql("term_name")} = ${termNormSql("?")}
            AND program_type = ?
            AND (postgraduate_program <=> ?)
            AND registration_status = 'مسجّل'
          GROUP BY student_id
        ) x ON x.max_id = sr.id
      ) r ON r.student_id = s.id

      LEFT JOIN course_grades cg
        ON cg.student_id = s.id AND cg.course_id = ?

      WHERE s.department_id = ?
      ORDER BY s.full_name
      `,
      [
        course.academic_year,
        course.level_name,
        course.term_name,
        course.program_type,
        course.postgraduate_program,
        courseId,
        course.department_id,
      ]
    );

    return res.json({ course, students });
  } catch (e) {
    console.error("GRADE ENTRY STUDENTS ERROR:", e);
    return res.status(500).json({ error: "Database error" });
  }
});



function calcLetterAndPoints(total, gradeScale) {
  // gradeScale: [{letter,min,max,points}]
  const t = Number(total);
  if (!Number.isFinite(t)) return { letter: null, points: null };

  const row = gradeScale.find(r => t >= Number(r.min) && t <= Number(r.max));
  if (!row) return { letter: null, points: null };

  return { letter: row.letter, points: Number(row.points ?? 0) };
}

app.post("/api/grade-entry/save", async (req, res) => {
  const { course_id, grades } = req.body;

  const courseId = Number(course_id);
  if (!courseId) return res.status(400).json({ error: "course_id مطلوب" });
  if (!Array.isArray(grades) || grades.length === 0) {
    return res.status(400).json({ error: "grades مطلوبة" });
  }

  const conn = await dbp.getConnection();
  try {
    await conn.beginTransaction();

    // 1) المادة
    const [courseRows] = await conn.query(
      `SELECT id, faculty_id, coursework_max, final_exam_max
       FROM courses WHERE id = ? LIMIT 1`,
      [courseId]
    );
    if (courseRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "المادة غير موجودة" });
    }
    const course = courseRows[0];

    // 2) grade scale بتاع الكلية
    const [ruleRows] = await conn.query(
      `SELECT label, min_value, max_value, points
       FROM grading_rules
       WHERE faculty_id = ?
         AND rule_type = 'grade_scale'
       ORDER BY sort_order, id`,
      [course.faculty_id]
    );

    const gradeScale = ruleRows.map(r => ({
      letter: r.label,
      min: Number(r.min_value),
      max: Number(r.max_value),
      points: Number(r.points ?? 0),
    }));

    // 3) upsert درجات
    for (const g of grades) {
      const studentId = Number(g.student_id);
      if (!studentId) continue;

      const cw = g.coursework_mark === "" || g.coursework_mark === null || g.coursework_mark === undefined
        ? null
        : Number(g.coursework_mark);

      const fe = g.final_exam_mark === "" || g.final_exam_mark === null || g.final_exam_mark === undefined
        ? null
        : Number(g.final_exam_mark);

      if (cw != null && (cw < 0 || cw > Number(course.coursework_max))) {
        await conn.rollback();
        return res.status(400).json({ error: `أعمال السنة خارج الحد (${course.coursework_max})` });
      }

      if (fe != null && (fe < 0 || fe > Number(course.final_exam_max))) {
        await conn.rollback();
        return res.status(400).json({ error: `النهائي خارج الحد (${course.final_exam_max})` });
      }

      const total = (cw ?? 0) + (fe ?? 0);
      const { letter, points } = calcLetterAndPoints(total, gradeScale);

      await conn.query(
        `
        INSERT INTO course_grades
          (course_id, student_id, coursework_mark, final_exam_mark, total_mark, letter, points)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          coursework_mark = VALUES(coursework_mark),
          final_exam_mark = VALUES(final_exam_mark),
          total_mark = VALUES(total_mark),
          letter = VALUES(letter),
          points = VALUES(points),
          updated_at = NOW()
        `,
        [courseId, studentId, cw, fe, total, letter, points]
      );
    }

    await conn.commit();
    return res.json({ message: "تم حفظ الدرجات بنجاح" });
  } catch (e) {
    await conn.rollback();
    console.error("GRADE ENTRY SAVE ERROR:", e);
    return res.status(500).json({ error: "Database error" });
  } finally {
    conn.release();
  }
});


/* =========================================================
    Grade Entry + Results (Term GPA / Cumulative GPA)
   ========================================================= */

function normSqlField(fieldName) {
  // يزيل المسافات و"ال" لتخفيف مشكلة اختلاف (فصل أول) vs (الفصل الأول)
  // مثال: "الفصل الأول" -> "فصلأول"
  return `REPLACE(REPLACE(${fieldName}, ' ', ''), 'ال', '')`;
}

async function getCourseById(courseId) {
  const [rows] = await dbp.query(
    `SELECT id, faculty_id, department_id, academic_year, level_name, term_name,
            program_type, postgraduate_program,
            total_mark, coursework_max, final_exam_max, credit_hours, instructor, course_name
     FROM courses
     WHERE id = ?
     LIMIT 1`,
    [courseId]
  );
  return rows[0] || null;
}

async function getFacultyRules(facultyId) {
  const [rows] = await dbp.query(
    `SELECT rule_type, program_mode, label, min_value, max_value, points,
            term_calc_mode, cumulative_calc_mode, gpa_max
     FROM grading_rules
     WHERE faculty_id = ?
     ORDER BY sort_order, id`,
    [facultyId]
  );

  const gradeScale = rows
    .filter(r => r.rule_type === "grade_scale")
    .map(r => ({
      letter: r.label,
      min: Number(r.min_value),
      max: Number(r.max_value),
      points: Number(r.points || 0),
    }));

  const settingsRow = rows.find(r => r.rule_type === "gpa_settings");
  let gpaSettings = {
    term_calc_mode: "courses",
    cumulative_calc_mode: "weighted_avg",
    gpa_max: 4.0,
    total_mark: 100,
    final_exam_max: 60,
    coursework_max: 40,
    rounding_decimals: 2,
  };

  if (settingsRow) {
    if (settingsRow.term_calc_mode) gpaSettings.term_calc_mode = settingsRow.term_calc_mode;
    if (settingsRow.cumulative_calc_mode) gpaSettings.cumulative_calc_mode = settingsRow.cumulative_calc_mode;
    if (settingsRow.gpa_max != null) gpaSettings.gpa_max = Number(settingsRow.gpa_max);

    if (settingsRow.label) {
      try {
        const parsed = JSON.parse(settingsRow.label);
        gpaSettings.total_mark = Number(parsed?.total_mark ?? gpaSettings.total_mark);
        gpaSettings.final_exam_max = Number(parsed?.final_exam_max ?? gpaSettings.final_exam_max);
        gpaSettings.coursework_max = Number(parsed?.coursework_max ?? gpaSettings.coursework_max);
        gpaSettings.rounding_decimals = Number(parsed?.rounding_decimals ?? gpaSettings.rounding_decimals);
      } catch {}
    }
  }

  return { gradeScale, gpaSettings };
}

function pickLetterAndPoints(percentage, gradeScale) {
  // اختار الصف المطابق (inclusive)
  const p = Number(percentage);
  const row = gradeScale.find(r => p >= r.min && p <= r.max);
  if (!row) return { letter: null, points: null };
  return { letter: row.letter, points: row.points };
}

function roundTo(n, decimals) {
  const d = Number(decimals ?? 2);
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  const f = Math.pow(10, d);
  return Math.round(x * f) / f;
}

/* -------------------------
   1) GET students for course
   ------------------------- */
// app.get("/api/grade-entry/students", async (req, res) => {
//   try {
//     const courseId = Number(req.query.course_id);
//     if (!courseId) return res.status(400).json({ error: "course_id مطلوب" });

//     const course = await getCourseById(courseId);
//     if (!course) return res.status(404).json({ error: "المادة غير موجودة" });

//     const params = [
//       course.department_id,
//       course.academic_year,
//       course.level_name,
//       course.term_name,
//       course.program_type,
//       course.postgraduate_program || null,
//       course.term_name,
//       course.level_name,
//       courseId,
//     ];

//     const [students] = await dbp.query(
//       `
//       SELECT
//         s.id AS student_id,
//         s.full_name,
//         s.university_id,

//         cg.coursework_mark,
//         cg.final_exam_mark,
//         cg.total_mark,
//         cg.letter,
//         cg.points
//       FROM students s
//       INNER JOIN student_registrations sr
//         ON sr.student_id = s.id
//       WHERE
//         s.department_id = ?
//         AND sr.academic_year = ?
//         AND ${normSqlField("sr.level_name")} = ${normSqlField("?")}
//         AND ${normSqlField("sr.term_name")}  = ${normSqlField("?")}
//         AND sr.program_type = ?
//         AND (sr.postgraduate_program <=> ?)

//       LEFT JOIN course_grades cg
//         ON cg.student_id = s.id AND cg.course_id = ?

//       ORDER BY s.full_name
//       `,
//       params
//     );

//     return res.json({ course, students });
//   } catch (e) {
//     console.error("GRADE ENTRY STUDENTS ERROR:", e);
//     return res.status(500).json({ error: "Database error" });
//   }
// });

/* -------------------------
   2) POST save grades (upsert)
   ------------------------- */
// app.post("/api/grade-entry/save", async (req, res) => {
//   const { course_id, grades } = req.body;

//   const courseId = Number(course_id);
//   if (!courseId) return res.status(400).json({ error: "course_id مطلوب" });
//   if (!Array.isArray(grades)) return res.status(400).json({ error: "grades لازم تكون Array" });

//   const course = await getCourseById(courseId);
//   if (!course) return res.status(404).json({ error: "المادة غير موجودة" });

//   const { gradeScale, gpaSettings } = await getFacultyRules(course.faculty_id);

//   const conn = await dbp.getConnection();
//   try {
//     await conn.beginTransaction();

//     for (const g of grades) {
//       const studentId = Number(g.student_id);
//       if (!studentId) continue;

//       const cw = (g.coursework_mark === "" || g.coursework_mark == null) ? null : Number(g.coursework_mark);
//       const fe = (g.final_exam_mark === "" || g.final_exam_mark == null) ? null : Number(g.final_exam_mark);

//       // لو واحدة ناقصة نخزنها NULL ونخلي total/letter/points NULL
//       let total = null;
//       let letter = null;
//       let points = null;

//       if (cw != null || fe != null) {
//         const cwN = cw ?? 0;
//         const feN = fe ?? 0;

//         // Validation max
//         if (cw != null && cwN > Number(course.coursework_max ?? gpaSettings.coursework_max ?? 40)) {
//           throw new Error(`أعمال السنة أكبر من المسموح للطالب ${studentId}`);
//         }
//         if (fe != null && feN > Number(course.final_exam_max ?? gpaSettings.final_exam_max ?? 60)) {
//           throw new Error(`النهائي أكبر من المسموح للطالب ${studentId}`);
//         }

//         if (cw != null && fe != null) {
//           total = cwN + feN;

//           // percentage على 100
//           const base = Number(course.total_mark ?? 100) || 100;
//           const perc = (total / base) * 100;

//           const picked = pickLetterAndPoints(perc, gradeScale);
//           letter = picked.letter;
//           points = picked.points;
//         }
//       }

//       await conn.query(
//         `
//         INSERT INTO course_grades
//           (course_id, student_id, coursework_mark, final_exam_mark, total_mark, letter, points, updated_at)
//         VALUES
//           (?, ?, ?, ?, ?, ?, ?, NOW())
//         ON DUPLICATE KEY UPDATE
//           coursework_mark = VALUES(coursework_mark),
//           final_exam_mark = VALUES(final_exam_mark),
//           total_mark = VALUES(total_mark),
//           letter = VALUES(letter),
//           points = VALUES(points),
//           updated_at = NOW()
//         `,
//         [courseId, studentId, cw, fe, total, letter, points]
//       );
//     }

//     await conn.commit();
//     return res.json({ message: "تم حفظ الدرجات" });
//   } catch (e) {
//     await conn.rollback();
//     console.error("SAVE GRADES ERROR:", e);
//     return res.status(400).json({ error: e.message || "فشل حفظ الدرجات" });
//   } finally {
//     conn.release();
//   }
// });

/* -------------------------
   3) GET term status (هل كل الدرجات مكتملة؟)
   ------------------------- */
app.get("/api/results/term-status", async (req, res) => {
  try {
    const facultyId = Number(req.query.faculty_id);
    const deptId = Number(req.query.department_id);
    const academicYear = (req.query.academic_year || "").trim();
    const levelName = (req.query.level_name || "").trim();
    const termName = (req.query.term_name || "").trim();

    const programType = (req.query.program_type || "undergraduate").trim();
    const pgProgramRaw = (req.query.postgraduate_program || "").trim();
    const pgProgram = programType === "postgraduate" ? (pgProgramRaw || null) : null;

    if (!facultyId || !deptId || !academicYear || !levelName || !termName) {
      return res.status(400).json({ error: "بيانات ناقصة" });
    }
    if (programType === "postgraduate" && !pgProgram) {
      return res.status(400).json({ error: "postgraduate_program مطلوب للدراسات العليا" });
    }

    // courses in term
    const [courses] = await dbp.query(
      `
      SELECT id, course_name, credit_hours
      FROM courses
      WHERE faculty_id = ?
        AND department_id = ?
        AND academic_year = ?
        AND level_name = ?
        AND term_name = ?
        AND program_type = ?
        AND (postgraduate_program <=> ?)
      ORDER BY course_name
      `,
      [facultyId, deptId, academicYear, levelName, termName, programType, pgProgram]
    );

    // students in term
    const [students] = await dbp.query(
      `
      SELECT DISTINCT s.id AS student_id, s.full_name
      FROM students s
      INNER JOIN student_registrations sr ON sr.student_id = s.id
      WHERE s.department_id = ?
        AND sr.academic_year = ?
        AND ${normSqlField("sr.level_name")} = ${normSqlField("?")}
        AND ${normSqlField("sr.term_name")}  = ${normSqlField("?")}
        AND sr.program_type = ?
        AND (sr.postgraduate_program <=> ?)
      `,
      [deptId, academicYear, levelName, termName, programType, pgProgram]
    );

    const totalStudents = students.length;

    // per course: how many completed grades?
    const status = [];
    for (const c of courses) {
      const [rows] = await dbp.query(
        `
        SELECT COUNT(*) AS done
        FROM course_grades
        WHERE course_id = ?
          AND total_mark IS NOT NULL
        `,
        [c.id]
      );
      const done = Number(rows?.[0]?.done || 0);
      const missing = Math.max(0, totalStudents - done);

      status.push({
        course_id: c.id,
        course_name: c.course_name,
        total_students: totalStudents,
        done,
        missing,
        completed: missing === 0 && totalStudents > 0,
      });
    }

    const allCompleted = status.length > 0 && status.every(x => x.completed);

    return res.json({ total_students: totalStudents, courses: status, allCompleted });
  } catch (e) {
    console.error("TERM STATUS ERROR:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

/* -------------------------
   4) GET calculate results (Term GPA + Cumulative GPA)
   ------------------------- */
app.get("/api/results/calculate", async (req, res) => {
  try {
    const facultyId = Number(req.query.faculty_id);
    const deptId = Number(req.query.department_id);
    const academicYear = (req.query.academic_year || "").trim();
    const levelName = (req.query.level_name || "").trim();
    const termName = (req.query.term_name || "").trim();

    const programType = (req.query.program_type || "undergraduate").trim();
    const pgProgramRaw = (req.query.postgraduate_program || "").trim();
    const pgProgram = programType === "postgraduate" ? (pgProgramRaw || null) : null;

    if (!facultyId || !deptId || !academicYear || !levelName || !termName) {
      return res.status(400).json({ error: "بيانات ناقصة" });
    }
    if (programType === "postgraduate" && !pgProgram) {
      return res.status(400).json({ error: "postgraduate_program مطلوب للدراسات العليا" });
    }

    const { gpaSettings } = await getFacultyRules(facultyId);

    // courses in term
    const [courses] = await dbp.query(
      `
      SELECT id, course_name, credit_hours
      FROM courses
      WHERE faculty_id = ?
        AND department_id = ?
        AND academic_year = ?
        AND level_name = ?
        AND term_name = ?
        AND program_type = ?
        AND (postgraduate_program <=> ?)
      ORDER BY course_name
      `,
      [facultyId, deptId, academicYear, levelName, termName, programType, pgProgram]
    );

    // students in term
    const [students] = await dbp.query(
      `
      SELECT DISTINCT s.id AS student_id, s.full_name, s.university_id
      FROM students s
      INNER JOIN student_registrations sr ON sr.student_id = s.id
      WHERE s.department_id = ?
        AND sr.academic_year = ?
        AND ${normSqlField("sr.level_name")} = ${normSqlField("?")}
        AND ${normSqlField("sr.term_name")}  = ${normSqlField("?")}
        AND sr.program_type = ?
        AND (sr.postgraduate_program <=> ?)
      ORDER BY s.full_name
      `,
      [deptId, academicYear, levelName, termName, programType, pgProgram]
    );

    // build map: course credit hours
    const courseHours = new Map();
    courses.forEach(c => courseHours.set(c.id, Number(c.credit_hours || 0)));

    // term grades for all students (only this term courses)
    const [termGrades] = await dbp.query(
      `
      SELECT cg.student_id, cg.course_id, cg.points
      FROM course_grades cg
      INNER JOIN courses c ON c.id = cg.course_id
      WHERE c.faculty_id = ?
        AND c.department_id = ?
        AND c.academic_year = ?
        AND c.level_name = ?
        AND c.term_name = ?
        AND c.program_type = ?
        AND (c.postgraduate_program <=> ?)
      `,
      [facultyId, deptId, academicYear, levelName, termName, programType, pgProgram]
    );

    // cumulative grades for student (كل الفصول)
    const [allGrades] = await dbp.query(
      `
      SELECT cg.student_id, cg.course_id, cg.points, c.credit_hours
      FROM course_grades cg
      INNER JOIN courses c ON c.id = cg.course_id
      WHERE c.faculty_id = ?
        AND c.program_type = ?
        AND (c.postgraduate_program <=> ?)
        AND cg.points IS NOT NULL
      `,
      [facultyId, programType, pgProgram]
    );

    // group term grades by student
    const termByStudent = new Map();
    for (const g of termGrades) {
      if (!termByStudent.has(g.student_id)) termByStudent.set(g.student_id, []);
      termByStudent.get(g.student_id).push(g);
    }

    // group all grades by student
    const allByStudent = new Map();
    for (const g of allGrades) {
      if (!allByStudent.has(g.student_id)) allByStudent.set(g.student_id, []);
      allByStudent.get(g.student_id).push(g);
    }

    // helper compute GPA
    function computeGpaFromItems(items, mode, rounding) {
      if (!items || items.length === 0) return null;

      if (mode === "simple_avg") {
        const pts = items.map(x => Number(x.points)).filter(Number.isFinite);
        if (pts.length === 0) return null;
        const avg = pts.reduce((a, b) => a + b, 0) / pts.length;
        return roundTo(avg, rounding);
      }

      // weighted_avg
      let q = 0;
      let h = 0;
      for (const it of items) {
        const p = Number(it.points);
        const hours = Number(it.credit_hours ?? 0);
        if (!Number.isFinite(p) || !Number.isFinite(hours) || hours <= 0) continue;
        q += p * hours;
        h += hours;
      }
      if (h <= 0) return null;
      return roundTo(q / h, rounding);
    }

    const rounding = Number(gpaSettings.rounding_decimals ?? 2);

    const results = students.map(st => {
      const termItemsRaw = termByStudent.get(st.student_id) || [];

      // term items need credit_hours from course map
      const termItems = termItemsRaw.map(x => ({
        points: x.points,
        credit_hours: courseHours.get(x.course_id) || 0,
      }));

      const expectedCourses = courses.length;
      const completedCourses = termItemsRaw.filter(x => x.points != null).length;
      const termComplete = expectedCourses > 0 && completedCourses === expectedCourses;

      const termGpa = termComplete
        ? computeGpaFromItems(termItems, "weighted_avg", rounding)
        : null;

      const allItems = (allByStudent.get(st.student_id) || []).map(x => ({
        points: x.points,
        credit_hours: x.credit_hours,
      }));

      const cumulativeGpa = computeGpaFromItems(allItems, gpaSettings.cumulative_calc_mode, rounding);

      return {
        student_id: st.student_id,
        full_name: st.full_name,
        university_id: st.university_id,
        term_complete: termComplete,
        term_gpa: termGpa,
        cumulative_gpa: cumulativeGpa,
      };
    });

    return res.json({
      courses_count: courses.length,
      students_count: students.length,
      results,
      gpa_settings: gpaSettings,
    });
  } catch (e) {
    console.error("CALC RESULTS ERROR:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

/* =========================================================
    Term Results (Calculate + Save)
   ========================================================= */

function normalizeTermNameVariants(termName) {
  const t0 = (termName || "").trim();
  if (!t0) return [];

  const variants = new Set();
  const add = (x) => { if (x && x.trim()) variants.add(x.trim()); };

  add(t0);

  // فصل/الفصل
  add(t0.replace("الفصل", "فصل"));
  add(t0.replace("فصل", "الفصل"));

  // أول/الأول - ثاني/الثاني - ثالث/الثالث ... (الأكثر شيوعاً)
  const swaps = [
    ["الأول", "أول"], ["أول", "الأول"],
    ["الاول", "أول"], // لو مكتوبة بدون همزة
    ["الثاني", "ثاني"], ["ثاني", "الثاني"],
    ["الثانى", "ثاني"],
    ["الثالث", "ثالث"], ["ثالث", "الثالث"],
    ["الرابع", "رابع"], ["رابع", "الرابع"],
    ["الخامس", "خامس"], ["خامس", "الخامس"],
    ["السادس", "سادس"], ["سادس", "السادس"],
  ];

  for (const [a, b] of swaps) {
    for (const v of Array.from(variants)) {
      if (v.includes(a)) add(v.replace(a, b));
    }
  }

  // لو بدون "فصل"
  for (const v of Array.from(variants)) {
    if (!v.includes("فصل") && !v.includes("الفصل")) {
      add("فصل " + v);
      add("الفصل " + v);
    }
  }

  return Array.from(variants);
}


async function getFacultyRules(conn, facultyId) {
  const [settingsRows] = await conn.query(
    `SELECT label, term_calc_mode, gpa_max, cumulative_calc_mode
     FROM grading_rules
     WHERE faculty_id = ? AND rule_type = 'gpa_settings'
     ORDER BY id DESC
     LIMIT 1`,
    [facultyId]
  );

  let rounding_decimals = 2;
  let term_calc_mode = "courses";
  let cumulative_calc_mode = "weighted_avg";
  let gpa_max = 4.0;

  if (settingsRows.length) {
    term_calc_mode = settingsRows[0].term_calc_mode || term_calc_mode;
    cumulative_calc_mode = settingsRows[0].cumulative_calc_mode || cumulative_calc_mode;
    gpa_max = Number(settingsRows[0].gpa_max || gpa_max);

    try {
      const obj = JSON.parse(settingsRows[0].label || "{}");
      if (Number.isFinite(Number(obj.rounding_decimals))) rounding_decimals = Number(obj.rounding_decimals);
    } catch {}
  }

  const [classRows] = await conn.query(
    `SELECT program_mode, label, min_value, max_value, sort_order
     FROM grading_rules
     WHERE faculty_id = ? AND rule_type = 'gpa_classification'
     ORDER BY sort_order, id`,
    [facultyId]
  );

  return { rounding_decimals, term_calc_mode, cumulative_calc_mode, gpa_max, classifications: classRows };
}

function pickClassificationLabel(gpa, programMode, classRows) {
  const g = Number(gpa);
  if (!Number.isFinite(g)) return null;

  const rows = (classRows || []).filter(r => (r.program_mode || "") === programMode);
  const found = rows.find(r => g >= Number(r.min_value) && g <= Number(r.max_value));
  return found ? found.label : null;
}

async function inferProgramMode(conn, facultyId, programType) {
  // PG دائمًا general
  if ((programType || "undergraduate").trim() === "postgraduate") return "general";

  const [rows] = await conn.query(
    `SELECT DISTINCT program_mode
     FROM grading_rules
     WHERE faculty_id = ?
       AND rule_type = 'gpa_classification'
       AND program_mode IS NOT NULL`,
    [facultyId]
  );

  const modes = rows.map(r => (r.program_mode || "").trim()).filter(Boolean);

  // لو كلية عندها Mode واحد فقط -> نستخدمه
  if (modes.length === 1) return modes[0];

  // لو عندها honors + general مع بعض -> خلي default honors (أو غيّريها general حسب نظامكم)
  if (modes.includes("honors")) return "honors";
  if (modes.includes("general")) return "general";

  // fallback
  return "honors";
}



//  GET check/preview
app.get("/api/term-results/check", async (req, res) => {
  try {
    const facultyId = Number(req.query.faculty_id);
    const departmentId = Number(req.query.department_id);
    const academicYear = (req.query.academic_year || "").trim();
    const levelName = (req.query.level_name || "").trim();
    const termName = (req.query.term_name || "").trim();
    const programType = (req.query.program_type || "undergraduate").trim();
    const pgProgram = (req.query.postgraduate_program || "").trim() || null;

    if (!facultyId || !departmentId || !academicYear || !levelName || !termName) {
      return res.status(400).json({ error: "بيانات الفترة ناقصة" });
    }
    if (programType === "postgraduate" && !pgProgram) {
      return res.status(400).json({ error: "postgraduate_program مطلوب للدراسات العليا" });
    }

    const termVariants = normalizeTermNameVariants(termName);

    // 1) مواد الفصل
    const [courses] = await dbp.query(
      `
      SELECT id, course_name, credit_hours
      FROM courses
      WHERE faculty_id = ?
        AND department_id = ?
        AND academic_year = ?
        AND level_name = ?
        AND term_name IN (${termVariants.map(() => "?").join(",")})
        AND program_type = ?
        AND (postgraduate_program <=> ?)
      ORDER BY id
      `,
      [facultyId, departmentId, academicYear, levelName, ...termVariants, programType, pgProgram]
    );

    if (courses.length === 0) {
      return res.json({ courses: [], students: [], message: "لا توجد مواد لهذه الفترة" });
    }

    // 2) الطلاب المسجلين (آخر تسجيل لكل طالب)
    const [students] = await dbp.query(
      `
      SELECT
        s.id AS student_id,
        s.full_name,
        s.university_id
      FROM students s
      JOIN (
        SELECT sr.*
        FROM student_registrations sr
        JOIN (
          SELECT student_id, MAX(id) AS max_id
          FROM student_registrations
          WHERE academic_year = ?
            AND level_name = ?
            AND term_name IN (${termVariants.map(() => "?").join(",")})
            AND program_type = ?
            AND (postgraduate_program <=> ?)
            AND registration_status = 'مسجّل'
          GROUP BY student_id
        ) x ON x.max_id = sr.id
      ) r ON r.student_id = s.id
      WHERE s.department_id = ?
      ORDER BY s.full_name
      `,
      [academicYear, levelName, ...termVariants, programType, pgProgram, departmentId]
    );

    // 3) لكل طالب: هل عنده درجات لكل المواد؟
    const courseIds = courses.map(c => c.id);
    const results = [];

    for (const st of students) {
      const [grades] = await dbp.query(
        `
        SELECT course_id, total_mark, points
        FROM course_grades
        WHERE student_id = ?
          AND course_id IN (${courseIds.map(() => "?").join(",")})
        `,
        [st.student_id, ...courseIds]
      );

      const gradeMap = new Map(grades.map(g => [Number(g.course_id), g]));

      let completed = 0;
      let missing = 0;

      for (const c of courses) {
        const g = gradeMap.get(Number(c.id));
        // نعتبرها مكتملة إذا total_mark موجودة (مش null)
        if (g && g.total_mark !== null && g.total_mark !== undefined) completed++;
        else missing++;
      }

      results.push({
        student_id: st.student_id,
        full_name: st.full_name,
        university_id: st.university_id,
        courses_count: courses.length,
        completed_courses: completed,
        missing_courses: missing,
      });
    }

    return res.json({ courses, students: results });
  } catch (e) {
    console.error("TERM RESULTS CHECK ERROR:", e);
    return res.status(500).json({ error: "Database error" });
  }
});

//  POST calculate + save into term_results
app.post("/api/term-results/calculate-save", async (req, res) => {
  const {
    faculty_id,
    department_id,
    academic_year,
    level_name,
    term_name,
    program_type,
    postgraduate_program
  } = req.body;

  const facultyId = Number(faculty_id);
  const departmentId = Number(department_id);
  const academicYear = (academic_year || "").trim();
  const levelName = (level_name || "").trim();
  const termName = (term_name || "").trim();
 const programType = (program_type || "undergraduate").trim();
const pgProgram =
  programType === "postgraduate"
    ? ((postgraduate_program || "").trim() || null)
    : null;


  if (!facultyId || !departmentId || !academicYear || !levelName || !termName) {
    return res.status(400).json({ error: "بيانات الفترة ناقصة" });
  }
  if (programType === "postgraduate" && !pgProgram) {
    return res.status(400).json({ error: "postgraduate_program مطلوب للدراسات العليا" });
  }

  const conn = await dbp.getConnection();
  try {
    await conn.beginTransaction();

    const termVariants = normalizeTermNameVariants(termName);

    //  rules (فيها classifications + rounding)
    const rules = await getFacultyRules(conn, facultyId);
    const roundN = Number.isFinite(Number(rules.rounding_decimals)) ? Number(rules.rounding_decimals) : 2;

    //  program_mode يتحدد تلقائيًا من DB (honors/general) بدل الفرونت
    const programMode = await inferProgramMode(conn, facultyId, programType);

    // 1) مواد الفصل
    const [courses] = await conn.query(
      `
      SELECT id, course_name, credit_hours, term_name, level_name
      FROM courses
      WHERE faculty_id = ?
        AND department_id = ?
        AND academic_year = ?
        AND level_name = ?
        AND term_name IN (${termVariants.map(() => "?").join(",")})
        AND program_type = ?
        AND (postgraduate_program <=> ?)
      ORDER BY id
      `,
      [facultyId, departmentId, academicYear, levelName, ...termVariants, programType, pgProgram]
    );

    if (courses.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: "لا توجد مواد لهذه الفترة" });
    }

    //  canonical term/level من DB عشان ما نخزن بصيغ مختلفة
    const canonicalTermName = (courses[0].term_name || termName).trim();
    const canonicalLevelName = (courses[0].level_name || levelName).trim();

    const courseIds = courses.map(c => c.id);

    // 2) الطلاب المسجلين
    const [students] = await conn.query(
      `
      SELECT
        s.id AS student_id,
        s.full_name,
        s.university_id
      FROM students s
      JOIN (
        SELECT sr.*
        FROM student_registrations sr
        JOIN (
          SELECT student_id, MAX(id) AS max_id
          FROM student_registrations
          WHERE academic_year = ?
            AND level_name = ?
            AND term_name IN (${termVariants.map(() => "?").join(",")})
            AND program_type = ?
            AND (postgraduate_program <=> ?)
            AND registration_status = 'مسجّل'
          GROUP BY student_id
        ) x ON x.max_id = sr.id
      ) r ON r.student_id = s.id
      WHERE s.department_id = ?
      ORDER BY s.full_name
      `,
      [academicYear, canonicalLevelName, ...termVariants, programType, pgProgram, departmentId]
    );

    const saved = [];
    const skipped = [];

    async function calcCumulativeGpa(studentId) {
      const [rows] = await conn.query(
        `
        SELECT cg.points, c.credit_hours
        FROM course_grades cg
        JOIN courses c ON c.id = cg.course_id
        WHERE cg.student_id = ?
          AND cg.points IS NOT NULL
          AND c.credit_hours IS NOT NULL
          AND c.faculty_id = ?
          AND c.department_id = ?
          AND c.program_type = ?
          AND (c.postgraduate_program <=> ?)
        `,
        [studentId, facultyId, departmentId, programType, pgProgram]
      );

      let sumPH = 0;
      let sumH = 0;
      for (const r of rows) {
        const p = Number(r.points);
        const h = Number(r.credit_hours);
        if (!Number.isFinite(p) || !Number.isFinite(h) || h <= 0) continue;
        sumPH += p * h;
        sumH += h;
      }
      if (sumH === 0) return null;
      return Number((sumPH / sumH).toFixed(roundN));
    }

    for (const st of students) {
      const studentId = Number(st.student_id);

      const [grades] = await conn.query(
        `
        SELECT cg.course_id, cg.total_mark, cg.points, c.credit_hours
        FROM course_grades cg
        JOIN courses c ON c.id = cg.course_id
        WHERE cg.student_id = ?
          AND cg.course_id IN (${courseIds.map(() => "?").join(",")})
        `,
        [studentId, ...courseIds]
      );

      const gradeMap = new Map(grades.map(g => [Number(g.course_id), g]));

      let completed = 0;
      let missing = 0;
      let termSumPH = 0;
      let termSumH = 0;

      for (const c of courses) {
        const g = gradeMap.get(Number(c.id));
        if (!g || g.total_mark == null || g.points == null) {
          missing++;
          continue;
        }
        const p = Number(g.points);
        const h = Number(g.credit_hours ?? c.credit_hours);
        if (!Number.isFinite(p) || !Number.isFinite(h) || h <= 0) {
          missing++;
          continue;
        }
        completed++;
        termSumPH += p * h;
        termSumH += h;
      }

      const coursesCount = courses.length;

      if (missing > 0) {
        skipped.push({
          student_id: studentId,
          full_name: st.full_name,
          university_id: st.university_id,
          courses_count: coursesCount,
          completed_courses: completed,
          missing_courses: missing,
          reason: "درجات ناقصة لبعض المواد",
        });
        continue;
      }

      const termGpa = termSumH === 0 ? null : Number((termSumPH / termSumH).toFixed(roundN));
      const cumulativeGpa = await calcCumulativeGpa(studentId);

      const classificationLabel = pickClassificationLabel(termGpa, programMode, rules.classifications);

      await conn.query(
        `
        INSERT INTO term_results
          (student_id, faculty_id, department_id,
           academic_year, level_name, term_name,
           program_type, postgraduate_program, program_mode,
           term_gpa, cumulative_gpa,
           term_total_points, term_total_hours,
           classification_label,
           courses_count, completed_courses, missing_courses)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
           term_gpa = VALUES(term_gpa),
           cumulative_gpa = VALUES(cumulative_gpa),
           term_total_points = VALUES(term_total_points),
           term_total_hours = VALUES(term_total_hours),
           classification_label = VALUES(classification_label),
           courses_count = VALUES(courses_count),
           completed_courses = VALUES(completed_courses),
           missing_courses = VALUES(missing_courses),
           program_mode = VALUES(program_mode),
           updated_at = NOW()
        `,
        [
          studentId, facultyId, departmentId,
          academicYear, canonicalLevelName, canonicalTermName,
          programType, pgProgram, programMode,
          termGpa, cumulativeGpa,
          termSumPH, termSumH,
          classificationLabel,
          coursesCount, completed, missing
        ]
      );

      saved.push({
        student_id: studentId,
        full_name: st.full_name,
        university_id: st.university_id,
        term_gpa: termGpa,
        cumulative_gpa: cumulativeGpa,
        classification_label: classificationLabel,
        term_total_points: termSumPH,
        term_total_hours: termSumH,
      });
    }

    await conn.commit();
    return res.json({
      message: `تم حساب وحفظ النتائج: ${saved.length} طالب، تم تجاوز: ${skipped.length} طالب (درجات ناقصة)`,
      saved,
      skipped,
    });
  } catch (e) {
    await conn.rollback();
    console.error("TERM RESULTS CALC/SAVE ERROR:", e);
    return res.status(500).json({ error: "Database error" });
  } finally {
    conn.release();
  }
});



//  GET list saved term results (display)
app.get("/api/term-results/list", async (req, res) => {
  try {
    const facultyId = Number(req.query.faculty_id);
    const departmentId = Number(req.query.department_id);
    const academicYear = (req.query.academic_year || "").trim();
    const levelName = (req.query.level_name || "").trim();
    const termName = (req.query.term_name || "").trim();
    const programType = (req.query.program_type || "undergraduate").trim();
    const pgProgram = (req.query.postgraduate_program || "").trim() || null;

    if (!facultyId || !departmentId || !academicYear || !levelName || !termName) {
      return res.status(400).json({ error: "بيانات الفترة ناقصة" });
    }
    if (programType === "postgraduate" && !pgProgram) {
      return res.status(400).json({ error: "postgraduate_program مطلوب للدراسات العليا" });
    }

    const termVariants = normalizeTermNameVariants(termName);

    //  program_mode من DB
    const conn = await dbp.getConnection();
    const programMode = await inferProgramMode(conn, facultyId, programType);
    conn.release();

    const [rows] = await dbp.query(
      `
      SELECT
        tr.student_id,
        s.full_name,
        s.university_id,
        tr.term_gpa,
        tr.cumulative_gpa,
        tr.classification_label,
        tr.term_total_points,
        tr.term_total_hours,
        tr.courses_count,
        tr.completed_courses,
        tr.missing_courses
      FROM term_results tr
      JOIN students s ON s.id = tr.student_id
      WHERE tr.faculty_id = ?
        AND tr.department_id = ?
        AND tr.academic_year = ?
        AND tr.level_name = ?
        AND tr.term_name IN (${termVariants.map(() => "?").join(",")})
        AND tr.program_type = ?
        AND (tr.postgraduate_program <=> ?)
        AND tr.program_mode = ?
      ORDER BY s.full_name
      `,
      [facultyId, departmentId, academicYear, levelName, ...termVariants, programType, pgProgram, programMode]
    );

    return res.json(rows);
  } catch (e) {
    console.error("TERM RESULTS LIST ERROR:", e);
    return res.status(500).json({ error: "Database error" });
  }
});


app.get("/api/term-students", async (req, res) => {
  try {
    const deptId = Number(req.query.department_id);
    const academicYear = (req.query.academic_year || "").trim();
    const levelName = (req.query.level_name || "").trim();
    const termName = (req.query.term_name || "").trim();

    const programType = (req.query.program_type || "undergraduate").trim();
    const pgRaw = (req.query.postgraduate_program || "").trim();
    const pgProgram = programType === "postgraduate" ? (pgRaw || null) : null;

    if (!deptId || !academicYear || !levelName || !termName) {
      return res.status(400).json({ error: "بيانات ناقصة" });
    }
    if (programType === "postgraduate" && !pgProgram) {
      return res.status(400).json({ error: "postgraduate_program مطلوب للدراسات العليا" });
    }

    const [rows] = await dbp.query(
      `
      SELECT DISTINCT
        s.id AS student_id,
        s.full_name,
        s.university_id,
        sr.academic_status,
        sr.registration_status
      FROM students s
      INNER JOIN student_registrations sr ON sr.student_id = s.id
      WHERE s.department_id = ?
        AND sr.academic_year = ?
        AND ${normSqlField("sr.level_name")} = ${normSqlField("?")}
        AND ${normSqlField("sr.term_name")}  = ${normSqlField("?")}
        AND sr.program_type = ?
        AND (sr.postgraduate_program <=> ?)
      ORDER BY s.full_name
      `,
      [deptId, academicYear, levelName, termName, programType, pgProgram]
    );

    return res.json(rows);
  } catch (e) {
    console.error("TERM STUDENTS ERROR:", e);
    return res.status(500).json({ error: "Database error" });
  }
});


app.get("/api/courses/by-term", async (req, res) => {
  try {
    const departmentId = Number(req.query.department_id);
    const academicYear = (req.query.academic_year || "").trim();
    const levelName = (req.query.level_name || "").trim();
    const termName = (req.query.term_name || "").trim();
    const programType = (req.query.program_type || "undergraduate").trim();
    const pgProgramRaw = (req.query.postgraduate_program || "").trim();
    const pgProgram = programType === "postgraduate" ? (pgProgramRaw || null) : null;

    if (!departmentId || !academicYear || !levelName || !termName) {
      return res.status(400).json({ error: "بيانات ناقصة" });
    }

    const [rows] = await dbp.query(
      `
      SELECT
        c.id,
        c.course_name,
        c.credit_hours,
        c.total_mark,
        c.coursework_max,
        c.final_exam_max,
        c.instructor,
        c.instructor_id
      FROM courses c
      WHERE c.department_id = ?
        AND c.academic_year = ?
        AND TRIM(c.level_name) = TRIM(?)
        AND TRIM(c.term_name) = TRIM(?)
        AND c.program_type = ?
        AND (c.postgraduate_program <=> ?)
      ORDER BY c.id DESC
      `,
      [departmentId, academicYear, levelName, termName, programType, pgProgram]
    );

    res.json(rows);
  } catch (e) {
    console.error("COURSES BY TERM ERROR:", e);
    res.status(500).json({ error: "Database error" });
  }
});


app.put("/api/courses/:id/instructor", async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const staffId = req.body?.instructor_id ? Number(req.body.instructor_id) : null;

    if (!courseId) return res.status(400).json({ error: "Invalid course id" });

    // لو null -> فك الربط
    if (!staffId) {
      await dbp.query(
        "UPDATE courses SET instructor_id = NULL, instructor = NULL, updated_at = NOW() WHERE id = ?",
        [courseId]
      );
      return res.json({ ok: true });
    }

    // هات اسم العضو
    const [staffRows] = await dbp.query(
      "SELECT id, full_name FROM staff_members WHERE id = ?",
      [staffId]
    );
    if (staffRows.length === 0) return res.status(404).json({ error: "عضو هيئة التدريس غير موجود" });

    const fullName = staffRows[0].full_name;

    await dbp.query(
      "UPDATE courses SET instructor_id = ?, instructor = ?, updated_at = NOW() WHERE id = ?",
      [staffId, fullName, courseId]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("SET COURSE INSTRUCTOR ERROR:", e);
    res.status(500).json({ error: "Database error" });
  }
});

// ===============================
// STAFF MEMBERS (CRUD)
// ===============================

// GET: list + filters + search
// /api/staff-members?faculty_id=1&department_id=2&q=ali
app.get("/api/staff-members", async (req, res) => {
  try {
    const facultyId = req.query.faculty_id ? Number(req.query.faculty_id) : null;
    const departmentId = req.query.department_id ? Number(req.query.department_id) : null;
    const q = (req.query.q || "").trim();

    let where = "WHERE 1=1";
    const params = [];

    if (facultyId) {
      where += " AND sm.faculty_id = ?";
      params.push(facultyId);
    }
    if (departmentId) {
      where += " AND sm.department_id = ?";
      params.push(departmentId);
    }
    if (q) {
      where += " AND (sm.full_name LIKE ? OR sm.email LIKE ? OR sm.phone LIKE ? OR sm.academic_rank LIKE ? OR sm.specialization LIKE ?)";
      const like = `%${q}%`;
      params.push(like, like, like, like, like);
    }

    const [rows] = await dbp.query(
      `
      SELECT sm.*
      FROM staff_members sm
      ${where}
      ORDER BY sm.id DESC
      `,
      params
    );

    res.json(rows);
  } catch (e) {
    console.error("GET STAFF MEMBERS ERROR:", e);
    res.status(500).json({ error: "Database error" });
  }
});

// POST: create
app.post("/api/staff-members", async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      faculty_id,
      department_id,
      academic_rank,
      specialization,
    } = req.body || {};

 if (!full_name || !faculty_id) {
  return res.status(400).json({ error: "full_name, faculty_id مطلوبة" });
}


    const [r] = await dbp.query(
      `
      INSERT INTO staff_members
        (full_name, email, phone,
         faculty_id, department_id,
         academic_rank, specialization,
         status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        String(full_name).trim(),
        email ? String(email).trim() : null,
        phone ? String(phone).trim() : null,
        Number(faculty_id),
        department_id ? Number(department_id) : null,
        academic_rank ? String(academic_rank).trim() : null,
        specialization ? String(specialization).trim() : null,
        "active",
      ]
    );

    res.json({ id: r.insertId });
  } catch (e) {
    console.error("CREATE STAFF MEMBER ERROR:", e);
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "فيه تكرار في الإيميل" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// PUT: update
app.put("/api/staff-members/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    if (!id) return res.status(400).json({ error: "Invalid id" });

    const fields = [
      "full_name",
      "email",
      "phone",
      "faculty_id",
      "department_id",
      "academic_rank",
      "specialization",
    ];

    const sets = [];
    const params = [];

    for (const f of fields) {
      if (Object.prototype.hasOwnProperty.call(body, f)) {
        sets.push(`${f} = ?`);
        const v = body[f];
        params.push(v === "" ? null : v);
      }
    }

    if (sets.length === 0) return res.status(400).json({ error: "No fields to update" });

    params.push(id);

    await dbp.query(
      `UPDATE staff_members SET ${sets.join(", ")}, updated_at = NOW() WHERE id = ?`,
      params
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("UPDATE STAFF MEMBER ERROR:", e);
    if (e?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "فيه تكرار في الإيميل" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE: remove (كما هو)
app.delete("/api/staff-members/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid id" });

    await dbp.query("DELETE FROM staff_members WHERE id = ?", [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE STAFF MEMBER ERROR:", e);
    res.status(500).json({ error: "Database error" });
  }
});

// GET academic ranks (distinct)
app.get("/api/academic-ranks", async (req, res) => {
  try {
    const facultyId = req.query.faculty_id ? Number(req.query.faculty_id) : null;
    const departmentId = req.query.department_id ? Number(req.query.department_id) : null;

    let where = "WHERE academic_rank IS NOT NULL AND TRIM(academic_rank) <> ''";
    const params = [];

    if (facultyId) {
      where += " AND faculty_id = ?";
      params.push(facultyId);
    }
    if (departmentId) {
      where += " AND department_id = ?";
      params.push(departmentId);
    }

    const [rows] = await dbp.query(
      `
 SELECT DISTINCT TRIM(academic_rank) AS academic_rank
FROM staff_members
WHERE academic_rank IS NOT NULL AND TRIM(academic_rank) <> ''
ORDER BY academic_rank ASC;

      `,
      params
    );

    res.json(rows.map(r => r.academic_rank));
  } catch (e) {
    console.error("GET ACADEMIC RANKS ERROR:", e);
    res.status(500).json({ error: "Database error" });
  }
});


// ===============================
// Dashboard Summary
// ===============================
app.get("/api/dashboard/summary", async (req, res) => {
  try {
    // ملاحظة: لو بعض الجداول اسمها مختلف عندك عدّلي الاسم هنا
    const queries = await Promise.allSettled([
      dbp.query("SELECT COUNT(*) AS c FROM students"),
      dbp.query("SELECT COUNT(*) AS c FROM student_registrations"),
      dbp.query("SELECT COUNT(*) AS c FROM courses"),
      dbp.query("SELECT COUNT(*) AS c FROM term_results"),
      dbp.query("SELECT COUNT(*) AS c FROM books"),
      dbp.query("SELECT COUNT(*) AS c FROM staff_members"),
      dbp.query("SELECT COUNT(*) AS c FROM faculties"),
      dbp.query("SELECT COUNT(*) AS c FROM departments"),
    ]);

    const getCount = (i) => {
      const r = queries[i];
      if (r.status !== "fulfilled") return null;
      return r.value?.[0]?.[0]?.c ?? null;
    };

    res.json({
      students: getCount(0),
      registrations: getCount(1),
      courses: getCount(2),
      term_results: getCount(3),
      books: getCount(4),
      staff_members: getCount(5),
      faculties: getCount(6),
      departments: getCount(7),
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("DASHBOARD SUMMARY ERROR:", e);
    res.status(500).json({ error: "Database error" });
  }
});


// آخر فترة/فصل مسجل فيها لقسم معيّن + برنامج
// يدعم فلترة اختيارية بالسنة والمستوى
app.get("/api/registrations/last-period", (req, res) => {
  const departmentId = Number(req.query.department_id);
  const programType = (req.query.program_type || "undergraduate").trim();

  const pgProgram =
    programType === "postgraduate"
      ? (req.query.postgraduate_program || "").trim()
      : null;

  const academicYear = (req.query.academic_year || "").trim(); // 
  const levelName = (req.query.level_name || "").trim();       // 

  if (!departmentId) {
    return res.status(400).json({ message: "department_id مطلوب" });
  }

  let sql = `
    SELECT r.academic_year, r.level_name, r.term_name, r.created_at
    FROM student_registrations r
    JOIN students s ON s.id = r.student_id
    WHERE s.department_id = ?
      AND r.program_type = ?
      AND (r.postgraduate_program <=> ?)
  `;
  const params = [departmentId, programType, pgProgram];

  if (academicYear) {
    sql += ` AND r.academic_year = ? `;
    params.push(academicYear);
  }
  if (levelName) {
    sql += ` AND r.level_name = ? `;
    params.push(levelName);
  }

  sql += `
    ORDER BY r.created_at DESC, r.id DESC
    LIMIT 1
  `;

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!rows?.length) return res.json({ lastPeriod: null });
    return res.json({ lastPeriod: rows[0] });
  });
});

/* =========================
   Rooms
   ========================= */

// GET all rooms
app.get("/api/rooms", async (req, res) => {
  try {
    const [rows] = await dbp.query(
      `SELECT id, room_name FROM rooms ORDER BY room_name ASC`
    );
    res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error("GET rooms error:", err);
    res.status(500).json({ error: "خطأ في السيرفر (rooms)" });
  }
});

// ADD room
app.post("/api/rooms", async (req, res) => {
  try {
    const name = String(req.body?.room_name || "").trim();
    if (!name) {
      return res.status(400).json({ error: "اسم القاعة مطلوب" });
    }

    const [result] = await dbp.query(
      `INSERT INTO rooms (room_name) VALUES (?)`,
      [name]
    );

    res.json({ id: result.insertId, room_name: name });
  } catch (err) {
    console.error("POST rooms error:", err);

    // duplicate room name
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "اسم القاعة موجود مسبقاً" });
    }

    res.status(500).json({ error: "خطأ في السيرفر (add room)" });
  }
});

// UPDATE room
app.put("/api/rooms/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const name = String(req.body?.room_name || "").trim();

    if (!id) return res.status(400).json({ error: "ID غير صحيح" });
    if (!name) return res.status(400).json({ error: "اسم القاعة مطلوب" });

    const [result] = await dbp.query(
      `UPDATE rooms SET room_name = ? WHERE id = ?`,
      [name, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "القاعة غير موجودة" });
    }

    res.json({ message: "تم تعديل القاعة" });
  } catch (err) {
    console.error("PUT rooms error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "اسم القاعة موجود مسبقاً" });
    }

    res.status(500).json({ error: "خطأ في السيرفر (update room)" });
  }
});

// DELETE room
app.delete("/api/rooms/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "ID غير صحيح" });

    const [result] = await dbp.query(
      `DELETE FROM rooms WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "القاعة غير موجودة" });
    }

    res.json({ message: "تم حذف القاعة" });
  } catch (err) {
    console.error("DELETE rooms error:", err);
    res.status(500).json({ error: "خطأ في السيرفر (delete room)" });
  }
});

/* =========================================================
   Timetable Sessions (Strict Conflicts: Room + Instructor + Department)
   ========================================================= */

// helper: check conflicts
async function checkSessionConflicts({
  excludeId = null,
  facultyId,
  departmentId,
  academicYear,
  levelName,
  termName,
  programType,
  pgProg,
  dayOfWeek,
  startTime,
  endTime,
  roomId,
  instructorStaffId,
}) {
  // 1) ROOM conflict (global - ignore program)
  {
    const sql = `
      SELECT id, room_id, day_of_week, start_time, end_time
      FROM timetable_sessions
      WHERE academic_year = ?
        AND term_name = ?
        AND day_of_week = ?
        AND room_id = ?
        ${excludeId ? "AND id <> ?" : ""}
        AND NOT (end_time <= ? OR start_time >= ?)
      LIMIT 1
    `;
    const params = [
      academicYear,
      termName,
      dayOfWeek,
      roomId,
      ...(excludeId ? [excludeId] : []),
      startTime,
      endTime,
    ];
    const [hits] = await dbp.query(sql, params);
    if (hits.length) {
      return {
        ok: false,
        status: 409,
        type: "ROOM",
        error: "تضارب: القاعة فيها محاضرة أخرى في نفس الزمن",
        conflict: hits[0],
      };
    }
  }

  // 2) INSTRUCTOR conflict (GLOBAL - strict)
  if (instructorStaffId) {
    const sql = `
      SELECT id, instructor_staff_id, day_of_week, start_time, end_time
      FROM timetable_sessions
      WHERE academic_year = ?
        AND term_name = ?
        AND day_of_week = ?
        AND instructor_staff_id = ?
        ${excludeId ? "AND id <> ?" : ""}
        AND NOT (end_time <= ? OR start_time >= ?)
      LIMIT 1
    `;

    const params = [
      academicYear,
      termName,
      dayOfWeek,
      instructorStaffId,
      ...(excludeId ? [excludeId] : []),
      startTime,
      endTime,
    ];

    const [hits] = await dbp.query(sql, params);
    if (hits.length) {
      return {
        ok: false,
        status: 409,
        type: "INSTRUCTOR",
        error: "تضارب: نفس الأستاذ لديه محاضرة أخرى في نفس الزمن",
        conflict: hits[0],
      };
    }
  }

  // 3) DEPARTMENT / GROUP conflict
  {
    const sql = `
      SELECT id, course_id, day_of_week, start_time, end_time, room_id
      FROM timetable_sessions
      WHERE faculty_id = ?
        AND department_id = ?
        AND academic_year = ?
        AND level_name = ?
        AND term_name = ?
        AND program_type = ?
        AND (postgraduate_program <=> ?)
        AND day_of_week = ?
        ${excludeId ? "AND id <> ?" : ""}
        AND NOT (end_time <= ? OR start_time >= ?)
      LIMIT 1
    `;
    const params = [
      facultyId,
      departmentId,
      academicYear,
      levelName,
      termName,
      programType,
      pgProg,
      dayOfWeek,
      ...(excludeId ? [excludeId] : []),
      startTime,
      endTime,
    ];
    const [hits] = await dbp.query(sql, params);
    if (hits.length) {
      return {
        ok: false,
        status: 409,
        type: "DEPARTMENT",
        error: "تضارب: نفس القسم/المستوى عنده محاضرة أخرى في نفس الزمن",
        conflict: hits[0],
      };
    }
  }

  return { ok: true };
}


/* =========================================================
   GET /api/timetable-sessions
   ========================================================= */
app.get("/api/timetable-sessions", async (req, res) => {
  try {
    const {
      faculty_id,
      department_id,
      academic_year,
      level_name,
      term_name,
      program_type,
      postgraduate_program,
    } = req.query;

    if (!faculty_id || !department_id || !academic_year || !level_name || !term_name || !program_type) {
      return res.status(400).json({ error: "Query ناقص لعرض الجدول" });
    }

    const pg =
      program_type === "postgraduate"
        ? String(postgraduate_program || "").trim()
        : null;

    const [rows] = await dbp.query(
      `
      SELECT ts.*, c.course_name, r.room_name
      FROM timetable_sessions ts
      LEFT JOIN courses c ON c.id = ts.course_id
      LEFT JOIN rooms r ON r.id = ts.room_id
      WHERE ts.faculty_id = ?
        AND ts.department_id = ?
        AND ts.academic_year = ?
        AND ts.level_name = ?
        AND ts.term_name = ?
        AND ts.program_type = ?
        AND (ts.postgraduate_program <=> ?)
      ORDER BY ts.day_of_week, ts.start_time
      `,
      [
        Number(faculty_id),
        Number(department_id),
        academic_year,
        level_name,
        term_name,
        program_type,
        pg,
      ]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET timetable-sessions error:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

/* =========================================================
   POST /api/timetable-sessions
   ========================================================= */
app.post("/api/timetable-sessions", async (req, res) => {
  try {
    const {
      faculty_id,
      department_id,
      academic_year,
      level_name,
      term_name,
      program_type,
      postgraduate_program,
      course_id,
      instructor_staff_id,
      instructor_name,
      room_id,
      day_of_week,
      start_time,
      end_time,
    } = req.body;

    // التحقق من البيانات
    if (
      !faculty_id || !department_id || !academic_year || !level_name || !term_name ||
      !program_type || !course_id || !room_id || !day_of_week || !start_time || !end_time
    ) {
      return res.status(400).json({ error: "البيانات ناقصة" });
    }

    if (start_time >= end_time) {
      return res.status(400).json({ error: "زمن البداية لازم يكون قبل النهاية" });
    }

    const pg = program_type === "postgraduate" ? (postgraduate_program || "").trim() : null;

    // إدخال البيانات مع التقاط أي SIGNAL من الـ Trigger
    try {
      const [result] = await dbp.query(
        `
        INSERT INTO timetable_sessions (
          faculty_id, department_id, academic_year, level_name, term_name,
          program_type, postgraduate_program,
          course_id, instructor_staff_id, instructor_name,
          room_id, day_of_week, start_time, end_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          faculty_id,
          department_id,
          academic_year,
          level_name,
          term_name,
          program_type,
          pg,
          course_id,
          instructor_staff_id || null,
          instructor_name || null,
          room_id,
          day_of_week,
          start_time,
          end_time,
        ]
      );

      res.json({ id: result.insertId, message: "تم حفظ المحاضرة" });
    } catch (err) {
      // MySQL SIGNAL error
      if (err.code === "ER_SIGNAL_EXCEPTION") {
        return res.status(409).json({ error: err.sqlMessage });
      }
      throw err; // أي خطأ آخر
    }

  } catch (err) {
    console.error("POST timetable-sessions error:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});


/* =========================================================
   PUT /api/timetable-sessions/:id
   ========================================================= */
app.put("/api/timetable-sessions/:id", async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    if (!sessionId) return res.status(400).json({ error: "ID غير صحيح" });

    const {
      faculty_id,
      department_id,
      academic_year,
      level_name,
      term_name,
      program_type,
      postgraduate_program,
      course_id,
      instructor_staff_id,
      instructor_name,
      room_id,
      day_of_week,
      start_time,
      end_time,
    } = req.body;

    if (
      !faculty_id || !department_id || !academic_year || !level_name || !term_name ||
      !program_type || !course_id || !room_id || !day_of_week || !start_time || !end_time
    ) {
      return res.status(400).json({ error: "البيانات ناقصة" });
    }

    if (start_time >= end_time) {
      return res.status(400).json({ error: "زمن البداية لازم يكون قبل النهاية" });
    }

    const pg = program_type === "postgraduate" ? (postgraduate_program || "").trim() : null;

    const conflict = await checkSessionConflicts({
      excludeId: sessionId,
      facultyId: faculty_id,
      departmentId: department_id,
      academicYear: academic_year,
      levelName: level_name,
      termName: term_name,
      programType: program_type,
      pgProg: pg,
      dayOfWeek: day_of_week,
      startTime: start_time,
      endTime: end_time,
      roomId: room_id,
      instructorStaffId: instructor_staff_id || null,
    });

    if (!conflict.ok) {
      return res.status(conflict.status).json(conflict);
    }

    await dbp.query(
      `
      UPDATE timetable_sessions
      SET
        faculty_id = ?, department_id = ?, academic_year = ?, level_name = ?, term_name = ?,
        program_type = ?, postgraduate_program = ?,
        course_id = ?, instructor_staff_id = ?, instructor_name = ?,
        room_id = ?, day_of_week = ?, start_time = ?, end_time = ?
      WHERE id = ?
      `,
      [
        faculty_id,
        department_id,
        academic_year,
        level_name,
        term_name,
        program_type,
        pg,
        course_id,
        instructor_staff_id || null,
        instructor_name || null,
        room_id,
        day_of_week,
        start_time,
        end_time,
        sessionId,
      ]
    );

    res.json({ message: "تم تعديل المحاضرة" });
  } catch (err) {
  console.error("PUT timetable-sessions error:", err);

  // إذا الخطأ من MySQL SIGNAL (تضارب)
  if (err.code === "ER_SIGNAL_EXCEPTION") {
    return res.status(409).json({ error: err.sqlMessage });
  }

  res.status(500).json({ error: "خطأ في السيرفر" });
}

});

/* =========================================================
   DELETE /api/timetable-sessions/:id
   ========================================================= */
app.delete("/api/timetable-sessions/:id", async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    if (!sessionId) {
      return res.status(400).json({ error: "ID غير صحيح" });
    }

    const [result] = await dbp.query(
      "DELETE FROM timetable_sessions WHERE id = ?",
      [sessionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "المحاضرة غير موجودة" });
    }

    res.json({ message: "تم حذف المحاضرة بنجاح" });
  } catch (err) {
    console.error("DELETE timetable-sessions error:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
