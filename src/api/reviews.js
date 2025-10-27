const BASE_URL = 'http://localhost:8000/api';

function authHeadersJson() {
    const token = sessionStorage.getItem('jwtToken') || '';
    return {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
    };
}

export const reviewsApi = {
    async getReviewsByTour(tourId) {
        try {
            const response = await fetch(`${BASE_URL}/reviews/${tourId}`, {
                method: "GET",
                headers: authHeadersJson(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch reviews: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching reviews:", error);
            throw error;
        }
    },

    async createReview(reviewData) {
        try {
            const response = await fetch(`${BASE_URL}/review`, {
                method: "POST",
                headers: authHeadersJson(),
                body: JSON.stringify(reviewData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create review: ${response.status} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error creating review:", error);
            throw error;
        }
    },

    async checkReviewExists(tourId, touristId) {
        const response = await fetch(
            `${BASE_URL}/reviews/${tourId}/${touristId}/exists`,
            {
                method: 'GET',
                headers: authHeadersJson(),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to check review existence");
        }

        return await response.json();
    }
};