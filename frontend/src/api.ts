const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const getHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...getHeaders(),
        ...(options.headers as Record<string, string> || {})
    };
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "API Error");
    }

    return res.json();
};

// For multipart/form-data
export const uploadCall = async (endpoint: string, formData: FormData) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: getHeaders(),
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Upload Error");
    }
    return res.json();
};
