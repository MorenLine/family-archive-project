const Login = {
    template: `
        <div class="login-page">
            <div class="hero-section-auth">
                <div class="container">
                    <div class="row justify-content-center align-items-center min-vh-75">
                        <div class="col-lg-5 col-md-7">
                            <div class="auth-card">
                                <div class="auth-header">
                                    <div class="auth-logo mb-3">
                                        <img src="./images/logo.png" alt="Семейный Архив" class="auth-logo-img" />
                                    </div>
                                    <h2 class="text-center mb-2">Вход в систему</h2>
                                    <p class="text-center text-muted mb-4">Добро пожаловать обратно!</p>
                                </div>
                                
                                <div v-if="error" class="alert alert-danger" role="alert">
                                    <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
                                </div>
                                
                                <form @submit.prevent="login" class="auth-form">
                                    <div class="mb-3">
                                        <label for="username" class="form-label">
                                            <i class="bi bi-person me-2"></i>Имя пользователя
                                        </label>
                                        <input 
                                            type="text" 
                                            class="form-control form-control-lg" 
                                            id="username" 
                                            v-model="username"
                                            required
                                            autocomplete="username"
                                            placeholder="Введите имя пользователя"
                                        >
                                    </div>
                                    
                                    <div class="mb-4">
                                        <label for="password" class="form-label">
                                            <i class="bi bi-lock me-2"></i>Пароль
                                        </label>
                                        <input 
                                            type="password" 
                                            class="form-control form-control-lg" 
                                            id="password" 
                                            v-model="password"
                                            required
                                            autocomplete="current-password"
                                            placeholder="Введите пароль"
                                        >
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        class="btn btn-primary btn-lg w-100 mb-3"
                                        :disabled="loading"
                                    >
                                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                        <i v-else class="bi bi-box-arrow-in-right me-2"></i>
                                        Войти
                                    </button>
                                </form>
                                
                                <div class="auth-footer text-center">
                                    <p class="mb-0">Нет аккаунта? 
                                        <router-link to="/register" class="auth-link">Зарегистрироваться</router-link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            username: '',
            password: '',
            error: '',
            loading: false
        }
    },
    methods: {
        async login() {
            this.error = '';
            this.loading = true;

            const requestData = {
                username: this.username,
                password: this.password
            };

            try {
                const response = await axios.post('http://localhost:8080/api/auth/login', requestData);

                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('username', response.data.username);
                    if (response.data.role) {
                        localStorage.setItem('role', response.data.role);
                    } else {
                        localStorage.setItem('role', '');
                    }

                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

                    if (this.$root && this.$root.$data) {
                        this.$root.$data.isAuthenticated = true;
                        this.$root.$data.username = response.data.username;
                        this.$root.$data.role = response.data.role || '';
                    }

                    this.$router.push('/');
                }
            } catch (error) {
                if (error.response) {
                    this.error = error.response.data?.error || `Ошибка: ${error.response.status} ${error.response.statusText}`;
                } else if (error.request) {
                    this.error = 'Сервер не отвечает. Проверьте, что backend запущен на http://localhost:8080';
                } else {
                    this.error = 'Ошибка входа: ' + error.message;
                }
            } finally {
                this.loading = false;
            }
        }
    }
};

