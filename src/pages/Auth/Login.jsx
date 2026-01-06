import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginWithEmail, loginWithGoogle } from "../../services/auth.service";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import s1 from "../../assets/1.png";
import s2 from "../../assets/2.png";
import s3 from "../../assets/3.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      alert("Email & password required");
      return;
    }

    try {
      setLoading(true);
      await loginWithEmail(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-[#fffafa] min-h-screen">
      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        {/* LEFT */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-red-900">
            Lal Diary
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Track • Split • Understand your money
          </p>

          <p className="mt-6 text-gray-500 max-w-md">
            Lal Diary helps you track expenses, split group payments, manage
            credits & debts — all in one simple place.
          </p>
        </div>

        {/* RIGHT (LOGIN CARD) */}
        <div className="bg-white border border-red-900/20 rounded-2xl shadow-md p-8">
          <h2 className="text-xl font-semibold text-red-900 text-center">
            Login to continue
          </h2>

          <div className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-900/40 outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-900/40 outline-none"
            />

            <button
              onClick={handleEmailLogin}
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-medium transition ${
                loading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-900 hover:bg-red-800"
              }`}
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="h-px bg-gray-300 flex-1" />
              <span className="text-sm text-gray-400">OR</span>
              <div className="h-px bg-gray-300 flex-1" />
            </div>

            <button
              onClick={handleGoogleLogin}
              className="
    w-full flex items-center justify-center gap-3
    py-3 rounded-xl
    border border-gray-300
    bg-white
    font-medium text-gray-700
    hover:bg-gray-50
    shadow-sm
    transition
    active:scale-[0.98]
  "
            >
              {/* Google logo */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.1 1.54 7.5 2.83l5.46-5.46C33.36 3.9 28.97 2 24 2 14.73 2 6.98 7.94 4.24 16.5l6.36 4.94C12.1 15.1 17.6 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24c0-1.57-.14-3.09-.4-4.55H24v9.02h12.65c-.55 2.96-2.2 5.47-4.65 7.16l7.18 5.57C43.43 37.1 46.5 31.1 46.5 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.6 28.94A14.5 14.5 0 019.5 24c0-1.72.3-3.38.85-4.94l-6.36-4.94A23.96 23.96 0 002 24c0 3.9.93 7.6 2.59 10.88l6.01-5.94z"
                />
                <path
                  fill="#34A853"
                  d="M24 46c6.48 0 11.92-2.14 15.9-5.8l-7.18-5.57c-2 1.35-4.56 2.15-8.72 2.15-6.32 0-11.68-4.26-13.6-10.02l-6.01 5.94C6.97 40.06 14.73 46 24 46z"
                />
              </svg>

              <span>Continue with Google</span>
            </button>
          </div>
          {/* SIGNUP CTA */}
          <p className="text-sm text-center text-gray-500 mt-4">
            New to Lal Diary?
          </p>

          <Link
            to="/signup"
            className="
    block w-full mt-2 text-center
    py-3 rounded-xl
    border border-red-900
    text-red-900 font-medium
    hover:bg-red-900 hover:text-white
    transition
  "
          >
            Create an account
          </Link>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-red-900">
            Why Lal Diary?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-10">
            {[
              [
                "Smart Expense Tracking",
                "Track debit, credit & lending clearly",
              ],
              ["Group Expense Splitting", "Know who owes whom instantly"],
              ["Clear Monthly Insights", "Visualize your money flow"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="border border-red-900/20 rounded-xl p-6 text-center bg-[#fffafa]"
              >
                <h3 className="font-semibold text-lg text-red-900">{title}</h3>
                <p className="text-gray-600 mt-2 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-red-900">
            How it works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-10">
            {[
              ["1. Add Transactions", "Debit, credit or lend in one tap"],
              ["2. Create Groups", "Split expenses with friends"],
              ["3. Stay Balanced", "Always know your real balance"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <h3 className="font-semibold text-red-900">{title}</h3>
                <p className="text-gray-600 text-sm mt-2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ================= GALLERY ================= */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-red-900">
            A glimpse of Lal Diary
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[s1, s2, s3].map((img, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-red-900/20 shadow-sm hover:shadow-lg transition"
              >
                <img
                  src={img}
                  alt={`Lal Diary screenshot ${i + 1}`}
                  className="w-full h-48 object-cover hover:scale-105 transition duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-[#fffafa] py-14 text-center flex md:flex-row flex-col items-center justify-center gap-10">
        <div>
          <h2 className="text-3xl font-bold text-red-900">
            Start tracking your money today
          </h2>
          <p className="text-gray-500 mt-2">Simple. Secure. Stress-free.</p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-6 px-8 py-3 bg-red-900 text-white rounded-xl font-medium "
          >
            Login & Get Started
          </button>
        </div>
        <div>
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 ml-100 cursor-pointer select-none"
          >
            <img
              src={logo}
              alt="Lal Diary"
              className="h-40 w-40 rounded-xl bg-white "
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
