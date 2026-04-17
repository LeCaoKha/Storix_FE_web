import React, { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  Check, 
  Inbox, 
  Trash2,
  Clock, 
  MoreHorizontal, 
  Package, 
  Truck, 
  ArrowLeftRight, 
  ClipboardCheck, 
  AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

const NotificationDropdown = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'unread'
  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/Notification/get-notifications/${userId}`);
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const handleDelete = async (e, userNotificationId) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click vào item
    try {
      await api.delete(`/Notification/delete/${userId}/${userNotificationId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== userNotificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;

    try {
      // Vì BE có thể chưa có api delete-all, ta lặp hoặc nếu có thì gọi.
      // Theo screenshot của user thì có api delete theo id, ta sẽ lặp.
      await Promise.all(
        notifications.map((n) =>
          api.delete(`/Notification/delete/${userId}/${n.id}`)
        )
      );
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const handleMarkAsRead = async (userNotificationId) => {
    try {
      await api.put(`/Notification/mark-as-read/${userId}/${userNotificationId}`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === userNotificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      // Vì BE chưa có endpoint mark-all-read, ta tạm thời lặp hoặc thông báo cho người dùng
      // Ở đây tôi sẽ thực hiện lặp để đảm bảo trải nghiệm người dùng
      await Promise.all(
        unreadNotifications.map((n) =>
          api.put(`/Notification/mark-as-read/${userId}/${n.id}`)
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (notif) => {
    const type = notif.notification?.type?.toLowerCase() || "";
    const category = notif.notification?.category?.toLowerCase() || "";
    
    if (type.includes("inbound") || category.includes("inbound")) return <Package size={24} />;
    if (type.includes("outbound") || category.includes("outbound")) return <Truck size={24} />;
    if (type.includes("transfer") || category.includes("transfer")) return <ArrowLeftRight size={24} />;
    if (type.includes("count") || category.includes("inventory")) return <ClipboardCheck size={24} />;
    if (type.includes("alert") || type.includes("warning")) return <AlertTriangle size={24} />;
    
    return <Bell size={24} fill="currentColor" />;
  };

  return (
    <div className="!relative" ref={notificationRef}>
      <button
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        className={`!relative !p-2 ${
          isNotificationOpen ? "!bg-slate-50 !text-[#39c6c6]" : "!text-slate-400"
        } hover:!bg-slate-50 !rounded-full !transition-all !duration-200`}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="!absolute !top-2.5 !right-2.5 !w-2.5 !h-2.5 !bg-red-500 !rounded-full !border-2 !border-white !animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isNotificationOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="!absolute !right-0 !mt-3 !w-[360px] !bg-white !rounded-2xl !shadow-2xl !border !border-slate-100 !z-50 !overflow-hidden"
          >
            {/* Header style Facebook */}
            <div className="!px-4 !pt-4 !pb-2">
              <div className="!flex !items-center !justify-between !mb-4">
                <div className="!flex !items-center !gap-3">
                  <h3 className="!text-2xl !font-bold !text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="!px-2.5 !py-0.5 !bg-[#39c6c6] !text-white !text-xs !font-bold !rounded-full !shadow-lg !shadow-[#39c6c6]/20">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="!flex !items-center !gap-1">
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="!p-2 !text-slate-500 hover:!bg-slate-100 !rounded-full !transition-colors"
                    title="Mark all as read"
                  >
                    <Check size={20} />
                  </button>
                  <button 
                    onClick={handleClearAll}
                    className="!flex !items-center !gap-1 !px-2 !py-1 !text-slate-500 hover:!bg-red-50 hover:!text-red-500 !rounded-lg !transition-colors !group/clear"
                    title="Clear all notifications"
                  >
                    <Trash2 size={16} className="group-hover/clear:!text-red-500" />
                    <span className="!text-xs !font-bold">Clear All</span>
                  </button>
                </div>
              </div>

              {/* Tabs style Facebook */}
              <div className="!flex !gap-2 !mb-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`!px-4 !py-1.5 !rounded-full !text-sm !font-bold !transition-all ${
                    activeTab === "all"
                      ? "!bg-[#39c6c6]/10 !text-[#39c6c6]"
                      : "!text-slate-600 hover:!bg-slate-100"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("unread")}
                  className={`!px-4 !py-1.5 !rounded-full !text-sm !font-bold !transition-all !relative ${
                    activeTab === "unread"
                      ? "!bg-[#39c6c6]/10 !text-[#39c6c6]"
                      : "!text-slate-600 hover:!bg-slate-100"
                  }`}
                >
                  Unread
                </button>
              </div>
            </div>

            <div className="!max-h-[28rem] !overflow-y-auto !scrollbar-thin !scrollbar-thumb-slate-200">
              <div className="!px-2 !pb-2">
                <div className="!flex !items-center !justify-between !px-4 !py-3">
                  <span className="!text-base !font-bold !text-slate-800">
                    {activeTab === "unread" ? "Unread Notifications" : "Newest"}
                  </span>
                </div>

                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.isRead) handleMarkAsRead(notif.id);
                      }}
                      className={`!p-3 !rounded-xl !cursor-pointer !transition-all hover:!bg-slate-50 !flex !gap-4 !mb-1 !relative !group`}
                    >
                      {/* Avatar bo tròn kiểu FB - Thay bằng Icon */}
                      <div className="!relative !flex-shrink-0">
                        <div className={`!w-12 !h-12 !rounded-full !flex !items-center !justify-center !border !border-slate-100 !transition-all group-hover:!scale-105 ${
                          !notif.isRead 
                            ? "!bg-[#39c6c6]/10 !text-[#39c6c6] !border-[#39c6c6]/20" 
                            : "!bg-slate-50 !text-slate-400"
                        }`}>
                          {getNotificationIcon(notif)}
                        </div>
                        {!notif.isRead && (
                          <div className="!absolute !-bottom-0.5 !-right-0.5 !w-5 !h-5 !bg-[#39c6c6] !rounded-full !border-2 !border-white !flex !items-center !justify-center">
                            <div className="!w-1.5 !h-1.5 !bg-white !rounded-full !animate-pulse"></div>
                          </div>
                        )}
                      </div>

                      <div className="!flex-1 !min-w-0 !pt-0.5">
                        <p className={`!text-sm !leading-snug !mb-1 ${
                          !notif.isRead ? "!font-bold !text-slate-900" : "!text-slate-600"
                        }`}>
                          <span className={`!block !font-bold !mb-0.5 ${!notif.isRead ? "!text-[#39c6c6]" : "!text-slate-700"}`}>
                            {notif.notification?.title}
                          </span>
                          <span className="!line-clamp-2 !text-xs">
                            {notif.notification?.message}
                          </span>
                        </p>
                        <div className={`!flex !items-center !gap-1 !text-[11px] ${
                          !notif.isRead ? "!font-bold !text-[#39c6c6]" : "!text-slate-400"
                        }`}>
                          <span>{formatTimeAgo(notif.createdAt)}</span>
                        </div>
                      </div>

                      {/* Cột trạng thái: Nút xóa luôn hiện mờ */}
                      <div className="!flex !items-center !justify-center !w-10">
                        <div className="!relative !flex !items-center !justify-center !w-full !h-full">
                          {/* Nút xóa - Luôn hiện mờ mờ, hiện rõ khi hover */}
                          <button
                            onClick={(e) => handleDelete(e, notif.id)}
                            className="!absolute !inset-0 !flex !items-center !justify-center !opacity-30 group-hover:!opacity-100 !text-slate-400 hover:!text-red-500 !transition-all !duration-200"
                            title="Xóa thông báo"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="!py-16 !px-4 !text-center">
                    <div className="!w-16 !h-16 !bg-slate-50 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4 !text-slate-300">
                      <Inbox size={32} />
                    </div>
                    <p className="!text-slate-500 !font-medium">
                      {activeTab === "unread" ? "No unread notifications" : "No notifications yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="!p-2 !bg-white !border-t !border-slate-50">
              <button className="!w-full !py-2.5 !text-sm !text-[#39c6c6] !font-bold hover:!bg-slate-50 !rounded-xl !transition-colors">
                See all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
