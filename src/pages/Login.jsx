import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogInIcon, MailIcon } from "lucide-react";
import { useAuth } from "../utils/idb";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo-new.png";

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
        client_id:
          "206783732985-52qm38amnimfkm1c0g41206en2q77uls.apps.googleusercontent.com",
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
        navigate("/tasks/my");
      } else {
        toast.error("Invalid Email or Password" || data.message);
      }
    } catch (e) {}
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f2f7ff] p-4">
      <form className="bg-white p-4 rounded shadow-md w-full max-w-sm space-y-3">
        <div className="flex justify-center border-b border-gray-300 pb-3">
          <img src={logo} className="h-6 w-auto" />
        </div>
        <h2 className="text-[12px] text-gray-400 text-center">
          Sign into your account
        </h2>
        <div className="space-y-1 mb-4">
          {/* <label className="block text-[13px] font-medium">Email</label> */}
          <div className="relative">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2 py-1.5 text-[13px] border border-gray-300 rounded  
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                hover:border-gray-400 
                active:border-blue-600"
            />
            <div className="absolute inset-y-0 right-2 flex items-center text-gray-500">
             <MailIcon size={15}  />
            </div>
          </div>
        </div>

        <div className="space-y-1 relative">
          {/* <label className="block text-[13px] font-medium">Password</label> */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2 py-1.5 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 cursor-pointer"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between mt-5">
          <div className="">
            <button
              onClick={()=>{navigate('/forgot-password')}}
              type="button"
              className="text-[13px] text-orange-500 hover:text-orange-700  text-center transition cursor-pointer mx-auto"
            >
              Forgot Password ?
            </button>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault(); // prevent form submission
              handleSubmit();
            }}
            type="button"
            className="text-[13px] bg-orange-500 text-white px-2 py-1.5 rounded hover:bg-orange-700 transition cursor-pointer flex items-center gap-1 leading-none"
          >
            Login <LogInIcon size={13} />
          </button>
        </div>

        

        {/* <div className="text-center text-sm text-gray-500">or</div>

        <div id="googleSignInDiv" className="flex justify-center" /> */}
      </form>
    </div>
  );
};

export default Login;
