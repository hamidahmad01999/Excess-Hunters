import React, { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js"

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {login} = useAuth();
  const {user} = useAuth() || null;
  const navigate = useNavigate();

  useEffect(()=>{
    if(user){
      navigate("/");
    }
  },[])

  const togglePassword = () => {
    setPasswordVisible((prev) => !prev);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email.trim() === "" || password.trim() === "") {
      toast.error("Please fill all fields!")
      return false;
    }
    try {
      const res = await api.post(
        `${import.meta.env.VITE_API_BASE_URL}/login`,
        { email, password },
        { withCredentials: true }
      );
      toast.success("Login sucessfull!")
      login(res?.data);
      navigate("/auctions")
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          toast.error("Invalid email or password");
        } else if (err.response.status === 400) {
          toast.error("Fill all fields");
        } else {
          toast.error("Something went wrong");
        }
      }else{
        toast.error("Network error. Please check your connection.");
        console.error(err.message);
      }
    }
    setEmail("");
    setPassword("");
  };

  return (
    <div
      className="h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/login_wallpaper.jpg')" }}
    >
      <div className="text-white bg-[rgba(0,0,0,0.3)] backdrop-blur-md rounded-xl shadow-lg p-8 w-full max-w-sm">
        <h3 className="text-center text-2xl  text-white font-semibold mb-6">Start Adventure Now!</h3>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-1 text-neutral-200 font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="outline-none w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block mb-1 text-neutral-200 font-medium">
              Password
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="outline-none w-full pr-10 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span
              className="absolute right-3 top-9 text-white text-lg cursor-pointer"
              onClick={togglePassword}
            >
              {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 cursor-pointer"
          >
            Login
          </button>
        </form>

        {/* Error Message Example */}
        {/* <div className="mt-4 text-red-600 font-medium">Invalid email or password</div> */}
      </div>
    </div>
  );
};

export default Login;
