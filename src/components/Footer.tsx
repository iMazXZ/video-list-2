import Link from "next/link";
import { FiPlay } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 relative">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <FiPlay className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white relative">
            Video<span className="text-green-400">Hub</span>
            <sup className="absolute -top-1 -right-6 text-xs text-red-500 font-semibold">
              v1.0
            </sup>
          </span>
        </div>
        <p className="text-sm text-center">
          &copy; {new Date().getFullYear()} VideoHub. Made with ❤️ by Maul.
        </p>
        {/* <div className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-sm hover:text-white transition-colors"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="text-sm hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
        </div> */}
      </div>
    </footer>
  );
}
