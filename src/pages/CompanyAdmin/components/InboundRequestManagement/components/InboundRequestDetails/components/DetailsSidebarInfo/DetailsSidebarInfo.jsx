import {
  ShoppingOutlined,
  HomeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const DetailsSidebarInfo = ({ data }) => (
  <div className="flex flex-col gap-6">
    {/* Supplier Card */}
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4 text-[#1a3353] font-bold uppercase text-xs tracking-wider">
        <ShoppingOutlined className="text-[#4fd1c5]" /> Supplier
      </div>
      <div className="p-3 bg-gray-50 rounded-lg text-gray-600 font-medium">
        {data?.supplier?.name}
      </div>
    </div>

    {/* Destination Card */}
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4 text-[#1a3353] font-bold uppercase text-xs tracking-wider">
        <HomeOutlined className="text-[#4fd1c5]" /> Destination
      </div>
      <div className="p-3 bg-gray-50 rounded-lg text-gray-600 font-medium">
        {data?.warehouse?.name}
      </div>
    </div>

    {/* Date Card */}
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4 text-[#1a3353] font-bold uppercase text-xs tracking-wider">
        <CalendarOutlined className="text-[#4fd1c5]" /> Expected Delivery Date
      </div>
      <div className="p-3 bg-gray-50 rounded-lg text-gray-600 font-medium italic">
        {data?.expectedArrivalDate}
      </div>
    </div>
  </div>
);

export default DetailsSidebarInfo;
