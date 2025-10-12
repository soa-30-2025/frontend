<template>
    <div class="p-6 max-w-5xl mx-auto">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">My Tours</h1>
            <button @click="showModal = true" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                + New Tour
            </button>
        </div>

        <!-- Lista tura -->
        <div v-if="loading" class="text-gray-500">Loading tours...</div>
        <div v-else-if="tours.length === 0" class="text-gray-500 italic">
            You don't have any tours yet.
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="tour in tours" :key="tour.id" class="border rounded-lg p-4 shadow hover:shadow-lg transition">
                <h2 class="text-xl font-semibold mb-2">{{ tour.name }}</h2>
                <p class="text-gray-600 mb-2">{{ tour.description }}</p>
                <p class="text-sm text-gray-500 mb-1">Difficulty: {{ tour.difficulty }}</p>
                <p class="text-sm text-gray-500 mb-2">Status: {{ tour.status }}</p>
                <div class="flex flex-wrap gap-2">
                    <span v-for="tag in tour.tags" :key="tag"
                        class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {{ tag }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Modal za novu turu -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 class="text-2xl font-semibold mb-4">Create New Tour</h2>

                <form @submit.prevent="handleCreateTour">

                    <div class="mb-3">
                        <label class="block text-sm font-medium mb-1">Name</label>
                        <input v-model="newTour.name" type="text"
                            class="border rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                            required />
                    </div>

                    <div class="mb-3">
                        <label class="block text-sm font-medium mb-1">Description</label>
                        <textarea v-model="newTour.description"
                            class="border rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                            required></textarea>
                    </div>

                    <div class="mb-3">
                        <label class="block text-sm font-medium mb-1">Difficulty</label>
                        <select v-model="newTour.difficulty"
                            class="border rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                            required>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="block text-sm font-medium mb-1">Tags (comma separated)</label>
                        <input v-model="newTour.tags" type="text"
                            class="border rounded w-full px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="e.g. walking, city" required />
                    </div>

                    <div class="flex justify-end gap-3 mt-5">
                        <button type="button" @click="showModal = false"
                            class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
                            Cancel
                        </button>
                        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { fetchTours, createTour } from "@/api/tours";

const tours = ref([]);
const loading = ref(true);
const showModal = ref(false);
const errorMessage = ref("");

const newTour = ref({
    name: "",
    description: "",
    difficulty: "easy",
    tags: "",
});

function handleCreateTour() {
    createTour(newTour, tours, showModal, errorMessage);
}


onMounted(() => {
    fetchTours(loading, tours);
});
</script>
