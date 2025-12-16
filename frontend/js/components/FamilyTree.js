const FamilyTreeComponent = {
    template: `
        <div class="family-tree-page">
            <!-- Hero Section -->
            <div class="hero-section-tree">
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-lg-8">
                            <div class="hero-content-tree">
                                <h1 class="display-4 fw-bold mb-3">
                                    <i class="bi bi-diagram-3 me-3"></i>Семейное Древо
                                </h1>
                                <p class="lead mb-4">Визуализируйте связи между членами вашей семьи</p>
                                <div class="hero-stats-tree" v-if="persons.length > 0">
                                    <div class="stat-badge-tree">
                                        <i class="bi bi-people"></i>
                                        <span>{{ treeStatistics.totalPersons }} персон</span>
                                    </div>
                                    <div class="stat-badge-tree">
                                        <i class="bi bi-heart-fill"></i>
                                        <span>{{ treeStatistics.couples }} пар</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4 text-end">
                            <button v-if="family" @click="refreshTree" class="btn btn-light btn-lg px-4">
                                <i class="bi bi-arrow-clockwise me-2"></i>Обновить
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container">
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                    <p class="mt-3">Загрузка семейного дерева...</p>
                </div>
                
                <div v-else-if="error" class="alert alert-danger mt-4">
                    <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
                </div>
                
                <div v-else-if="persons.length === 0" class="empty-state mt-4">
                    <div class="text-center py-5">
                        <i class="bi bi-diagram-3 display-1 text-muted"></i>
                        <h3 class="mt-3 mb-3">Нет данных для отображения</h3>
                        <p class="text-muted mb-4">Добавьте персон, чтобы начать строить семейное дерево</p>
                        <router-link to="/persons/new" class="btn btn-primary btn-lg">
                            <i class="bi bi-person-plus me-2"></i>Добавить первую персону
                        </router-link>
                    </div>
                </div>
                
                <div v-else>
                    <!-- Дерево -->
                    <div class="tree-section mb-4">
                        <div id="tree" class="family-tree-container"></div>
                    </div>
                    
                    <!-- Статистика -->
                    <div class="statistics-card-tree">
                        <div class="statistics-header">
                            <h5 class="mb-0">
                                <i class="bi bi-bar-chart me-2"></i>Статистика семейного дерева
                            </h5>
                        </div>
                        <div class="statistics-body">
                            <div class="row g-3">
                                <div class="col-md-3 col-sm-6">
                                    <div class="stat-card-tree">
                                        <div class="stat-icon-tree">
                                            <i class="bi bi-people"></i>
                                        </div>
                                        <div class="stat-number-tree">{{ treeStatistics.totalPersons }}</div>
                                        <div class="stat-label-tree">Всего персон</div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-sm-6">
                                    <div class="stat-card-tree">
                                        <div class="stat-icon-tree">
                                            <i class="bi bi-gender-male"></i>
                                        </div>
                                        <div class="stat-number-tree">{{ treeStatistics.males }}</div>
                                        <div class="stat-label-tree">Мужчин</div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-sm-6">
                                    <div class="stat-card-tree">
                                        <div class="stat-icon-tree">
                                            <i class="bi bi-gender-female"></i>
                                        </div>
                                        <div class="stat-number-tree">{{ treeStatistics.females }}</div>
                                        <div class="stat-label-tree">Женщин</div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-sm-6">
                                    <div class="stat-card-tree">
                                        <div class="stat-icon-tree">
                                            <i class="bi bi-heart-fill"></i>
                                        </div>
                                        <div class="stat-number-tree">{{ treeStatistics.couples }}</div>
                                        <div class="stat-label-tree">Супружеских пар</div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-sm-6">
                                    <div class="stat-card-tree">
                                        <div class="stat-icon-tree">
                                            <i class="bi bi-camera"></i>
                                        </div>
                                        <div class="stat-number-tree">{{ treeStatistics.withPhotos }}</div>
                                        <div class="stat-label-tree">С фотографиями</div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-sm-6">
                                    <div class="stat-card-tree">
                                        <div class="stat-icon-tree">
                                            <i class="bi bi-calendar"></i>
                                        </div>
                                        <div class="stat-number-tree">{{ treeStatistics.withBirthDate }}</div>
                                        <div class="stat-label-tree">С датой рождения</div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-sm-6">
                                    <div class="stat-card-tree">
                                        <div class="stat-icon-tree">
                                            <i class="bi bi-people-fill"></i>
                                        </div>
                                        <div class="stat-number-tree">{{ treeStatistics.withParents }}</div>
                                        <div class="stat-label-tree">С родителями</div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-sm-6">
                                    <div class="stat-card-tree">
                                        <div class="stat-icon-tree">
                                            <i class="bi bi-person-badge"></i>
                                        </div>
                                        <div class="stat-number-tree">{{ treeStatistics.withChildren }}</div>
                                        <div class="stat-label-tree">С детьми</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Кастомная форма редактирования -->
            <div v-if="showEditForm" class="custom-edit-form-overlay" @click.self="closeEditForm">
                <div class="custom-edit-form-container">
                    <div class="card shadow-lg border-0">
                        <div class="card-header custom-edit-form-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0 text-white">
                                <i class="bi me-2" :class="editFormMode === 'edit' ? 'bi-pencil' : 'bi-eye'"></i> 
                                {{ editFormMode === 'edit' ? 'Редактировать персону' : 'Просмотр персоны' }}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeEditForm"></button>
                        </div>
                        <div class="card-body">
                            <div v-if="editFormError" class="alert alert-danger alert-dismissible fade show">
                                <i class="bi bi-exclamation-triangle me-2"></i>{{ editFormError }}
                                <button type="button" class="btn-close" @click="editFormError = null"></button>
                            </div>
                            <div v-if="editFormSuccess" class="alert alert-success alert-dismissible fade show">
                                <i class="bi bi-check-circle me-2"></i>{{ editFormSuccess }}
                                <button type="button" class="btn-close" @click="editFormSuccess = null"></button>
                            </div>
                            
                            <div class="row">
                                <!-- Левая колонка: фото и основная информация -->
                                <div class="col-lg-4">
                                    <div class="card shadow-sm mb-3 border-0">
                                        <div class="card-body">
                                            <!-- Основная фотография -->
                                            <div class="text-center mb-4">
                                                <div v-if="editFormMainPhoto" class="main-photo-container">
                                                    <img :src="getPhotoUrl(editFormMainPhoto.fileName)" 
                                                        :alt="editFormMainPhoto.description || 'Основное фото'"
                                                        class="main-photo img-fluid rounded"
                                                        style="width:100%; max-height:250px; object-fit:cover; cursor:pointer;"
                                                        @click="openPhotoLightbox(editFormMainPhoto)">
                                                </div>
                                                <div v-else class="no-photo-placeholder">
                                                    <i class="bi bi-camera display-1 text-muted"></i>
                                                    <p class="text-muted mt-2">Нет фотографии</p>
                                                </div>
                                            </div>

                                            <!-- Базовая информация -->
                                            <div class="person-info">
                                                <div class="d-flex align-items-center mb-3 p-2 bg-light rounded">
                                                    <i :class="getGenderIcon(editFormData.gender)" class="me-2 fs-5"></i>
                                                    <span class="fw-semibold">{{ getGenderDisplay(editFormData.gender) }}</span>
                                                </div>

                                                <div class="info-item mb-3">
                                                    <strong class="text-muted d-block mb-1">
                                                        <i class="bi bi-person me-1"></i>ФИО
                                                    </strong>
                                                    <p class="mb-0 fw-semibold">{{ formatFullName(editFormData) }}</p>
                                                </div>

                                                <div class="info-item mb-3" v-if="editFormData.birthDate">
                                                    <strong class="text-muted d-block mb-1">
                                                        <i class="bi bi-calendar me-1"></i>Дата рождения
                                                    </strong>
                                                    <p class="mb-0">{{ formatDate(editFormData.birthDate) }}</p>
                                                </div>

                                                <div class="info-item mb-3" v-if="editFormData.deathDate">
                                                    <strong class="text-muted d-block mb-1">
                                                        <i class="bi bi-calendar-x me-1"></i>Дата смерти
                                                    </strong>
                                                    <p class="mb-0">{{ formatDate(editFormData.deathDate) }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Правая колонка: форма редактирования/просмотра и связи -->
                                <div class="col-lg-8">
                                    <!-- Режим просмотра - только связи (родители, дети), без дублирования данных -->
                                    <div v-if="editFormMode === 'view'">
                                        <!-- Биография -->
                                        <div class="card shadow-sm mb-3 border-0" v-if="editFormData.biography">
                                            <div class="card-header bg-white border-bottom">
                                                <h6 class="mb-0">
                                                    <i class="bi bi-book me-2 text-primary"></i>Биография
                                                </h6>
                                            </div>
                                            <div class="card-body">
                                                <p class="mb-0" style="text-align: justify; white-space: pre-wrap; color: #495057; line-height: 1.8;">{{ editFormData.biography }}</p>
                                            </div>
                                        </div>
                                        
                                        <!-- Кнопка редактирования -->
                                        <div class="d-flex justify-content-end mb-3">
                                            <button type="button" 
                                                    class="btn btn-primary"
                                                    @click="switchToEditMode">
                                                <i class="bi bi-pencil me-2"></i>Редактировать
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Режим редактирования -->
                                    <form v-else @submit.prevent="saveEditForm">
                                        <div class="card shadow-sm mb-3 border-0">
                                            <div class="card-header bg-white border-bottom">
                                                <h6 class="mb-0">
                                                    <i class="bi bi-info-circle me-2 text-primary"></i>Основная информация
                                                </h6>
                                            </div>
                                            <div class="card-body">
                                                <div class="row">
                                                    <div class="col-md-4">
                                                        <div class="mb-3">
                                                            <label class="form-label fw-semibold">Имя *</label>
                                                            <input v-model="editFormData.firstName" 
                                                                   type="text" 
                                                                   class="form-control" 
                                                                   required>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-4">
                                                        <div class="mb-3">
                                                            <label class="form-label fw-semibold">Фамилия *</label>
                                                            <input v-model="editFormData.lastName" 
                                                                   type="text" 
                                                                   class="form-control"
                                                                   required>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-4">
                                                        <div class="mb-3">
                                                            <label class="form-label fw-semibold">Отчество</label>
                                                            <input v-model="editFormData.middleName" 
                                                                   type="text" 
                                                                   class="form-control">
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="row">
                                                    <div class="col-md-4">
                                                        <div class="mb-3">
                                                            <label class="form-label fw-semibold">Пол *</label>
                                                            <select v-model="editFormData.gender" 
                                                                    class="form-select"
                                                                    required>
                                                                <option value="">-- Выберите пол --</option>
                                                                <option value="MALE">Мужской</option>
                                                                <option value="FEMALE">Женский</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-4">
                                                        <div class="mb-3">
                                                            <label class="form-label fw-semibold">Дата рождения</label>
                                                            <input v-model="editFormData.birthDate" 
                                                                   type="date" 
                                                                   class="form-control"
                                                                   :max="today">
                                                        </div>
                                                    </div>
                                                    <div class="col-md-4">
                                                        <div class="mb-3">
                                                            <label class="form-label fw-semibold">Дата смерти</label>
                                                            <input v-model="editFormData.deathDate" 
                                                                   type="date" 
                                                                   class="form-control"
                                                                   :min="editFormData.birthDate"
                                                                   :max="today">
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="mb-0">
                                                    <label class="form-label fw-semibold">Биография</label>
                                                    <textarea v-model="editFormData.biography" 
                                                              class="form-control" 
                                                              rows="4"
                                                              placeholder="Расскажите о жизни человека..."></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="d-flex gap-2 justify-content-end mb-4">
                                            <button type="button" 
                                                    class="btn btn-outline-secondary"
                                                    @click="switchToViewMode">
                                                <i class="bi bi-x-lg me-1"></i>Отмена
                                            </button>
                                            <button type="submit" 
                                                    class="btn btn-primary"
                                                    :disabled="editFormLoading">
                                                <span v-if="editFormLoading" class="spinner-border spinner-border-sm me-2"></span>
                                                <i v-else class="bi bi-check-lg me-1"></i>
                                                Сохранить
                                            </button>
                                        </div>
                                    </form>

                                    <!-- Супруг(а) -->
                                    <div class="card shadow-sm mb-3 border-0" v-if="editFormPerson.spouse">
                                        <div class="card-header bg-white border-bottom">
                                            <h6 class="mb-0">
                                                <i class="bi bi-heart me-2 text-danger"></i>Супруг(а)
                                            </h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="list-group list-group-flush">
                                                <div class="list-group-item list-group-item-action border-0 px-0"
                                                     style="cursor: pointer;"
                                                     @click="viewPersonInTree(editFormPerson.spouse.id)">
                                                    <i :class="getGenderIcon(editFormPerson.spouse.gender)" class="me-2"></i>
                                                    <span class="fw-semibold">{{ formatFullName(editFormPerson.spouse) }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Родители -->
                                    <div class="card shadow-sm mb-3 border-0" v-if="editFormPerson.parent1 || editFormPerson.parent2">
                                        <div class="card-header bg-white border-bottom">
                                            <h6 class="mb-0">
                                                <i class="bi bi-people me-2 text-primary"></i>Родители
                                            </h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="list-group list-group-flush">
                                                <div v-if="editFormPerson.parent1" 
                                                     class="list-group-item list-group-item-action border-0 px-0"
                                                     style="cursor: pointer;"
                                                     @click="viewPersonInTree(editFormPerson.parent1.id)">
                                                    <i class="bi bi-gender-male text-primary me-2"></i>
                                                    <span class="fw-semibold">{{ formatFullName(editFormPerson.parent1) }}</span>
                                                </div>
                                                <div v-if="editFormPerson.parent2" 
                                                     class="list-group-item list-group-item-action border-0 px-0"
                                                     style="cursor: pointer;"
                                                     @click="viewPersonInTree(editFormPerson.parent2.id)">
                                                    <i class="bi bi-gender-female text-danger me-2"></i>
                                                    <span class="fw-semibold">{{ formatFullName(editFormPerson.parent2) }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Дети -->
                                    <div class="card shadow-sm mb-3 border-0" v-if="editFormChildren.length > 0">
                                        <div class="card-header bg-white border-bottom">
                                            <h6 class="mb-0">
                                                <i class="bi bi-people-fill me-2 text-success"></i>Дети
                                            </h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="list-group list-group-flush">
                                                <div v-for="child in editFormChildren" 
                                                     :key="child.id"
                                                     class="list-group-item list-group-item-action border-0 px-0"
                                                     style="cursor: pointer;"
                                                     @click="viewPersonInTree(child.id)">
                                                    <i :class="getGenderIcon(child.gender)" class="me-2"></i>
                                                    <span class="fw-semibold">{{ formatFullName(child) }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
            family: null,
            loading: false,
            error: null,
            persons: [],
            showEditForm: false,
            editFormMode: 'view', // 'view' - просмотр, 'edit' - редактирование
            preventEditFormOpen: false, // Флаг для предотвращения открытия формы при выборе "Детали"
            editFormData: {
                id: null,
                firstName: '',
                lastName: '',
                middleName: '',
                gender: '',
                birthDate: '',
                deathDate: '',
                biography: ''
            },
            editFormPerson: {},
            editFormMainPhoto: null,
            editFormChildren: [],
            editFormLoading: false,
            editFormError: null,
            editFormSuccess: null,
            today: new Date().toISOString().split('T')[0]
        }
    },
    computed: {
        targetUserId() {
            return this.$route.query.userId ? Number(this.$route.query.userId) : null;
        },
        treeStatistics() {
            const stats = {
                totalPersons: this.persons.length,
                males: 0,
                females: 0,
                couples: 0,
                withPhotos: 0,
                withBirthDate: 0,
                withParents: 0,
                withChildren: 0
            };

            const processedCouples = new Set();

            this.persons.forEach(person => {
                // Подсчет по полу
                if (person.gender === 'MALE') {
                    stats.males++;
                } else if (person.gender === 'FEMALE') {
                    stats.females++;
                }

                // Подсчет с фото
                if (person.mainPhotoUrl) {
                    stats.withPhotos++;
                }

                // Подсчет с датой рождения
                if (person.birthDate) {
                    stats.withBirthDate++;
                }

                // Подсчет с родителями
                if (person.parent1 || person.parent2) {
                    stats.withParents++;
                }

                // Подсчет супружеских пар (каждую пару считаем один раз)
                if (person.spouse && person.spouse.id) {
                    const coupleId = person.id < person.spouse.id
                        ? `${person.id}-${person.spouse.id}`
                        : `${person.spouse.id}-${person.id}`;
                    if (!processedCouples.has(coupleId)) {
                        stats.couples++;
                        processedCouples.add(coupleId);
                    }
                }
            });

            // Подсчет персон с детьми
            this.persons.forEach(person => {
                const hasChildren = this.persons.some(p =>
                    (p.parent1 && p.parent1.id === person.id) ||
                    (p.parent2 && p.parent2.id === person.id)
                );
                if (hasChildren) {
                    stats.withChildren++;
                }
            });

            return stats;
        }
    },
    async mounted() {
        await this.loadPersons();
        if (this.persons.length > 0) {
            this.initFamilyTree();
        }
    },
    beforeUnmount() {
        if (this.family) {
            this.family.destroy();
        }
    },
    watch: {
        async '$route.query.userId'() {
            await this.refreshTree();
        }
    },
    methods: {
        async loadPersons() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(this.apiUrl('http://localhost:8080/api/persons'));
                this.persons = response.data;

                // Загружаем фото для каждой персоны
                for (const person of this.persons) {
                    try {
                        const photoResp = await axios.get(`http://localhost:8080/api/photos/person/${person.id}/main`, {
                            validateStatus: function (status) {
                                // Не считаем 404 ошибкой - это нормально, если у персоны нет главного фото
                                return status < 500;
                            }
                        });
                        if (photoResp.status === 200 && photoResp.data) {
                            const photo = photoResp.data;
                            person.mainPhotoUrl = `http://localhost:8080/api/photos/file/${photo.fileName}`;
                        } else {
                            person.mainPhotoUrl = null;
                        }
                    } catch (err) {
                        // Игнорируем ошибки загрузки фото - это не критично
                        person.mainPhotoUrl = null;
                    }
                }

            } catch (error) {
                this.error = 'Не удалось загрузить данные: ' + error.message;
            } finally {
                this.loading = false;
            }
        },

        apiUrl(base) {
            if (this.targetUserId) {
                return `${base}${base.includes('?') ? '&' : '?'}userId=${this.targetUserId}`;
            }
            return base;
        },

        async refreshTree() {
            await this.loadPersons();
            if (this.family) {
                this.family.destroy();
            }
            if (this.persons.length > 0) {
                this.initFamilyTree();
            }
        },

        convertPersonToFamilyTreeFormat(person) {
            // Формируем полное ФИО
            const fullName = `${person.lastName || ''} ${person.firstName || ''} ${person.middleName || ''}`.trim() || 'Без имени';

            // Формируем годы жизни
            const birthYear = person.birthDate ? new Date(person.birthDate).getFullYear() : '';
            const deathYear = person.deathDate ? new Date(person.deathDate).getFullYear() : '';
            let years = '';
            if (birthYear && deathYear) {
                years = `${birthYear} - ${deathYear}`;
            } else if (birthYear) {
                years = `род. ${birthYear}`;
            } else if (deathYear) {
                years = `ум. ${deathYear}`;
            }

            const node = {
                id: person.id,
                name: fullName,
                relationship: this.getRelationship(person),
                years: years,
                bdate: birthYear,
                ddate: deathYear,
                img: person.mainPhotoUrl || this.getDefaultImage(person.gender),
                gender: person.gender ? person.gender.toLowerCase() : 'unknown',
                genderIcon: this.getGenderIconDataURI(person.gender)
            };

            // Обрабатываем родителей
            // В FamilyTree.js: mid = мать (mother), fid = отец (father)
            // Определяем по полу, кто мать, а кто отец
            if (person.parent1 && person.parent1.id) {
                if (person.parent1.gender === 'FEMALE') {
                    node.mid = person.parent1.id;
                } else {
                    node.fid = person.parent1.id;
                }
            }
            if (person.parent2 && person.parent2.id) {
                if (person.parent2.gender === 'FEMALE') {
                    node.mid = person.parent2.id;
                } else {
                    node.fid = person.parent2.id;
                }
            }

            // Обрабатываем супруга
            if (person.spouse && person.spouse.id) {
                if (!node.pids) {
                    node.pids = [];
                }
                node.pids.push(person.spouse.id);
            }

            // Определяем теги для шаблонов
            const tags = [];
            if (person.gender === 'MALE') {
                tags.push('male');
            } else if (person.gender === 'FEMALE') {
                tags.push('female');
            }

            // Если нет родителей, используем single шаблон
            if (!person.parent1 && !person.parent2) {
                if (person.gender === 'MALE') {
                    tags.push('single_male');
                } else if (person.gender === 'FEMALE') {
                    tags.push('single_female');
                }
            }

            if (tags.length > 0) {
                node.tags = tags;
            }

            return node;
        },

        getRelationship(person) {
            // Возвращаем пустую строку, так как будем использовать иконки
            return '';
        },

        getGenderIconDataURI(gender) {
            // Возвращаем data URI для SVG иконки пола
            let svg = '';
            if (gender === 'MALE' || gender === 'male') {
                // Иконка мужского пола (синий круг с символом ♂)
                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#6bb4df"/><text x="12" y="16" font-size="14" fill="white" text-anchor="middle" font-weight="bold">♂</text></svg>';
            } else if (gender === 'FEMALE' || gender === 'female') {
                // Иконка женского пола (розовый круг с символом ♀)
                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#cb4aaf"/><text x="12" y="16" font-size="14" fill="white" text-anchor="middle" font-weight="bold">♀</text></svg>';
            } else {
                // По умолчанию серый круг
                svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#aeaeae"/><text x="12" y="16" font-size="14" fill="white" text-anchor="middle" font-weight="bold">?</text></svg>';
            }
            return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        },

        getDefaultImage(gender) {
            // Возвращаем SVG аватар
            if (gender === 'MALE') {
                // Простой мужской аватар (синий круг с иконкой)
                const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="36" fill="#6bb4df"/><circle cx="36" cy="28" r="12" fill="#ffffff"/><path d="M 20 60 Q 20 45 36 45 Q 52 45 52 60 Z" fill="#ffffff"/></svg>';
                return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
            } else if (gender === 'FEMALE') {
                // Простой женский аватар (розовый круг с иконкой)
                const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="36" fill="#cb4aaf"/><circle cx="36" cy="28" r="12" fill="#ffffff"/><path d="M 20 60 Q 20 45 36 45 Q 52 45 52 60 Z" fill="#ffffff"/></svg>';
                return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
            }
            // По умолчанию серый аватар
            const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="36" fill="#aeaeae"/><circle cx="36" cy="28" r="12" fill="#ffffff"/><path d="M 20 60 Q 20 45 36 45 Q 52 45 52 60 Z" fill="#ffffff"/></svg>';
            return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        },

        createCustomEditForm() {
            const self = this;

            const editForm = function () { };

            editForm.prototype.init = function (obj) {
                // Инициализация формы
                this.obj = obj;
            };

            editForm.prototype.show = function (node) {
                // Определяем ID узла
                let nodeId = null;
                if (typeof node === 'number') {
                    nodeId = node;
                } else if (node && node.id) {
                    nodeId = node.id;
                } else if (node && node.pid) {
                    nodeId = node.pid;
                }

                // Проверяем флаг - если установлен, значит был клик на "Детали"
                if (self.preventEditFormOpen && nodeId) {
                    // Переадресация уже выполнена в onClick, просто не открываем форму
                    return;
                }

                // Открываем форму с данными узла в режиме просмотра (по умолчанию)
                self.openEditForm(node, 'view');
            };

            editForm.prototype.hide = function (shouldUpdateTheNode) {
                // Закрываем форму
                if (shouldUpdateTheNode) {
                    // Если нужно обновить узел, перезагружаем дерево
                    self.refreshTree();
                }
                self.closeEditForm();
            };

            return new editForm();
        },

        async openEditForm(node, mode = 'view') {
            // Определяем ID узла - может быть передан как объект с id, или просто число
            let nodeId = null;
            if (typeof node === 'number') {
                nodeId = node;
            } else if (node && node.id) {
                nodeId = node.id;
            } else if (node && typeof node === 'object') {
                // Пытаемся найти ID в объекте
                nodeId = node.id || node.nodeId || node.pid;
            }

            if (!nodeId) {
                this.editFormError = 'Не удалось определить узел';
                this.showEditForm = true;
                return;
            }

            // Устанавливаем режим
            this.editFormMode = mode;

            try {
                // Загружаем полную информацию о персоне с сервера, чтобы получить актуальные данные о родителях и супруге
                const response = await axios.get(this.apiUrl(`http://localhost:8080/api/persons/${nodeId}`));
                const person = response.data;

                // Заполняем форму данными
                // Форматируем даты для input type="date"
                let birthDate = '';
                let deathDate = '';
                if (person.birthDate) {
                    birthDate = person.birthDate.includes('T')
                        ? person.birthDate.split('T')[0]
                        : person.birthDate;
                }
                if (person.deathDate) {
                    deathDate = person.deathDate.includes('T')
                        ? person.deathDate.split('T')[0]
                        : person.deathDate;
                }

                this.editFormData = {
                    id: person.id,
                    firstName: person.firstName || '',
                    lastName: person.lastName || '',
                    middleName: person.middleName || '',
                    gender: person.gender || '',
                    birthDate: birthDate,
                    deathDate: deathDate,
                    biography: person.biography || ''
                };

                this.editFormError = null;
                this.editFormSuccess = null;
                this.editFormPerson = person;
                this.showEditForm = true;

                // Загружаем фото и детей
                this.loadEditFormPhoto(person.id);
                this.loadEditFormChildren(person.id);
            } catch (error) {
                this.editFormError = 'Ошибка загрузки данных персоны: ' + (error.response?.data?.message || error.message);
                this.showEditForm = true;
            }
        },

        async loadEditFormPhoto(personId) {
            try {
                const response = await axios.get(`http://localhost:8080/api/photos/person/${personId}/main`);
                if (response.data) {
                    this.editFormMainPhoto = response.data;
                } else {
                    this.editFormMainPhoto = null;
                }
            } catch (err) {
                this.editFormMainPhoto = null;
            }
        },

        async loadEditFormChildren(personId) {
            try {
                const response = await axios.get(this.apiUrl(`http://localhost:8080/api/persons/${personId}/children`));
                this.editFormChildren = response.data;
            } catch (err) {
                this.editFormChildren = [];
            }
        },

        getPhotoUrl(fileName) {
            return `http://localhost:8080/api/photos/file/${fileName}`;
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

        viewPersonInTree(personId) {
            // Закрываем текущую форму
            this.closeEditForm();
            // Находим узел в дереве и открываем форму для него
            setTimeout(() => {
                const nodeData = this.persons.find(p => p.id === personId);
                if (nodeData) {
                    this.openEditForm(personId);
                }
            }, 300);
        },

        openPhotoLightbox(photo) {
            // Простое открытие фото в новом окне или можно добавить лайтбокс
            window.open(this.getPhotoUrl(photo.fileName), '_blank');
        },

        closeEditForm() {
            this.showEditForm = false;
            this.editFormMode = 'view'; // Сбрасываем режим
            this.editFormError = null;
            this.editFormSuccess = null;
            this.editFormPerson = {};
            this.editFormMainPhoto = null;
            this.editFormChildren = [];
        },

        switchToEditMode() {
            this.editFormMode = 'edit';
        },

        switchToViewMode() {
            this.editFormMode = 'view';
        },

        async saveEditForm() {
            this.editFormLoading = true;
            this.editFormError = null;
            this.editFormSuccess = null;

            try {
                // Подготавливаем данные для API - отправляем ВСЕ поля, включая биографию и связи
                const personData = {
                    firstName: this.editFormData.firstName,
                    lastName: this.editFormData.lastName,
                    middleName: this.editFormData.middleName || null,
                    gender: this.editFormData.gender,
                    birthDate: this.editFormData.birthDate || null,
                    deathDate: this.editFormData.deathDate || null,
                    biography: this.editFormData.biography || null,
                    // Сохраняем связи с родителями
                    parent1: this.editFormPerson.parent1 ? { id: this.editFormPerson.parent1.id } : null,
                    parent2: this.editFormPerson.parent2 ? { id: this.editFormPerson.parent2.id } : null,
                    // Сохраняем супруга, если есть
                    spouseId: this.editFormPerson.spouse ? this.editFormPerson.spouse.id : null
                };

                // Обновляем персону через API
                await axios.put(
                    this.apiUrl(`http://localhost:8080/api/persons/${this.editFormData.id}`),
                    personData
                );

                this.editFormSuccess = 'Данные успешно обновлены!';

                // Обновляем дерево через 1 секунду
                setTimeout(() => {
                    this.refreshTree();
                    this.closeEditForm();
                }, 1000);

            } catch (error) {
                this.editFormError = 'Ошибка при сохранении: ' +
                    (error.response?.data?.message || error.message);
            } finally {
                this.editFormLoading = false;
            }
        },

        initFamilyTree() {
            // Ждем, пока DOM будет готов
            this.$nextTick(() => {
                const treeElement = document.getElementById('tree');
                if (!treeElement) {
                    return;
                }

                // Проверяем, что библиотека FamilyTree загружена
                if (typeof FamilyTree === 'undefined') {
                    this.error = 'Библиотека FamilyTree не загружена. Проверьте подключение скрипта.';
                    return;
                }

                // Настраиваем шаблоны
                this.setupTemplates();

                // Преобразуем данные
                let familyData = this.persons.map(p => this.convertPersonToFamilyTreeFormat(p));

                // Убеждаемся, что все родители включены в данные
                // Это важно для правильного раскрытия/коллапса вложенных деревьев
                // Рекурсивно находим всех родителей, включая родителей партнеров
                const allPersonIds = new Set(familyData.map(n => n.id));
                const missingParents = new Set();

                // Функция для рекурсивного поиска всех родителей
                const findMissingParents = (nodeId) => {
                    const node = familyData.find(n => n.id === nodeId);
                    if (!node) return;

                    // Проверяем отца
                    if (node.fid && !allPersonIds.has(node.fid)) {
                        const parent = this.persons.find(p => p.id === node.fid);
                        if (parent && !missingParents.has(parent.id)) {
                            missingParents.add(parent.id);
                            // Рекурсивно ищем родителей этого родителя
                            findMissingParents(node.fid);
                        }
                    }

                    // Проверяем мать
                    if (node.mid && !allPersonIds.has(node.mid)) {
                        const parent = this.persons.find(p => p.id === node.mid);
                        if (parent && !missingParents.has(parent.id)) {
                            missingParents.add(parent.id);
                            // Рекурсивно ищем родителей этого родителя
                            findMissingParents(node.mid);
                        }
                    }

                    // Проверяем родителей партнеров
                    if (node.pids && node.pids.length > 0) {
                        node.pids.forEach(partnerId => {
                            const partner = familyData.find(n => n.id === partnerId);
                            if (partner) {
                                findMissingParents(partnerId);
                            }
                        });
                    }
                };

                // Находим всех недостающих родителей для всех узлов
                familyData.forEach(node => {
                    findMissingParents(node.id);
                });

                // Добавляем недостающих родителей
                if (missingParents.size > 0) {
                    const missingNodes = Array.from(missingParents)
                        .map(id => {
                            const parent = this.persons.find(p => p.id === id);
                            return parent ? this.convertPersonToFamilyTreeFormat(parent) : null;
                        })
                        .filter(n => n !== null);
                    familyData = familyData.concat(missingNodes);
                }

                // Убеждаемся, что супружеские связи двусторонние
                // Если у узла A есть pids: [B], то у узла B тоже должно быть pids: [A]
                familyData.forEach(node => {
                    if (node.pids && node.pids.length > 0) {
                        node.pids.forEach(partnerId => {
                            const partnerNode = familyData.find(n => n.id === partnerId);
                            if (partnerNode) {
                                // Убеждаемся, что у партнера тоже есть связь обратно
                                if (!partnerNode.pids) {
                                    partnerNode.pids = [];
                                }
                                if (!partnerNode.pids.includes(node.id)) {
                                    partnerNode.pids.push(node.id);
                                }
                            }
                        });
                    }
                });

                // Создаем кастомную форму редактирования
                const customEditForm = this.createCustomEditForm();

                // Сохраняем ссылку на компонент для использования в обработчиках
                const self = this;

                // Создаем SVG иконку для "Детали"
                const detailsIcon = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#aeaeae"/>
                </svg>`;

                // Обработчик для пункта "Детали"
                const detailsHandler = (nodeId) => {
                    self.$router.push(`/persons/${nodeId}`);
                };

                // Создаем экземпляр дерева
                this.family = new FamilyTree(treeElement, {
                    template: "main",
                    scaleInitial: FamilyTree.match.boundary,
                    mouseScrool: FamilyTree.action.zoom,
                    nodeMenu: {
                        details: {
                            icon: detailsIcon,
                            text: "Детали",
                            onClick: detailsHandler
                        },
                        edit: {
                            text: "Редактировать",
                            icon: FamilyTree.icon.edit(24, 24, '#aeaeae'),
                            onClick: function (nodeId) {
                                self.openEditForm(nodeId, 'edit');
                            }
                        }
                    },
                    nodeBinding: {
                        field_0: "years",
                        field_1: "name",
                        field_2: "genderIcon",
                        img_0: "img",
                    },
                    editUI: customEditForm,
                    tags: {
                        "single_male": {
                            template: "single_male"
                        },
                        "single_female": {
                            template: "single_female"
                        },
                        "main_female_child": {
                            template: "main_female_child"
                        },
                        "main_male_child": {
                            template: "main_male_child"
                        },
                        "family_single_female": {
                            template: "family_single_female"
                        },
                        "family_single_male": {
                            template: "family_single_male"
                        }
                    }
                });

                // Обработчик для отображения сердечка на связях
                this.family.on('render-link', (sender, args) => {
                    if (args.cnode.ppid != undefined) {
                        args.html += '<use xlink:href="#heart" x="' + args.p.xa + '" y="' + args.p.ya + '"/>';
                    }
                });

                // Функция для нахождения корневого узла (поднимается по родителям до самого верха)
                // Поднимается по матери (mid) до самого верха дерева
                const getRootOf = (node) => {
                    if (!node) {
                        return null;
                    }
                    let current = node;
                    let iterations = 0;
                    const maxIterations = 100; // Защита от бесконечного цикла

                    while (current && iterations < maxIterations) {
                        iterations++;
                        const mid = current.mid;
                        if (!mid) {
                            break;
                        }

                        const parentNode = self.family.getNode(mid);
                        if (!parentNode) {
                            break;
                        }

                        current = parentNode;
                    }

                    return current;
                };

                // Обработчик клика на узел - открываем форму в режиме просмотра
                this.family.on('node-click', (sender, args) => {
                    if (args && args.node) {
                        // Открываем форму в режиме просмотра
                        self.openEditForm(args.node, 'view');
                    }
                });


                // Добавляем обработчик клика через DOM после загрузки дерева
                this.family.on('ready', () => {
                    const self = this;
                    setTimeout(() => {
                        const treeSvg = treeElement.querySelector('svg');
                        if (treeSvg) {
                            // Перехватываем клики на пункты меню "Детали" на уровне DOM
                            // Используем делегирование событий на весь контейнер дерева
                            const treeContainer = treeElement;
                            treeContainer.addEventListener('click', (e) => {
                                let target = e.target;

                                // Ищем элемент меню "Детали"
                                // НЕ перехватываем клики на иконку дерева - позволяем библиотеке обработать их стандартным образом
                                while (target && target !== treeContainer) {
                                    // Проверяем, является ли это пунктом меню "Детали"
                                    if (target.textContent && target.textContent.includes('Детали')) {
                                        // Ищем родительский элемент с data-id узла
                                        let parent = target.parentElement;
                                        let nodeId = null;
                                        while (parent && parent !== treeContainer) {
                                            if (parent.getAttribute && parent.getAttribute('data-id')) {
                                                nodeId = parseInt(parent.getAttribute('data-id'));
                                                break;
                                            }
                                            // Также проверяем SVG элементы
                                            const svgParent = parent.closest('svg');
                                            if (svgParent) {
                                                const nodeElement = svgParent.querySelector('[data-id]');
                                                if (nodeElement) {
                                                    nodeId = parseInt(nodeElement.getAttribute('data-id'));
                                                    break;
                                                }
                                            }
                                            parent = parent.parentElement;
                                        }

                                        if (nodeId) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            // Устанавливаем флаг
                                            self.preventEditFormOpen = true;
                                            // Выполняем переадресацию
                                            self.$router.push(`/persons/${nodeId}`);
                                            // Сбрасываем флаг
                                            setTimeout(() => {
                                                self.preventEditFormOpen = false;
                                            }, 300);
                                            return;
                                        }
                                    }
                                    target = target.parentElement;
                                }
                            }, true); // Используем capture phase для раннего перехвата

                            // Убрали обработчик клика на узел - форма редактирования открывается только через меню

                            // Делаем все узлы кликабельными
                            const allNodes = treeSvg.querySelectorAll('g');
                            allNodes.forEach(node => {
                                if (node.getAttribute && node.getAttribute('data-id')) {
                                    node.style.cursor = 'pointer';
                                }
                            });
                        }
                    }, 1000);
                });

                // Устанавливаем начальный корневой узел при инициализации
                // Находим первый узел без родителей (или с минимальным количеством родителей)
                this.family.onInit(() => {
                    if (familyData.length > 0) {
                        // Находим узел без родителей или с минимальным количеством родителей
                        let rootNode = null;
                        for (const node of familyData) {
                            if (!node.fid && !node.mid) {
                                rootNode = node;
                                break;
                            }
                        }

                        // Если не нашли узел без родителей, используем первый узел
                        if (!rootNode) {
                            rootNode = familyData[0];
                        }

                        // Находим корневой узел для выбранного узла
                        if (rootNode) {
                            const root = getRootOf(rootNode);
                            if (root) {
                                this.family.config.roots = [root.id];
                                this.family.draw();
                            }
                        }
                    }
                });

                // Загружаем данные
                this.family.load(familyData);
            });
        },

        setupTemplates() {
            // Настройка базовых определений
            FamilyTree.templates.base.defs =
                `<g transform="matrix(0.05,0,0,0.05,-12,-9)" id="heart">
                    <path fill="#aeaeae" d="M438.482,58.61c-24.7-26.549-59.311-41.655-95.573-41.711c-36.291,0.042-70.938,15.14-95.676,41.694l-8.431,8.909  l-8.431-8.909C181.284,5.762,98.663,2.728,45.832,51.815c-2.341,2.176-4.602,4.436-6.778,6.778 c-52.072,56.166-52.072,142.968,0,199.134l187.358,197.581c6.482,6.843,17.284,7.136,24.127,0.654 c0.224-0.212,0.442-0.43,0.654-0.654l187.29-197.581C490.551,201.567,490.551,114.77,438.482,58.61z"/>
                </g>
                <g transform="matrix(1,0,0,1,0,0)" id="dot"></g>
                <g id="base_node_menu" style="cursor:pointer;">
                    <rect x="0" y="0" fill="transparent" width="22" height="22"></rect>
                    <circle cx="4" cy="11" r="2" fill="#b1b9be"></circle>
                    <circle cx="11" cy="11" r="2" fill="#b1b9be"></circle>
                    <circle cx="18" cy="11" r="2" fill="#b1b9be"></circle>
                </g>
                <g style="cursor: pointer;" id="base_tree_menu">
                    <rect x="0" y="0" width="25" height="25" fill="transparent"></rect>
                    ${FamilyTree.icon.addUser(25, 25, '#fff', 0, 0)}
                </g>
                <g style="cursor: pointer;" id="base_tree_menu_close">
                    <circle cx="12.5" cy="12.5" r="12" fill="#F57C00"></circle>
                    ${FamilyTree.icon.close(25, 25, '#fff', 0, 0)}
                </g>            
                <g id="base_up">
                    <circle cx="115" cy="30" r="15" fill="#fff" stroke="#b1b9be" stroke-width="1"></circle>
                    ${FamilyTree.icon.ft(20, 80, '#b1b9be', 105, -10)}
                </g>
                <clipPath id="base_img_0">
                    <circle id="base_img_0_stroke" cx="45" cy="62" r="35"/>
                </clipPath>
                <clipPath id="base_img_1">
                    <circle id="base_img_1_stroke" cx="100" cy="62" r="35"/>
                </clipPath>`;

            // Основной шаблон
            FamilyTree.templates.main = Object.assign({}, FamilyTree.templates.base);
            FamilyTree.templates.main.defs = `<style>
                .{randId} .bft-edit-form-header, .{randId} .bft-img-button{
                    background-color: #aeaeae;
                }
                .{randId}.male .bft-edit-form-header, .{randId}.male .bft-img-button{
                    background-color: #6bb4df;
                }        
                .{randId}.male div.bft-img-button:hover{
                    background-color: #cb4aaf;
                }
                .{randId}.female .bft-edit-form-header, .{randId}.female .bft-img-button{
                    background-color: #cb4aaf;
                }        
                .{randId}.female div.bft-img-button:hover{
                    background-color: #6bb4df;
                }
            </style>`;

            FamilyTree.templates.main.node = '<rect x="0" y="0" height="{h}" width="{w}" fill="#ffffff" stroke-width="3" stroke="#ccc" rx="5" ry="5"></rect>' +
                '<rect x="0" y="0" height="20" width="{w}" fill="#b1b9be" stroke-width="1" stroke="#b1b9be" rx="5" ry="5"></rect>' +
                '<line x1="0" y1="20" x2="250" y2="20" stroke-width="5" stroke="#b1b9be"></line>';

            FamilyTree.templates.main.field_0 =
                '<text ' + FamilyTree.attr.width + ' ="250" style="font-size: 14px;" font-variant="all-small-caps" fill="white" x="125" y="16" text-anchor="middle">{val}</text>';
            FamilyTree.templates.main.field_1 =
                '<text ' + FamilyTree.attr.width + ' ="160" data-text-overflow="multiline" style="font-size: 14px;" fill="black" x="100" y="66" text-anchor="start">{val}</text>';
            FamilyTree.templates.main.field_2 =
                '<image xlink:href="{val}" x="100" y="85" width="24" height="24"/>';
            FamilyTree.templates.main.img_0 =
                `<use xlink:href="#base_img_0_stroke" /> 
                <circle id="base_img_0_stroke" fill="#b1b9be" cx="45" cy="62" r="37"/>
                <image preserveAspectRatio="xMidYMid slice" clip-path="url(#base_img_0)" xlink:href="{val}" x="10" y="26" width="72" height="72"></image>`;

            // Мужской шаблон
            FamilyTree.templates.main_male = Object.assign({}, FamilyTree.templates.main);
            FamilyTree.templates.main_male.node = '<rect x="0" y="0" height="{h}" width="{w}" fill="#ffffff" stroke-width="3" stroke="#6bb4df" rx="5" ry="5"></rect>' +
                '<rect x="0" y="0" height="20" width="{w}" fill="#6bb4df" stroke-width="1" stroke="#6bb4df" rx="5" ry="5"></rect>' +
                '<line x1="0" y1="20" x2="250" y2="20" stroke-width="5" stroke="#6bb4df"></line>';
            FamilyTree.templates.main_male.img_0 =
                `<use xlink:href="#base_img_0_stroke" /> 
                <circle id="base_img_0_stroke" fill="#6bb4df" cx="45" cy="62" r="37"/>
                <image preserveAspectRatio="xMidYMid slice" clip-path="url(#base_img_0)" xlink:href="{val}" x="10" y="26" width="72" height="72"></image>`;
            FamilyTree.templates.main_male_child = Object.assign({}, FamilyTree.templates.main_male);
            FamilyTree.templates.main_male_child.link = '<path stroke-linejoin="round" stroke="#aeaeae" stroke-width="2px" fill="none" d="{rounded}" />';

            // Женский шаблон
            FamilyTree.templates.main_female = Object.assign({}, FamilyTree.templates.main_male);
            FamilyTree.templates.main_female.node = '<rect x="0" y="0" height="{h}" width="{w}" fill="#ffffff" stroke-width="3" stroke="#cb4aaf" rx="5" ry="5"></rect>' +
                '<rect x="0" y="0" height="20" width="{w}" fill="#cb4aaf" stroke-width="1" stroke="#cb4aaf" rx="5" ry="5"></rect>' +
                '<line x1="0" y1="20" x2="250" y2="20" stroke-width="5" stroke="#cb4aaf"></line>';
            FamilyTree.templates.main_female.img_0 =
                `<use xlink:href="#base_img_0_stroke" /> 
                <circle id="base_img_0_stroke" fill="#cb4aaf" cx="45" cy="62" r="37"/>
                <image preserveAspectRatio="xMidYMid slice" clip-path="url(#base_img_0)" xlink:href="{val}" x="10" y="26" width="72" height="72"></image>`;
            FamilyTree.templates.main_female_child = Object.assign({}, FamilyTree.templates.main_female);
            FamilyTree.templates.main_female_child.link = '<path stroke-linejoin="round" stroke="#aeaeae" stroke-width="2px" fill="none" d="{rounded}" />';

            // Одиночные шаблоны
            FamilyTree.templates.single = Object.assign({}, FamilyTree.templates.tommy);
            FamilyTree.templates.single.size = [200, 200];
            FamilyTree.templates.single.defs = `<style>
                .{randId} .bft-edit-form-header, .{randId} .bft-img-button{
                    background-color: #aeaeae;
                }
                .{randId}.male .bft-edit-form-header, .{randId}.male .bft-img-button{
                    background-color: #6bb4df;
                }        
                .{randId}.male div.bft-img-button:hover{
                    background-color: #cb4aaf;
                }
                .{randId}.female .bft-edit-form-header, .{randId}.female .bft-img-button{
                    background-color: #cb4aaf;
                }        
                .{randId}.female div.bft-img-button:hover{
                    background-color: #6bb4df;
                }
            </style>`;
            FamilyTree.templates.single.node =
                '<circle cx="100" cy="100" r="100" fill="white" stroke-width="1" stroke="#aeaeae"></circle>';
            FamilyTree.templates.single.field_0 = '<text ' + FamilyTree.attr.width + ' ="160" style="font-size: 14px;" font-variant="all-small-caps"  font-weight="bold" fill="black" x="100" y="115" text-anchor="middle">{val}</text>';
            FamilyTree.templates.single.field_1 = '<text ' + FamilyTree.attr.width + ' ="190" data-text-overflow="multiline" style="font-size: 16px;" fill="black" x="100" y="135" text-anchor="middle">{val}</text>';
            FamilyTree.templates.single.nodeMenuButton = `<use ${FamilyTree.attr.control_node_menu_id}="{id}" x="89" y="5" xlink:href="#base_node_menu" />`;

            FamilyTree.templates.single_male = Object.assign({}, FamilyTree.templates.single);
            FamilyTree.templates.single_male.node = '<circle cx="100" cy="100" r="100" fill="white" stroke-width="3" stroke="#6bb4df" ></circle>';
            FamilyTree.templates.single_male.img_0 =
                `<use xlink:href="#base_img_1_stroke"/> 
                <circle id="base_img_1_stroke" fill="#6bb4df" cx="100" cy="62" r="37"/>
                <image preserveAspectRatio="xMidYMid slice" clip-path="url(#base_img_1)" xlink:href="{val}" x="65" y="26" width="72" height="72"></image>`;

            FamilyTree.templates.single_female = Object.assign({}, FamilyTree.templates.single_male);
            FamilyTree.templates.single_female.node = '<circle cx="100" cy="100" r="100" fill="white" stroke-width="3" stroke="#cb4aaf" ></circle>';
            FamilyTree.templates.single_female.img_0 =
                `<use xlink:href="#base_img_1_stroke"/> 
                <circle id="base_img_1_stroke" fill="#cb4aaf" cx="100" cy="62" r="37"/>
                <image preserveAspectRatio="xMidYMid slice" clip-path="url(#base_img_1)" xlink:href="{val}" x="65" y="26" width="72" height="72"></image>`;

            FamilyTree.templates.family_single_male = Object.assign({}, FamilyTree.templates.single_male);
            FamilyTree.templates.family_single_male.link = '<path stroke-linejoin="round" stroke="#aeaeae" stroke-width="2px" fill="none" d="{rounded}" />';
            FamilyTree.templates.family_single_female = Object.assign({}, FamilyTree.templates.single_female);
            FamilyTree.templates.family_single_female.link = '<path stroke-linejoin="round" stroke="#aeaeae" stroke-width="2px" fill="none" d="{rounded}" />';
        }
    }
};

