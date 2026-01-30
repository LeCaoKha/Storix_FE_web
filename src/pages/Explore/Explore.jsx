import React from "react";
import {
  Box,
  Map as MapIcon,
  Smartphone,
  Navigation,
  Layers,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const ExplorePage = () => {
  const modules = [
    {
      title: "Interactive Map Designer",
      icon: <MapIcon className="w-8 h-8" />,
      image:
        "http://googleusercontent.com/image_collection/image_retrieval/3385340630421269249_0",
      desc: "Replace dull spreadsheets with an intuitive visual interface. Design your warehouse layout in minutes with drag-and-drop shelving, path definitions, and professional 2D space management.",
      features: [
        "Easy Drag & Drop",
        "Precise Meter Scaling",
        "Custom Color Zoning",
      ],
    },
    {
      title: "Smart Path Navigation",
      icon: <Navigation className="w-8 h-8" />,
      image:
        "http://googleusercontent.com/image_collection/image_retrieval/10479371499056414656_0",
      desc: "The system automatically calculates the shortest routes for your staff. No more wandering through aisles—simply follow the optimized path to reach your destination faster.",
      features: [
        "Real-time Route Calculation",
        "Smart Obstacle Avoidance",
        "Save 30% in Travel Time",
      ],
    },
    {
      title: "Mobile Inventory Sync",
      icon: <Smartphone className="w-8 h-8" />,
      image:
        "http://googleusercontent.com/image_collection/image_retrieval/4749835274470575521_0",
      desc: "Take the power of Storix anywhere. Our mobile app guides staff to the exact storage bin, ensuring picking accuracy is maintained every single time.",
      features: [
        "Digital Pick-lists",
        "Instant Inventory Updates",
        "Tablet & Phone Support",
      ],
    },
  ];

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-slate-900 pt-40 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 text-center">
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#39C6C6]/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-sky-500/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
            Discover the{" "}
            <span className="text-[#39C6C6]">Power of Visuals</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Discover the smart tools that transform chaotic warehouses into
            highly organized and efficient workspaces.
          </p>
        </div>
      </section>

      {/* --- FEATURE SHOWCASE --- */}
      <section className="py-32 space-y-40">
        {modules.map((module, idx) => (
          <div key={idx} className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
            <div
              className={`flex flex-col lg:flex-row items-center gap-20 ${idx % 2 !== 0 ? "lg:flex-row-reverse" : ""}`}
            >
              {/* Text Side */}
              <div className="lg:w-1/2 space-y-8">
                <div className="w-16 h-16 bg-[#39C6C6]/10 rounded-2xl flex items-center justify-center text-[#39C6C6]">
                  {module.icon}
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-slate-800">
                  {module.title}
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {module.desc}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {module.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-slate-700 font-medium"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#39C6C6]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Side */}
              <div className="lg:w-1/2 w-full">
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#39C6C6]/20 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative aspect-video rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl">
                    <img
                      src={module.image}
                      alt={module.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* --- BINS & LEVELS SECTION --- */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center bg-slate-900 rounded-[4rem] p-8 md:p-16 text-white overflow-hidden relative">
            <div className="z-10">
              <Layers className="w-16 h-16 text-[#39C6C6] mb-8" />
              <h2 className="text-4xl font-bold mb-8 tracking-tight">
                Detail Down to Every Bin
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                The system doesn't just manage shelves; it dives deep into every{" "}
                <strong>Level</strong> and <strong>Bin</strong>. Whether goods
                are on the bottom floor or the top rack, Storix locates the
                exact coordinates to guide you.
              </p>
              <div className="flex gap-8">
                <div>
                  <p className="text-[#39C6C6] text-4xl font-black">100%</p>
                  <p className="text-xs uppercase tracking-widest font-bold opacity-60">
                    Visibility
                  </p>
                </div>
                <div className="w-px h-12 bg-white/10"></div>
                <div>
                  <p className="text-[#39C6C6] text-4xl font-black">Fast</p>
                  <p className="text-xs uppercase tracking-widest font-bold opacity-60">
                    Data Sync
                  </p>
                </div>
              </div>
            </div>
            <div className="relative h-full min-h-[300px] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="http://googleusercontent.com/image_collection/image_retrieval/16871016596745397456_0"
                alt="Bins and Shelving"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExplorePage;
