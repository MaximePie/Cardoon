import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
const backUrl = import.meta.env.VITE_API_URL;

// Resources
export const RESOURCES = {
  USERCARDS: "userCards",
  CARDS: "cards",
  USER: "user",
  CATEGORIES: "cards/categories",
  ITEMS: "items",
  MISTRAL: "mistral",
};
export const ACTIONS = {
  UPDATE_INTERVAL: "userCards/updateInterval",
  LOGIN: "users/login",
  REGISTER: "users/register",
  ME: "users/me",
  BUY_ITEM: "users/buyItem",
  REMOVE_ITEM: "users/removeItem",
  UPGRADE_ITEM: "users/upgradeItem",
};

// Custom hook to get data
export const useFetch = <T>(resource: string) => {
  const url = `${backUrl}/api/${resource}`;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<undefined | string>(undefined);

  useEffect(() => {
    fetch();
  }, [url]);

  const fetch = () => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get(
      "token"
    )}`;
    axios
      .get(url)
      .then((response) => {
        setData(response.data);
        setLoading(false);
        setError(undefined);
      })
      .catch((err) => {
        setError(err.response.data.message);
        setLoading(false);
      });
  };

  return { data, loading, error, fetch };
};
export const usePut = <T>(resource: string) => {
  const url = `${backUrl}/api/` + resource;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<undefined | string>(undefined);
  const put = async (id: string, payload: any) => {
    setLoading(true);
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get(
        "token"
      )}`;
      const response = await axios.put(url + "/" + id, payload);
      console.log("response", response);
      setData(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message + " " + err.response.data.errorMessage);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (data) {
      console.log("usePut", data);
    }
  }, [data]);

  return { data, loading, error, put };
};
export const useDelete = (resource: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("null");

  const deleteResource = async (id: string) => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get(
      "token"
    )}`;
    const url = `${backUrl}/api/` + resource + "/" + id;
    setLoading(true);
    try {
      await axios.delete(url).catch((err) => {
        setError(err.message + " " + err.response.data.errorMessage);
        setLoading(false);
      });
    } catch (err: any) {
      setError(err.message + " " + err.response.data.errorMessage);
      setLoading(false);
    }
  };

  return { loading, error, deleteResource };
};

export const usePost = <T>(resource: string) => {
  const url = `${backUrl}/api/` + resource;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<undefined | string>(undefined);

  const post = async (
    payload: any,
    contentType: "multipart/form-data" | null = null
  ) => {
    setLoading(true);
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get(
        "token"
      )}`;

      if (contentType) {
        axios.defaults.headers.post["Content-Type"] = contentType;
      }
      const response = await axios.post(url, payload);
      setData(response.data);
      setError(undefined);
      setLoading(false);
    } catch (err: any) {
      setError(err.message + " " + err.response.data.errorMessage);
      setLoading(false);
    }
  };

  const asyncPost = async (payload: any): Promise<T | undefined> => {
    setLoading(true);
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get(
        "token"
      )}`;
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(
        err.message + " " + err.response?.data?.errorMessage || "Unknown error"
      );
      setLoading(false);
    }
  };

  return { data, loading, error, post, asyncPost };
};
