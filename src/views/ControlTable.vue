<template>
    <div class="p-6">
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-gray-800">User control</h1>

            <div class="flex items-center gap-2">
                <input v-model="filter" type="text" placeholder="Filter by username or email"
                    class="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button @click="loadUsers" :disabled="loading"
                    class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm disabled:opacity-60">
                    <svg v-if="loading" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>Refresh</span>
                </button>
            </div>
        </div>

        <div class="bg-white shadow rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">First name</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last name</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blocked</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                </thead>

                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm text-gray-700">{{ user.username }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ user.email }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600 capitalize">{{ user.role }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ getFirstName(user) }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ getLastName(user) }}</td>
                        <td class="px-4 py-3 text-sm">
                            <span
                                :class="user.blocked ? 'inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800' : 'inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800'">
                                {{ user.blocked ? 'Yes' : 'No' }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-right text-sm">
                            <button @click="onToggleBlock(user)" :disabled="pending[user.id]" :class="[
                                'inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium',
                                user.blocked ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white',
                                pending[user.id] ? 'opacity-60 cursor-not-allowed' : ''
                            ]">
                                <svg v-if="pending[user.id]" class="w-4 h-4 animate-spin"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                <span v-else>{{ user.blocked ? 'Unblock' : 'Block' }}</span>
                            </button>
                        </td>
                    </tr>

                    <tr v-if="!filteredUsers.length && !loading">
                        <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500">No users found.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAll, block } from '../api/stakeholder'

const users = ref([])
const loading = ref(false)
const error = ref(null)
const pending = ref({})
const filter = ref('')

function getFirstName(u) {
    return u.firstName ?? u.first_name ?? ''
}
function getLastName(u) {
    return u.lastName ?? u.last_name ?? ''
}

async function loadUsers() {
    loading.value = true
    error.value = null
    try {
        const res = await getAll()
        const payload = Array.isArray(res) ? res : (res.users ?? res.data ?? [])
        users.value = payload
    } catch (err) {
        console.error('Failed to load users', err)
        error.value = err?.message || String(err)
    } finally {
        loading.value = false
    }
}

async function onToggleBlock(user) {
    const id = user.id
    const newBlockState = !user.blocked

    const ok = confirm(`${newBlockState ? 'Block' : 'Unblock'} user "${user.username}"?`)
    if (!ok) return

    pending.value = { ...pending.value, [id]: true }

    const oldState = user.blocked
    user.blocked = newBlockState
    try {
        await block(id, newBlockState)
    } catch (err) {
        // revert on error
        user.blocked = oldState
        console.error('Block/unblock failed', err)
        // optional: use some toast from flowbite, for now alert
        alert('Operation failed: ' + (err?.message ?? err))
    } finally {
        const cp = { ...pending.value }
        delete cp[id]
        pending.value = cp
    }
}

const filteredUsers = computed(() => {
    const q = filter.value.trim().toLowerCase()
    if (!q) return users.value
    return users.value.filter(u => {
        const uname = (u.username ?? '').toString().toLowerCase()
        const email = (u.email ?? '').toString().toLowerCase()
        return uname.includes(q) || email.includes(q)
    })
})

onMounted(() => {
    loadUsers()
})
</script>

<style scoped></style>
