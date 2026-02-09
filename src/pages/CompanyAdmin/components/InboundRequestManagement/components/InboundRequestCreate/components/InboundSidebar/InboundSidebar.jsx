import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  Typography,
  Space,
  message,
  Skeleton,
  Divider,
  Modal,
  Form,
  Button,
  Row,
  Col,
  Avatar,
  Empty,
  DatePicker,
} from "antd";
import {
  Truck,
  Warehouse,
  StickyNote,
  Plus,
  User,
  Search,
  Calendar,
} from "lucide-react";
import api from "../../../../../../../../api/axios";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;

const InboundSidebar = ({ onDataChange, summary }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchingSupplier, setIsSearchingSupplier] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchContainerRef = useRef(null);

  // Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierSubmitting, setSupplierSubmitting] = useState(false);
  const [supplierForm] = Form.useForm();

  const fetchSidebarData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    setLoading(true);
    try {
      const supplierRes = await api.get(`/Suppliers/get-all/${userId}`);
      setSuppliers(supplierRes.data);
      setFilteredSuppliers(supplierRes.data);
      if (onDataChange) onDataChange("warehouseId", 1);
    } catch (error) {
      message.error("Failed to load supplier resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSidebarData();

    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchingSupplier(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSupplierSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setIsSearchingSupplier(true);

    const filtered = suppliers.filter((s) =>
      s.name.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredSuppliers(filtered);
  };

  const handleSelectSupplier = (supplier) => {
    setSearchValue(supplier.name);
    setIsSearchingSupplier(false);
    if (onDataChange) onDataChange("supplierId", supplier.id);
  };

  const handleChange = (key, value) => {
    if (onDataChange) {
      onDataChange(key, value);
    }
  };

  // Logic to disable past dates and today (only allow tomorrow onwards)
  const disabledDate = (current) => {
    return current && current < dayjs().endOf("day");
  };

  const handleCreateSupplier = async () => {
    try {
      const values = await supplierForm.validateFields();
      setSupplierSubmitting(true);
      const companyId = parseInt(localStorage.getItem("companyId")) || 0;

      const payload = {
        companyId,
        name: values.name,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
        address: values.address,
      };

      const res = await api.post("/Suppliers/add-new-supplier", payload);
      if (res.status === 200 || res.status === 201) {
        message.success("New supplier added successfully!");
        setIsSupplierModalOpen(false);
        supplierForm.resetFields();
        await fetchSidebarData();
      }
    } catch (error) {
      message.error("Failed to add supplier");
    } finally {
      setSupplierSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION: SOURCE & DESTINATION */}
      <div>
        <Card className="!rounded-2xl !shadow-sm !border-slate-100 !overflow-visible">
          <Skeleton loading={loading} active paragraph={{ rows: 3 }}>
            <div className="space-y-6">
              {/* Supplier Search Input */}
              <div className="relative" ref={searchContainerRef}>
                <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <Truck size={14} className="text-[#38c6c6]" /> Supplier
                </Text>

                <Input
                  placeholder="Search or add supplier..."
                  value={searchValue}
                  onChange={handleSupplierSearch}
                  onFocus={() => setIsSearchingSupplier(true)}
                  className="!h-12 !rounded-xl !bg-slate-50 !border-none focus:!bg-white focus:!ring-2 focus:!ring-[#38c6c6]/20 transition-all"
                  prefix={<Search size={18} className="text-slate-300 mr-1" />}
                />

                {/* Custom Dropdown List */}
                {isSearchingSupplier && (
                  <div className="!absolute !top-full !mt-2 !left-0 !w-full !bg-white !z-[100] !rounded-2xl !shadow-2xl !border !border-slate-100 !max-h-[250px] !overflow-y-auto !p-2 !transition-all">
                    <div
                      onClick={() => {
                        setIsSearchingSupplier(false);
                        setIsSupplierModalOpen(true);
                      }}
                      className="!flex !items-center !gap-2 !p-3 !mb-2 !bg-[#38c6c6]/5 hover:!bg-[#38c6c6]/10 !text-[#38c6c6] !rounded-xl !cursor-pointer !transition-all !border !border-dashed !border-[#38c6c6]/30"
                    >
                      <Plus size={13} />
                      <Text className="!font-bold !text-[#38c6c6]">
                        Add New Supplier
                      </Text>
                    </div>

                    <Skeleton loading={loading} active>
                      {filteredSuppliers.length > 0 ? (
                        filteredSuppliers.map((s) => (
                          <div
                            key={s.id}
                            className="!flex !items-center !p-3 hover:!bg-slate-50 !rounded-xl !cursor-pointer !transition-all"
                            onClick={() => handleSelectSupplier(s)}
                          >
                            <Avatar
                              size="small"
                              icon={<User size={14} />}
                              className="!bg-slate-100 !text-slate-400 !mr-3"
                            />
                            <Text className="!font-medium !text-slate-700">
                              {s.name}
                            </Text>
                          </div>
                        ))
                      ) : (
                        <Empty
                          description="No supplier found"
                          className="!py-4"
                        />
                      )}
                    </Skeleton>
                  </div>
                )}
              </div>

              {/* Destination Warehouse (Hardcoded) */}
              <div>
                <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <Warehouse size={14} className="text-[#38c6c6]" /> Destination
                </Text>
                <Input
                  value="My warehouse"
                  disabled
                  className="!h-12 !rounded-xl !bg-slate-100 !border-none !font-medium"
                  prefix={
                    <Warehouse size={18} className="text-slate-400 mr-1" />
                  }
                />
              </div>
            </div>
          </Skeleton>
        </Card>
      </div>

      {/* SECTION: EXPECTED DELIVERY DATE */}
      <div>
        <Card className="!rounded-2xl !shadow-sm !border-slate-100">
          <Text className="block !font-bold !text-slate-700 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Calendar size={14} className="text-[#38c6c6]" /> Expected Delivery
            Date
          </Text>
          <DatePicker
            format="YYYY-MM-DD"
            disabledDate={disabledDate}
            placeholder="Select delivery date"
            className="!h-12 !w-full !rounded-xl !bg-slate-50 !border-none focus:!bg-white focus:!ring-1 focus:!ring-[#38c6c6]/20 transition-all"
            onChange={(date, dateString) =>
              handleChange("expectedDate", dateString)
            }
          />
        </Card>
      </div>

      {/* SECTION: NOTES */}
      <div>
        <Card className="!rounded-2xl !shadow-sm !border-slate-100">
          <Text className="block !font-bold !text-slate-700 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
            <StickyNote size={14} className="text-[#38c6c6]" /> Internal Notes
          </Text>
          <TextArea
            rows={3}
            placeholder="Type any instructions here..."
            className="!rounded-xl !bg-slate-50 !border-none !p-4 transition-all"
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </Card>
      </div>

      {/* MODAL: ADD NEW SUPPLIER */}
      <div>
        <Modal
          title={
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Plus className="text-[#38c6c6]" size={20} />
              <span className="text-lg font-bold text-slate-800">
                Add New Supplier
              </span>
            </div>
          }
          open={isSupplierModalOpen}
          onCancel={() => {
            setIsSupplierModalOpen(false);
            supplierForm.resetFields();
          }}
          footer={null}
          centered
          width={600}
        >
          <Form form={supplierForm} layout="vertical" className="!mt-6">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Supplier Name"
                  name="name"
                  rules={[{ required: true }]}
                >
                  <Input className="!h-11 !rounded-xl !bg-slate-50" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Contact Person" name="contactPerson">
                  <Input className="!h-11 !rounded-xl !bg-slate-50" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Phone" name="phone">
                  <Input className="!h-11 !rounded-xl !bg-slate-50" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Email" name="email">
              <Input className="!h-11 !rounded-xl !bg-slate-50" />
            </Form.Item>
            <Form.Item label="Address" name="address">
              <TextArea rows={3} className="!rounded-xl !bg-slate-50 !p-3" />
            </Form.Item>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                onClick={() => setIsSupplierModalOpen(false)}
                className="!h-11 !rounded-xl !font-bold"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                loading={supplierSubmitting}
                onClick={handleCreateSupplier}
                className="!h-11 !px-10 !bg-[#38c6c6] !rounded-xl !font-bold"
              >
                CREATE SUPPLIER
              </Button>
            </div>
          </Form>
        </Modal>
      </div>

      <style jsx global>{`
        .ant-picker-focused {
          border-color: #38c6c6 !important;
          box-shadow: 0 0 0 2px rgba(56, 198, 198, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default InboundSidebar;
