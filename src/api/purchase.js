const API_BASE_URL = "http://localhost:8000/api/purchase"; 

const getUserId = () => sessionStorage.getItem("id");

const getHeaders = () => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) {
        console.error("JWT token not found. User is not authenticated.");
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

export async function fetchAddToCart(tourId, tourName, price) {
    const userId = getUserId();
    const url = `${API_BASE_URL}/${userId}/cart`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ 
                user_id: userId,
                tour_id: tourId,
                tour_name: tourName,
                price: price,
            }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `Failed to add item to cart (Status: ${response.status})`);
        }
        
        return data;
    } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
    }
}

export async function fetchRemoveFromCart(tourId) {
    const userId = getUserId();
    const url = `${API_BASE_URL}/${userId}/cart/${tourId}`;
    
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Failed to remove item (Status: ${response.status})`);
        }
        return data;
    } catch (error) {
        console.error("Error removing from cart:", error);
        throw error;
    }
}

export async function fetchGetCart() {
    const userId = getUserId();
    const url = `${API_BASE_URL}/${userId}/cart`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Failed to fetch cart (Status: ${response.status})`);
        }
        return data;
    } catch (error) {
        console.error("Error fetching cart:", error);
        throw error;
    }
}

export async function fetchCheckout() {
    const userId = getUserId();
    const url = `${API_BASE_URL}/${userId}/checkout`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ user_id: userId }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Checkout failed (Status: ${response.status})`);
        }
        return data;
    } catch (error) {
        console.error("Checkout process failed:", error);
        throw error;
    }
}

export async function fetchHasPurchased(tourId) {
    const userId = getUserId();
    const url = `${API_BASE_URL}/${userId}/purchased/${tourId}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(),
        });

        const data = await response.json();
        
        if (!response.ok) {
             throw new Error(data.message || `Error checking purchase status (Status: ${response.status})`);
        }
        
        return data.purchased
    } catch (error) {
        console.error("Error checking purchase status:", error);
        return false;
    }
}