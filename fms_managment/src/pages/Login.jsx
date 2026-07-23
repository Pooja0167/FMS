import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { loginUser, clearError } from "../store/slices/login/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, user } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isHoveringLogin, setIsHoveringLogin] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState({
    text: "",
    type: "",
  });

  const showTemporaryMessage = (text, type = "success") => {
    setMessage({ text, type });

    setTimeout(() => {
      setMessage({ text: "", type: "" });
      dispatch(clearError());
    }, 3000);
  };

  useEffect(() => {
    if (user?.access) {
      showTemporaryMessage("Login successfully!", "success");

      setTimeout(() => {
        navigate("/customer/feedback/form");
      }, 1000);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      showTemporaryMessage(error, "error");
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      showTemporaryMessage(
        "Please enter username and password",
        "error"
      );
      return;
    }

    await dispatch(
      loginUser({
        username: formData.username,
        password: formData.password,
      })
    );
  };

  return (
    <div
      className={`flex items-center justify-center h-screen transition-colors duration-300 ${
        isHoveringLogin ? "bg-gray-200" : "bg-gray-400"
      }`}
    >
      {message.text && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
          <div
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded border shadow-lg ${
              message.type === "success"
                ? "text-green-700 border-green-200 bg-green-50"
                : "text-red-700 border-red-200 bg-red-50"
            }`}
          >
            <FiInfo />
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-4xl shadow-lg px-8 py-8 w-full max-w-[320px] h-[320px] space-y-4"
      >
        <div className="flex justify-center">
          <img
            src={logo}
            alt="Logo"
            className="h-20 object-contain mb-2"
          />
        </div>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="form-input w-full"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="form-input w-full"
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-2 text-gray-500 cursor-pointer"
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2 w-3 h-3 accent-amber-500 cursor-pointer"
            />

            <label htmlFor="rememberMe" className="text-sm">
              Remember me
            </label>
          </div>

          <a
            href="/forgot-password"
            className="text-blue-500 text-sm"
          >
            Forgot Password?
          </a>
        </div>

        <div className="flex justify-center mt-5">
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setIsHoveringLogin(true)}
            onMouseLeave={() => setIsHoveringLogin(false)}
            className={`px-4 py-2 bg-amber-400 rounded-full text-sm font-medium text-black transition ${
              loading
                ? "cursor-not-allowed opacity-70"
                : "cursor-pointer hover:scale-110"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;