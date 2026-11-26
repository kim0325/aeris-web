import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

// Mock completo de Chart.js con funciones estáticas
vi.mock('chart.js', () => {
  const ChartMock = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    data: { labels: [], datasets: [] },
  }));
  ChartMock.register = vi.fn();

  return {
    Chart: ChartMock,
    registerables: [],
  };
});

// Mock de SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

import DashboardView from '@/views/DashboardView.vue';

describe('DashboardView.vue', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      'iaq_session',
      JSON.stringify({ id: 1, name: 'Investigador', email: 'test@iaq.com' })
    );

    wrapper = shallowMount(DashboardView, {
      global: {
        stubs: ['router-link'],
      },
    });
  });

  it('asigna la clase CSS correcta según el estado de la FSM', () => {
    expect(wrapper.vm.getFsmTextClass('NORMAL')).toBe('text-emerald');
    expect(wrapper.vm.getFsmTextClass('ANOMALIA_HUMEDAD')).toBe('text-cyan');
    expect(wrapper.vm.getFsmTextClass('ANOMALIA_PARTICULAS')).toBe('text-amber');
    expect(wrapper.vm.getFsmTextClass('ANOMALIA_COMBINADA')).toBe('text-danger');
  });

  it('filtra los espacios según la residencia seleccionada', async () => {
    await wrapper.setData({
      selectedLocationFilter: 'ALL',
      spaces: [
        { id: 1, location_id: 10, nombre: 'Sala' },
        { id: 2, location_id: 10, nombre: 'Cocina' },
        { id: 3, location_id: 20, nombre: 'Taller' },
      ],
    });

    expect(wrapper.vm.filteredSpaces.length).toBe(3);

    wrapper.vm.setLocationFilter(10);
    expect(wrapper.vm.filteredSpaces.length).toBe(2);
    expect(wrapper.vm.filteredSpaces.map((s) => s.nombre)).toEqual(['Sala', 'Cocina']);
  });

  it('detecta correctamente el estado de latido (Online / Offline)', async () => {
    // Caso 1: Latido reciente (< 12 segundos)
    await wrapper.setData({
      lastHeartbeatTime: Date.now(),
      spaces: [{ id: 1, nombre: 'Nodo 1' }],
      selectedSpaceId: 1,
    });
    expect(wrapper.vm.isNodeOnline).toBe(true);

    // Caso 2: Más de 15 segundos sin recibir datos
    await wrapper.setData({
      lastHeartbeatTime: Date.now() - 15000,
    });
    expect(wrapper.vm.isNodeOnline).toBe(false);
  });

  it('ajusta la cantidad de muestras al cambiar la ventana temporal', async () => {
    await wrapper.setData({
      spaces: [{ id: 1, nombre: 'Recámara', ultima_medicion: { humedad: 50, pm2_5: 15, pm10: 30 } }],
      selectedSpaceId: 1,
    });

    wrapper.vm.setTimeRange('24H');
    expect(wrapper.vm.recentMeasurements.length).toBe(24);
    expect(wrapper.vm.timeRangeLabel).toBe('Ciclo 24 Horas');

    wrapper.vm.setTimeRange('6H');
    expect(wrapper.vm.recentMeasurements.length).toBe(18);
    expect(wrapper.vm.timeRangeLabel).toBe('Ventana 6 Horas');
  });
});