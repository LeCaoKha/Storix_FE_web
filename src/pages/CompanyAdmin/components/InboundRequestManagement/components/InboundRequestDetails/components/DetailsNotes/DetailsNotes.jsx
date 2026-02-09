import { FileTextOutlined } from "@ant-design/icons";
import React from "react";

const DetailsNotes = ({ note }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center gap-2 mb-4 text-[#1a3353] font-bold uppercase text-xs tracking-wider">
      <FileTextOutlined className="text-[#4fd1c5]" /> Internal Notes
    </div>
    <div className="p-4 bg-gray-50 rounded-xl text-gray-500 min-h-[120px]">
      {note || "No instructions provided."}
    </div>
  </div>
);

export default DetailsNotes;
