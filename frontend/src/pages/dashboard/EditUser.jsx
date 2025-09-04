import React, { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import api from "../../utils/api.js"
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import Loader from "../../components/Loader";

const EditUser = ({ userId, setActiveTab }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [dob, setDob] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error] = useState(""); // Replace with actual error state
    const [success] = useState(""); // Replace with actual success state
    const [loading, setLoading] = useState(false);

    const togglePassword = () => {
        setPasswordVisible((prev) => !prev);
    };

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
            try {
                const res = await api.get(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}`, { withCredentials: true });

                if (res.status === 200) {
                    const user = res.data.user; // this contains your fetched user
                    
                    setName(user.username || "");
                    setEmail(user.email || "");
                    if (user.dob) {
                        const formattedDob = new Date(user.dob)
                            .toISOString()   // gives "2002-01-10T00:00:00.000Z"
                            .split("T")[0];  // keeps only "2002-01-10"
                        setDob(formattedDob);
                    } else {
                        setDob("");
                    }
                }
            } catch (err) {
                if (err.response.status === 401) {
                    toast.error("You are not authorized to change it!")
                } else {
                    toast.error("Something went wrong!")
                }
            } finally {
                setLoading(false)
            }
        };

        if (userId) fetchUser();
    }, [userId]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await api.put(
                `${import.meta.env.VITE_API_BASE_URL}/users/${userId}`,{name, email, dob, password},
                { withCredentials: true }
            );
            if (res.status === 200) {
                toast.success("User Edit sucessfully!");
                setActiveTab("Overview");

            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 401) {
                    toast.error("You are not authorized to create user!");
                } else {
                    toast.error("Something went wrong!");
                }
            } else {
                // No response -> network error
                toast.error("Network error. Please check your connection.");
            }
        }

        // Submit logic here
    };
    if (loading) return <Loader text={"Loading User Information ..."} />;
    return (
        <div
            className=" bg-cover bg-center flex items-center justify-center px-4"

        >

            {/* style={{ backgroundImage: "url('/images/login_wallpaper.jpg')" }} */}
            <div className="bg-neutral-100 backdrop-blur-md  rounded-xl shadow-lg p-8 w-full max-w-md">
                <h3 className="text-center text-2xl text-black font-semibold mb-6">Edit User</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Name */}
                    <div>
                        <label className="block mb-1 text-black font-medium">Name</label>
                        <input
                            type="text"
                            name="username"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter user name"

                            className="text-black w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block mb-1 text-black font-medium">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"

                            className="text-black w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                    </div>

                    {/* DOB */}
                    <div>
                        <label className="block mb-1 text-black font-medium">Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}

                            className="text-black w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <label className="block mb-1 text-black font-medium">Password</label>
                        <input
                            type={passwordVisible ? "text" : "password"}
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"

                            className="text-black w-full pr-10 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                        <span
                            className="absolute right-3 top-9 text-black text-lg cursor-pointer"
                            onClick={togglePassword}
                        >
                            {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </span>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="cursor-pointer w-full bg-teal-600 hover:bg-teal-700 duration-200 text-white font-semibold py-2 px-4 rounded-md"
                    >
                        Edit User
                    </button>
                </form>

                {/* Messages */}
                {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}
                {success && <div className="mt-4 text-blue-600 font-medium">{success}</div>}
            </div>
        </div>
    );
};

export default EditUser;
