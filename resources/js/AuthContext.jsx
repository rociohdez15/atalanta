// AuthContext.jsx
import React, {
    createContext,
    useState,
    useEffect,
    useCallback,
} from "react";

import axios from "axios";

export const AuthContext = createContext();

// Rutas que NUNCA intentan renovar la sesión
// (ajusta las de registro / olvidaste a tus rutas reales)
const NO_REFRESH = [
    "/api/auth/login",
    "/api/auth/refresh",
    "/api/auth/logout",
    "/api/auth/register",
    "/api/auth/olvidaste",
];

// Rutas que intentan renovar, pero si fallan NO redirigen al login
const SILENT = ["/api/auth/yo"];

let refreshing = null;
let originalFetch = null;

const isExcluded = (path) => NO_REFRESH.some((url) => path.startsWith(url));
const isSilent = (path) => SILENT.some((url) => path.startsWith(url));
const isApiRequest = (path) => path.startsWith("/api/");

// Renovar la sesión (una sola petición aunque fallen varias a la vez)
const refreshSession = async () => {
    if (!refreshing) {
        refreshing = originalFetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
            headers: { Accept: "application/json" },
        })
            .then((response) => response.ok)
            .catch(() => false)
            .finally(() => {
                refreshing = null;
            });
    }

    return refreshing;
};

// Cerrar sesión y redirigir
const expireSession = () => {
    window.dispatchEvent(new Event("auth:expired"));

    if (window.location.pathname !== "/login") {
        window.location.replace("/login");
    }
};

// Interceptores globales
if (typeof window !== "undefined" && !window.__authInterceptorsInstalled) {
    window.__authInterceptorsInstalled = true;

    // ---------------- FETCH ----------------
    originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init) => {
        const url = typeof input === "string" ? input : input.url;
        const path = new URL(url, window.location.origin).pathname;

        const retryInput = input instanceof Request ? input.clone() : input;

        const response = await originalFetch(input, init);

        if (
            response.status !== 401 ||
            !isApiRequest(path) ||
            isExcluded(path)
        ) {
            return response;
        }

        const refreshed = await refreshSession();

        if (!refreshed) {
            if (!isSilent(path)) expireSession();
            return response;
        }

        const retryResponse = await originalFetch(retryInput, init);

        if (retryResponse.status === 401 && !isSilent(path)) {
            expireSession();
        }

        return retryResponse;
    };

    // ---------------- AXIOS ----------------
    axios.defaults.withCredentials = true;

    axios.interceptors.response.use(
        (response) => response,

        async (error) => {
            const config = error.config;

            if (!config || error.response?.status !== 401) {
                return Promise.reject(error);
            }

            const path = new URL(
                config.url || "",
                config.baseURL || window.location.origin
            ).pathname;

            if (!isApiRequest(path) || isExcluded(path) || config._retry) {
                return Promise.reject(error);
            }

            config._retry = true;

            const refreshed = await refreshSession();

            if (!refreshed) {
                if (!isSilent(path)) expireSession();
                return Promise.reject(error);
            }

            try {
                return await axios(config);
            } catch (retryError) {
                if (retryError.response?.status === 401 && !isSilent(path)) {
                    expireSession();
                }
                return Promise.reject(retryError);
            }
        }
    );
}

// ---------------- PROVIDER ----------------
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/yo", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoadingUser(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Cuando la sesión caduca, limpiar el usuario
    useEffect(() => {
        const onExpired = () => setUser(null);
        window.addEventListener("auth:expired", onExpired);
        return () => window.removeEventListener("auth:expired", onExpired);
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
                headers: { Accept: "application/json" },
            });
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        } finally {
            setUser(null);
            window.location.replace("/login");
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, setUser, loadingUser, fetchUser, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};