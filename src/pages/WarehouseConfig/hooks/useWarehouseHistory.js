import { useState, useCallback } from "react";
import { MAX_HISTORY } from "../constants";

/**
 * Custom hook to manage undo history for warehouse zones.
 * Returns zones state, saveToHistory, and undo function.
 */
const useWarehouseHistory = () => {
  const [zones, setZones] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);

  const saveToHistory = useCallback(
    (newZones) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyStep + 1);
        const updated = [...next, JSON.parse(JSON.stringify(newZones))];
        return updated.slice(-MAX_HISTORY);
      });
      setHistoryStep((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
      setZones(newZones);
    },
    [historyStep],
  );

  const undo = useCallback(() => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      setZones(JSON.parse(JSON.stringify(history[prevStep])));
      return true; // Signal that undo was performed
    }
    return false;
  }, [history, historyStep]);

  return { zones, setZones, saveToHistory, undo };
};

export default useWarehouseHistory;
