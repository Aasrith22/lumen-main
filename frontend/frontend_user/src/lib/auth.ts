export const LOGIN_URL = 'http://127.0.0.1:3000/login';

export const getCurrentUser = () => {
	try {
		const userStr = localStorage.getItem('user');
		return userStr ? JSON.parse(userStr) : null;
	} catch (error) {
		console.error('Error getting current user:', error);
		return null;
	}
};
