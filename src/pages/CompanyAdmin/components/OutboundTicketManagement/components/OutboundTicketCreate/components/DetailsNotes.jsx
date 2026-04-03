import React from "react";
import { Card, Typography } from "antd";
import { StickyNote } from "lucide-react";

const { Text } = Typography;

const DetailsNotes = ({ note }) => {
  return (
    <Card className="!rounded-2xl !shadow-sm !border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote size={16} className="text-slate-400" />
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Original Request Reason
        </Text>
      </div>
      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
        <Text className="text-slate-600 text-sm whitespace-pre-wrap">
          {note || "No specific reason provided for this outbound request."}
        </Text>
      </div>
    </Card>
  );
};

export default DetailsNotes;
