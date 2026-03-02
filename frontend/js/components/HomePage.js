const HomePage = {
    template: `
        <div class="home-page">
            <!-- Hero Section -->
            <div class="hero-section">
                <div class="container">
                    <div class="row align-items-center min-vh-75">
                        <div class="col-lg-6">
                            <div class="hero-content">
                                <div class="hero-logo mb-4">
                                    <img src="./images/logo.png" alt="Семейный Архив" class="hero-logo-img" />
                                </div>
                                <h1 class="display-3 fw-bold mb-4">Семейный Архив</h1>
                                <p class="lead mb-4">Сохраняйте историю вашей семьи, создавайте генеалогическое древо и храните драгоценные воспоминания в одном месте</p>
                                
                                <div v-if="!isAuthenticated" class="hero-buttons">
                                    <router-link to="/login" class="btn btn-primary btn-lg me-3 px-4">
                                        <i class="bi bi-box-arrow-in-right me-2"></i>Войти
                                    </router-link>
                                    <router-link to="/register" class="btn btn-outline-light btn-lg px-4">
                                        <i class="bi bi-person-plus me-2"></i>Зарегистрироваться
                                    </router-link>
                                </div>
                                
                                <div v-else class="hero-buttons">
                                    <router-link to="/tree" class="btn btn-primary btn-lg me-3 px-4">
                                        <i class="bi bi-diagram-3 me-2"></i>Семейное дерево
                                    </router-link>
                                    <router-link to="/persons" class="btn btn-outline-light btn-lg px-4">
                                        <i class="bi bi-people me-2"></i>Все персоны
                                    </router-link>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="hero-visual">
                                <div class="tree-illustration">
                                    <img src="./images/Tree.png" alt="Семейное дерево" class="tree-image" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Statistics Section (только для авторизованных) -->
            <div v-if="isAuthenticated && statistics" class="statistics-section py-5">
                <div class="container">
                    <h2 class="text-center mb-5">
                        <i class="bi bi-bar-chart me-2"></i>Ваша семейная история
                    </h2>
                    <div class="row g-4">
                        <div class="col-md-3 col-sm-6">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="bi bi-people"></i>
                                </div>
                                <div class="stat-number">{{ statistics.totalPersons || 0 }}</div>
                                <div class="stat-label">Всего персон</div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="bi bi-heart-fill"></i>
                                </div>
                                <div class="stat-number">{{ statistics.couples || 0 }}</div>
                                <div class="stat-label">Супружеских пар</div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="bi bi-camera"></i>
                                </div>
                                <div class="stat-number">{{ statistics.totalPhotos || 0 }}</div>
                                <div class="stat-label">Фотографий</div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="bi bi-diagram-3"></i>
                                </div>
                                <div class="stat-number">{{ statistics.generations || 0 }}</div>
                                <div class="stat-label">Поколений</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Features Section -->
            <div class="features-section py-5">
                <div class="container">
                    <h2 class="text-center mb-5">Возможности системы</h2>
                    <div class="row g-4">
                        <div class="col-md-4">
                            <div class="feature-card">
                                <div class="feature-icon">
                                    <i class="bi bi-diagram-3"></i>
                                </div>
                                <h4>Генеалогическое древо</h4>
                                <p>Визуализируйте связи между членами семьи, создавайте интерактивное семейное древо с возможностью навигации</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="feature-card">
                                <div class="feature-icon">
                                    <i class="bi bi-camera"></i>
                                </div>
                                <h4>Фотоархив</h4>
                                <p>Храните и организуйте семейные фотографии, добавляйте описания и даты, создавайте хронологию событий</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="feature-card">
                                <div class="feature-icon">
                                    <i class="bi bi-file-text"></i>
                                </div>
                                <h4>Биографии</h4>
                                <p>Записывайте истории жизни ваших предков, сохраняйте важные события и воспоминания для будущих поколений</p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                
            <!-- Quick Actions (только для авторизованных) -->
            <div v-if="isAuthenticated" class="quick-actions-section py-5">
                <div class="container">
                    <h2 class="text-center mb-5">Быстрые действия</h2>
                    <div class="row g-4">
                        <div class="col-md-4">
                            <router-link to="/persons/new" class="quick-action-card">
                                <div class="quick-action-icon">
                                    <i class="bi bi-person-plus"></i>
                                </div>
                                <h5>Добавить персону</h5>
                                <p>Создайте новый профиль члена семьи</p>
                            </router-link>
                        </div>
                        <div class="col-md-4">
                            <router-link to="/tree" class="quick-action-card">
                                <div class="quick-action-icon">
                                    <i class="bi bi-diagram-3"></i>
                                </div>
                                <h5>Просмотреть дерево</h5>
                                <p>Откройте интерактивное семейное древо</p>
                            </router-link>
                        </div>
                        <div class="col-md-4">
                            <router-link to="/persons" class="quick-action-card">
                                <div class="quick-action-icon">
                                    <i class="bi bi-people"></i>
                                </div>
                                <h5>Список персон</h5>
                                <p>Просмотрите всех членов семьи</p>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            statistics: null
        }
    },
    computed: {
        isAuthenticated() {
            return !!localStorage.getItem('token');
        }
    },
    async mounted() {
        if (this.isAuthenticated) {
            await this.loadStatistics();
        }
    },
    methods: {
        async loadStatistics() {
            try {
                const response = await axios.get('http://localhost:8080/api/persons');
                const persons = response.data;

                // Подсчитываем статистику
                let couples = 0;
                let totalPhotos = 0;
                const processedCouples = new Set();

                for (const person of persons) {
                    if (person.spouse && person.spouse.id) {
                        const coupleId = person.id < person.spouse.id
                            ? `${person.id}-${person.spouse.id}`
                            : `${person.spouse.id}-${person.id}`;
                        if (!processedCouples.has(coupleId)) {
                            couples++;
                            processedCouples.add(coupleId);
                        }
                    }

                    // Загружаем фото для персоны
                    try {
                        const photosResp = await axios.get(`http://localhost:8080/api/photos/person/${person.id}`);
                        totalPhotos += photosResp.data.length;
                    } catch (err) {
                        // Игнорируем ошибки загрузки фото
                    }
                }

                // Подсчитываем поколения (упрощенный алгоритм)
                const generations = this.calculateGenerations(persons);

                this.statistics = {
                    totalPersons: persons.length,
                    couples: couples,
                    totalPhotos: totalPhotos,
                    generations: generations
                };
            } catch (error) {
                // Игнорируем ошибки загрузки статистики
            }
        },
        calculateGenerations(persons) {
            // Находим корневые персоны (без родителей)
            const rootPersons = persons.filter(p => !p.parent1 && !p.parent2);
            if (rootPersons.length === 0) return 1;

            // Простой подсчет: находим максимальную глубину
            let maxDepth = 1;

            const getDepth = (personId, visited = new Set()) => {
                if (visited.has(personId)) return 0;
                visited.add(personId);

                const person = persons.find(p => p.id === personId);
                if (!person) return 0;

                let depth = 1;
                if (person.parent1) {
                    depth = Math.max(depth, 1 + getDepth(person.parent1.id, visited));
                }
                if (person.parent2) {
                    depth = Math.max(depth, 1 + getDepth(person.parent2.id, visited));
                }

                return depth;
            };

            rootPersons.forEach(root => {
                maxDepth = Math.max(maxDepth, getDepth(root.id));
            });

            return maxDepth;
        }
    }
};