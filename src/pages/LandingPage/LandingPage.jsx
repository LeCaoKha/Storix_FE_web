import React from "react";
import chooseImage from "../../assets/images";
import { useNavigate } from "react-router-dom";
import { Zap, Layout, ShieldCheck } from "lucide-react"; // Cài đặt lucide-react nếu chưa có

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* ============================= section 1 ============================= */}
      <div className="relative w-full h-screen overflow-x-hidden">
        {/* Background image */}
        <img
          src={chooseImage("landingPageBG_1")}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-10 pt-30">
          {/* ================= HERO ================= */}
          <section className="flex flex-1 items-center px-15 mb-15">
            <div className="">
              <h1
                style={{ fontFamily: "Inter, sans-serif" }}
                className="text-7xl text-white font-bold leading-tight mb-6"
              >
                Intelligent Warehouse <br />
                Management Platform
              </h1>

              <p className="max-w-2xl text-white text-2xl mb-10">
                A smart warehouse management platform that helps businesses
                optimize operations and inventory in real time
              </p>

              <button
                onClick={() => navigate("/auth")}
                className="cursor-pointer text-2xl flex items-center gap-3 pl-10 pr-3 py-3 rounded-full text-white font-semibold"
                style={{
                  background:
                    "linear-gradient(90deg, #39C6C6 0%, #399EC6 100%)",
                }}
              >
                Try it yourself
                <span className="w-15 h-15 flex items-center justify-center bg-white rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="#000"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 12h16m-7-7l7 7l-7 7"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ============================= section 2 ============================= */}
      <div>
        <section className="w-full bg-slate-50 py-32">
          <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 text-center">
            <div className="mb-10">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                One Platform. All Solutions.
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed italic">
                Storix provides everything you need to manage your items
                accurately without the stress of complicated spreadsheets.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {/* Card 1 */}
              <div className="group flex flex-col items-center rounded-[2.5rem] bg-white p-10 shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-2">
                <div className="mb-8 flex w-20 h-20 items-center justify-center rounded-3xl bg-[#39C6C6]/10 text-[#39C6C6] transition-colors group-hover:bg-[#39C6C6] group-hover:text-white">
                  <Layout className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Smart Mapping</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  See your entire warehouse layout in a clear, interactive map.
                  Finding a shelf is now as easy as looking at a picture.
                </p>
              </div>

              {/* Card 2 */}
              <div className="group flex flex-col items-center rounded-[2.5rem] bg-white p-10 shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-2">
                <div className="mb-8 flex w-20 h-20 items-center justify-center rounded-3xl bg-[#39C6C6]/10 text-[#39C6C6] transition-colors group-hover:bg-[#39C6C6] group-hover:text-white">
                  <Zap className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Fast Pick-up</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  Spend less time walking and more time getting things done with
                  routes that guide you directly to your target.
                </p>
              </div>

              {/* Card 3 */}
              <div className="group flex flex-col items-center rounded-[2.5rem] bg-white p-10 shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-2">
                <div className="mb-8 flex w-20 h-20 items-center justify-center rounded-3xl bg-[#39C6C6]/10 text-[#39C6C6] transition-colors group-hover:bg-[#39C6C6] group-hover:text-white">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Error Free</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  Automated tracking helps reduce manual mistakes, ensuring your
                  inventory levels are always 100% correct.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ============================= section 3 ============================= */}
      <div className="relative w-full h-screen min-h-[800px] overflow-hidden flex items-center">
        {/* Background image */}
        <img
          src={chooseImage("landingPageBG_2")}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Content */}
        <div
          className="absolute top-1/2 left-[47%] -translate-y-1/2 z-10
                flex flex-col gap-10 max-w-xl text-white"
        >
          {/* ============ ITEM 1 ============ */}
          <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-md border-l-4 border-[#39C6C6] transition-all hover:bg-white/10">
            <h3 className="text-4xl mb-2 font-semibold">Real-time Tracking</h3>
            <p className="text-lg">
              Always know where your items are, exactly when you need them.
            </p>
          </div>

          {/* ============ ITEM 2 ============ */}
          <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-md border-l-4 border-[#39C6C6] transition-all hover:bg-white/10">
            <h3 className="text-4xl mb-2 font-semibold">Visual Layouts</h3>
            <p className="text-lg">
              Custom maps designed specifically for your warehouse floors.
            </p>
          </div>

          {/* ============ ITEM 3 ============ */}
          <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-md border-l-4 border-[#39C6C6] transition-all hover:bg-white/10">
            <h3 className="text-4xl mb-2 font-semibold">Mobile Ready</h3>
            <p className="text-lg">
              Work on the go with your tablet or smartphone seamlessly.
            </p>
          </div>

          {/* ============ ITEM 4 ============ */}
          <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-md border-l-4 border-[#39C6C6] transition-all hover:bg-white/10">
            <h3 className="text-4xl mb-2 font-semibold">Detailed Reports</h3>
            <p className="text-lg">
              Simple insights that help you make better business decisions.
            </p>
          </div>
        </div>
      </div>

      {/* ============================= section 4 ============================= */}
      <div>
        <section className="w-full bg-white py-20">
          <div className="mx-auto max-w-6xl px-6 text-center">
            {/* Title */}
            <h2
              style={{ fontFamily: "Inter, sans-serif" }}
              className="text-4xl font-bold text-gray-900"
            >
              Listen to the feedback from customers who are using Storix{" "}
            </h2>

            {/* Cards */}
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Card 1 */}
              <div className="relative w-full h-full flex flex-col shadow-md items-center rounded-2xl bg-white text-black">
                <div className="w-full h-60 rounded-t-2xl bg-[linear-gradient(90deg,#39C6C6_0%,#84F599_100%)]"></div>
                <div className="flex justify-center items-center w-full h-full px-12 py-0">
                  <p>
                    “Storix has completely changed how we manage our warehouse.
                    We can track inventory in real time and avoid stock issues
                    before they happen.“
                  </p>
                </div>
                <div className="absolute top-[15%]">
                  <img
                    className="h-30"
                    src={chooseImage("landingPageCustomer_1")}
                  />
                </div>
              </div>

              {/* Card 2 */}
              <div className="relative w-full h-full flex flex-col shadow-md items-center rounded-2xl bg-white text-black">
                <div className="w-full h-60 rounded-t-2xl bg-[linear-gradient(90deg,#39C6C6_0%,#84F599_100%)]"></div>
                <div className="flex justify-center items-center w-full h-full px-12 py-0">
                  <p>
                    “Picking orders is much faster and more organized with
                    Storix. Our staff spend less time moving around and more
                    time getting work done.“
                  </p>
                </div>
                <div className="absolute top-[15%]">
                  <img
                    className="h-30"
                    src={chooseImage("landingPageCustomer_2")}
                  />
                </div>
              </div>

              {/* Card 3 */}
              <div className="relative w-full h-full flex flex-col shadow-md items-center rounded-2xl bg-white text-black">
                <div className="w-full h-60 rounded-t-2xl bg-[linear-gradient(90deg,#39C6C6_0%,#84F599_100%)]"></div>
                <div className="flex justify-center items-center w-full h-full px-12 py-0">
                  <p>
                    “The system gives us clear insights instead of just raw
                    numbers. It helps us make better inventory decisions and
                    reduce unnecessary storage costs.”
                  </p>
                </div>
                <div className="absolute top-[15%]">
                  <img
                    className="h-30"
                    src={chooseImage("landingPageCustomer_3")}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ============================= footer ============================= */}
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

export default LandingPage;
