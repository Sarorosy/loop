import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const SetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetch(
          `https://loopback-n3to.onrender.com/api/users/verify_password_token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );
        const data = await res.json();
        if (data.status) {
          setIsTokenValid(true);
        } else {
          toast.error("Invalid or expired token.");
        }
      } catch (err) {
        toast.error("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);
  const [submitting , setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword)
      return toast.error("Please fill in all fields.");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match.");

    try {
        setSubmitting(true)
      const res = await fetch("https://loopback-n3to.onrender.com/api/users/set_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.status) {
        toast.success("Password set successfully!");
        setTimeout(() => navigate("/"), 1000);
      } else {
        toast.error(data.message || "Failed to set password.");
      }
    } catch (err) {
      toast.error("Error setting password.");
    }finally{
        setSubmitting(false)
    }
  };

  if (loading) return <div className="p-4">Verifying token...</div>;
  if (!isTokenValid)
    return <div className="p-4 text-red-500">Invalid or expired token.</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Set Your Password</h2>

        <label className="block mb-2 text-sm font-medium">Password</label>
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-3 py-2 border rounded pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <label className="block mb-2 text-sm font-medium">
          Confirm Password
        </label>
        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="w-full px-3 py-2 border rounded pr-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600"
          >
            {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <div className="flex w-full justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-32 text-sm bg-orange-600 text-white py-1 rounded hover:bg-orange-700 transition"
          >
            {submitting ? "Saving..." : "Save Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetPassword;
