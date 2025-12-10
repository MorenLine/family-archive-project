const FamilyTree = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1><i class="bi bi-diagram-3"></i> Генеалогическое дерево</h1>
                <div>
                    <router-link to="/persons" class="btn btn-outline-secondary">
                        <i class="bi bi-arrow-left"></i> Назад к списку
                    </router-link>
                </div>
            </div>

            <!-- Панель управления с режимами отображения -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row">
                        <!-- Левая часть: Выбор персоны и глубина -->
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label class="form-label">Корневая персона:</label>
                                <select v-model="selectedPersonId" class="form-select" @change="loadTree">
                                    <option value="">-- Выберите персону --</option>
                                    <option v-for="person in allPersons" :key="person.id" :value="person.id">
                                        {{ person.firstName }} {{ person.lastName }}
                                        <span v-if="person.birthDate">({{ formatYear(person.birthDate) }})</span>
                                    </option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Глубина дерева:</label>
                                <div class="d-flex align-items-center">
                                    <input type="range" v-model="treeDepth" min="1" max="6" class="form-range me-2" 
                                           style="flex: 1;" @change="loadTree">
                                    <span class="badge bg-primary">{{ treeDepth }}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Центральная часть: Режимы отображения -->
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label class="form-label">Режим отображения:</label>
                                <div class="btn-group w-100" role="group">
                                    <button type="button" 
                                            class="btn btn-outline-primary" 
                                            :class="{ 'active': layoutMode === 'vertical' }"
                                            @click="changeLayout('vertical')"
                                            title="Вертикальное (сверху вниз)">
                                        <i class="bi bi-arrow-down"></i> Вертикально
                                    </button>
                                    <button type="button" 
                                            class="btn btn-outline-primary" 
                                            :class="{ 'active': layoutMode === 'horizontal' }"
                                            @click="changeLayout('horizontal')"
                                            title="Горизонтальное (слева направо)">
                                        <i class="bi bi-arrow-right"></i> Горизонтально
                                    </button>
                                </div>
                            </div>
                            
                            <div class="mb-3" v-if="layoutMode === 'vertical'">
                                <label class="form-label">Направление:</label>
                                <div class="btn-group w-100" role="group">
                                    <button type="button" 
                                            class="btn btn-outline-secondary btn-sm" 
                                            :class="{ 'active': direction === 'UD' }"
                                            @click="changeDirection('UD')"
                                            title="Сверху вниз">
                                        <i class="bi bi-arrow-down"></i> Вниз
                                    </button>
                                    <button type="button" 
                                            class="btn btn-outline-secondary btn-sm" 
                                            :class="{ 'active': direction === 'DU' }"
                                            @click="changeDirection('DU')"
                                            title="Снизу вверх">
                                        <i class="bi bi-arrow-up"></i> Вверх
                                    </button>
                                </div>
                            </div>
                            
                            <div class="mb-3" v-if="layoutMode === 'horizontal'">
                                <label class="form-label">Направление:</label>
                                <div class="btn-group w-100" role="group">
                                    <button type="button" 
                                            class="btn btn-outline-secondary btn-sm" 
                                            :class="{ 'active': direction === 'LR' }"
                                            @click="changeDirection('LR')"
                                            title="Слева направо">
                                        <i class="bi bi-arrow-right"></i> Вправо
                                    </button>
                                    <button type="button" 
                                            class="btn btn-outline-secondary btn-sm" 
                                            :class="{ 'active': direction === 'RL' }"
                                            @click="changeDirection('RL')"
                                            title="Справа налево">
                                        <i class="bi bi-arrow-left"></i> Влево
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Правая часть: Управление -->
                        <div class="col-md-4">
                            <label class="form-label d-block">&nbsp;</label>
                            <div class="d-flex flex-wrap gap-2">
                                <button class="btn btn-outline-primary" @click="fitToScreen" title="Подогнать под экран">
                                    <i class="bi bi-fullscreen"></i> Подогнать
                                </button>
                                <button class="btn btn-outline-secondary" @click="resetView" title="Сброс вида">
                                    <i class="bi bi-arrow-clockwise"></i> Сброс
                                </button>
                                <button class="btn btn-outline-success" @click="exportTree" title="Экспорт в PNG">
                                    <i class="bi bi-download"></i>
                                </button>
                                
                                <div class="dropdown">
                                    <button class="btn btn-outline-info dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                        <i class="bi bi-gear"></i>
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><h6 class="dropdown-header">Дополнительно</h6></li>
                                        <li><a class="dropdown-item" href="#" @click="togglePhysics">
                                            <i class="bi" :class="physicsEnabled ? 'bi-toggle-on' : 'bi-toggle-off'"></i>
                                            Физика: {{ physicsEnabled ? 'Вкл' : 'Выкл' }}
                                        </a></li>
                                        <li><a class="dropdown-item" href="#" @click="toggleSmoothEdges">
                                            <i class="bi" :class="smoothEdges ? 'bi-toggle-on' : 'bi-toggle-off'"></i>
                                            Плавные связи: {{ smoothEdges ? 'Вкл' : 'Выкл' }}
                                        </a></li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li><a class="dropdown-item" href="#" @click="exportJSON">
                                            <i class="bi bi-filetype-json"></i> Экспорт JSON
                                        </a></li>
                                    </ul>
                                </div>
                            </div>
                            
                            <!-- Индикатор режима -->
                            <div class="mt-3">
                                <div class="d-flex align-items-center">
                                    <div :class="getLayoutIcon()" class="me-2 fs-5"></div>
                                    <div>
                                        <small class="text-muted d-block">Режим: {{ getLayoutDisplay() }}</small>
                                        <small class="text-muted">Направление: {{ getDirectionDisplay() }}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Статус -->
                    <div v-if="loading" class="alert alert-info mt-3">
                        <div class="spinner-border spinner-border-sm me-2"></div>
                        Загрузка дерева...
                    </div>
                    
                    <div v-if="error" class="alert alert-danger mt-3">
                        <i class="bi bi-exclamation-triangle"></i> {{ error }}
                    </div>
                    
                    <div v-if="!selectedPersonId" class="alert alert-warning mt-3">
                        <i class="bi bi-info-circle"></i> Выберите корневую персону для отображения дерева
                    </div>
                </div>
            </div>

            <!-- Контейнер для дерева -->
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        {{ getLayoutDisplay() }} 
                        <span class="badge bg-secondary ms-2">{{ treeData?.nodes?.length || 0 }} персон</span>
                    </h5>
                    <small class="text-muted">Кликните на узел для просмотра информации</small>
                </div>
                <div class="card-body p-0" style="min-height: 600px;">
                    <div ref="treeContainer" style="width: 100%; height: 600px;"></div>
                    
                    <!-- Сообщение, если дерево не загружено -->
                    <div v-if="!selectedPersonId && !loading" class="position-absolute top-50 start-50 translate-middle text-center">
                        <i class="bi bi-diagram-3 display-1 text-muted"></i>
                        <p class="mt-2">Выберите корневую персону для отображения дерева</p>
                    </div>
                </div>
            </div>

            <!-- ИНФОРМАЦИЯ О ВЫБРАННОМ ЧЕЛОВЕКЕ -->
            <div v-if="selectedPerson" class="card">
                <div class="card-header d-flex justify-content-between align-items-center bg-light">
                    <h5 class="mb-0">
                        <i class="bi bi-person-badge"></i> Информация о выбранной персоне
                        <span v-if="selectedPerson.id === selectedPersonId" class="badge bg-primary ms-2">Корень дерева</span>
                    </h5>
                    <div>
                        <button v-if="selectedPerson.id !== selectedPersonId" 
                                class="btn btn-sm btn-outline-primary me-2" 
                                @click="setAsRoot(selectedPerson.id)"
                                title="Сделать корнем дерева">
                            <i class="bi bi-star"></i> Сделать корнем
                        </button>
                        <button class="btn btn-sm btn-outline-secondary me-2" @click="zoomToNode(selectedPerson.id)">
                            <i class="bi bi-search"></i>
                        </button>
                        <router-link :to="'/persons/' + selectedPerson.id" class="btn btn-sm btn-primary">
                            <i class="bi bi-eye"></i> Подробнее
                        </router-link>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <!-- Левая колонка: Основная информация -->
                        <div class="col-md-6">
                            <div class="row mb-3">
                                <div class="col-12">
                                    <h6 class="border-bottom pb-2 mb-3">Основная информация</h6>
                                </div>
                                
                                <div class="col-md-6 mb-2">
                                    <label class="small text-muted">Имя:</label>
                                    <p class="mb-1 fw-bold">{{ selectedPerson.firstName }}</p>
                                </div>
                                
                                <div class="col-md-6 mb-2">
                                    <label class="small text-muted">Фамилия:</label>
                                    <p class="mb-1 fw-bold">{{ selectedPerson.lastName }}</p>
                                </div>
                                
                                <div class="col-md-6 mb-2" v-if="selectedPerson.middleName">
                                    <label class="small text-muted">Отчество:</label>
                                    <p class="mb-1">{{ selectedPerson.middleName }}</p>
                                </div>
                                
                                <div class="col-md-6 mb-2">
                                    <label class="small text-muted">Пол:</label>
                                    <p class="mb-1">
                                        <span :class="selectedPerson.gender === 'MALE' ? 'text-primary' : 'text-danger'">
                                            <i :class="getGenderIcon(selectedPerson.gender)"></i>
                                            {{ getGenderDisplay(selectedPerson.gender) }}
                                        </span>
                                    </p>
                                </div>
                                
                                <div class="col-md-6 mb-2" v-if="selectedPerson.birthDate">
                                    <label class="small text-muted">Дата рождения:</label>
                                    <p class="mb-1">
                                        <i class="bi bi-calendar-event"></i>
                                        {{ formatDate(selectedPerson.birthDate) }}
                                        <span class="text-muted ms-1">({{ calculateAge(selectedPerson.birthDate, selectedPerson.deathDate) }})</span>
                                    </p>
                                </div>
                                
                                <div class="col-md-6 mb-2" v-if="selectedPerson.deathDate">
                                    <label class="small text-muted">Дата смерти:</label>
                                    <p class="mb-1">
                                        <i class="bi bi-calendar-x"></i>
                                        {{ formatDate(selectedPerson.deathDate) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Правая колонка: Связи -->
                        <div class="col-md-6">
                            <div class="row">
                                <div class="col-12">
                                    <h6 class="border-bottom pb-2 mb-3">Семейные связи</h6>
                                </div>
                                
                                <!-- Родители -->
                                <div class="col-md-6 mb-3">
                                    <label class="small text-muted">Родители:</label>
                                    <div v-if="selectedPerson.parents && selectedPerson.parents.length > 0">
                                        <div v-for="parent in selectedPerson.parents" :key="parent.id" class="mb-1">
                                            <a href="#" @click.prevent="selectNode(parent.id)" class="text-decoration-none">
                                                <i :class="parent.gender === 'MALE' ? 'bi bi-gender-male text-primary' : 'bi bi-gender-female text-danger'"></i>
                                                {{ parent.firstName }} {{ parent.lastName }}
                                            </a>
                                        </div>
                                    </div>
                                    <p v-else class="mb-1 text-muted small">Не указаны</p>
                                </div>
                                
                                <!-- Дети -->
                                <div class="col-md-6 mb-3">
                                    <label class="small text-muted">Дети:</label>
                                    <div v-if="selectedPerson.children && selectedPerson.children.length > 0">
                                        <div v-for="child in selectedPerson.children" :key="child.id" class="mb-1">
                                            <a href="#" @click.prevent="selectNode(child.id)" class="text-decoration-none">
                                                <i :class="child.gender === 'MALE' ? 'bi bi-gender-male text-primary' : 'bi bi-gender-female text-danger'"></i>
                                                {{ child.firstName }} {{ child.lastName }}
                                            </a>
                                        </div>
                                    </div>
                                    <p v-else class="mb-1 text-muted small">Не указаны</p>
                                </div>
                                
                                <!-- Статистика -->
                                <div class="col-12">
                                    <div class="d-flex gap-3 mt-2">
                                        <div class="text-center">
                                            <div class="fs-4">{{ selectedPerson.parentCount || 0 }}</div>
                                            <small class="text-muted">Родителей</small>
                                        </div>
                                        <div class="text-center">
                                            <div class="fs-4">{{ selectedPerson.childrenCount || 0 }}</div>
                                            <small class="text-muted">Детей</small>
                                        </div>
                                        <div class="text-center">
                                            <div class="fs-4">{{ selectedPerson.siblingsCount || 0 }}</div>
                                            <small class="text-muted">Братьев/Сестер</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Легенда -->
            <div class="card mt-4">
                <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-info-circle"></i> Обозначения и управление</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <h6 class="small">Цвета узлов:</h6>
                            <div class="d-flex align-items-center mb-2">
                                <div style="width: 16px; height: 16px; background-color: #d4edda; border: 2px solid #28a745; margin-right: 8px;"></div>
                                <span class="small">Мужской</span>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                                <div style="width: 16px; height: 16px; background-color: #f8d7da; border: 2px solid #dc3545; margin-right: 8px;"></div>
                                <span class="small">Женский</span>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                                <div style="width: 16px; height: 16px; background-color: #e2e3e5; border: 2px solid #6c757d; margin-right: 8px;"></div>
                                <span class="small">Пол не указан</span>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <h6 class="small">Управление:</h6>
                            <ul class="small mb-0">
                                <li>Клик - выбрать персону</li>
                                <li>Двойной клик - открыть профиль</li>
                                <li>Перетаскивание - перемещение</li>
                                <li>Колесо мыши - масштаб</li>
                                <li>Shift + колесо - горизонтальная прокрутка</li>
                            </ul>
                        </div>
                        
                        <div class="col-md-4">
                            <h6 class="small">Текущий режим:</h6>
                            <div class="small">
                                <div><strong>Ориентация:</strong> {{ getLayoutDisplay() }}</div>
                                <div><strong>Направление:</strong> {{ getDirectionDisplay() }}</div>
                                <div><strong>Физика:</strong> {{ physicsEnabled ? 'Вкл' : 'Выкл' }}</div>
                                <div><strong>Связи:</strong> {{ smoothEdges ? 'Плавные' : 'Прямые' }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            allPersons: [],
            selectedPersonId: null,
            selectedPerson: null,
            treeDepth: 3,
            loading: false,
            error: null,
            network: null,
            nodes: null,
            edges: null,
            treeData: null,

            // Режимы отображения
            layoutMode: 'vertical', // 'vertical' или 'horizontal'
            direction: 'UD', // 'UD' (вниз), 'DU' (вверх), 'LR' (вправо), 'RL' (влево)

            // Настройки
            physicsEnabled: true,
            smoothEdges: true
        }
    },

    async mounted() {
        await this.loadAllPersons();

        this.$nextTick(() => {
            this.initNetwork();

            if (this.$route.params.id) {
                this.selectedPersonId = parseInt(this.$route.params.id);
                setTimeout(() => this.loadTree(), 200);
            }
        });
    },

    methods: {
        async loadAllPersons() {
            try {
                const response = await axios.get('http://localhost:8080/api/persons');
                this.allPersons = response.data;
            } catch (error) {
                console.error('Ошибка загрузки списка персон:', error);
                this.error = 'Не удалось загрузить список персон';
            }
        },

        async loadTree() {
            if (!this.selectedPersonId) return;

            this.loading = true;
            this.error = null;
            this.selectedPerson = null;

            try {
                const response = await axios.get(
                    `http://localhost:8080/api/persons/${this.selectedPersonId}/tree-data`,
                    { params: { depth: this.treeDepth } }
                );

                this.treeData = response.data;

                // Загружаем корневую персону
                await this.loadPersonDetails(this.selectedPersonId);

                // Обновляем визуализацию с текущими настройками
                this.applyLayoutSettings();

            } catch (error) {
                console.error('Ошибка загрузки дерева:', error);
                this.error = 'Не удалось загрузить дерево';
            } finally {
                this.loading = false;
            }
        },

        initNetwork() {
            if (!this.$refs.treeContainer) return;

            try {
                if (typeof vis === 'undefined') {
                    throw new Error('Библиотека vis-network не загружена');
                }

                this.nodes = new vis.DataSet([]);
                this.edges = new vis.DataSet([]);

                const container = this.$refs.treeContainer;
                const data = {
                    nodes: this.nodes,
                    edges: this.edges
                };

                // Начальные настройки
                const options = this.getNetworkOptions();

                this.network = new vis.Network(container, data, options);

                // Обработчики событий
                this.network.on('click', this.handleNodeClick.bind(this));
                this.network.on('doubleClick', this.handleDoubleClick.bind(this));

            } catch (error) {
                console.error('Ошибка инициализации сети:', error);
                this.error = 'Не удалось инициализировать дерево';
            }
        },

        getNetworkOptions() {
            // Базовые настройки, зависящие от режима
            const baseOptions = {
                interaction: {
                    hover: true,
                    selectable: true,
                    dragNodes: true,
                    dragView: true,
                    zoomView: true,
                    multiselect: false,
                    tooltipDelay: 200
                },
                nodes: {
                    shape: 'box',
                    margin: 10,
                    widthConstraint: {
                        minimum: 100,
                        maximum: 150
                    },
                    font: {
                        size: 12,
                        face: 'Arial'
                    },
                    borderWidth: 2,
                    shadow: {
                        enabled: true,
                        color: 'rgba(0,0,0,0.1)',
                        size: 5,
                        x: 2,
                        y: 2
                    }
                },
                edges: {
                    arrows: {
                        to: {
                            enabled: true,
                            scaleFactor: 0.7,
                            type: 'arrow'
                        }
                    },
                    color: {
                        color: '#6c757d',
                        highlight: '#0d6efd',
                        hover: '#0d6efd'
                    },
                    width: 2,
                    hoverWidth: 3
                }
            };

            // Настройки физики
            if (this.physicsEnabled) {
                baseOptions.physics = {
                    enabled: true,
                    hierarchicalRepulsion: {
                        nodeDistance: 120,
                        springLength: 100,
                        springConstant: 0.01,
                        damping: 0.09
                    },
                    solver: 'hierarchicalRepulsion'
                };
            } else {
                baseOptions.physics = { enabled: false };
            }

            // Настройки связей
            if (this.smoothEdges) {
                baseOptions.edges.smooth = {
                    type: 'cubicBezier',
                    forceDirection: this.layoutMode === 'vertical' ? 'vertical' : 'horizontal',
                    roundness: 0.4
                };
            } else {
                baseOptions.edges.smooth = false;
            }

            // Настройки макета в зависимости от режима
            baseOptions.layout = {
                hierarchical: {
                    enabled: true,
                    direction: this.direction,
                    sortMethod: 'directed',
                    levelSeparation: this.layoutMode === 'vertical' ? 120 : 200,
                    nodeSpacing: 100,
                    treeSpacing: 200,
                    blockShifting: true,
                    edgeMinimization: true,
                    parentCentralization: true
                }
            };

            return baseOptions;
        },

        applyLayoutSettings() {
            if (!this.network || !this.treeData) return;

            try {
                // Очищаем данные
                this.nodes.clear();
                this.edges.clear();

                // Добавляем узлы с учетом цветов
                if (this.treeData.nodes && this.treeData.nodes.length > 0) {
                    const nodesArray = this.treeData.nodes.map(node => {
                        const gender = node.data?.gender || 'UNKNOWN';
                        return {
                            id: node.id,
                            label: node.label || 'Без имени',
                            title: node.title || '',
                            color: this.getNodeColor(gender),
                            font: { size: 12 },
                            data: node.data || {}
                        };
                    });

                    this.nodes.add(nodesArray);
                }

                // Добавляем ребра
                if (this.treeData.edges && this.treeData.edges.length > 0) {
                    const edgesArray = this.treeData.edges.map(edge => ({
                        from: edge.from,
                        to: edge.to,
                        arrows: 'to',
                        color: '#6c757d'
                    }));

                    this.edges.add(edgesArray);
                }

                // Применяем новые настройки сети
                const newOptions = this.getNetworkOptions();
                this.network.setOptions(newOptions);

                // Подгоняем под экран
                setTimeout(() => {
                    this.fitToScreen();
                }, 100);

            } catch (error) {
                console.error('Ошибка применения настроек:', error);
            }
        },

        // Методы изменения режимов
        changeLayout(mode) {
            this.layoutMode = mode;

            // Устанавливаем направление по умолчанию для режима
            if (mode === 'vertical') {
                this.direction = 'UD'; // сверху вниз по умолчанию
            } else {
                this.direction = 'LR'; // слева направо по умолчанию
            }

            this.applyLayoutSettings();
        },

        changeDirection(dir) {
            this.direction = dir;
            this.applyLayoutSettings();
        },

        togglePhysics() {
            this.physicsEnabled = !this.physicsEnabled;
            this.applyLayoutSettings();
        },

        toggleSmoothEdges() {
            this.smoothEdges = !this.smoothEdges;
            this.applyLayoutSettings();
        },

        getNodeColor(gender) {
            if (!gender) {
                return {
                    background: '#e2e3e5',
                    border: '#6c757d',
                    highlight: { background: '#d6d8db', border: '#545b62' }
                };
            }

            // Получаем строковое представление пола
            const genderStr = gender.toString ? gender.toString().toUpperCase() : String(gender).toUpperCase();

            if (genderStr.includes('MALE')) {
                return {
                    background: '#d4edda',
                    border: '#28a745',
                    highlight: { background: '#c3e6cb', border: '#1e7e34' }
                };
            }

            if (genderStr.includes('FEMALE')) {
                return {
                    background: '#f8d7da',
                    border: '#dc3545',
                    highlight: { background: '#f5c6cb', border: '#bd2130' }
                };
            }

            return {
                background: '#e2e3e5',
                border: '#6c757d',
                highlight: { background: '#d6d8db', border: '#545b62' }
            };
        },

        // Вспомогательные методы для отображения
        getLayoutDisplay() {
            const layouts = {
                vertical: 'Вертикальное',
                horizontal: 'Горизонтальное'
            };
            return layouts[this.layoutMode] || this.layoutMode;
        },

        getDirectionDisplay() {
            const directions = {
                UD: 'Сверху вниз',
                DU: 'Снизу вверх',
                LR: 'Слева направо',
                RL: 'Справа налево'
            };
            return directions[this.direction] || this.direction;
        },

        getLayoutIcon() {
            if (this.layoutMode === 'vertical') {
                return this.direction === 'UD' ? 'bi bi-arrow-down' : 'bi bi-arrow-up';
            } else {
                return this.direction === 'LR' ? 'bi bi-arrow-right' : 'bi bi-arrow-left';
            }
        },

        async handleNodeClick(params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                await this.loadPersonDetails(nodeId);

                if (this.network) {
                    try {
                        this.network.selectNodes([nodeId]);
                    } catch (e) {
                        console.warn('Не удалось выделить узел:', e);
                    }
                }
            }
        },

        async loadPersonDetails(personId) {
            try {
                const response = await axios.get(`http://localhost:8080/api/persons/${personId}`);
                const personData = response.data;

                // Собираем информацию о связях из treeData
                let parents = [];
                let children = [];

                if (this.treeData && this.treeData.edges) {
                    // Родители - те, кто указывает на эту персону
                    parents = this.treeData.edges
                        .filter(edge => edge.to === personId)
                        .map(edge => {
                            const node = this.treeData.nodes.find(n => n.id === edge.from);
                            return node ? node.data || node : null;
                        })
                        .filter(Boolean);

                    // Дети - те, на кого указывает эта персона
                    children = this.treeData.edges
                        .filter(edge => edge.from === personId)
                        .map(edge => {
                            const node = this.treeData.nodes.find(n => n.id === edge.to);
                            return node ? node.data || node : null;
                        })
                        .filter(Boolean);
                }

                this.selectedPerson = {
                    id: personData.id,
                    firstName: personData.firstName,
                    lastName: personData.lastName,
                    middleName: personData.middleName,
                    birthDate: personData.birthDate,
                    deathDate: personData.deathDate,
                    gender: personData.gender,
                    biography: personData.biography,
                    parents: parents,
                    children: children,
                    parentCount: parents.length,
                    childrenCount: children.length,
                    siblingsCount: this.calculateSiblingsCount(personId, parents)
                };

            } catch (error) {
                console.error('Ошибка загрузки деталей персоны:', error);
                // Используем данные из списка, если есть
                const personInList = this.allPersons.find(p => p.id === personId);
                if (personInList) {
                    this.selectedPerson = {
                        ...personInList,
                        parents: [],
                        children: [],
                        parentCount: 0,
                        childrenCount: 0,
                        siblingsCount: 0
                    };
                }
            }
        },

        calculateSiblingsCount(personId, parents) {
            if (!this.treeData || !parents || parents.length === 0) return 0;

            // Находим всех детей общих родителей
            const parentIds = parents.map(p => p.id);
            const siblings = this.treeData.nodes.filter(node => {
                if (node.id === personId) return false; // исключаем саму персону

                // Проверяем, есть ли у этого человека такие же родители
                const nodeEdges = this.treeData.edges.filter(edge => edge.to === node.id);
                const nodeParentIds = nodeEdges.map(edge => edge.from);

                // Проверяем, есть ли общие родители
                return parentIds.some(parentId => nodeParentIds.includes(parentId));
            });

            return siblings.length;
        },

        selectNode(nodeId) {
            // Выбираем узел в дереве
            if (this.network) {
                this.network.selectNodes([nodeId]);
                this.network.focus(nodeId, { scale: 1.5, animation: true });
                this.loadPersonDetails(nodeId);
            }
        },

        handleDoubleClick(params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                this.$router.push(`/persons/${nodeId}`);
            }
        },

        setAsRoot(personId) {
            this.selectedPersonId = personId;
            this.loadTree();
        },

        fitToScreen() {
            if (this.network) {
                try {
                    this.network.fit({
                        animation: {
                            duration: 1000,
                            easingFunction: 'easeInOutQuad'
                        }
                    });
                } catch (error) {
                    console.warn('Не удалось подогнать дерево:', error);
                }
            }
        },

        resetView() {
            // Сброс к начальному виду
            this.physicsEnabled = true;
            this.smoothEdges = true;
            this.fitToScreen();
        },

        zoomToNode(nodeId) {
            if (this.network) {
                try {
                    this.network.focus(nodeId, {
                        scale: 1.8,
                        animation: { duration: 600 }
                    });
                } catch (error) {
                    console.warn('Не удалось приблизить к узлу:', error);
                }
            }
        },

        exportTree() {
            if (!this.network) return;

            try {
                const canvas = this.$refs.treeContainer.querySelector('canvas');
                if (canvas) {
                    const link = document.createElement('a');
                    const date = new Date().toISOString().split('T')[0];
                    link.download = `family-tree-${date}-${this.layoutMode}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            } catch (error) {
                console.error('Ошибка экспорта:', error);
                alert('Не удалось экспортировать дерево');
            }
        },

        exportJSON() {
            if (!this.treeData) return;

            try {
                const dataStr = JSON.stringify(this.treeData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const date = new Date().toISOString().split('T')[0];

                const link = document.createElement('a');
                link.download = `family-tree-${date}.json`;
                link.href = URL.createObjectURL(dataBlob);
                link.click();

                setTimeout(() => URL.revokeObjectURL(link.href), 100);
            } catch (error) {
                console.error('Ошибка экспорта JSON:', error);
                alert('Не удалось экспортировать дерево в JSON');
            }
        },

        getGenderIcon(gender) {
            if (!gender) return 'bi bi-gender-ambiguous';

            const genderStr = gender.toString ? gender.toString().toUpperCase() : String(gender).toUpperCase();

            if (genderStr.includes('MALE')) return 'bi bi-gender-male';
            if (genderStr.includes('FEMALE')) return 'bi bi-gender-female';

            return 'bi bi-gender-ambiguous';
        },

        getGenderDisplay(gender) {
            // Обрабатываем разные форматы данных
            if (!gender) return 'Не указан';

            if (typeof gender === 'string') {
                if (gender === 'MALE' || gender === 'Мужской') return 'Мужской';
                if (gender === 'FEMALE' || gender === 'Женский') return 'Женский';
            }

            // Если gender - объект (из бэкенда)
            if (typeof gender === 'object') {
                if (gender.toString().includes('MALE')) return 'Мужской';
                if (gender.toString().includes('FEMALE')) return 'Женский';
            }

            return 'Не указан';
        },

        formatDate(dateString) {
            if (!dateString) return 'Не указано';
            return new Date(dateString).toLocaleDateString('ru-RU');
        },

        formatYear(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? '' : date.getFullYear();
        },

        calculateAge(birthDate, deathDate) {
            if (!birthDate) return '';

            const birth = new Date(birthDate);
            const end = deathDate ? new Date(deathDate) : new Date();

            let years = end.getFullYear() - birth.getFullYear();
            const months = end.getMonth() - birth.getMonth();

            if (months < 0 || (months === 0 && end.getDate() < birth.getDate())) {
                years--;
            }

            return deathDate ? `${years} лет` : `${years} лет`;
        }
    },

    beforeUnmount() {
        if (this.network) {
            try {
                this.network.destroy();
            } catch (error) {
                console.warn('Ошибка при очистке сети:', error);
            }
        }
    }
};