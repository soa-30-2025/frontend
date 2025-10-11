const GATEWAY = 'http://localhost:8000'

export async function getAll() {
    try {
        const jwt = sessionStorage.getItem("jwtToken")
        const response = await fetch(`${GATEWAY}/api/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
        });

        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

export async function block(id, block) {
    try {
        const token = sessionStorage.getItem("jwtToken");
        const response = await fetch(`${GATEWAY}/api/users/${id}/block`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id, block }),
        });

        return await response.json();
    } catch (error) {
        console.error('Error blocking user:', error);
        return null;
    }
}

export async function getById(id) {
    try {
        const response = await fetch(`${GATEWAY}/api/users/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

export async function getByUsername(username) {
    try {
        const response = await fetch(`${GATEWAY}/api/users/username/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

export async function update(payload) {
    try {
        const res = await fetch(`${GATEWAY}/api/users/${encodeURIComponent(payload.id)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('jwtToken') || ''}`
            },
            body: JSON.stringify(payload),
        })
        return await res.json();
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}
