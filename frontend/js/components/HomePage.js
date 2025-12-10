const HomePage = {
    template: `
        <div class="text-center">
            <h1 class="display-4">Главная страница</h1>
            <p class="lead">Vue Router работает! 🎉</p>
            <router-link to="/persons" class="btn btn-primary">Перейти к персонам</router-link>
        </div>
    `
};

console.log('✅ HomePage загружен');