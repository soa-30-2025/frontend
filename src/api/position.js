const API_BASE_URL = 'http://localhost:8000'

function authHeadersJson() {
    const token = sessionStorage.getItem('jwtToken') || '';
    return {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
    };
}

export async function setPosition(latitude, longitude) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/position`, {
            method: 'POST',
            headers: authHeadersJson(),
            body: JSON.stringify({
                latitude: latitude,
                longitude: longitude
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error setting position:', error);
        throw error;
    }
}

export async function getCurrentPosition() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/position`, {
            method: 'GET',
            headers: authHeadersJson(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null; 
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting position:', error);
        throw error;
    }
}

export async function deletePosition() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/position`, {
            method: 'DELETE',
            headers: authHeadersJson(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting position:', error);
        throw error;
    }
}