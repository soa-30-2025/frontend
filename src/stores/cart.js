import { defineStore } from 'pinia';
import { fetchGetCart } from '@/api/purchase'; 

export const useCartStore = defineStore('cart', {
    state: () => ({
        itemIds: new Set(), 
        total: 0.00,
        items: [],
        isLoading: false,
    }),
    getters: {
        isItemInCart: (state) => (tourId) => {
            return state.itemIds.has(tourId);
        },
        itemCount: (state) => {
            return state.itemIds.size;
        }
    },
    actions: {

        async loadCart() {
            if (this.isLoading) return;
            this.isLoading = true;
            try {
                const data = await fetchGetCart();
                this.items = data.items || [];
                this.total = data.total || 0.00;

                this.itemIds = new Set(this.items.map(item => item.tourId));
            } catch (error) {
                console.error("Failed to load cart state:", error);
            } finally {
                this.isLoading = false;
            }
        },

        addItem(item) {
            this.items.push(item);
            this.itemIds.add(item.tourId);
        },
        
        removeItem(tourId) {
            this.items = this.items.filter(item => item.tourId !== tourId);
            this.itemIds.delete(tourId);
        },
        
        clearCart() {
            this.itemIds = new Set();
            this.total = 0.00;
            this.items = [];
        }
    }
});