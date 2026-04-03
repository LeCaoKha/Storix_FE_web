import React, { forwardRef } from "react";

const OutboundPrintTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <div className="hidden">
      {/* Container này chỉ hiển thị khi in */}
      <div
        ref={ref}
        className="print-container"
        style={{
          padding: "40px",
          fontFamily: "Arial, sans-serif",
          color: "#000",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "2px solid #eee",
            paddingBottom: "20px",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "28px", color: "#333" }}>
              OUTBOUND DISPATCH
            </h1>
            <p style={{ margin: "5px 0 0 0", color: "#666" }}>
              Storix Warehouse Management System
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: 0, color: "#333" }}>
              Request ID: OUT-{data.id}
            </h3>
            <p style={{ margin: "5px 0 0 0", color: "#666" }}>
              Date: {formatDate(data.createdAt)}
            </p>
            <p style={{ margin: "5px 0 0 0", color: "#666" }}>
              Status: {data.status}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: "flex", gap: "40px", marginBottom: "30px" }}>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: "0 0 10px 0",
                color: "#666",
                textTransform: "uppercase",
                fontSize: "12px",
              }}
            >
              Origin Warehouse
            </h4>
            <p style={{ margin: 0, fontWeight: "bold" }}>
              {data.warehouse?.name || "N/A"}
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: "0 0 10px 0",
                color: "#666",
                textTransform: "uppercase",
                fontSize: "12px",
              }}
            >
              Destination
            </h4>
            <p style={{ margin: 0, fontWeight: "bold" }}>
              {data.destination || "N/A"}
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: "0 0 10px 0",
                color: "#666",
                textTransform: "uppercase",
                fontSize: "12px",
              }}
            >
              Requested By
            </h4>
            <p style={{ margin: 0, fontWeight: "bold" }}>
              {data.requestedByUser?.fullName || "N/A"}
            </p>
          </div>
        </div>

        {/* Product Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "30px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa" }}>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "2px solid #cbd5e1",
                }}
              >
                Item / Product
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderBottom: "2px solid #cbd5e1",
                }}
              >
                Quantity
              </th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((item, index) => (
              <tr key={index}>
                <td
                  style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}
                >
                  {item.productName || "Unknown Product"}
                </td>
                <td
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "1px solid #e2e8f0",
                    fontWeight: "bold",
                  }}
                >
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Notes */}
        <div style={{ marginBottom: "50px" }}>
          <h4
            style={{
              margin: "0 0 10px 0",
              color: "#666",
              textTransform: "uppercase",
              fontSize: "12px",
            }}
          >
            Reason / Notes
          </h4>
          <p
            style={{
              margin: 0,
              padding: "15px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            {data.reason || "No additional notes."}
          </p>
        </div>

        {/* Signatures */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "50px",
            textAlign: "center",
          }}
        >
          <div style={{ width: "200px" }}>
            <p
              style={{
                borderTop: "1px solid #000",
                paddingTop: "10px",
                margin: 0,
              }}
            >
              Requested By (Sign)
            </p>
          </div>
          <div style={{ width: "200px" }}>
            <p
              style={{
                borderTop: "1px solid #000",
                paddingTop: "10px",
                margin: 0,
              }}
            >
              Approved By (Sign)
            </p>
          </div>
          <div style={{ width: "200px" }}>
            <p
              style={{
                borderTop: "1px solid #000",
                paddingTop: "10px",
                margin: 0,
              }}
            >
              Receiver (Sign)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default OutboundPrintTemplate;
