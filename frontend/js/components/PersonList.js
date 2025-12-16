const PersonList = {
    template: `
        <div class="person-list-page">
            <!-- Hero Section -->
            <div class="hero-section-list">
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-lg-8">
                            <div class="hero-content-list">
                                <h1 class="display-4 fw-bold mb-3">
                                    <i class="bi bi-people me-3"></i>Все персоны
                                </h1>
                                <p class="lead mb-4">Управляйте информацией о членах вашей семьи</p>
                                <div class="hero-stats mb-4">
                                <div class="stat-badge-list">
                                    <i class="bi bi-people"></i>
                                    <span>{{ persons.length }} персон</span>
                                </div>
                                <div class="stat-badge-list" v-if="viewMode === 'couples'">
                                    <i class="bi bi-heart-fill"></i>
                                    <span>{{ filteredCouples.length }} {{ filteredCouples.length === 1 ? 'пара' : filteredCouples.length < 5 ? 'пары' : 'пар' }}</span>
                                </div>
                                <div class="stat-badge-list" v-else>
                                    <i class="bi bi-person-check"></i>
                                    <span>{{ filteredPersons.length }} {{ filteredPersons.length === 1 ? 'персона' : filteredPersons.length < 5 ? 'персоны' : 'персон' }}</span>
                                </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4 text-end">
                            <router-link :to="routeWithUser('/persons/new')" class="btn btn-primary btn-lg px-4">
                                <i class="bi bi-person-plus me-2"></i>Добавить персону
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Поиск и фильтры -->
            <div class="filters-section">
                <div class="container">
                    <div class="filters-card">
                        <div class="row g-3">
                            <!-- Поиск -->
                            <div class="col-md-4">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-search me-2"></i>Поиск
                                </label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white">
                                        <i class="bi bi-search"></i>
                                    </span>
                                    <input v-model="searchQuery" 
                                           type="text" 
                                           class="form-control" 
                                           placeholder="Поиск по ФИО, биографии...">
                                </div>
                            </div>
                            <!-- Фильтр по полу -->
                            <div class="col-md-2">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-funnel me-2"></i>Пол
                                </label>
                                <select v-model="filterGender" class="form-select">
                                    <option value="">Все</option>
                                    <option value="MALE">Мужской</option>
                                    <option value="FEMALE">Женский</option>
                                </select>
                            </div>
                            <!-- Фильтр по дате рождения: от -->
                            <div class="col-md-2">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-calendar me-2"></i>Дата рождения от
                                </label>
                                <input v-model="filterBirthDateFrom" 
                                       type="date" 
                                       class="form-control"
                                       :max="filterBirthDateTo || today">
                            </div>
                            <!-- Фильтр по дате рождения: до -->
                            <div class="col-md-2">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-calendar me-2"></i>Дата рождения до
                                </label>
                                <input v-model="filterBirthDateTo" 
                                       type="date" 
                                       class="form-control"
                                       :min="filterBirthDateFrom"
                                       :max="today">
                            </div>
                            <!-- Режим отображения -->
                            <div class="col-md-1">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-layout-three-columns me-2"></i>Режим
                                </label>
                                <select v-model="viewMode" class="form-select">
                                    <option value="individual">По отдельности</option>
                                    <option value="couples">Парами</option>
                                </select>
                            </div>
                            <!-- Сброс фильтров -->
                            <div class="col-md-1 d-flex align-items-end">
                                <button @click="clearFilters" 
                                        class="btn btn-outline-secondary w-100"
                                        :disabled="!hasActiveFilters"
                                        title="Сбросить фильтры">
                                    <i class="bi bi-x-circle"></i>
                                </button>
                            </div>
                        </div>
                        <!-- Информация о результатах -->
                        <div v-if="hasActiveFilters" class="mt-3 pt-3 border-top">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-info-circle text-primary me-2"></i>
                                <small class="text-muted">
                                    Найдено: <strong>{{ viewMode === 'couples' ? filteredCouples.length : filteredPersons.length }}</strong> 
                                    из <strong>{{ viewMode === 'couples' ? filteredCouples.length : persons.length }}</strong>
                                </small>
                            </div>
                        </div>
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
            <div v-else class="persons-section">
                <div class="container">
                    <div class="row">
                <!-- Режим: По отдельности -->
                <template v-if="viewMode === 'individual'">
                    <div v-for="person in filteredPersons" :key="person.id" 
                         class="col-md-6 col-lg-3 mb-3">
                        <div class="card person-card h-100 d-flex flex-column">
                            <div class="card-body d-flex flex-column">
                                <!-- Фото -->
                                <div class="text-center mb-3">
                                    <div v-if="person.mainPhotoUrl" 
                                         class="w-100" 
                                         style="aspect-ratio: 4/3; overflow: hidden; border-radius: 0.375rem;">
                                        <img :src="person.mainPhotoUrl" 
                                             alt="Фото" 
                                             class="w-100 h-100" 
                                             style="object-fit:cover;" />
                                    </div>
                                    <div v-else 
                                         class="w-100" 
                                         style="aspect-ratio: 4/3; overflow: hidden; border-radius: 0.375rem; display: flex; align-items: center; justify-content: center; background-color: #f8f9fa;">
                                        <img :src="getDefaultAvatar(person.gender)" 
                                             alt="Аватар" 
                                             class="w-100 h-100" 
                                             style="object-fit:cover;" />
                                    </div>
                                </div>
                                
                                <!-- ФИО -->
                                <h5 class="card-title text-center mb-2">{{ formatFullName(person) }}</h5>
                                
                                <!-- Пол -->
                                <p class="card-text text-center mb-2">
                                    <i :class="getGenderIcon(person.gender)"></i>
                                    {{ getGenderDisplay(person.gender) }}
                                </p>
                                
                                <!-- Даты -->
                                <div class="mb-2">
                                    <p class="card-text mb-1" v-if="person.birthDate">
                                        <small class="text-muted">
                                            <i class="bi bi-calendar"></i>
                                            Родился: {{ formatDate(person.birthDate) }}
                                        </small>
                                    </p>
                                    
                                    <p class="card-text mb-1" v-if="person.deathDate">
                                        <small class="text-muted">
                                            <i class="bi bi-calendar-x"></i>
                                            Умер: {{ formatDate(person.deathDate) }}
                                        </small>
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Кнопки внизу карточки -->
                            <div class="card-footer bg-transparent border-top-0 pt-0">
                                <div class="btn-group btn-group-sm w-100">
                                    <router-link :to="routeToPerson(person.id)" 
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
                </template>
                
                <!-- Режим: Парами -->
                <template v-else>
                    <div v-for="couple in filteredCouples" :key="couple.id" 
                         class="col-md-6 col-lg-3 mb-3">
                        <div class="card person-card h-100 d-flex flex-column">
                            <div class="card-body d-flex flex-column">
                                <!-- Фото пары -->
                                <div class="text-center mb-3">
                                    <div v-if="couple.person2" class="w-100" 
                                         style="aspect-ratio: 4/3; overflow: hidden; border-radius: 0.375rem; display: flex; gap: 2px; background-color: #f8f9fa;">
                                        <!-- Фото первого супруга -->
                                        <div style="flex: 1; overflow: hidden;">
                                            <img v-if="couple.person1.mainPhotoUrl" 
                                                 :src="couple.person1.mainPhotoUrl" 
                                                 alt="Фото" 
                                                 class="w-100 h-100" 
                                                 style="object-fit:cover;" />
                                            <img v-else 
                                                 :src="getDefaultAvatar(couple.person1.gender)" 
                                                 alt="Аватар" 
                                                 class="w-100 h-100" 
                                                 style="object-fit:cover;" />
                                        </div>
                                        <!-- Фото второго супруга -->
                                        <div style="flex: 1; overflow: hidden;">
                                            <img v-if="couple.person2.mainPhotoUrl" 
                                                 :src="couple.person2.mainPhotoUrl" 
                                                 alt="Фото" 
                                                 class="w-100 h-100" 
                                                 style="object-fit:cover;" />
                                            <img v-else 
                                                 :src="getDefaultAvatar(couple.person2.gender)" 
                                                 alt="Аватар" 
                                                 class="w-100 h-100" 
                                                 style="object-fit:cover;" />
                                        </div>
                                    </div>
                                    <!-- Одиночная персона без супруга -->
                                    <div v-else class="w-100" 
                                         style="aspect-ratio: 4/3; overflow: hidden; border-radius: 0.375rem;">
                                        <img v-if="couple.person1.mainPhotoUrl" 
                                             :src="couple.person1.mainPhotoUrl" 
                                             alt="Фото" 
                                             class="w-100 h-100" 
                                             style="object-fit:cover;" />
                                        <img v-else 
                                             :src="getDefaultAvatar(couple.person1.gender)" 
                                             alt="Аватар" 
                                             class="w-100 h-100" 
                                             style="object-fit:cover;" />
                                    </div>
                                </div>
                                
                                <!-- ФИО пары -->
                                <div class="mb-2">
                                    <h6 class="card-title text-center mb-1">
                                        <i :class="getGenderIcon(couple.person1.gender)" class="me-1"></i>
                                        {{ formatFullName(couple.person1) }}
                                    </h6>
                                    <div v-if="couple.person2" class="text-center mb-2">
                                        <i class="bi bi-heart-fill text-danger"></i>
                                    </div>
                                    <h6 v-if="couple.person2" class="card-title text-center mb-1">
                                        <i :class="getGenderIcon(couple.person2.gender)" class="me-1"></i>
                                        {{ formatFullName(couple.person2) }}
                                    </h6>
                                </div>
                                
                                <!-- Даты -->
                                <div class="mb-2">
                                    <p class="card-text mb-1" v-if="couple.person1.birthDate || (couple.person2 && couple.person2.birthDate)">
                                        <small class="text-muted">
                                            <i class="bi bi-calendar"></i>
                                            {{ couple.person1.birthDate ? formatDate(couple.person1.birthDate) : '?' }} 
                                            <i v-if="couple.person2" class="bi bi-heart text-danger"></i> 
                                            <span v-if="couple.person2">{{ couple.person2.birthDate ? formatDate(couple.person2.birthDate) : '?' }}</span>
                                        </small>
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Кнопки внизу карточки -->
                            <div class="card-footer bg-transparent border-top-0 pt-0">
                                <div class="btn-group btn-group-sm w-100">
                                    <router-link :to="routeToPerson(couple.person1.id)" 
                                            class="btn btn-outline-primary" title="Просмотр первого супруга">
                                        <i class="bi bi-eye"></i>
                                    </router-link>
                                    <router-link v-if="couple.person2" :to="routeToPerson(couple.person2.id)" 
                                            class="btn btn-outline-primary" title="Просмотр второго супруга">
                                        <i class="bi bi-eye"></i>
                                    </router-link>
                                    <button class="btn btn-outline-secondary" @click="editPerson(couple.person1.id)" title="Редактировать первого супруга">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button v-if="couple.person2" class="btn btn-outline-secondary" @click="editPerson(couple.person2.id)" title="Редактировать второго супруга">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-outline-danger" @click="deletePerson(couple.person1.id)" title="Удалить первого супруга">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                    </div>
                </div>
            </div>

            <!-- Пустой список -->
            <div v-if="!loading && persons.length === 0" class="text-center text-muted py-5">
                <i class="bi bi-people display-1"></i>
                <p class="mt-3">Нет добавленных персон</p>
                <router-link :to="routeWithUser('/persons/new')" class="btn btn-primary">
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
            filterGender: '',
            filterBirthDateFrom: '',
            filterBirthDateTo: '',
            viewMode: 'individual', // 'individual' или 'couples'
            today: new Date().toISOString().split('T')[0]
        }
    },
    computed: {
        targetUserId() {
            return this.$route.query.userId ? Number(this.$route.query.userId) : null;
        },
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

            // Фильтр по дате рождения: от
            if (this.filterBirthDateFrom) {
                result = result.filter(person => {
                    if (!person.birthDate) return false;
                    return person.birthDate >= this.filterBirthDateFrom;
                });
            }

            // Фильтр по дате рождения: до
            if (this.filterBirthDateTo) {
                result = result.filter(person => {
                    if (!person.birthDate) return false;
                    return person.birthDate <= this.filterBirthDateTo;
                });
            }

            return result;
        },
        hasActiveFilters() {
            return this.searchQuery.trim() !== '' ||
                this.filterGender !== '' ||
                this.filterBirthDateFrom !== '' ||
                this.filterBirthDateTo !== '';
        },

        filteredCouples() {
            // Группируем персон в пары
            const couples = [];
            const processedIds = new Set();

            // Сначала обрабатываем отфильтрованные персоны
            const filtered = this.filteredPersons;

            filtered.forEach(person => {
                // Пропускаем, если уже обработана
                if (processedIds.has(person.id)) {
                    return;
                }

                // Проверяем, есть ли супруг
                const spouse = person.spouse;
                if (spouse && spouse.id) {
                    // Ищем супруга в отфильтрованном списке
                    const spouseInList = filtered.find(p => p.id === spouse.id);
                    if (spouseInList && !processedIds.has(spouse.id)) {
                        // Создаем пару
                        couples.push({
                            id: `couple-${person.id}-${spouse.id}`,
                            person1: person,
                            person2: spouseInList
                        });
                        processedIds.add(person.id);
                        processedIds.add(spouse.id);
                    } else {
                        // Супруг не в отфильтрованном списке, но показываем как одиночку
                        couples.push({
                            id: `single-${person.id}`,
                            person1: person,
                            person2: null
                        });
                        processedIds.add(person.id);
                    }
                } else {
                    // Нет супруга - показываем как одиночку
                    couples.push({
                        id: `single-${person.id}`,
                        person1: person,
                        person2: null
                    });
                    processedIds.add(person.id);
                }
            });

            return couples;
        }
    },
    watch: {
        async '$route.query.userId'() {
            await this.loadPersons();
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
                const response = await axios.get(this.apiUrl('http://localhost:8080/api/persons'));
                this.persons = response.data;
                // Для каждой персоны пытаемся получить главное фото (если есть)
                for (const p of this.persons) {
                    try {
                        const photoResp = await axios.get(`http://localhost:8080/api/photos/person/${p.id}/main`, {
                            validateStatus: function (status) {
                                // Не считаем 404 ошибкой - это нормально, если у персоны нет главного фото
                                return status < 500;
                            }
                        });
                        if (photoResp.status === 200 && photoResp.data) {
                            const photo = photoResp.data;
                            // Ссылка на эндпоинт отдачи файла
                            p.mainPhotoUrl = `http://localhost:8080/api/photos/file/${photo.fileName}`;
                        } else {
                            p.mainPhotoUrl = null;
                        }
                    } catch (err) {
                        // Игнорируем ошибки загрузки фото - это не критично
                        p.mainPhotoUrl = null;
                    }
                }
            } catch (error) {
                this.error = 'Не удалось загрузить данные: ' + error.message;

            } finally {
                this.loading = false;
            }
        },

        getGenderIcon(gender) {
            // Определяем пол по русскому тексту
            if (gender === 'Мужской' || gender === 'MALE') {
                return 'bi bi-gender-male text-primary';
            } else if (gender === 'Женский' || gender === 'FEMALE') {
                return 'bi bi-gender-female text-danger';
            } else {
                return 'bi bi-gender-ambiguous text-secondary';
            }
        },

        getGenderDisplay(gender) {
            // Если уже русский текст - возвращаем как есть
            // Если английский - переводим
            if (gender === 'Мужской' || gender === 'MALE') {
                return 'Мужской';
            } else if (gender === 'Женский' || gender === 'FEMALE') {
                return 'Женский';
            } else {
                return 'Не указан';
            }
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

        formatFullName(person) {
            if (!person) return '';
            const parts = [];
            if (person.lastName) parts.push(person.lastName);
            if (person.firstName) parts.push(person.firstName);
            if (person.middleName) parts.push(person.middleName);
            return parts.join(' ') || 'Без имени';
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
            this.$router.push(this.routeWithUser(`/persons/${id}/edit`));
        },

        async deletePerson(id) {
            if (confirm('Вы уверены, что хотите удалить эту персону?')) {
                try {
                    await axios.delete(this.apiUrl(`http://localhost:8080/api/persons/${id}`));
                    await this.loadPersons(); // Перезагружаем список
                } catch (error) {
                    alert('Ошибка при удалении: ' + error.message);
                }
            }
        },

        clearFilters() {
            this.searchQuery = '';
            this.filterGender = '';
            this.filterBirthDateFrom = '';
            this.filterBirthDateTo = '';
        },
        apiUrl(base) {
            if (this.targetUserId) {
                return `${base}${base.includes('?') ? '&' : '?'}userId=${this.targetUserId}`;
            }
            return base;
        },
        routeWithUser(path) {
            return this.targetUserId ? { path, query: { userId: this.targetUserId } } : path;
        },
        routeToPerson(id) {
            return this.routeWithUser(`/persons/${id}`);
        }
    }
};