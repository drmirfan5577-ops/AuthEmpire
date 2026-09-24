import { useNavigate } from "react-router-dom";
import { Home, Shield, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 app-bg">
      <div className="text-center max-w-sm animate-fade-in-up">
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Shield size={36} className="text-slate-300" />
          </div>
        </div>

        <h1 className="text-5xl font-black text-slate-800 mb-2">404</h1>
        <p className="text-base font-semibold text-slate-600 mb-1">Page Not Found</p>
        <p className="text-sm text-slate-400 mb-8">
          This route doesn't exist in AuthEmpire.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-slate-100 text-slate-600 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-gradient-to-r from-empire-500 to-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:from-empire-600 hover:to-indigo-600 transition-all min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400"
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
