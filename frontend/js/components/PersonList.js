const PersonList = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1><i class="bi bi-people"></i> Все персоны</h1>
                <router-link to="/persons/new" class="btn btn-primary">
                    <i class="bi bi-person-plus"></i> Добавить персону
                </router-link>
            </div>

            <!-- Поиск и фильтры -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row g-3">
                        <!-- Поиск -->
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-search"></i> Поиск</label>
                            <input v-model="searchQuery" 
                                   type="text" 
                                   class="form-control" 
                                   placeholder="Поиск по ФИО, биографии...">
                        </div>
                        <!-- Фильтр по полу -->
                        <div class="col-md-3">
                            <label class="form-label"><i class="bi bi-funnel"></i> Пол</label>
                            <select v-model="filterGender" class="form-select">
                                <option value="">Все</option>
                                <option value="MALE">Мужской</option>
                                <option value="FEMALE">Женский</option>
                            </select>
                        </div>
                        <!-- Сброс фильтров -->
                        <div class="col-md-3 d-flex align-items-end">
                            <button @click="clearFilters" 
                                    class="btn btn-outline-secondary w-100"
                                    :disabled="!hasActiveFilters">
                                <i class="bi bi-x-circle"></i> Сбросить фильтры
                            </button>
                        </div>
                    </div>
                    <!-- Информация о результатах -->
                    <div v-if="hasActiveFilters" class="mt-2">
                        <small class="text-muted">
                            Найдено: {{ filteredPersons.length }} из {{ persons.length }}
                        </small>
                    </div>
                </div>
            </div>

            <!-- Состояние загрузки -->
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
                <p class="mt-2">Загрузка данных...</p>
            </div>

            <!-- Сообщение об ошибке -->
            <div v-else-if="error" class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> {{ error }}
            </div>

            <!-- Список персон -->
            <div v-else class="row">
                <div v-for="person in filteredPersons" :key="person.id" 
                     class="col-md-6 col-lg-4 mb-3">
                    <div class="card person-card h-100">
                        <!-- Фото сверху -->
                        <div v-if="person.mainPhotoUrl" class="card-img-top text-center p-3">
                            <img :src="person.mainPhotoUrl" alt="Фото" class="img-fluid rounded" style="max-height:200px; object-fit:cover;" />
                        </div>
                        <div v-else class="card-img-top text-center p-3">
                            <img :src="getDefaultAvatar(person.gender)" 
                                 alt="Аватар" 
                                 class="img-fluid rounded-circle" 
                                 style="width:120px; height:120px; object-fit:cover; display:inline-block;">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">{{ person.firstName }} {{ person.lastName }}</h5>
                            
                            <p class="card-text">
                                <i :class="getGenderIcon(person.gender)"></i>
                                {{ getGenderDisplay(person.gender) }}
                            </p>
                            
                            <p class="card-text" v-if="person.birthDate">
                                <small class="text-muted">
                                    <i class="bi bi-calendar"></i>
                                    Родился: {{ formatDate(person.birthDate) }}
                                </small>
                            </p>
                            
                            <p class="card-text" v-if="person.deathDate">
                                <small class="text-muted">
                                    <i class="bi bi-calendar-x"></i>
                                    Умер: {{ formatDate(person.deathDate) }}
                                </small>
                            </p>

                            <div class="btn-group btn-group-sm w-100">
                                <router-link :to="'/persons/' + person.id" 
                                        class="btn btn-outline-primary">
                                    <i class="bi bi-eye"></i> Просмотр
                                </router-link>
                                <button class="btn btn-outline-secondary" @click="editPerson(person.id)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-outline-danger" @click="deletePerson(person.id)">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Пустой список -->
            <div v-if="!loading && persons.length === 0" class="text-center text-muted py-5">
                <i class="bi bi-people display-1"></i>
                <p class="mt-3">Нет добавленных персон</p>
                <router-link to="/persons/new" class="btn btn-primary">
                    Добавить первую персону
                </router-link>
            </div>

            <!-- Нет результатов поиска -->
            <div v-if="!loading && persons.length > 0 && filteredPersons.length === 0" class="text-center text-muted py-5">
                <i class="bi bi-search display-1"></i>
                <p class="mt-3">Ничего не найдено</p>
                <button @click="clearFilters" class="btn btn-outline-primary">
                    Сбросить фильтры
                </button>
            </div>
        </div>
    `,
    data() {
        return {
            persons: [],
            loading: false,
            error: null,
            searchQuery: '',
            filterGender: ''
        }
    },
    computed: {
        filteredPersons() {
            let result = this.persons;

            // Поиск по ФИО и биографии
            if (this.searchQuery.trim()) {
                const query = this.searchQuery.toLowerCase().trim();
                result = result.filter(person => {
                    const fullName = `${person.lastName || ''} ${person.firstName || ''} ${person.middleName || ''}`.toLowerCase();
                    const biography = (person.biography || '').toLowerCase();
                    return fullName.includes(query) || biography.includes(query);
                });
            }

            // Фильтр по полу
            if (this.filterGender) {
                result = result.filter(person => person.gender === this.filterGender);
            }

            return result;
        },
        hasActiveFilters() {
            return this.searchQuery.trim() !== '' || this.filterGender !== '';
        }
    },
    async mounted() {
        await this.loadPersons();
    },
    methods: {
        async loadPersons() {
            this.loading = true;
            this.error = null;

            try {
                console.log('🔄 Загрузка перс...');
                const response = await axios.get('http://localhost:8080/api/persons');
                this.persons = response.data;
                // Для каждой персоны пытаемся получить главное фото (если есть)
                for (const p of this.persons) {
                    try {
                        const photoResp = await axios.get(`http://localhost:8080/api/photos/person/${p.id}/main`);
                        const photo = photoResp.data;
                        // Ссылка на эндпоинт отдачи файла
                        p.mainPhotoUrl = `http://localhost:8080/api/photos/file/${photo.fileName}`;
                    } catch (err) {
                        // Если фото не найдено или ошибка, оставляем без фото
                        if (err.response && err.response.status === 404) {
                            p.mainPhotoUrl = null;
                        } else {
                            console.warn('Ошибка при получении фото для персоны', p.id, err.message);
                            p.mainPhotoUrl = null;
                        }
                    }
                }
                console.log('✅ Загружено персон:', this.persons.length);
            } catch (error) {
                console.error('❌ Ошибка загрузки:', error);
                this.error = 'Не удалось загрузить данные: ' + error.message;

            } finally {
                this.loading = false;
            }
        },

        getGenderIcon(gender) {
            console.log('🔍 getGenderIcon вызван с:', gender);

            // Определяем пол по русскому тексту
            let result;
            if (gender === 'Мужской' || gender === 'MALE') {
                result = 'bi bi-gender-male text-primary';
            } else if (gender === 'Женский' || gender === 'FEMALE') {
                result = 'bi bi-gender-female text-danger';
            } else {
                result = 'bi bi-gender-ambiguous text-secondary';
            }

            console.log('🔍 getGenderIcon вернул:', result);
            return result;
        },

        getGenderDisplay(gender) {
            console.log('🔍 getGenderDisplay вызван с:', gender);

            // Если уже русский текст - возвращаем как есть
            // Если английский - переводим
            let result;
            if (gender === 'Мужской' || gender === 'MALE') {
                result = 'Мужской';
            } else if (gender === 'Женский' || gender === 'FEMALE') {
                result = 'Женский';
            } else {
                result = 'Не указан';
            }

            console.log('🔍 getGenderDisplay вернул:', result);
            return result;
        },

        getDefaultAvatar(gender) {
            // Возвращаем SVG аватар
            if (gender === 'MALE') {
                // Простой мужской аватар (синий круг с иконкой)
                const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="#6bb4df"/><circle cx="60" cy="45" r="20" fill="#ffffff"/><path d="M 30 100 Q 30 75 60 75 Q 90 75 90 100 Z" fill="#ffffff"/></svg>';
                return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
            } else if (gender === 'FEMALE') {
                // Простой женский аватар (розовый круг с иконкой)
                const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="#cb4aaf"/><circle cx="60" cy="45" r="20" fill="#ffffff"/><path d="M 30 100 Q 30 75 60 75 Q 90 75 90 100 Z" fill="#ffffff"/></svg>';
                return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
            }
            // По умолчанию серый аватар
            const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="#aeaeae"/><circle cx="60" cy="45" r="20" fill="#ffffff"/><path d="M 30 100 Q 30 75 60 75 Q 90 75 90 100 Z" fill="#ffffff"/></svg>';
            return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        },

        formatDate(dateString) {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString('ru-RU');
        },

        viewPerson(id) {
            alert(`Просмотр персоны ID: ${id}`);
            // Позже сделаем переход на страницу просмотра
        },

        editPerson(id) {
            this.$router.push(`/persons/${id}/edit`);
        },

        async deletePerson(id) {
            if (confirm('Вы уверены, что хотите удалить эту персону?')) {
                try {
                    await axios.delete(`http://localhost:8080/api/persons/${id}`);
                    await this.loadPersons(); // Перезагружаем список
                } catch (error) {
                    alert('Ошибка при удалении: ' + error.message);
                }
            }
        },

        clearFilters() {
            this.searchQuery = '';
            this.filterGender = '';
        }
    }
};