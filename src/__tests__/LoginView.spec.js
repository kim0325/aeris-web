import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginView from '@/views/LoginView.vue';
import Swal from 'sweetalert2';

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

describe('LoginView.vue', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.clear();
    wrapper = mount(LoginView, {
      global: {
        mocks: {
          $router: { push: vi.fn() },
        },
      },
    });
  });

  it('inicia por defecto en modo inicio de sesión', () => {
    expect(wrapper.vm.mode).toBe('login');
    expect(wrapper.text()).toContain('INICIAR SESIÓN');
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
  });

  it('conmuta correctamente a la pestaña de registro', async () => {
    const registerTabBtn = wrapper.findAll('.auth-tab-btn')[1];
    await registerTabBtn.trigger('click');

    expect(wrapper.vm.mode).toBe('register');
    expect(wrapper.text()).toContain('Confirmar Contraseña');
  });

  it('bloquea el registro y lanza advertencia si las contraseñas no coinciden', async () => {
    await wrapper.setData({
      mode: 'register',
      registerForm: {
        name: 'Kimberly',
        email: 'kimberly@example.com',
        password: 'password123',
        password_confirmation: 'otraPassword',
      },
    });

    await wrapper.vm.handleRegister();

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'warning',
        title: 'ERROR DE VALIDACIÓN',
      })
    );
  });

  it('guarda la sesión en localStorage al iniciar sesión', async () => {
    await wrapper.setData({
      loginForm: {
        email: 'investigador@itsm.edu.mx',
        password: 'adminPassword',
      },
    });

    await wrapper.vm.handleLogin();

    const session = JSON.parse(localStorage.getItem('iaq_session'));
    expect(session).toBeTruthy();
    expect(session.email).toBe('investigador@itsm.edu.mx');
  });
});