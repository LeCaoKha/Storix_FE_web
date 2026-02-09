import { Button } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const DetailsHeader = ({ data }) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-4">
      <Button
        type="text"
        icon={<ArrowLeftOutlined className="text-xl" />}
        onClick={() => window.history.back()}
      />
      <div>
        <h1 className="text-2xl font-bold text-[#1a3353] m-0">
          Inbound Request: {data?.code}
        </h1>
        <p className="text-gray-400 font-semibold text-xs tracking-widest uppercase m-0">
          Inbound Management
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <Button
        icon={<CloseOutlined />}
        type="text"
        className="text-gray-500 font-semibold"
      >
        Cancel
      </Button>
      <Button
        icon={<FileTextOutlined />}
        className="rounded-lg h-10 px-6 font-semibold"
      >
        Export PDF
      </Button>
      {data?.status === "Pending" && (
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          className="bg-[#4fd1c5] border-none rounded-lg h-10 px-6 font-semibold hover:!bg-[#38b2ac]"
        >
          Approve Request
        </Button>
      )}
    </div>
  </div>
);

export default DetailsHeader;
