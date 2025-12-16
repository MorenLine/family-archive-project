const PersonForm = {
    template: `
        <div class="person-form-page">
            <!-- Hero Section -->
            <div class="hero-section-person">
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-lg-8">
                            <div class="hero-content-person">
                                <h1 class="display-4 fw-bold mb-3">
                                    <i class="bi me-3" :class="isEditMode ? 'bi-person-check' : 'bi-person-plus'"></i>
                                    {{ isEditMode ? 'Редактировать персону' : 'Новая персона' }}
                                </h1>
                                <p class="lead mb-0">Заполните информацию о члене семьи</p>
                            </div>
                        </div>
                        <div class="col-lg-4 text-end">
                            <div class="hero-actions">
                                <router-link :to="routeWithUser('/persons')" class="btn btn-outline-light btn-lg" style="position: relative; z-index: 10; pointer-events: auto;">
                                    <i class="bi bi-arrow-left me-2"></i>Назад к списку
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container mt-4">
                <div class="row">
                    <!-- Основная форма -->
                    <div class="col-lg-8">
                        <div class="person-form-card card shadow-sm mb-4">
                            <div class="card-header bg-white border-bottom">
                                <h5 class="mb-0"><i class="bi bi-info-circle me-2"></i>Основная информация</h5>
                            </div>
                        <div class="card-body">
                            <!-- Сообщения -->
                            <div v-if="successMessage" class="alert alert-success alert-dismissible fade show">
                                <i class="bi bi-check-circle"></i> {{ successMessage }}
                                <button type="button" class="btn-close" @click="successMessage = ''"></button>
                            </div>
                            
                            <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
                                <i class="bi bi-exclamation-triangle"></i> {{ errorMessage }}
                                <button type="button" class="btn-close" @click="errorMessage = ''"></button>
                            </div>

                            <!-- Форма -->
                            <form @submit.prevent="submitForm">
                                <!-- Личные данные -->
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Фамилия *</label>
                                            <input v-model="person.lastName" 
                                                   type="text" 
                                                   class="form-control"
                                                   :class="{ 'is-invalid': errors.lastName }"
                                                   placeholder="Введите фамилию"
                                                   required>
                                            <div class="invalid-feedback">{{ errors.lastName }}</div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Имя *</label>
                                            <input v-model="person.firstName" 
                                                   type="text" 
                                                   class="form-control" 
                                                   :class="{ 'is-invalid': errors.firstName }"
                                                   placeholder="Введите имя"
                                                   required>
                                            <div class="invalid-feedback">{{ errors.firstName }}</div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Отчество</label>
                                            <input v-model="person.middleName" 
                                                   type="text" 
                                                   class="form-control"
                                                   placeholder="Введите отчество">
                                        </div>
                                    </div>
                                </div>

                                <!-- Пол и даты -->
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Пол *</label>
                                            <select v-model="person.gender" 
                                                    class="form-select"
                                                    :class="{ 'is-invalid': errors.gender }"
                                                    required>
                                                <option value="">-- Выберите пол --</option>
                                                <option value="MALE">Мужской</option>
                                                <option value="FEMALE">Женский</option>
                                            </select>
                                            <div class="invalid-feedback">{{ errors.gender }}</div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Дата рождения</label>
                                            <input v-model="person.birthDate" 
                                                   type="date" 
                                                   class="form-control"
                                                   :max="today">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Дата смерти</label>
                                            <input v-model="person.deathDate" 
                                                   type="date" 
                                                   class="form-control"
                                                   :min="person.birthDate"
                                                   :max="today">
                                        </div>
                                    </div>
                                </div>

                                <!-- Биография -->
                                <div class="mb-3">
                                    <label class="form-label">Биография</label>
                                    <textarea v-model="person.biography" 
                                              class="form-control" 
                                              rows="4"
                                              placeholder="Расскажите о жизни человека, его достижениях, интересных фактах..."></textarea>
                                    <div class="form-text">Можно оставить пустым и заполнить позже</div>
                                </div>
                                <!-- Супруг(а) -->
                                <div class="mb-4" v-if="isEditMode">
                                    <label class="form-label fw-bold">Супруг(а)</label>
                                    <div class="row">
                                        <div class="col-md-8">
                                            <div class="parent-select" ref="spouseDropdown">
                                                <div
                                                    class="form-select d-flex justify-content-between align-items-center"
                                                    role="button"
                                                    @click="toggleSpouseDropdown"
                                                >
                                                    <span>
                                                        {{ displaySpouseName(person.spouseId) || '-- Не выбрано --' }}
                                                    </span>
                                                </div>
                                                <div v-if="spouseDropdownOpen" class="parent-dropdown">
                                                    <div class="p-2 border-bottom bg-light">
                                                        <input
                                                            v-model="spouseSearch"
                                                            type="text"
                                                            class="form-control form-control-sm"
                                                            placeholder="Поиск по имени, фамилии"
                                                            @click.stop
                                                        >
                                                    </div>
                                                    <div class="parent-options">
                                                        <div
                                                            class="parent-option"
                                                            :class="{ 'active': person.spouseId === null }"
                                                            @click="selectSpouse(null)"
                                                        >
                                                            -- Не выбрано --
                                                        </div>
                                                        <div
                                                            v-for="p in filterSpousesByQuery(spouseSearch)"
                                                            :key="p.id"
                                                            class="parent-option"
                                                            :class="{ 'active': person.spouseId === p.id }"
                                                            @click="selectSpouse(p.id)"
                                                        >
                                                            <div class="fw-bold">{{ formatFullName(p) }}</div>
                                                            <small class="text-muted" v-if="p.birthDate">({{ formatYear(p.birthDate) }})</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="d-flex gap-2">
                                                <button v-if="person.spouseId" 
                                                        @click="clearSpouse"
                                                        class="btn btn-outline-danger w-100"
                                                        type="button">
                                                    <i class="bi bi-heartbreak"></i> Развестись
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-text" v-if="person.spouseId">
                                        При сохранении будет зарегистрирован брак. Супруг будет автоматически обновлён.
                                    </div>
                                    <div class="form-text" v-else>
                                        Можно выбрать супруга. Супруг не может быть родственником по прямой линии.
                                    </div>
                                </div>

                                <!-- Родители -->
                                <div class="mb-4">
                                    <label class="form-label fw-bold">Родители</label>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Первый родитель</label>
                                                <div class="parent-select" ref="parent1Dropdown">
                                                    <div
                                                        class="form-select d-flex justify-content-between align-items-center"
                                                        role="button"
                                                        @click="toggleParentDropdown('parent1')"
                                                    >
                                                        <span>
                                                            {{ displayParentName(person.parent1Id) || '-- Не выбрано --' }}
                                                        </span>
                                                    </div>
                                                    <div v-if="parentDropdownOpen.parent1" class="parent-dropdown">
                                                        <div class="p-2 border-bottom bg-light">
                                                            <input
                                                                v-model="parentSearch.parent1"
                                                                type="text"
                                                                class="form-control form-control-sm"
                                                                placeholder="Поиск по имени, фамилии"
                                                                @click.stop
                                                            >
                                                        </div>
                                                        <div class="parent-options">
                                                            <div
                                                                class="parent-option"
                                                                :class="{ 'active': person.parent1Id === null }"
                                                                @click="selectParent('parent1', null)"
                                                            >
                                                                -- Не выбрано --
                                                            </div>
                                                            <div
                                                                v-for="p in filterParentsByQuery(parentSearch.parent1)"
                                                                :key="p.id"
                                                                class="parent-option"
                                                                :class="{ 'active': person.parent1Id === p.id }"
                                                                @click="selectParent('parent1', p.id)"
                                                            >
                                                                <div class="fw-bold">{{ formatFullName(p) }}</div>
                                                                <small class="text-muted" v-if="p.birthDate">({{ formatYear(p.birthDate) }})</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Второй родитель</label>
                                                <div class="parent-select" ref="parent2Dropdown">
                                                    <div
                                                        class="form-select d-flex justify-content-between align-items-center"
                                                        role="button"
                                                        @click="toggleParentDropdown('parent2')"
                                                    >
                                                        <span>
                                                            {{ displayParentName(person.parent2Id) || '-- Не выбрано --' }}
                                                        </span>
                                                    </div>
                                                    <div v-if="parentDropdownOpen.parent2" class="parent-dropdown">
                                                        <div class="p-2 border-bottom bg-light">
                                                            <input
                                                                v-model="parentSearch.parent2"
                                                                type="text"
                                                                class="form-control form-control-sm"
                                                                placeholder="Поиск по имени, фамилии"
                                                                @click.stop
                                                            >
                                                        </div>
                                                        <div class="parent-options">
                                                            <div
                                                                class="parent-option"
                                                                :class="{ 'active': person.parent2Id === null }"
                                                                @click="selectParent('parent2', null)"
                                                            >
                                                                -- Не выбрано --
                                                            </div>
                                                            <div
                                                                v-for="p in filterParentsByQuery(parentSearch.parent2)"
                                                                :key="p.id"
                                                                class="parent-option"
                                                                :class="{ 'active': person.parent2Id === p.id }"
                                                                @click="selectParent('parent2', p.id)"
                                                            >
                                                                <div class="fw-bold">{{ formatFullName(p) }}</div>
                                                                <small class="text-muted" v-if="p.birthDate">({{ formatYear(p.birthDate) }})</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-text">Родителей можно добавить позже</div>
                                </div>

                                <!-- Кнопки -->
                                <div class="d-flex gap-2 mt-4">
                                    <button type="submit" 
                                            class="btn btn-primary"
                                            :disabled="loading">
                                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                        <i v-else class="bi" :class="isEditMode ? 'bi-check-lg' : 'bi-plus-lg'"></i>
                                        {{ isEditMode ? 'Обновить' : 'Создать' }}
                                    </button>
                                    
                                    <button type="button" 
                                            class="btn btn-outline-secondary"
                                            @click="resetForm"
                                            :disabled="loading">
                                        <i class="bi bi-arrow-clockwise"></i> Сбросить
                                    </button>
                                    
                                    <button type="button" 
                                            class="btn btn-outline-danger ms-auto"
                                            v-if="isEditMode"
                                            @click="deletePerson"
                                            :disabled="loading">
                                        <i class="bi bi-trash"></i> Удалить
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                    <!-- Блок фотографий -->
                    <div class="col-lg-4">
                        <!-- Загрузка фотографий -->
                        <div class="person-photos-form-card card shadow-sm mb-4">
                            <div class="card-header bg-white border-bottom">
                                <h5 class="mb-0"><i class="bi bi-images me-2"></i>Фотографии</h5>
                            </div>
                        <div class="card-body">
                            <!-- Форма загрузки фото -->
                            <div v-if="isEditMode" class="mb-3">
                                <label class="form-label">Добавить фотографию</label>
                                <input type="file" 
                                       ref="photoInput"
                                       @change="handlePhotoUpload" 
                                       class="form-control" 
                                       accept="image/*"
                                       :disabled="uploadingPhoto">
                                <div class="form-text">Можно загрузить JPG, PNG до 10MB</div>
                                
                                <!-- Информация о загружаемом фото - теперь выводится в модальном окне -->
                            </div>

                            <!-- Список фотографий -->
                            <div v-if="isEditMode && photos.length > 0">
                                <h6 class="border-bottom pb-2">Загруженные фотографии</h6>
                                <div class="row g-2">
                                    <div v-for="photo in photos" 
                                        :key="photo.id"
                                        class="col-6 col-md-4">
                                        <div class="card photo-card" :class="{ 'border-primary': photo.isMain }">
                                            <div class="position-relative">
                                                <img :src="getPhotoUrl(photo.fileName)" 
                                                    class="card-img-top photo-thumbnail" 
                                                    :alt="photo.description">
                                                <div v-if="photo.isMain" class="main-photo-badge">
                                                    <i class="bi bi-star-fill"></i> Главная
                                                </div>
                                            </div>
                                            <div class="card-body p-2">
                                                                <div class="photo-info">
                                                                    <small class="text-muted d-block">
                                                                        {{ photo.photoDate ? formatDate(photo.photoDate) : 'Без даты' }}
                                                                    </small>
                                                                    <strong v-if="photo.originalFileName" class="d-block text-truncate" style="max-width:140px;">
                                                                        {{ photo.originalFileName }}
                                                                    </strong>
                                                                    <small v-if="photo.description" 
                                                                        class="d-block text-truncate"
                                                                        style="max-width: 140px;">
                                                                        {{ photo.description }}
                                                                    </small>
                                                                </div>

                                                                <!-- Действия расположены под информацией о фото -->
                                                                <div class="photo-actions d-flex justify-content-center gap-1 mt-2">
                                                                    <div class="btn-group" role="group" aria-label="photo-actions">
                                                                        <button v-if="!photo.isMain"
                                                                                @click="setMainPhoto(photo.id)" 
                                                                                class="btn btn-outline-primary btn-sm"
                                                                                title="Сделать главной">
                                                                            <i class="bi bi-star"></i>
                                                                        </button>
                                                                        <button v-else
                                                                                class="btn btn-primary btn-sm"
                                                                                title="Главная фотография"
                                                                                disabled>
                                                                            <i class="bi bi-star-fill"></i>
                                                                        </button>

                                                                        <button @click="toggleEditPhoto(photo)" 
                                                                                class="btn btn-outline-secondary btn-sm"
                                                                                title="Редактировать фото">
                                                                            <i class="bi bi-pencil"></i>
                                                                        </button>

                                                                        <button @click="deletePhoto(photo.id)" 
                                                                                class="btn btn-outline-danger btn-sm"
                                                                                title="Удалить фото">
                                                                            <i class="bi bi-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <!-- Inline edit form заменён модальным окном -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-else-if="isEditMode" class="text-center text-muted py-3">
                                <i class="bi bi-images display-6"></i>
                                <p class="mt-2 small">Нет загруженных фотографий</p>
                            </div>

                            <div v-else class="alert alert-info">
                                <i class="bi bi-info-circle"></i>
                                                Фотографии можно будет добавить после создания персоны
                            </div>
                        </div>
                    </div>

                        <!-- Подсказки -->
                        <div class="person-tips-card card shadow-sm">
                            <div class="card-header bg-white border-bottom">
                                <h6 class="mb-0"><i class="bi bi-lightbulb me-2"></i>Подсказки</h6>
                            </div>
                        <div class="card-body">
                            <ul class="small mb-0">
                                <li>Поля помеченные * обязательны для заполнения</li>
                                <li>Даты можно добавить позже</li>
                                <li>Родителей можно указать после создания</li>
                                <li>Биографию можно дополнить в любое время</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Модальное окно для загрузки/редактирования фото -->
            <div v-if="showPhotoModal" class="photo-modal-overlay" @click.self="closePhotoModal"
                 style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1050;background:rgba(0,0,0,0.6);">
                <div class="card" style="max-width:900px;width:90%;max-height:90vh;overflow:auto;">
                    <div class="card-body p-3 d-flex" style="gap:1rem;">
                        <div style="flex:1;display:flex;align-items:center;justify-content:center;min-width:300px;">
                            <img v-if="modalMode==='upload' && modalPhoto" :src="modalPhoto.preview"
                                 style="max-width:100%;max-height:80vh;object-fit:contain;" />
                            <img v-else-if="modalMode==='edit' && modalPhoto" :src="getPhotoUrl(modalPhoto.fileName)"
                                 style="max-width:100%;max-height:80vh;object-fit:contain;" />
                        </div>
                        <div style="width:340px;">
                            <h5 class="mb-3">{{ modalMode === 'upload' ? 'Загрузка фотографии' : 'Редактирование фотографии' }}</h5>

                            <div class="mb-2">
                                <label class="form-label small">Название</label>
                                <input v-model="modalForm.originalFileName" type="text" class="form-control form-control-sm" />
                            </div>

                            <div class="mb-2">
                                <label class="form-label small">Описание</label>
                                <textarea v-model="modalForm.description" class="form-control form-control-sm" rows="3"></textarea>
                            </div>

                            <div class="mb-2">
                                <label class="form-label small">Дата фото</label>
                                <input v-model="modalForm.photoDate" type="date" class="form-control form-control-sm" :max="today" />
                            </div>

                            <div class="d-flex justify-content-end gap-2 mt-3">
                                <button class="btn btn-secondary" @click="closePhotoModal">Отмена</button>
                                <button class="btn btn-primary" @click="savePhotoFromModal">
                                    <i class="bi bi-check-lg me-1"></i>
                                    {{ modalMode === 'upload' ? 'Загрузить' : 'Сохранить' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `,
    data() {
        return {
            person: {
                firstName: '',
                lastName: '',
                middleName: '',
                gender: '',
                birthDate: '',
                deathDate: '',
                biography: '',
                parent1Id: null,
                parent2Id: null,
                spouseId: null // Добавляем поле для супруга
            },
            allPersons: [],
            photos: [],
            parentSearch: {
                parent1: '',
                parent2: ''
            },
            parentDropdownOpen: {
                parent1: false,
                parent2: false
            },
            spouseSearch: '',
            spouseDropdownOpen: false,

            // modal state for photo upload/edit
            showPhotoModal: false,
            modalMode: '', // 'upload' or 'edit'
            modalPhoto: null, // for edit: full photo object; for upload: newPhoto object
            modalForm: { originalFileName: '', description: '', photoDate: '' },
            newPhoto: null,
            loading: false,
            uploadingPhoto: false,
            successMessage: '',
            errorMessage: '',
            errors: {},
            today: new Date().toISOString().split('T')[0]
        }
    },
    computed: {
        targetUserId() {
            return this.$route.query.userId ? Number(this.$route.query.userId) : null;
        },
        isEditMode() {
            return this.$route.params.id !== undefined;
        },
        availableParents() {
            return this.allPersons.filter(p =>
                !this.isEditMode || p.id !== parseInt(this.$route.params.id)
            );
        },
        availableSpouses() {
            const currentPersonId = this.isEditMode ? parseInt(this.$route.params.id) : null;

            return this.allPersons.filter(p => {
                if (!p || !p.id) return false;
                // Исключаем текущую персону
                if (currentPersonId && p.id === currentPersonId) return false;

                // Проверяем, в браке ли персона (прямая или обратная связь)
                const hasSpouseDirect = p.spouse && p.spouse.id;
                const hasSpouseReverse = this.allPersons.some(otherPerson =>
                    otherPerson &&
                    otherPerson.id !== p.id &&
                    otherPerson.spouse &&
                    otherPerson.spouse.id === p.id
                );
                const isInMarriage = hasSpouseDirect || hasSpouseReverse;

                // Если персона в браке, исключаем её, кроме случая когда это текущий супруг редактируемой персоны
                if (isInMarriage) {
                    // Проверяем, является ли эта персона супругом текущей редактируемой персоны
                    const isCurrentSpouse = currentPersonId && (
                        (hasSpouseDirect && p.spouse.id === currentPersonId) ||
                        (hasSpouseReverse && this.allPersons.find(otherPerson =>
                            otherPerson &&
                            otherPerson.id === currentPersonId &&
                            otherPerson.spouse &&
                            otherPerson.spouse.id === p.id
                        ))
                    );

                    // Если это не текущий супруг, исключаем из списка
                    if (!isCurrentSpouse) {
                        return false;
                    }
                }
                return true;
            });
        }
    },
    watch: {
        async '$route.query.userId'() {
            await this.loadAllPersons();
            if (this.isEditMode) {
                await this.loadPerson();
                await this.loadPhotos();
            }
        }
    },
    async mounted() {
        document.addEventListener('click', this.handleClickOutside);
        await this.loadAllPersons();

        if (this.isEditMode) {
            await this.loadPerson();
            await this.loadPhotos();

            // Если супруг не загрузился через основной запрос, пробуем найти его через список всех персон
            // Это нужно для случаев, когда связь была установлена автоматически (обратная связь)
            if (!this.person.spouseId) {
                const currentPersonId = parseInt(this.$route.params.id);
                // Ищем персону, у которой текущая персона является супругом
                const personWithSpouse = this.allPersons.find(p =>
                    p && p.id !== currentPersonId &&
                    p.spouse && p.spouse.id === currentPersonId
                );
                if (personWithSpouse) {
                    this.person.spouseId = parseInt(personWithSpouse.id);
                }
            }
        }
    },
    beforeDestroy() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        clearSpouse() {
            if (confirm('Вы уверены, что хотите развести этих людей?')) {
                this.person.spouseId = null;
            }
        },


        async loadAllPersons() {
            try {
                const response = await axios.get(this.apiUrl('http://localhost:8080/api/persons'));
                this.allPersons = response.data;
            } catch (error) {
                // Игнорируем ошибки загрузки списка персон
            }
        },

        async loadPerson() {
            try {
                this.loading = true;
                const response = await axios.get(this.apiUrl(`http://localhost:8080/api/persons/${this.$route.params.id}`));
                const personData = response.data;

                // Заполняем форму данными
                const spouseId = personData.spouse ? parseInt(personData.spouse.id) : null;

                this.person = {
                    firstName: personData.firstName || '',
                    lastName: personData.lastName || '',
                    middleName: personData.middleName || '',
                    gender: personData.gender || '',
                    birthDate: personData.birthDate || '',
                    deathDate: personData.deathDate || '',
                    biography: personData.biography || '',
                    parent1Id: personData.parent1 ? parseInt(personData.parent1.id) : null,
                    parent2Id: personData.parent2 ? parseInt(personData.parent2.id) : null,
                    spouseId: spouseId
                };
            } catch (error) {
                this.errorMessage = 'Не удалось загрузить данные персоны';
            } finally {
                this.loading = false;
            }
        },

        async loadPhotos() {
            try {
                const response = await axios.get(`http://localhost:8080/api/photos/person/${this.$route.params.id}`);
                this.photos = response.data;
            } catch (error) {
                // Игнорируем ошибки загрузки фотографий
            }
        },

        async setMainPhoto(photoId) {
            try {
                await axios.post(`http://localhost:8080/api/photos/${photoId}/set-main`);
                this.successMessage = 'Главная фотография установлена!';
                await this.loadPhotos(); // Обновляем список фотографий
            } catch (error) {
                this.errorMessage = 'Ошибка при установке главной фотографии: ' + error.message;
            }
        },

        validateForm() {
            this.errors = {};

            if (!this.person.firstName.trim()) {
                this.errors.firstName = 'Имя обязательно для заполнения';
            }

            if (!this.person.lastName.trim()) {
                this.errors.lastName = 'Фамилия обязательна для заполнения';
            }

            if (!this.person.gender) {
                this.errors.gender = 'Пол обязателен для выбора';
            }

            // Проверка дат
            if (this.person.birthDate && this.person.deathDate) {
                const birth = new Date(this.person.birthDate);
                const death = new Date(this.person.deathDate);
                if (death < birth) {
                    this.errors.deathDate = 'Дата смерти не может быть раньше даты рождения';
                }
            }

            return Object.keys(this.errors).length === 0;
        },

        async submitForm() {
            if (!this.validateForm()) {
                return;
            }

            this.loading = true;
            this.successMessage = '';
            this.errorMessage = '';

            try {
                let response;

                // Подготавливаем данные персоны с родителями и супругом в нужном формате
                const personData = {
                    firstName: this.person.firstName,
                    lastName: this.person.lastName,
                    middleName: this.person.middleName,
                    gender: this.person.gender,
                    birthDate: this.person.birthDate,
                    deathDate: this.person.deathDate,
                    biography: this.person.biography,
                    parent1: this.person.parent1Id ? { id: this.person.parent1Id } : null,
                    parent2: this.person.parent2Id ? { id: this.person.parent2Id } : null,
                    spouseId: this.person.spouseId || null
                };

                if (this.isEditMode) {
                    // Редактирование существующей персоны
                    response = await axios.put(
                        this.apiUrl(`http://localhost:8080/api/persons/${this.$route.params.id}`),
                        personData
                    );
                    this.successMessage = 'Персона успешно обновлена!';
                } else {
                    // Создание новой персоны
                    response = await axios.post(
                        this.apiUrl('http://localhost:8080/api/persons'),
                        personData
                    );
                    this.successMessage = 'Персона успешно создана!';

                    // Если указан супруг при создании, регистрируем брак
                    if (this.person.spouseId) {
                        const newPersonId = response.data.id;
                        await axios.post(this.apiUrl(`http://localhost:8080/api/persons/${newPersonId}/marry/${this.person.spouseId}`));
                        this.successMessage += ' Брак зарегистрирован!';
                    }

                    // Переходим к редактированию для загрузки фото
                    setTimeout(() => {
                        this.$router.push(this.routeWithUser(`/persons/${response.data.id}/edit`));
                    }, 1500);
                }

                // Обновляем список персон
                await this.loadAllPersons();

            } catch (error) {
                this.errorMessage = 'Ошибка при сохранении: ' +
                    (error.response?.data?.message || error.message);
            } finally {
                this.loading = false;
            }
        },

        resetForm() {
            this.person = {
                firstName: '',
                lastName: '',
                middleName: '',
                gender: '',
                birthDate: '',
                deathDate: '',
                biography: '',
                parent1Id: null,
                parent2Id: null,
                spouseId: null
            };
            this.errors = {};
            this.successMessage = '';
            this.errorMessage = '';
        },

        async deletePerson() {
            if (!confirm('Вы уверены, что хотите удалить эту персону? Все связанные фотографии также будут удалены.')) {
                return;
            }

            try {
                await axios.delete(this.apiUrl(`http://localhost:8080/api/persons/${this.$route.params.id}`));
                this.successMessage = 'Персона успешно удалена!';

                // Через 2 секунды переходим к списку
                setTimeout(() => {
                    this.$router.push(this.routeWithUser('/persons'));
                }, 2000);
            } catch (error) {
                this.errorMessage = 'Ошибка при удалении: ' + error.message;
            }
        },

        // Методы для работы с фотографиями
        handlePhotoUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Проверяем размер файла (10MB)
            if (file.size > 10 * 1024 * 1024) {
                this.errorMessage = 'Файл слишком большой. Максимальный размер: 10MB';
                return;
            }

            // Создаем preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.newPhoto = {
                    file: file,
                    preview: e.target.result,
                    description: '',
                    photoDate: ''
                };
                // Открываем модальное окно для загрузки фото
                this.openPhotoModal('upload', this.newPhoto);
            };
            reader.readAsDataURL(file);
        },

        // Загрузка фото из модального окна
        async uploadPhotoFromModal() {
            if (!this.modalPhoto || !this.modalPhoto.file) return;

            this.uploadingPhoto = true;
            try {
                const formData = new FormData();
                formData.append('file', this.modalPhoto.file);
                formData.append('personId', this.$route.params.id);
                if (this.modalForm.description) formData.append('description', this.modalForm.description);
                if (this.modalForm.photoDate) formData.append('photoDate', this.modalForm.photoDate);
                if (this.modalForm.originalFileName) formData.append('originalFileName', this.modalForm.originalFileName);

                await axios.post('http://localhost:8080/api/photos/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                this.successMessage = 'Фотография успешно загружена!';
                this.closePhotoModal();
                this.cancelPhotoUpload();
                await this.loadPhotos();
            } catch (error) {
                this.errorMessage = 'Ошибка при загрузке фотографии: ' + (error.response?.data || error.message);
            } finally {
                this.uploadingPhoto = false;
            }
        },

        cancelPhotoUpload() {
            this.newPhoto = null;
            this.$refs.photoInput.value = '';
        },

        async deletePhoto(photoId) {
            if (!confirm('Удалить эту фотографию?')) return;

            try {
                await axios.delete(`http://localhost:8080/api/photos/${photoId}`);
                this.successMessage = 'Фотография удалена!';
                await this.loadPhotos(); // Обновляем список фотографий
            } catch (error) {
                this.errorMessage = 'Ошибка при удалении фотографии: ' + error.message;
            }
        },

        // Открыть модальное окно для редактирования/загрузки фото
        openPhotoModal(mode, photo) {
            this.modalMode = mode; // 'upload' или 'edit'
            this.showPhotoModal = true;
            if (mode === 'upload') {
                this.modalPhoto = photo; // { file, preview }
                this.modalForm = { originalFileName: photo.file.name || '', description: photo.description || '', photoDate: photo.photoDate || '' };
            } else if (mode === 'edit') {
                this.modalPhoto = photo; // full photo object from server
                this.modalForm = { originalFileName: photo.originalFileName || '', description: photo.description || '', photoDate: photo.photoDate || '' };
            }
        },

        closePhotoModal() {
            this.showPhotoModal = false;
            this.modalMode = '';
            this.modalPhoto = null;
            this.modalForm = { originalFileName: '', description: '', photoDate: '' };
        },

        // открыть модалку для редактирования конкретного фото
        toggleEditPhoto(photo) {
            this.openPhotoModal('edit', photo);
        },

        // Сохранить данные из модального окна (в зависимости от режима)
        async savePhotoFromModal() {
            if (this.modalMode === 'upload') {
                await this.uploadPhotoFromModal();
                return;
            }
            if (this.modalMode === 'edit' && this.modalPhoto) {
                try {
                    const dto = {
                        id: this.modalPhoto.id,
                        originalFileName: this.modalForm.originalFileName,
                        description: this.modalForm.description,
                        photoDate: this.modalForm.photoDate || null
                    };
                    await axios.put(`http://localhost:8080/api/photos/${this.modalPhoto.id}`, dto);
                    this.successMessage = 'Данные фотографии обновлены';
                    this.closePhotoModal();
                    await this.loadPhotos();
                } catch (error) {
                    this.errorMessage = 'Ошибка при обновлении данных фото: ' + (error.response?.data || error.message);
                }
            }
        },

        getPhotoUrl(fileName) {
            return `http://localhost:8080/api/photos/file/${fileName}`;
        },

        formatDate(dateString) {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString('ru-RU');
        },

        formatYear(dateString) {
            if (!dateString) return '';
            return new Date(dateString).getFullYear();
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

        formatFullName(person) {
            if (!person) return '';
            const parts = [];
            if (person.lastName) parts.push(person.lastName);
            if (person.firstName) parts.push(person.firstName);
            if (person.middleName) parts.push(person.middleName);
            return parts.join(' ') || 'Без имени';
        },

        filterParentsByQuery(query) {
            const normalized = (query || '').trim().toLowerCase();
            const source = this.availableParents;
            if (!normalized) return source;

            return source.filter(p => {
                const parts = [p.lastName, p.firstName, p.middleName]
                    .filter(Boolean)
                    .map(s => s.toLowerCase());
                return parts.some(part => part.includes(normalized));
            });
        },

        displayParentName(id) {
            const person = this.availableParents.find(p => p.id === id);
            return person ? this.formatFullName(person) : '';
        },

        toggleParentDropdown(key) {
            this.parentDropdownOpen[key] = !this.parentDropdownOpen[key];
        },

        selectParent(key, id) {
            if (key === 'parent1') {
                this.person.parent1Id = id;
            } else if (key === 'parent2') {
                this.person.parent2Id = id;
            }
            this.parentDropdownOpen[key] = false;
        },

        handleClickOutside(event) {
            const dropdown1 = this.$refs.parent1Dropdown;
            const dropdown2 = this.$refs.parent2Dropdown;
            const spouseDropdown = this.$refs.spouseDropdown;
            const isInsideDropdown1 = dropdown1 && dropdown1.contains(event.target);
            const isInsideDropdown2 = dropdown2 && dropdown2.contains(event.target);
            const isInsideSpouse = spouseDropdown && spouseDropdown.contains(event.target);

            if (!isInsideDropdown1) this.parentDropdownOpen.parent1 = false;
            if (!isInsideDropdown2) this.parentDropdownOpen.parent2 = false;
            if (!isInsideSpouse) this.spouseDropdownOpen = false;
        },

        filterSpousesByQuery(query) {
            const normalized = (query || '').trim().toLowerCase();
            const source = this.availableSpouses;
            if (!normalized) return source;

            return source.filter(p => {
                const parts = [p.lastName, p.firstName, p.middleName]
                    .filter(Boolean)
                    .map(s => s.toLowerCase());
                return parts.some(part => part.includes(normalized));
            });
        },

        displaySpouseName(id) {
            const person = this.availableSpouses.find(p => p.id === id);
            return person ? this.formatFullName(person) : '';
        },

        toggleSpouseDropdown() {
            this.spouseDropdownOpen = !this.spouseDropdownOpen;
        },

        selectSpouse(id) {
            this.person.spouseId = id;
            this.spouseDropdownOpen = false;
        }
    }
};


