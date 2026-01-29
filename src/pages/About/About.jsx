import React from "react";
import {
  Zap,
  Map,
  Layout,
  Smile,
  MousePointer2,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

const AboutPage = () => {
  const benefits = [
    {
      icon: <Zap className="w-10 h-10 text-[#39c6c6]" />,
      title: "Smart Route Planning",
      desc: "Our system automatically finds the quickest way to your items, so you spend less time walking and more time getting things done.",
    },
    {
      icon: <Map className="w-10 h-10 text-[#39c6c6]" />,
      title: "Visual Warehouse Map",
      desc: "See your entire warehouse layout in a clear, interactive map. Finding a shelf is now as easy as looking at a picture.",
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-[#39c6c6]" />,
      title: "Boost Productivity",
      desc: "Simple tools designed to help your team work faster and more accurately without the stress of complicated software.",
    },
    {
      icon: <Layout className="w-10 h-10 text-[#39c6c6]" />,
      title: "Total Organization",
      desc: "From the biggest storage zones down to the smallest shelf, everything has its place and is easy to find.",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-slate-900 pt-32 pb-44 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#39c6c6]/20 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#39c6c6]/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl px-8 md:px-16 lg:px-24 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-[1.1]">
              Managing Your Warehouse <br />
              <span className="text-[#39c6c6]">Just Got Simpler</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed mb-12">
              Storix Pro helps you organize, track, and find your inventory
              faster than ever. No complicated manuals—just a smart, visual way
              to run your business.
            </p>
            <div className="flex flex-wrap gap-5">
              <button className="bg-[#39c6c6] hover:bg-[#2eb1b1] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-[#39c6c6]/20 transition-all active:scale-95">
                Get Started Now
              </button>
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-10 py-4 rounded-2xl font-bold transition-all border border-slate-700">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- THE SOLUTION SECTION --- */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-slate-800 tracking-tight">
                Why Choose Storix Pro?
              </h2>
              <div className="space-y-6 text-slate-600 text-lg leading-loose">
                <p>
                  We know that a busy warehouse can be stressful. That's why we
                  built a tool that takes the guesswork out of your daily tasks.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#39c6c6] w-6 h-6" />
                    <span>No more searching for lost items</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#39c6c6] w-6 h-6" />
                    <span>Spend less time on training new staff</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#39c6c6] w-6 h-6" />
                    <span>Work smoothly on computers or mobile tablets</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-[#39c6c6]/10 rounded-[3rem] blur-2xl"></div>
              <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 transition-transform hover:-translate-y-2">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="p-5 bg-[#39c6c6]/10 rounded-full text-[#39c6c6]">
                    <Smile className="w-16 h-16" />
                  </div>
                  <h3 className="text-2xl font-bold">User-Friendly Design</h3>
                  <p className="text-slate-500">
                    Our interface is designed for real people. If you can use a
                    smartphone, you can master Storix Pro in minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENEFITS GRID --- */}
      <section className="py-32 bg-slate-900 text-white text-center">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <div className="mb-20">
            <h2 className="text-4xl font-bold mb-6">
              Designed for Your Success
            </h2>
            <div className="w-24 h-1.5 bg-[#39c6c6] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="group p-10 rounded-3xl bg-slate-800/40 border border-slate-800 hover:border-[#39c6c6]/50 hover:bg-slate-800 transition-all text-left"
              >
                <div className="mb-8 transform group-hover:-translate-y-2 transition-transform duration-300">
                  {b.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{b.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SIMPLICITY SECTION --- */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <div className="bg-gradient-to-br from-white to-slate-100 p-12 md:p-20 rounded-[4rem] flex flex-col lg:flex-row justify-between items-center gap-16 border border-slate-200">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-slate-800 mb-8">
                Works Where You Work
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Whether you're sitting at your desk or walking the warehouse
                floor with a tablet, Storix Pro stays in sync. Our goal is to
                make your workday feel lighter and more productive.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#39c6c6]">
                    <MousePointer2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">Point & Click</p>
                    <p className="text-sm text-slate-500">
                      Simple controls for everyone.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#39c6c6]">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">Real-Time Updates</p>
                    <p className="text-sm text-slate-500">
                      Information that is always fresh.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="aspect-video bg-slate-200 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center italic text-slate-400">
                [Clean Image of User Interface]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- THE DEVELOPER --- */}
      <section className="py-32 text-center bg-white">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <h2 className="text-3xl font-bold text-slate-800 mb-20">
            The Person Behind Storix
          </h2>
          <div className="inline-block group">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#39c6c6] rounded-[3rem] rotate-6"></div>
              <div className="relative w-48 h-48 rounded-[2.5rem] overflow-hidden bg-slate-100 border-4 border-white shadow-xl">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="Le Cao Thang"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-2">
              Lê Cao Thắng
            </h3>
            <p className="text-[#39c6c6] font-bold mb-6 tracking-widest uppercase text-sm italic">
              Project Founder
            </p>
            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
              Dedicated to creating simple and helpful tools that make a real
              difference for warehouse teams everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-slate-500 text-sm">
            <p className="font-bold text-white mb-2 text-xl">
              Storix <span className="text-[#39c6c6]">Pro</span>
            </p>
            <p>© 2026. Making logistics simple and stress-free.</p>
          </div>
          <div className="flex gap-10 text-slate-400 font-medium">
            <a href="#" className="hover:text-[#39c6c6] transition-colors">
              Support
            </a>
            <a href="#" className="hover:text-[#39c6c6] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[#39c6c6] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
