import React from "react";
import { Button, Space, Typography } from "antd";
// ===== ADDED CODE START =====
import { ArrowLeft, Save, X, ArrowRight } from "lucide-react";
// ===== ADDED CODE END =====
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const DetailsHeader = ({
  data,
  onApprove,
  isApproving,
  // ===== ADDED CODE START =====
  currentStep,
  onNext,
  onPrev,
  // ===== ADDED CODE END =====
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-10">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<ArrowLeft size={24} />}
          onClick={() => navigate(-1)}
          className="!flex !items-center !justify-center !h-12 !w-12 !rounded-full hover:!bg-white hover:!shadow-md transition-all text-slate-600"
        />
        <div>
          <Title
            level={2}
            className="!mb-0 !font-extrabold !tracking-tight !text-slate-800"
          >
            {data?.code || "Create Inventory Count"}
          </Title>
        </div>
      </div>
      <Space size="middle">
        {/* ===== ADDED CODE START ===== */}
        {currentStep === 0 ? (
          <>
            <Button
              type="text"
              icon={<X size={18} />}
              onClick={() => navigate(-1)}
              className="!flex !items-center !gap-2 !h-11 !px-5 !font-bold !bg-rose-500 !text-white hover:!bg-rose-600 !rounded-xl transition-all"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={onNext}
              className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !bg-[#39c6c6] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20 hover:!bg-[#2eb1b1] transition-all"
            >
              Next Step <ArrowRight size={18} />
            </Button>
          </>
        ) : (
          <>
            <Button
              type="text"
              icon={<ArrowLeft size={18} />}
              onClick={onPrev}
              disabled={isApproving}
              className="!flex !items-center !gap-2 !h-11 !px-5 !font-bold !bg-slate-200 !text-slate-700 hover:!bg-slate-300 !rounded-xl transition-all"
            >
              Back
            </Button>
            <Button
              icon={<Save size={18} />}
              onClick={onApprove}
              loading={isApproving}
              className="!flex !items-center !gap-2 !h-11 !px-6 !font-bold !text-white !bg-[#39c6c6] !border-none !rounded-xl shadow-lg shadow-[#39c6c6]/20 hover:!bg-[#2eb1b1] transition-all"
            >
              Create Count Ticket
            </Button>
          </>
        )}
        {/* ===== ADDED CODE END ===== */}
      </Space>
    </div>
  );
};

export default DetailsHeader;
