import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ClipboardCheck,
  ClipboardX,
  Pencil,
  RefreshCw,
  Send,
  Trash2,
  XCircle,
  Plus,
} from "lucide-react";
import api from "../../../../api/axios";
import { PUBLIC_NAV_MOBILE_BREAKPOINT } from "../../../../constants/responsive";
import WarehouseTransferHeader from "./components/WarehouseTransferHeader/WarehouseTransferHeader";
import WarehouseTransferFilters from "./components/WarehouseTransferFilters/WarehouseTransferFilters";
import WarehouseTransferTable from "./components/WarehouseTransferTable/WarehouseTransferTable";

const EDITABLE_STATUSES = ["DRAFT", "REJECTED"];
const CAN_CANCEL_STATUSES = ["DRAFT", "PENDING_APPROVAL", "APPROVED"];

const normalizeStatus = (status) => (status || "").toUpperCase();
const normalizeStaffSuggestion = (staffLike) => {
  if (!staffLike) return null;

  const userId = Number(
    staffLike?.userId ?? staffLike?.UserId ?? staffLike?.id ?? staffLike?.Id,
  );
  if (!userId) return null;

  const fullName =
    staffLike?.fullName ??
    staffLike?.FullName ??
    staffLike?.name ??
    staffLike?.Name;

  return {
    userId,
    fullName: fullName || `Staff #${userId}`,
    suggestionScore: Number(
      staffLike?.suggestionScore ?? staffLike?.SuggestionScore ?? 0,
    ),
    activeTransferTaskCount: Number(
      staffLike?.activeTransferTaskCount ?? staffLike?.ActiveTransferTaskCount ?? 0,
    ),
    reason: staffLike?.reason ?? staffLike?.Reason ?? "",
  };
};

const normalizeWarehouseRow = (warehouseLike) => {
  if (!warehouseLike) return null;

  const id = Number(
    warehouseLike?.id ??
      warehouseLike?.Id ??
      warehouseLike?.warehouseId ??
      warehouseLike?.WarehouseId,
  );

  if (!id) return null;

  const name =
    warehouseLike?.name ??
    warehouseLike?.Name ??
    warehouseLike?.warehouseName ??
    warehouseLike?.WarehouseName;

  const status = warehouseLike?.status ?? warehouseLike?.Status ?? "Active";

  return {
    id,
    name: name || `Warehouse #${id}`,
    status,
  };
};

const statusColorMap = {
  DRAFT: "default",
  PENDING_APPROVAL: "gold",
  APPROVED: "blue",
  REJECTED: "red",
  PICKING: "cyan",
  PACKED: "geekblue",
  IN_TRANSIT: "processing",
  RECEIVED_FULL: "lime",
  RECEIVED_PARTIAL: "orange",
  COMPLETED: "green",
  QUALITY_CHECKED: "green",
  QUALITY_ISSUE: "volcano",
  CANCELLED: "default",
};
const { Text } = Typography;

const WarehouseTransferManagement = () => {
  const roleId = Number(localStorage.getItem("roleId") || 0);
  const canManageTransfer = roleId === 3;

  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [managerWarehouseId, setManagerWarehouseId] = useState(
    Number(localStorage.getItem("warehouseId") || 0) || undefined,
  );
  const [carrierOptions, setCarrierOptions] = useState([]);
  const [carrierLoading, setCarrierLoading] = useState(false);
  const [carrierHint, setCarrierHint] = useState("");
  const [staffSuggestions, setStaffSuggestions] = useState([]);
  const [assignStaffHint, setAssignStaffHint] = useState("");
  const [suggestingStaff, setSuggestingStaff] = useState(false);
  const [assigningCarrier, setAssigningCarrier] = useState(false);
  const [selectedCarrierToAssign, setSelectedCarrierToAssign] = useState(undefined);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [destinationFilter, setDestinationFilter] = useState("ALL");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [detailFallbackMode, setDetailFallbackMode] = useState(false);

  const [products, setProducts] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [readOnlyNotice, setReadOnlyNotice] = useState("");

  const [actionModal, setActionModal] = useState({
    open: false,
    type: "",
    transferId: null,
  });
  const [actionReason, setActionReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [itemEditModalOpen, setItemEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editDraftModalOpen, setEditDraftModalOpen] = useState(false);
  const [bulkAddModalOpen, setBulkAddModalOpen] = useState(false);
  const [submittingDraftUpdate, setSubmittingDraftUpdate] = useState(false);
  const [submittingBulkAdd, setSubmittingBulkAdd] = useState(false);

  const [createForm] = Form.useForm();
  const [addItemForm] = Form.useForm();
  const [itemEditForm] = Form.useForm();
  const [editDraftForm] = Form.useForm();
  const [bulkAddForm] = Form.useForm();

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < PUBLIC_NAV_MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < PUBLIC_NAV_MOBILE_BREAKPOINT);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const companyId = Number(localStorage.getItem("companyId") || 0);
  const userId = Number(localStorage.getItem("userId") || 0);

  const warehouseOptions = useMemo(() => {
    const map = new Map();

    warehouses.forEach((warehouse) => {
      const normalized = normalizeWarehouseRow(warehouse);
      if (!normalized) return;

      map.set(normalized.id, {
        value: normalized.id,
        label: normalized.name
          ? `${normalized.name} (#${normalized.id})`
          : `Warehouse #${normalized.id}`,
      });
    });

    transfers.forEach((transfer) => {
      const sourceWarehouseId = Number(
        transfer?.sourceWarehouseId ?? transfer?.SourceWarehouseId,
      );
      const sourceWarehouseName =
        transfer?.sourceWarehouseName ?? transfer?.SourceWarehouseName;

      if (sourceWarehouseId > 0 && !map.has(sourceWarehouseId)) {
        map.set(sourceWarehouseId, {
          value: sourceWarehouseId,
          label: sourceWarehouseName
            ? `${sourceWarehouseName} (#${sourceWarehouseId})`
            : `Warehouse #${sourceWarehouseId}`,
        });
      }

      const destinationWarehouseId = Number(
        transfer?.destinationWarehouseId ?? transfer?.DestinationWarehouseId,
      );
      const destinationWarehouseName =
        transfer?.destinationWarehouseName ?? transfer?.DestinationWarehouseName;

      if (destinationWarehouseId > 0 && !map.has(destinationWarehouseId)) {
        map.set(destinationWarehouseId, {
          value: destinationWarehouseId,
          label: destinationWarehouseName
            ? `${destinationWarehouseName} (#${destinationWarehouseId})`
            : `Warehouse #${destinationWarehouseId}`,
        });
      }
    });

    return Array.from(map.values());
  }, [warehouses, transfers]);

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: p.name ? `${p.name} (#${p.id})` : `Product #${p.id}`,
      })),
    [products],
  );

  const filteredTransfers = useMemo(() => {
    return transfers.filter((item) => {
      const status = normalizeStatus(item.status);
      const statusMatched = statusFilter === "ALL" || status === statusFilter;
      const sourceMatched =
        sourceFilter === "ALL" || item.sourceWarehouseId === sourceFilter;
      const destinationMatched =
        destinationFilter === "ALL" ||
        item.destinationWarehouseId === destinationFilter;
      const search = searchText.trim().toLowerCase();
      const textMatched =
        !search ||
        String(item.id).includes(search) ||
        (item.sourceWarehouseName || "").toLowerCase().includes(search) ||
        (item.destinationWarehouseName || "").toLowerCase().includes(search) ||
        (item.createdByName || "").toLowerCase().includes(search);

      return statusMatched && sourceMatched && destinationMatched && textMatched;
    });
  }, [transfers, statusFilter, sourceFilter, destinationFilter, searchText]);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/warehouse-transfers");
      setTransfers(response.data || []);
      setReadOnlyNotice("");
    } catch (error) {
      if (error?.response?.status === 403 && !canManageTransfer) {
        setTransfers([]);
        setReadOnlyNotice(
          "Company Admin account is currently in preview mode. Backend has not yet granted data permissions for this role.",
        );
        return;
      }

      const errorMessage =
        error?.response?.data?.message || "Can not load transfer orders";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/Products/get-all/${userId}`);
      setProducts(response.data || []);
    } catch {
      setProducts([]);
    }
  };

  const fetchWarehouses = async () => {
    setWarehouseLoading(true);
    try {
      const response = await api.get("/warehouse-transfers/warehouses");
      const direct = Array.isArray(response.data) ? response.data : [];
      const normalizedDirect = direct
        .map((row) => normalizeWarehouseRow(row))
        .filter(Boolean);

      if (normalizedDirect.length > 0) {
        setWarehouses(normalizedDirect);
        return;
      }

      throw new Error("EMPTY_WAREHOUSE_LIST");
    } catch (error) {
      const fallbackMap = new Map();

      // Fallback #1: old company warehouses endpoint (often role-restricted).
      if (companyId) {
        try {
          const fallbackResponse = await api.get(
            `/company-warehouses/${companyId}/warehouses`,
          );
          const rows = Array.isArray(fallbackResponse.data)
            ? fallbackResponse.data
            : [];
          rows.forEach((warehouse) => {
            const normalized = normalizeWarehouseRow(warehouse);
            if (!normalized || fallbackMap.has(normalized.id)) return;
            fallbackMap.set(normalized.id, normalized);
          });
        } catch {
          // Ignore and continue to next fallback.
        }
      }

      // Fallback #2: self user profile mapping (has latest assigned warehouse).
      if (userId) {
        try {
          const userResponse = await api.get(`/Users/${userId}`);
          const user = userResponse?.data || {};
          const assignedWarehouseId = Number(
            user?.warehouseId ?? user?.WarehouseId,
          );
          const assignedWarehouseName =
            user?.warehouseName ?? user?.WarehouseName;

          if (assignedWarehouseId > 0) {
            setManagerWarehouseId(assignedWarehouseId);
          }

          if (assignedWarehouseId > 0 && !fallbackMap.has(assignedWarehouseId)) {
            fallbackMap.set(assignedWarehouseId, {
              id: assignedWarehouseId,
              name:
                assignedWarehouseName ||
                `Warehouse #${assignedWarehouseId}`,
              status: "Active",
            });
          }
        } catch {
          // Ignore and continue to next fallback.
        }
      }

      // Fallback #3: infer warehouses from transfer list endpoint.
      try {
        const transferResponse = await api.get("/warehouse-transfers");
        const transferRows = Array.isArray(transferResponse.data)
          ? transferResponse.data
          : [];

        transferRows.forEach((transfer) => {
          const sourceId = Number(
            transfer?.sourceWarehouseId ?? transfer?.SourceWarehouseId,
          );
          if (sourceId > 0 && !fallbackMap.has(sourceId)) {
            fallbackMap.set(sourceId, {
              id: sourceId,
              name:
                transfer?.sourceWarehouseName ||
                transfer?.SourceWarehouseName ||
                `Warehouse #${sourceId}`,
              status: "Active",
            });
          }

          const destinationId = Number(
            transfer?.destinationWarehouseId ?? transfer?.DestinationWarehouseId,
          );
          if (destinationId > 0 && !fallbackMap.has(destinationId)) {
            fallbackMap.set(destinationId, {
              id: destinationId,
              name:
                transfer?.destinationWarehouseName ||
                transfer?.DestinationWarehouseName ||
                `Warehouse #${destinationId}`,
              status: "Active",
            });
          }
        });
      } catch {
        // Keep map as-is.
      }

      const resolved = Array.from(fallbackMap.values());
      if (resolved.length > 0) {
        setWarehouses(resolved);
        message.warning(
          "Warehouse endpoints returned 404/403 errors, using fallback data.",
        );
        return;
      }

      const errorMessage =
        error?.response?.data?.message || "Can not load warehouse list";
      message.error(`${errorMessage}. Please check warehouse permissions/API.`);
      setWarehouses([]);
    } finally {
      setWarehouseLoading(false);
    }
  };

  const fetchTransferStaffSuggestions = async (transferId, sourceWarehouseId) => {
    if (!transferId || !canManageTransfer) {
      setStaffSuggestions([]);
      setAssignStaffHint("");
      return;
    }

    setSuggestingStaff(true);
    try {
      const response = await api.get(
        `/warehouse-transfers/${transferId}/suggest-staff`,
      );
      const rows = Array.isArray(response.data)
        ? response.data.map((row) => normalizeStaffSuggestion(row)).filter(Boolean)
        : [];
      if (rows.length > 0) {
        setStaffSuggestions(rows);
        setAssignStaffHint("");
        return;
      }

      // Fallback: load staff assigned to source warehouse directly.
      if (sourceWarehouseId) {
        try {
          const byWarehouseResponse = await api.get(
            `/Users/get-users-by-warehouse/${sourceWarehouseId}`,
          );
          const users = Array.isArray(byWarehouseResponse.data)
            ? byWarehouseResponse.data
            : [];
          const staffs = users.filter((user) => Number(user?.roleId) === 4);

          setStaffSuggestions(
            staffs.map((staff) => ({
              userId: staff.id,
              fullName: staff.fullName,
              suggestionScore: 0,
              activeTransferTaskCount: 0,
            })),
          );

          if (staffs.length > 0) {
            setAssignStaffHint(
              "Suggestions API has no optimal data, showing staff list based on source warehouse.",
            );
            return;
          }
        } catch {
          // Keep fallback empty and show a clear hint below.
        }
      }

      setStaffSuggestions([]);
      setAssignStaffHint(
        "No staff assigned to the source warehouse or you are not the manager who created this transfer.",
      );
    } catch {
      setStaffSuggestions([]);
      setAssignStaffHint("Failed to load staff list. Please try Refresh Suggestions.");
    } finally {
      setSuggestingStaff(false);
    }
  };

  const fetchCarrierCandidatesByWarehouse = async (warehouseId) => {
    if (!warehouseId) {
      setCarrierOptions([]);
      setCarrierHint("Select source warehouse to load staff list");
      return;
    }

    setCarrierLoading(true);
    setCarrierHint("");
    try {
      const response = await api.get(`/Users/get-users-by-warehouse/${warehouseId}`);
      const users = Array.isArray(response.data) ? response.data : [];
      const staffs = users.filter((user) => Number(user?.roleId) === 4);

      setCarrierOptions(
        staffs.map((staff) => ({
          value: staff.id,
          label: staff.fullName ? `${staff.fullName} (#${staff.id})` : `Staff #${staff.id}`,
        })),
      );

      if (!staffs.length) {
        setCarrierHint("No staff assigned to this source warehouse. You can still create the transfer without a staff.");
      }
    } catch {
      setCarrierOptions([]);
      setCarrierHint("Failed to load staff by warehouse. You can skip the staff and create the transfer first.");
    } finally {
      setCarrierLoading(false);
    }
  };

  const buildFallbackTransfer = (transferLike) => {
    if (!transferLike) return null;

    return {
      id: transferLike.id,
      sourceWarehouseId: transferLike.sourceWarehouseId,
      sourceWarehouseName: transferLike.sourceWarehouseName,
      destinationWarehouseId: transferLike.destinationWarehouseId,
      destinationWarehouseName: transferLike.destinationWarehouseName,
      status: transferLike.status,
      createdAt: transferLike.createdAt,
      items: [],
      timeline: [],
    };
  };

  const fetchTransferDetail = async (transferRef) => {
    const transferId =
      typeof transferRef === "number" ? transferRef : transferRef?.id;
    if (!transferId) return;

    setDetailLoading(true);
    setDetailFallbackMode(false);

    try {
      const response = await api.get(`/warehouse-transfers/${transferId}`);
      const detail = response.data;
      setSelectedTransfer(detail);
      setSelectedCarrierToAssign(resolveCarrierUserIdFromTimeline(detail) || undefined);
      setDetailOpen(true);
      setAvailability([]);
      setDetailFallbackMode(false);

      if (canManageTransfer) {
        fetchTransferStaffSuggestions(transferId, detail?.sourceWarehouseId);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Can not load transfer detail";

      const messageLower = String(errorMessage).toLowerCase();
      const schemaIssue =
        messageLower.includes("popularity_score") ||
        messageLower.includes("column") ||
        String(error?.response?.status || "") === "500";

      if (schemaIssue) {
        const fromList =
          typeof transferRef === "object"
            ? transferRef
            : transfers.find((item) => item.id === transferId);

        const fallback = buildFallbackTransfer(fromList);
        if (fallback) {
          setSelectedTransfer(fallback);
          setSelectedCarrierToAssign(undefined);
          setStaffSuggestions([]);
          setAssignStaffHint("");
          setDetailOpen(true);
          setAvailability([]);
          setDetailFallbackMode(true);
          message.warning(
            "Detail API has a DB schema error, displaying basic view from list data.",
          );
        } else {
          message.error(errorMessage);
        }
      } else {
        message.error(errorMessage);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateDraft = async () => {
    if (!canManageTransfer) {
      message.info("Company Admin is in preview mode.");
      return;
    }

    try {
      const values = await createForm.validateFields();
      const sourceWarehouseId = values.sourceWarehouseId;
      const destinationWarehouseId = values.destinationWarehouseId;

      if (!sourceWarehouseId || !destinationWarehouseId) {
        message.error("Please select source and destination warehouses");
        return;
      }

      if (Number(sourceWarehouseId) === Number(destinationWarehouseId)) {
        message.error("Source and destination must be different");
        return;
      }

      const response = await api.post("/warehouse-transfers", {
        sourceWarehouseId: Number(sourceWarehouseId),
        destinationWarehouseId: Number(destinationWarehouseId),
        carrierUserId: null,
        submitAfterCreate: false,
      });

      const newId = Number(response?.data?.id || 0);

      message.success("Created transfer draft successfully");
      setCreateModalOpen(false);
      createForm.resetFields();
      fetchTransfers();
      if (newId) {
        await fetchTransferDetail(newId);
      }
    } catch (error) {
      if (error?.errorFields) return;
      const errorMessage =
        error?.response?.data?.message || "Failed to create transfer";
      message.error(errorMessage);
    }
  };

  const handleAddItem = async () => {
    if (!canManageTransfer) {
      message.info("Company Admin is in preview mode.");
      return;
    }

    if (!selectedTransfer?.id) return;
    try {
      const values = await addItemForm.validateFields();
      await api.post(`/warehouse-transfers/${selectedTransfer.id}/items`, {
        productId: values.productId,
        quantity: values.quantity,
      });

      addItemForm.resetFields();
      message.success("Added item to transfer");
      await fetchTransferDetail(selectedTransfer.id);
      fetchTransfers();
    } catch (error) {
      if (error?.errorFields) return;
      const errorMessage = error?.response?.data?.message || "Can not add item";
      message.error(errorMessage);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!canManageTransfer) {
      message.info("Company Admin is in preview mode.");
      return;
    }

    if (!selectedTransfer?.id || !itemId) return;
    try {
      await api.delete(`/warehouse-transfers/${selectedTransfer.id}/items/${itemId}`);
      message.success("Removed item");
      await fetchTransferDetail(selectedTransfer.id);
      fetchTransfers();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Can not remove item";
      message.error(errorMessage);
    }
  };

  const openEditItemModal = (item) => {
    setEditingItem(item);
    itemEditForm.setFieldsValue({
      productId: item?.productId,
      quantity: item?.quantity,
    });
    setItemEditModalOpen(true);
  };

  const resolveCarrierUserIdFromTimeline = (transfer) => {
    const timeline = transfer?.timeline || [];
    for (let i = timeline.length - 1; i >= 0; i -= 1) {
      const action = timeline[i]?.action || "";
      if (!action.startsWith("CARRIER:")) continue;
      const value = Number(action.split(":")[1]);
      if (Number.isFinite(value) && value > 0) return value;
    }
    return null;
  };

  const assignCarrierForTransfer = async () => {
    if (!canManageTransfer) {
      message.info("Company Admin dang o che do xem UI cho chuyen kho.");
      return;
    }

    if (!selectedTransfer?.id) return;
    if (!selectedCarrierToAssign) {
      message.warning("Please choose a staff first");
      return;
    }

    setAssigningCarrier(true);
    try {
      await api.post(
        `/warehouse-transfers/${selectedTransfer.id}/assign-carrier`,
        {
          carrierUserId: Number(selectedCarrierToAssign),
        },
      );

      message.success("Assigned transfer staff successfully");
      await fetchTransferDetail(selectedTransfer.id);
      fetchTransfers();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Can not assign staff";
      message.error(errorMessage);
    } finally {
      setAssigningCarrier(false);
    }
  };

  const assignCarrierByTransferId = async (transferId, carrierUserId) => {
    if (!transferId || !carrierUserId) return;

    await api.post(
      `/warehouse-transfers/${transferId}/assign-carrier`,
      {
        carrierUserId: Number(carrierUserId),
      },
    );
  };

  const openEditDraftModal = (transfer) => {
    if (!transfer) return;

    fetchCarrierCandidatesByWarehouse(transfer.sourceWarehouseId);

    editDraftForm.setFieldsValue({
      sourceWarehouseId: transfer.sourceWarehouseId,
      destinationWarehouseId: transfer.destinationWarehouseId,
      carrierUserId: resolveCarrierUserIdFromTimeline(transfer),
    });

    setEditDraftModalOpen(true);
  };

  const submitEditDraft = async () => {
    if (!canManageTransfer) {
      message.info("Company Admin dang o che do xem UI cho chuyen kho.");
      return;
    }

    if (!selectedTransfer?.id) return;
    try {
      const values = await editDraftForm.validateFields();
      setSubmittingDraftUpdate(true);

      await api.put(`/warehouse-transfers/${selectedTransfer.id}`, {
        sourceWarehouseId: values.sourceWarehouseId,
        destinationWarehouseId: values.destinationWarehouseId,
        carrierUserId: values.carrierUserId || null,
      });

      if (values?.carrierUserId) {
        await assignCarrierByTransferId(selectedTransfer.id, values.carrierUserId);
      }

      message.success("Updated transfer draft");
      setEditDraftModalOpen(false);
      await fetchTransferDetail(selectedTransfer.id);
      fetchTransfers();
    } catch (error) {
      if (error?.errorFields) return;
      const errorMessage =
        error?.response?.data?.message || "Can not update transfer draft";
      message.error(errorMessage);
    } finally {
      setSubmittingDraftUpdate(false);
    }
  };

  const openBulkAddModal = () => {
    bulkAddForm.setFieldsValue({
      lines: [{ productId: undefined, quantity: 1 }],
    });
    setBulkAddModalOpen(true);
  };

  const submitBulkAdd = async () => {
    if (!canManageTransfer) {
      message.info("Company Admin is in preview mode.");
      return;
    }

    if (!selectedTransfer?.id) return;
    try {
      const values = await bulkAddForm.validateFields();
      const lines = (values?.lines || []).filter(
        (line) => line?.productId && Number(line?.quantity) > 0,
      );

      if (!lines.length) {
        message.warning("Please add at least one valid item");
        return;
      }

      setSubmittingBulkAdd(true);
      for (const line of lines) {
        await api.post(`/warehouse-transfers/${selectedTransfer.id}/items`, {
          productId: line.productId,
          quantity: Number(line.quantity),
        });
      }

      message.success(`Added ${lines.length} item line(s)`);
      setBulkAddModalOpen(false);
      await fetchTransferDetail(selectedTransfer.id);
      fetchTransfers();
    } catch (error) {
      if (error?.errorFields) return;
      const errorMessage =
        error?.response?.data?.message || "Can not bulk add items";
      message.error(errorMessage);
    } finally {
      setSubmittingBulkAdd(false);
    }
  };

  const submitEditItem = async () => {
    if (!canManageTransfer) {
      message.info("Company Admin is in preview mode.");
      return;
    }

    if (!selectedTransfer?.id || !editingItem?.id) return;
    try {
      const values = await itemEditForm.validateFields();
      await api.put(
        `/warehouse-transfers/${selectedTransfer.id}/items/${editingItem.id}`,
        {
          productId: values.productId,
          quantity: values.quantity,
        },
      );

      message.success("Updated item");
      setItemEditModalOpen(false);
      setEditingItem(null);
      itemEditForm.resetFields();
      await fetchTransferDetail(selectedTransfer.id);
      fetchTransfers();
    } catch (error) {
      if (error?.errorFields) return;
      const errorMessage =
        error?.response?.data?.message || "Can not update item";
      message.error(errorMessage);
    }
  };

  const runTransition = async (transferId, action) => {
    if (!canManageTransfer) {
      message.info("Company Admin is in preview mode.");
      return;
    }

    try {
      await api.post(`/warehouse-transfers/${transferId}/${action}`);
      message.success(`${action.toUpperCase()} successfully`);
      if (selectedTransfer?.id === transferId) {
        await fetchTransferDetail(transferId);
      }
      fetchTransfers();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || `Failed to ${action} transfer`;
      message.error(errorMessage);
    }
  };

  const openReasonModal = (type, transferId) => {
    if (!canManageTransfer) {
      message.info("Company Admin is in preview mode.");
      return;
    }

    setActionModal({ open: true, type, transferId });
    setActionReason("");
  };

  const submitReasonAction = async () => {
    if (!canManageTransfer) {
      message.info("Company Admin is in preview mode.");
      return;
    }

    if (!actionModal.transferId) return;
    const reason = actionReason.trim();

    if (actionModal.type === "reject" && !reason) {
      message.warning("Please enter reject reason");
      return;
    }

    setSubmittingAction(true);
    try {
      if (actionModal.type === "reject") {
        await api.post(
          `/warehouse-transfers/${actionModal.transferId}/reject`,
          { reason },
        );
      } else {
        await api.post(
          `/warehouse-transfers/${actionModal.transferId}/cancel`,
          { reason: reason || null },
        );
      }

      message.success(
        actionModal.type === "reject"
          ? "Rejected transfer successfully"
          : "Cancelled transfer successfully",
      );

      setActionModal({ open: false, type: "", transferId: null });
      setActionReason("");

      if (selectedTransfer?.id === actionModal.transferId) {
        await fetchTransferDetail(actionModal.transferId);
      }
      fetchTransfers();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to complete action";
      message.error(errorMessage);
    } finally {
      setSubmittingAction(false);
    }
  };

  const checkAvailability = async () => {
    if (!selectedTransfer?.id) return;

    if (detailFallbackMode) {
      message.warning(
        "Cannot check availability while detail API is in fallback mode.",
      );
      return;
    }

    setCheckingAvailability(true);
    try {
      const response = await api.get(
        `/warehouse-transfers/${selectedTransfer.id}/availability`,
      );
      setAvailability(response.data || []);
      message.success("Updated availability");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Can not check availability";
      message.error(errorMessage);
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
    if (canManageTransfer) {
      fetchProducts();
    }
    fetchWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageTransfer]);

  const openCreateDraftModal = () => {
    createForm.resetFields();

    const sourceWarehouseId = Number(managerWarehouseId || 0);
    const hasSourceInOptions = warehouseOptions.some(
      (option) => Number(option.value) === sourceWarehouseId,
    );

    if (sourceWarehouseId > 0 && hasSourceInOptions) {
      createForm.setFieldsValue({ sourceWarehouseId });
    }

    setCreateModalOpen(true);
  };

  const transferItemColumns = [
    {
      title: "Product",
      key: "product",
      width: "55%",
      render: (_, item) =>
        item.productName
          ? `${item.productName} (#${item.productId})`
          : `Product #${item.productId}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (qty) => (
        <div className="flex items-center justify-center h-full">
          <Text strong className="!text-slate-700 !text-sm">
            {qty}
          </Text>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 110,
      align: "center",
      render: (_, item) =>
        EDITABLE_STATUSES.includes(selectedStatus) ? (
          <div className="flex items-center justify-center gap-2.5">
            <Button
              size="small"
              className="!h-9 !w-9 !min-w-[36px] !p-0 !rounded-xl !flex !items-center !justify-center !border-indigo-100 !bg-indigo-50/50 !text-indigo-500 hover:!bg-indigo-100 hover:!text-indigo-600 hover:!scale-110 hover:!shadow-md hover:!shadow-indigo-100/50 !transition-all !duration-300"
              icon={<Pencil size={15} />}
              onClick={() => openEditItemModal(item)}
            />
            <Button
              size="small"
              danger
              className="!h-9 !w-9 !min-w-[36px] !p-0 !rounded-xl !flex !items-center !justify-center !border-rose-100 !bg-rose-50/50 !text-rose-500 hover:!bg-rose-100 hover:!text-rose-600 hover:!scale-110 hover:!shadow-md hover:!shadow-rose-100/50 !transition-all !duration-300"
              icon={<Trash2 size={15} />}
              onClick={() => handleRemoveItem(item.id)}
            />
          </div>
        ) : (
          <Text type="secondary" className="!text-slate-300 !text-xs italic">
            No actions
          </Text>
        ),
    },
  ];

  const availabilityColumns = [
    {
      title: "Product",
      key: "product",
      width: "55%",
      render: (_, item) =>
        item.productName
          ? `${item.productName} (#${item.productId})`
          : `Product #${item.productId}`,
    },
    {
      title: "Required",
      dataIndex: "requiredQuantity",
      key: "requiredQuantity",
      width: 110,
      align: "center",
    },
    {
      title: "Available",
      dataIndex: "availableQuantity",
      key: "availableQuantity",
      width: 120,
      align: "center",
    },
    {
      title: "Enough",
      dataIndex: "isEnough",
      key: "isEnough",
      width: 120,
      align: "center",
      render: (value) =>
        value ? <Tag color="green">YES</Tag> : <Tag color="red">NO</Tag>,
    },
  ];

  const selectedStatus = normalizeStatus(selectedTransfer?.status);
  const carrierFromTimeline = resolveCarrierUserIdFromTimeline(selectedTransfer);

  const mergedCarrierOptions = useMemo(() => {
    const map = new Map();

    staffSuggestions.forEach((staff) => {
      const userId = Number(staff?.userId);
      if (!userId) return;

      const score = Number(staff?.suggestionScore || 0);
      const taskCount = Number(staff?.activeTransferTaskCount || 0);
      const rawReason = staff?.reason || "";
      const translatedReason = rawReason.replace(
        "Đang xử lý 1 phiếu chuyển.",
        "Processing 1 transfer order.",
      );

      const label = staff?.fullName
        ? `${staff.fullName} (#${userId}) - Score ${score} - Active ${taskCount}${translatedReason ? ` - ${translatedReason}` : ""}`
        : `Staff #${userId} - Score ${score}`;

      map.set(userId, {
        value: userId,
        label,
      });
    });

    return Array.from(map.values());
  }, [staffSuggestions]);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <section className="md:px-16 lg:px-12 pt-7 pb-10">
        <WarehouseTransferHeader
          loading={loading}
          onSync={fetchTransfers}
          onOpenCreate={openCreateDraftModal}
          canCreate={canManageTransfer}
          subtitle={
            canManageTransfer
              ? "Manager can create, submit, approve, reject and cancel transfer orders."
              : "Company Admin can access transfer UI here. Mutating actions are manager-only."
          }
        />

        {!canManageTransfer && readOnlyNotice && (
          <Alert
            className="!mb-4"
            type="info"
            showIcon
            message="Read-only UI mode"
            description={readOnlyNotice}
          />
        )}

        <WarehouseTransferFilters
          searchText={searchText}
          onSearchChange={(e) => setSearchText(e.target.value)}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sourceFilter={sourceFilter}
          onSourceChange={setSourceFilter}
          destinationFilter={destinationFilter}
          onDestinationChange={setDestinationFilter}
          warehouseOptions={warehouseOptions}
        />

        <div className="bg-white rounded-[1rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden p-6">
          <WarehouseTransferTable
            data={filteredTransfers}
            loading={loading}
            normalizeStatus={normalizeStatus}
            statusColorMap={statusColorMap}
            editableStatuses={EDITABLE_STATUSES}
            canCancelStatuses={CAN_CANCEL_STATUSES}
            canManageActions={canManageTransfer}
            onViewDetail={fetchTransferDetail}
            onSubmit={(transferId) => runTransition(transferId, "submit")}
            onApprove={(transferId) => runTransition(transferId, "approve")}
            onOpenReject={(transferId) => openReasonModal("reject", transferId)}
            onOpenCancel={(transferId) => openReasonModal("cancel", transferId)}
          />
        </div>
      </section>

      <Modal
        title={`Update Draft #${selectedTransfer?.id || ""}`}
        open={editDraftModalOpen}
        onCancel={() => setEditDraftModalOpen(false)}
        onOk={submitEditDraft}
        okText="Save draft"
        okButtonProps={{ loading: submittingDraftUpdate, disabled: !canManageTransfer }}
      >
        <Form form={editDraftForm} layout="vertical">
          <Form.Item
            label="Source Warehouse"
            name="sourceWarehouseId"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const sourceWarehouseId = value;
                  const destinationWarehouseId = getFieldValue("destinationWarehouseId");

                  if (!sourceWarehouseId) {
                    return Promise.reject(new Error("Please select source warehouse"));
                  }

                  if (
                    !destinationWarehouseId ||
                    Number(sourceWarehouseId) !== Number(destinationWarehouseId)
                  )
                    return Promise.resolve();
                  return Promise.reject(new Error("Source and destination must be different"));
                },
              }),
            ]}
          >
            <Select
              showSearch
              loading={warehouseLoading}
              options={warehouseOptions}
              placeholder="Select source warehouse"
              optionFilterProp="label"
              onChange={(value) => {
                editDraftForm.setFieldValue("carrierUserId", undefined);
                fetchCarrierCandidatesByWarehouse(value);
              }}
            />
          </Form.Item>

          <Form.Item
            label="Carrier (optional)"
            name="carrierUserId"
            extra={carrierHint || "Neu de trong, phieu van tao duoc."}
          >
            <Select
              allowClear
              showSearch
              loading={carrierLoading}
              options={carrierOptions}
              placeholder="Select staff carrier"
              optionFilterProp="label"
              notFoundContent={carrierLoading ? "Loading..." : "No assigned staff"}
            />
          </Form.Item>

          <Form.Item
            label="Destination Warehouse"
            name="destinationWarehouseId"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const sourceWarehouseId = getFieldValue("sourceWarehouseId");
                  const destinationWarehouseId = value;

                  if (!destinationWarehouseId) {
                    return Promise.reject(new Error("Please select destination warehouse"));
                  }

                  if (
                    !sourceWarehouseId ||
                    Number(destinationWarehouseId) !== Number(sourceWarehouseId)
                  )
                    return Promise.resolve();
                  return Promise.reject(new Error("Source and destination must be different"));
                },
              }),
            ]}
          >
            <Select
              showSearch
              loading={warehouseLoading}
              options={warehouseOptions}
              placeholder="Select destination warehouse"
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Bulk Add Items #${selectedTransfer?.id || ""}`}
        open={bulkAddModalOpen}
        onCancel={() => setBulkAddModalOpen(false)}
        onOk={submitBulkAdd}
        okText="Add all"
        okButtonProps={{ loading: submittingBulkAdd, disabled: !canManageTransfer }}
        width={760}
        styles={{ body: { paddingTop: 12 } }}
      >
        <Form form={bulkAddForm} layout="vertical">
          <Form.List name="lines">
            {(fields, { add, remove }) => (
              <Space direction="vertical" className="!w-full" size={12}>
                {fields.map((field) => (
                  <Row gutter={[12, 8]} key={field.key} align="bottom">
                    <Col xs={24} md={14}>
                      <Form.Item
                        {...field}
                        name={[field.name, "productId"]}
                        label="Product"
                        rules={[{ required: true, message: "Product required" }]}
                      >
                        <Select
                          showSearch
                          options={productOptions}
                          placeholder="Select product"
                          optionFilterProp="label"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item
                        {...field}
                        name={[field.name, "quantity"]}
                        label="Qty"
                        rules={[{ required: true, message: "Qty required" }]}
                      >
                        <InputNumber min={1} className="!w-full" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4} className="!flex !items-end">
                      <Button danger block className="!h-10" onClick={() => remove(field.name)}>
                        Remove
                      </Button>
                    </Col>
                  </Row>
                ))}

                <Button type="dashed" onClick={() => add({ productId: undefined, quantity: 1 })}>
                  Add line
                </Button>
              </Space>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title={<span className="!text-xl !font-bold !text-slate-800">Create Transfer Draft</span>}
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreateDraft}
        centered
        width={620}
        okText="Create Draft"
        styles={{ body: { paddingTop: 12 } }}
        okButtonProps={{
          disabled: !canManageTransfer,
          className:
            "!h-10 !px-6 !bg-[#39C6C6] !border-none !rounded-xl !font-bold hover:!bg-[#2eb1b1]",
        }}
        cancelButtonProps={{ className: "!h-10 !px-6 !rounded-xl !font-medium" }}
      >
        <Form form={createForm} layout="vertical" className="!mt-1">
          {warehouseOptions.length === 0 && (
            <Alert
              className="!mb-3"
              type="warning"
              showIcon
              message="Warehouse list is unavailable"
              description="Backend dang tra 404/403 cho endpoint kho. Chua the tao phieu khi khong co danh sach kho."
            />
          )}

          <Form.Item
            label={
              <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                Source Warehouse
              </span>
            }
            name="sourceWarehouseId"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const sourceWarehouseId = value;
                  const destinationWarehouseId = getFieldValue("destinationWarehouseId");

                  if (!sourceWarehouseId) {
                    return Promise.reject(new Error("Please select source warehouse"));
                  }

                  if (
                    !destinationWarehouseId ||
                    Number(sourceWarehouseId) !== Number(destinationWarehouseId)
                  )
                    return Promise.resolve();
                  return Promise.reject(new Error("Source and destination must be different"));
                },
              }),
            ]}
          >
            <Select
              showSearch
              loading={warehouseLoading}
              placeholder="Select source warehouse"
              options={warehouseOptions}
              optionFilterProp="label"
              className="!w-full transfer-create-select"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                Destination Warehouse
              </span>
            }
            name="destinationWarehouseId"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const sourceWarehouseId = getFieldValue("sourceWarehouseId");
                  const destinationWarehouseId = value;

                  if (!destinationWarehouseId) {
                    return Promise.reject(new Error("Please select destination warehouse"));
                  }

                  if (
                    !sourceWarehouseId ||
                    Number(destinationWarehouseId) !== Number(sourceWarehouseId)
                  )
                    return Promise.resolve();
                  return Promise.reject(new Error("Source and destination must be different"));
                },
              }),
            ]}
          >
            <Select
              showSearch
              loading={warehouseLoading}
              placeholder="Select destination warehouse"
              options={warehouseOptions}
              optionFilterProp="label"
              className="!w-full transfer-create-select"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <span className="!text-xl !font-bold !text-slate-800">
            Edit Item {editingItem ? `#${editingItem.id}` : ""}
          </span>
        }
        open={itemEditModalOpen}
        onCancel={() => {
          setItemEditModalOpen(false);
          setEditingItem(null);
          itemEditForm.resetFields();
        }}
        onOk={submitEditItem}
        okText="Save"
        centered
        width={560}
        styles={{ body: { paddingTop: 12 } }}
        okButtonProps={{
          disabled: !canManageTransfer,
          className:
            "!h-11 !px-6 !bg-[#39C6C6] !border-none !rounded-xl !font-bold hover:!bg-[#2eb1b1]",
        }}
        cancelButtonProps={{ className: "!h-11 !px-6 !rounded-xl !font-medium" }}
      >
        <Form form={itemEditForm} layout="vertical" className="!mt-1">
          <Form.Item
            name="productId"
            label={
              <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                Product
              </span>
            }
            rules={[{ required: true, message: "Product required" }]}
          >
            <Select
              showSearch
              options={productOptions}
              placeholder="Select product"
              optionFilterProp="label"
              className="!w-full transfer-edit-select"
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            label={
              <span className="!text-slate-500 !font-bold !uppercase !text-[10px] !tracking-widest">
                Quantity
              </span>
            }
            rules={[{ required: true, message: "Quantity required" }]}
          >
            <InputNumber
              min={1}
              className="!w-full transfer-edit-input-number"
              placeholder="Quantity"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={actionModal.type === "reject" ? "Reject Transfer" : "Cancel Transfer"}
        open={actionModal.open}
        onCancel={() => setActionModal({ open: false, type: "", transferId: null })}
        onOk={submitReasonAction}
        okText={actionModal.type === "reject" ? "Reject" : "Cancel transfer"}
        okButtonProps={{
          loading: submittingAction,
          danger: actionModal.type === "reject",
          disabled: !canManageTransfer,
        }}
      >
        <Input.TextArea
          rows={4}
          value={actionReason}
          onChange={(e) => setActionReason(e.target.value)}
          placeholder={
            actionModal.type === "reject"
              ? "Reject reason is required"
              : "Cancel reason (optional)"
          }
        />
      </Modal>

      <Drawer
        title={selectedTransfer ? `Transfer #${selectedTransfer.id}` : "Transfer Detail"}
        width={isMobile ? window.innerWidth * 0.95 : 880}
        className="transfer-detail-drawer"
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailFallbackMode(false);
        }}
        loading={detailLoading}
      >
        {!selectedTransfer ? null : (
          <Space direction="vertical" size={16} className="!w-full">
            {detailFallbackMode && (
              <Card className="!rounded-2xl !border-slate-100 !shadow-sm transfer-detail-card">
                <Text type="warning">
                  Detail API đang lỗi do schema DB. Màn hình đang hiển thị dữ liệu cơ bản từ danh sách.
                </Text>
              </Card>
            )}

            <Card className="!rounded-2xl !border-slate-100 !shadow-sm transfer-detail-card">
              <Row gutter={[12, 8]}>
                <Col xs={24} md={12}>
                  <Text type="secondary">Source</Text>
                  <div>
                    <Text strong>
                      {selectedTransfer.sourceWarehouseName || "Unknown"} (
                      {selectedTransfer.sourceWarehouseId})
                    </Text>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <Text type="secondary">Destination</Text>
                  <div>
                    <Text strong>
                      {selectedTransfer.destinationWarehouseName || "Unknown"} (
                      {selectedTransfer.destinationWarehouseId})
                    </Text>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <Text type="secondary">Status</Text>
                  <div>
                    <Tag color={statusColorMap[selectedStatus] || "default"} className="!rounded-md !px-3 !py-0.5 !font-bold uppercase text-[10px] !m-0">
                      {selectedStatus}
                    </Tag>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <Text type="secondary">Created At</Text>
                  <div>
                    <Text strong>
                      {selectedTransfer.createdAt
                        ? new Date(selectedTransfer.createdAt).toLocaleString("vi-VN")
                        : "-"}
                    </Text>
                  </div>
                </Col>
              </Row>

              <Space className="!mt-4" wrap size={[8, 8]}>
                {EDITABLE_STATUSES.includes(selectedStatus) && (
                  <Button
                    className="!h-10 !rounded-xl !font-bold !border-slate-200"
                    icon={<Pencil size={14} />}
                    disabled={!canManageTransfer}
                    onClick={() => openEditDraftModal(selectedTransfer)}
                  >
                    Update Draft
                  </Button>
                )}

                {EDITABLE_STATUSES.includes(selectedStatus) && (
                  <Button
                    type="primary"
                    className="!h-10 !rounded-xl !font-bold !bg-[#39C6C6] !border-none hover:!bg-[#2eb1b1]"
                    icon={<Send size={14} />}
                    disabled={!canManageTransfer}
                    onClick={() => runTransition(selectedTransfer.id, "submit")}
                  >
                    Submit
                  </Button>
                )}
                {selectedStatus === "PENDING_APPROVAL" && (
                  <>
                    <Button
                      type="primary"
                      className="!h-10 !rounded-xl !font-bold !bg-[#39C6C6] !border-none hover:!bg-[#2eb1b1]"
                      icon={<ClipboardCheck size={14} />}
                      disabled={!canManageTransfer}
                      onClick={() => runTransition(selectedTransfer.id, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      danger
                      className="!h-10 !rounded-xl !font-bold"
                      icon={<ClipboardX size={14} />}
                      disabled={!canManageTransfer}
                      onClick={() => openReasonModal("reject", selectedTransfer.id)}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {CAN_CANCEL_STATUSES.includes(selectedStatus) && (
                  <Button
                    className="!h-10 !rounded-xl !font-bold !border-slate-200"
                    icon={<XCircle size={14} />}
                    disabled={!canManageTransfer}
                    onClick={() => openReasonModal("cancel", selectedTransfer.id)}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  className="!h-10 !rounded-xl !font-bold !border-slate-200"
                  icon={<RefreshCw size={14} />}
                  loading={checkingAvailability}
                  disabled={detailFallbackMode}
                  onClick={checkAvailability}
                >
                  Check Availability
                </Button>

                {EDITABLE_STATUSES.includes(selectedStatus) && (
                  <Button
                    className="!h-10 !rounded-xl !font-bold !border-slate-200"
                    disabled={!canManageTransfer}
                    onClick={openBulkAddModal}
                  >
                    Bulk Add Items
                  </Button>
                )}
              </Space>
            </Card>

            <Card
              className="!rounded-2xl !border-slate-100 !shadow-sm transfer-detail-card"
              title="Assign Transfer Staff"
              extra={
                <Button
                  size="small"
                  className="!rounded-lg !font-medium"
                  loading={suggestingStaff}
                  disabled={!canManageTransfer || detailFallbackMode}
                  onClick={() => fetchTransferStaffSuggestions(
                    selectedTransfer.id,
                    selectedTransfer.sourceWarehouseId,
                  )}
                >
                  Refresh Suggestions
                </Button>
              }
            >
              <Space direction="vertical" size={8} className="!w-full">
                <Text type="secondary">
                  Select staff in charge of this warehouse transfer.
                </Text>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3 items-start">
                  <div>
                    <Select
                      className=" !h-[44px]  !w-full transfer-detail-select"
                      allowClear
                      showSearch
                      disabled={!canManageTransfer || detailFallbackMode}
                      loading={suggestingStaff}
                      value={selectedCarrierToAssign}
                      options={mergedCarrierOptions}
                      placeholder="Select transfer staff"
                      optionFilterProp="label"
                      onChange={(value) => setSelectedCarrierToAssign(value)}
                    />
                  </div>

                  <div>
                    <Button
                      block
                      type="primary"
                      className="!h-[44px] !rounded-xl !font-bold !bg-[#39C6C6] !border-none hover:!bg-[#2eb1b1] !flex !items-center !justify-center shadow-lg shadow-cyan-100"
                      loading={assigningCarrier}
                      disabled={
                        !canManageTransfer ||
                        detailFallbackMode ||
                        !EDITABLE_STATUSES.includes(selectedStatus) ||
                        !selectedCarrierToAssign
                      }
                      onClick={assignCarrierForTransfer}
                    >
                      Assign Staff
                    </Button>
                  </div>
                </div>

                <Text type="secondary">
                  Current assigned staff: {carrierFromTimeline ? `#${carrierFromTimeline}` : "None"}
                </Text>

                {assignStaffHint && <Text type="secondary">{assignStaffHint}</Text>}

                {!EDITABLE_STATUSES.includes(selectedStatus) && (
                  <Text type="warning">
                    Staff can only be assigned when the transfer is in DRAFT or REJECTED status.
                  </Text>
                )}
              </Space>
            </Card>

            <Card title="Transfer Items" className="!rounded-2xl !border-slate-100 !shadow-sm transfer-detail-card">
              <Table
                rowKey="id"
                size="small"
                className="storix-table"
                columns={transferItemColumns}
                dataSource={selectedTransfer.items || []}
                pagination={false}
                scroll={{ x: 640 }}
                locale={{
                  emptyText: detailFallbackMode
                    ? "Detail API schema error, unable to load item details"
                    : "No items",
                }}
              />

              {EDITABLE_STATUSES.includes(selectedStatus) && (
                <Form form={addItemForm} layout="vertical" className="!mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-[2fr_80px_140px] gap-3 items-start !w-full">
                    <div>
                      <Form.Item
                        name="productId"
                        rules={[{ required: true, message: "Product required" }]}
                        className="!mb-0"
                      >
                        <Select
                          showSearch
                          options={productOptions}
                          placeholder="Select product"
                          optionFilterProp="label"
                          className="!h-[44px] !w-full transfer-detail-select"
                        />
                      </Form.Item>
                    </div>

                    <div>
                      <Form.Item
                        name="quantity"
                        rules={[{ required: true, message: "Quantity required" }]}
                        className="!mb-0"
                      >
                        <InputNumber
                          min={1}
                          placeholder="Qty"
                          className="!w-full transfer-detail-input-number"
                        />
                      </Form.Item>
                    </div>

                    <div>
                      <Button
                        block
                        type="primary"
                        className="!h-[44px] !rounded-xl !font-bold !bg-[#39C6C6] !border-none hover:!bg-[#2eb1b1] !flex !items-center !justify-center shadow-lg shadow-cyan-100"
                        disabled={!canManageTransfer}
                        onClick={handleAddItem}
                      >
                        Add Item
                      </Button>
                    </div>
                  </div>
                </Form>
              )}
            </Card>

            <Card title="Availability" className="!rounded-2xl !border-slate-100 !shadow-sm transfer-detail-card">
              <Table
                rowKey="productId"
                size="small"
                className="storix-table"
                columns={availabilityColumns}
                dataSource={availability}
                pagination={false}
                scroll={{ x: 640 }}
                locale={{ emptyText: "Click 'Check Availability' to load data" }}
              />
            </Card>

            <Card title="Timeline" className="!rounded-2xl !border-slate-100 !shadow-sm transfer-detail-card">
              <Table
                rowKey="id"
                size="small"
                className="storix-table"
                pagination={false}
                scroll={{ x: 760 }}
                columns={[
                  {
                    title: "Timestamp",
                    dataIndex: "timestamp",
                    key: "timestamp",
                    width: 200,
                    render: (value) =>
                      value ? new Date(value).toLocaleString("en-US", { hour12: false }) : "-",
                  },
                  {
                    title: "Action",
                    dataIndex: "action",
                    key: "action",
                  },
                  {
                    title: "User",
                    key: "user",
                    render: (_, row) =>
                      row.userName
                        ? `${row.userName} (#${row.userId || "?"})`
                        : row.userId
                          ? `User #${row.userId}`
                          : "-",
                  },
                ]}
                dataSource={selectedTransfer.timeline || []}
                locale={{
                  emptyText: detailFallbackMode
                    ? "Detail API schema error, unable to load timeline"
                    : "No timeline",
                }}
              />
            </Card>
          </Space>
        )}
      </Drawer>

      <style jsx global>{`
        .transfer-create-select .ant-select-selector {
          height: 44px !important;
          border-radius: 12px !important;
          background: #f8fafc !important;
          border-color: #e2e8f0 !important;
          display: flex !important;
          align-items: center !important;
        }

        .transfer-create-select.ant-select-focused .ant-select-selector {
          border-color: #39c6c6 !important;
          box-shadow: 0 0 0 2px rgba(57, 198, 198, 0.18) !important;
        }

        .transfer-detail-card .ant-card-head {
          border-bottom: 1px solid #f1f5f9 !important;
        }

        .transfer-detail-card .ant-card-head-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
        }

        .transfer-detail-select .ant-select-selector {
          height: 44px !important;
          border-radius: 10px !important;
          background: #f8fafc !important;
          border-color: #e2e8f0 !important;
          display: flex !important;
          align-items: center !important;
        }

        .transfer-detail-select.ant-select-focused .ant-select-selector {
          border-color: #39c6c6 !important;
          box-shadow: 0 0 0 2px rgba(57, 198, 198, 0.15) !important;
        }

        .transfer-detail-input-number {
          border-radius: 10px !important;
          background: #f8fafc !important;
          border-color: #e2e8f0 !important;
          height: 44px !important;
        }

        .transfer-detail-input-number .ant-input-number-input-wrap {
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
        }

        .transfer-detail-input-number .ant-input-number-input {
          height: 44px !important;
          line-height: normal !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          display: flex !important;
          align-items: center !important;
        }

        .transfer-detail-select .ant-select-selection-item,
        .transfer-create-select .ant-select-selection-item {
          line-height: 44px !important;
        }

        .transfer-detail-card .ant-btn {
          height: 44px !important;
          min-height: 44px !important;
          max-height: 44px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .transfer-edit-select .ant-select-selector {
          height: 44px !important;
          border-radius: 10px !important;
          background: #f8fafc !important;
          border-color: #e2e8f0 !important;
          display: flex !important;
          align-items: center !important;
        }

        .transfer-edit-select.ant-select-focused .ant-select-selector {
          border-color: #39c6c6 !important;
          box-shadow: 0 0 0 2px rgba(57, 198, 198, 0.15) !important;
        }

        .transfer-edit-input-number {
          height: 44px !important;
          border-radius: 10px !important;
          background: #f8fafc !important;
          border-color: #e2e8f0 !important;
        }

        .transfer-edit-input-number .ant-input-number-input-wrap {
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
        }

        .transfer-edit-input-number .ant-input-number-input {
          height: 44px !important;
          line-height: normal !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          display: flex !important;
          align-items: center !important;
        }
      `}</style>
    </div>
  );
};

export default WarehouseTransferManagement;