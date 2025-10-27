<template>
    <div class="p-8 max-w-5xl mx-auto">
        <div v-if="loading" class="text-gray-500 text-center">Loading tour details...</div>
        <div v-else-if="!tour" class="text-gray-500 text-center">Tour not found.</div>
        <div v-else>
            <button @click="$router.back()" class="mb-6 text-blue-600 hover:underline flex items-center">
                ← Back to tours
            </button>
            <div class="grid grid-cols-2 items-center mb-3">
                <h1 class="text-3xl font-bold">{{ tour.name }}</h1>
                <div class="flex gap-2 items-center justify-end">
                    <button @click="toggleReviews"
                        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                        {{ showReviews ? 'Hide Reviews' : 'Show Reviews' }}
                    </button>
                    <button v-if="userRole === 'tourist' && showAddReviewButton && !checkingReviewEligibility" @click="openReviewModal"
                        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                        Add Review
                    </button>
                </div>
            </div>
            <p class="text-gray-700 mb-6">{{ tour.description }}</p>
            <div v-if="showReviews" class="mb-8">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-2xl font-semibold">Reviews</h3>
                    <div v-if="reviewsLoading" class="text-gray-500">Loading reviews...</div>
                </div>
                <div v-if="reviews.length === 0 && !reviewsLoading" class="text-gray-500 text-center py-8">
                    No reviews yet. Be the first to add one!
                </div>
                <div v-else class="space-y-4">
                    <div v-for="review in reviews" :key="review.id"
                        class="border rounded-lg p-4 shadow hover:shadow-md transition">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="font-semibold text-gray-800">
                                        {{ userNames[review.touristId] || 'Loading...' }}
                                    </span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="font-semibold">Rating:</span>
                                    <div class="flex">
                                        <span v-for="n in 5" :key="n" class="text-lg"
                                            :class="n <= review.rating ? 'text-yellow-500' : 'text-gray-300'">
                                            ★
                                        </span>
                                    </div>
                                    <span class="text-gray-600">({{ review.rating }}/5)</span>
                                </div>
                                <p class="text-sm text-gray-500 mt-1">
                                    Visited on: {{ formatDate(review.visitDate) }}
                                </p>
                            </div>
                            <span class="text-sm text-gray-500">
                                {{ review.created_at }}
                            </span>
                        </div>
                        <p class="text-gray-700 mt-2">{{ review.comment }}</p>
                        <div v-if="review.imageUrls && review.imageUrls.length" class="mt-3">
                            <div class="flex gap-2 overflow-x-auto">
                                <img v-for="(imagePath, index) in review.imageUrls" :key="index"
                                    :src="getFullImageUrl(imagePath)" :alt="`Review image ${index + 1}`"
                                    class="h-20 w-20 object-cover rounded border cursor-pointer"
                                    @click="openImageModal(imagePath)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                    <p><strong>Difficulty:</strong> {{ tour.difficulty }}</p>
                    <p><strong>Status:</strong> {{ tour.status }}</p>
                </div>
                <div>
                    <p><strong>Price:</strong> {{ tour.price }} €</p>
                    <p><strong>Length:</strong> {{ tour.lengthKm }} km</p>
                </div>
            </div>
            <div class="mb-6" v-if="tour.tags && tour.tags.length">
                <h3 class="text-lg font-semibold mb-2">Tags:</h3>
                <div class="flex flex-wrap gap-2">
                    <span v-for="tag in tour.tags" :key="tag"
                        class="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {{ tag }}
                    </span>
                </div>
            </div>
            <!-- 🔸 Ako je tura kupljena – prikaz svih ključnih tačaka -->
            <div v-if="hasPurchased && keypoints.length > 0" class="mb-8">
                <h3 class="text-xl font-semibold mb-4">Keypoints</h3>
                <div class="space-y-4">
                    <div v-for="(kp, index) in keypoints" :key="kp.id"
                        class="border rounded-lg p-4 shadow hover:shadow-lg transition">
                        <h4 class="text-lg font-semibold mb-2">{{ index + 1 }}. {{ kp.name }}</h4>
                        <p class="text-gray-700 mb-2">{{ kp.description }}</p>
                        <p class="text-sm text-gray-500 mb-2">
                            <strong>Coordinates:</strong> ({{ kp.lat }}, {{ kp.lon }})
                        </p>
                        <img v-if="kp.image_path" :src="kp.image_path" alt="Keypoint image"
                            class="rounded-lg w-full h-64 object-cover" />
                    </div>
                </div>
            </div>
            <div v-else-if="!hasPurchased && keypoints.length > 0" class="mb-8">
                <h3 class="text-xl font-semibold mb-4">Starting Point</h3>
                <div class="border rounded-lg p-4 shadow hover:shadow-lg transition">
                    <h4 class="text-lg font-semibold mb-2">1. {{ keypoints[0].name }}</h4>
                    <p class="text-gray-700 mb-2">{{ keypoints[0].description }}</p>
                    <p class="text-sm text-gray-500 mb-2">
                        <strong>Coordinates:</strong> ({{ keypoints[0].lat }}, {{ keypoints[0].lon }})
                    </p>
                    <img v-if="keypoints[0].image_path" :src="keypoints[0].image_path" alt="Keypoint image"
                        class="rounded-lg w-full h-64 object-cover" />
                </div>
                <p class="mt-4 text-gray-500 italic text-center">
                    Purchase this tour to unlock all keypoints and the full route map.
                </p>
            </div>
            <div v-if="hasPurchased && keypoints.length > 0">
                <h3 class="text-xl font-semibold mb-4">Tour Map</h3>
                <div id="map" class="h-96 rounded-lg shadow"></div>
            </div>
        </div>
        <div v-if="showModal" class="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                <button @click="closeReviewModal" class="absolute top-2 right-3 text-gray-500 hover:text-gray-700">
                    ✕
                </button>
                <h2 class="text-2xl font-bold mb-4">Add a Review</h2>

                <form @submit.prevent="submitReview" class="space-y-4">
                    <div>
                        <label class="block mb-1 font-semibold">Rating (1–5)</label>
                        <input type="number" v-model="review.rating" min="1" max="5" required
                            class="border rounded w-full p-2" />
                    </div>

                    <div>
                        <label class="block mb-1 font-semibold">Comment</label>
                        <textarea v-model="review.comment" required class="border rounded w-full p-2 h-24"></textarea>
                    </div>
                    <div>
                        <label class="block mb-1 font-semibold">Upload Images</label>
                        <input type="file" multiple @change="handleImageUpload" />
                    </div>

                    <button type="submit"
                        class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
                        Submit Review
                    </button>
                </form>
            </div>
        </div>
    </div>
    <div v-if="showImageModal" class="fixed inset-0 bg-opacity-75 flex items-center justify-center z-50"
        @click="closeImageModal">
        <div class="relative max-w-4xl max-h-full">
            <button @click="closeImageModal" class="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300">
                ✕
            </button>
            <img :src="selectedImage" alt="Review image" class="max-w-full max-h-full object-contain" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { getTour } from "@/api/tours";
import { getById } from '@/api/stakeholder';
import { reviewsApi } from '@/api/reviews';
import { fetchHasPurchased } from '@/api/purchase';
import { tourExecutionApi } from '@/api/tourExecution';
import L from "leaflet";

const reviews = ref([]);
const showReviews = ref(false);
const reviewsLoading = ref(false);
const showImageModal = ref(false);
const selectedImage = ref("");

const route = useRoute();
const tour = ref(null);
const keypoints = ref([]);
const loading = ref(true);
const showModal = ref(false);
let map = null;
const userRole = ref('');

const userNames = ref({});
const loadingUsers = ref({});

const review = ref({
    rating: "",
    comment: "",
    images: [],
});

const hasPurchased = ref(false);

const showAddReviewButton = ref(false);
const checkingReviewEligibility = ref(false);

const tourExecutionData = ref(null);

const fetchUserName = async (touristId) => {
    if (!touristId) return;

    if (userNames.value[touristId]) {
        return;
    }

    loadingUsers.value[touristId] = true;

    try {
        const responseData = await getById(touristId);
        const username = responseData?.user?.username || 'Unknown User';
        userNames.value[touristId] = username;

        await nextTick();

    } catch (error) {
        console.error(`Error fetching user ${touristId}:`, error);
        userNames.value[touristId] = 'Error loading user';
    } finally {
        loadingUsers.value[touristId] = false;
    }
};

const fetchReviews = async () => {
    if (!tour.value?.id) return;

    reviewsLoading.value = true;
    try {
        const data = await reviewsApi.getReviewsByTour(tour.value.id);

        console.log("Raw reviews data:", data);
        console.log("First review:", data.reviews?.[0]);

        reviews.value = data.reviews || [];

        reviews.value.forEach(review => {
            if (review.touristId) {
                fetchUserName(review.touristId);
            }
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        alert("Error fetching reviews: " + error.message);
    } finally {
        reviewsLoading.value = false;
    }
};

const toggleReviews = async () => {
    showReviews.value = !showReviews.value;

    if (showReviews.value && reviews.value.length === 0) {
        await fetchReviews();
    }
};

const formatDate = (timestamp) => {
    if (!timestamp) return "Date not available";

    try {
        let date;

        if (timestamp.seconds !== undefined) {
            date = new Date(timestamp.seconds * 1000);
        } else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        } else {
            console.warn("Unknown timestamp format:", timestamp);
            return "Invalid date format";
        }

        return isNaN(date.getTime())
            ? "Invalid date"
            : date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
    } catch (error) {
        console.error("Error formatting date:", error, "Timestamp:", timestamp);
        return "Invalid date";
    }
};

const openImageModal = (imagePath) => {
    selectedImage.value = getFullImageUrl(imagePath);
    showImageModal.value = true;
};

const closeImageModal = () => {
    showImageModal.value = false;
    selectedImage.value = "";
};

onMounted(async () => {
    const tourId = route.params.id;
    try {
        userRole.value = sessionStorage.getItem('role') || '';
        const response = await getTour(tourId);
        tour.value = response.tour;
        console.log(tour.value)
        keypoints.value = response.keypoints || [];

        hasPurchased.value = await fetchHasPurchased(tourId);
        await checkReviewEligibility();
    } catch (err) {
        console.error("Error fetching tour:", err);
    } finally {
        loading.value = false;
    }

    await nextTick();
    if (keypoints.value.length > 0) {
        initMap();
    }
});

function initMap() {
    const first = keypoints.value[0];
    map = L.map("map").setView([first.lat, first.lon], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
    }).addTo(map);
    const points = keypoints.value.map(kp => [kp.lat, kp.lon]);
    points.forEach((coords, i) => {
        const marker = L.marker(coords).addTo(map);
        marker.bindPopup(`<b>${i + 1}. ${keypoints.value[i].name}</b><br>${keypoints.value[i].description}`);
    });
    const polyline = L.polyline(points, { color: "blue" }).addTo(map);
    map.fitBounds(polyline.getBounds());
}

const openReviewModal = () => (showModal.value = true);
const closeReviewModal = () => (showModal.value = false);

function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
            review.value.images.push({
                data: reader.result.split(",")[1],
                filename: file.name,
                content_type: file.type,
            });
        };
        reader.readAsDataURL(file);
    });
}

const submitReview = async () => {
    try {
        let visitDate;

        if (tourExecutionData.value?.execution?.endTime) {
            const endTime = tourExecutionData.value.execution.endTime;
            if (endTime.seconds) {
                visitDate = new Date(endTime.seconds * 1000).toISOString();
            } else if (typeof endTime === 'string') {
                visitDate = new Date(endTime).toISOString();
            }
        }

        console.log('Using visit date:', visitDate);

        const imagePromises = review.value.images.map(async (file) => {
            if (file.data) return file;
            const arrayBuffer = await file.arrayBuffer();
            const base64Data = btoa(
                new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
            );
            return {
                data: base64Data,
                filename: file.name,
                content_type: file.type,
            };
        });

        const images = await Promise.all(imagePromises);

        const reviewPayload = {
            tour_id: tour.value.id,
            rating: parseInt(review.value.rating),
            comment: review.value.comment,
            visit_date: visitDate,
            images,
        };

        const result = await reviewsApi.createReview(reviewPayload);
        console.log("Review created successfully:", result);

        alert("Review created successfully!");
        showModal.value = false;
        review.value = { rating: "", comment: "", images: [] };
    } catch (error) {
        console.error("Error creating review:", error);
        alert("Error creating review: " + error.message);
    }
};

const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;

    return `http://localhost:8000/uploads/${imagePath}`;
};

const checkReviewEligibility = async () => {
    if (userRole.value !== 'tourist' || !tour.value?.id) {
        showAddReviewButton.value = false;
        return;
    }

    checkingReviewEligibility.value = true;
    
    try {
        const touristId = sessionStorage.getItem('id'); 
        
        const executionResponse = await tourExecutionApi.getTourExecutionByUserAndTour(touristId, tour.value.id);
        tourExecutionData.value = executionResponse;
        const hasBeenOnTour = executionResponse !== null && 
                              (executionResponse.execution?.status === 'completed' || 
                               executionResponse.execution?.status === 'abandoned');

        const reviewExistsResponse = await reviewsApi.checkReviewExists(tour.value.id, touristId);
        const hasNotReviewed = !reviewExistsResponse.exists;

        showAddReviewButton.value = hasBeenOnTour && hasNotReviewed;
        
        console.log('Review eligibility check:', {
            hasBeenOnTour,
            hasNotReviewed,
            showAddReview: showAddReviewButton.value
        });

    } catch (error) {
        console.error("Error checking review eligibility:", error);
        showAddReviewButton.value = false;
    } finally {
        checkingReviewEligibility.value = false;
    }
};

</script>

<style scoped>
#map {
    width: 100%;
}
</style>
