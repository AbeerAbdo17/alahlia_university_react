// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({ children }) {
//   const token = sessionStorage.getItem("token");
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// }
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
export default function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      console.log("Token expired, logging out...");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  return children;
}