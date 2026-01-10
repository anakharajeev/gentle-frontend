import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import logo from "../assets/gentle-logo.png";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [show, setShow] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("token/", { username, password });
      const { access, refresh } = res.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      const userRes = await API.get("user/");
      localStorage.setItem("user_role", userRes.data.role);
      localStorage.setItem("username", userRes.data.username);
      localStorage.setItem("email", userRes.data.email);

      loginUser(
        { access, refresh },
        {
          username: userRes.data.username,
          role: userRes.data.role,
          email: userRes.data.email,
        }
      );

      navigate("/events", { replace: true });
    } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-page">
      <div className="login-box animate-fadeInScale">
        <span></span>
        <span></span>
        <span></span>
        <span></span>

        <div className="login-content">
          <img src={logo} alt="logo" className="h-[3rem] mb-4 mx-auto" />

          <h1 className="text-white text-[1.8rem] font-bold mb-1">Sign in</h1>
          <h6 className="text-white text-[0.87rem] font-normal mb-3">Enter the Username and Password.</h6>

          <div className="error-message">
            {error && <p className="text-red-500 text-[0.85rem] mb-2.5">{error}</p>}
          </div>

          <form onSubmit={handleSubmit} className="pt-2" noValidate>
            <div className="mb-2 flex flex-col gap-0.5">
              <label htmlFor="username" className="text-[0.8rem] text-white font-medium">User Name</label>
              <input
                type="text"
                className="form-control w-full rounded"
                placeholder="Enter your User name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
              />
            </div>

            <div className="mb-4 flex flex-col gap-0.5">
              <label htmlFor="password" className="text-[0.8rem] text-white font-medium">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  className="form-control w-full rounded pr-5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your Password"
                  maxLength={50}
                />
                <button
                  className="show-btn"
                  type="button"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="common-btn success-btn btn-md w-full submit-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
