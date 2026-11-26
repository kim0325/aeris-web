<template>
  <div class="position-relative w-100 h-100 d-flex flex-column">
    <!-- Selector de variables a visualizar -->
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div class="btn-group btn-group-sm" role="group">
        <button 
          type="button" 
          class="btn font-tech btn-filter" 
          :class="{ active: activeSeries === 'ALL' }" 
          @click="setSeries('ALL')"
        >
          TODAS
        </button>
        <button 
          type="button" 
          class="btn font-tech btn-filter text-cyan" 
          :class="{ active: activeSeries === 'HUM' }" 
          @click="setSeries('HUM')"
        >
          HUMEDAD
        </button>
        <button 
          type="button" 
          class="btn font-tech btn-filter text-amber" 
          :class="{ active: activeSeries === 'PM25' }" 
          @click="setSeries('PM25')"
        >
          PM2.5
        </button>
        <button 
          type="button" 
          class="btn font-tech btn-filter text-emerald" 
          :class="{ active: activeSeries === 'PM10' }" 
          @click="setSeries('PM10')"
        >
          PM10
        </button>
      </div>

      <div class="form-check form-switch small font-mono text-muted d-none d-sm-block">
        <input class="form-check-input" type="checkbox" v-model="showThresholds" id="switchThresholds">
        <label class="form-check-label" for="switchThresholds">Límites OMS</label>
      </div>
    </div>

    <!-- Contenedor del Canvas de Chart.js -->
    <div class="chart-canvas-container flex-grow-1 position-relative">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'RealtimeTelemetryChart',
  props: {
    measurements: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      chartInstance: null,
      activeSeries: 'ALL',
      showThresholds: true,
    };
  },
  watch: {
    measurements: {
      deep: true,
      handler() {
        this.updateChart();
      },
    },
    activeSeries() {
      this.updateChart();
    },
    showThresholds() {
      this.updateChart();
    },
  },
  mounted() {
    this.initChart();
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  },
  methods: {
    setSeries(series) {
      this.activeSeries = series;
    },
    initChart() {
      const ctx = this.$refs.chartCanvas.getContext('2d');

      // Gradientes dinámicos para el área sombreada
      const gradientCyan = ctx.createLinearGradient(0, 0, 0, 300);
      gradientCyan.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      gradientCyan.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

      const gradientAmber = ctx.createLinearGradient(0, 0, 0, 300);
      gradientAmber.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
      gradientAmber.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

      const gradientEmerald = ctx.createLinearGradient(0, 0, 0, 300);
      gradientEmerald.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      gradientEmerald.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              id: 'hum',
              label: 'Humedad (%)',
              data: [],
              borderColor: '#06b6d4',
              backgroundColor: gradientCyan,
              fill: true,
              tension: 0.38,
              borderWidth: 2.2,
              pointRadius: 3,
              pointHoverRadius: 6,
              pointBackgroundColor: '#06b6d4',
            },
            {
              id: 'pm25',
              label: 'PM2.5 (µg/m³)',
              data: [],
              borderColor: '#f59e0b',
              backgroundColor: gradientAmber,
              fill: true,
              tension: 0.38,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
              pointBackgroundColor: '#f59e0b',
            },
            {
              id: 'pm10',
              label: 'PM10 (µg/m³)',
              data: [],
              borderColor: '#10b981',
              backgroundColor: gradientEmerald,
              fill: false,
              tension: 0.38,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
              pointBackgroundColor: '#10b981',
            },
            // Línea de umbral OMS PM2.5 (25 ug/m3)
            {
              id: 'limit_pm25',
              label: 'Límite PM2.5 (25 µg/m³)',
              data: [],
              borderColor: 'rgba(239, 68, 68, 0.7)',
              borderDash: [6, 4],
              borderWidth: 1.5,
              pointRadius: 0,
              fill: false,
            },
            // Línea de umbral OMS Humedad Máxima (60%)
            {
              id: 'limit_hum',
              label: 'Límite Humedad (60%)',
              data: [],
              borderColor: 'rgba(56, 189, 248, 0.5)',
              borderDash: [4, 4],
              borderWidth: 1.2,
              pointRadius: 0,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 600 },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              display: false, // Controlado manualmente por los botones superiores
            },
            tooltip: {
              backgroundColor: '#0f1722',
              titleColor: '#e2e8f0',
              bodyColor: '#cbd5e1',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              padding: 10,
              titleFont: { family: 'JetBrains Mono', size: 12 },
              bodyFont: { family: 'JetBrains Mono', size: 11 },
              boxPadding: 4,
            },
          },
          scales: {
            x: {
              ticks: {
                color: '#64748b',
                font: { family: 'JetBrains Mono', size: 10 },
                maxRotation: 0,
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.04)',
              },
            },
            y: {
              suggestedMin: 0,
              suggestedMax: 100,
              ticks: {
                color: '#64748b',
                font: { family: 'JetBrains Mono', size: 10 },
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.05)',
              },
            },
          },
        },
      });

      this.updateChart();
    },
    updateChart() {
      if (!this.chartInstance) return;

      const reversed = [...this.measurements].reverse();
      const labels = reversed.map((m) => {
        const d = new Date(m.fecha_hora_registro);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      });

      this.chartInstance.data.labels = labels;

      // Asignar datos de series
      this.chartInstance.data.datasets.forEach((ds) => {
        if (ds.id === 'hum') {
          ds.data = reversed.map((m) => m.humedad);
          ds.hidden = this.activeSeries !== 'ALL' && this.activeSeries !== 'HUM';
        } else if (ds.id === 'pm25') {
          ds.data = reversed.map((m) => m.pm2_5);
          ds.hidden = this.activeSeries !== 'ALL' && this.activeSeries !== 'PM25';
        } else if (ds.id === 'pm10') {
          ds.data = reversed.map((m) => m.pm10);
          ds.hidden = this.activeSeries !== 'ALL' && this.activeSeries !== 'PM10';
        } else if (ds.id === 'limit_pm25') {
          ds.data = reversed.map(() => 25.0);
          ds.hidden = !this.showThresholds || (this.activeSeries !== 'ALL' && this.activeSeries !== 'PM25');
        } else if (ds.id === 'limit_hum') {
          ds.data = reversed.map(() => 60.0);
          ds.hidden = !this.showThresholds || (this.activeSeries !== 'ALL' && this.activeSeries !== 'HUM');
        }
      });

      this.chartInstance.update();
    },
  },
};
</script>

<style scoped>
.chart-canvas-container {
  min-height: 240px;
}

.btn-filter {
  background-color: #0b1117;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  padding: 0.2rem 0.65rem;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
}

.btn-filter:hover {
  background-color: #16202c;
  color: #fff;
}

.btn-filter.active {
  background-color: rgba(16, 185, 129, 0.18);
  border-color: #10b981;
  color: #fff;
}
</style>