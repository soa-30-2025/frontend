function authHeadersJson() {
    const token = sessionStorage.getItem('jwtToken') || '';
    return {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
    };
}

const BASE_URL = 'http://localhost:8000/api';

export const tourExecutionApi = {
    // Start tour execution
    async startTour(tourId) {
        const response = await fetch(`${BASE_URL}/tour-execution`, {
            method: 'POST',
            headers: authHeadersJson(),
            body: JSON.stringify({ tour_id: tourId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to start tour');
        }

        return await response.json();
    },

    // Update tour execution position
    async updateTourExecution(executionId, lat, lng) {
        const response = await fetch(`${BASE_URL}/tour-execution/${executionId}`, {
            method: 'PUT',
            headers: authHeadersJson(),
            body: JSON.stringify({ lat, lng })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update tour execution: ${errorText}`);
        }

        return await response.json();
    },

    // Update tour execution status
    async updateTourExecutionStatus(executionId, status) {
        const response = await fetch(`${BASE_URL}/tour-execution/${executionId}`, {
            method: 'PUT',
            headers: authHeadersJson(),
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update tour execution status: ${errorText}`);
        }

        return await response.json();
    },

    // Check proximity to keypoints
    async checkProximity(executionId) {
        const response = await fetch(
            `${BASE_URL}/tour-execution/${executionId}/check-proximity`,
            {
                method: 'GET',
                headers: authHeadersJson(),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to check proximity");
        }

        return await response.json();
    },

    async getCompletionStatus(executionId) {
        const response = await fetch(
            `${BASE_URL}/tour-execution/${executionId}/completion-status`,
            {
                method: 'GET',
                headers: authHeadersJson(),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to get completion status");
        }

        return await response.json();
    }
};