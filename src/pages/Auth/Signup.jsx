import { useState } from "react";
import { signupWithEmail, loginWithGoogle } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Email and password required");
      return;
    }

    try {
      setLoading(true);
      await signupWithEmail(email, password);
      alert("Account created successfully ✅");
      navigate("/");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffafa] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-red-900/20 rounded-2xl p-8 shadow-md">
        {/* Header */}
        <h1 className="text-2xl font-bold text-red-900 text-center">
          Create Account
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1">
          Start tracking your money with Lal Diary
        </p>

        {/* Form */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full mt-1 px-4 py-2
                border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-red-900/40
              "
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full mt-1 px-4 py-2
                border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-red-900/40
              "
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className={`
              w-full py-3 rounded-xl
              font-medium text-white
              transition
              ${
                loading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-900 hover:bg-red-800"
              }
            `}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-gray-300 flex-1" />
          <span className="text-sm text-gray-400">OR</span>
          <div className="h-px bg-gray-300 flex-1" />
        </div>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
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

        {/* Footer */}
        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-red-900 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
