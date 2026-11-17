
const API_BASE_URL = "http://127.0.0.1:5000/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("marketplace_token");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export async function loginUser(email, password) {
  const data = await apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("marketplace_token", data.token);
  localStorage.setItem("marketplace_user", JSON.stringify(data.user));

  return data.user;
}

export function logoutUser() {
  localStorage.removeItem("marketplace_token");
  localStorage.removeItem("marketplace_user");
}

export function getStoredUser() {
  try {
    const user = localStorage.getItem("marketplace_user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("marketplace_token");
}

export async function registerUser(userData) {
  const data = await apiRequest("/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  localStorage.setItem("marketplace_token", data.token);
  localStorage.setItem("marketplace_user", JSON.stringify(data.user));

  return data.user;
}

export async function getCurrentUser() {
  const data = await apiRequest("/me");

  localStorage.setItem("marketplace_user", JSON.stringify(data.user));

  return data.user;
}
