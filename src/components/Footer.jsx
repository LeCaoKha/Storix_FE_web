import React from "react";
import chooseImage from "../assets/images";

const Footer = () => {
  return (
    <div>
      <footer className="bg-slate-950 text-gray-300 py-16 px-6 md:px-12 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Cột 1: Logo & Description */}
          <div className="flex flex-col space-y-6">
            <div className="w-48">
              <img
                src={chooseImage("logoStorixWithText")}
                alt="Storix Logo"
                className="w-full h-auto object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed max-w-sm opacity-80">
              Storix helps businesses manage warehouse inventory more
              efficiently with real-time tracking and intelligent
              recommendations. The system reduces errors, speeds up picking
              operations, and supports better inventory decisions.
            </p>
          </div>

          {/* Cột 2: Information */}
          <div className="flex flex-col">
            <h3 className="text-[#26c6da] text-xl font-medium mb-6 pb-1 border-b-2 border-[#26c6da] w-max min-w-[140px]">
              Information
            </h3>
            <ul className="space-y-4 text-sm transition-all">
              <li>
                <a href="#" className="hover:text-[#26c6da] transition-colors">
                  Explore
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#26c6da] transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#26c6da] transition-colors">
                  License
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#26c6da] transition-colors">
                  Help & Support
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Contact Address */}
          <div className="flex flex-col">
            <h3 className="text-[#26c6da] text-xl font-medium mb-6 pb-1 border-b-2 border-[#26c6da] w-max min-w-[140px]">
              Contact Address
            </h3>
            <div className="space-y-4 text-sm opacity-90">
              <p className="leading-relaxed">
                <span className="font-semibold text-white">Address:</span> 7 Đ.
                D1, Long Thạnh Mỹ, Thủ Đức, Thành phố Hồ Chí Minh 700000
              </p>
              <p>
                <span className="font-semibold text-white">Website:</span>{" "}
                <a
                  href="https://storix.com"
                  className="hover:underline underline-offset-4 decoration-[#26c6da]"
                >
                  https://storix.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
