import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>

      {message && <div className="mb-4 text-sm text-orange-600">{message}</div>}

      {step === 1 && (
        <form onSubmit={handleEmailSubmit}>
          <label className="block mb-2 text-sm font-medium">
            Enter your email
          </label>
          <input
            type="email"
            className="w-full p-2 border rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            
          />
          <div className="flex justify-end">

          <button
            type="submit"
            className="f-11 bg-orange-500 text-white py-1 rounded disabled:opacity-50 w-24"
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
  );
};

export default ForgotPassword;
