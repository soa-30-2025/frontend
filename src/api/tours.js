const API_URL = "http://localhost:8000/api";

export async function fetchTours(loading, tours) {
    loading.value = true;
    try {
        const authorId = sessionStorage.getItem("id");
        if (!authorId) throw new Error("Author ID not found in sessionStorage");

        const res = await fetch(`${API_URL}/tours/${authorId}`);
        if (!res.ok) throw new Error("Failed to fetch tours");

        const data = await res.json();
        tours.value = data.tours || [];
    } catch (err) {
        console.error(err);
        tours.value = [];
    } finally {
        loading.value = false;
    }
}

export async function fetchAllTours(loading, tours) {
    loading.value = true;
    try {
        const res = await fetch(`${API_URL}/tours`);
        if (!res.ok) throw new Error("Failed to fetch tours");

        const data = await res.json();
        tours.value = data.tours || [];
    } catch (err) {
        console.error(err);
        tours.value = [];
    } finally {
        loading.value = false;
    }
}

function authHeadersJson() {
    const token = sessionStorage.getItem('jwtToken') || '';
    return {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
    };
}

function authHeaderOnly() {
    const token = sessionStorage.getItem('jwtToken') || '';
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResp(res) {
    const text = await res.text();
    if (!res.ok) {
        let payload = text;
        try { payload = JSON.parse(text); } catch { }
        const err = new Error(payload?.message || res.statusText || 'Request failed');
        err.status = res.status;
        err.body = payload;
        throw err;
    }
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
}


export async function createTour(body) {
    const res = await fetch(`${API_URL}/tour`, {
        method: 'POST',
        headers: authHeadersJson(),
        body: JSON.stringify(body),
    });
    return handleResp(res);
}

export async function getTour(id) {
    const res = await fetch(`${API_URL}/tour/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: authHeaderOnly(),
    });
    return handleResp(res);
}

export async function updateTour(id, body) {
    const res = await fetch(`${API_URL}/tour/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: authHeadersJson(),
        body: JSON.stringify(body),
    });
    return handleResp(res);
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export async function addKeypointBase64(tourId, { name, description, lat, lon, order, file }) {
    const headers = {
        ...authHeaderOnly(),
        'Content-Type': 'application/json',
    };

    let imageBase64 = null;
    let imageFilename = null;
    let imageContentType = null;

    if (file) {
        imageBase64 = await fileToBase64(file);
        imageFilename = file.name;
        imageContentType = file.type;
    }

    const body = {
        name: name ?? '',
        description: description ?? '',
        lat,
        lon,
        order,
        image: imageBase64, // base64 string
        image_filename: imageFilename,
        image_content_type: imageContentType,
    };

    const res = await fetch(`${API_URL}/tour/${encodeURIComponent(tourId)}/keypoints`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    return handleResp(res);
}


export async function updateKeypointAPI(keypointId, body) {
    const res = await fetch(`${API_URL}/keypoints/${encodeURIComponent(keypointId)}`, {
        method: 'PUT',
        headers: authHeadersJson(),
        body: JSON.stringify(body),
    });
    return handleResp(res);
}

export async function deleteKeypointAPI(keypointId) {
    const res = await fetch(`${API_URL}/keypoints/${encodeURIComponent(keypointId)}`, {
        method: 'DELETE',
        headers: authHeaderOnly(),
    });
    return handleResp(res);
}

export async function publishTourAPI(tourId) {
    const res = await fetch(`${API_URL}/tour/${encodeURIComponent(tourId)}/publish`, {
        method: 'POST',
        headers: authHeaderOnly(),
    });
    return handleResp(res);
}

export async function archiveTourAPI(tourId) {
    const res = await fetch(`${API_URL}/tour/${encodeURIComponent(tourId)}/archive`, {
        method: 'POST',
        headers: authHeaderOnly(),
    });
    return handleResp(res);
}

export async function unarchiveTourAPI(tourId) {
    const res = await fetch(`${API_URL}/tour/${encodeURIComponent(tourId)}/unarchive`, {
        method: 'POST',
        headers: authHeaderOnly(),
    });
    return handleResp(res);
}

export async function reorderKeypointsAPI(tourId, body) {
    const res = await fetch(`${API_URL}/tour/${encodeURIComponent(tourId)}/reorder-keypoints`, {
        method: 'POST',
        headers: authHeadersJson(),
        body: JSON.stringify(body),
    });
    return handleResp(res);
}

export async function reorderKeypoints(tourId, orderedIds) {
  const res = await fetch(`${API_URL}/tours/${tourId}/keypoints/reorder`, {
    method: 'POST',
    headers: authHeaderOnly(),
    body: JSON.stringify({ ordered_ids: orderedIds })
  });
  return res.data;
}
