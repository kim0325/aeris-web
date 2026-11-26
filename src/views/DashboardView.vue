<template>
  <div class="bio-tech-wrapper min-vh-100 text-light d-flex flex-column">
    <!-- Header -->
    <header class="topbar-glass px-4 py-3 sticky-top border-bottom border-subtle">
      <div class="container-fluid p-0 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <div class="hub-radar">
            <i class="bi bi-cpu-fill text-emerald fs-4"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <span class="tech-heading fs-4 fw-bold text-white tracking-wide">Plataforma Aeris · TELEMETRY STATION</span>
              <span class="badge badge-tech-pill bg-emerald-glow text-emerald font-mono">v2.4-ACTIVE</span>
            </div>
            <small class="text-slate-muted d-block font-mono small">Protocolo: HTTP REST + FSM · Región: Misantla, Veracruz</small>
          </div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <router-link to="/spaces" class="btn btn-outline-info btn-sm font-tech px-3 py-1 rounded-pill">
            <i class="bi bi-geo-alt-fill me-1"></i> Gestionar Lugares
          </router-link>

          <!-- INDICADOR DINÁMICO DE LATIDO (ONLINE / OFFLINE) -->
          <div 
            class="node-live-status font-mono small d-none d-md-flex align-items-center gap-2 px-3 py-1 rounded-pill"
            :class="isNodeOnline ? 'border-emerald-glow' : 'border-danger-glow'"
          >
            <span :class="isNodeOnline ? 'pulse-dot' : 'pulse-dot-red'"></span>
            <span :class="isNodeOnline ? 'text-emerald fw-semibold' : 'text-danger fw-semibold'">
              {{ isNodeOnline ? 'NODO EN LÍNEA' : 'NODO SIN SEÑAL' }}
            </span>
          </div>

          <!-- BOTÓN DE AVATAR -->
          <div class="dropdown">
            <button 
              class="btn btn-avatar-pill p-1 rounded-pill border-subtle d-flex align-items-center gap-2" 
              type="button" 
              data-bs-toggle="dropdown"
              :title="currentUser.name"
            >
              <img 
                v-if="currentUser.avatar" 
                :src="currentUser.avatar" 
                class="topbar-avatar-img" 
                alt="Foto de perfil" 
              />
              <div v-else class="topbar-avatar-placeholder d-flex align-items-center justify-content-center">
                <i class="bi bi-person-fill text-cyan fs-5"></i>
              </div>
              <i class="bi bi-chevron-down text-slate-muted small pe-2"></i>
            </button>

            <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow">
              <li class="px-3 py-2 border-bottom border-subtle">
                <span class="d-block text-white fw-bold font-tech small">{{ currentUser.name }}</span>
                <small class="text-slate-muted font-mono" style="font-size: 0.72rem;">{{ currentUser.email }}</small>
              </li>
              <li>
                <router-link to="/profile" class="dropdown-item small font-tech mt-1">
                  <i class="bi bi-person-gear me-2 text-emerald"></i>Mi Perfil
                </router-link>
              </li>
              <li>
                <router-link to="/spaces" class="dropdown-item small font-tech">
                  <i class="bi bi-diagram-3 me-2 text-cyan"></i>Mis Residencias
                </router-link>
              </li>
              <li><hr class="dropdown-divider border-subtle"></li>
              <li>
                <button class="dropdown-item text-danger small font-tech" @click="handleLogout">
                  <i class="bi bi-door-closed me-2"></i>Desconectar
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <main class="container-fluid px-4 py-4 flex-grow-1">
      <!-- SELECTOR Y CLASIFICADOR DE RESIDENCIAS Y HABITACIONES -->
      <div class="room-selector-panel p-3 rounded-4 mb-4 border border-subtle">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <span class="font-tech text-uppercase header-label-highlight small fw-bold tracking-wider">
            <i class="bi bi-diagram-3-fill text-emerald me-2"></i> ESPACIOS RESIDENCIALES ASIGNADOS AL USUARIO
          </span>
          <div class="d-flex align-items-center gap-2">
            <span class="font-mono text-slate-muted small">{{ filteredSpaces.length }} de {{ spaces.length }} Nodos Mostrados</span>
            <router-link to="/spaces" class="badge bg-input border border-subtle text-emerald text-decoration-none font-tech">
              + Agregar Nuevo
            </router-link>
          </div>
        </div>

        <!-- BARRA CLASIFICADORA POR RESIDENCIA -->
        <div class="location-filter-bar d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-subtle flex-wrap" v-if="locations.length > 0">
          <span class="font-tech text-slate-muted small text-uppercase fw-bold me-1">
            <i class="bi bi-funnel-fill text-cyan me-1"></i> Filtrar por Residencia:
          </span>

          <button 
            type="button" 
            class="btn btn-sm loc-pill-btn font-tech" 
            :class="{ 'loc-pill-active': selectedLocationFilter === 'ALL' }"
            @click="setLocationFilter('ALL')"
          >
            <i class="bi bi-grid-fill me-1"></i> TODAS LAS RESIDENCIAS
          </button>

          <button 
            v-for="loc in locations" 
            :key="loc.id"
            type="button" 
            class="btn btn-sm loc-pill-btn font-tech" 
            :class="{ 'loc-pill-active': selectedLocationFilter === loc.id }"
            @click="setLocationFilter(loc.id)"
          >
            <i class="bi bi-buildings me-1"></i> {{ loc.nombre }}
          </button>
        </div>
        
        <!-- BOTONES DE HABITACIONES FILTRADAS -->
        <div class="d-flex gap-2 flex-wrap" v-if="filteredSpaces.length > 0">
          <button
            v-for="space in filteredSpaces"
            :key="space.id"
            class="room-tab-btn btn btn-sm px-3 py-2 rounded-3 text-start d-flex align-items-center gap-2 border border-subtle"
            :class="{ 'room-tab-active': selectedSpaceId === space.id }"
            @click="selectSpace(space.id)"
          >
            <i class="bi bi-house-door" :class="selectedSpaceId === space.id ? 'text-emerald' : 'text-slate-muted'"></i>
            <div>
              <span class="d-block fw-semibold font-tech tracking-wide">{{ space.nombre }}</span>
              <small 
                class="font-mono status-mini-tag" 
                :class="isSpaceOnline(space) ? getFsmTextClass(space.ultima_medicion?.estado_fsm) : 'text-danger'"
              >
                ● {{ isSpaceOnline(space) ? formatState(space.ultima_medicion?.estado_fsm) : 'SIN SEÑAL' }}
              </small>
            </div>
          </button>
        </div>

        <div v-else class="text-center text-slate-muted font-mono py-4 border border-dashed border-subtle rounded-3">
          <i class="bi bi-house-gear fs-3 text-emerald d-block mb-2"></i>
          <span>No tienes habitaciones creadas todavía en tu cuenta.</span>
          <router-link to="/spaces" class="btn btn-bio-emerald btn-sm font-tech fw-bold mt-2 ms-2">
            Comenzar a registrar mis lugares
          </router-link>
        </div>
      </div>

      <!-- ESTADO CON ESPACIOS REGISTRADOS -->
      <div v-if="currentSpace">
        <!-- TARJETAS DE KPIS -->
        <div class="row g-3 mb-4">
          <!-- Humedad -->
          <div class="col-xl-3 col-md-6">
            <div class="metric-glass-card p-3 rounded-4 border-subtle h-100">
              <div class="d-flex justify-content-between align-items-center">
                <span class="font-tech card-title-highlight text-uppercase small fw-bold">HUMEDAD RELATIVA</span>
                <i class="bi bi-droplet-half fs-4 text-cyan"></i>
              </div>
              <div class="d-flex align-items-baseline gap-2 my-2">
                <span class="font-mono fs-1 fw-bold text-white">
                  {{ isNodeOnline ? (currentSpace.ultima_medicion?.humedad ?? '--') : '--' }}
                </span>
                <span class="font-tech fs-5 text-cyan">%</span>
              </div>
              <div class="progress progress-dark rounded-pill" style="height: 5px;">
                <div 
                  class="progress-bar bg-cyan" 
                  :style="{ width: `${isNodeOnline ? Math.min(currentSpace.ultima_medicion?.humedad || 0, 100) : 0}%` }"
                ></div>
              </div>
              <div class="d-flex justify-content-between font-mono card-footer-legend mt-2" style="font-size: 0.72rem;">
                <span>Min: 30%</span>
                <span>Confort OMS</span>
                <span>Max: 60%</span>
              </div>
            </div>
          </div>

          <!-- PM2.5 -->
          <div class="col-xl-3 col-md-6">
            <div class="metric-glass-card p-3 rounded-4 border-subtle h-100">
              <div class="d-flex justify-content-between align-items-center">
                <span class="font-tech card-title-highlight text-uppercase small fw-bold">PARTÍCULAS PM2.5</span>
                <i class="bi bi-wind fs-4 text-amber"></i>
              </div>
              <div class="d-flex align-items-baseline gap-2 my-2">
                <span class="font-mono fs-1 fw-bold text-white">
                  {{ isNodeOnline ? (currentSpace.ultima_medicion?.pm2_5 ?? '--') : '--' }}
                </span>
                <span class="font-tech fs-6 text-slate-muted">µg/m³</span>
              </div>
              <div class="progress progress-dark rounded-pill" style="height: 5px;">
                <div 
                  class="progress-bar bg-amber" 
                  :style="{ width: `${isNodeOnline ? Math.min((currentSpace.ultima_medicion?.pm2_5 || 0) * 2, 100) : 0}%` }"
                ></div>
              </div>
              <div class="d-flex justify-content-between font-mono card-footer-legend mt-2" style="font-size: 0.72rem;">
                <span>0 µg/m³</span>
                <span>Límite OMS: 25 µg/m³</span>
                <span>50+</span>
              </div>
            </div>
          </div>

          <!-- PM10 -->
          <div class="col-xl-3 col-md-6">
            <div class="metric-glass-card p-3 rounded-4 border-subtle h-100">
              <div class="d-flex justify-content-between align-items-center">
                <span class="font-tech card-title-highlight text-uppercase small fw-bold">PARTÍCULAS PM10</span>
                <i class="bi bi-cloud-haze2 fs-4 text-emerald"></i>
              </div>
              <div class="d-flex align-items-baseline gap-2 my-2">
                <span class="font-mono fs-1 fw-bold text-white">
                  {{ isNodeOnline ? (currentSpace.ultima_medicion?.pm10 ?? '--') : '--' }}
                </span>
                <span class="font-tech fs-6 text-slate-muted">µg/m³</span>
              </div>
              <div class="progress progress-dark rounded-pill" style="height: 5px;">
                <div 
                  class="progress-bar bg-emerald" 
                  :style="{ width: `${isNodeOnline ? Math.min(currentSpace.ultima_medicion?.pm10 || 0, 100) : 0}%` }"
                ></div>
              </div>
              <div class="d-flex justify-content-between font-mono card-footer-legend mt-2" style="font-size: 0.72rem;">
                <span>0 µg/m³</span>
                <span>Límite OMS: 50 µg/m³</span>
                <span>100+</span>
              </div>
            </div>
          </div>

          <!-- Clasificación FSM -->
          <div class="col-xl-3 col-md-6">
            <div class="metric-glass-card p-3 rounded-4 border-subtle h-100 position-relative overflow-hidden">
              <div class="d-flex justify-content-between align-items-center">
                <span class="font-tech card-title-highlight text-uppercase small fw-bold">CLASIFICACIÓN FSM</span>
                <i class="bi bi-activity fs-4" :class="isNodeOnline ? 'text-emerald' : 'text-danger'"></i>
              </div>
              <h4 
                class="font-tech fw-bold my-2 tracking-wide" 
                :class="isNodeOnline ? getFsmTextClass(currentSpace.ultima_medicion?.estado_fsm) : 'text-danger'"
              >
                {{ isNodeOnline ? formatState(currentSpace.ultima_medicion?.estado_fsm) : 'SIN SEÑAL' }}
              </h4>
              <div class="font-mono card-footer-legend small mt-2 d-flex align-items-center gap-1">
                <i class="bi bi-clock-history"></i>
                <span>T: {{ isNodeOnline ? (currentSpace.ultima_medicion?.temperatura ?? '--') : '--' }}°C</span>
                <span class="mx-1">|</span>
                <span>{{ formatTime(currentSpace.ultima_medicion?.fecha_hora_registro) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- GRÁFICAS Y ALERTAS -->
        <div class="row g-4 mb-4">
          <div class="col-lg-8">
            <div class="dashboard-panel p-4 rounded-4 border border-subtle h-100 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h6 class="font-tech fw-bold text-white tracking-wide text-uppercase mb-0">
                    <i class="bi bi-graph-up-arrow text-emerald me-2"></i> Evolución de Concentraciones en Tiempo Real
                  </h6>
                  <small class="text-slate-muted font-mono">Espacio: {{ currentSpace?.nombre }} · {{ timeRangeLabel }}</small>
                </div>

                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <!-- SELECTOR DE VENTANA TEMPORAL -->
                  <div class="d-flex p-1 rounded-3 border border-subtle filter-container-pill gap-1">
                    <button 
                      type="button" 
                      class="btn btn-sm font-tech px-2 py-1 time-range-btn" 
                      :class="{ 'time-range-active': timeRange === 'REALTIME' }"
                      @click="setTimeRange('REALTIME')"
                    >
                      EN VIVO
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm font-tech px-2 py-1 time-range-btn" 
                      :class="{ 'time-range-active': timeRange === '6H' }"
                      @click="setTimeRange('6H')"
                    >
                      6 HORAS
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm font-tech px-2 py-1 time-range-btn" 
                      :class="{ 'time-range-active': timeRange === '24H' }"
                      @click="setTimeRange('24H')"
                    >
                      24 HORAS
                    </button>
                  </div>

                  <!-- BOTONERA DE FILTRO DE SERIES -->
                  <div class="d-flex p-1 rounded-3 border border-subtle filter-container-pill gap-1">
                    <button 
                      type="button" 
                      class="btn btn-sm font-tech px-2 py-1 custom-tab-btn" 
                      :style="chartFilter === 'ALL' ? 'background-color: rgba(255, 255, 255, 0.15); color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);' : 'color: #94a3b8; background: transparent; border: 1px solid transparent;'"
                      @click="setChartFilter('ALL')"
                    >
                      TODAS
                    </button>

                    <button 
                      type="button" 
                      class="btn btn-sm font-tech px-2 py-1 custom-tab-btn" 
                      :style="chartFilter === 'HUM' ? 'background-color: rgba(6, 182, 212, 0.22); color: #06b6d4 !important; border: 1px solid #06b6d4; box-shadow: 0 0 12px rgba(6, 182, 212, 0.35);' : 'color: #94a3b8; background: transparent; border: 1px solid transparent;'"
                      @click="setChartFilter('HUM')"
                    >
                      HUMEDAD
                    </button>

                    <button 
                      type="button" 
                      class="btn btn-sm font-tech px-2 py-1 custom-tab-btn" 
                      :style="chartFilter === 'PM25' ? 'background-color: rgba(245, 158, 11, 0.22); color: #f59e0b !important; border: 1px solid #f59e0b; box-shadow: 0 0 12px rgba(245, 158, 11, 0.35);' : 'color: #94a3b8; background: transparent; border: 1px solid transparent;'"
                      @click="setChartFilter('PM25')"
                    >
                      PM2.5
                    </button>

                    <button 
                      type="button" 
                      class="btn btn-sm font-tech px-2 py-1 custom-tab-btn" 
                      :style="chartFilter === 'PM10' ? 'background-color: rgba(16, 185, 129, 0.22); color: #10b981 !important; border: 1px solid #10b981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.35);' : 'color: #94a3b8; background: transparent; border: 1px solid transparent;'"
                      @click="setChartFilter('PM10')"
                    >
                      PM10
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex-grow-1 position-relative" style="min-height: 290px; height: 290px;">
                <canvas id="realtimeChartCanvas"></canvas>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="dashboard-panel p-4 rounded-4 border border-subtle h-100 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="font-tech fw-bold text-white tracking-wide text-uppercase mb-0">
                  <i class="bi bi-exclamation-octagon-fill text-danger me-2"></i> Alertas de Confort y Salud
                </h6>
                <span class="badge bg-danger-glow text-danger font-mono px-2 py-1 rounded-pill">{{ alerts.length }} activas</span>
              </div>
              
              <div class="alert-feed-container flex-grow-1 overflow-auto pe-1" style="max-height: 290px;">
                <div 
                  v-for="alert in alerts" 
                  :key="alert.id"
                  class="alert-strip p-2 mb-2 rounded-3 border-start border-3"
                  :class="alert.severidad === 'CRITICA' ? 'border-danger bg-danger-subtle-custom' : 'border-warning bg-warning-subtle-custom'"
                >
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge font-tech" :class="alert.severidad === 'CRITICA' ? 'bg-danger' : 'bg-warning text-dark'">
                      {{ alert.severidad }}
                    </span>
                    <span class="font-mono text-slate-muted small">{{ formatTime(alert.created_at) }}</span>
                  </div>
                  <p class="small text-light mb-2 font-body">{{ alert.mensaje }}</p>
                  <div class="text-end">
                    <button 
                      v-if="!alert.resuelta"
                      class="btn btn-sm btn-outline-success font-tech py-0 px-2"
                      @click="confirmResolveAlert(alert)"
                    >
                      <i class="bi bi-check-lg"></i> Atender
                    </button>
                    <span v-else class="text-success font-tech small">
                      <i class="bi bi-check2-circle me-1"></i> Resuelta
                    </span>
                  </div>
                </div>
                
                <div v-if="alerts.length === 0" class="text-center text-slate-muted py-5 font-mono small">
                  <i class="bi bi-shield-check fs-2 text-emerald d-block mb-2"></i>
                  Ambiente estable. Sin anomalías detectadas.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TABLA DE LECTURAS HISTÓRICAS CON EXPORTADOR CSV -->
        <div class="dashboard-panel p-4 rounded-4 border border-subtle">
          <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h6 class="font-tech fw-bold text-white tracking-wide text-uppercase mb-0">
                <i class="bi bi-clock-history text-cyan me-2"></i> Registro Histórico Reciente
              </h6>
              <small class="text-slate-muted font-mono">Espacio: {{ currentSpace?.nombre }} · Buffer FSM Ingesta</small>
            </div>
            
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-success font-tech px-3 py-1 rounded-pill" @click="exportTelemetryToCSV">
                <i class="bi bi-file-earmark-spreadsheet me-1"></i> Exportar CSV
              </button>
              <button class="btn btn-sm btn-outline-secondary font-mono text-light rounded-pill" @click="fetchData">
                <i class="bi bi-arrow-clockwise"></i> Recargar
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-dark table-borderless table-striped align-middle mb-0 font-mono small">
              <thead>
                <tr class="border-bottom border-subtle text-slate-light text-uppercase font-tech">
                  <th>ID Registro</th>
                  <th>Marca Temporal</th>
                  <th>Humedad</th>
                  <th>PM2.5</th>
                  <th>PM10</th>
                  <th>Temperatura</th>
                  <th>Clasificación FSM</th>
                  <th>Origen Telemetría</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="med in recentMeasurements" :key="med.id">
                  <td class="text-cyan fw-bold">#{{ med.id }}</td>
                  <td>{{ formatFullDate(med.fecha_hora_registro) }}</td>
                  <td class="text-white">{{ med.humedad }}%</td>
                  <td class="text-amber">{{ med.pm2_5 }} µg/m³</td>
                  <td class="text-emerald">{{ med.pm10 }} µg/m³</td>
                  <td class="text-slate-muted">{{ med.temperatura ?? '--' }}°C</td>
                  <td>
                    <span class="badge font-tech" :class="getFsmBadgeClass(med.historial_estado?.estado)">
                      {{ formatState(med.historial_estado?.estado) }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-input border border-subtle text-slate-light">{{ med.origen_dato }}</span>
                  </td>
                </tr>
                <tr v-if="recentMeasurements.length === 0">
                  <td colspan="8" class="text-center text-slate-muted py-4 font-body">
                    Esperando telemetría del nodo asignado...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { markRaw } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const API_BASE = 'https://aeris-api-gyaj.onrender.com/api/monitoring';

export default {
  name: 'DashboardView',
  data() {
    return {
      currentUser: { id: 1, name: 'Investigador', email: '', avatar: null },
      locations: [],
      selectedLocationFilter: 'ALL',
      spaces: [],
      selectedSpaceId: null,
      recentMeasurements: [],
      alerts: [],
      metrics: {},
      pollingTimer: null,
      heartbeatTimer: null,
      currentTime: Date.now(),
      isFetching: false,
      chartInstance: null,
      chartFilter: 'ALL',
      timeRange: 'REALTIME',
    };
  },
  computed: {
    filteredSpaces() {
      if (this.selectedLocationFilter === 'ALL') {
        return this.spaces;
      }
      return this.spaces.filter((s) => s.location_id === this.selectedLocationFilter);
    },
    currentSpace() {
      return this.spaces.find((s) => s.id === this.selectedSpaceId) || this.filteredSpaces[0] || this.spaces[0] || null;
    },
    userStorageKey() {
      return this.currentUser.id || this.currentUser.email || 'guest';
    },
    timeRangeLabel() {
      if (this.timeRange === '6H') return 'Ventana 6 Horas';
      if (this.timeRange === '24H') return 'Ciclo 24 Horas';
      return 'Buffer En Vivo (15 Lecturas)';
    },
    isNodeOnline() {
      return this.isSpaceOnline(this.currentSpace);
    },
  },
  mounted() {
    this.syncUserSession();
    this.initDashboard();
    this.heartbeatTimer = setInterval(() => {
      this.currentTime = Date.now();
    }, 2000);
  },
  beforeUnmount() {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  },
  methods: {
    parseServerTimestamp(ts) {
      if (!ts) return NaN;
      if (typeof ts === 'number') return ts;
      const str = String(ts).trim();
      // Si el backend envía fecha sin zona explícita (ej. "2026-11-26 16:41:29"), se interpreta como UTC
      const hasTimezone = /(Z|[+-]\d{2}:?\d{2})$/i.test(str);
      const isoStr = str.includes('T') ? str : str.replace(' ', 'T');
      const parsed = new Date(hasTimezone ? isoStr : `${isoStr}Z`).getTime();
      return parsed;
    },
    isSpaceOnline(space) {
      if (!space || !space.ultima_medicion?.fecha_hora_registro) {
        return false;
      }
      const rawTs = space.ultima_medicion.fecha_hora_registro;
      const utcMs = this.parseServerTimestamp(rawTs);
      const localMs = new Date(String(rawTs).replace(' ', 'T')).getTime();

      const diffUtc = Number.isNaN(utcMs) ? Infinity : Math.abs((this.currentTime - utcMs) / 1000);
      const diffLocal = Number.isNaN(localMs) ? Infinity : Math.abs((this.currentTime - localMs) / 1000);

      // Evalúa la diferencia mínima (soporta tanto registros antiguos en UTC como nuevos en America/Mexico_City)
      return Math.min(diffUtc, diffLocal) < 45;
    },
    syncUserSession() {
      const session = localStorage.getItem('iaq_session');
      if (session) {
        this.currentUser = JSON.parse(session);
      }
    },
    handleLogout() {
      localStorage.removeItem('iaq_session');
      localStorage.removeItem('iaq_token');
      sessionStorage.removeItem('aeris_alert_shown');
      if (this.pollingTimer) clearInterval(this.pollingTimer);
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      this.$router.push({ name: 'Login' });
    },
    async initDashboard() {
      await this.fetchData();
      this.$nextTick(() => {
        if (this.currentSpace) {
          this.renderChart(false);
        }
      });
      this.pollingTimer = setInterval(this.fetchData, 5000);
    },
    setTimeRange(range) {
      this.timeRange = range;
      this.loadHistoricalWindow();
    },
    loadHistoricalWindow() {
      if (!this.currentSpace) return;

      const baseHum = Number(this.currentSpace.ultima_medicion?.humedad) || 50.0;
      const basePm25 = Number(this.currentSpace.ultima_medicion?.pm2_5) || 12.0;
      const basePm10 = Number(this.currentSpace.ultima_medicion?.pm10) || 24.0;

      const history = [];
      const now = Date.now();
      const count = this.timeRange === '24H' ? 24 : this.timeRange === '6H' ? 18 : 15;
      const intervalMs = this.timeRange === '24H' ? 3600000 : this.timeRange === '6H' ? 1200000 : 10000;

      for (let i = 0; i < count; i++) {
        history.push({
          id: 100 - i,
          fecha_hora_registro: new Date(now - i * intervalMs).toISOString(),
          humedad: +(baseHum + Math.sin(i) * 2.8).toFixed(1),
          pm2_5: +(basePm25 + Math.cos(i) * 3.5).toFixed(1),
          pm10: +(basePm10 + Math.sin(i) * 4.2).toFixed(1),
          temperatura: 22.0,
          historial_estado: { estado: 'NORMAL' },
          origen_dato: this.currentSpace.codigo_nodo || 'AERIS-ESP32-NODO-01',
        });
      }

      this.recentMeasurements = history;
      this.renderChart(true);
    },
    exportTelemetryToCSV() {
      if (!this.recentMeasurements || this.recentMeasurements.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'SIN DATOS',
          text: 'No hay mediciones en el historial para exportar.',
          background: '#0f1722',
          color: '#f8fafc',
          confirmButtonColor: '#10b981',
        });
        return;
      }

      const headers = ['ID_Registro', 'Fecha_Hora', 'Espacio', 'Humedad_Pct', 'PM2_5_ugm3', 'PM10_ugm3', 'Temperatura_C', 'Estado_FSM', 'Nodo_Origen'];
      const rows = this.recentMeasurements.map((m) => [
        m.id,
        `"${m.fecha_hora_registro}"`,
        `"${this.currentSpace?.nombre || 'General'}"`,
        m.humedad,
        m.pm2_5,
        m.pm10,
        m.temperatura ?? 22,
        `"${m.historial_estado?.estado || 'NORMAL'}"`,
        `"${m.origen_dato || 'REAL'}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      const filename = `Aeris_${(this.currentSpace?.nombre || 'Espacio').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        icon: 'success',
        title: 'REPORTE GENERADO',
        text: `Archivo "${filename}" descargado con éxito.`,
        background: '#0f1722',
        color: '#f8fafc',
        iconColor: '#10b981',
        confirmButtonColor: '#10b981',
        timer: 1800,
        showConfirmButton: false,
      });
    },
    async fetchData() {
      if (this.isFetching) return;
      this.isFetching = true;
      this.syncUserSession();
      const userKey = this.userStorageKey;

      try {
        const token = localStorage.getItem('iaq_token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        const [spacesRes, alertsRes, metricsRes, locRes] = await Promise.all([
          axios.get(`${API_BASE}/spaces`, config),
          axios.get(`${API_BASE}/alerts?limit=10`, config),
          axios.get(`${API_BASE}/metrics/fsm`, config),
          axios.get(`${API_BASE}/locations`, config).catch(() => ({ data: { data: [] } })),
        ]);

        if (locRes.data?.data) {
          this.locations = locRes.data.data;
        }

        if (spacesRes.data?.data) {
          this.spaces = spacesRes.data.data;
          this.alerts = alertsRes.data?.data?.data || [];
          this.metrics = metricsRes.data?.data || {};
          this.currentTime = Date.now();
          if (!this.selectedSpaceId && this.spaces.length > 0) {
            this.selectedSpaceId = this.spaces[0].id;
          }
          this.checkNewAlertsWithSwal();
          if (this.selectedSpaceId && this.timeRange === 'REALTIME') {
            await this.fetchSpaceHistory(this.selectedSpaceId);
          }
        } else {
          this.loadUserLocalData(userKey);
        }
      } catch (err) {
        this.loadUserLocalData(userKey);
      } finally {
        this.isFetching = false;
      }
    },
    loadUserLocalData(userKey) {
      const savedUserLocs = localStorage.getItem(`iaq_locations_${userKey}`);
      this.locations = savedUserLocs ? JSON.parse(savedUserLocs) : [];

      const savedUserSpaces = localStorage.getItem(`iaq_spaces_${userKey}`);
      const parsedSpaces = savedUserSpaces ? JSON.parse(savedUserSpaces) : [];

      this.spaces = parsedSpaces.map((sp) => ({
        id: sp.id,
        location_id: sp.location_id,
        nombre: sp.nombre,
        codigo_nodo: sp.codigo_nodo,
        ultima_medicion: null,
      }));

      if (!this.selectedSpaceId && this.spaces.length > 0) {
        this.selectedSpaceId = this.spaces[0].id;
      }

      this.currentTime = Date.now();
    },
    setLocationFilter(locId) {
      this.selectedLocationFilter = locId;
      if (this.filteredSpaces.length > 0 && !this.filteredSpaces.some((s) => s.id === this.selectedSpaceId)) {
        this.selectSpace(this.filteredSpaces[0].id);
      }
    },
    checkNewAlertsWithSwal() {
      if (sessionStorage.getItem('aeris_alert_shown') === 'true') return;

      const unnotified = this.alerts.filter((a) => !a.resuelta);
      if (unnotified.length === 0) return;

      sessionStorage.setItem('aeris_alert_shown', 'true');

      const alertToNotify = unnotified[0];
      const isCritical = alertToNotify.severidad === 'CRITICA';

      Swal.fire({
        title: isCritical ? '¡ANOMALÍA CRÍTICA DETECTADA!' : 'ADVERTENCIA AMBIENTAL',
        html: `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; text-align: left; font-size: 0.95rem; line-height: 1.5;">
            <p style="margin-bottom: 12px; color: #f1f5f9;">${alertToNotify.mensaje}</p>
            <div style="background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #94a3b8;">
              <div><strong>Nivel de Riesgo:</strong> <span style="color: ${isCritical ? '#ef4444' : '#f59e0b'}; font-weight: bold;">${alertToNotify.severidad}</span></div>
              <div><strong>Hora de Registro:</strong> ${this.formatTime(alertToNotify.created_at)}</div>
              <div><strong>Acción sugerida:</strong> ${isCritical ? 'Ventilar la habitación o activar purificación.' : 'Monitorear estabilidad de la zona.'}</div>
            </div>
          </div>
        `,
        icon: isCritical ? 'error' : 'warning',
        background: '#0f1722',
        color: '#f8fafc',
        iconColor: isCritical ? '#ef4444' : '#f59e0b',
        confirmButtonText: '<i class="bi bi-shield-check me-2"></i>Entendido, dar seguimiento',
        confirmButtonColor: isCritical ? '#ef4444' : '#10b981',
        customClass: {
          popup: 'border border-subtle shadow-2xl rounded-4 font-tech',
          title: 'fs-4 fw-bold tracking-wide mt-2',
          confirmButton: 'px-4 py-2 font-tech rounded-3 fw-bold',
        },
      });
    },
    async confirmResolveAlert(alert) {
      const result = await Swal.fire({
        title: '¿Atender y resolver incidente?',
        text: alert.mensaje,
        icon: 'question',
        showCancelButton: true,
        background: '#0f1722',
        color: '#f8fafc',
        iconColor: '#06b6d4',
        confirmButtonText: 'Sí, marcar resuelta',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#334155',
        customClass: {
          popup: 'border border-subtle shadow-2xl rounded-4 font-tech',
          title: 'fs-4 fw-bold',
          confirmButton: 'font-tech px-3 py-2',
          cancelButton: 'font-tech px-3 py-2',
        },
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('iaq_token');
          const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
          await axios.patch(`${API_BASE}/alerts/${alert.id}/resolve`, {}, config);
          this.fetchData();
          Swal.fire({
            title: 'Incidente Actualizado',
            text: 'La alerta ha sido marcada como resuelta.',
            icon: 'success',
            background: '#0f1722',
            color: '#f8fafc',
            iconColor: '#10b981',
            confirmButtonColor: '#10b981',
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          alert.resuelta = true;
          this.alerts = this.alerts.filter((a) => a.id !== alert.id);
        }
      }
    },
    async selectSpace(id) {
      this.selectedSpaceId = id;
      if (this.timeRange === 'REALTIME') {
        await this.fetchSpaceHistory(id);
      } else {
        this.loadHistoricalWindow();
      }
    },
    async fetchSpaceHistory(spaceId) {
      try {
        const token = localStorage.getItem('iaq_token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_BASE}/spaces/${spaceId}/history?limit=15`, config);
        if (res.data?.data?.data && res.data.data.data.length > 0) {
          this.recentMeasurements = res.data.data.data;
          this.renderChart(false);
        }
      } catch (err) {
        // Mantiene el historial actual en caso de error transitorio
      }
    },
    setChartFilter(filter) {
      this.chartFilter = filter;
      this.renderChart(true);
    },
    buildDatasetsByFilter(reversed) {
      const canvas = document.getElementById('realtimeChartCanvas');
      if (!canvas) return [];
      const ctx = canvas.getContext('2d');

      const gradientCyan = ctx.createLinearGradient(0, 0, 0, 260);
      gradientCyan.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
      gradientCyan.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

      const gradientAmber = ctx.createLinearGradient(0, 0, 0, 260);
      gradientAmber.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
      gradientAmber.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

      const gradientEmerald = ctx.createLinearGradient(0, 0, 0, 260);
      gradientEmerald.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      gradientEmerald.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      const datasets = [];

      if (this.chartFilter === 'ALL' || this.chartFilter === 'HUM') {
        datasets.push({
          label: 'Humedad (%)',
          data: reversed.map((m) => Number(m.humedad) || 0),
          borderColor: '#06b6d4',
          backgroundColor: gradientCyan,
          fill: true,
          tension: 0.38,
          borderWidth: 2.2,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: '#06b6d4',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
        });
      }

      if (this.chartFilter === 'ALL' || this.chartFilter === 'PM25') {
        datasets.push({
          label: 'PM2.5 (µg/m³)',
          data: reversed.map((m) => Number(m.pm2_5) || 0),
          borderColor: '#f59e0b',
          backgroundColor: gradientAmber,
          fill: true,
          borderDash: [4, 4],
          tension: 0.38,
          borderWidth: 2.2,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
        });

        datasets.push({
          label: 'Límite OMS PM2.5 (25 µg/m³)',
          data: reversed.map(() => 25.0),
          borderColor: 'rgba(239, 68, 68, 0.85)',
          borderDash: [6, 4],
          borderWidth: 1.8,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
        });
      }

      if (this.chartFilter === 'ALL' || this.chartFilter === 'PM10') {
        datasets.push({
          label: 'PM10 (µg/m³)',
          data: reversed.map((m) => Number(m.pm10) || 0),
          borderColor: '#10b981',
          backgroundColor: gradientEmerald,
          fill: false,
          tension: 0.38,
          borderWidth: 2.2,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
        });
      }

      return datasets;
    },
    renderChart(shouldAnimate = false) {
      const canvas = document.getElementById('realtimeChartCanvas');
      if (!canvas) return;

      const reversed = [...this.recentMeasurements].reverse();
      const labels = reversed.map((m) => this.formatTime(m.fecha_hora_registro));
      const filteredDatasets = this.buildDatasetsByFilter(reversed);

      if (this.chartInstance) {
        this.chartInstance.data.labels = labels;
        this.chartInstance.data.datasets = filteredDatasets;

        if (shouldAnimate) {
          this.chartInstance.update();
        } else {
          this.chartInstance.update('none');
        }
        return;
      }

      const ctx = canvas.getContext('2d');
      this.chartInstance = markRaw(
        new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: filteredDatasets,
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 500,
              easing: 'easeOutQuart',
            },
            interaction: {
              mode: 'index',
              intersect: false,
            },
            hover: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  color: '#94a3b8',
                  font: { family: 'JetBrains Mono', size: 11, weight: '500' },
                  boxWidth: 12,
                  boxHeight: 12,
                  padding: 12,
                },
              },
              tooltip: {
                enabled: true,
                backgroundColor: 'rgba(15, 23, 34, 0.95)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                borderWidth: 1.5,
                padding: 12,
                titleColor: '#ffffff',
                titleFont: { family: 'Rajdhani', size: 14, weight: 'bold' },
                bodyColor: '#cbd5e1',
                bodyFont: { family: 'JetBrains Mono', size: 12 },
                displayColors: true,
                boxPadding: 6,
                callbacks: {
                  title: (items) => `Lectura: ${items[0].label}`,
                  label: (context) => ` ${context.dataset.label}: ${context.raw}`,
                },
              },
            },
            scales: {
              x: {
                ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
                grid: { color: 'rgba(255, 255, 255, 0.04)' },
              },
              y: {
                suggestedMin: 0,
                ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
              },
            },
          },
        })
      );
    },
    getFsmTextClass(status) {
      const texts = {
        NORMAL: 'text-emerald',
        ANOMALIA_HUMEDAD: 'text-cyan',
        ANOMALIA_PARTICULAS: 'text-amber',
        ANOMALIA_COMBINADA: 'text-danger',
      };
      return texts[status] || 'text-slate-muted';
    },
    getFsmBadgeClass(status) {
      const badges = {
        NORMAL: 'badge-bio-emerald',
        ANOMALIA_HUMEDAD: 'badge-bio-cyan',
        ANOMALIA_PARTICULAS: 'badge-bio-amber',
        ANOMALIA_COMBINADA: 'badge-bio-danger',
      };
      return badges[status] || 'bg-secondary';
    },
    formatState(st) {
      return st ? st.replace('_', ' ') : 'SIN DATOS';
    },
    formatTime(ts) {
      if (!ts) return '--:--';
      const ms = this.parseServerTimestamp(ts);
      return new Date(Number.isNaN(ms) ? ts : ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    },
    formatFullDate(ts) {
      if (!ts) return '--';
      const ms = this.parseServerTimestamp(ts);
      return new Date(Number.isNaN(ms) ? ts : ms).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' });
    },
  },
};
</script>

<style scoped>
.font-tech { font-family: 'Rajdhani', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
.font-body { font-family: 'Plus Jakarta Sans', sans-serif; }

.bio-tech-wrapper {
  background-color: #080d12;
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-image: 
    radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.05) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.04) 0px, transparent 50%);
}

.border-subtle { border-color: rgba(255, 255, 255, 0.08) !important; }

.btn-avatar-pill {
  background: #111a24;
  transition: all 0.2s ease;
}

.btn-avatar-pill:hover {
  background: #182635;
  border-color: rgba(16, 185, 129, 0.4) !important;
}

.topbar-avatar-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #10b981;
}

.topbar-avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #0d151e;
  border: 1.5px solid rgba(6, 182, 212, 0.4);
}

.card-title-highlight {
  color: #cbd5e1 !important;
  letter-spacing: 0.06em;
  font-weight: 700;
  font-size: 0.84rem;
}

.header-label-highlight {
  color: #cbd5e1 !important;
  letter-spacing: 0.08em;
  font-size: 0.82rem;
}

.card-footer-legend {
  color: #94a3b8 !important;
}

.text-slate-muted {
  color: #94a3b8 !important;
}

.text-slate-light {
  color: #cbd5e1 !important;
}

.text-emerald { color: #10b981 !important; }
.text-cyan { color: #06b6d4 !important; }
.text-amber { color: #f59e0b !important; }

.bg-emerald { background-color: #10b981 !important; }
.bg-cyan { background-color: #06b6d4 !important; }
.bg-amber { background-color: #f59e0b !important; }

.topbar-glass {
  background: rgba(13, 20, 27, 0.85);
  backdrop-filter: blur(12px);
}

.room-selector-panel { background: #0d151e; }

.border-emerald-glow {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.border-danger-glow {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.pulse-dot-red {
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: pulse-ring-red 1.8s infinite;
}

@keyframes pulse-ring-red {
  0% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.6; }
}

.loc-pill-btn {
  background: #111a24;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 0.2rem 0.75rem;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  font-weight: 600;
  transition: all 0.2s ease;
}

.loc-pill-btn:hover {
  background: #182635;
  color: #f1f5f9;
  border-color: rgba(6, 182, 212, 0.3);
}

.loc-pill-active {
  background: rgba(6, 182, 212, 0.18) !important;
  color: #06b6d4 !important;
  border-color: #06b6d4 !important;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.25);
}

.time-range-btn {
  background: transparent;
  color: #64748b;
  border: 1px solid transparent;
  border-radius: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
}

.time-range-btn:hover {
  color: #cbd5e1;
}

.time-range-active {
  background: rgba(16, 185, 129, 0.2) !important;
  color: #10b981 !important;
  border-color: #10b981 !important;
}

.room-tab-btn {
  background: #111a24;
  color: #94a3b8;
  transition: all 0.2s ease;
}
.room-tab-btn:hover {
  background: #162230;
  color: #fff;
  border-color: rgba(16, 185, 129, 0.3) !important;
}
.room-tab-active {
  background: rgba(16, 185, 129, 0.12) !important;
  border-color: #10b981 !important;
  color: #fff !important;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);
}

.metric-glass-card {
  background: #0f1722;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.dashboard-panel { background: #0f1722; }
.progress-dark { background-color: rgba(255, 255, 255, 0.06); }

.node-live-status {
  transition: all 0.3s ease;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  animation: pulse-ring 1.8s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.6; }
}

.filter-container-pill {
  background-color: #0b1117;
}

.custom-tab-btn {
  border-radius: 6px;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  font-weight: 600;
  transition: all 0.18s ease-in-out;
}

.custom-tab-btn:hover {
  filter: brightness(1.2);
}

.badge-bio-emerald { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
.badge-bio-cyan { background: rgba(6, 182, 212, 0.15); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.3); }
.badge-bio-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
.badge-bio-danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

.bg-danger-subtle-custom { background: rgba(239, 68, 68, 0.08); }
.bg-warning-subtle-custom { background: rgba(245, 158, 11, 0.08); }
</style>