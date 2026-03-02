const Register = {
    template: `
        <div class="register-page">
            <div class="hero-section-auth">
                <div class="container">
                    <div class="row justify-content-center align-items-center min-vh-75">
                        <div class="col-lg-5 col-md-7">
                            <div class="auth-card">
                                <div class="auth-header">
                                    <div class="auth-logo mb-3">
                                        <img src="./images/logo.png" alt="Семейный Архив" class="auth-logo-img" />
                                    </div>
                                    <h2 class="text-center mb-2">Регистрация</h2>
                                    <p class="text-center text-muted mb-4">Создайте аккаунт и начните сохранять историю вашей семьи</p>
                                </div>
                                
                                <div v-if="error" class="alert alert-danger" role="alert">
                                    <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
                                </div>
                                
                                <div v-if="success" class="alert alert-success" role="alert">
                                    <i class="bi bi-check-circle-fill me-2"></i>{{ success }}
                                </div>
                                
                                <form @submit.prevent="register" class="auth-form">
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
                                            minlength="3"
                                            placeholder="Введите имя пользователя"
                                        >
                                        <small class="form-text text-muted">Минимум 3 символа</small>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="email" class="form-label">
                                            <i class="bi bi-envelope me-2"></i>Email
                                        </label>
                                        <input 
                                            type="email" 
                                            class="form-control form-control-lg" 
                                            id="email" 
                                            v-model="email"
                                            required
                                            autocomplete="email"
                                            placeholder="Введите email"
                                        >
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="password" class="form-label">
                                            <i class="bi bi-lock me-2"></i>Пароль
                                        </label>
                                        <input 
                                            type="password" 
                                            class="form-control form-control-lg" 
                                            id="password" 
                                            v-model="password"
                                            required
                                            autocomplete="new-password"
                                            minlength="6"
                                            placeholder="Введите пароль"
                                        >
                                        <small class="form-text text-muted">Минимум 6 символов</small>
                                    </div>
                                    
                                    <div class="mb-4">
                                        <label for="confirmPassword" class="form-label">
                                            <i class="bi bi-lock-fill me-2"></i>Подтвердите пароль
                                        </label>
                                        <input 
                                            type="password" 
                                            class="form-control form-control-lg" 
                                            id="confirmPassword" 
                                            v-model="confirmPassword"
                                            required
                                            autocomplete="new-password"
                                            placeholder="Повторите пароль"
                                        >
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        class="btn btn-primary btn-lg w-100 mb-3"
                                        :disabled="loading"
                                    >
                                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                        <i v-else class="bi bi-person-plus me-2"></i>
                                        Зарегистрироваться
                                    </button>
                                </form>
                                
                                <div class="auth-footer text-center">
                                    <p class="mb-0">Уже есть аккаунт? 
                                        <router-link to="/login" class="auth-link">Войти</router-link>
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
            email: '',
            password: '',
            confirmPassword: '',
            error: '',
            success: '',
            loading: false
        }
    },
    methods: {
        async register() {
            this.error = '';
            this.success = '';

            if (this.password !== this.confirmPassword) {
                this.error = 'Пароли не совпадают';
                return;
            }

            if (this.password.length < 6) {
                this.error = 'Пароль должен содержать минимум 6 символов';
                return;
            }

            const requestData = {
                username: this.username,
                email: this.email,
                password: this.password
            };

            const fullUrl = 'http://localhost:8080/api/auth/register';

            this.loading = true;

            try {
                const response = await axios.post(fullUrl, requestData);

                if (response.data.message) {
                    this.success = response.data.message + ' Теперь вы можете войти.';
                    setTimeout(() => {
                        this.$router.push('/login');
                    }, 2000);
                }
            } catch (error) {
                if (error.response) {
                    const errorMessage = error.response.data?.error
                        || error.response.data?.message
                        || `Ошибка: ${error.response.status} ${error.response.statusText}`;
                    this.error = errorMessage;
                } else if (error.request) {
                    this.error = 'Сервер не отвечает. Проверьте, что backend запущен на http://localhost:8080';
                } else {
                    this.error = 'Ошибка регистрации: ' + error.message;
                }
            } finally {
                this.loading = false;
            }
        }
    }
};

