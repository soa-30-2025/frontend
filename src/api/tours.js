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

export async function createTour(newTour, tours, showModal, errorMessage) {
    errorMessage.value = "";
    if (!newTour.value.name.trim()) {
        errorMessage.value = "Name is required.";
        return;
    }
    if (!newTour.value.description.trim()) {
        errorMessage.value = "Description is required.";
        return;
    }
    if (!newTour.value.tags.trim()) {
        errorMessage.value = "At least one tag is required.";
        return;
    }

    const tagsArray = newTour.value.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

    if (tagsArray.length === 0) {
        errorMessage.value = "At least one valid tag is required.";
        return;
    }

    try {
        const token = sessionStorage.getItem("jwtToken");
        if (!token) {
            alert("You must be logged in to create a tour.");
            return;
        }

        const payload = {
            name: newTour.value.name.trim(),
            description: newTour.value.description.trim(),
            difficulty: newTour.value.difficulty,
            tags: tagsArray,
        };

        const res = await fetch("http://localhost:8000/api/tour", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
                body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to create tour");

        const data = await res.json();
        tours.value.push(data.tour);
        showModal.value = false;

        newTour.value = {
        name: "",
        description: "",
        difficulty: "easy",
        tags: "",
        };
    } catch (err) {
        console.error(err);
        errorMessage.value = "Error creating tour. Please try again.";
    }
}
