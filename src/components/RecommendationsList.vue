<template>
    <div>
        <h2 class="text-lg font-semibold mb-3">People you may follow</h2>

        <div v-if="loading" class="text-gray-500">Loading recommendations…</div>
        <div v-else-if="items.length === 0" class="text-gray-500">No recommendations yet.</div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="rec in items" :key="rec.user.id"
                class="bg-white border rounded-lg p-4 flex items-start gap-4 shadow-sm">
                <img :src="getAvatar(rec.user_id)" alt="avatar"
                    class="w-12 h-12 rounded-full object-cover bg-gray-100" />
                <div class="flex-1">
                    <div class="flex items-center justify-between">
                        <div>
                            <router-link :to="`/profile/${rec.user.username}`" class="text-sm text-blue-600">{{ rec.user.username }}</router-link>
                            <div class="text-xs text-gray-500">score: {{ rec.score }}</div>
                        </div>
                        <div>
                            <button @click="toggleFollow(rec)" :disabled="rec.loading"
                                :class="rec.following ? 'px-3 py-1 text-sm rounded bg-gray-200 text-gray-800' : 'px-3 py-1 text-sm rounded bg-blue-600 text-white'">
                                <span v-if="rec.loading"
                                    class="animate-spin mr-1 inline-block w-3 h-3 rounded-full border-2 border-white border-t-transparent"></span>
                                {{ rec.following ? 'Following' : 'Follow' }}
                            </button>
                        </div>
                    </div>
                    <div class="mt-2 text-xs text-gray-600"><span class="text-gray-700">{{ rec.user.firstName }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { recommend, isFollowing, follow, unfollow } from '@/api/followings'
import { getById } from '@/api/stakeholder';

const limit = 5
const userId = sessionStorage.getItem("id")
const loading = ref(false)
const items = ref([])

function getAvatar(userId) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userId)}&background=random&size=128`
}

async function load() {
    loading.value = true;

    try {
        const data = await recommend(userId, limit);
        const recs = data.recommendations ?? data;

        const itemPromises = recs.map(r => {
            const uid = r.user_id || r.userId || r;
            const score = r.score || 0;

            return (async () => {
                const [userResponse, followingResponse] = await Promise.all([
                    getById(uid),
                    sessionUserId() ? isFollowing(sessionUserId(), uid) : Promise.resolve(false)
                ]);

                const user = userResponse?.user ?? userResponse;

                return {
                    user: user?.id ? user : null,
                    score,
                    following: followingResponse?.following ?? followingResponse === true,
                    loading: false
                };
            })();
        });

        const resolvedItems = await Promise.all(itemPromises);
        items.value = resolvedItems.filter(item => item.user !== null);
    } catch (err) {
        console.error("Error loading recommendations and user details:", err);
        items.value = [];
    } finally {
        loading.value = false;
    }
}


function sessionUserId() {
    return sessionStorage.getItem('id') || ''
}

async function toggleFollow(rec) {
    rec.loading = true
    try {
        const me = sessionUserId()
        if (!me) throw new Error('not authenticated')
        if (rec.following) {
            await unfollow(me, rec.user.id)
            rec.following = false
        } else {
            await follow(me, rec.user.id)
            rec.following = true
        }
    } catch (err) {
        console.error(err)
    } finally {
        rec.loading = false
    }
}

onMounted(() => load())
</script>

<style scoped></style>
