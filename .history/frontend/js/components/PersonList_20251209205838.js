const PersonList = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1><i class="bi bi-people"></i> Все персоны</h1>
                <router-link to="/persons/new" class="btn btn-primary">
                    <i class="bi bi-person-plus"></i> Добавить персону
                </router-link>
            </div>

            <!-- Фильтр по супругу -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Поиск по имени/фамилии</label>
                                <input v-model="searchQuery" type="text" class="form-control" placeholder="Иванов Иван">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Статус брака</label>
                                <select v-model="marriageFilter" class="form-select">
                                    <option value="all">Все</option>
                                    <option value="married">Женат/Замужем</option>
                                    <option value="single">Не женат/Не замужем</option>
                                </select>
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
            <div v-else>
                <div v-if="filteredPersons.length === 0" class="text-center text-muted py-5">
                    <i class="bi bi-people display-1"></i>
                    <p class="mt-3">Нет персон по выбранным критериям</p>
                </div>
                
                <div v-else class="row">
                    <div v-for="person in filteredPersons" :key="person.id" 
                         class="col-md-6 col-lg-4 mb-3">
                        <div class="card person-card h-100">
                            <!-- Фото сверху -->
                            <div v-if="person.mainPhotoUrl" class="card-img-top text-center p-3">
                                <img :src="person.mainPhotoUrl" alt="Фото" class="img-fluid rounded" style="max-height:200px; object-fit:cover;" />
                            </div>
                            <div v-else class="card-img-top text-center p-3 text-muted">
                                <i class="bi bi-person-circle" style="font-size:64px;"></i>
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
                                
                                <!-- Информация о супруге -->
                                <div v-if="person.spouse" class="card-text mb-2">
                                    <small class="text-muted">
                                        <i class="bi bi-heart-fill text-danger"></i>
                                        Супруг(а): {{ person.spouse.firstName }} {{ person.spouse.lastName }}
                                    </small>
                                </div>
                                <div v-else-if="person.spouseId" class="card-text mb-2">
                                    <small class="text-muted">
                                        <i class="bi bi-heart text-secondary"></i>
                                        Супруг(а) не загружен
                                    </small>
                                </div>
                                
                                <!-- Статус брака -->
                                <span class="badge" :class="person.spouse ? 'bg-success' : 'bg-secondary'">
                                    {{ person.spouse ? 'В браке' : 'Не в браке' }}
                                </span>

                                <div class="btn-group btn-group-sm w-100 mt-3">
                                    <router-link :to="'/persons/' + person.id" 
                                            class="btn btn-outline-primary">
                                        <i class="bi bi-eye"></i> Просмотр
                                    </router-link>
                                    <router-link :to="'/persons/' + person.id + '/edit'" 
                                            class="btn btn-outline-secondary">
                                        <i class="bi bi-pencil"></i>
                                    </router-link>
                                    <button class="btn btn-outline-danger" @click="deletePerson(person.id)">
                                        <i class="bi bi-trash"></i>
                                    </button>
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
            persons: [],
            loading: false,
            error: null,
            searchQuery: '',
            marriageFilter: 'all'
        }
    },
    computed: {
        filteredPersons() {
            let filtered = this.persons;

            // Фильтр по поиску
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(person =>
                    (person.firstName && person.firstName.toLowerCase().includes(query)) ||
                    (person.lastName && person.lastName.toLowerCase().includes(query)) ||
                    (person.middleName && person.middleName.toLowerCase().includes(query)) ||
                    (person.spouse && (
                        (person.spouse.firstName && person.spouse.firstName.toLowerCase().includes(query)) ||
                        (person.spouse.lastName && person.spouse.lastName.toLowerCase().includes(query))
                    ))
                );
            }

            // Фильтр по статусу брака
            if (this.marriageFilter === 'married') {
                filtered = filtered.filter(person => person.spouse);
            } else if (this.marriageFilter === 'single') {
                filtered = filtered.filter(person => !person.spouse);
            }

            return filtered;
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
                console.log('🔄 Загрузка персон...');
                const response = await axios.get('http://localhost:8080/api/persons');
                this.persons = response.data;

                // Загружаем супругов отдельно
                for (const person of this.persons) {
                    // Если есть spouseId, загружаем супруга
                    if (person.spouseId) {
                        try {
                            const spouseResponse = await axios.get(`http://localhost:8080/api/persons/${person.spouseId}`);
                            person.spouse = spouseResponse.data;
                        } catch (err) {
                            console.warn('Не удалось загрузить супруга для персоны', person.id, err.message);
                        }
                    }

                    // Загружаем главное фото
                    try {
                        const photoResp = await axios.get(`http://localhost:8080/api/photos/person/${person.id}/main`);
                        const photo = photoResp.data;
                        person.mainPhotoUrl = `http://localhost:8080/api/photos/file/${photo.fileName}`;
                    } catch (err) {
                        person.mainPhotoUrl = null;
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
            if (gender === 'Мужской' || gender === 'MALE') {
                return 'bi bi-gender-male text-primary';
            } else if (gender === 'Женский' || gender === 'FEMALE') {
                return 'bi bi-gender-female text-danger';
            } else {
                return 'bi bi-gender-ambiguous text-secondary';
            }
        },

        getGenderDisplay(gender) {
            if (gender === 'Мужской' || gender === 'MALE') {
                return 'Мужской';
            } else if (gender === 'Женский' || gender === 'FEMALE') {
                return 'Женский';
            } else {
                return 'Не указан';
            }
        },

        formatDate(dateString) {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString('ru-RU');
        },

        async deletePerson(id) {
            if (confirm('Вы уверены, что хотите удалить эту персону?\nПримечание: Сначала разорвите супружеские связи.')) {
                try {
                    await axios.delete(`http://localhost:8080/api/persons/${id}`);
                    await this.loadPersons();
                } catch (error) {
                    alert('Ошибка при удалении: ' + error.message);
                }
            }
        },
    }
};