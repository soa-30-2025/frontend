<template>
    <div class="p-6 max-w-5xl mx-auto">
        <div v-if="loading || cartStore.isLoading" class="text-gray-500">Loading tours and cart status...</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="tour in tours" :key="tour.id"
                class="border rounded-lg p-4 shadow hover:shadow-lg transition flex flex-col justify-between">
                <div>
                    <h2 @click="showTour(tour.id)" class="text-xl font-semibold mb-2 cursor-pointer">{{ tour.name }} - ${{ tour.price }}</h2>
                    <p class="text-gray-600 mb-2">{{ tour.description }}</p>
                    <p class="text-sm text-gray-500 mb-1">Difficulty: {{ tour.difficulty }}</p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span v-for="tag in tour.tags" :key="tag"
                            class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {{ tag }}
                        </span>
                    </div>
                </div>

                <div class="mt-4">
                    <button v-if="tour.isPurchased"
                        class="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg cursor-not-allowed opacity-75"
                        disabled>
                        PURCHASED! 🎉
                    </button>

                    <button v-else-if="cartStore.isItemInCart(tour.id)" @click="router.push({ path: '/cart' })"
                        class="w-full bg-yellow-500 text-black hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg transition">
                        In Cart (View)
                    </button>

                    <button v-else-if="tour.status === 'archived'" disabled
                        class="w-full bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition">
                        Archived
                    </button>
                    
                    <button v-else @click.stop="addToCart(tour)" :disabled="tour.isAdding"
                        class="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-bold py-2 px-4 rounded-lg transition disabled:opacity-50">
                        {{ tour.isAdding ? 'Adding...' : 'Add to Cart' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { fetchAllTours } from "@/api/tours";
import { fetchHasPurchased, fetchAddToCart } from "@/api/purchase";
import { useCartStore } from '@/stores/cart';
import { useRouter } from 'vue-router';

const router = useRouter();
const cartStore = useCartStore();

const tours = ref([]);
const loading = ref(true);

onMounted(async () => {
    loading.value = true;

    await cartStore.loadCart();
    await fetchAllTours(loading, tours);
    await checkPurchaseStatuses();

    loading.value = false;
});

const showTour = (tourId) => {
    router.push({ name: 'ShowTour', params: { id: tourId } });
};

const addToCart = async (tour) => {
    tour.isAdding = true;
    try {
        await fetchAddToCart(tour.id, tour.name, tour.price);
        cartStore.addItem({ tourId: tour.id, tour_name: tour.name, price: tour.price });
    } catch (error) {
        alert(`Failed to add ${tour.name} to cart: ${error.message}`);
    } finally {
        tour.isAdding = false;
    }
};

const checkPurchaseStatuses = async () => {
    if (tours.value.length === 0) return;

    const checkPromises = tours.value.map(async (tour) => {
        const isPurchased = await fetchHasPurchased(tour.id);
        tour.isPurchased = isPurchased;
        tour.isAdding = false;
    });
    await Promise.all(checkPromises);
};
</script>