import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ auth state

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-red-800 via-red-800 to-red-900 shadow-md">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">

        {/* Left: Logo + App Name */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <img
            src={logo}
            alt="Lal Diary"
            className="h-10 w-10 rounded-md bg-white p-1"
          />
          <span className="text-xl font-semibold tracking-wide text-white">
            Lal Diary
          </span>
        </div>

        {/* Right: Logout (ONLY IF LOGGED IN) */}
        {user && (
          <button
            onClick={handleLogout}
            className="
              flex items-center gap-2
              rounded-lg px-4 py-2
              text-sm font-medium
              text-red-700
              bg-white
              border border-white/20
              transition-all duration-200
              hover:text-red-900
              hover:shadow-md
              active:scale-95
            "
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
