import React, { forwardRef } from "react";
import dayjs from "dayjs";

const InboundPrintTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  // Calculation Logic
  const totalQuantity = data.inboundOrderItems?.reduce(
    (sum, item) => sum + (item.expectedQuantity || 0),
    0,
  );
  const totalAmount = data.totalPrice || 0;
  const discountAmount = (totalAmount * (data.orderDiscount || 0)) / 100;
  const vatAmount = 0; // Change this if you have tax data
  const finalPrice = data.finalPrice || totalAmount - discountAmount;

  return (
    <div
      ref={ref}
      className="p-10 bg-white text-black font-sans hidden print:block"
      style={{ minHeight: "100vh" }}
    >
      {/* Company & Order Header */}
      <div className="flex justify-between items-start mb-4 text-xs">
        <div className="space-y-1">
          <p className="font-bold">asd1231237</p>
          <p>84764770586</p>
        </div>
        <div className="text-right space-y-1">
          <p>
            Order Code: <span className="font-bold">{data.code}</span>
          </p>
          <p>Created Date: {dayjs(data.createdAt).format("DD/MM/YYYY")}</p>
        </div>
      </div>

      {/* Main Title */}
      <h1 className="text-center text-xl font-bold uppercase mb-8">
        Inbound Purchase Order
      </h1>

      {/* Supplier Information */}
      <div className="mb-6 text-sm space-y-2">
        <p>
          <span className="font-medium">Supplier:</span>{" "}
          {data.supplier?.name || "N/A"}
        </p>
        <p>
          <span className="font-medium">Supplier Address:</span>{" "}
          {data.supplier?.address || "N/A"}
        </p>
      </div>

      {/* Product Table */}
      <table className="w-full border-collapse border border-black mb-6 text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-black px-2 py-1 w-12">No.</th>
            <th className="border border-black px-2 py-1 text-left">
              Product Name
            </th>
            <th className="border border-black px-2 py-1 w-24">Quantity</th>
            <th className="border border-black px-2 py-1 w-28 text-right">
              Unit Price
            </th>
            <th className="border border-black px-2 py-1 w-24 text-right">
              Discount
            </th>
            <th className="border border-black px-2 py-1 w-32 text-right">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {data.inboundOrderItems?.map((item, index) => {
            const lineTotal = (item.price || 0) * (item.expectedQuantity || 1);
            const lineDiscount = (lineTotal * (item.lineDiscount || 0)) / 100;
            return (
              <tr key={item.id}>
                <td className="border border-black px-2 py-1 text-center">
                  {index + 1}
                </td>
                <td className="border border-black px-2 py-1 font-medium">
                  {item.name}
                  <p className="text-xs font-normal text-gray-500">
                    SKU: {item.sku}
                  </p>
                </td>
                <td className="border border-black px-2 py-1 text-center">
                  {item.expectedQuantity}
                </td>
                <td className="border border-black px-2 py-1 text-right">
                  {(item.price || 0).toLocaleString()}₫
                </td>
                <td className="border border-black px-2 py-1 text-right">
                  {item.lineDiscount || 0}%
                </td>
                <td className="border border-black px-2 py-1 text-right font-bold">
                  {(lineTotal - lineDiscount).toLocaleString()}₫
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary Section (Align right) */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Quantity:</span>
            <span className="font-bold">{totalQuantity}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{totalAmount.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>{discountAmount.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between">
            <span>Tax/VAT:</span>
            <span>{vatAmount.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between border-t border-black pt-2 font-bold text-base">
            <span>Grand Total:</span>
            <span>{finalPrice.toLocaleString()}₫</span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-12 grid grid-cols-2 text-center text-sm italic">
        <div>Prepared By</div>
        <div>Approved By</div>
      </div>
    </div>
  );
});

export default InboundPrintTemplate;
