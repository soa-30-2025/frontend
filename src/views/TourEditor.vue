<template>
    <div class="p-6 max-w-5xl mx-auto">
        <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-semibold">{{ isEdit ? 'Edit Tour' : 'Create Tour' }}</h1>
            <div class="flex gap-2">
                <button @click="saveDraft" class="px-3 py-1 rounded bg-gray-200">Save draft</button>
                <button @click="tryPublish" :disabled="publishing" class="px-3 py-1 rounded bg-green-600 text-white">
                    {{ publishing ? 'Publishing...' : (tour.status === 'published' ? 'Published' : 'Publish') }}
                </button>
                <button v-if="tour.status === 'published'" @click="archive"
                    class="px-3 py-1 rounded bg-yellow-500 text-white">Archive</button>
                <button v-if="tour.status === 'archived'" @click="unarchive"
                    class="px-3 py-1 rounded bg-blue-600 text-white">Unarchive</button>
            </div>
        </div>

        <div class="bg-white shadow rounded p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-600">Name</label>
                    <input v-model="form.name" class="w-full border px-2 py-1 rounded" />
                </div>
                <div>
                    <label class="block text-xs text-gray-600">Difficulty</label>
                    <select v-model="form.difficulty" class="w-full border px-2 py-1 rounded">
                        <option value="">Select</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <div class="md:col-span-2">
                    <label class="block text-xs text-gray-600">Description</label>
                    <textarea v-model="form.description" class="w-full border px-2 py-1 rounded" rows="4"></textarea>
                </div>

                <div>
                    <label class="block text-xs text-gray-600">Tags (comma separated)</label>
                    <input v-model="form.tagsString" class="w-full border px-2 py-1 rounded"
                        placeholder="walking, city" />
                </div>

                <div>
                    <label class="block text-xs text-gray-600">Travel times (minutes)</label>
                    <div class="flex gap-2">
                        <input v-model.number="form.travel_times.walking" type="number" placeholder="walking"
                            class="border px-2 py-1 rounded w-1/3" />
                        <input v-model.number="form.travel_times.bicycle" type="number" placeholder="bicycle"
                            class="border px-2 py-1 rounded w-1/3" />
                        <input v-model.number="form.travel_times.car" type="number" placeholder="car"
                            class="border px-2 py-1 rounded w-1/3" />
                    </div>
                    <div class="text-xs text-gray-500 mt-1">At least one travel time must be set to publish</div>
                </div>
            </div>
        </div>

        <!-- Map editor -->
        <div class="bg-white shadow rounded p-4">
            <div class="mb-2 flex items-center justify-between">
                <div>
                    <strong>Map editor</strong>
                    <div class="text-xs text-gray-500">Click map to add a keypoint. Drag marker to reposition. Right
                        click marker to delete.</div>
                </div>
                <div class="text-sm">
                    Points: {{ keypoints.length }} • Length: {{ totalKm.toFixed(2) }} km
                </div>
            </div>

            <div ref="mapContainer" class="w-full h-96 rounded"></div>

            <!-- keypoint list -->
            <div class="mt-4">
                <h3 class="text-sm font-medium mb-2">Keypoints (drag to reorder in map)</h3>
                <!-- import draggable as component -->
                <draggable v-model="keypoints" item-key="id" @end="onReorder" handle=".drag-handle">
                    <template #item="{ element, index }">
                        <li :key="element.id" class="flex items-start gap-3">
                            <div class="drag-handle cursor-move text-gray-500">☰</div>
                            <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">{{
                                index + 1 }}</div>
                            <div class="flex-1">
                                <div class="font-medium">{{ element.name || 'Point ' + (index + 1) }}</div>
                                <div class="text-xs text-gray-500">{{ element.description }}</div>
                                <div class="text-xs text-gray-400">lat: {{ element.lat.toFixed(5) }}, lon: {{
                                    element.lon.toFixed(5) }}</div>
                            </div>
                            <div class="flex flex-col gap-2">
                                <button @click="editKeypoint(element)" class="text-sm text-blue-600">Edit</button>
                                <button @click="deleteKeypoint(element)" class="text-sm text-red-600">Delete</button>
                            </div>
                        </li>
                    </template>

                </draggable>
            </div>
        </div>

        <!-- keypoint modal -->
        <teleport to="body">
            <div v-if="showKPModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-1050">
                <div class="bg-white p-4 rounded w-full max-w-lg z-1051">
                    <h3 class="font-semibold mb-2">Keypoint details</h3>
                    <form @submit.prevent="confirmAddKeypoint">
                        <div class="mb-2">
                            <label class="text-xs">Name</label>
                            <input v-model="kpForm.name" class="w-full border px-2 py-1 rounded" required />
                        </div>
                        <div class="mb-2">
                            <label class="text-xs">Description</label>
                            <textarea v-model="kpForm.description" class="w-full border px-2 py-1 rounded"></textarea>
                        </div>
                        <div class="mb-2">
                            <label class="text-xs">Image</label>
                            <input type="file" @change="onFileChange" accept="image/*" />
                            <div v-if="kpForm.imagePreview" class="mt-2">
                                <img :src="kpForm.imagePreview" class="w-32 h-20 object-cover rounded" />
                            </div>
                        </div>
                        <div class="flex justify-end gap-2 mt-3">
                            <button type="button" @click="cancelKP"
                                class="px-3 py-1 rounded bg-gray-200">Cancel</button>
                            <button type="submit" class="px-3 py-1 rounded bg-green-600 text-white">Add</button>
                        </div>
                    </form>
                </div>
            </div>
        </teleport>

    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Draggable from 'vuedraggable'
import { createTour, updateTour, getTour, addKeypointBase64, updateKeypointAPI, deleteKeypointAPI, publishTourAPI, archiveTourAPI, unarchiveTourAPI, reorderKeypoints } from '@/api/tours'

// simple haversine
function haversineKm(a, b) {
    const toRad = d => d * Math.PI / 180
    const R = 6371
    const dLat = toRad(b.lat - a.lat)
    const dLon = toRad(b.lon - a.lon)
    const lat1 = toRad(a.lat), lat2 = toRad(b.lat)
    const aa = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
    return R * c
}

const props = defineProps({
    tourId: { type: String, required: false }
})
const isEdit = !!props.tourId

const mapContainer = ref(null)
let map = null, markersLayer = null, polyline = null

const tour = ref({
    id: null, author_id: null, name: '', description: '', difficulty: '', tags: [], price_num: 0, status: 'draft', travel_times: {}
})
const form = ref({
    name: '', description: '', difficulty: '', tagsString: '', travel_times: { walking: null, bicycle: null, car: null }
})

const keypoints = ref([])
const reordering = ref(false)
const selectedLatLng = ref(null)
const showKPModal = ref(false)
const kpForm = ref({ name: '', description: '', imageFile: null, imagePreview: null })
const publishing = ref(false)

const totalKm = computed(() => {
    let s = 0
    for (let i = 1; i < keypoints.value.length; i++) {
        s += haversineKm({ lat: keypoints.value[i - 1].lat, lon: keypoints.value[i - 1].lon }, { lat: keypoints.value[i].lat, lon: keypoints.value[i].lon })
    }
    return s
})

onMounted(async () => {
    // init map
    map = L.map(mapContainer.value).setView([44.7866, 20.4489], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    markersLayer = L.layerGroup().addTo(map)
    polyline = L.polyline([], { color: 'blue', weight: 4 }).addTo(map)

    map.on('click', (ev) => {
        selectedLatLng.value = ev.latlng
        kpForm.value = { name: '', description: '', imageFile: null, imagePreview: null }
        showKPModal.value = true
    })

    if (isEdit) {
        await loadExistingTour(props.tourId)
    }
})

function renderMarkersAndLine() {
    markersLayer.clearLayers()
    const latlngs = []
    keypoints.value.forEach((kp, idx) => {
        const marker = L.marker([kp.lat, kp.lon], { draggable: true }).addTo(markersLayer)
        marker.bindPopup(`<strong>${kp.name || 'Point ' + (idx + 1)}</strong><div class="text-xs">${kp.description || ''}</div>`)
        marker.on('dragend', async (e) => {
            const p = e.target.getLatLng()
            kp.lat = p.lat; kp.lon = p.lng
            updatePolyline()
            // persist change
            if (kp.id && props.tourId) {
                await updateKeypointAPI(kp.id, { lat: kp.lat, lon: kp.lon })
                await recalcAndPersistLength()
            }
        })
        marker.on('contextmenu', async () => {
            if (!confirm('Delete this point?')) return
            await deleteKeypoint(kp)
        })
        latlngs.push([kp.lat, kp.lon])
    })
    polyline.setLatLngs(latlngs)
}

function updatePolyline() {
    const latlngs = keypoints.value.map(k => [k.lat, k.lon])
    polyline.setLatLngs(latlngs)
}

async function recalcAndPersistLength() {
    const len = totalKm.value
    // update tour length on backend if tour saved
    if (tour.value.id) {
        await updateTour(tour.value.id, { length_km: len })
    }
}

async function confirmAddKeypoint() {
    if (!selectedLatLng.value) {
        alert('No location selected')
        return
    }
    const lat = selectedLatLng.value.lat
    const lon = selectedLatLng.value.lng

    // ensure tour exists: create draft first if needed
    if (!tour.value.id) {
        await saveDraft()
        if (!tour.value.id) {
            alert('Could not create tour draft')
            return
        }
    }

    // prepare data
    const payload = {
        name: kpForm.value.name,
        description: kpForm.value.description,
        lat,
        lon,
        order: keypoints.value.length, // append to end
        file: kpForm.value.imageFile ?? null
    }

    try {
        const created = await addKeypointBase64(tour.value.id, payload)
        // add returned keypoint to local state. backend should return full kp object (id, lat, lon, image_url, order, ...)
        keypoints.value.push(created.keypoint)
        renderMarkersAndLine()
        showKPModal.value = false

        // recalc length & persist (backend may already update length and return it; keep both safe)
        if (keypoints.value.length > 1) {
            await recalcAndPersistLength()
        }
    } catch (e) {
        console.error('add keypoint failed', e)
        alert('Failed to add keypoint: ' + (e.message || e))
    }
}

function cancelKP() {
    showKPModal.value = false
    selectedLatLng.value = null
    kpForm.value = { name: '', description: '', imageFile: null, imagePreview: null }
}

async function deleteKeypoint(kp) {
    if (kp.id && tour.value.id) {
        await deleteKeypointAPI(kp.id)
        // after delete, refresh list from server (or remove locally)
        keypoints.value = keypoints.value.filter(x => x.id !== kp.id)
        await recalcAndPersistLength()
        renderMarkersAndLine()
    } else {
        keypoints.value = keypoints.value.filter(x => x !== kp)
        renderMarkersAndLine()
    }
}

function onFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    kpForm.value.imageFile = f
    const reader = new FileReader()
    reader.onload = (ev) => kpForm.value.imagePreview = ev.target.result
    reader.readAsDataURL(f)
}

async function saveDraft() {
    // build body from form
    const tags = (form.value.tagsString || '').split(',').map(s => s.trim()).filter(Boolean)
    const body = {
        name: form.value.name,
        description: form.value.description,
        difficulty: form.value.difficulty,
        tags
    }
    // travel_times
    body.travel_times = {}
    if (form.value.travel_times.walking) body.travel_times.walking = Number(form.value.travel_times.walking)
    if (form.value.travel_times.bicycle) body.travel_times.bicycle = Number(form.value.travel_times.bicycle)
    if (form.value.travel_times.car) body.travel_times.car = Number(form.value.travel_times.car)

    if (!tour.value.id) {
        const res = await createTour(body)
        tour.value = res.tour ?? res
        // set form back from tour to ensure sync
        form.value.tagsString = (tour.value.tags || []).join(', ')
        form.value.name = tour.value.name
    } else {
        await updateTour(tour.value.id, body)
        // optionally reload tour
    }
}

async function loadExistingTour(id) {
    const res = await getTour(id)
    const t = res.tour ?? res
    tour.value = t
    form.value.name = t.name
    form.value.description = t.description
    form.value.difficulty = t.difficulty
    form.value.tagsString = (t.tags || []).join(', ')
    form.value.travel_times = t.travelTimes || {}
    keypoints.value = (res.keypoints || []).map(k => ({ id: k.id, lat: k.lat, lon: k.lon, name: k.name, description: k.description, image_url: k.image_url, order: k.order }))
    renderMarkersAndLine()
    if (keypoints.value.length > 0) {
        map.fitBounds(keypoints.value.map(k => [k.lat, k.lon]))
    }
}

async function tryPublish() {
    publishing.value = true
    try {
        // validate front-end as well
        const tags = (form.value.tagsString || '').split(',').map(s => s.trim()).filter(Boolean)
        if (!form.value.name || !form.value.description || !form.value.difficulty || tags.length === 0) {
            alert('Please fill name/description/difficulty/tags before publishing.')
            publishing.value = false
            return
        }
        if (keypoints.value.length < 2) {
            alert('At least two keypoints are required to publish.')
            publishing.value = false
            return
        }
        const tt = form.value.travel_times || {}
        if (!tt.walking && !tt.bicycle && !tt.car) {
            alert('Define at least one travel time (walking/bicycle/car).')
            publishing.value = false
            return
        }

        // ensure draft saved
        await saveDraft()

        // call publish endpoint
        await publishTourAPI(tour.value.id)
        tour.value.status = 'published'
        tour.value.published_at = new Date().toISOString()
        alert('Published!')
    } catch (e) {
        console.error('publish failed', e)
        alert('Publish failed: ' + (e.message || 'unknown'))
    } finally {
        publishing.value = false
    }
}

async function archive() {
    if (!confirm('Archive this tour?')) return
    await archiveTourAPI(tour.value.id)
    tour.value.status = 'archived'
    tour.value.archived_at = new Date().toISOString()
}

async function unarchive() {
    await unarchiveTourAPI(tour.value.id)
    tour.value.status = 'published'
    tour.value.archived_at = null
}

async function onReorder(evt) {
    // evt contains information, but keypoints.value is already reordered
    if (!tour.value.id) {
        // tour not saved yet — nothing to persist
        renderMarkersAndLine()
        return
    }

    const orderedIds = keypoints.value.map(k => k.id).filter(Boolean)
    // sanity check: ensure all ids are real (no tmp id)
    const hasTmp = orderedIds.some(id => id && id.startsWith && id.startsWith('tmp-'))
    if (hasTmp) {
        // if temporary keypoints exist, create them first before reorder
        // simplest: reload tour from server (rollback local tmp items)
        await loadExistingTour(tour.value.id)
        alert('Please save new points first before reordering.')
        return
    }

    const prev = keypoints.value.map(k => ({ ...k })) // deep copy for rollback

    try {
        reordering.value = true
        // call API to persist new order
        await reorderKeypoints(tour.value.id, orderedIds)
        // success — update markers and polyline
        renderMarkersAndLine()
        // optional: request server to recalc length and update local tour data
        await recalcAndPersistLength()
    } catch (e) {
        console.error('Reorder failed', e)
        // rollback to prev order
        keypoints.value = prev
        renderMarkersAndLine()
        alert('Failed to reorder keypoints, reloading data.')
        await loadExistingTour(tour.value.id)
    } finally {
        reordering.value = false
    }
}

</script>

<style scoped></style>
