console.log('🔄 Создание router...');

// Проверяем что все компоненты загружены
if (typeof HomePage === 'undefined') {
    console.error('❌ HomePage не определен');
}
if (typeof PersonList === 'undefined') {
    console.error('❌ PersonList не определен');
}

const routes = [
    { path: '/', component: HomePage },
    { path: '/persons', component: PersonList },
    { path: '/persons/new', component: PersonForm },
    { path: '/persons/:id/edit', component: PersonForm },
    { path: '/persons/:id', component: PersonView },
    { path: '/tree', component: FamilyTree }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
});

console.log('✅ Router создан с', routes.length, 'маршрутами');