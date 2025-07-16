import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo-new.png";
import { MailIcon } from "lucide-react";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email input, 2: OTP + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if(!email){
        toast.error("Please enter your email");
        return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(
        "https://loopback-n3to.onrender.com/api/users/forgot-password-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        toast.success("OTP sent to your email");
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Network error");
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(
        "https://loopback-n3to.onrender.com/api/users/send-password-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully");
        navigate('/login')
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (err) {
      toast.error("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f2f7ff] p-4">
    <div className="bg-white p-4 rounded shadow-md w-full max-w-sm space-y-3">
      <div className="flex justify-center border-b border-gray-300 pb-3">
                <img src={logo} className="h-6 w-auto" />
              </div>
              <h2 className="text-[12px] text-gray-900 text-center">
                Forgot Password
              </h2>

      {message && <div className="mb-4 text-sm text-orange-600">{message}</div>}

      {step === 1 && (
        <form onSubmit={handleEmailSubmit}>
          <div className="space-y-1">
          <div className="relative">
            {/* <label className="block text-[13px] font-medium">
              Enter your email
            </label> */}
            <input
              type="email"
              className="w-full px-2 py-1.5 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              
            />
            <div className="absolute inset-y-0 right-2 flex items-center text-gray-500">
             <MailIcon size={15}  />
            </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">

          <button
            type="submit"
            className="text-[13px] bg-orange-500 text-white px-2 py-1.5 rounded hover:bg-orange-700 transition cursor-pointer flex items-center gap-1 leading-none"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit}>
          <label className="block mb-2 text-sm font-medium">
            Enter the OTP sent to your email
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          
          <div className="flex justify-end">
          <button
            type="submit"
            className="w-24 f-11 bg-green-500 text-white py-1 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Reset Password"}
          </button>
          </div>
        </form>
      )}
    </div>
    </div>
  );
};

export default ForgotPassword;
