import React from "react";
import { Card, Typography } from "antd";
import { StickyNote } from "lucide-react";

const { Text } = Typography;

const DetailsNotes = ({ note }) => (
  <Card className="!rounded-2xl !shadow-sm !border-slate-100">
    <Text className="block !font-bold !text-slate-700 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
      <StickyNote size={14} className="text-[#38c6c6]" /> Internal Notes
    </Text>
    <div className="!rounded-xl !bg-slate-50 !border-none !p-4 transition-all min-h-[120px] text-slate-500">
      {note || "No instructions provided."}
    </div>
  </Card>
);

export default DetailsNotes;
