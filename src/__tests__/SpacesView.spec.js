import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SpacesView from '@/views/SpacesView.vue';

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

describe('SpacesView.vue', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      'iaq_session',
      JSON.stringify({ id: 42, name: 'Kimberly', email: 'kim@itsm.edu.mx' })
    );

    wrapper = mount(SpacesView, {
      global: {
        stubs: ['router-link'],
      },
    });
  });

  it('carga la sesión del usuario autenticado', () => {
    expect(wrapper.vm.currentUser.name).toBe('Kimberly');
    expect(wrapper.vm.userStorageKey).toBe(42);
  });

  it('permite registrar un nuevo lugar residencial', async () => {
    await wrapper.setData({
      newLocation: {
        nombre: 'Casa de Mamá',
        direccion: 'Misantla Centro',
      },
    });

    await wrapper.vm.createLocation();

    expect(wrapper.vm.locations.length).toBe(1);
    expect(wrapper.vm.locations[0].nombre).toBe('Casa de Mamá');

    const saved = JSON.parse(localStorage.getItem('iaq_locations_42'));
    expect(saved.length).toBe(1);
    expect(saved[0].nombre).toBe('Casa de Mamá');
  });

  it('permite vincular una habitación a la residencia activa', async () => {
    await wrapper.setData({
      locations: [{ id: 10, nombre: 'Residencia Principal' }],
      selectedLocationId: 10,
      newSpace: {
        nombre: 'Laboratorio IoT',
        codigo_nodo: 'ESP32-LAB-01',
      },
    });

    await wrapper.vm.createSpace();

    expect(wrapper.vm.allSpaces.length).toBe(1);
    expect(wrapper.vm.allSpaces[0].nombre).toBe('Laboratorio IoT');
    expect(wrapper.vm.allSpaces[0].location_id).toBe(10);
  });
});