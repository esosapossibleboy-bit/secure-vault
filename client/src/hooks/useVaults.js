import { useState, useEffect } from "react";
import API from "../api/axios";

export const useVaults = () => {
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVaults = async () => {
    try {
      const res = await API.get("/vault");
      setVaults(res.data);
    } catch (err) {
      console.error("BOLA blocked", err.response?.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVaults(); }, []);

  return { vaults, loading, fetchVaults, setVaults };
};