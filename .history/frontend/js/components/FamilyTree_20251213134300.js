const FamilyTreeComponent = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h1><i class="bi bi-diagram-3"></i> Семейное Древо</h1>
                <button v-if="family" @click="refreshTree" class="btn btn-primary">
                    <i class="bi bi-arrow-clockwise"></i> Обновить
                </button>
            </div>
            
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
                <p class="mt-2">Загрузка семейного дерева...</p>
            </div>
            
            <div v-else-if="error" class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> {{ error }}
            </div>
            
            <div v-else-if="persons.length === 0" class="text-center text-muted py-5">
                <i class="bi bi-diagram-3 display-1"></i>
                <p class="mt-3">Нет данных для отображения семейного дерева</p>
                <router-link to="/persons/new" class="btn btn-primary">
                    Добавить первую персону
                </router-link>
            </div>
            
            <div v-else id="tree" class="family-tree-container"></div>
            
            <!-- Кастомная форма редактирования -->
            <div v-if="showEditForm" class="custom-edit-form-overlay" @click.self="closeEditForm">
                <div class="custom-edit-form-container">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><i class="bi bi-pencil"></i> Редактировать персону</h5>
                            <button type="button" class="btn-close" @click="closeEditForm"></button>
                        </div>
                        <div class="card-body">
                            <div v-if="editFormError" class="alert alert-danger">
                                <i class="bi bi-exclamation-triangle"></i> {{ editFormError }}
                            </div>
                            <div v-if="editFormSuccess" class="alert alert-success">
                                <i class="bi bi-check-circle"></i> {{ editFormSuccess }}
                            </div>
                            
                            <div class="row">
                                <!-- Левая колонка: фото и основная информация -->
                                <div class="col-lg-4">
                                    <div class="card mb-3">
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
                                                <div class="d-flex align-items-center mb-3">
                                                    <i :class="getGenderIcon(editFormData.gender)" class="me-2"></i>
                                                    <span>{{ getGenderDisplay(editFormData.gender) }}</span>
                                                </div>

                                                <div class="info-item mb-2">
                                                    <strong>Имя:</strong>
                                                    <p class="mb-0">{{ editFormData.firstName }}</p>
                                                </div>

                                                <div class="info-item mb-2">
                                                    <strong>Фамилия:</strong>
                                                    <p class="mb-0">{{ editFormData.lastName }}</p>
                                                </div>

                                                <div class="info-item mb-2" v-if="editFormData.middleName">
                                                    <strong>Отчество:</strong>
                                                    <p class="mb-0">{{ editFormData.middleName }}</p>
                                                </div>

                                                <div class="info-item mb-2" v-if="editFormData.birthDate">
                                                    <strong>Дата рождения:</strong>
                                                    <p class="mb-0">{{ formatDate(editFormData.birthDate) }}</p>
                                                </div>

                                                <div class="info-item mb-2" v-if="editFormData.deathDate">
                                                    <strong>Дата смерти:</strong>
                                                    <p class="mb-0">{{ formatDate(editFormData.deathDate) }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Правая колонка: форма редактирования и связи -->
                                <div class="col-lg-8">
                                    <form @submit.prevent="saveEditForm">
                                        <div class="row">
                                            <div class="col-md-4">
                                                <div class="mb-3">
                                                    <label class="form-label">Имя *</label>
                                                    <input v-model="editFormData.firstName" 
                                                           type="text" 
                                                           class="form-control" 
                                                           required>
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="mb-3">
                                                    <label class="form-label">Фамилия *</label>
                                                    <input v-model="editFormData.lastName" 
                                                           type="text" 
                                                           class="form-control"
                                                           required>
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="mb-3">
                                                    <label class="form-label">Отчество</label>
                                                    <input v-model="editFormData.middleName" 
                                                           type="text" 
                                                           class="form-control">
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="row">
                                            <div class="col-md-4">
                                                <div class="mb-3">
                                                    <label class="form-label">Пол *</label>
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
                                                    <label class="form-label">Дата рождения</label>
                                                    <input v-model="editFormData.birthDate" 
                                                           type="date" 
                                                           class="form-control"
                                                           :max="today">
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="mb-3">
                                                    <label class="form-label">Дата смерти</label>
                                                    <input v-model="editFormData.deathDate" 
                                                           type="date" 
                                                           class="form-control"
                                                           :min="editFormData.birthDate"
                                                           :max="today">
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="d-flex gap-2 justify-content-end mb-4">
                                            <button type="button" 
                                                    class="btn btn-outline-secondary"
                                                    @click="closeEditForm">
                                                Отмена
                                            </button>
                                            <button type="submit" 
                                                    class="btn btn-primary"
                                                    :disabled="editFormLoading">
                                                <span v-if="editFormLoading" class="spinner-border spinner-border-sm me-2"></span>
                                                <i v-else class="bi bi-check-lg"></i>
                                                Сохранить
                                            </button>
                                        </div>
                                    </form>

                                    <!-- Родители -->
                                    <div class="card mb-3" v-if="editFormPerson.parent1 || editFormPerson.parent2">
                                        <div class="card-body">
                                            <h6><i class="bi bi-people"></i> Родители</h6>
                                            <div class="list-group">
                                                <div v-if="editFormPerson.parent1" 
                                                     class="list-group-item list-group-item-action"
                                                     style="cursor: pointer;"
                                                     @click="viewPersonInTree(editFormPerson.parent1.id)">
                                                    <i class="bi bi-gender-male text-primary me-2"></i>
                                                    {{ editFormPerson.parent1.firstName }} {{ editFormPerson.parent1.lastName }}
                                                </div>
                                                <div v-if="editFormPerson.parent2" 
                                                     class="list-group-item list-group-item-action"
                                                     style="cursor: pointer;"
                                                     @click="viewPersonInTree(editFormPerson.parent2.id)">
                                                    <i class="bi bi-gender-female text-danger me-2"></i>
                                                    {{ editFormPerson.parent2.firstName }} {{ editFormPerson.parent2.lastName }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Дети -->
                                    <div class="card mb-3" v-if="editFormChildren.length > 0">
                                        <div class="card-body">
                                            <h6><i class="bi bi-people"></i> Дети</h6>
                                            <div class="list-group">
                                                <div v-for="child in editFormChildren" 
                                                     :key="child.id"
                                                     class="list-group-item list-group-item-action"
                                                     style="cursor: pointer;"
                                                     @click="viewPersonInTree(child.id)">
                                                    <i :class="getGenderIcon(child.gender)" class="me-2"></i>
                                                    {{ child.firstName }} {{ child.lastName }}
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
    methods: {
        async loadPersons() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get('http://localhost:8080/api/persons');
                this.persons = response.data;

                // Загружаем фото для каждой персоны
                for (const person of this.persons) {
                    try {
                        const photoResp = await axios.get(`http://localhost:8080/api/photos/person/${person.id}/main`);
                        const photo = photoResp.data;
                        person.mainPhotoUrl = `http://localhost:8080/api/photos/file/${photo.fileName}`;
                    } catch (err) {
                        if (err.response && err.response.status !== 404) {
                            console.warn('Ошибка при получении фото для персоны', person.id, err.message);
                        }
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
                // Открываем форму с данными узла
                self.openEditForm(node);
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

        getNodeId(node) {
            // Определяем ID узла - может быть передан как объект с id, или просто число
            if (typeof node === 'number') {
                return node;
            } else if (node && node.id) {
                return node.id;
            } else if (node && typeof node === 'object') {
                // Пытаемся найти ID в объекте
                return node.id || node.nodeId || node.pid;
            }
            return null;
        },

        openEditForm(node) {
            console.log('Открытие формы редактирования для узла:', node);

            const nodeId = this.getNodeId(node);
            if (!nodeId) {
                console.error('Не удалось определить ID узла:', node);
                this.editFormError = 'Не удалось определить узел';
                this.showEditForm = true;
                return;
            }

            console.log('ID узла:', nodeId);

            // Находим оригинальную персону по ID
            const person = this.persons.find(p => p.id === nodeId);
            if (!person) {
                console.error('Персона не найдена для ID:', nodeId);
                this.editFormError = 'Персона не найдена';
                this.showEditForm = true; // Показываем форму даже с ошибкой
                return;
            }

            console.log('Найдена персона:', person);

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
        },

        async loadEditFormPhoto(personId) {
            try {
                const response = await axios.get(`http://localhost:8080/api/photos/person/${personId}/main`);
                const photo = response.data;
                this.editFormMainPhoto = photo;
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    this.editFormMainPhoto = null;
                } else {
                    console.warn('Ошибка при загрузке фото:', err);
                    this.editFormMainPhoto = null;
                }
            }
        },

        async loadEditFormChildren(personId) {
            try {
                const response = await axios.get(`http://localhost:8080/api/persons/${personId}/children`);
                this.editFormChildren = response.data;
            } catch (err) {
                console.warn('Ошибка при загрузке детей:', err);
                this.editFormChildren = [];
            }
        },

        getPhotoUrl(fileName) {
            return `http://localhost:8080/api/photos/file/${fileName}`;
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
            this.editFormError = null;
            this.editFormSuccess = null;
            this.editFormPerson = {};
            this.editFormMainPhoto = null;
            this.editFormChildren = [];
        },

        async saveEditForm() {
            this.editFormLoading = true;
            this.editFormError = null;
            this.editFormSuccess = null;

            try {
                // Подготавливаем данные для API
                const personData = {
                    firstName: this.editFormData.firstName,
                    lastName: this.editFormData.lastName,
                    middleName: this.editFormData.middleName,
                    gender: this.editFormData.gender,
                    birthDate: this.editFormData.birthDate || null,
                    deathDate: this.editFormData.deathDate || null
                };

                // Обновляем персону через API
                await axios.put(
                    `http://localhost:8080/api/persons/${this.editFormData.id}`,
                    personData
                );

                this.editFormSuccess = 'Данные успешно обновлены!';

                // Обновляем дерево через 1 секунду
                setTimeout(() => {
                    this.refreshTree();
                    this.closeEditForm();
                }, 1000);

            } catch (error) {
                console.error('❌ Ошибка обновления персоны:', error);
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
                    console.error('Элемент #tree не найден');
                    return;
                }

                // Проверяем, что библиотека FamilyTree загружена
                if (typeof FamilyTree === 'undefined') {
                    console.error('Библиотека FamilyTree не загружена');
                    this.error = 'Библиотека FamilyTree не загружена. Проверьте подключение скрипта.';
                    return;
                }

                // Настраиваем шаблоны
                this.setupTemplates();

                // Преобразуем данные
                const familyData = this.persons.map(p => this.convertPersonToFamilyTreeFormat(p));

                // Создаем кастомную форму редактирования
                const customEditForm = this.createCustomEditForm();

                // Создаем экземпляр дерева
                this.family = new FamilyTree(treeElement, {
                    template: "main",
                    scaleInitial: FamilyTree.match.boundary,
                    mouseScrool: FamilyTree.action.zoom,
                    nodeMenu: {
                        details: { text: "Детали" },
                        edit: { text: "Редактировать" }
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

                // Обработчик клика на узел - используем событие 'node-click' библиотеки
                this.family.on('node-click', (sender, args) => {
                    console.log('Клик на узел:', args);
                    if (args && args.node) {
                        this.openEditForm(args.node);
                    }
                });

                // Обработчик выбора пункта меню
                this.family.on('node-menu-click', (sender, args) => {
                    console.log('Клик в меню узла:', args);
                    if (!args || !args.node) return;

                    const nodeId = this.getNodeId(args.node);
                    if (!nodeId) {
                        console.error('Не удалось определить ID узла:', args.node);
                        return;
                    }

                    if (args.menuItem === 'details') {
                        // Переход на страницу просмотра персоны
                        this.$router.push(`/persons/${nodeId}`);
                    } else if (args.menuItem === 'edit') {
                        // Открытие формы редактирования
                        this.openEditForm(args.node);
                    }
                });

                // Добавляем обработчик клика через DOM после загрузки дерева
                this.family.on('ready', () => {
                    console.log('Дерево готово, добавляем обработчики клика');
                    const self = this;
                    setTimeout(() => {
                        const treeSvg = treeElement.querySelector('svg');
                        if (treeSvg) {
                            // Используем делегирование событий на весь SVG
                            treeSvg.addEventListener('click', (e) => {
                                // Ищем ближайший родительский элемент с data-id
                                let target = e.target;
                                let nodeId = null;

                                // Поднимаемся по DOM дереву, ищем data-id
                                while (target && target !== treeSvg) {
                                    if (target.getAttribute && target.getAttribute('data-id')) {
                                        nodeId = parseInt(target.getAttribute('data-id'));
                                        break;
                                    }
                                    target = target.parentElement;
                                }

                                if (nodeId) {
                                    console.log('Клик на узел с ID:', nodeId);
                                    e.stopPropagation();
                                    // Передаем ID напрямую, метод openEditForm сам найдет персону
                                    self.openEditForm(nodeId);
                                }
                            });

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

                // Загружаем данные
                this.family.load(familyData);

                console.log('✅ Семейное дерево инициализировано с', familyData.length, 'узлами');
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

