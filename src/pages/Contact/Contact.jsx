import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Globe,
  Github,
  Linkedin,
} from "lucide-react";

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert(
      "Thank you! We've received your message and will get back to you shortly.",
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-slate-900 pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#39C6C6]/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-sky-500/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Get in <span className="text-[#39C6C6]">Touch</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Have questions about Storix Pro? Our team is here to help you
            optimize your warehouse operations and streamline your workflow.
          </p>
        </div>
      </section>

      {/* --- CONTACT CONTENT --- */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Left Side: Contact Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-6 italic underline decoration-[#39C6C6] decoration-4 underline-offset-8">
                  Contact Information
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                  We value your feedback. Whether you're a business looking for
                  a solution or a developer interested in our tech, feel free to
                  reach out.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-[#39C6C6]/10 rounded-2xl flex items-center justify-center text-[#39C6C6] group-hover:bg-[#39C6C6] group-hover:text-white transition-all shadow-sm">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">
                      Our Office
                    </h4>
                    <p className="text-slate-500">
                      7 D1 Street, Thu Duc, Ho Chi Minh City, Vietnam
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-[#39C6C6]/10 rounded-2xl flex items-center justify-center text-[#39C6C6] group-hover:bg-[#39C6C6] group-hover:text-white transition-all shadow-sm">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">
                      Email Support
                    </h4>
                    <p className="text-slate-500">support@storix.com</p>
                    <p className="text-slate-500">contact@lecaothang.dev</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-[#39C6C6]/10 rounded-2xl flex items-center justify-center text-[#39C6C6] group-hover:bg-[#39C6C6] group-hover:text-white transition-all shadow-sm">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">
                      Call Us
                    </h4>
                    <p className="text-slate-500">+84 123 456 789</p>
                    <p className="text-slate-500">
                      Mon - Fri, 8:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-8 flex gap-4">
                {[
                  { Icon: Github, link: "https://github.com" },
                  { Icon: Linkedin, link: "https://linkedin.com" },
                  { Icon: Globe, link: "https://lecaothang.dev" },
                ].map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 bg-white rounded-full text-slate-400 hover:text-[#39C6C6] hover:shadow-md transition-all border border-slate-100"
                  >
                    <item.Icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>

            {/* Right Side: Contact Form */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#39C6C6]/10 rounded-[3rem] blur-3xl opacity-50"></div>
              <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-12 border border-slate-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-[0.2em]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39C6C6]/50 focus:bg-white transition-all"
                        placeholder="John Doe"
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-[0.2em]">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39C6C6]/50 focus:bg-white transition-all"
                        placeholder="john@example.com"
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-[0.2em]">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39C6C6]/50 focus:bg-white transition-all"
                      placeholder="I'm interested in a demo..."
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-[0.2em]">
                      Message
                    </label>
                    <textarea
                      rows="4"
                      required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39C6C6]/50 focus:bg-white transition-all resize-none"
                      placeholder="Tell us how we can help..."
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#39C6C6] hover:bg-[#2eb1b1] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#39C6C6]/20 active:scale-95"
                  >
                    Send Message <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="text-slate-500 text-sm">
            <p className="font-bold text-white mb-2 text-xl tracking-tight">
              Storix <span className="text-[#39C6C6]">Pro</span>
            </p>
            <p>© 2026. A graduation project by Le Cao Thang.</p>
          </div>
          <div className="flex gap-10 text-slate-400 font-medium text-sm">
            <span
              className="hover:text-[#39C6C6] cursor-pointer"
              onClick={() => navigate("/")}
            >
              Home
            </span>
            <span
              className="hover:text-[#39C6C6] cursor-pointer"
              onClick={() => navigate("/about")}
            >
              About Us
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
