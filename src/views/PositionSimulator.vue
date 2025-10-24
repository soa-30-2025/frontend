<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Position Simulator</h1>
                <p class="text-gray-600 text-lg">Click on the map to set your current position</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Map Container -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        <div ref="map" class="w-full h-96 lg:h-[500px]"></div>
                    </div>
                </div>

                <!-- Controls Panel -->
                <div class="space-y-6">
                    <!-- Position Info -->
                    <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                            Current Position
                        </h3>

                        <div v-if="currentPosition" class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-gray-700">Latitude:</span>
                                <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                  {{ currentPosition.latitude.toFixed(6) }}
                </code>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-gray-700">Longitude:</span>
                                <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                  {{ currentPosition.longitude.toFixed(6) }}
                </code>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-gray-700">Last Updated:</span>
                                <span class="text-sm text-gray-600">
                                    {{ formatTimestamp(currentPosition.lastUpdated) }}
                                </span>
                            </div>
                        </div>

                        <div v-else class="text-center py-4">
                            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p class="text-yellow-800 text-sm">
                                    No position set yet. Click on the map to set your position.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                        <div class="space-y-3">
                            <button @click="getCurrentPosition" :disabled="loading"
                                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none hover:transform hover:-translate-y-0.5">
                                {{ loading ? 'Loading...' : 'Get Current Position' }}
                            </button>

                            <button @click="deletePosition" :disabled="!currentPosition || loading"
                                class="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none hover:transform hover:-translate-y-0.5">
                                Delete Position
                            </button>
                        </div>
                    </div>

                    <!-- Status Messages -->
                    <div v-if="message" :class="[
                        'p-4 rounded-lg border font-medium',
                        messageType === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                            messageType === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                                'bg-blue-50 border-blue-200 text-blue-800'
                    ]">
                        {{ message }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { setPosition, getCurrentPosition, deletePosition } from '@/api/position'

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default {
    name: 'PositionSimulator',
    setup() {
        const map = ref(null)
        const leafletMap = ref(null)
        const marker = ref(null)
        const currentPosition = ref(null)
        const loading = ref(false)
        const message = ref('')
        const messageType = ref('')

        // Default center (Belgrade)
        const defaultCenter = [44.8125, 20.4612]
        const defaultZoom = 13

        // Initialize Leaflet map
        const initializeMap = () => {
            if (!map.value) return

            // Create map instance
            leafletMap.value = L.map(map.value).setView(defaultCenter, defaultZoom)

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(leafletMap.value)

            // Handle map clicks
            leafletMap.value.on('click', (e) => {
                const { lat, lng } = e.latlng
                handleSetPosition(lat, lng)
                updateMarker([lat, lng])
            })

            // Load current position
            loadCurrentPosition()
        }

        // Update marker on map
        const updateMarker = (latlng) => {
            if (marker.value) {
                marker.value.setLatLng(latlng)
            } else {
                marker.value = L.marker(latlng)
                    .addTo(leafletMap.value)
                    .bindPopup('Your current position')
                    .openPopup()
            }

            // Center map on marker
            leafletMap.value.setView(latlng, leafletMap.value.getZoom())
        }

        // Remove marker from map
        const removeMarker = () => {
            if (marker.value) {
                leafletMap.value.removeLayer(marker.value)
                marker.value = null
            }
        }

        // Set position using service
        const handleSetPosition = async (latitude, longitude) => {
            loading.value = true
            clearMessage()

            try {
                const data = await setPosition(latitude, longitude)
                currentPosition.value = data.position
                showMessage('Position set successfully!', 'success')
            } catch (error) {
                console.error('Error setting position:', error)
                showMessage('Failed to set position: ' + error.message, 'error')
            } finally {
                loading.value = false
            }
        }

        // Get current position using service
        const handleGetCurrentPosition = async () => {
            loading.value = true
            clearMessage()

            try {
                const data = await getCurrentPosition()
                
                if (data) {
                    currentPosition.value = data.position
                    // Update marker on map
                    const latlng = [data.position.latitude, data.position.longitude]
                    updateMarker(latlng)
                    showMessage('Position loaded successfully!', 'success')
                } else {
                    showMessage('No position set yet', 'info')
                    currentPosition.value = null
                    removeMarker()
                }
            } catch (error) {
                console.error('Error getting position:', error)
                showMessage('Failed to get position: ' + error.message, 'error')
            } finally {
                loading.value = false
            }
        }

        // Delete position using service
        const handleDeletePosition = async () => {
            loading.value = true
            clearMessage()

            try {
                const data = await deletePosition()
                currentPosition.value = null
                removeMarker()
                showMessage(data.message || 'Position deleted successfully!', 'success')
            } catch (error) {
                console.error('Error deleting position:', error)
                showMessage('Failed to delete position: ' + error.message, 'error')
            } finally {
                loading.value = false
            }
        }

        // Load current position on component mount
        const loadCurrentPosition = () => {
            handleGetCurrentPosition()
        }

        // Helper functions
        const showMessage = (text, type) => {
            message.value = text
            messageType.value = type

            // Auto-clear message after 5 seconds
            setTimeout(() => {
                if (message.value === text) {
                    clearMessage()
                }
            }, 5000)
        }

        const clearMessage = () => {
            message.value = ''
            messageType.value = ''
        }

        const formatTimestamp = (timestamp) => {
            console.log(timestamp)
            if (!timestamp) return "Date not available";

            try {
                let date;

                if (timestamp.seconds !== undefined) {
                    date = new Date(timestamp.seconds * 1000);
                } else if (typeof timestamp === 'string') {
                    date = new Date(timestamp);
                } else {
                    console.warn("Unknown timestamp format:", timestamp);
                    return "Invalid date format";
                }

                return isNaN(date.getTime())
                    ? "Invalid date"
                    : date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
            } catch (error) {
                console.error("Error formatting date:", error, "Timestamp:", timestamp);
                return "Invalid date";
            }
        };

        onMounted(() => {
            initializeMap()
        })

        onUnmounted(() => {
            // Cleanup Leaflet map
            if (leafletMap.value) {
                leafletMap.value.remove()
            }
        })

        return {
            map,
            currentPosition,
            loading,
            message,
            messageType,
            getCurrentPosition: handleGetCurrentPosition,
            deletePosition: handleDeletePosition,
            formatTimestamp
        }
    }
}
</script>