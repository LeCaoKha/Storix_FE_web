export const REPORT_TYPES = [
  { value: "InventorySnapshot", label: "Inventory Snapshot" },
  { value: "InventoryLedger", label: "Inventory Ledger" },
  // ===== ADDED CODE START =====
  { value: "InventoryOverallLedger", label: "Inventory Overall Ledger" },
  // ===== ADDED CODE END =====
  { value: "InventoryInOutBalance", label: "Inventory In/Out Balance" },
  { value: "InventoryTracking", label: "Inventory Tracking (Stocktake)" },
  // ===== ADDED CODE START =====
  {
    value: "ReplenishmentRecommendation",
    label: "Replenishment Recommendation",
  },
  // ===== ADDED CODE END =====
];

export const REPORT_STATUS = {
  RUNNING: "Running",
  SUCCEEDED: "Succeeded",
  FAILED: "Failed",
};

export const getStatusColor = (status) => {
  switch (status) {
    case REPORT_STATUS.RUNNING:
      return "processing";
    case REPORT_STATUS.SUCCEEDED:
      return "success";
    case REPORT_STATUS.FAILED:
      return "error";
    default:
      return "default";
  }
};

export const formatReportType = (type) => {
  const found = REPORT_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
};

export const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return (
    dt.toLocaleDateString("vi-VN") +
    " " +
    dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  );
};

export const MOCK_REPORTS = [
  {
    id: 101,
    reportType: "InventorySnapshot",
    warehouseId: 1,
    status: REPORT_STATUS.SUCCEEDED,
    timeFrom: "2024-02-01T00:00:00Z",
    timeTo: "2024-02-28T23:59:59Z",
    createdAt: "2024-02-28T10:00:00Z",
    completedAt: "2024-02-28T10:05:00Z",
  },
  {
    id: 102,
    reportType: "InventoryLedger",
    warehouseId: 2,
    status: REPORT_STATUS.RUNNING,
    timeFrom: "2024-02-15T00:00:00Z",
    timeTo: "2024-02-22T23:59:59Z",
    createdAt: "2024-02-27T14:30:00Z",
  },
  {
    id: 103,
    reportType: "InventoryTracking",
    warehouseId: null,
    status: REPORT_STATUS.FAILED,
    timeFrom: "2024-01-01T00:00:00Z",
    timeTo: "2024-01-31T23:59:59Z",
    createdAt: "2024-02-01T09:00:00Z",
    errorMessage: "Connection timeout while fetching shipment records",
  },
];

export const MOCK_REPORT_DETAILS = {
  101: {
    id: 101,
    reportType: "InventorySnapshot",
    status: REPORT_STATUS.SUCCEEDED,
    timeFrom: "2024-02-01T00:00:00Z",
    timeTo: "2024-02-28T23:59:59Z",
    summaryJson: JSON.stringify({
      totalInitialValue: 500000000,
      totalInboundValue: 200000000,
      totalOutboundValue: 150000000,
      totalFinalValue: 550000000,
    }),
    dataJson: JSON.stringify([
      {
        sku: "PRO-001",
        name: "Thép xây dựng Hòa Phát",
        unit: "Tấn",
        initialQty: 100,
        initialValue: 200000000,
        inQty: 50,
        inValue: 100000000,
        outPrice: 2200000,
        outQty: 40,
        outValue: 88000000,
        finalQty: 110,
        finalValue: 212000000,
      },
    ]),
  },
};
