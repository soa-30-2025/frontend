export async function register(username, email, password, role) {
    try {
        const response = await fetch('http://localhost:8000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password, role }),
        });
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function login(user_info, password) {
    try {
        const response = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_info, password }),
        });
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}