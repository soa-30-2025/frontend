<template>
    <div class="relative inline-block text-left">
        <button @click="open = !open"
            class="inline-flex items-center gap-2 px-3 py-1.5 bg-white border rounded shadow-sm">
            <span class="font-medium">{{ displayTitle }}</span>
            <span class="text-sm text-gray-600">({{ count }})</span>
        </button>

        <transition name="fade">
            <div v-if="open"
                class="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 p-3">

                <div class="flex items-center justify-between mb-3">
                    <strong>{{ displayTitle }}</strong>
                    <button @click="open = false" class="text-sm text-gray-500">Close</button>
                </div>

                <div v-if="loading" class="text-gray-500">Loading…</div>

                <ul v-else-if="list.length > 0" class="space-y-2 max-h-64 overflow-auto">
                    <li v-for="user in list" :key="user.id" class="flex items-center gap-3">
                        <img :src="avatar(user.id)" class="w-8 h-8 rounded-full bg-gray-100" />
                        <div class="flex-1 text-sm">
                            <div class="font-medium truncate">{{ user.username }}</div>
                            <div class="text-xs text-gray-500">
                                {{ user.firstName  }}
                            </div>
                        </div>
                        <div>
                            <router-link :to="`/profile/${user.username}`" @click.prevent="closeAndNavigate(user.username)" class="text-sm text-blue-600">View</router-link>
                        </div>
                    </li>
                </ul>

                <div v-else class="text-gray-500 text-sm mt-2">No users</div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { getFollowers, getFollowing } from '@/api/followings';
import { getById } from '@/api/stakeholder';

const props = defineProps({
    userId: { type: String, required: true },
    type: { type: String, default: 'followers' },
    title: { type: String, default: '' },
    refreshKey: { type: [Number, String], default: 0 }
});

const open = ref(false);
const list = ref([]);
const loading = ref(false);
const count = ref(0);

const displayTitle = computed(() => {
    return props.title || (props.type === 'followers' ? 'Followers' : 'Following');
});

function avatar(id) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(id)}&background=random&size=64`;
}

async function load(isInitialLoad = false) {
    if (!isInitialLoad || open.value) {
        loading.value = true;
    }

    try {
        let res;
        if (props.type === 'followers') {
            res = await getFollowers(props.userId, 100, 0);
        } else {
            res = await getFollowing(props.userId, 100, 0);
        }

        let idList = [];
        if (props.type === 'followers') {
            idList = res.follower_ids || res.followerIds || res || [];
        } else {
            idList = res.following_ids || res.followingIds || res || [];
        }
        if (!Array.isArray(idList)) {
            idList = [];
        }

        count.value = idList.length;

        if (isInitialLoad && !open.value) {
            list.value = [];
            return;
        }

        if (idList.length > 0) {
            const userPromises = idList.map(id => getById(id));
            const rawUsers = await Promise.all(userPromises);

            const users = rawUsers
                .map(result => result && result.user ? result.user : null)
                .filter(user => user && user.id)
            
            list.value = users;
        } else {
            list.value = [];
        }

    } catch (e) {
        console.error("Error loading user details:", e);
        list.value = [];
        count.value = 0;
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    load(true);
});

watch(() => props.refreshKey, () => {
    load(true);
});

watch(open, (isOpened) => {
    if (isOpened && list.value.length === 0) {
        load();
    }
});

function closeAndNavigate(username){
    open.value = false;
    routerKey.push(`/profile/${username}`)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
