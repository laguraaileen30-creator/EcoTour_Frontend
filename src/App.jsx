import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { EcoTourProvider } from "./context/EcoTourContext";

// --- Public Pages ---
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import PendingApproval from "./pages/PendingApproval";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// --- Admin Pages ---
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/Admin/Dashboard";

// --- Client Pages ---
import ClientDashboard from "./pages/Client/Client";

// --- Staff Pages ---
import StaffDashboard from "./pages/Staff/Staff";

function Layout({ children }) {
  return <div className="app-shell min-h-screen bg-[#03130b] text-white">{children}</div>;
}

function App() {
  const navigate = useNavigate();

  const handleLogin = (data) => {
    console.log("Login submitted:", data);
  };

  const handleRegister = (data) => {
    console.log("Signup submitted:", data);
  };

  return (
    <EcoTourProvider>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication */}
          <Route
            path="/login"
            element={
              <Login
                onSubmit={handleLogin}
                onSwitchToSignUp={() => navigate("/signup")}
              />
            }
          />

          <Route
            path="/signup"
            element={
              <Signup
                onSubmit={handleRegister}
                onSwitchToSignIn={() => navigate("/login")}
              />
            }
          />

          {/* Other Public Pages */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Client Dashboard Routes */}
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/home" element={<ClientDashboard />} />

          {/* Staff Dashboard Routes */}
          <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />

          {/* Admin Routes (Wrapped in AdminLayout) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </EcoTourProvider>
  );
}

export default App;