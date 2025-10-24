<template>
    <div class="p-6 max-w-5xl mx-auto">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">All tours</h1>
        </div>
        <div v-if="loading" class="text-gray-500">Loading tours...</div>
        <div v-else-if="tours.length === 0" class="text-gray-500 italic">
            No tours yet.
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="tour in tours" :key="tour.id" @click="showTour(tour.id)" class="border rounded-lg p-4 shadow hover:shadow-lg transition">
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
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { fetchAllTours } from "@/api/tours";
import { useRouter } from 'vue-router';

const router = useRouter();

const tours = ref([]);
const loading = ref(true);

onMounted(() => {
    fetchAllTours(loading, tours);
});

const showTour = (tourId) => {
  router.push({ name: 'ShowTour', params: { id: tourId } });
};
</script>
