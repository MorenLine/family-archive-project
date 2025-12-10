console.log('🚀 Запуск приложения...');

// Проверяем что router загружен
if (typeof router === 'undefined') {
    console.error('❌ Router не определен!');
    // Fallback без router
    const app = Vue.createApp({
        template: `
            <div class="container mt-4">
                <h1>Семейный Архив</h1>
                <div class="alert alert-danger">
                    Router не загружен. Проверьте консоль.
                </div>
            </div>
        `
    });
    app.mount('#app');
} else {
    console.log('✅ Router доступен, создаем приложение...');

    const App = {
        template: `
            <div>
                <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                    <div class="container">
                        <router-link to="/" class="navbar-brand">
                            <i class="bi bi-tree-fill"></i> Семейный Архив
                        </router-link>
                        <div class="navbar-nav">
                            <router-link to="/" class="nav-link">Главная</router-link>
                            <router-link to="/persons" class="nav-link">Персоны</router-link>
                            <router-link to="/tree" class="nav-link">Древо</router-link>
                        </div>
                    </div>
                </nav>
                <div class="container mt-4">
                    <router-view></router-view>
                </div>
            </div>
        `
    };

    const app = Vue.createApp(App);
    app.use(router);
    app.mount('#app');
    console.log('✅ Приложение запущено!');
}