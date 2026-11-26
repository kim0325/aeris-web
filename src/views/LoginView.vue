<template>
  <div class="bio-tech-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3 text-light">
    <div class="auth-card p-4 p-md-5 rounded-4 shadow-2xl">
      <!-- Encabezado Bio-Tech -->
      <div class="text-center mb-4">
        <div class="bio-badge-icon mb-3 mx-auto">
          <i class="bi bi-shield-shaded fs-1 text-emerald"></i>
        </div>
        <span class="tech-sub-title text-emerald tracking-widest d-block small font-tech">SISTEMA IoT RESIDENCIAL</span>
        <h2 class="tech-heading fw-bold mt-1 mb-0 text-white font-tech">BioIAQ Console</h2>
        <p class="text-slate-muted small mt-1 font-body">Estación de Calidad del Aire Interior · Misantla</p>
      </div>

      <!-- Selector de Modo: Login / Registro -->
      <div class="auth-tabs d-flex p-1 rounded-3 border border-subtle mb-4">
        <button 
          type="button" 
          class="btn btn-sm w-50 font-tech fw-bold auth-tab-btn" 
          :class="{ 'auth-tab-active': mode === 'login' }"
          @click="setMode('login')"
        >
          <i class="bi bi-box-arrow-in-right me-1"></i> INICIAR SESIÓN
        </button>
        <button 
          type="button" 
          class="btn btn-sm w-50 font-tech fw-bold auth-tab-btn" 
          :class="{ 'auth-tab-active': mode === 'register' }"
          @click="setMode('register')"
        >
          <i class="bi bi-person-plus me-1"></i> REGISTRO
        </button>
      </div>

      <!-- FORMULARIO DE INICIO DE SESIÓN -->
      <form v-if="mode === 'login'" @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label text-slate-light small text-uppercase font-tech fw-bold">Correo Institucional / Usuario</label>
          <div class="input-group">
            <span class="input-group-text bg-input-slot border-subtle text-emerald"><i class="bi bi-person-badge"></i></span>
            <input 
              type="email" 
              class="form-control bg-input border-subtle text-light font-body" 
              v-model="loginForm.email" 
              required 
              placeholder="investigador@itssmt.edu.mx"
              :disabled="loading"
            >
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label text-slate-light small text-uppercase font-tech fw-bold">Contraseña de Acceso</label>
          <div class="input-group">
            <span class="input-group-text bg-input-slot border-subtle text-emerald"><i class="bi bi-key"></i></span>
            <input 
              type="password" 
              class="form-control bg-input border-subtle text-light font-body" 
              v-model="loginForm.password" 
              required 
              placeholder="••••••••"
              :disabled="loading"
            >
          </div>
        </div>

        <button type="submit" class="btn btn-bio-emerald w-100 py-2 fw-bold font-tech tracking-wide" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-power me-2"></i> ENLAZAR CONSOLA
        </button>
      </form>

      <!-- FORMULARIO DE REGISTRO DE USUARIO -->
      <form v-else @submit.prevent="handleRegister">
        <div class="mb-3">
          <label class="form-label text-slate-light small text-uppercase font-tech fw-bold">Nombre Completo</label>
          <div class="input-group">
            <span class="input-group-text bg-input-slot border-subtle text-emerald"><i class="bi bi-person"></i></span>
            <input 
              type="text" 
              class="form-control bg-input border-subtle text-light font-body" 
              v-model="registerForm.name" 
              required 
              placeholder="Ing. Investigador"
              :disabled="loading"
            >
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label text-slate-light small text-uppercase font-tech fw-bold">Correo Electrónico</label>
          <div class="input-group">
            <span class="input-group-text bg-input-slot border-subtle text-emerald"><i class="bi bi-envelope"></i></span>
            <input 
              type="email" 
              class="form-control bg-input border-subtle text-light font-body" 
              v-model="registerForm.email" 
              required 
              placeholder="investigador@itssmt.edu.mx"
              :disabled="loading"
            >
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label text-slate-light small text-uppercase font-tech fw-bold">Contraseña</label>
          <div class="input-group">
            <span class="input-group-text bg-input-slot border-subtle text-emerald"><i class="bi bi-shield-lock"></i></span>
            <input 
              type="password" 
              class="form-control bg-input border-subtle text-light font-body" 
              v-model="registerForm.password" 
              required 
              minlength="6"
              placeholder="Mínimo 6 caracteres"
              :disabled="loading"
            >
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label text-slate-light small text-uppercase font-tech fw-bold">Confirmar Contraseña</label>
          <div class="input-group">
            <span class="input-group-text bg-input-slot border-subtle text-emerald"><i class="bi bi-check2-circle"></i></span>
            <input 
              type="password" 
              class="form-control bg-input border-subtle text-light font-body" 
              v-model="registerForm.password_confirmation" 
              required 
              placeholder="Repite la contraseña"
              :disabled="loading"
            >
          </div>
        </div>

        <button type="submit" class="btn btn-bio-cyan w-100 py-2 fw-bold font-tech tracking-wide" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-person-check me-2"></i> REGISTRAR Y ENLAZAR
        </button>
      </form>

      <!-- Pie de Seguridad -->
      <div class="text-center mt-4 pt-3 border-top border-subtle font-mono text-slate-muted" style="font-size: 0.72rem;">
        <i class="bi bi-lock me-1 text-emerald"></i> Ingesta y control con cifrado de nodo TLS 1.3
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

const API_AUTH = 'https://aeris-api-gyaj.onrender.com/api';

export default {
  name: 'LoginView',
  data() {
    return {
      mode: 'login',
      loading: false,
      loginForm: {
        email: '',
        password: '',
      },
      registerForm: {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      },
    };
  },
  methods: {
    setMode(newMode) {
      this.mode = newMode;
    },

    async handleLogin() {
      this.loading = true;
      try {
        const response = await axios.post(`${API_AUTH}/login`, {
          email: this.loginForm.email,
          password: this.loginForm.password,
        });

        const userData = response.data?.user || {
          id: response.data?.user?.id || Date.now(),
          name: this.loginForm.email.split('@')[0],
          email: this.loginForm.email,
          avatar: null,
        };
        const token = response.data?.token || 'mock_token_' + Date.now();

        localStorage.setItem('iaq_session', JSON.stringify(userData));
        localStorage.setItem('iaq_token', token);

        await Swal.fire({
          icon: 'success',
          title: 'CONEXIÓN ESTABLECIDA',
          text: `Bienvenida/o a la estación, ${userData.name}`,
          background: '#0f1722',
          color: '#f8fafc',
          iconColor: '#10b981',
          confirmButtonColor: '#10b981',
          timer: 1500,
          showConfirmButton: false,
        });

        this.$router.push({ name: 'Dashboard' });
      } catch (error) {
        if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
          const fallbackUser = {
            id: 1,
            name: this.loginForm.email.split('@')[0],
            email: this.loginForm.email,
            avatar: null,
          };
          localStorage.setItem('iaq_session', JSON.stringify(fallbackUser));
          localStorage.setItem('iaq_token', 'local_dev_token');

          await Swal.fire({
            icon: 'info',
            title: 'ACCESO MODO OFFLINE/LOCAL',
            text: `Sesión de desarrollo iniciada como ${fallbackUser.name}`,
            background: '#0f1722',
            color: '#f8fafc',
            iconColor: '#06b6d4',
            confirmButtonColor: '#10b981',
            timer: 1500,
            showConfirmButton: false,
          });

          this.$router.push({ name: 'Dashboard' });
        } else {
          const msg = error.response?.data?.message || 'Identificador o token de acceso incorrectos.';
          Swal.fire({
            icon: 'error',
            title: 'ERROR DE ACCESO',
            text: msg,
            background: '#0f1722',
            color: '#f8fafc',
            iconColor: '#ef4444',
            confirmButtonColor: '#ef4444',
          });
        }
      } finally {
        this.loading = false;
      }
    },

    async handleRegister() {
      if (this.registerForm.password !== this.registerForm.password_confirmation) {
        Swal.fire({
          icon: 'warning',
          title: 'ERROR DE VALIDACIÓN',
          text: 'Las contraseñas no coinciden. Por favor verifícalas.',
          background: '#0f1722',
          color: '#f8fafc',
          iconColor: '#f59e0b',
          confirmButtonColor: '#f59e0b',
        });
        return;
      }

      this.loading = true;
      try {
        const response = await axios.post(`${API_AUTH}/register`, {
          name: this.registerForm.name,
          email: this.registerForm.email,
          password: this.registerForm.password,
          password_confirmation: this.registerForm.password_confirmation,
        });

        const userData = response.data?.user || {
          id: response.data?.user?.id || Date.now(),
          name: this.registerForm.name,
          email: this.registerForm.email,
          avatar: null,
        };
        const token = response.data?.token || 'mock_token_' + Date.now();

        localStorage.setItem('iaq_session', JSON.stringify(userData));
        localStorage.setItem('iaq_token', token);

        await Swal.fire({
          icon: 'success',
          title: 'REGISTRO COMPLETADO',
          text: 'Usuario autenticado y vinculado al nodo residencial con éxito.',
          background: '#0f1722',
          color: '#f8fafc',
          iconColor: '#10b981',
          confirmButtonColor: '#10b981',
          timer: 1700,
          showConfirmButton: false,
        });

        this.$router.push({ name: 'Dashboard' });
      } catch (error) {
        if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
          const fallbackUser = {
            id: Date.now(),
            name: this.registerForm.name,
            email: this.registerForm.email,
            avatar: null,
          };
          localStorage.setItem('iaq_session', JSON.stringify(fallbackUser));
          localStorage.setItem('iaq_token', 'local_dev_token');

          await Swal.fire({
            icon: 'info',
            title: 'REGISTRO LOCAL REALIZADO',
            text: 'Cuenta local generada para la sesión.',
            background: '#0f1722',
            color: '#f8fafc',
            iconColor: '#06b6d4',
            confirmButtonColor: '#10b981',
            timer: 1500,
            showConfirmButton: false,
          });

          this.$router.push({ name: 'Dashboard' });
        } else {
          const msg = error.response?.data?.message || 'No fue posible registrar al usuario. Verifique los datos ingresados.';
          Swal.fire({
            icon: 'error',
            title: 'FALLA DE REGISTRO',
            text: msg,
            background: '#0f1722',
            color: '#f8fafc',
            iconColor: '#ef4444',
            confirmButtonColor: '#ef4444',
          });
        }
      } finally {
        this.loading = false;
      }
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

.text-emerald { color: #10b981 !important; }
.text-cyan { color: #06b6d4 !important; }
.text-slate-light { color: #cbd5e1 !important; }
.text-slate-muted { color: #94a3b8 !important; }

.auth-card {
  background: #0f1720;
  border: 1px solid rgba(16, 185, 129, 0.25);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.7);
  max-width: 440px;
  width: 100%;
}

.auth-tabs {
  background-color: #0b1117;
}

.auth-tab-btn {
  background: transparent;
  color: #64748b;
  border: none;
  transition: all 0.2s ease-in-out;
  padding: 0.35rem 0.5rem;
  letter-spacing: 0.05em;
}

.auth-tab-btn:hover {
  color: #cbd5e1;
}

.auth-tab-active {
  background: rgba(16, 185, 129, 0.18) !important;
  color: #10b981 !important;
  border: 1px solid rgba(16, 185, 129, 0.35) !important;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
}

.bg-input {
  background-color: #0b1117;
}

.bg-input:focus {
  background-color: #0d151e;
  border-color: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
  color: #fff;
}

.bg-input-slot {
  background-color: #131c26;
}

.btn-bio-emerald {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  border: none;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
  transition: all 0.2s ease;
}

.btn-bio-emerald:hover {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-bio-cyan {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: #fff;
  border: none;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.25);
  transition: all 0.2s ease;
}

.btn-bio-cyan:hover {
  background: linear-gradient(135deg, #0891b2, #0e7490);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
}
</style>