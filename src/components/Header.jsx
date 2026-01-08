import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCircle, LogOut } from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import logo from "../assets/gentle-logo.png";

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { logoutUser } = auth;

  const role = localStorage.getItem("user_role");
  const username = localStorage.getItem("username") || "User";

  const logout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-[#09203d] shadow sticky top-0 z-50">
      <div className="w-full px-3 py-2 flex justify-between items-center">
        <Link to="/events" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Gentle Logo"
            className="h-[1.4rem] w-auto"
          />
        </Link>
        <div className="flex items-center gap-8">
          <nav className="flex items-center gap-3 text-[0.75rem] ">
            <Link to="/events" className="text-[#afc7e4] hover:text-[white] transition-[0.5s]">Events</Link>
            {(role === "admin" || role === "hr") && (
              <Link to="/donations" className="text-[#afc7e4] hover:text-[white] transition-[0.5s]">Donations</Link>
            )}
          </nav>

          <div className="relative">
            <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-[#afc7e4] hover:text-[white] transition-[0.5s] cursor-pointer">
              <UserCircle size={16} />
              <span className="text-[0.75rem] capitalize">{username}</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2.5 w-25 bg-white rounded-[0_0_0.25rem_0.25rem] shadow">
                <button
                  onClick={logout}
                  className="flex items-center gap-1 w-full text-left text-[0.65rem] px-3 py-1.5 text-[#64748e] hover:text-[#09203d] transition-[0.5s]"
                >
                  <LogOut size={13} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
