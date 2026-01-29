import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chooseImage from "../assets/images";

const Header = () => {
  const navigate = useNavigate();
  const [isSticky, setIsSticky] = useState(false);

  // Theo dõi sự kiện cuộn chuột
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinkStyle =
    "relative cursor-pointer hover:after:opacity-100 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-[#39C6C6] after:opacity-0 after:transition-opacity after:duration-300";

  return (
    <div
      className={`left-0 w-full z-50 transition-all duration-300 ${
        isSticky
          ? "fixed top-0 bg-slate-900/80 backdrop-blur-md shadow-lg py-4" // Khi cuộn xuống
          : "absolute top-0 bg-transparent py-8" // Khi ở đầu trang
      }`}
    >
      <header className="px-8 md:px-16 lg:px-24 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
        >
          <img
            src={chooseImage("logoStorixWithText")}
            alt="Storix"
            className={`transition-all duration-300 ${isSticky ? "h-10" : "h-13"}`}
          />
        </div>

        {/* Menu - Viết rời từng mục theo ý bạn */}
        <div className="text-white hidden md:flex items-center gap-10 text-xl opacity-90">
          <p className={navLinkStyle} onClick={() => navigate("/")}>
            Home
          </p>

          <p className={navLinkStyle} onClick={() => navigate("/explore")}>
            Explore
          </p>

          <p className={navLinkStyle} onClick={() => navigate("/about")}>
            About Us
          </p>

          <p className={navLinkStyle} onClick={() => navigate("/contact")}>
            Contact
          </p>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/auth?mode=signIn")}
            className="text-white cursor-pointer px-5 py-2 border border-white/50 rounded-full hover:bg-white/10 transition text-sm"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/auth?mode=signUp")}
            className="cursor-pointer px-6 py-2 rounded-full bg-[#39C6C6] text-white font-medium hover:opacity-90 transition shadow-lg shadow-[#39C6C6]/20 text-sm"
          >
            Sign Up
          </button>
        </div>
      </header>
    </div>
  );
};

export default Header;
