const PersonView = {
    template: `
        <div class="person-view-page">
            <!-- Hero Section -->
            <div class="hero-section-person">
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-lg-8">
                            <div class="hero-content-person">
                                <h1 class="display-4 fw-bold mb-3">
                                    <i class="bi bi-person me-3"></i>{{ formatFullName(person) || 'Загрузка...' }}
                                </h1>
                                <div class="hero-meta" v-if="person.gender || person.birthDate">
                                    <span v-if="person.gender" class="badge bg-light text-dark me-2">
                                        <i :class="getGenderIcon(person.gender)" class="me-1"></i>
                                        {{ getGenderDisplay(person.gender) }}
                                    </span>
                                    <span v-if="person.birthDate" class="badge bg-light text-dark">
                                        <i class="bi bi-calendar me-1"></i>
                                        {{ formatDate(person.birthDate) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4 text-end">
                            <div class="hero-actions">
                                <router-link :to="routeWithUser('/persons/' + person.id + '/edit')" class="btn btn-light btn-lg me-2">
                                    <i class="bi bi-pencil me-2"></i>Редактировать
                                </router-link>
                                <router-link :to="routeWithUser('/persons')" class="btn btn-outline-light btn-lg">
                                    <i class="bi bi-arrow-left me-2"></i>Назад
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container mt-4">
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                    <p class="mt-3">Загрузка данных...</p>
                </div>

                <div v-else-if="error" class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
                </div>

                <div v-else class="row">
                    <!-- Верхняя зона: слева фото и базовая информация, справа — биография -->
                    <div class="col-lg-4">
                        <div class="person-info-card card shadow-sm mb-4">
                            <div class="card-body">
                            <!-- Основная фотография -->
                            <div class="text-center mb-4">
                                <div v-if="mainPhoto" class="main-photo-container">
                                    <div class="main-photo-badge-large" v-if="mainPhoto.isMain">
                                        <i class="bi bi-star-fill me-1"></i>Главная
                                    </div>
                                    <img :src="getPhotoUrl(mainPhoto.fileName)" 
                                        :alt="mainPhoto.originalFileName || mainPhoto.description || 'Основное фото'"
                                        class="main-photo img-fluid rounded"
                                        style="width:100%; max-height:300px; object-fit:cover;"
                                        @click="openLightbox(mainPhoto)">
                                    <div v-if="mainPhoto.originalFileName" class="mt-2 text-muted small">
                                        {{ mainPhoto.originalFileName }}
                                    </div>
                                    <div v-if="mainPhoto.photoDate" class="text-muted small">
                                        {{ formatDate(mainPhoto.photoDate) }}
                                    </div>
                                </div>
                                <div v-else class="no-photo-placeholder">
                                    <i class="bi bi-camera display-1 text-muted"></i>
                                    <p class="text-muted mt-2">Нет фотографии</p>
                                </div>
                            </div>

                            <!-- Базовая информация о персоне (без биографии) -->
                            <div class="person-info">
                                <div class="d-flex align-items-center mb-3">
                                    <i :class="getGenderIcon(person.gender)" class="me-2"></i>
                                    <span>{{ getGenderDisplay(person.gender) }}</span>
                                </div>

                                <div class="info-item mb-2">
                                    <strong>ФИО:</strong>
                                    <p class="mb-0">{{ formatFullName(person) }}</p>
                                </div>

                                <div class="info-item mb-2" v-if="person.birthDate">
                                    <strong>Дата рождения:</strong>
                                    <p class="mb-0">{{ formatDate(person.birthDate) }}</p>
                                </div>

                                <div class="info-item mb-2" v-if="person.deathDate">
                                    <strong>Дата смерти:</strong>
                                    <p class="mb-0">{{ formatDate(person.deathDate) }}</p>
                                </div>
                            </div>

                            <!-- Родители (перенесены под биографию) -->
                        </div>
                    </div>
                </div>

                    <!-- Справа: биография -->
                    <div class="col-lg-8">
                        <div class="person-bio-card card shadow-sm mb-4">
                            <div class="card-header bg-white border-bottom">
                                <h5 class="mb-0"><i class="bi bi-file-text me-2"></i>Биография</h5>
                            </div>
                            <div class="card-body">
                            <div v-if="person.biography" class="mt-2" style="white-space: pre-line;color:#222;">
                                {{ person.biography }}
                            </div>
                            <div v-else class="text-muted mt-2">Биография отсутствует</div>

                            <!-- Родители: перенесены сюда под биографию -->
                            <div class="mt-4" v-if="person.parent1 || person.parent2">
                                <h6><i class="bi bi-people"></i> Родители</h6>
                                <div class="list-group">
                                    <router-link v-if="person.parent1" 
                                                 :to="routeWithUser('/persons/' + person.parent1.id)" 
                                                 class="list-group-item list-group-item-action">
                                        <i class="bi bi-gender-male text-primary me-2"></i>
                                        {{ person.parent1.firstName }} {{ person.parent1.lastName }}
                                    </router-link>
                                    <router-link v-if="person.parent2" 
                                                 :to="routeWithUser('/persons/' + person.parent2.id)" 
                                                 class="list-group-item list-group-item-action">
                                        <i class="bi bi-gender-female text-danger me-2"></i>
                                        {{ person.parent2.firstName }} {{ person.parent2.lastName }}
                                    </router-link>
                                </div>
                            </div>

                            <!-- Супруг(а): отображается ниже родителей -->
                            <div class="mt-4" v-if="person.spouse">
                                <h6><i class="bi bi-heart"></i> Супруг(а)</h6>
                                <div class="list-group">
                                    <router-link :to="routeWithUser('/persons/' + person.spouse.id)" 
                                                 class="list-group-item list-group-item-action">
                                        <i :class="getGenderIcon(person.spouse.gender)" class="me-2"></i>
                                        {{ formatFullName(person.spouse) }}
                                    </router-link>
                                </div>
                            </div>

                            <!-- Дети: отображаются ниже супруга -->
                            <div class="mt-4" v-if="children && children.length > 0">
                                <h6><i class="bi bi-people-fill"></i> Дети</h6>
                                <div class="list-group">
                                    <router-link v-for="child in children" 
                                                 :key="child.id"
                                                 :to="routeWithUser('/persons/' + child.id)" 
                                                 class="list-group-item list-group-item-action">
                                        <i :class="getGenderIcon(child.gender)" class="me-2"></i>
                                        {{ formatFullName(child) }}
                                        <span v-if="child.birthDate" class="text-muted ms-2">
                                            ({{ formatDate(child.birthDate) }})
                                        </span>
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                    <!-- Нижняя зона: хронология фотографий (на всю ширину) -->
                    <div class="col-12">
                        <div class="person-photos-card card shadow-sm">
                            <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">
                                    <i class="bi bi-images me-2"></i>Хронология фотографий
                                    <span class="badge bg-primary ms-2">{{ photos.length }}</span>
                                </h5>
                            <button v-if="photos.length > 0" 
                                    @click="toggleViewMode" 
                                    class="btn btn-outline-secondary btn-sm">
                                <i class="bi" :class="viewMode === 'timeline' ? 'bi-grid' : 'bi-clock'"></i>
                                {{ viewMode === 'timeline' ? 'Сетка' : 'Хронология' }}
                            </button>
                        </div>
                        <div class="card-body">
                            <!-- Режим хронологии -->
                            <div v-if="viewMode === 'timeline' && timelineGroups.length > 0" class="timeline-view">
                                <div v-for="(group, index) in timelineGroups" :key="group.year" class="timeline-group">
                                    <div class="timeline-year">
                                        <h6 class="year-title">{{ group.year }}</h6>
                                        <div class="timeline-photos">
                                            <div v-for="photo in group.photos" 
                                                 :key="photo.id" 
                                                 class="timeline-photo-item"
                                                 @click="openLightbox(photo)">
                                                   <img :src="getPhotoUrl(photo.fileName)" 
                                                       :alt="photo.description"
                                                       class="timeline-photo"
                                                       style="width:100px; height:100px; object-fit:cover; display:block;">
                                                <div class="timeline-photo-info">
                                                    <small class="text-muted">
                                                        {{ formatDayMonth(photo.photoDate) }}
                                                    </small>
                                                    <small v-if="photo.description" 
                                                           class="d-block text-truncate"
                                                           style="max-width: 120px;">
                                                        {{ photo.description }}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Режим сетки -->
                            <div v-else-if="viewMode === 'grid' && photos.length > 0" class="grid-view">
                                <div class="row g-3">
                                    <div v-for="photo in photos" 
                                         :key="photo.id" 
                                         class="col-6 col-md-4 col-lg-3">
                                        <div class="photo-grid-item" @click="openLightbox(photo)">
                                            <img :src="getPhotoUrl(photo.fileName)" 
                                                :alt="photo.description"
                                                class="photo-grid-img">
                                            <div class="photo-grid-overlay">
                                                <div class="photo-info">
                                                    <small class="text-white">
                                                        {{ photo.photoDate ? formatDate(photo.photoDate) : 'Без даты' }}
                                                    </small>
                                                    <small v-if="photo.description" 
                                                           class="text-white d-block text-truncate">
                                                        {{ photo.description }}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Нет фотографий -->
                            <div v-else class="text-center text-muted py-5">
                                <i class="bi bi-images display-1"></i>
                                <p class="mt-3">Нет загруженных фотографий</p>
                                <router-link :to="routeWithUser('/persons/' + person.id + '/edit')" 
                                             class="btn btn-primary">
                                    <i class="bi bi-plus"></i> Добавить фотографии
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Лайтбокс для просмотра фото -->
            <div v-if="lightboxVisible" class="lightbox-overlay" @click="closeLightbox">
                <div class="lightbox-content card shadow-lg" @click.stop>
                    <button class="lightbox-close" @click="closeLightbox" type="button">
                        <i class="bi bi-x-lg"></i>
                    </button>

                    <div class="lightbox-body">
                        <!-- Левая колонка: изображение -->
                        <div class="lightbox-image-container">
                            <img v-if="currentPhoto" 
                                 :src="getPhotoUrl(currentPhoto.fileName)"
                                 :alt="currentPhoto.description"
                                 class="lightbox-image" />
                        </div>

                        <!-- Правая колонка: информация о фото -->
                        <div class="lightbox-info-panel">
                            <div class="lightbox-info-header">
                                <h5 class="mb-3">
                                    <i class="bi bi-image me-2 text-primary"></i>
                                    {{ currentPhoto && (currentPhoto.originalFileName || currentPhoto.fileName) }}
                                </h5>
                            </div>

                            <div class="lightbox-info-content">
                                <div v-if="currentPhoto && currentPhoto.description" class="mb-3">
                                    <h6 class="text-muted mb-2">
                                        <i class="bi bi-file-text me-1"></i>Описание
                                    </h6>
                                    <p class="mb-0" style="white-space: pre-line; color: #495057;">{{ currentPhoto.description }}</p>
                                </div>
                                <div v-else class="mb-3">
                                    <p class="text-muted mb-0">
                                        <i class="bi bi-file-text me-1"></i>Нет описания
                                    </p>
                                </div>

                                <div class="lightbox-meta mb-3">
                                    <div class="mb-2">
                                        <strong class="text-muted d-block mb-1">
                                            <i class="bi bi-calendar me-1"></i>Дата
                                        </strong>
                                        <span>{{ currentPhoto && (currentPhoto.photoDate ? formatDate(currentPhoto.photoDate) : 'Не указана') }}</span>
                                    </div>
                                    <div>
                                        <strong class="text-muted d-block mb-1">
                                            <i class="bi bi-file-earmark me-1"></i>Имя файла
                                        </strong>
                                        <span class="text-truncate d-block" style="max-width: 100%;">{{ currentPhoto && currentPhoto.fileName }}</span>
                                    </div>
                                </div>

                                <!-- Кнопки управления -->
                                <div class="lightbox-actions">
                                    <button v-if="currentPhoto && !currentPhoto.isMain" 
                                            @click="setMainPhoto(currentPhoto.id)" 
                                            class="btn btn-primary btn-sm w-100 mb-2">
                                        <i class="bi bi-star me-1"></i>Сделать главной
                                    </button>
                                    <button v-if="currentPhoto" 
                                            @click="openEditFromLightbox(currentPhoto)" 
                                            class="btn btn-outline-secondary btn-sm w-100">
                                        <i class="bi bi-pencil me-1"></i>Редактировать
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Навигация -->
                    <div class="lightbox-navigation">
                        <button @click="prevPhoto" 
                                :disabled="currentPhotoIndex === 0" 
                                class="btn btn-outline-primary">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <span class="lightbox-counter">
                            {{ currentPhotoIndex + 1 }} / {{ photos.length }}
                        </span>
                        <button @click="nextPhoto" 
                                :disabled="currentPhotoIndex === photos.length - 1" 
                                class="btn btn-outline-primary">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            person: {},
            photos: [],
            children: [],
            loading: false,
            error: null,
            viewMode: 'timeline', // 'timeline' или 'grid'
            lightboxVisible: false,
            currentPhoto: null,
            currentPhotoIndex: 0
        }
    },
    computed: {
        targetUserId() {
            return this.$route.query.userId ? Number(this.$route.query.userId) : null;
        },
        // Основная фотография (первая в хронологии или самая старая)
        mainPhoto() {
            // Ищем фото помеченное как главное
            const mainPhoto = this.photos.find(p => p.isMain);
            if (mainPhoto) return mainPhoto;

            // Если нет главной, берем первую с датой или первую вообще
            if (this.photos.length === 0) return null;

            const photosWithDate = this.photos.filter(p => p.photoDate);
            if (photosWithDate.length > 0) {
                return photosWithDate.reduce((oldest, current) => {
                    return new Date(current.photoDate) < new Date(oldest.photoDate) ? current : oldest;
                });
            }

            return this.photos[0];
        },

        // Группируем фото по годам для хронологии
        timelineGroups() {
            const groups = {};

            this.photos.forEach(photo => {
                const year = photo.photoDate ? new Date(photo.photoDate).getFullYear() : 'Без даты';
                if (!groups[year]) {
                    groups[year] = {
                        year: year,
                        photos: []
                    };
                }
                groups[year].photos.push(photo);
            });

            // Сортируем группы по году (без даты в конец)
            return Object.values(groups).sort((a, b) => {
                if (a.year === 'Без даты') return 1;
                if (b.year === 'Без даты') return -1;
                return parseInt(b.year) - parseInt(a.year);
            });
        }
    },
    async mounted() {
        await this.loadPerson();
        await this.loadPhotos();
        await this.loadChildren();
    },
    watch: {
        '$route.params.id': {
            immediate: false,
            async handler(newId, oldId) {
                // Reset state and reload when route param (person id) changes
                this.loading = true;
                this.error = null;
                this.person = {};
                this.photos = [];
                this.lightboxVisible = false;
                this.currentPhoto = null;
                this.currentPhotoIndex = 0;

                try {
                    await this.loadPerson();
                    await this.loadPhotos();
                    await this.loadChildren();
                } catch (e) {
                    // Игнорируем ошибки при обновлении профиля
                } finally {
                    this.loading = false;
                }
            }
        },
        '$route.query.userId': {
            immediate: false,
            async handler() {
                this.loading = true;
                try {
                    await this.loadPerson();
                    await this.loadPhotos();
                    await this.loadChildren();
                } finally {
                    this.loading = false;
                }
            }
        }
    },
    methods: {
        async loadPerson() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(this.apiUrl(`http://localhost:8080/api/persons/${this.$route.params.id}`));
                this.person = response.data;
            } catch (error) {
                const resp = error && error.response && error.response.data;
                this.error = (resp && (resp.error || (typeof resp === 'string' ? resp : JSON.stringify(resp)))) || error.message || 'Не удалось загрузить данные персоны';
            } finally {
                this.loading = false;
            }
        },

        async loadPhotos() {
            try {
                const response = await axios.get(`http://localhost:8080/api/photos/person/${this.$route.params.id}`);
                // Сортируем фото по дате (самые старые первыми)
                this.photos = response.data.sort((a, b) => {
                    if (!a.photoDate) return 1;
                    if (!b.photoDate) return -1;
                    return new Date(a.photoDate) - new Date(b.photoDate);
                });
            } catch (error) {
                // Игнорируем ошибки загрузки фотографий
            }
        },

        async loadChildren() {
            try {
                // Загружаем детей через API
                const response = await axios.get(this.apiUrl(`http://localhost:8080/api/persons/${this.$route.params.id}/children`));
                this.children = response.data || [];

                // Сортируем детей по дате рождения (если есть)
                this.children.sort((a, b) => {
                    if (!a.birthDate) return 1;
                    if (!b.birthDate) return -1;
                    return new Date(a.birthDate) - new Date(b.birthDate);
                });
            } catch (error) {
                this.children = [];
            }
        },

        getGenderIcon(gender) {
            return gender === 'MALE'
                ? 'bi bi-gender-male text-primary'
                : 'bi bi-gender-female text-danger';
        },

        getGenderDisplay(gender) {
            return gender === 'MALE' ? 'Мужской' : 'Женский';
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

        formatDayMonth(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
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

        getPhotoUrl(fileName) {
            return `http://localhost:8080/api/photos/file/${fileName}`;
        },

        toggleViewMode() {
            this.viewMode = this.viewMode === 'timeline' ? 'grid' : 'timeline';
        },

        openLightbox(photo) {
            this.currentPhotoIndex = this.photos.findIndex(p => p.id === photo.id);
            this.currentPhoto = photo;
            this.lightboxVisible = true;
        },

        closeLightbox() {
            this.lightboxVisible = false;
            this.currentPhoto = null;
        },

        nextPhoto() {
            if (this.currentPhotoIndex < this.photos.length - 1) {
                this.currentPhotoIndex++;
                this.currentPhoto = this.photos[this.currentPhotoIndex];
            }
        },

        prevPhoto() {
            if (this.currentPhotoIndex > 0) {
                this.currentPhotoIndex--;
                this.currentPhoto = this.photos[this.currentPhotoIndex];
            }
        },

        async setMainPhoto(photoId) {
            try {
                await axios.post(`http://localhost:8080/api/photos/${photoId}/set-main`);
                await this.loadPhotos();
                this.currentPhoto = this.photos.find(p => p.id === photoId);
            } catch (error) {
                // Игнорируем ошибки
            }
        },

        openEditFromLightbox(photo) {
            this.closeLightbox();
            this.$router.push(this.routeWithUser(`/persons/${this.person.id}/edit`));
        }
    }
};