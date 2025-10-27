<template>
    <div class="w-full h-screen bg-white flex flex-col">
        <header class="flex items-center justify-between px-6 md:px-12 lg:px-20 py-6 border-b border-gray-100">
            <div class="flex items-center gap-3">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Application</h1>
            </div>
            <div>
                <button v-if="role === 'guide'" @click="router.push('/tours')" class="mr-10">
                    <svg class="w-[48px] h-[48px] text-gray-800" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M5 12h14m-7 7V5" />
                    </svg>

                </button>
                <button v-if="logged" @click="router.push('/all-tours')" class="mr-10">
                    <svg class="w-[48px] h-[48px] text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                            d="M11.906 1.994a8.002 8.002 0 0 1 8.09 8.421 7.996 7.996 0 0 1-1.297 3.957.996.996 0 0 1-.133.204l-.108.129c-.178.243-.37.477-.573.699l-5.112 6.224a1 1 0 0 1-1.545 0L5.982 15.26l-.002-.002a18.146 18.146 0 0 1-.309-.38l-.133-.163a.999.999 0 0 1-.13-.202 7.995 7.995 0 0 1 6.498-12.518ZM15 9.997a3 3 0 1 1-5.999 0 3 3 0 0 1 5.999 0Z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
                <button v-if="logged" @click="router.push('/blogs')" class="mr-10">
                    <svg class="w-[48px] h-[48px] text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                            d="M11 4.717c-2.286-.58-4.16-.756-7.045-.71A1.99 1.99 0 0 0 2 6v11c0 1.133.934 2.022 2.044 2.007 2.759-.038 4.5.16 6.956.791V4.717Zm2 15.081c2.456-.631 4.198-.829 6.956-.791A2.013 2.013 0 0 0 22 16.999V6a1.99 1.99 0 0 0-1.955-1.993c-2.885-.046-4.76.13-7.045.71v15.081Z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
                <button v-if="logged" @click="profileButtonClick" class="mr-10">
                    <svg class="w-[48px] h-[48px] text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                            d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
                            clip-rule="evenodd" />
                    </svg>
                </button>

                <button v-if="logged" @click="cartButtonClick" class="mr-10">
                    <svg class="w-[48px] h-[48px] text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                            d="M4 4a1 1 0 0 1 1-1h1.5a1 1 0 0 1 .979.796L7.939 6H19a1 1 0 0 1 .979 1.204l-1.25 6a1 1 0 0 1-.979.796H9.605l.208 1H17a3 3 0 1 1-2.83 2h-2.34a3 3 0 1 1-4.009-1.76L5.686 5H5a1 1 0 0 1-1-1Z"
                            clip-rule="evenodd" />
                    </svg>
                </button>

                <button v-if="!logged" @click="showModal = true"
                    class="px-4 py-2 bg-black text-white rounded-lg shadow hover:brightness-90 transition">
                    Login
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

        <main>
            <router-view />
        </main>

        <AuthModal v-if="showModal" :isVisible="showModal" @close="checkLoggedUser" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthModal from './components/AuthModal.vue';

const router = useRouter();
const role = sessionStorage.getItem('role');
const username = sessionStorage.getItem('username')
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
    sessionStorage.removeItem("id");
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

const profileButtonClick = () => {
    if (role === 'admin') {
        router.push('/control-table')
    } else if (role === 'guide' || role === "tourist") {
        router.push(`/profile/${username}`)
    } else {
        router.push('/')
    }
}

const cartButtonClick = () => {
    router.push('/cart')
}
</script>

<style scoped></style>