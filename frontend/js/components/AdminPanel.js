const AdminPanel = {
    template: `
        <div class="container py-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <h2 class="mb-0"><i class="bi bi-shield-lock me-2"></i>Админ-панель</h2>
                <span class="badge bg-primary">Только для администратора</span>
            </div>

            <div class="card mb-3">
                <div class="card-body">
                    <div class="row g-3 align-items-end">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Выберите пользователя</label>
                            <select v-model.number="selectedUserId" class="form-select" @change="onUserChange">
                                <option value="">-- Не выбран --</option>
                                <option v-for="user in users" :key="user.id" :value="user.id">
                                    {{ user.username }} ({{ user.email }}) — {{ user.role }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-6 text-md-end">
                            <div class="btn-group">
                                <button class="btn btn-primary" :disabled="!selectedUserId" @click="goToPersons">
                                    <i class="bi bi-people me-1"></i>Персоны
                                </button>
                                <button class="btn btn-outline-primary" :disabled="!selectedUserId" @click="goToTree">
                                    <i class="bi bi-diagram-3 me-1"></i>Дерево
                                </button>
                                <button class="btn btn-success" :disabled="!selectedUserId" @click="createPerson">
                                    <i class="bi bi-person-plus me-1"></i>Новая персона
                                </button>
                            </div>
                        </div>
                    </div>
                    <div v-if="error" class="alert alert-danger mt-3 mb-0">
                        <i class="bi bi-exclamation-triangle"></i> {{ error }}
                    </div>
                </div>
            </div>

            <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
            </div>

            <div v-else-if="selectedUserId" class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <strong>Персоны пользователя</strong>
                    <span class="text-muted">Всего: {{ persons.length }}</span>
                </div>
                <div class="card-body p-0">
                    <div v-if="persons.length === 0" class="p-3 text-muted text-center">
                        Нет персон. Создайте первую.
                    </div>
                    <div v-else class="table-responsive">
                        <table class="table mb-0 align-middle">
                            <thead>
                                <tr>
                                    <th>ФИО</th>
                                    <th>Пол</th>
                                    <th>Дата рождения</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="person in persons" :key="person.id">
                                    <td>{{ formatFullName(person) }}</td>
                                    <td>{{ formatGender(person.gender) }}</td>
                                    <td>{{ person.birthDate ? formatDate(person.birthDate) : '—' }}</td>
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            <button class="btn btn-outline-primary" @click="viewPerson(person.id)">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                            <button class="btn btn-outline-secondary" @click="editPerson(person.id)">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            users: [],
            persons: [],
            selectedUserId: null,
            loading: false,
            error: ''
        }
    },
    async mounted() {
        await this.loadUsers();
        if (this.$route.query.userId) {
            this.selectedUserId = Number(this.$route.query.userId);
            await this.loadPersons();
        }
    },
    methods: {
        async loadUsers() {
            this.error = '';
            try {
                const response = await axios.get('http://localhost:8080/api/admin/users');
                this.users = response.data || [];
            } catch (e) {
                this.error = 'Не удалось загрузить пользователей';
            }
        },
        async onUserChange() {
            this.$router.replace({ query: this.selectedUserId ? { userId: this.selectedUserId } : {} });
            await this.loadPersons();
        },
        async loadPersons() {
            if (!this.selectedUserId) {
                this.persons = [];
                return;
            }
            this.loading = true;
            this.error = '';
            try {
                const response = await axios.get(`http://localhost:8080/api/persons?userId=${this.selectedUserId}`);
                this.persons = response.data || [];
            } catch (e) {
                this.error = 'Не удалось загрузить персоны выбранного пользователя';
            } finally {
                this.loading = false;
            }
        },
        goToPersons() {
            this.$router.push({ path: '/persons', query: { userId: this.selectedUserId } });
        },
        goToTree() {
            this.$router.push({ path: '/tree', query: { userId: this.selectedUserId } });
        },
        createPerson() {
            this.$router.push({ path: '/persons/new', query: { userId: this.selectedUserId } });
        },
        viewPerson(id) {
            this.$router.push({ path: `/persons/${id}`, query: { userId: this.selectedUserId } });
        },
        editPerson(id) {
            this.$router.push({ path: `/persons/${id}/edit`, query: { userId: this.selectedUserId } });
        },
        formatFullName(person) {
            if (!person) return '';
            const parts = [];
            if (person.lastName) parts.push(person.lastName);
            if (person.firstName) parts.push(person.firstName);
            if (person.middleName) parts.push(person.middleName);
            return parts.join(' ') || 'Без имени';
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('ru-RU');
        },
        formatGender(gender) {
            if (gender === 'MALE') return 'Мужской';
            if (gender === 'FEMALE') return 'Женский';
            return 'Не указан';
        }
    }
};

