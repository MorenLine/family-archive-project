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
                <!-- Верхняя зона: слева фото и базовая информация, справа — биография -->
                <div class="col-lg-4">
                    <div class="card mb-4">
                        <div class="card-body">
                            <!-- Основная фотография -->
                            <div class="text-center mb-4">
                                <div v-if="mainPhoto" class="main-photo-container">
                                    <div class="main-photo-badge-large" v-if="mainPhoto.isMain">
                                        <i class="bi bi-star-fill me-1"></i>Главная
                                    </div>
                                    <img :src="getPhotoUrl(mainPhoto.fileName)" 
                                        :alt="mainPhoto.description || 'Основное фото'"
                                        class="main-photo img-fluid rounded"
                                        style="width:100%; max-height:300px; object-fit:cover;"
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

                <!-- Справа: биография -->
                <div class="col-lg-8">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title"><i class="bi bi-file-text"></i> Биография</h5>
                            <div v-if="person.biography" class="mt-2" style="white-space: pre-line;color:#222;">
                                {{ person.biography }}
                            </div>
                            <div v-else class="text-muted mt-2">Биография отсутствует</div>
                        </div>
                    </div>
                </div>

                <!-- Нижняя зона: хронология фотографий (на всю ширину) -->
                <div class="col-12">
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
                                                    class="photo-grid-img img-fluid rounded"
                                                    style="width:100%; height:150px; object-fit:cover; display:block;">
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
            <div v-if="lightboxVisible" class="lightbox-overlay" @click="closeLightbox"
                 style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:2000;background:rgba(0,0,0,0.75);">
                <div class="lightbox-content" @click.stop
                     style="background:#0b0b0b;color:#fff;border-radius:8px;padding:0;max-width:95vw;max-height:90vh;display:flex;flex-direction:row;gap:0;overflow:hidden;">
                    <button class="lightbox-close btn btn-sm btn-outline-light" @click="closeLightbox" style="position:absolute;right:1rem;top:1rem;z-index:3;">
                        <i class="bi bi-x-lg"></i>
                    </button>

                    <!-- Правая колонка: изображение и навигация (слева визуально) -->
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;position:relative;padding:1rem;box-sizing:border-box;">
                        <div style="flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;min-width:0;">
                            <img v-if="currentPhoto" :src="getPhotoUrl(currentPhoto.fileName)"
                                 :alt="currentPhoto.description"
                                 style="max-width:100%;max-height:80vh;object-fit:contain;display:block;margin:0 auto;" />
                        </div>

                        <div style="width:100%;display:flex;align-items:center;justify-content:center;padding:0.5rem 1rem;background:transparent;">
                            <button @click="prevPhoto" :disabled="currentPhotoIndex === 0" class="btn btn-outline-light me-2">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <span style="color:#ddd">{{ currentPhotoIndex + 1 }} / {{ photos.length }}</span>
                            <button @click="nextPhoto" :disabled="currentPhotoIndex === photos.length - 1" class="btn btn-outline-light ms-2">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Правая колонка: данные о фото (отображается справа) -->
                    <div style="width:320px;background:#111;padding:1rem;box-sizing:border-box;overflow:auto;">
                        <h5 style="color:#fff;margin-top:0;margin-bottom:0.5rem;">{{ currentPhoto && (currentPhoto.originalFileName || currentPhoto.fileName) }}</h5>
                        <p v-if="currentPhoto && currentPhoto.description" style="color:#ddd;margin:0 0 0.5rem 0;white-space:pre-line;">{{ currentPhoto.description }}</p>
                        <p v-else style="color:#777;margin:0 0 0.5rem 0;">Нет описания</p>

                        <div style="margin-top:0.75rem;color:#999;font-size:0.9rem;">
                            <div><strong>Дата:</strong> <span style="color:#ccc">{{ currentPhoto && (currentPhoto.photoDate ? formatDate(currentPhoto.photoDate) : 'Не указана') }}</span></div>
                            <div class="mt-2"><strong>Имя файла:</strong> <span style="color:#ccc">{{ currentPhoto && currentPhoto.fileName }}</span></div>
                        </div>

                        <!-- Доп. кнопки управления (можно добавить позже) -->
                        <div style="margin-top:1rem;border-top:1px solid rgba(255,255,255,0.03);padding-top:0.75rem;">
                            <button v-if="currentPhoto && !currentPhoto.isMain" @click="setMainPhoto(currentPhoto.id)" class="btn btn-outline-light btn-sm w-100 mb-2">Сделать главной</button>
                            <button v-if="currentPhoto" @click="openEditFromLightbox(currentPhoto)" class="btn btn-secondary btn-sm w-100 mb-2">Редактировать</button>
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