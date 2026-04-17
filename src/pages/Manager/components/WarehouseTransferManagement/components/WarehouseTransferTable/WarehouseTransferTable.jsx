import React from "react";
import { Button, Table, Tag } from "antd";
import { CheckCircle2, ClipboardX, Send, XCircle } from "lucide-react";

const WarehouseTransferTable = ({
  data,
  loading,
  normalizeStatus,
  statusColorMap,
  editableStatuses,
  canCancelStatuses,
  canManageActions = true,
  onViewDetail,
  onSubmit,
  onApprove,
  onOpenReject,
  onOpenCancel,
}) => {
  const columns = [
    {
      title: "Transfer ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      fixed: "left",
      render: (id) => <span className="font-medium">#{id}</span>,
    },
    {
      title: "Source",
      key: "source",
      width: 220,
      render: (_, record) =>
        (
          <div className="flex flex-col gap-0.5 justify-center">
            <span className="font-semibold text-slate-700 leading-tight">
              {record.sourceWarehouseName || "Unknown"}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              ID: #{record.sourceWarehouseId}
            </span>
          </div>
        ),
    },
    {
      title: "Destination",
      key: "destination",
      width: 220,
      render: (_, record) =>
        (
          <div className="flex flex-col gap-0.5 justify-center">
            <span className="font-semibold text-slate-700 leading-tight">
              {record.destinationWarehouseName || "Unknown"}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              ID: #{record.destinationWarehouseId}
            </span>
          </div>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 160,
      align: "center",
      render: (status) => {
        const normalized = normalizeStatus(status);
        return (
          <Tag
            color={statusColorMap[normalized] || "default"}
            className="!rounded-md !px-3 !py-0.5 !font-bold uppercase text-[10px] !m-0"
          >
            {normalized || "UNKNOWN"}
          </Tag>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date) =>
        date
          ? (
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-slate-700 leading-tight">
                {new Date(date).toLocaleDateString("vi-VN")}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {new Date(date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          )
          : "-",
    },
    {
      title: "Actions",
      key: "actions",
      width: 360,
      render: (_, record) => {
        const status = normalizeStatus(record.status);
        return (
          <div className="flex items-center flex-wrap gap-2 py-1">
            <Button
              size="small"
              onClick={() => onViewDetail(record)}
              className="!h-8 !min-w-[78px] !px-3 !rounded-xl !bg-slate-50 !border-slate-200 !text-slate-600 !font-bold hover:!bg-slate-100 hover:!border-slate-300 hover:!scale-105 !transition-all"
            >
              Details
            </Button>

            {canManageActions && editableStatuses.includes(status) && (
              <Button
                size="small"
                type="primary"
                icon={<Send size={13} />}
                onClick={() => onSubmit(record.id)}
                className="!h-8 !min-w-[78px] !px-3 !rounded-xl !bg-[#39C6C6] !border-none !font-bold hover:!bg-[#2eb1b1] hover:!scale-105 hover:!shadow-md hover:!shadow-cyan-100 !transition-all"
              >
                Submit
              </Button>
            )}

            {canManageActions && status === "PENDING_APPROVAL" && (
              <>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircle2 size={13} />}
                  onClick={() => onApprove(record.id)}
                  className="!h-8 !min-w-[78px] !px-3 !rounded-xl !bg-[#39C6C6] !border-none !font-bold hover:!bg-[#2eb1b1] hover:!scale-105 hover:!shadow-md hover:!shadow-cyan-100 !transition-all"
                >
                  Approve
                </Button>

                <Button
                  size="small"
                  danger
                  ghost
                  icon={<ClipboardX size={13} />}
                  onClick={() => onOpenReject(record.id)}
                  className="!h-8 !min-w-[78px] !px-3 !rounded-xl !border-rose-200 !text-rose-500 !bg-rose-50/30 !font-bold hover:!bg-rose-50 hover:!border-rose-300 hover:!scale-105 !transition-all"
                >
                  Reject
                </Button>
              </>
            )}

            {canManageActions && canCancelStatuses.includes(status) && (
              <Button
                size="small"
                ghost
                icon={<XCircle size={13} />}
                onClick={() => onOpenCancel(record.id)}
                className="!h-8 !min-w-[78px] !px-3 !rounded-xl !border-slate-200 !text-slate-400 !font-bold hover:!bg-slate-50 hover:!border-slate-300 hover:!text-slate-500 hover:!scale-105 !transition-all"
              >
                Cancel
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={{ pageSize: 8, className: "px-6" }}
      scroll={{ x: 1100 }}
      className="storix-table"
      onRow={(record) => ({
        onClick: (event) => {
          if (
            event.target.closest("button") ||
            event.target.closest(".ant-popover")
          ) {
            return;
          }
          onViewDetail(record);
        },
      })}
    />
  );
};

export default WarehouseTransferTable;
