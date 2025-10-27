<template>
    <div class="p-6 max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">Shopping Cart</h1>

        <div v-if="loading" class="text-gray-500">Loading cart...</div>
        <div v-else-if="cartItems.length === 0" class="text-gray-500 italic p-4 border rounded-lg">
            Your cart is empty. 🛒
        </div>
        <div v-else>
            <div v-for="item in cartItems" :key="item.tourId" class="flex justify-between items-center border-b py-4">
                <div>
                    <p class="font-semibold">{{ item.tourName }}</p>
                    <p class="text-gray-600 text-sm">${{ item.price.toFixed(2) }}</p>
                </div>
                <button 
                    @click="removeItem(item.tourId)" 
                    :disabled="isRemoving"
                    class="bg-red-500 text-white text-xs py-1 px-3 rounded hover:bg-red-600 transition disabled:opacity-50">
                    Remove
                </button>
            </div>

            <div class="mt-6 p-4 border-t border-b bg-gray-50">
                <div class="flex justify-between font-bold text-xl">
                    <span>Total:</span>
                    <span>${{ cartTotal.toFixed(2) }}</span>
                </div>
            </div>

            <div class="mt-6 flex justify-end">
                <button 
                    @click="handleCheckout" 
                    :disabled="isCheckingOut || cartItems.length === 0"
                    class="bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-xl hover:bg-green-700 transition disabled:opacity-50">
                    {{ isCheckingOut ? 'Processing...' : 'Checkout' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchGetCart, fetchRemoveFromCart, fetchCheckout } from "@/api/purchase";
import { useRouter } from 'vue-router';

const router = useRouter();
const cartItems = ref([]);
const cartTotal = ref(0.00);
const loading = ref(true);
const isRemoving = ref(false);
const isCheckingOut = ref(false);

onMounted(() => {
    loadCart();
});

const loadCart = async () => {
    loading.value = true;
    try {
        const data = await fetchGetCart();
        cartItems.value = data.items || [];
        cartTotal.value = data.total || 0.00;
    } catch (error) {
        alert(`Error loading cart: ${error.message}`);
        cartItems.value = [];
        cartTotal.value = 0.00;
    } finally {
        loading.value = false;
    }
};

const removeItem = async (tourId) => {
    isRemoving.value = true;
    try {
        const data = await fetchRemoveFromCart(tourId);
        cartTotal.value = data.total;
        cartItems.value = cartItems.value.filter(item => item.tourId !== tourId);
        alert("Item removed successfully.");
    } catch (error) {
        alert(`Failed to remove item: ${error.message}`);
    } finally {
        isRemoving.value = false;
    }
};

const handleCheckout = async () => {
    if (cartItems.value.length === 0) return;
    
    isCheckingOut.value = true;
    try {
        const result = await fetchCheckout();
        
        if (result.success) {
            alert(`Purchase successful! ID: ${result.purchaseId}. Total: $${result.total}. Tokens received: ${result.tokens.length}`);
            router.push({ name: 'AllTours' }); 
        } else {
            alert(`Checkout FAILED: ${result.message || 'Unknown failure.'}`);
        }
    } catch (error) {
        alert(`Critical Checkout Error: ${error.message}`);
    } finally {
        isCheckingOut.value = false;
    }
};
</script>