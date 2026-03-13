import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, ShieldCheck, Mail, Phone, 
  Search, Lock, Unlock, MailCheck,
  RefreshCw
} from "lucide-react";
import { 
  Table, Tag, Input, Badge, 
  Button, Avatar, Modal, message, Space,
  Typography
} from "antd";

const { Title } = Typography;

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" } 
  }),
};

const MOCK_USERS = [
  { id: 101, name: "Nguyen Van A", email: "admin@global-log.com", phone: "0901234567", role: "Company Administrator", company: "Global Logistics Co.", status: "Active" },
  { id: 102, name: "Tran Thi B", email: "manager@fasttrack.vn", phone: "0912233445", role: "Company Administrator", company: "FastTrack Express", status: "Active" },
  { id: 103, name: "Le Van C", email: "contact@oceanic.com", phone: "0988776655", role: "Company Administrator", company: "Oceanic Shipping", status: "Active" },
  { id: 104, name: "Pham Minh D", email: "hr@skyhigh.vn", phone: "0933445566", role: "Company Administrator", company: "SkyHigh Freight", status: "Locked" },
  { id: 105, name: "Hoang Anh E", email: "ops@vinacargo.vn", phone: "0944556677", role: "Company Administrator", company: "Vina Cargo Services", status: "Active" },
];

const UserManagement = () => {
  const [data, setData] = useState(MOCK_USERS);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleToggleLock = (record) => {
    const isLocked = record.status === "Locked";
    Modal.confirm({
      title: isLocked ? "Unlock Account?" : "Lock Account?",
      content: `Are you sure you want to ${isLocked ? "Unlock" : "Lock"} ${record.name}'s access to the system?`,
      okText: isLocked ? "Unlock" : "Lock",
      okType: isLocked ? "primary" : "danger",
      onOk: () => {
        const newData = data.map(u => 
          u.id === record.id 
            ? { ...u, status: isLocked ? "Active" : "Locked" } 
            : u
        );
        setData(newData);
        message.success(`${record.name} has been ${isLocked ? "unlocked" : "locked"}`);
      }
    });
  };

  const columns = [
    {
      title: 'USER',
      key: 'user',
      render: (record) => (
        <div className="!flex !items-center !gap-3">
          <Avatar className="!bg-[#39C6C6] !font-bold">
            {record.name.charAt(0)}
          </Avatar>
          <div>
            <p className="!font-bold !text-slate-800 !text-sm">{record.name}</p>
            <p className="!text-xs !text-slate-400">ID: #{record.id}</p>
          </div>
        </div>
      )
    },
    {
      title: 'CONTACT INFO',
      key: 'contact',
      render: (record) => (
        <div className="!space-y-1">
          <div className="!flex !items-center !gap-1.5 !text-xs !text-slate-500">
            <Mail size={12} /> {record.email}
          </div>
          <div className="!flex !items-center !gap-1.5 !text-[11px] !text-slate-400">
            <Phone size={12} /> {record.phone}
          </div>
        </div>
      )
    },
    {
      title: 'ROLE',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag className="!rounded-full !px-3 !border-none !font-black !text-[10px] !bg-violet-50 !text-violet-500">
          {role}
        </Tag>
      )
    },
    {
      title: 'COMPANY',
      dataIndex: 'company',
      key: 'company',
      render: (company) => (
        <span className="!font-bold !text-slate-700 !text-xs italic">{company}</span>
      )
    },
    {
        title: 'STATUS',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
            <Tag
                color={status === "Active" ? "green" : "red"}
                className="!rounded-md !px-3 !py-0.5 !font-bold"
            >
                {status?.toUpperCase()}
            </Tag>
        )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (record) => (
        <Space>
           <Button 
            type="text" 
            className="!text-slate-400 hover:!text-[#39C6C6]" 
            icon={<MailCheck size={18} />} 
           />
           <Button 
            type="text" 
            danger={record.status === 'Active'}
            className={record.status === 'Active' ? "" : "!text-emerald-500"}
            onClick={() => handleToggleLock(record)}
            icon={record.status === 'Active' ? <Lock size={18} /> : <Unlock size={18} />} 
           />
        </Space>
      )
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <section className="md:px-16 lg:px-12 pt-7 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8">
          <div>
            <Title level={2} className="!mb-0 !font-bold !tracking-tight">
              System Users <Users className="inline-block ml-2 text-[#39C6C6]" />
            </Title>
          </div>

          <Space size="middle" className="w-full md:w-auto">
            <Button
              icon={<RefreshCw size={16} className={loading ? "!animate-spin" : ""} />}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 500);
              }}
              className="!h-12 !px-6 !rounded-2xl !border-slate-200 !font-bold !text-slate-600 hover:!text-[#39C6C6] hover:!border-[#39C6C6]"
            >
              Sync Data
            </Button>
          </Space>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input 
              placeholder="Search by name, email or company..." 
              prefix={<Search size={20} className="text-slate-300 mr-3" />}
              className="!h-12 !bg-white !rounded-full !text-base !transition-all !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6]"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-[1rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden p-6">
          <Table 
            columns={columns} 
            dataSource={data.filter(u => 
                u.name.toLowerCase().includes(searchText.toLowerCase()) || 
                u.company.toLowerCase().includes(searchText.toLowerCase()) ||
                u.email.toLowerCase().includes(searchText.toLowerCase())
            )} 
            pagination={{ pageSize: 8, className: "px-6" }}
            loading={loading}
            className="storix-table"
          />
        </div>
      </section>
    </div>
  );
};

export default UserManagement;
