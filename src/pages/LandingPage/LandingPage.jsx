import React from "react";
import chooseImage from "../../assets/images";
import { useNavigate } from "react-router-dom";

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
        <div className="relative z-10 flex flex-col h-full px-10">
          {/* ================= HEADER ================= */}
          <header className="flex items-center justify-between py-8">
            {/* Logo */}
            <div
              onClick={() => {
                navigate("/");
              }}
              className="flex items-center gap-2 over cursor-pointer"
            >
              <img
                src={chooseImage("logoStorixWithText")}
                alt="Storix"
                className="h-13"
              />
            </div>

            {/* Menu */}
            <div className="text-white flex items-center gap-10 text-xl opacity-90">
              <p
                className="relative cursor-pointer
    after:absolute after:left-0 after:-bottom-1
    after:h-[2px] after:w-full after:bg-white
    after:opacity-0
    after:transition-opacity after:duration-300
    hover:after:opacity-100"
                onClick={() => {
                  navigate("/");
                }}
              >
                Home
              </p>
              <p
                className="relative cursor-pointer
    after:absolute after:left-0 after:-bottom-1
    after:h-[2px] after:w-full after:bg-white
    after:opacity-0
    after:transition-opacity after:duration-300
    hover:after:opacity-100"
                onClick={() => {
                  navigate("/explore");
                }}
              >
                Explore
              </p>
              <p
                className="relative cursor-pointer
    after:absolute after:left-0 after:-bottom-1
    after:h-[2px] after:w-full after:bg-white
    after:opacity-0
    after:transition-opacity after:duration-300
    hover:after:opacity-100"
                onClick={() => {
                  navigate("/about");
                }}
              >
                About Us
              </p>
              <p
                className="relative cursor-pointer
    after:absolute after:left-0 after:-bottom-1
    after:h-[2px] after:w-full after:bg-white
    after:opacity-0
    after:transition-opacity after:duration-300
    hover:after:opacity-100"
                onClick={() => {
                  navigate("/contact");
                }}
              >
                Contact
              </p>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/auth?mode=signIn")}
                className="text-white cursor-pointer px-5 py-2 border border-white/50 rounded-full hover:bg-white/10 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/auth?mode=signUp")}
                className="cursor-pointer px-5 py-2 rounded-full bg-[#39C6C6] text-white font-medium hover:opacity-90 transition"
              >
                Sign Up
              </button>
            </div>
          </header>

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
        <section className="w-full bg-white py-20">
          <div className="mx-auto max-w-6xl px-6 text-center">
            {/* Title */}
            <h2
              style={{ fontFamily: "Inter, sans-serif" }}
              className="text-5xl font-bold text-gray-900"
            >
              One Platform All Solutions
            </h2>
            <p className="mt-4 text-[var(--color-text-muted)] max-w-2xl mx-auto">
              Storix provides a comprehensive digital transformation platform
              for businesses of all sizes, helping them streamline warehouse
              operations, manage inventory more effectively, and reduce manual
              work.
            </p>

            {/* Cards */}
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Card 1 */}
              <div className="flex flex-col items-center rounded-2xl bg-[#212424] p-8 text-white">
                <div className="mb-6 flex w-17 h-17 items-center justify-center rounded-full bg-white/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="55"
                    height="55"
                    viewBox="0 0 24 24"
                  >
                    <g fill="none" fill-rule="evenodd">
                      <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
                      <path
                        fill="#fff"
                        d="M12 2a2 2 0 0 1 1 3.73V6h3a4 4 0 0 1 4 4v.05a2.501 2.501 0 0 1 0 4.9V16a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-1.05a2.5 2.5 0 0 1 0-4.9V10a4 4 0 0 1 4-4h3v-.27A2 2 0 0 1 12 2m-3 9a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1m6 0a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1"
                      />
                    </g>
                  </svg>
                </div>

                <h3
                  style={{ fontFamily: "Inter, sans-serif" }}
                  className="text-xl font-semibold"
                >
                  Smart Inventory Management
                </h3>
                <p className="text-left mt-2 text-md text-white/70 leading-relaxed">
                  Real-time inventory tracking combined with automated stock
                  control helps minimize shortages, reduce overstock, and
                  maintain accurate inventory levels across the warehouse.
                </p>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col items-center rounded-2xl bg-[#212424] p-8 text-white">
                <div className="mb-6 flex h-17 w-17 rounded-full items-center justify-center bg-white/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="55"
                    height="55"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#fff"
                      fill-rule="evenodd"
                      d="M14.208 4.83q.68.21 1.3.54l1.833-1.1a1 1 0 0 1 1.221.15l1.018 1.018a1 1 0 0 1 .15 1.221l-1.1 1.833q.33.62.54 1.3l2.073.519a1 1 0 0 1 .757.97v1.438a1 1 0 0 1-.757.97l-2.073.519q-.21.68-.54 1.3l1.1 1.833a1 1 0 0 1-.15 1.221l-1.018 1.018a1 1 0 0 1-1.221.15l-1.833-1.1q-.62.33-1.3.54l-.519 2.073a1 1 0 0 1-.97.757h-1.438a1 1 0 0 1-.97-.757l-.519-2.073a7.5 7.5 0 0 1-1.3-.54l-1.833 1.1a1 1 0 0 1-1.221-.15L4.42 18.562a1 1 0 0 1-.15-1.221l1.1-1.833a7.5 7.5 0 0 1-.54-1.3l-2.073-.519A1 1 0 0 1 2 12.72v-1.438a1 1 0 0 1 .757-.97l2.073-.519q.21-.68.54-1.3L4.27 6.66a1 1 0 0 1 .15-1.221L5.438 4.42a1 1 0 0 1 1.221-.15l1.833 1.1q.62-.33 1.3-.54l.519-2.073A1 1 0 0 1 11.28 2h1.438a1 1 0 0 1 .97.757zM12 16a4 4 0 1 0 0-8a4 4 0 0 0 0 8"
                    />
                  </svg>
                </div>
                <h3
                  style={{ fontFamily: "Inter, sans-serif" }}
                  className="text-xl font-semibold"
                >
                  Warehouse Operations Optimization
                </h3>
                <p className="mt-2 text-left text-md text-white/70 leading-relaxed">
                  Streamline inbound, outbound, and picking processes with
                  intelligent workflows that improve efficiency and
                  significantly reduce operational costs.
                </p>
              </div>

              {/* Card 3 */}
              <div className="flex flex-col items-center rounded-2xl bg-[#212424] p-8 text-white">
                <div className="mb-6 flex h-17 w-17 items-center justify-center rounded-full bg-white/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="55"
                    height="55"
                    viewBox="0 0 512 512"
                  >
                    <path
                      fill="#fff"
                      d="M272 41.69V188a4 4 0 0 0 4 4h146.31a2 2 0 0 0 1.42-3.41L275.41 40.27a2 2 0 0 0-3.41 1.42"
                    />
                    <path
                      fill="#fff"
                      d="M248 224a8 8 0 0 1-8-8V32H92a12 12 0 0 0-12 12v424a12 12 0 0 0 12 12h328a12 12 0 0 0 12-12V224Zm104 160H160v-32h192Zm0-80H160v-32h192Z"
                    />
                  </svg>
                </div>
                <h3
                  style={{ fontFamily: "Inter, sans-serif" }}
                  className="text-xl font-semibold"
                >
                  Data Analytics & Insights
                </h3>
                <p className="mt-2 text-md text-left text-white/70 leading-relaxed">
                  Powerful dashboards and reports that turn warehouse data into
                  actionable insights for better planning and faster
                  decision-making.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-16 flex justify-center">
              <button
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
          </div>
        </section>
      </div>

      {/* ============================= section 3 ============================= */}
      <div className="relative w-full h-screen overflow-x-hidden">
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
          <div className="px-5 py-2 border-l-4 border-l-[var(--color-primary)]">
            <h3 className="text-4xl mb-2 font-semibold">
              Smart Inventory Management
            </h3>
            <p className="text-lg">
              Track stock levels in real time, reduce manual errors, and always
              know what is available in your warehouse.
            </p>
          </div>

          {/* ============ ITEM 2 ============ */}
          <div className="px-5 py-2 border-l-4 border-l-[var(--color-primary)]">
            <h3 className="text-4xl mb-2 font-semibold">
              Smart Inventory Management
            </h3>
            <p className="text-lg">
              Track stock levels in real time, reduce manual errors, and always
              know what is available in your warehouse.
            </p>
          </div>

          {/* ============ ITEM 3 ============ */}
          <div className="px-5 py-2 border-l-4 border-l-[var(--color-primary)]">
            <h3 className="text-4xl mb-2 font-semibold">
              Smart Inventory Management
            </h3>
            <p className="text-lg">
              Track stock levels in real time, reduce manual errors, and always
              know what is available in your warehouse.
            </p>
          </div>

          {/* ============ ITEM 4 ============ */}
          <div className="px-5 py-2 border-l-4 border-l-[var(--color-primary)]">
            <h3 className="text-4xl mb-2 font-semibold">
              Smart Inventory Management
            </h3>
            <p className="text-lg">
              Track stock levels in real time, reduce manual errors, and always
              know what is available in your warehouse.
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
      <footer className="bg-[#1a1c1e] text-gray-300 py-16 px-6 md:px-12 font-sans">
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
