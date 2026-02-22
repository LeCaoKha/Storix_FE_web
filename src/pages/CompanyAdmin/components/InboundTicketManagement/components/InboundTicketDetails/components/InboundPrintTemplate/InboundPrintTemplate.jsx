import React, { forwardRef } from "react";
import dayjs from "dayjs";

const InboundPrintTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  // Calculate total product quantity
  const totalQuantity = data.inboundOrderItems?.reduce(
    (sum, item) => sum + (item.quantity || item.expectedQuantity || 0),
    0,
  );

  return (
    <div
      ref={ref}
      className="p-10 bg-white text-black font-sans hidden print:block"
      style={{ minHeight: "100vh" }}
    >
      {/* Company Information Header */}
      <div className="flex justify-between items-start mb-6 text-[12px]">
        <div className="space-y-1">
          <p className="font-bold text-lg">Storix Logistics System</p>
          <p>Hotline: 84764770586</p>
        </div>
        <div className="text-right space-y-1">
          <p>
            Ticket Code: <span className="font-bold">{data.referenceCode}</span>
          </p>
          <p>
            Created Date: {dayjs(data.createdAt).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>
      </div>

      {/* Main Title */}
      <h1 className="text-center text-2xl font-bold uppercase mb-10 tracking-tight">
        Inbound Receipt
      </h1>

      {/* Partner & Warehouse Info */}
      <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Supplier:</span>{" "}
            {data.supplier?.name || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Address:</span>{" "}
            {data.warehouse?.address || "N/A"}
          </p>
        </div>
        <div className="space-y-2 text-right">
          <p>
            <span className="font-semibold">Warehouse:</span>{" "}
            {data.warehouse?.name || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Created By:</span>{" "}
            {data.createdByUser?.fullName || "N/A"}
          </p>
        </div>
      </div>

      {/* Product Table */}
      <table className="w-full border-collapse border border-black mb-8 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-2 py-2 w-12 text-center">
              No.
            </th>
            <th className="border border-black px-2 py-2 text-left">
              Product Name / SKU
            </th>
            <th className="border border-black px-2 py-2 w-24 text-center">
              Quantity
            </th>
            <th className="border border-black px-2 py-2 w-32 text-right">
              Unit Price
            </th>
            <th className="border border-black px-2 py-2 w-32 text-right">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {data.inboundOrderItems?.map((item, index) => {
            const price = item.price || 0;
            const qty = item.quantity || item.expectedQuantity || 0;
            return (
              <tr key={item.id}>
                <td className="border border-black px-2 py-2 text-center">
                  {index + 1}
                </td>
                <td className="border border-black px-2 py-2">
                  <div className="font-bold">{item.name}</div>
                  <div className="text-[10px] text-gray-600 italic">
                    SKU: {item.sku}
                  </div>
                </td>
                <td className="border border-black px-2 py-2 text-center">
                  {qty}
                </td>
                <td className="border border-black px-2 py-2 text-right">
                  {price.toLocaleString()}₫
                </td>
                <td className="border border-black px-2 py-2 text-right font-bold">
                  {(price * qty).toLocaleString()}₫
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Currency Calculations */}
      <div className="flex justify-end">
        <div className="w-72 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span>Total Quantity:</span>
            <span className="font-bold">{totalQuantity}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Gross Amount:</span>
            <span>{(data.totalPrice || 0).toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Discount:</span>
            <span>
              - {(data.totalPrice - data.finalPrice || 0).toLocaleString()}₫
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-black pt-3 font-bold text-lg">
            <span>GRAND TOTAL:</span>
            <span>{(data.finalPrice || 0).toLocaleString()}₫</span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-20 grid grid-cols-3 text-center text-sm italic">
        <div className="space-y-20">
          <p className="font-bold not-italic">Prepared By</p>
          <p>(Signature & Full Name)</p>
        </div>
        <div className="space-y-20">
          <p className="font-bold not-italic">Staff in Charge</p>
          <p>(Signature & Full Name)</p>
        </div>
        <div className="space-y-20">
          <p className="font-bold not-italic">Warehouse Manager</p>
          <p>(Signature & Full Name)</p>
        </div>
      </div>
    </div>
  );
});

export default InboundPrintTemplate;
