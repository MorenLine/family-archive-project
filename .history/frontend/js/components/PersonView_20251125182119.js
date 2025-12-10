const PersonView = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1><i class="bi bi-person"></i> {{ person.firstName }} {{ person.lastName }}</h1>
                <div>
                    <router-link :to="'/persons/' + person.id + '/edit'" class="btn btn-primary me-2">
                        <i class="bi bi-pencil"></i> Редактировать
                    </router-link>
                    <router-link to="/persons" class="btn btn-outline-secondary">
                        <i class="bi bi-arrow-left"></i> Назад к списку
                    </router-link>
                </div>
            </div>

            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
            </div>

            <div v-else-if="error" class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> {{ error }}
            </div>

            <div v-else class="row">
                <!-- Левая колонка - основная информация -->
                <div class="col-lg-4">
                    <div class="card mb-4">
                        <div class="card-body">
                            <!-- Основная фотография -->
                            <div class="text-center mb-4">
                                <div v-if="mainPhoto" class="main-photo-container">
                                    <img :src="getPhotoUrl(mainPhoto.fileName)" 
                                         :alt="mainPhoto.description || 'Основное фото'"
                                         class="main-photo img-fluid rounded"
                                         @click="openLightbox(mainPhoto)">
                                    <div v-if="mainPhoto.description" class="mt-2 text-muted small">
                                        {{ mainPhoto.description }}
                                    </div>
                                    <div v-if="mainPhoto.photoDate" class="text-muted small">
                                        {{ formatDate(mainPhoto.photoDate) }}
                                    </div>
                                </div>
                                <div v-else class="no-photo-placeholder">
                                    <i class="bi bi-camera display-1 text-muted"></i>
                                    <p class="mt-2 text-muted">Нет основной фотографии</p>
                                    <router-link :to="'/persons/' + person.id + '/edit'" 
                                                 class="btn btn-outline-primary btn-sm">
                                        <i class="bi bi-plus"></i> Добавить фото
                                    </router-link>
                                </div>
                            </div>

                            <!-- Информация о персоне -->
                            <div class="person-info">
                                <div class="d-flex align-items-center mb-3">
                                    <i :class="getGenderIcon(person.gender)" class="me-2"></i>
                                    <span>{{ getGenderDisplay(person.gender) }}</span>
                                </div>

                                <div class="info-item mb-2">
                                    <strong>Имя:</strong>
                                    <p class="mb-0">{{ person.firstName }}</p>
                                </div>

                                <div class="info-item mb-2">
                                    <strong>Фамилия:</strong>
                                    <p class="mb-0">{{ person.lastName }}</p>
                                </div>

                                <div class="info-item mb-2" v-if="person.middleName">
                                    <strong>Отчество:</strong>
                                    <p class="mb-0">{{ person.middleName }}</p>
                                </div>

                                <div class="info-item mb-2" v-if="person.birthDate">
                                    <strong>Дата рождения:</strong>
                                    <p class="mb-0">{{ formatDate(person.birthDate) }}</p>
                                </div>

                                <div class="info-item mb-2" v-if="person.deathDate">
                                    <strong>Дата смерти:</strong>
                                    <p class="mb-0">{{ formatDate(person.deathDate) }}</p>
                                </div>

                                <div class="info-item" v-if="person.biography">
                                    <strong>Биография:</strong>
                                    <p class="mt-1" style="white-space: pre-line;">{{ person.biography }}</p>
                                </div>
                            </div>

                            <!-- Родители -->
                            <div class="mt-4" v-if="person.parent1 || person.parent2">
                                <h6><i class="bi bi-people"></i> Родители</h6>
                                <div class="list-group">
                                    <router-link v-if="person.parent1" 
                                                 :to="'/persons/' + person.parent1.id" 
                                                 class="list-group-item list-group-item-action">
                                        <i class="bi bi-gender-male text-primary me-2"></i>
                                        {{ person.parent1.firstName }} {{ person.parent1.lastName }}
                                    </router-link>
                                    <router-link v-if="person.parent2" 
                                                 :to="'/persons/' + person.parent2.id" 
                                                 class="list-group-item list-group-item-action">
                                        <i class="bi bi-gender-female text-danger me-2"></i>
                                        {{ person.parent2.firstName }} {{ person.parent2.lastName }}
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Правая колонка - хронология фотографий -->
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">
                                <i class="bi bi-images"></i> Хронология фотографий
                                <span class="badge bg-secondary ms-2">{{ photos.length }}</span>
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
                                                     class="timeline-photo">
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
                                    <div v-if="index < timelineGroups.length - 1" class="timeline-connector"></div>
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
                                <router-link :to="'/persons/' + person.id + '/edit'" 
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
                <div class="lightbox-content" @click.stop>
                    <button class="lightbox-close" @click="closeLightbox">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    <div class="lightbox-image-container">
                        <img :src="getPhotoUrl(currentPhoto.fileName)" 
                             :alt="currentPhoto.description"
                             class="lightbox-image">
                    </div>
                    <div class="lightbox-info">
                        <h6 v-if="currentPhoto.description">{{ currentPhoto.description }}</h6>
                        <p v-if="currentPhoto.photoDate" class="text-muted mb-0">
                            {{ formatDate(currentPhoto.photoDate) }}
                        </p>
                    </div>
                    <div class="lightbox-navigation">
                        <button @click="prevPhoto" 
                                :disabled="currentPhotoIndex === 0"
                                class="btn btn-outline-light">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <span class="lightbox-counter">
                            {{ currentPhotoIndex + 1 }} / {{ photos.length }}
                        </span>
                        <button @click="nextPhoto" 
                                :disabled="currentPhotoIndex === photos.length - 1"
                                class="btn btn-outline-light">
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
            loading: false,
            error: null,
            viewMode: 'timeline', // 'timeline' или 'grid'
            lightboxVisible: false,
            currentPhoto: null,
            currentPhotoIndex: 0
        }
    },
    computed: {
        // Основная фотография (первая в хронологии или самая старая)
        mainPhoto() {
            if (this.photos.length === 0) return null;

            // Ищем фото с датой, иначе берем первое
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
    },
    methods: {
        async loadPerson() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`http://localhost:8080/api/persons/${this.$route.params.id}`);
                this.person = response.data;
            } catch (error) {
                console.error('❌ Ошибка загрузки:', error);
                this.error = 'Не удалось загрузить данные персоны';
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
                console.error('Ошибка загрузки фотографий:', error);
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

        formatDate(dateString) {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString('ru-RU');
        },

        formatDayMonth(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
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
        }
    }
};