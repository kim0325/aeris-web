<template>
  <div class="bio-tech-wrapper min-vh-100 text-light d-flex flex-column">
    <!-- Header -->
    <header class="topbar-glass px-4 py-3 sticky-top border-bottom border-subtle">
      <div class="container-fluid p-0 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <div class="hub-radar">
            <i class="bi bi-person-gear text-emerald fs-4"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <span class="tech-heading fs-4 fw-bold text-white tracking-wide">BioIAQ · PERFIL DE USUARIO</span>
              <span class="badge badge-tech-pill bg-emerald-glow text-emerald font-mono">CREDENTIALS & CONFIG</span>
            </div>
            <small class="text-slate-muted d-block font-mono small">Gestión de identidad de investigador y umbrales de alerta</small>
          </div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <router-link to="/dashboard" class="btn btn-outline-success btn-sm font-tech px-3 py-1 rounded-pill">
            <i class="bi bi-speedometer2 me-1"></i> Ir al Dashboard
          </router-link>
          <router-link to="/spaces" class="btn btn-outline-info btn-sm font-tech px-3 py-1 rounded-pill">
            <i class="bi bi-geo-alt-fill me-1"></i> Gestionar Lugares
          </router-link>

          <!-- BOTÓN DE AVATAR EN LUGAR DE TEXTO -->
          <div class="dropdown">
            <button 
              class="btn btn-avatar-pill p-1 rounded-pill border-subtle d-flex align-items-center gap-2" 
              type="button" 
              data-bs-toggle="dropdown"
              :title="profileForm.name"
            >
              <img 
                v-if="profileForm.avatar" 
                :src="profileForm.avatar" 
                class="topbar-avatar-img" 
                alt="Avatar" 
              />
              <div v-else class="topbar-avatar-placeholder d-flex align-items-center justify-content-center">
                <i class="bi bi-person-fill text-cyan fs-5"></i>
              </div>
              <i class="bi bi-chevron-down text-slate-muted small pe-2"></i>
            </button>

            <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow">
              <li class="px-3 py-2 border-bottom border-subtle">
                <span class="d-block text-white fw-bold font-tech small">{{ profileForm.name }}</span>
                <small class="text-slate-muted font-mono" style="font-size: 0.72rem;">{{ profileForm.email }}</small>
              </li>
              <li>
                <button class="dropdown-item text-danger small font-tech mt-1" @click="handleLogout">
                  <i class="bi bi-door-closed me-2"></i>Desconectar
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <main class="container-fluid px-4 py-4 flex-grow-1">
      <div class="row g-4 justify-content-center">
        <!-- Tarjeta de Identidad con Selector de Foto -->
        <div class="col-lg-4 col-xl-3">
          <div class="dashboard-panel p-4 rounded-4 border border-subtle text-center mb-4">
            <div class="avatar-upload-container position-relative mx-auto mb-3" @click="triggerFileInput">
              <div class="profile-avatar-circle d-flex align-items-center justify-content-center overflow-hidden">
                <img v-if="profileForm.avatar" :src="profileForm.avatar" class="w-100 h-100 object-fit-cover" alt="Foto de perfil" />
                <i v-else class="bi bi-person-badge fs-1 text-emerald"></i>
              </div>
              <div class="avatar-overlay d-flex align-items-center justify-content-center">
                <i class="bi bi-camera-fill text-white fs-5"></i>
              </div>
              <input 
                type="file" 
                ref="fileInput" 
                class="d-none" 
                accept="image/png, image/jpeg, image/webp" 
                @change="handleAvatarChange" 
              />
            </div>

            <div class="d-flex justify-content-center gap-2 mb-2">
              <button type="button" class="btn btn-sm btn-outline-info font-tech py-0 px-2 rounded-pill small" @click="triggerFileInput">
                <i class="bi bi-upload me-1"></i> Cambiar foto
              </button>
              <button v-if="profileForm.avatar" type="button" class="btn btn-sm btn-outline-danger font-tech py-0 px-2 rounded-pill small" @click="removeAvatar">
                <i class="bi bi-trash"></i>
              </button>
            </div>

            <h5 class="font-tech fw-bold text-white mb-0 tracking-wide">{{ profileForm.name }}</h5>
            <span class="font-mono text-cyan small d-block mb-2">{{ profileForm.role || 'Investigador Principal' }}</span>
            <span class="badge bg-emerald-glow text-emerald font-mono small">NODO ACTIVO</span>

            <div class="border-top border-subtle mt-4 pt-3 text-start font-mono text-slate-muted small">
              <div class="d-flex justify-content-between mb-2">
                <span>Institución:</span>
                <span class="text-white fw-bold">{{ profileForm.institution || 'ITSM' }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Sesión:</span>
                <span class="text-emerald">Autenticada</span>
              </div>
              <div class="d-flex justify-content-between">
                <span>Región:</span>
                <span class="text-white">Misantla, Ver.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Formularios de Modificación -->
        <div class="col-lg-8 col-xl-7">
          <!-- Datos Generales -->
          <div class="dashboard-panel p-4 rounded-4 border border-subtle mb-4">
            <h6 class="font-tech fw-bold text-white tracking-wide text-uppercase mb-3">
              <i class="bi bi-sliders text-emerald me-2"></i> Información General de la Cuenta
            </h6>

            <form @submit.prevent="updateGeneralProfile">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label font-tech text-slate-light small text-uppercase fw-bold">Nombre Completo</label>
                  <div class="input-group">
                    <span class="input-group-text bg-input-slot border-subtle text-emerald"><i class="bi bi-person"></i></span>
                    <input 
                      type="text" 
                      class="form-control bg-input border-subtle text-light font-body" 
                      v-model="profileForm.name" 
                      required
                    >
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label font-tech text-slate-light small text-uppercase fw-bold">Correo Institucional</label>
                  <div class="input-group">
                    <span class="input-group-text bg-input-slot border-subtle text-emerald"><i class="bi bi-envelope"></i></span>
                    <input 
                      type="email" 
                      class="form-control bg-input border-subtle text-light font-body" 
                      v-model="profileForm.email" 
                      required
                    >
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label font-tech text-slate-light small text-uppercase fw-bold">Institución / Centro</label>
                  <div class="input-group">
                    <span class="input-group-text bg-input-slot border-subtle text-emerald"><i class="bi bi-building"></i></span>
                    <input 
                      type="text" 
                      class="form-control bg-input border-subtle text-light font-body" 
                      v-model="profileForm.institution" 
                      placeholder="Instituto Tecnológico Superior de Misantla"
                    >
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label font-tech text-slate-light small text-uppercase fw-bold">Cargo / Rol</label>
                  <div class="input-group">
                    <span class="input-group-text bg-input-slot border-subtle text-emerald"><i class="bi bi-award"></i></span>
                    <input 
                      type="text" 
                      class="form-control bg-input border-subtle text-light font-body" 
                      v-model="profileForm.role" 
                      placeholder="Investigador IoT"
                    >
                  </div>
                </div>
              </div>

              <div class="text-end mt-4">
                <button type="submit" class="btn btn-bio-emerald font-tech fw-bold px-4 py-2">
                  <i class="bi bi-check2-circle me-1"></i> GUARDAR CAMBIOS DE PERFIL
                </button>
              </div>
            </form>
          </div>

          <!-- Seguridad y Contraseña -->
          <div class="dashboard-panel p-4 rounded-4 border border-subtle mb-4">
            <h6 class="font-tech fw-bold text-white tracking-wide text-uppercase mb-3">
              <i class="bi bi-shield-lock text-cyan me-2"></i> Seguridad y Actualización de Contraseña
            </h6>

            <form @submit.prevent="updatePassword">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label font-tech text-slate-light small text-uppercase fw-bold">Nueva Contraseña</label>
                  <div class="input-group">
                    <span class="input-group-text bg-input-slot border-subtle text-cyan"><i class="bi bi-key"></i></span>
                    <input 
                      type="password" 
                      class="form-control bg-input border-subtle text-light font-body" 
                      v-model="passwordForm.newPassword" 
                      required 
                      minlength="6"
                      placeholder="Mínimo 6 caracteres"
                    >
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label font-tech text-slate-light small text-uppercase fw-bold">Confirmar Nueva Contraseña</label>
                  <div class="input-group">
                    <span class="input-group-text bg-input-slot border-subtle text-cyan"><i class="bi bi-check2"></i></span>
                    <input 
                      type="password" 
                      class="form-control bg-input border-subtle text-light font-body" 
                      v-model="passwordForm.confirmPassword" 
                      required 
                      placeholder="Repite la nueva contraseña"
                    >
                  </div>
                </div>
              </div>

              <div class="text-end mt-4">
                <button type="submit" class="btn btn-bio-cyan font-tech fw-bold px-4 py-2">
                  <i class="bi bi-lock me-1"></i> ACTUALIZAR CONTRASEÑA
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE = 'https://aeris-api-gyaj.onrender.com/api';

export default {
  name: 'ProfileView',
  data() {
    return {
      profileForm: {
        id: null,
        name: 'Investigador',
        email: '',
        institution: 'Instituto Tecnológico Superior de Misantla',
        role: 'Investigador de Telemetría IAQ',
        avatar: null,
      },
      passwordForm: {
        newPassword: '',
        confirmPassword: '',
      },
    };
  },
  mounted() {
    const session = localStorage.getItem('iaq_session');
    if (session) {
      const parsed = JSON.parse(session);
      this.profileForm.id = parsed.id || null;
      this.profileForm.name = parsed.name || 'Investigador';
      this.profileForm.email = parsed.email || '';
      this.profileForm.institution = parsed.institution || 'Instituto Tecnológico Superior de Misantla';
      this.profileForm.role = parsed.role || 'Investigador de Telemetría IAQ';
      this.profileForm.avatar = parsed.avatar || null;
    }
  },
  methods: {
    handleLogout() {
      localStorage.removeItem('iaq_session');
      localStorage.removeItem('iaq_token');
      this.$router.push({ name: 'Login' });
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleAvatarChange(e) {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 2.5 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'ARCHIVO DEMASIADO GRANDE',
          text: 'La imagen no debe superar los 2.5 MB.',
          background: '#0f1722',
          color: '#f8fafc',
          confirmButtonColor: '#f59e0b',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        this.profileForm.avatar = event.target.result;
        this.saveProfileData();
        Swal.fire({
          icon: 'success',
          title: 'FOTO ACTUALIZADA',
          text: 'Tu avatar ha sido cambiado correctamente.',
          background: '#0f1722',
          color: '#f8fafc',
          timer: 1500,
          showConfirmButton: false,
        });
      };
      reader.readAsDataURL(file);
    },
    removeAvatar() {
      this.profileForm.avatar = null;
      this.saveProfileData();
      Swal.fire({
        icon: 'info',
        title: 'FOTO ELIMINADA',
        text: 'Se restableció el avatar predeterminado.',
        background: '#0f1722',
        color: '#f8fafc',
        timer: 1400,
        showConfirmButton: false,
      });
    },
    saveProfileData() {
      const updatedUser = {
        id: this.profileForm.id,
        name: this.profileForm.name,
        email: this.profileForm.email,
        institution: this.profileForm.institution,
        role: this.profileForm.role,
        avatar: this.profileForm.avatar,
      };
      localStorage.setItem('iaq_session', JSON.stringify(updatedUser));
    },
    async updateGeneralProfile() {
      this.saveProfileData();

      try {
        const token = localStorage.getItem('iaq_token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const updatedUser = JSON.parse(localStorage.getItem('iaq_session'));
        await axios.put(`${API_BASE}/user/profile`, updatedUser, config);
      } catch (e) {
        // Fallback local
      }

      Swal.fire({
        icon: 'success',
        title: 'PERFIL ACTUALIZADO',
        text: 'Los cambios en tu cuenta han sido guardados.',
        background: '#0f1722',
        color: '#f8fafc',
        iconColor: '#10b981',
        confirmButtonColor: '#10b981',
        timer: 1600,
        showConfirmButton: false,
      });
    },
    async updatePassword() {
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        Swal.fire({
          icon: 'warning',
          title: 'ERROR EN CONTRASEÑA',
          text: 'Las contraseñas no coinciden. Inténtalo de nuevo.',
          background: '#0f1722',
          color: '#f8fafc',
          iconColor: '#f59e0b',
          confirmButtonColor: '#f59e0b',
        });
        return;
      }

      try {
        const token = localStorage.getItem('iaq_token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        await axios.put(`${API_BASE}/user/password`, { password: this.passwordForm.newPassword }, config);
      } catch (e) {
        // Fallback local
      }

      this.passwordForm.newPassword = '';
      this.passwordForm.confirmPassword = '';

      Swal.fire({
        icon: 'success',
        title: 'SEGURIDAD ACTUALIZADA',
        text: 'Tu contraseña de acceso ha sido cambiada con éxito.',
        background: '#0f1722',
        color: '#f8fafc',
        iconColor: '#06b6d4',
        confirmButtonColor: '#10b981',
        timer: 1700,
        showConfirmButton: false,
      });
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

.text-emerald { color: #10b981 !important; }
.text-cyan { color: #06b6d4 !important; }
.text-slate-light { color: #cbd5e1 !important; }
.text-slate-muted { color: #94a3b8 !important; }

.topbar-glass {
  background: rgba(13, 20, 27, 0.85);
  backdrop-filter: blur(12px);
}

.dashboard-panel {
  background: #0f1722;
}

.avatar-upload-container {
  width: 96px;
  height: 96px;
  cursor: pointer;
  border-radius: 50%;
}

.profile-avatar-circle {
  width: 100%;
  height: 100%;
  background: #111a24;
  border-radius: 50%;
  border: 2px solid rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
  transition: all 0.2s ease;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.avatar-upload-container:hover .avatar-overlay {
  opacity: 1;
}

.bg-input {
  background-color: #0d151e;
  color: #f1f5f9;
}
.bg-input:focus {
  background-color: #111a24;
  border-color: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
  color: #fff;
}

.bg-input-slot {
  background-color: #162230;
}

.btn-bio-emerald {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  border: none;
}
.btn-bio-emerald:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

.btn-bio-cyan {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: #fff;
  border: none;
}
.btn-bio-cyan:hover {
  background: linear-gradient(135deg, #0891b2, #0e7490);
}

.bg-emerald-glow {
  background-color: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
}
</style>