export async function getAll() {
    try {
        const response = await fetch('http://localhost:8000/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
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
        const response = await fetch(`http://localhost:8000/api/users/${id}/block`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({id, block}), 
        });

        return await response.json();
    } catch (error) {
        console.error('Error blocking user:', error);
        return null; 
    }
}