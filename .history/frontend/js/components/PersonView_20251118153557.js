const PersonView = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1><i class="bi bi-person"></i> Просмотр персоны</h1>
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

            <div v-else class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="card">
                        <div class="card-body">
                            <!-- Основная информация -->
                            <div class="text-center mb-4">
                                <i :class="getGenderIcon(person.gender)" style="font-size: 3rem;"></i>
                                <h2 class="mt-2">{{ person.firstName }} {{ person.lastName }}</h2>
                                <p class="text-muted">{{ getGenderDisplay(person.gender) }}</p>
                            </div>

                            <div class="row">
                                <div class="col-6">
                                    <strong>Имя:</strong>
                                    <p>{{ person.firstName }}</p>
                                </div>
                                <div class="col-6">
                                    <strong>Фамилия:</strong>
                                    <p>{{ person.lastName }}</p>
                                </div>
                            </div>

                            <div class="row" v-if="person.middleName">
                                <div class="col-12">
                                    <strong>Отчество:</strong>
                                    <p>{{ person.middleName }}</p>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-6">
                                    <strong>Дата рождения:</strong>
                                    <p>{{ person.birthDate ? formatDate(person.birthDate) : 'Не указана' }}</p>
                                </div>
                                <div class="col-6">
                                    <strong>Дата смерти:</strong>
                                    <p>{{ person.deathDate ? formatDate(person.deathDate) : 'Не указана' }}</p>
                                </div>
                            </div>

                            <div v-if="person.biography" class="mt-3">
                                <strong>Биография:</strong>
                                <p class="mt-2" style="white-space: pre-line;">{{ person.biography }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            person: {},
            loading: false,
            error: null
        }
    },
    async mounted() {
        await this.loadPerson();
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

        formatDate(dateString) {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString('ru-RU');
        }
    }
};