export const getUser = () => JSON.parse(localStorage.getItem("user"));

export const logout = () => {
  localStorage.removeItem("user");
  window.dispatchEvent(new Event('authChanged'));
  window.location.href = "/auth"; // Redirect to Auth page (Login/Signup)
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (err) {
    console.error("Token validation error:", err);
    return true;
  }
};
