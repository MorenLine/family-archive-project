// Настройка axios interceptor для JWT токенов
const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Interceptor для добавления токена к каждому запросу
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Interceptor для обработки ошибок авторизации
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            delete axios.defaults.headers.common['Authorization'];
            if (window.location.hash !== '#/login' && window.location.hash !== '#/register') {
                window.location.hash = '#/login';
            }
        }
        return Promise.reject(error);
    }
);

const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            isAuthenticated: !!localStorage.getItem('token'),
            username: localStorage.getItem('username') || '',
            role: localStorage.getItem('role') || ''
        }
    },
    methods: {
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            delete axios.defaults.headers.common['Authorization'];
            this.isAuthenticated = false;
            this.username = '';
            this.role = '';
            this.$router.push('/login');
        },
        async syncProfile() {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }
            try {
                const response = await axios.get('http://localhost:8080/api/auth/me');
                if (response.data) {
                    if (response.data.username) {
                        localStorage.setItem('username', response.data.username);
                        this.username = response.data.username;
                    }
                    if (response.data.role) {
                        localStorage.setItem('role', response.data.role);
                        this.role = response.data.role;
                    }
                }
            } catch (e) {
                // игнорируем: токен может быть просрочен, это обработает интерсептор
            }
        }
    },
    mounted() {
        this.isAuthenticated = !!localStorage.getItem('token');
        this.username = localStorage.getItem('username') || '';
        this.role = localStorage.getItem('role') || '';
        this.syncProfile();
        window.addEventListener('storage', () => {
            this.isAuthenticated = !!localStorage.getItem('token');
            this.username = localStorage.getItem('username') || '';
            this.role = localStorage.getItem('role') || '';
        });
    },
    template: `
        <div id="app">
            <nav class="main-navbar" v-if="isAuthenticated">
                <div class="container">
                    <div class="navbar-content">
                        <router-link class="navbar-brand" to="/">
                            <img src="./images/logo.png" alt="Семейный Архив" class="navbar-logo me-2" />
                            <span>Семейный Архив</span>
                        </router-link>
                        <div class="navbar-links">
                            <router-link class="nav-link" to="/" exact-active-class="active">
                                <i class="bi bi-house-door me-1"></i>Главная
                            </router-link>
                            <router-link class="nav-link" to="/persons" active-class="active">
                                <i class="bi bi-people me-1"></i>Персоны
                            </router-link>
                            <router-link class="nav-link" to="/tree" active-class="active">
                                <i class="bi bi-diagram-3 me-1"></i>Дерево
                            </router-link>
                            <router-link v-if="role === 'ADMIN'" class="nav-link" to="/admin" active-class="active">
                                <i class="bi bi-shield-lock me-1"></i>Админ
                            </router-link>
                        </div>
                        <div class="navbar-user">
                            <span class="username">
                                <i class="bi bi-person-circle me-1"></i>{{ username }}
                            </span>
                            <button class="btn-logout" @click="logout" title="Выйти">
                                <i class="bi bi-box-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <router-view></router-view>
        </div>
    `
});

app.use(router);
app.mount('#app');

