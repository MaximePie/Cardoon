/// <reference types="../vite-env" />
import axios from "axios";
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage } from "../utils";

const backUrl = import.meta.env.VITE_API_URL;

// Resources
export const RESOURCES = {
  USERCARDS: "userCards/all",
  REVIEW_USERCARDS: "userCards",
  CARDS: "cards",
  USER_DAILY_GOAL: "users/daily-goal",
  CATEGORIES: "cards/categories",
  ITEMS: "items",
  MISTRAL: "mistral",
};
export const ACTIONS = {
  UPDATE_INTERVAL: "userCards/updateInterval",
  INVERT_CARD: "cards/invert",
  LOGIN: "users/login",
  REGISTER: "users/register",
  ME: "users/me",
  BUY_ITEM: "users/buyItem",
  REMOVE_ITEM: "users/removeItem",
  UPGRADE_ITEM: "users/upgradeItem",
  UPDATE_ME_IMAGE: "users/me/image",
};

export const useAdminCatchup = () => {
  const url = `${backUrl}/api/admin/catchup`;
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<undefined | string>(undefined);

  const fetch = useCallback(() => {
    setLoading(true);
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);
        setError(undefined);
      })
      .catch((err) => {
        setError(extractErrorMessage(err));
        setLoading(false);
      });
  }, [url]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const post = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      setData(response.data);
      setLoading(false);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      setLoading(false);
    }
  };
  return { data, loading, error, fetch, post };
};

// Custom hook to get data
export const useFetch = <T>(resource: string) => {
  const url = `${backUrl}/api/${resource}`;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<undefined | string>(undefined);

  const fetch = useCallback(() => {
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);
        setError(undefined);
      })
      .catch((err) => {
        setError(extractErrorMessage(err));
        setLoading(false);
      });
  }, [url]);

  useEffect(() => {
    fetch();
  }, [url, fetch]);

  return { data, loading, error, fetch };
};
export const usePut = <T>(resource: string) => {
  const url = `${backUrl}/api/` + resource;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<undefined | string>(undefined);
  const put = async (id: string, payload: unknown) => {
    setLoading(true);
    try {
      const response = await axios.put(url + "/" + id, payload, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      setData(response.data);
      setLoading(false);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      setLoading(false);
    }
  };

  // Only use for connected user, no id required
  const putUser = async (payload: unknown) => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await axios.put(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
      setLoading(false);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      setLoading(false);
    }
  };

  return { data, loading, error, put, putUser };
};
export const useDelete = (resource: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<undefined | string>(undefined);

  const deleteResource = async (id: string) => {
    const url = `${backUrl}/api/` + resource + "/" + id;
    setLoading(true);
    try {
      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      setLoading(false);
      setError(undefined);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
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
    payload: unknown,
    contentType: "multipart/form-data" | null = null
  ) => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      if (contentType && contentType !== "multipart/form-data")
        headers["Content-Type"] = contentType;
      const response = await axios.post(url, payload, {
        headers: {
          ...headers,
        },
      });
      setData(response.data);
      setError(undefined);
      setLoading(false);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      setLoading(false);
    }
  };

  const asyncPost = async (payload: unknown): Promise<T | undefined> => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      return response.data;
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      setLoading(false);
    }
  };

  return { data, loading, error, post, asyncPost };
};
