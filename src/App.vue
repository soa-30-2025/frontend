<template>
    <div class="w-full h-screen bg-white flex flex-col">
        <header class="flex items-center justify-between px-6 md:px-12 lg:px-20 py-6 border-b border-gray-100">
            <div class="flex items-center gap-3">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Application</h1>
            </div>

            <div>
                <button v-if="logged" @click="profileButtonClick" class="mr-10">
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

        <main class="flex-1 px-6 md:px-12 lg:px-20 flex flex-col gap-10">
            <router-view/>
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

const profileButtonClick = () => {
  if (role === 'admin') {
    router.push('/control-table')
  } else if (role === 'guide' || role === "tourist") {
    router.push('/profile')
  } else {
    router.push('/')
  }
}
</script>

<style scoped></style>