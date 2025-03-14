import React, { useContext, useEffect } from "react";
import Header from "../components/common/Header";
import { motion } from "framer-motion";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const EmailVerify = () => {
  axios.defaults.withCredentials = true;

  const { backendUrl, isLoggedin, userData, getUserData } =
    useContext(AppContext);

  const navigate = useNavigate();

  //Store the OTP
  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Delete the input number using backspace button on keyboard
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // OTP Paste : copy OTP from email, paste it in the input by "ctrl+v" & it should be filled in all 6 input places
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text"); // data added
    // split it (added Data)
    const pasteArray = paste.split("");

    // ** Now paste all the number one by one in the input field
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      // store the OTP in the otpArray
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join(""); // join this array & create a single string

      // Backend API call
      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-account",
        { otp }
      );

      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // restrict route '/email-verify'
  useEffect(() => {
    isLoggedin && userData && userData.isAccountVerified && navigate("/");
  }, [isLoggedin, userData]);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Email Verify" />

      <div className="max-w-xl mx-auto py-6 px-4 lg:px-8 ">
        <main className="max-w-xl mx-auto py-10 px-4 mt-7 lg:px-8 ">
          <motion.div
            className="bg-slate-900 p-10 rounded-xl shadow-lg  shadow-blue-700 w-full sm:w-96 text-indigo-300 text-sm items-center "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-white text-2xl font-semibold text-center mb-4">
              Email Verification OTP
            </h1>
            <p className="text-center mb-6 text-indigo-300">
              Enter the six digit code sent to your email.
            </p>
            <form onSubmit={onSubmitHandler}>
              <div className="flex justify-between mb-8" onPaste={handlePaste}>
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <input
                      type="text"
                      key={index}
                      className="w-6 h-6 md:w-12 md:h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                      ref={(e) => (inputRefs.current[index] = e)}
                      // move cursor to next automatically
                      onInput={(e) => handleInput(e, index)}
                      // backspace key
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      required
                      maxLength={1}
                    />
                  ))}
              </div>

              <button className="w-full py-2 bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-full text-white  text-base hover:font-semibold cursor-pointer">
                Verify Email
              </button>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default EmailVerify;
