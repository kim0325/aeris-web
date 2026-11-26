<template>
  <div class="spaces-page">
    <div class="spaces-container">
      <!-- Encabezado -->
      <header class="view-header">
        <div>
          <h1>Administración de Lugares y Nodos IoT</h1>
          <p class="subtitle">Vincula cada habitación con su microcontrolador ESP32 correspondiente</p>
        </div>
        <div class="header-actions">
          <router-link to="/dashboard" class="btn-back">
            ← Volver al Dashboard
          </router-link>
          <button class="btn-primary" @click="showLocationModal = true">
            + Nueva Residencia / Lugar
          </button>
        </div>
      </header>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        Cargando residencias y estado de nodos...
      </div>

      <!-- Sin lugares registrados -->
      <div v-else-if="locations.length === 0" class="empty-state">
        <h3>No hay lugares registrados</h3>
        <p>Comienza registrando una residencia para poder vincular tus nodos ESP32.</p>
        <button class="btn-primary" @click="showLocationModal = true">
          Registrar mi primer lugar
        </button>
      </div>

      <!-- Listado de Residencias -->
      <div v-else class="locations-grid">
        <div v-for="location in locations" :key="location.id" class="location-card">
          <div class="location-header">
            <div>
              <h2>{{ location.nombre }}</h2>
              <span class="address-tag">{{ location.direccion || 'Sin dirección especificada' }}</span>
            </div>
            <div class="location-actions">
              <button class="btn-secondary btn-sm" @click="openNewSpaceModal(location)">
                + Agregar Habitación
              </button>
              <button class="btn-danger-outline btn-sm" @click="deleteLocation(location.id)" title="Eliminar lugar">
                Eliminar
              </button>
            </div>
          </div>

          <!-- Habitaciones dentro de la residencia -->
          <div class="spaces-list">
            <div v-if="getSpacesByLocation(location.id).length === 0" class="no-spaces">
              No hay habitaciones vinculadas en este lugar.
            </div>

            <div
              v-for="space in getSpacesByLocation(location.id)"
              :key="space.id"
              class="space-item"
            >
              <div class="space-info">
                <div class="space-title-row">
                  <strong>{{ space.nombre }}</strong>
                  <!-- Badge de estado de enlace -->
                  <span :class="['status-badge', isNodeOnline(space) ? 'online' : 'offline']">
                    <span class="dot"></span>
                    {{ isNodeOnline(space) ? 'NODO EN LÍNEA' : 'SIN SEÑAL' }}
                  </span>
                </div>

                <!-- Identificador del ESP32 vinculado -->
                <div class="node-binding">
                  <span class="label">Nodo Embebido:</span>
                  <code v-if="space.codigo_nodo" class="node-code">{{ space.codigo_nodo }}</code>
                  <span v-else class="unassigned-tag">Sin nodo asignado</span>
                </div>

                <small class="last-seen" v-if="space.ultima_medicion">
                  Último paquete: {{ formatDate(space.ultima_medicion.fecha_hora_registro) }}
                </small>
              </div>

              <!-- Acciones de vinculación por habitación -->
              <div class="space-controls">
                <button
                  class="btn-firmware"
                  @click="openFirmwareModal(space)"
                  title="Obtener código de enlace para ESP32"
                >
                  Configurar ESP32
                </button>
                <button
                  class="btn-edit"
                  @click="openEditNodeModal(space)"
                  title="Cambiar ID de nodo"
                >
                  Editar Nodo
                </button>
                <button
                  class="btn-delete-icon"
                  @click="deleteSpace(space.id)"
                  title="Eliminar habitación"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 1: CREAR NUEVO LUGAR -->
    <div v-if="showLocationModal" class="modal-backdrop" @click.self="showLocationModal = false">
      <div class="modal-card">
        <h3>Registrar Nueva Residencia</h3>
        <form @submit.prevent="createLocation">
          <div class="form-group">
            <label>Nombre del Lugar *</label>
            <input v-model="newLocation.nombre" type="text" placeholder="Ej. Casa Principal" required />
          </div>
          <div class="form-group">
            <label>Dirección / Referencia</label>
            <input v-model="newLocation.direccion" type="text" placeholder="Ej. Misantla, Veracruz" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="showLocationModal = false">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar Lugar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: AGREGAR HABITACIÓN Y VINCULAR ESP32 -->
    <div v-if="showSpaceModal" class="modal-backdrop" @click.self="showSpaceModal = false">
      <div class="modal-card">
        <h3>Agregar Habitación en "{{ selectedLocation?.nombre }}"</h3>
        <form @submit.prevent="createSpace">
          <div class="form-group">
            <label>Nombre de la Habitación *</label>
            <input v-model="newSpace.nombre" type="text" placeholder="Ej. Recámara Principal, Sala..." required />
          </div>
          <div class="form-group">
            <label>ID del Sistema Embebido (Nodo ESP32) *</label>
            <input
              v-model="newSpace.codigo_nodo"
              type="text"
              placeholder="Ej. AERIS-ESP32-NODO-01"
              required
            />
            <small class="help-text">
              Este identificador debe coincidir exactamente con la variable <code>DEVICE_UUID</code> del firmware.
            </small>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="showSpaceModal = false">Cancelar</button>
            <button type="submit" class="btn-primary">Vincular Habitación</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 3: EDITAR / REASIGNAR NODO DE HABITACIÓN -->
    <div v-if="showEditNodeModal" class="modal-backdrop" @click.self="showEditNodeModal = false">
      <div class="modal-card">
        <h3>Reasignar Nodo ESP32</h3>
        <p class="modal-desc">Habitación: <strong>{{ editingSpace?.nombre }}</strong></p>
        <form @submit.prevent="updateSpaceNode">
          <div class="form-group">
            <label>Nuevo ID del Nodo (ESP32)</label>
            <input
              v-model="editNodeCode"
              type="text"
              placeholder="Ej. AERIS-ESP32-NODO-02"
              required
            />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="showEditNodeModal = false">Cancelar</button>
            <button type="submit" class="btn-primary">Actualizar Enlace</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 4: CREDENCIALES Y SNIPPET DE FIRMWARE PARA ESP32 -->
    <div v-if="showFirmwareModal" class="modal-backdrop" @click.self="showFirmwareModal = false">
      <div class="modal-card modal-wide">
        <h3>Configuración de Enlace Embebido (ESP32)</h3>
        <p class="modal-desc">
          Copia estas constantes en el código C++ de tu microcontrolador para vincularlo automáticamente con
          <strong>{{ firmwareSpace?.nombre }}</strong>:
        </p>

        <div class="code-box">
          <pre><code>// Configuración de enlace para: {{ firmwareSpace?.nombre }}
const char* DEVICE_UUID = "{{ firmwareSpace?.codigo_nodo || 'AERIS-ESP32-NODO-01' }}";
const char* API_URL     = "http://10.37.53.180:8000/api/iot/telemetry";</code></pre>
        </div>

        <div class="payload-preview">
          <label>Estructura JSON esperada desde este nodo:</label>
          <pre><code>{
  "device_uuid": "{{ firmwareSpace?.codigo_nodo || 'AERIS-ESP32-NODO-01' }}",
  "humedad": 52.4,
  "pm2_5": 11.8,
  "pm10": 23.1,
  "temperatura": 24.5,
  "origen_dato": "REAL"
}</code></pre>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="copyFirmwareSnippet">
            {{ copied ? '¡Copiado al portapapeles!' : 'Copiar Código C++' }}
          </button>
          <button type="button" class="btn-primary" @click="showFirmwareModal = false">Listo</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://aeris-api-gyaj.onrender.com/api'

const locations = ref([])
const spaces = ref([])
const loading = ref(true)
let isFetching = false

const showLocationModal = ref(false)
const showSpaceModal = ref(false)
const showEditNodeModal = ref(false)
const showFirmwareModal = ref(false)
const copied = ref(false)

const newLocation = ref({ nombre: '', direccion: '' })
const selectedLocation = ref(null)
const newSpace = ref({ nombre: '', codigo_nodo: '' })

const editingSpace = ref(null)
const editNodeCode = ref('')
const firmwareSpace = ref(null)

let pollingTimer = null

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('iaq_token')}`,
    Accept: 'application/json'
  }
})

const fetchData = async (silent = false) => {
  if (isFetching) return
  isFetching = true
  if (!silent) loading.value = true
  try {
    const [locRes, spaceRes] = await Promise.all([
      axios.get(`${API_URL}/monitoring/locations`, getAuthHeaders()),
      axios.get(`${API_URL}/monitoring/spaces`, getAuthHeaders())
    ])
    locations.value = locRes.data.data || []
    spaces.value = spaceRes.data.data || []
  } catch (error) {
    console.error('Error cargando lugares y nodos:', error)
  } finally {
    loading.value = false
    isFetching = false
  }
}

const getSpacesByLocation = (locationId) => {
  return spaces.value.filter((s) => s.location_id === locationId)
}

const isNodeOnline = (space) => {
  if (!space.ultima_medicion || !space.ultima_medicion.fecha_hora_registro) return false
  const lastTime = new Date(space.ultima_medicion.fecha_hora_registro).getTime()
  const now = Date.now()
  return (now - lastTime) <= 30000
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const createLocation = async () => {
  try {
    await axios.post(`${API_URL}/monitoring/locations`, newLocation.value, getAuthHeaders())
    newLocation.value = { nombre: '', direccion: '' }
    showLocationModal.value = false
    await fetchData()
  } catch (error) {
    alert('No se pudo registrar el lugar.')
  }
}

const deleteLocation = async (id) => {
  if (!confirm('¿Eliminar este lugar y todas sus habitaciones vinculadas?')) return
  try {
    await axios.delete(`${API_URL}/monitoring/locations/${id}`, getAuthHeaders())
    await fetchData()
  } catch (error) {
    alert('Error al eliminar el lugar.')
  }
}

const openNewSpaceModal = (location) => {
  selectedLocation.value = location
  const nextNum = String(spaces.value.length + 1).padStart(2, '0')
  newSpace.value = { nombre: '', codigo_nodo: `AERIS-ESP32-NODO-${nextNum}` }
  showSpaceModal.value = true
}

const createSpace = async () => {
  try {
    await axios.post(
      `${API_URL}/monitoring/spaces`,
      {
        location_id: selectedLocation.value.id,
        nombre: newSpace.value.nombre,
        codigo_nodo: newSpace.value.codigo_nodo.trim()
      },
      getAuthHeaders()
    )
    showSpaceModal.value = false
    await fetchData()
  } catch (error) {
    alert('Error al vincular la habitación.')
  }
}

const openEditNodeModal = (space) => {
  editingSpace.value = space
  editNodeCode.value = space.codigo_nodo || ''
  showEditNodeModal.value = true
}

const updateSpaceNode = async () => {
  try {
    await axios.put(
      `${API_URL}/monitoring/spaces/${editingSpace.value.id}`,
      { codigo_nodo: editNodeCode.value.trim() },
      getAuthHeaders()
    )
    showEditNodeModal.value = false
    await fetchData()
  } catch (error) {
    alert('No se pudo actualizar el código del nodo.')
  }
}

const deleteSpace = async (id) => {
  if (!confirm('¿Desvincular y eliminar esta habitación?')) return
  try {
    await axios.delete(`${API_URL}/monitoring/spaces/${id}`, getAuthHeaders())
    await fetchData()
  } catch (error) {
    alert('Error al eliminar la habitación.')
  }
}

const openFirmwareModal = (space) => {
  firmwareSpace.value = space
  copied.value = false
  showFirmwareModal.value = true
}

const copyFirmwareSnippet = async () => {
  const code = `const char* DEVICE_UUID = "${firmwareSpace.value?.codigo_nodo || 'AERIS-ESP32-NODO-01'}";\nconst char* API_URL     = "http://10.37.53.180:8000/api/iot/telemetry";`
  await navigator.clipboard.writeText(code)
  copied.value = true
  setTimeout(() => (copied.value = false), 2500)
}

onMounted(() => {
  fetchData()
  pollingTimer = setInterval(() => fetchData(true), 6000)
})

onUnmounted(() => {
  if (pollingTimer) clearInterval(pollingTimer)
})
</script>

<style scoped>
.spaces-page {
  min-height: 100vh;
  background-color: #080d12;
  background-image:
    radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.06) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.05) 0px, transparent 50%);
  color: #e2e8f0;
  padding: 2rem 1rem;
}

.spaces-container {
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 1.25rem;
}

.view-header h1 {
  color: #f8fafc;
  font-size: 1.85rem;
  font-weight: 700;
  margin: 0;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.92rem;
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-back {
  background: #111a24;
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
  padding: 0.55rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: rgba(56, 189, 248, 0.15);
  color: #7dd3fc;
}

.loading-state,
.empty-state {
  background: #0f1722;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 3rem 1.5rem;
  text-align: center;
  color: #94a3b8;
}

.empty-state h3 {
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.locations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(520px, 1fr));
  gap: 1.5rem;
}

.location-card {
  background: #0f1722;
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 1.35rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid #1e293b;
}

.location-header h2 {
  color: #ffffff;
  font-size: 1.35rem;
  margin: 0 0 0.2rem 0;
}

.address-tag {
  font-size: 0.82rem;
  color: #94a3b8;
}

.location-actions {
  display: flex;
  gap: 0.5rem;
}

.spaces-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.no-spaces {
  color: #64748b;
  font-size: 0.88rem;
  padding: 0.5rem 0;
}

.space-item {
  background: #16202e;
  border: 1px solid #283548;
  border-radius: 10px;
  padding: 1rem 1.1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.space-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.4rem;
  color: #f8fafc;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  letter-spacing: 0.04em;
}

.status-badge.online {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.45);
}

.status-badge.offline {
  background: rgba(148, 163, 184, 0.12);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.status-badge .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.node-binding {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.node-binding .label {
  color: #94a3b8;
}

.node-code {
  background: #080d12;
  color: #38bdf8;
  padding: 0.18rem 0.55rem;
  border-radius: 5px;
  font-family: monospace;
  border: 1px solid #0369a1;
}

.last-seen {
  display: block;
  color: #94a3b8;
  font-size: 0.76rem;
  margin-top: 0.3rem;
}

.space-controls {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.btn-primary {
  background: #10b981;
  color: #022c22;
  font-weight: 700;
  border: none;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.btn-secondary {
  background: #0284c7;
  color: #fff;
  border: none;
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}

.btn-firmware {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
  padding: 0.38rem 0.7rem;
  border-radius: 6px;
  font-size: 0.78rem;
  cursor: pointer;
}

.btn-edit {
  background: #334155;
  color: #e2e8f0;
  border: none;
  padding: 0.38rem 0.7rem;
  border-radius: 6px;
  font-size: 0.78rem;
  cursor: pointer;
}

.btn-delete-icon {
  background: transparent;
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.35);
  padding: 0.32rem 0.58rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-danger-outline {
  background: transparent;
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.4);
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-ghost {
  background: transparent;
  color: #94a3b8;
  border: 1px solid #334155;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-card {
  background: #0f1722;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.5rem;
  width: 100%;
  max-width: 440px;
  color: #f8fafc;
}

.modal-wide {
  max-width: 560px;
}

.form-group {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group input {
  background: #1e293b;
  border: 1px solid #334155;
  color: #f8fafc;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
}

.help-text {
  color: #94a3b8;
  font-size: 0.78rem;
}

.code-box,
.payload-preview {
  background: #080d12;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 0.85rem;
  margin-top: 1rem;
  overflow-x: auto;
}

.code-box pre,
.payload-preview pre {
  margin: 0;
  color: #38bdf8;
  font-size: 0.85rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>