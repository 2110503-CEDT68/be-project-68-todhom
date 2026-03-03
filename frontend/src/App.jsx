import React, { useState, useEffect } from "react";

// API Configuration - เปลี่ยน URL ตาม backend ของคุณ
const API_BASE_URL = "http://localhost:5000/api";

// Main App Component
export default function CarRentalApp() {
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [providers, setProviders] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Check token on mount
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        setCurrentPage("dashboard");
        fetchProviders();
        fetchRentals();
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/providers`);
      const data = await res.json();
      if (data.success) setProviders(data.data);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const fetchRentals = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rentals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRentals(data.data);
    } catch (error) {
      console.error("Error fetching rentals:", error);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        showNotification("เข้าสู่ระบบสำเร็จ!", "success");
      } else {
        showNotification(data.msg || "เข้าสู่ระบบไม่สำเร็จ", "error");
      }
    } catch (error) {
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
    setLoading(false);
  };

  const handleRegister = async (name, email, password, telephone) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, telephone }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        showNotification("ลงทะเบียนสำเร็จ!", "success");
      } else {
        showNotification("ลงทะเบียนไม่สำเร็จ กรุณาตรวจสอบข้อมูล", "error");
      }
    } catch (error) {
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setCurrentPage("login");
    showNotification("ออกจากระบบแล้ว", "success");
  };

  const handleCreateRental = async (providerId, rentalDate) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/rentals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ provider: providerId, rentalDate }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("จองรถสำเร็จ!", "success");
        fetchRentals();
      } else {
        showNotification(data.message || "จองไม่สำเร็จ", "error");
      }
    } catch (error) {
      showNotification("เกิดข้อผิดพลาด", "error");
    }
    setLoading(false);
  };
  const handleUpdateRental = async (rentalId, rentalDate) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/rentals/${rentalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rentalDate }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("แก้ไขการจองสำเร็จ!", "success");
        fetchRentals();
      } else {
        showNotification(data.message || "แก้ไขไม่สำเร็จ", "error");
      }
    } catch (error) {
      showNotification("เกิดข้อผิดพลาด", "error");
    }
    setLoading(false);
  };
  const handleDeleteRental = async (rentalId) => {
    if (!confirm("ยืนยันการยกเลิกการจอง?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/rentals/${rentalId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showNotification("ยกเลิกการจองสำเร็จ", "success");
        fetchRentals();
      } else {
        showNotification(data.message || "ยกเลิกไม่สำเร็จ", "error");
      }
    } catch (error) {
      showNotification("เกิดข้อผิดพลาด", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-500 ${
            notification.type === "success"
              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
              : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        {currentPage === "login" && (
          <LoginPage
            onLogin={handleLogin}
            onNavigate={setCurrentPage}
            loading={loading}
          />
        )}
        {currentPage === "register" && (
          <RegisterPage
            onRegister={handleRegister}
            onNavigate={setCurrentPage}
            loading={loading}
          />
        )}
        {currentPage === "dashboard" && user && (
          <Dashboard
            user={user}
            providers={providers}
            rentals={rentals}
            onLogout={handleLogout}
            onCreateRental={handleCreateRental}
            onUpdateRental={handleUpdateRental}
            onDeleteRental={handleDeleteRental}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

// Login Page Component
function LoginPage({ onLogin, onNavigate, loading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl mb-6 shadow-2xl shadow-amber-500/30 transform hover:scale-105 transition-transform">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 17h8M8 17v-4m8 4v-4m-8 4H5a2 2 0 01-2-2V9a2 2 0 012-2h.5l1.5-3h10l1.5 3H19a2 2 0 012 2v6a2 2 0 01-2 2h-3m-8 0h8m-8-4h.01M16 13h.01"
              />
            </svg>
          </div>
          <h1
            className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-400 bg-clip-text text-transparent mb-2"
            style={{ fontFamily: "system-ui" }}
          >
            TODHOM
          </h1>
          <p className="text-slate-400 text-lg">ระบบเช่ารถออนไลน์</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            เข้าสู่ระบบ
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                อีเมล
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-900/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  placeholder="your@email.com"
                  required
                />
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-900/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  กำลังดำเนินการ...
                </span>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400">
              ยังไม่มีบัญชี?{" "}
              <button
                onClick={() => onNavigate("register")}
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
              >
                สมัครสมาชิก
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          © 2025 TODHOM Car Rental. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// Register Page Component
function RegisterPage({ onRegister, onNavigate, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    telephone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (formData.password.length < 6) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }
    if (!/^0\d{9}$/.test(formData.telephone)) {
      newErrors.telephone = "เบอร์โทรศัพท์ไม่ถูกต้อง";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onRegister(
        formData.name,
        formData.email,
        formData.password,
        formData.telephone,
      );
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl mb-6 shadow-2xl shadow-amber-500/30 transform hover:scale-105 transition-transform">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 17h8M8 17v-4m8 4v-4m-8 4H5a2 2 0 01-2-2V9a2 2 0 012-2h.5l1.5-3h10l1.5 3H19a2 2 0 012 2v6a2 2 0 01-2 2h-3m-8 0h8m-8-4h.01M16 13h.01"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-400 bg-clip-text text-transparent mb-2">
            TODHOM
          </h1>
          <p className="text-slate-400 text-lg">สมัครสมาชิกใหม่</p>
        </div>

        {/* Register Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            ลงทะเบียน
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ชื่อ-นามสกุล
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-5 py-4 bg-slate-900/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  placeholder="John Doe"
                  required
                />
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                อีเมล
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-5 py-4 bg-slate-900/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  placeholder="your@email.com"
                  required
                />
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                เบอร์โทรศัพท์
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleChange("telephone", e.target.value)}
                  className={`w-full px-5 py-4 bg-slate-900/50 border rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    errors.telephone
                      ? "border-red-500"
                      : "border-slate-600/50 focus:border-amber-500"
                  }`}
                  placeholder="0812345678"
                  required
                />
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              {errors.telephone && (
                <p className="text-red-400 text-sm mt-1">{errors.telephone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`w-full px-5 py-4 bg-slate-900/50 border rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    errors.password
                      ? "border-red-500"
                      : "border-slate-600/50 focus:border-amber-500"
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className={`w-full px-5 py-4 bg-slate-900/50 border rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-slate-600/50 focus:border-amber-500"
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/30 mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  กำลังดำเนินการ...
                </span>
              ) : (
                "สมัครสมาชิก"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              มีบัญชีอยู่แล้ว?{" "}
              <button
                onClick={() => onNavigate("login")}
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({
  user,
  providers,
  rentals,
  onLogout,
  onCreateRental,
  onUpdateRental,
  onDeleteRental,
  loading,
}) {
  const [activeTab, setActiveTab] = useState("providers");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [rentalDate, setRentalDate] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRental, setEditingRental] = useState(null);
  const [editDate, setEditDate] = useState("");

  const handleEdit = () => {
    if (editingRental && editDate) {
      onUpdateRental(editingRental._id, editDate);
      setShowEditModal(false);
      setEditingRental(null);
      setEditDate("");
    }
  };

  const handleBooking = () => {
    if (selectedProvider && rentalDate) {
      onCreateRental(selectedProvider._id, rentalDate);
      setShowBookingModal(false);
      setSelectedProvider(null);
      setRentalDate("");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 17h8M8 17v-4m8 4v-4m-8 4H5a2 2 0 01-2-2V9a2 2 0 012-2h.5l1.5-3h10l1.5 3H19a2 2 0 012 2v6a2 2 0 01-2 2h-3m-8 0h8m-8-4h.01M16 13h.01"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">TODHOM</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-slate-300">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span>{user.name}</span>
                {user.role === "admin" && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl p-8 mb-8 border border-amber-500/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            สวัสดี, {user.name}! 👋
          </h1>
          <p className="text-slate-400">
            ยินดีต้อนรับสู่ระบบเช่ารถ TODHOM - เลือกผู้ให้บริการและจองรถได้ง่ายๆ
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {providers.length}
                </p>
                <p className="text-slate-400 text-sm">ผู้ให้บริการ</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {rentals.length}
                </p>
                <p className="text-slate-400 text-sm">การจองของคุณ</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {user.role === "admin"
                    ? "–"
                    : Math.max(0, 3 - rentals.length)}{" "}
                </p>
                <p className="text-slate-400 text-sm">จองได้อีก</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("providers")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "providers"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                : "bg-slate-800/50 text-slate-400 hover:text-white"
            }`}
          >
            ผู้ให้บริการ
          </button>
          <button
            onClick={() => setActiveTab("rentals")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "rentals"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                : "bg-slate-800/50 text-slate-400 hover:text-white"
            }`}
          >
            การจองของฉัน
          </button>
        </div>

        {/* Content */}
        {activeTab === "providers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p className="text-slate-400 text-lg">
                  ยังไม่มีผู้ให้บริการในระบบ
                </p>
              </div>
            ) : (
              providers.map((provider) => (
                <div
                  key={provider._id}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-amber-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 17h8M8 17v-4m8 4v-4m-8 4H5a2 2 0 01-2-2V9a2 2 0 012-2h.5l1.5-3h10l1.5 3H19a2 2 0 012 2v6a2 2 0 01-2 2h-3"
                        />
                      </svg>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                      พร้อมให้บริการ
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2">
                    {provider.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 flex items-start gap-2">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {provider.address || "ไม่ระบุที่อยู่"}
                  </p>
                  <p className="text-slate-400 text-sm mb-6 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {provider.telephone || "ไม่ระบุเบอร์โทร"}
                  </p>

                  <button
                    onClick={() => {
                      setSelectedProvider(provider);
                      setShowBookingModal(true);
                    }}
                    disabled={rentals.length >= 3 && user.role !== "admin"}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {rentals.length >= 3 && user.role !== "admin"
                      ? "จองครบ 3 รายการแล้ว"
                      : "จองรถ"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "rentals" && (
          <div className="space-y-4">
            {rentals.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/30 rounded-2xl">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="text-slate-400 text-lg mb-2">ยังไม่มีการจอง</p>
                <p className="text-slate-500">
                  เลือกผู้ให้บริการเพื่อเริ่มจองรถ
                </p>
              </div>
            ) : (
              rentals.map((rental) => (
                <div
                  key={rental._id}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {rental.provider?.name || "Unknown Provider"}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        วันที่จอง:{" "}
                        {new Date(
                          rental.rentalDate || rental.createdAt,
                        ).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {rental.provider?.telephone && (
                        <p className="text-slate-500 text-sm">
                          โทร: {rental.provider.telephone}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingRental(rental);
                      setEditDate(rental.rentalDate?.split("T")[0] || "");
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-xl hover:bg-amber-500/30 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    แก้ไข
                  </button>

                  {/* ปุ่มยกเลิก (เดิม) */}
                  <button
                    onClick={() => onDeleteRental(rental._id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    ยกเลิกการจอง
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl p-8 max-w-md w-full border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">จองรถ</h2>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedProvider(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-slate-700/50 rounded-2xl p-4 mb-6">
              <p className="text-slate-400 text-sm mb-1">ผู้ให้บริการ</p>
              <p className="text-white font-semibold text-lg">
                {selectedProvider.name}
              </p>
              {selectedProvider.address && (
                <p className="text-slate-400 text-sm mt-2">
                  {selectedProvider.address}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                วันที่ต้องการเช่า
              </label>
              <input
                type="date"
                value={rentalDate}
                onChange={(e) => setRentalDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-5 py-4 bg-slate-900/50 border border-slate-600/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedProvider(null);
                }}
                className="flex-1 py-3 bg-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-600 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleBooking}
                disabled={!rentalDate || loading}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "กำลังจอง..." : "ยืนยันการจอง"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && editingRental && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl p-8 max-w-md w-full border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">แก้ไขการจอง</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRental(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-slate-700/50 rounded-2xl p-4 mb-6">
              <p className="text-slate-400 text-sm mb-1">ผู้ให้บริการ</p>
              <p className="text-white font-semibold text-lg">
                {editingRental.provider?.name}
              </p>
              {editingRental.provider?.address && (
                <p className="text-slate-400 text-sm mt-2">
                  {editingRental.provider.address}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                วันที่ใหม่
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-5 py-4 bg-slate-900/50 border border-slate-600/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRental(null);
                }}
                className="flex-1 py-3 bg-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-600 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleEdit}
                disabled={!editDate || loading}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
