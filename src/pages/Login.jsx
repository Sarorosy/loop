import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../utils/idb";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Google Sign-In Callback
  const handleGoogleCallback = async (response) => {
    const jwt = response.credential;
    const payload = JSON.parse(atob(jwt.split(".")[1])); // Decode JWT
    // console.log("Google Email:", payload.email);
    handleSubmit(payload.email);
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        //client_id:"206783732985-tik2esbefh0is6domtdi477vur7cno31.apps.googleusercontent.com",
        client_id: "206783732985-52qm38amnimfkm1c0g41206en2q77uls.apps.googleusercontent.com",
        callback: handleGoogleCallback,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  const handleSubmit = async (autoEmail = null) => {
    console.log("comingg");
    if (!autoEmail) {
      if (!email) {
        toast.error("Pls Enter Email");
        return;
      }
      if (!password) {
        toast.error("Pls Enter Password");
        return;
      }
    }

    try {
      let payload = "";
      if (autoEmail) {
        payload = { email: autoEmail, password: null, isGoogle: true };
      } else {
        payload = { email, password, isGoogle: false };
      }

      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.status) {
        toast.success("Login success");
        login(data.user);
        navigate("/");
      } else {
        toast.error("Invalid Email or Password" || data.message);
      }
    } catch (e) {}
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm space-y-3">
        <h2 className="text-2xl font-semibold text-center">Login</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="space-y-2 relative">
          <label className="block text-sm font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.preventDefault(); // prevent form submission
              handleSubmit();
            }}
            type="button"
            className="text-sm bg-blue-400 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            Login
          </button>
        </div>

        <div className="text-center text-sm text-gray-500">or</div>

        <div id="googleSignInDiv" className="flex justify-center" />
      </form>
    </div>
  );
};

export default Login;
