// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-red-900 text-red-100">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* BRAND */}
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Lal Diary Logo"
              className="w-11 h-11 rounded-md border border-red-700"
            />
            <div>
              <h2 className="text-lg font-semibold text-white">
                Lal Diary
              </h2>
              <p className="text-sm text-red-200">
                Track • Split • Understand your money
              </p>
            </div>
          </div>

          {/* CONTACT */}
          <div className="text-sm text-red-200 text-center md:text-right">
            <p className="uppercase tracking-wide text-xs text-red-300">
              Contact
            </p>
            <p className="text-red-100 font-medium">
              adarshpatel2301@gmail.com
            </p>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-6 h-px bg-red-700/60" />

        {/* BOTTOM CREDIT */}
        <motion.div
          className="text-center text-sm text-red-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          © {new Date().getFullYear()} Lal Diary · Built with ❤️ by{" "}
          <span className="text-white font-semibold">
            Adarsh Patel
          </span>
        </motion.div>
      </div>
    </footer>
  );
}
