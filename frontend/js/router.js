// Проверка авторизации
function requireAuth(to, from, next) {
    const token = localStorage.getItem('token');
    if (token) {
        next();
    } else {
        next('/login');
    }
}

function requireAdmin(to, from, next) {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'ADMIN') {
        next();
    } else {
        next('/login');
    }
}

const routes = [
    { path: '/', component: HomePage },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/persons', component: PersonList, beforeEnter: requireAuth },
    { path: '/persons/new', component: PersonForm, beforeEnter: requireAuth },
    { path: '/persons/:id/edit', component: PersonForm, beforeEnter: requireAuth },
    { path: '/persons/:id', component: PersonView, beforeEnter: requireAuth },
    // Используем компонент без конфликта с глобальным конструктором FamilyTree
    { path: '/tree', component: FamilyTreeComponent, beforeEnter: requireAuth },
    { path: '/admin', component: AdminPanel, beforeEnter: requireAdmin },
    { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
});
