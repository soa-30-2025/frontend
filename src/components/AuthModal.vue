<template>
    <div v-if="isVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="closeModal">
        <div class="bg-white rounded-lg max-w-md w-full p-6 shadow-lg flex flex-col items-center">
            <h2 class="text-2xl font-semibold text-primary mb-6">{{ isRegister ? 'Register' : 'Login' }}</h2>

            <form @submit.prevent="handleSubmit" class="w-full">
                <div v-if="!isRegister" class="mb-4">
                    <label for="email" class="block text-sm font-medium text-black mb-2">Email</label>
                    <input id="email" type="text" v-model="email" required
                        class="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>

                <div v-if="isRegister" class="mb-4 w-full">
                    <label for="name" class="block text-sm font-medium text-black mb-2">Username</label>
                    <input id="name" type="text" v-model="username" required @input="clearUsernameError"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    <div id="usernameError" style="color: red; display: none;">This username is already taken.</div>
                </div>

                <div v-if="isRegister" class="mb-4 w-full">
                    <label for="email" class="block text-sm font-medium text-black mb-2">Email</label>
                    <input id="email" type="email" v-model="email" required @input="clearEmailError"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    <div id="emailError" class="text-red-600 text-sm mt-1 hidden">
                        The account with this email is already in use.
                    </div>
                </div>

                <div v-if="isRegister" class="mb-4 w-full">
                    <label for="role" class="block text-sm font-medium text-black mb-2">Role</label>
                    <select id="role" v-model="role" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <option value="tourist">Tourist</option>
                        <option value="guide">Guide</option>
                    </select>
                </div>

                <div class="mb-4 w-full">
                    <label for="password" class="block text-sm font-medium text-black mb-2">Password</label>
                    <div class="relative">
                        <input :type="showPassword ? 'text' : 'password'" v-model="password" id="password" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md pr-12 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        <button type="button" @click="togglePassword"
                            class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-lg">
                            <span v-if="showPassword">👁️</span><span v-else>👁️‍🗨️</span>
                        </button>
                    </div>
                </div>

                <div v-if="isRegister" class="mb-4 w-full">
                    <label for="confirmPassword" class="block text-sm font-medium text-black mb-2">
                        Confirm password
                    </label>
                    <input :type="showPassword ? 'text' : 'password'" v-model="confirmPassword" id="confirmPassword"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>

                <button type="submit"
                    class="w-full py-3 mt-2 bg-blue-700 text-white rounded-md text-base font-medium hover:bg-blue-600">
                    {{ isRegister ? 'Register' : 'Login' }}
                </button>
            </form>

            <button @click="toggleForm" class="mt-4 text-sm text-blue-600 underline">
                {{ isRegister ? 'Already have an account? Login' : 'Register' }}
            </button>
            <button @click="closeModal" class="mt-2 text-sm text-gray-500">Close</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { register, login } from '@/api/auth';

const props = defineProps({
    isVisible: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['close']);

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const role = ref('');
const isRegister = ref(false);
const showPassword = ref(false);

const handleSubmit = async () => {
    if (isRegister.value && password.value !== confirmPassword.value) {
        alert("Passwords do not match");
        return;
    }

    if (isRegister.value) {
        const response = await register(username.value, email.value, password.value, role.value);
        if (response.ok) {
            alert("Registration is successful.");
            isRegister.value = false;
        } else {
            const errorMessage = await response.text();
            if (errorMessage === "This username already exists.") {
                usernameError.style.display = "block";
                document.getElementById("username").style.borderColor = "red";
            }
            else if (errorMessage === "The account with this email is already in use.") {
                const emailErr = document.getElementById("emailError");
                if (emailErr) emailErr.classList.remove("hidden");
                const emailEl = document.getElementById("email");
                if (emailEl) emailEl.style.borderColor = "red";
            } else {
                alert(errorMessage);
            }
        }
    } else {
        const response = await login(email.value, password.value);
        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('id', data.id);
            sessionStorage.setItem('username', data.username);
            sessionStorage.setItem('jwtToken', data.accessToken);
            sessionStorage.setItem('role', data.role);
            closeModal();
        } else {
            const errorMessage = await response.text();
            if (errorMessage === "Wrong credentials")
                alert("Wrong credentials");
            else
                alert(errorMessage);
        }
    }
};

const toggleForm = () => {
    isRegister.value = !isRegister.value;
    username.value = "";
    password.value = "";
    confirmPassword.value = "";
    email.value = "";
    const emailErr = document.getElementById("emailError");
    if (emailErr) emailErr.classList.add("hidden");
    const nameErr = document.getElementById("nameError");
    if (nameErr) nameErr.classList.add("hidden");
};

const togglePassword = () => {
    showPassword.value = !showPassword.value;
};

const closeModal = () => {
    emit('close');
};

const clearEmailError = () => {
    const emailErr = document.getElementById("emailError");
    if (emailErr) emailErr.classList.add("hidden");
    const emailEl = document.getElementById("email");
    if (emailEl) emailEl.style.borderColor = "";
};

const clearUsernameError = () => {
    usernameError.style.display = "none";
    document.getElementById("username").style.borderColor = "black";
};
</script>