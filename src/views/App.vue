<template>
    <div class="w-full h-screen bg-white flex flex-col">
        <header class="flex items-center justify-between px-6 md:px-12 lg:px-20 py-6 border-b border-gray-100">
            <div class="flex items-center gap-3">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Biblioteka</h1>
            </div>

            <div>
                <button v-if="logged" class="mr-10">
                    <svg class="w-[48px] h-[48px] text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M17.133 12.632v-1.8a5.406 5.406 0 0 0-4.154-5.262.955.955 0 0 0 .021-.106V3.1a1 1 0 0 0-2 0v2.364a.955.955 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C6.867 15.018 5 15.614 5 16.807 5 17.4 5 18 5.538 18h12.924C19 18 19 17.4 19 16.807c0-1.193-1.867-1.789-1.867-4.175ZM8.823 19a3.453 3.453 0 0 0 6.354 0H8.823Z" />
                    </svg>
                </button>

                <button v-if="logged" class="mr-10">
                    <svg class="w-[48px] h-[48px] text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                            d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
                            clip-rule="evenodd" />
                    </svg>
                </button>

                <button v-if="!logged" @click="showModal = true"
                    class="px-4 py-2 bg-black text-white rounded-lg shadow hover:brightness-90 transition">
                    Prijava
                </button>

                <button v-else @click="logout" class="mr-4">
                    <svg class="w-[48px] h-[48px] text-red-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2" />
                    </svg>
                </button>
            </div>
        </header>

        <main class="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20">
            <section class="w-full max-w-4xl text-center">
                <h2 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Dobrodosli</h2>
                <p class="text-gray-600 text-lg md:text-xl">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. In id neque tempus, lacinia est in,
                    imperdiet mauris. Nulla facilisi. Sed tempus luctus risus sed porttitor. Orci varius natoque
                    penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla quis turpis ex. Suspendisse
                    est dui, ultricies sit amet leo ac, tempor fringilla lorem. Curabitur ac turpis non augue feugiat
                    eleifend. Donec non augue ligula. Vestibulum venenatis ultrices condimentum. Vestibulum nisl lectus,
                    tempus a malesuada quis, viverra ac nisi. Curabitur condimentum eros sed velit commodo, eget varius
                    velit fringilla. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris finibus urna et
                    dapibus ullamcorper. In in dignissim quam.
                </p>
            </section>
        </main>

        <AuthModal v-if="showModal" :isVisible="showModal" @close="checkLoggedUser" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthModal from '../components/AuthModal.vue';

const router = useRouter();
const showModal = ref(false);
var logged = ref(sessionStorage.getItem("username") != null);

const checkLoggedUser = () => {
    const username = sessionStorage.getItem("username");
    showModal.value = false;
    if (username)
        logged.value = true;
    if (router.currentRoute.value.path != "/")
        router.push("/");
    else window.location.reload();
};

const logout = async () => {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("jwtToken");
    sessionStorage.removeItem("role");
    logged.value = false;

    if (router.currentRoute.value.path != "/") {
        router.push("/");
    } else {
        window.location.reload();
    }
};
</script>

<style scoped></style>