import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaUniversity,
  FaClipboardCheck,
  FaChalkboardTeacher,
  FaUsers,
  FaCalendarAlt,
  FaTachometerAlt,
  FaUserCog,
  FaChartPie,
  FaCalculator
} from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import "./CategoriesPage.css";





const categories = [
  {
    name: "المكتبة",
    icon: <FaBookOpen size={42} />,
    path: "/books",
  },
  {
    name: "القبول والتسجيل",
    icon: <IoDocumentText size={42} />,
    path: "/RegistrationTabs",
  },
  {
    name: "إعدادات النظام الأكاديمي",
    icon: <FaUniversity size={42} />,
    path: "/faculty",
  },
  {
    name: "إدخال الدرجات",
    icon: <FaClipboardCheck size={42} />,
    path: "/GradeEntry",
  },
    {
    name: " حساب النتائج",
    icon: <FaCalculator  size={42} />,
    path: "/TermResult",
  },
  {
    name: "قوائم الطلاب",
    icon: <FaUsers size={42} />,
    path: "/StudentsTermList",
  },
  {
    name: "أعضاء هيئة التدريس",
    icon: <FaChalkboardTeacher size={42} />,
    // path: "/StaffMembers",
  },
    {
    name: "الجداول الدراسية",
    icon: <FaCalendarAlt size={42} />,
    path: "/",
  },
  {
    name: "لوحة المعلومات",
    icon: <FaChartPie  size={42} />,
    path: "/Dashboard",
  },
    {
    name: " المستخدمين والصلاحيات",
    icon: <FaUserCog   size={42} />,
    path: "/",
  },

];

function CategoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="categories-page">
      <div style={{ marginBottom: "50px", color: "#00274c" }}>
      <h1>كلية بورتسودان الأهلية</h1>
      </div>
      <div className="categories-grid">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="category-card"
            onClick={() => navigate(cat.path)}
          >
            <div className="category-icon">{cat.icon}</div>
            <h3>{cat.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoriesPage;
