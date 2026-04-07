<template>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <h1>{{ t('nav.companyName') }}</h1>
        <span class="sidebar-subtitle">{{ t('nav.subtitle') }}</span>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75">
            <rect x="2" y="2" width="7" height="7" rx="1.5"/>
            <rect x="11" y="2" width="7" height="7" rx="1.5"/>
            <rect x="2" y="11" width="7" height="7" rx="1.5"/>
            <rect x="11" y="11" width="7" height="7" rx="1.5"/>
          </svg>
          <span>{{ t('nav.overview') }}</span>
        </router-link>

        <router-link to="/inventory" class="nav-item" :class="{ active: $route.path === '/inventory' }">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M3 7l7-4 7 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7z"/>
            <path d="M8 17V10h4v7"/>
          </svg>
          <span>{{ t('nav.inventory') }}</span>
        </router-link>

        <router-link to="/orders" class="nav-item" :class="{ active: $route.path === '/orders' }">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M6 2h8a1 1 0 011 1v14a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z"/>
            <path d="M7 6h6M7 9h6M7 12h4"/>
          </svg>
          <span>{{ t('nav.orders') }}</span>
        </router-link>

        <router-link to="/spending" class="nav-item" :class="{ active: $route.path === '/spending' }">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75">
            <circle cx="10" cy="10" r="8"/>
            <path d="M10 6v1m0 6v1M8 10c0-.8.9-1.5 2-1.5s2 .7 2 1.5-.9 1.5-2 1.5-2 .7-2 1.5.9 1.5 2 1.5 2-.7 2-1.5"/>
          </svg>
          <span>{{ t('nav.finance') }}</span>
        </router-link>

        <router-link to="/demand" class="nav-item" :class="{ active: $route.path === '/demand' }">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M3 14l4-5 4 3 5-7"/>
            <path d="M14 5h3v3"/>
          </svg>
          <span>{{ t('nav.demandForecast') }}</span>
        </router-link>

        <router-link to="/reports" class="nav-item" :class="{ active: $route.path === '/reports' }">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75">
            <rect x="3" y="3" width="14" height="14" rx="2"/>
            <path d="M7 13V10M10 13V7M13 13v-2"/>
          </svg>
          <span>Reports</span>
        </router-link>
      </nav>

      <div class="theme-toggle-wrap">
        <button class="theme-toggle-btn" @click="toggleTheme" :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
          <svg v-if="theme === 'dark'" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75">
            <circle cx="10" cy="10" r="4"/>
            <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"/>
          </svg>
          <svg v-else viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
          </svg>
        </button>
      </div>

      <div class="sidebar-footer">
        <LanguageSwitcher />
        <ProfileMenu
          @show-profile-details="showProfileDetails = true"
          @show-tasks="showTasks = true"
        />
      </div>
    </aside>

    <div class="main-area">
      <FilterBar />
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import { useTheme } from './composables/useTheme'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const { theme, toggleTheme } = useTheme()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)
        if (isMockTask) {
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)
        if (mockTask) {
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(loadTasks)

    return {
      t,
      theme,
      toggleTheme,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask
    }
  }
}
</script>

<style>
:root {
  --bg-page: #f8fafc;
  --bg-card: #ffffff;
  --bg-sidebar: #ffffff;
  --bg-hover: #f1f5f9;
  --bg-thead: #f8fafc;
  --bg-row-hover: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #64748b;
  --text-th: #475569;
  --text-td: #334155;
  --text-nav: #64748b;
  --text-nav-hover: #0f172a;
  --border: #e2e8f0;
  --border-td: #f1f5f9;
  --border-hover: #cbd5e1;
  --nav-active-bg: #eff6ff;
  --nav-active-color: #2563eb;
  --badge-success-bg: #d1fae5;
  --badge-success-text: #065f46;
  --badge-warning-bg: #fed7aa;
  --badge-warning-text: #92400e;
  --badge-danger-bg: #fecaca;
  --badge-danger-text: #991b1b;
  --badge-info-bg: #dbeafe;
  --badge-info-text: #1e40af;
  --badge-stable-bg: #e0e7ff;
  --badge-stable-text: #3730a3;
  --stat-warning: #ea580c;
  --stat-success: #059669;
  --stat-danger: #dc2626;
  --stat-info: #2563eb;
  --error-bg: #fef2f2;
  --error-border: #fecaca;
  --error-text: #991b1b;
}

[data-theme="dark"] {
  --bg-page: #0f172a;
  --bg-card: #1e293b;
  --bg-sidebar: #1e293b;
  --bg-hover: #334155;
  --bg-thead: #1e293b;
  --bg-row-hover: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-th: #94a3b8;
  --text-td: #cbd5e1;
  --text-nav: #94a3b8;
  --text-nav-hover: #f8fafc;
  --border: #334155;
  --border-td: #1e293b;
  --border-hover: #475569;
  --nav-active-bg: rgba(37, 99, 235, 0.15);
  --nav-active-color: #60a5fa;
  --badge-success-bg: rgba(16, 185, 129, 0.15);
  --badge-success-text: #34d399;
  --badge-warning-bg: rgba(234, 88, 12, 0.15);
  --badge-warning-text: #fb923c;
  --badge-danger-bg: rgba(220, 38, 38, 0.15);
  --badge-danger-text: #f87171;
  --badge-info-bg: rgba(37, 99, 235, 0.15);
  --badge-info-text: #60a5fa;
  --badge-stable-bg: rgba(55, 48, 163, 0.15);
  --badge-stable-text: #a5b4fc;
  --stat-warning: #fb923c;
  --stat-success: #34d399;
  --stat-danger: #f87171;
  --stat-info: #60a5fa;
  --error-bg: rgba(220, 38, 38, 0.1);
  --error-border: #7f1d1d;
  --error-text: #f87171;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--bg-page);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
}

/* ── Sidebar ─────────────────────────────────── */
.sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-logo {
  padding: 0 8px 24px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}

.sidebar-logo h1 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.sidebar-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 2px;
  display: block;
}

/* ── Nav items ───────────────────────────────── */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 7px;
  color: var(--text-nav);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-nav-hover);
}

.nav-item.active {
  background: var(--nav-active-bg);
  color: var(--nav-active-color);
}

/* ── Theme toggle ────────────────────────────── */
.theme-toggle-wrap {
  display: flex;
  justify-content: flex-start;
  padding: 8px 2px;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 7px;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.theme-toggle-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.theme-toggle-btn svg {
  width: 18px;
  height: 18px;
}

/* ── Sidebar footer ──────────────────────────── */
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  margin-top: auto;
}

/* ── Main area ───────────────────────────────── */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg-page);
}

.main-content {
  flex: 1;
  padding: 1.5rem 2rem;
  max-width: 100%;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.375rem;
  letter-spacing: -0.025em;
}

.page-header p {
  color: var(--text-muted);
  font-size: 0.938rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--bg-card);
  padding: 1.25rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--border-hover);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.625rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.stat-card.warning .stat-value {
  color: var(--stat-warning);
}

.stat-card.success .stat-value {
  color: var(--stat-success);
}

.stat-card.danger .stat-value {
  color: var(--stat-danger);
}

.stat-card.info .stat-value {
  color: var(--stat-info);
}

.card {
  background: var(--bg-card);
  border-radius: 10px;
  padding: 1.25rem;
  border: 1px solid var(--border);
  margin-bottom: 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--bg-thead);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  color: var(--text-th);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--border-td);
  color: var(--text-td);
  font-size: 0.875rem;
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: var(--bg-row-hover);
}

.badge {
  display: inline-block;
  padding: 0.313rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.success {
  background: var(--badge-success-bg);
  color: var(--badge-success-text);
}

.badge.warning {
  background: var(--badge-warning-bg);
  color: var(--badge-warning-text);
}

.badge.danger {
  background: var(--badge-danger-bg);
  color: var(--badge-danger-text);
}

.badge.info {
  background: var(--badge-info-bg);
  color: var(--badge-info-text);
}

.badge.increasing {
  background: var(--badge-success-bg);
  color: var(--badge-success-text);
}

.badge.decreasing {
  background: var(--badge-danger-bg);
  color: var(--badge-danger-text);
}

.badge.stable {
  background: var(--badge-stable-bg);
  color: var(--badge-stable-text);
}

.badge.high {
  background: var(--badge-danger-bg);
  color: var(--badge-danger-text);
}

.badge.medium {
  background: var(--badge-warning-bg);
  color: var(--badge-warning-text);
}

.badge.low {
  background: var(--badge-info-bg);
  color: var(--badge-info-text);
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
  font-size: 0.938rem;
}

.error {
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  color: var(--error-text);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.938rem;
}
</style>
