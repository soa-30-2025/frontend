<template>
    <div class="p-6 max-w-3xl mx-auto">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-semibold text-gray-800">{{ profile.username }}</h1>
            <div class="flex items-center gap-3">
                <div v-if="!isOwner">
                    <button @click="onToggleFollow" :disabled="followLoading" :class="followBtnClass"
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm">
                        <svg v-if="followLoading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span v-else>{{ followLabel }}</span>
                    </button>
                </div>

                <div v-if="usernameParam === loggedUsername">
                    <button v-if="!editing" @click="startEdit"
                        class="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm">
                        Edit
                    </button>

                    <button v-else @click="cancelEdit"
                        class="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm mr-2">
                        Cancel
                    </button>

                    <button v-if="editing" @click="save" :disabled="saving"
                        class="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">
                        <svg v-if="saving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span v-else>Save</span>
                    </button>
                </div>
            </div>
        </div>

        <div v-if="loading" class="text-center py-10 text-gray-500">Loading profile…</div>

        <div v-else class="bg-white shadow rounded-lg p-6">
            <div class="flex gap-6">
                <div class="w-32">
                    <div class="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img v-if="form.profile_image" :src="form.profile_image" alt="Profile"
                            class="object-cover w-full h-full" />
                        <svg v-else class="w-12 h-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M12 14l9-5-9-5-9 5 9 5z" />
                        </svg>
                    </div>

                    <div v-if="editing" class="mt-3">
                        <label class="block text-xs text-gray-600 mb-1">Profile image URL</label>
                        <input v-model="form.profile_image" type="text" placeholder="https://..."
                            class="w-full px-2 py-1 border rounded-md text-sm" />
                    </div>
                </div>

                <div class="flex-1">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs text-gray-600">Username</label>
                            <div class="mt-1 text-sm text-gray-800">{{ profile.username }}</div>
                        </div>

                        <div>
                            <label class="block text-xs text-gray-600">Email</label>
                            <div class="mt-1 text-sm text-gray-800">{{ profile.email }}</div>
                        </div>

                        <div>
                            <label class="block text-xs text-gray-600">Role</label>
                            <div class="mt-1 text-sm text-gray-800 capitalize">{{ profile.role }}</div>
                        </div>

                        <div>
                            <label class="block text-xs text-gray-600">Blocked</label>
                            <div class="mt-1 text-sm">
                                <span
                                    :class="profile.blocked ? 'px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs' : 'px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs'">
                                    {{ profile.blocked ? 'Yes' : 'No' }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <hr class="my-4" />

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs text-gray-600">First name</label>
                            <div v-if="!editing" class="mt-1 text-gray-800">{{ profile.first_name || '-' }}</div>
                            <input v-else v-model="form.first_name" type="text"
                                class="mt-1 px-2 py-1 border rounded-md text-sm" />
                        </div>

                        <div>
                            <label class="block text-xs text-gray-600">Last name</label>
                            <div v-if="!editing" class="mt-1 text-gray-800">{{ profile.last_name || '-' }}</div>
                            <input v-else v-model="form.last_name" type="text"
                                class="mt-1 px-2 py-1 border rounded-md text-sm" />
                        </div>
                    </div>

                    <div class="mt-4">
                        <label class="block text-xs text-gray-600">Bio</label>
                        <div v-if="!editing" class="mt-1 text-gray-700 whitespace-pre-line">{{ profile.bio || '-' }}
                        </div>
                        <textarea v-else v-model="form.bio" rows="4"
                            class="mt-1 w-full px-2 py-1 border rounded-md text-sm"></textarea>
                    </div>

                    <div class="mt-4">
                        <label class="block text-xs text-gray-600">Motto / Quote</label>
                        <div v-if="!editing" class="mt-1 text-gray-700 italic">{{ profile.motto || '-' }}</div>
                        <input v-else v-model="form.motto" type="text"
                            class="mt-1 px-2 py-1 border rounded-md text-sm" />
                    </div>
                </div>
            </div>

            <div v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</div>
            <div v-if="success" class="mt-4 text-sm text-green-600">{{ success }}</div>
        </div>

        <div class="flex items-center gap-4 mt-4" v-if="profile && profile.id">
            <FollowersDropdown :userId="profile.id" type="followers" title="Followers"
                :refresh-key="followersRefreshKey" />
            <FollowersDropdown :userId="profile.id" type="following" title="Following"
                :refresh-key="followingRefreshKey" />
        </div>

        <div class="mt-6">
            <RecommendationsList />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getByUsername, update } from '@/api/stakeholder'
import { isFollowing, follow, unfollow } from '@/api/followings'
import RecommendationsList from '@/components/RecommendationsList.vue'
import FollowersDropdown from '@/components/FollowersDropdown.vue'

const route = useRoute()
const usernameParam = route.params.username || null
const loading = ref(false)
const saving = ref(false)
const editing = ref(false)
const error = ref(null)
const success = ref(null)

const loggedUsername = sessionStorage.getItem('username') || ''
const sessionUserId = sessionStorage.getItem('id') || ''
const isOwner = ref(false)
const isFollowingState = ref(false)
const followLoading = ref(false)

const followersRefreshKey = ref(0)
const followingRefreshKey = ref(0)

const profile = reactive({
    id: '',
    username: '',
    email: '',
    role: '',
    blocked: false,
    first_name: '',
    last_name: '',
    profile_image: '',
    bio: '',
    motto: ''
})

const form = reactive({
    first_name: '',
    last_name: '',
    profile_image: '',
    bio: '',
    motto: ''
})

function updateOwnership() {
    isOwner.value = sessionUserId !== '' && profile.id === sessionUserId
}

async function checkFollowing() {
    if (!sessionUserId || isOwner.value) {
        isFollowingState.value = false
        return
    }
    try {
        const res = await isFollowing(sessionUserId, profile.id)
        isFollowingState.value = (res.following ?? res) === true
    } catch (e) {
        console.error('isFollowing check failed', e)
        isFollowingState.value = false
    }
}

async function onToggleFollow() {
    if (!sessionUserId) {
        error.value = 'You must be logged in to follow users.'
        return
    }
    followLoading.value = true
    error.value = null
    success.value = null
    try {
        if (isFollowingState.value) {
            await unfollow(sessionUserId, profile.id)
            isFollowingState.value = false
            success.value = 'Unfollowed'
        } else {
            await follow(sessionUserId, profile.id)
            isFollowingState.value = true
            success.value = 'Followed'
        }

        followersRefreshKey.value++
        followingRefreshKey.value++
    } catch (e) {
        console.error('follow/unfollow failed', e)
        error.value = e?.message || 'Action failed'
    } finally {
        followLoading.value = false
    }
}

const followLabel = computed(() => {
    return isFollowingState.value ? 'Following' : 'Follow'
})

const followBtnClass = computed(() => {
    if (followLoading.value) return 'bg-gray-300 text-gray-700'
    return isFollowingState.value
        ? 'bg-white border text-gray-800 hover:bg-gray-50'
        : 'bg-blue-600 hover:bg-blue-700 text-white'
})

async function loadProfile(username) {
    loading.value = true
    error.value = null
    success.value = null
    try {
        const res = await getByUsername(username)
        const u = res.user ?? res
        profile.id = u.id || ''
        profile.username = u.username || ''
        profile.email = u.email || ''
        profile.role = u.role || ''
        profile.blocked = !!u.blocked
        profile.first_name = u.first_name ?? u.firstName ?? ''
        profile.last_name = u.last_name ?? u.lastName ?? ''
        profile.profile_image = u.profile_image ?? u.profileImage ?? ''
        profile.bio = u.bio ?? ''
        profile.motto = u.motto ?? ''
        form.first_name = profile.first_name
        form.last_name = profile.last_name
        form.profile_image = profile.profile_image
        form.bio = profile.bio
        form.motto = profile.motto

        updateOwnership()
        await checkFollowing()

        followersRefreshKey.value++
        followingRefreshKey.value++
    } catch (err) {
        console.error(err)
        error.value = err?.message || 'Failed to load profile'
    } finally {
        loading.value = false
    }
}

function startEdit() {
    editing.value = true
    success.value = null
    error.value = null
}

function cancelEdit() {
    form.first_name = profile.first_name
    form.last_name = profile.last_name
    form.profile_image = profile.profile_image
    form.bio = profile.bio
    form.motto = profile.motto
    editing.value = false
    success.value = null
    error.value = null
}

async function save() {
    error.value = null
    success.value = null

    if (form.first_name.length > 100 || form.last_name.length > 100) {
        error.value = 'First/last name too long (max 100 chars)'
        return
    }
    saving.value = true
    try {
        const payload = {
            id: profile.id,
            first_name: form.first_name,
            last_name: form.last_name,
            profile_image: form.profile_image,
            bio: form.bio,
            motto: form.motto
        }
        await update(payload)
        await loadProfile(profile.username)
        success.value = 'Profile updated'
        editing.value = false
    } catch (err) {
        console.error(err)
        error.value = err?.message || 'Failed to update profile'
    } finally {
        saving.value = false
    }
}

watch(
    () => route.params.username,
    (newUsername, oldUsername) => {
        if (newUsername && newUsername !== oldUsername) {
            loadProfile(newUsername);
        }
    },
    { immediate: true }
);


</script>

<style scoped></style>
