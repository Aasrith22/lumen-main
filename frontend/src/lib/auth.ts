export const LOGIN_URL = 'http://127.0.0.1:3000/login';

export const logout = () => {
  // Clear all authentication data
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  localStorage.removeItem('isLoggedIn');
  
  // Show logout message
  alert('You have been logged out successfully!');
  
  // Redirect to login page
  window.location.replace(LOGIN_URL);
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};