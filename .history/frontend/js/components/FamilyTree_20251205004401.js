const FamilyTree = {
    template: `
        <div class="family-tree-container">
            <!-- Заголовок и управление -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="mb-0">
                    <i class="bi bi-diagram-3-fill text-primary"></i> 
                    <span class="ms-2">Генеалогическое дерево</span>
                    <span v-if="currentNodeInfo" class="text-muted fs-5 ms-3">
                        {{ currentNodeInfo.fullName || currentNodeInfo.firstName + ' ' + currentNodeInfo.lastName }}
                    </span>
                </h1>
                <div>
                    <button class="btn btn-outline-secondary me-2" @click="toggleLegend" :title="showLegend ? 'Скрыть легенду' : 'Показать легенду'">
                        <i class="bi bi-info-circle"></i>
                    </button>
                    <router-link to="/persons" class="btn btn-outline-secondary">
                        <i class="bi bi-arrow-left me-1"></i> К списку
                    </router-link>
                </div>
            </div>

            <!-- Панель управления -->
            <div class="card shadow-sm mb-4 border-0">
                <div class="card-body bg-light">
                    <div class="row g-3 align-items-center">
                        <div class="col-md-4">
                            <div class="input-group">
                                <span class="input-group-text bg-white">
                                    <i class="bi bi-person-circle text-primary"></i>
                                </span>
                                <select v-model="selectedPersonId" class="form-select" @change="loadTree">
                                    <option value="">-- Выберите корневую персону --</option>
                                    <option v-for="person in allPersons" :key="person.id" :value="person.id">
                                        {{ person.firstName }} {{ person.lastName }}
                                        <span v-if="person.birthDate">({{ formatYear(person.birthDate) }})</span>
                                    </option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="d-flex align-items-center">
                                <span class="me-3 text-muted small">Глубина:</span>
                                <div class="flex-grow-1">
                                    <input type="range" v-model="treeDepth" min="1" max="5" 
                                           class="form-range" @change="loadTree">
                                </div>
                                <span class="badge bg-primary rounded-pill ms-2 px-3 py-1">{{ treeDepth }}</span>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="d-flex justify-content-end gap-2">
                                <div class="btn-group">
                                    <button class="btn btn-outline-primary" @click="changeLayout('UD')" 
                                            :class="{ 'active': layoutDirection === 'UD' }" title="Вертикальное дерево">
                                        <i class="bi bi-arrow-down-up"></i>
                                    </button>
                                    <button class="btn btn-outline-primary" @click="changeLayout('LR')" 
                                            :class="{ 'active': layoutDirection === 'LR' }" title="Горизонтальное дерево">
                                        <i class="bi bi-arrow-left-right"></i>
                                    </button>
                                </div>
                                
                                <div class="btn-group">
                                    <button class="btn btn-outline-secondary" @click="fitToScreen" title="Подогнать под экран">
                                        <i class="bi bi-zoom-in"></i>
                                    </button>
                                    <button class="btn btn-outline-secondary" @click="resetView" title="Сбросить вид">
                                        <i class="bi bi-arrow-clockwise"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Легенда (скрываемая) -->
            <div v-if="showLegend" class="card mb-4 border-primary">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2">
                    <h6 class="mb-0"><i class="bi bi-info-circle me-2"></i>Легенда</h6>
                    <button class="btn btn-sm btn-outline-light" @click="toggleLegend">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="card-body py-3">
                    <div class="row g-4">
                        <div class="col-md-3">
                            <div class="d-flex align-items-center">
                                <div class="legend-node male me-3"></div>
                                <div>
                                    <strong>Мужчина</strong>
                                    <div class="text-muted small">Зеленый цвет</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="d-flex align-items-center">
                                <div class="legend-node female me-3"></div>
                                <div>
                                    <strong>Женщина</strong>
                                    <div class="text-muted small">Красный цвет</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="d-flex align-items-center">
                                <div class="legend-node unknown me-3"></div>
                                <div>
                                    <strong>Пол не указан</strong>
                                    <div class="text-muted small">Серый цвет</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="d-flex align-items-center">
                                <div class="legend-edge me-3"></div>
                                <div>
                                    <strong>Родительская связь</strong>
                                    <div class="text-muted small">От родителя к ребенку</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Основное содержимое -->
            <div class="row g-4">
                <!-- Дерево -->
                <div class="col-12">
                    <div class="card border-0 shadow-sm overflow-hidden">
                        <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                            <h5 class="mb-0">
                                <i class="bi bi-diagram-3 me-2 text-primary"></i>
                                Дерево семьи
                                <span v-if="treeData" class="badge bg-light text-dark ms-2">
                                    {{ treeData.nodes.length }} персон
                                </span>
                            </h5>
                            <div class="text-muted small">
                                <i class="bi bi-mouse me-1"></i>
                                Кликните по узлу для просмотра информации
                            </div>
                        </div>
                        <div class="card-body p-0 position-relative">
                            <!-- Контейнер для дерева -->
                            <div ref="treeContainer" class="tree-visualization" 
                                 :style="{ height: treeHeight + 'px' }"></div>
                            
                            <!-- Индикатор загрузки -->
                            <div v-if="loading" class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-90">
                                <div class="text-center">
                                    <div class="spinner-border text-primary mb-3" role="status"></div>
                                    <p class="text-muted">Загрузка дерева...</p>
                                </div>
                            </div>
                            
                            <!-- Сообщение об отсутствии данных -->
                            <div v-if="!loading && (!treeData || treeData.nodes.length === 0)" 
                                 class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                                <div class="text-center text-muted">
                                    <i class="bi bi-tree display-1 opacity-50 mb-3"></i>
                                    <h5>Дерево не загружено</h5>
                                    <p class="mb-0">Выберите корневую персону для построения дерева</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Информация о выбранной персоне -->
                <div v-if="currentNodeInfo" class="col-12">
                    <div class="card border-primary shadow-sm">
                        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
                            <h5 class="mb-0">
                                <i class="bi bi-person-fill me-2"></i>
                                Информация о персоне
                                <span v-if="currentNodeInfo.id === selectedPersonId" class="badge bg-light text-dark ms-2">
                                    Корневой узел
                                </span>
                            </h5>
                            <div>
                                <button class="btn btn-sm btn-outline-light me-2" @click="centerOnNode(currentNodeInfo.id)">
                                    <i class="bi bi-geo-alt me-1"></i> Найти в дереве
                                </button>
                                <router-link :to="'/persons/' + currentNodeInfo.id" class="btn btn-sm btn-light">
                                    <i class="bi bi-box-arrow-up-right me-1"></i> Подробнее
                                </router-link>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <!-- Основная информация -->
                                <div class="col-lg-8">
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <div class="info-card">
                                                <div class="info-label">Полное имя</div>
                                                <div class="info-value h5 mb-0">
                                                    {{ currentNodeInfo.lastName }} 
                                                    {{ currentNodeInfo.firstName }} 
                                                    {{ currentNodeInfo.middleName || '' }}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="col-md-3 mb-3">
                                            <div class="info-card">
                                                <div class="info-label">Пол</div>
                                                <div class="info-value">
                                                    <span :class="currentNodeInfo.gender === 'MALE' ? 'badge bg-success' : 'badge bg-danger'">
                                                        <i :class="getGenderIcon(currentNodeInfo.gender)"></i>
                                                        {{ getGenderDisplay(currentNodeInfo.gender) }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="col-md-3 mb-3">
                                            <div class="info-card">
                                                <div class="info-label">ID</div>
                                                <div class="info-value">
                                                    <code class="text-muted">{{ currentNodeInfo.id }}</code>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Даты жизни -->
                                        <div class="col-md-6 mb-3" v-if="currentNodeInfo.birthDate || currentNodeInfo.deathDate">
                                            <div class="info-card">
                                                <div class="info-label">Даты жизни</div>
                                                <div class="info-value">
                                                    <div v-if="currentNodeInfo.birthDate">
                                                        <i class="bi bi-calendar-plus text-success me-2"></i>
                                                        Родился: {{ formatDate(currentNodeInfo.birthDate) }}
                                                    </div>
                                                    <div v-if="currentNodeInfo.deathDate" class="mt-1">
                                                        <i class="bi bi-calendar-x text-danger me-2"></i>
                                                        Умер: {{ formatDate(currentNodeInfo.deathDate) }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Возраст -->
                                        <div class="col-md-3 mb-3" v-if="currentNodeInfo.birthDate">
                                            <div class="info-card">
                                                <div class="info-label">Возраст</div>
                                                <div class="info-value">
                                                    <span class="badge bg-info">
                                                        {{ calculateAge(currentNodeInfo.birthDate, currentNodeInfo.deathDate) }} лет
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Статус -->
                                        <div class="col-md-3 mb-3">
                                            <div class="info-card">
                                                <div class="info-label">Статус</div>
                                                <div class="info-value">
                                                    <span :class="currentNodeInfo.deathDate ? 'badge bg-secondary' : 'badge bg-success'">
                                                        {{ currentNodeInfo.deathDate ? 'Умер' : 'Жив' }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Биография -->
                                    <div v-if="currentNodeInfo.biography" class="mt-3">
                                        <h6 class="border-bottom pb-2 mb-3">
                                            <i class="bi bi-journal-text me-2"></i>Биография
                                        </h6>
                                        <div class="biography-content">
                                            {{ currentNodeInfo.biography }}
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Семейные связи -->
                                <div class="col-lg-4">
                                    <div class="family-connections">
                                        <!-- Родители -->
                                        <div v-if="currentNodeInfo.parents && currentNodeInfo.parents.length > 0" class="mb-4">
                                            <h6 class="border-bottom pb-2 mb-3">
                                                <i class="bi bi-arrow-up-circle me-2"></i>Родители
                                            </h6>
                                            <div class="list-group">
                                                <div v-for="parent in currentNodeInfo.parents" :key="parent.id" 
                                                     class="list-group-item list-group-item-action d-flex align-items-center"
                                                     @click="selectAndCenter(parent.id)">
                                                    <div class="node-indicator me-3" 
                                                         :class="parent.gender === 'MALE' ? 'male' : 'female'"></div>
                                                    <div class="flex-grow-1">
                                                        <div class="fw-medium">{{ parent.fullName }}</div>
                                                        <small class="text-muted">
                                                            <span v-if="parent.birthDate">{{ formatYear(parent.birthDate) }}</span>
                                                            <span v-if="parent.deathDate"> - {{ formatYear(parent.deathDate) }}</span>
                                                        </small>
                                                    </div>
                                                    <i class="bi bi-chevron-right text-muted"></i>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Дети -->
                                        <div v-if="currentNodeInfo.children && currentNodeInfo.children.length > 0">
                                            <h6 class="border-bottom pb-2 mb-3">
                                                <i class="bi bi-arrow-down-circle me-2"></i>Дети
                                                <span class="badge bg-light text-dark ms-2">{{ currentNodeInfo.children.length }}</span>
                                            </h6>
                                            <div class="list-group">
                                                <div v-for="child in currentNodeInfo.children" :key="child.id" 
                                                     class="list-group-item list-group-item-action d-flex align-items-center"
                                                     @click="selectAndCenter(child.id)">
                                                    <div class="node-indicator me-3" 
                                                         :class="child.gender === 'MALE' ? 'male' : 'female'"></div>
                                                    <div class="flex-grow-1">
                                                        <div class="fw-medium">{{ child.fullName }}</div>
                                                        <small class="text-muted">
                                                            <span v-if="child.birthDate">{{ formatYear(child.birthDate) }}</span>
                                                            <span v-if="child.deathDate"> - {{ formatYear(child.deathDate) }}</span>
                                                        </small>
                                                    </div>
                                                    <i class="bi bi-chevron-right text-muted"></i>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Нет связей -->
                                        <div v-if="(!currentNodeInfo.parents || currentNodeInfo.parents.length === 0) && 
                                                  (!currentNodeInfo.children || currentNodeInfo.children.length === 0)" 
                                             class="text-center text-muted py-4">
                                            <i class="bi bi-people display-6 opacity-50 mb-3"></i>
                                            <p>Нет информации о семейных связях</p>
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
            allPersons: [],
            allPersonsMap: new Map(),
            selectedPersonId: null,
            currentNodeInfo: null,
            treeDepth: 3,
            loading: false,
            error: null,
            network: null,
            treeData: null,
            layoutDirection: 'UD',
            showLegend: true,
            treeHeight: 600,
            highlightedNodeId: null,
            nodesDataSet: null,
            edgesDataSet: null
        }
    },

    async mounted() {
        this.adjustTreeHeight();
        window.addEventListener('resize', this.adjustTreeHeight);

        await this.loadAllPersons();

        if (this.$route.params.id) {
            this.selectedPersonId = parseInt(this.$route.params.id);
            await this.loadTree();
        }
    },

    methods: {
        adjustTreeHeight() {
            const screenHeight = window.innerHeight;
            this.treeHeight = Math.max(400, screenHeight * 0.5);
        },

        async loadAllPersons() {
            try {
                const response = await axios.get('http://localhost:8080/api/persons');
                this.allPersons = response.data;
                this.allPersonsMap = new Map(this.allPersons.map(p => [p.id, p]));
            } catch (error) {
                console.error('Ошибка загрузки списка персон:', error);
            }
        },

        async loadTree() {
            if (!this.selectedPersonId) {
                this.destroyNetwork();
                return;
            }

            this.loading = true;
            this.error = null;
            this.currentNodeInfo = null;

            this.destroyNetwork();

            try {
                const response = await axios.get(
                    `http://localhost:8080/api/persons/${this.selectedPersonId}/tree-data`,
                    { params: { depth: this.treeDepth } }
                );

                if (response.data.error) {
                    throw new Error(response.data.error);
                }

                this.treeData = response.data;
                await this.createNetwork();
                await this.loadPersonInfo(this.selectedPersonId);

            } catch (error) {
                console.error('Ошибка загрузки дерева:', error);
                this.error = 'Ошибка загрузки дерева: ' + error.message;
            } finally {
                this.loading = false;
            }
        },

        async createNetwork() {
            if (!this.treeData || !this.treeData.nodes || this.treeData.nodes.length === 0) {
                return;
            }

            const container = this.$refs.treeContainer;
            if (!container) return;

            try {
                // Подготавливаем узлы
                const nodes = this.treeData.nodes.map(node => {
                    const processedNode = { ...node };
                    const gender = node.data?.gender;

                    // Цвет узла
                    let color;
                    if (gender === 'MALE') {
                        color = {
                            background: '#d1e7dd',
                            border: '#198754',
                            highlight: { background: '#badbcc', border: '#146c43' },
                            hover: { background: '#badbcc', border: '#146c43' }
                        };
                    } else if (gender === 'FEMALE') {
                        color = {
                            background: '#f8d7da',
                            border: '#dc3545',
                            highlight: { background: '#f5c6cb', border: '#bd2130' },
                            hover: { background: '#f5c6cb', border: '#bd2130' }
                        };
                    } else {
                        color = {
                            background: '#e2e3e5',
                            border: '#6c757d',
                            highlight: { background: '#d6d8db', border: '#545b62' },
                            hover: { background: '#d6d8db', border: '#545b62' }
                        };
                    }

                    processedNode.color = color;

                    // Метка
                    let label = `${node.data?.firstName || ''} ${node.data?.lastName || ''}`;
                    if (node.data?.birthDate) {
                        const year = new Date(node.data.birthDate).getFullYear();
                        label += `\n${year}`;
                    }
                    processedNode.label = label;

                    // Стиль
                    processedNode.shape = 'box';
                    processedNode.margin = 10;
                    processedNode.font = { size: 14 };
                    processedNode.borderWidth = 2;

                    // Добавляем класс для подсветки
                    processedNode.group = 'default';

                    return processedNode;
                });

                // Подготавливаем связи
                const edges = this.treeData.edges.map(edge => ({
                    id: edge.id || `${edge.from}-${edge.to}`,
                    from: edge.from,
                    to: edge.to,
                    arrows: 'to',
                    smooth: { type: 'cubicBezier', roundness: 0.4 },
                    color: '#6c757d',
                    width: 2
                }));

                // Создаем DataSet
                this.nodesDataSet = new vis.DataSet(nodes);
                this.edgesDataSet = new vis.DataSet(edges);

                // Настройки сети
                const options = {
                    layout: {
                        hierarchical: {
                            direction: this.layoutDirection,
                            sortMethod: 'directed',
                            levelSeparation: 150,
                            nodeSpacing: 120,
                            treeSpacing: 200
                        }
                    },
                    physics: {
                        enabled: true,
                        hierarchicalRepulsion: {
                            nodeDistance: 120
                        },
                        stabilization: {
                            enabled: true,
                            iterations: 100
                        }
                    },
                    interaction: {
                        hover: true,
                        dragNodes: true,
                        zoomView: true,
                        dragView: true
                    },
                    groups: {
                        default: {
                            shape: 'box',
                            font: { size: 14 }
                        },
                        highlighted: {
                            color: {
                                border: '#0d6efd',
                                background: '#cfe2ff',
                                highlight: { border: '#0d6efd', background: '#cfe2ff' }
                            },
                            borderWidth: 3,
                            shadow: true
                        }
                    }
                };

                // Создаем сеть
                const data = {
                    nodes: this.nodesDataSet,
                    edges: this.edgesDataSet
                };

                this.network = new vis.Network(container, data, options);

                // Настраиваем обработчики событий
                this.network.on('click', async (params) => {
                    if (params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        await this.selectAndCenter(nodeId);
                    }
                });

                this.network.on('doubleClick', (params) => {
                    if (params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        this.$router.push(`/persons/${nodeId}`);
                    }
                });

                // Подгоняем под экран
                setTimeout(() => {
                    this.fitToScreen();
                }, 300);

            } catch (error) {
                console.error('Ошибка при создании сети:', error);
                this.error = 'Ошибка при создании дерева';
            }
        },

        async loadPersonInfo(personId) {
            try {
                // Базовые данные из карты
                const person = this.allPersonsMap.get(personId);
                if (!person) return;

                // Загружаем дополнительные данные если нужно
                let parents = [];
                let children = [];
                let biography = '';

                try {
                    // Получаем полную информацию о персоне
                    const response = await axios.get(`http://localhost:8080/api/persons/${personId}`);
                    const fullPerson = response.data;

                    biography = fullPerson.biography || '';

                    // Родители
                    if (fullPerson.parent1) {
                        parents.push({
                            id: fullPerson.parent1.id,
                            fullName: fullPerson.parent1.fullName || fullPerson.parent1.firstName + ' ' + fullPerson.parent1.lastName,
                            gender: fullPerson.parent1.gender,
                            birthDate: fullPerson.parent1.birthDate,
                            deathDate: fullPerson.parent1.deathDate
                        });
                    }
                    if (fullPerson.parent2) {
                        parents.push({
                            id: fullPerson.parent2.id,
                            fullName: fullPerson.parent2.fullName || fullPerson.parent2.firstName + ' ' + fullPerson.parent2.lastName,
                            gender: fullPerson.parent2.gender,
                            birthDate: fullPerson.parent2.birthDate,
                            deathDate: fullPerson.parent2.deathDate
                        });
                    }

                    // Дети (может потребоваться отдельный эндпоинт)
                    // Пока используем базовую информацию

                } catch (apiError) {
                    console.warn('Не удалось загрузить полную информацию о персоне:', apiError);
                }

                // Сохраняем информацию
                this.currentNodeInfo = {
                    id: person.id,
                    firstName: person.firstName,
                    lastName: person.lastName,
                    middleName: person.middleName,
                    birthDate: person.birthDate,
                    deathDate: person.deathDate,
                    gender: person.gender,
                    biography: biography,
                    fullName: person.fullName || person.firstName + ' ' + person.lastName,
                    parents: parents,
                    children: children
                };

                // Подсвечиваем узел
                this.highlightNode(personId);

            } catch (error) {
                console.error('Ошибка загрузки информации о персоне:', error);
            }
        },

        highlightNode(nodeId) {
            if (!this.nodesDataSet || !this.network) return;

            // Сбрасываем предыдущую подсветку
            if (this.highlightedNodeId) {
                const prevNode = this.nodesDataSet.get(this.highlightedNodeId);
                if (prevNode) {
                    const gender = prevNode.data?.gender;
                    let color;
                    if (gender === 'MALE') {
                        color = {
                            background: '#d1e7dd',
                            border: '#198754',
                            highlight: { background: '#badbcc', border: '#146c43' },
                            hover: { background: '#badbcc', border: '#146c43' }
                        };
                    } else if (gender === 'FEMALE') {
                        color = {
                            background: '#f8d7da',
                            border: '#dc3545',
                            highlight: { background: '#f5c6cb', border: '#bd2130' },
                            hover: { background: '#f5c6cb', border: '#bd2130' }
                        };
                    } else {
                        color = {
                            background: '#e2e3e5',
                            border: '#6c757d',
                            highlight: { background: '#d6d8db', border: '#545b62' },
                            hover: { background: '#d6d8db', border: '#545b62' }
                        };
                    }

                    this.nodesDataSet.update({
                        id: this.highlightedNodeId,
                        color: color,
                        borderWidth: 2,
                        group: 'default'
                    });
                }
            }

            // Подсвечиваем новый узел
            const newNode = this.nodesDataSet.get(nodeId);
            if (newNode) {
                this.nodesDataSet.update({
                    id: nodeId,
                    color: {
                        border: '#0d6efd',
                        background: '#cfe2ff',
                        highlight: { border: '#0d6efd', background: '#cfe2ff' }
                    },
                    borderWidth: 4,
                    group: 'highlighted'
                });

                this.highlightedNodeId = nodeId;
            }
        },

        async selectAndCenter(nodeId) {
            // Загружаем информацию о персоне
            await this.loadPersonInfo(nodeId);

            // Центрируем на узле
            if (this.network) {
                this.network.focus(nodeId, {
                    scale: 1.5,
                    animation: {
                        duration: 800,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            }
        },

        centerOnNode(nodeId) {
            if (this.network) {
                this.network.focus(nodeId, {
                    scale: 1.8,
                    animation: {
                        duration: 1000,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            }
        },

        changeLayout(direction) {
            this.layoutDirection = direction;
            if (this.network) {
                this.network.setOptions({
                    layout: {
                        hierarchical: { direction: direction }
                    }
                });
                setTimeout(() => {
                    this.fitToScreen();
                }, 300);
            }
        },

        fitToScreen() {
            if (this.network) {
                this.network.fit({
                    animation: {
                        duration: 1000,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            }
        },

        resetView() {
            if (this.network) {
                this.network.setOptions({
                    layout: {
                        hierarchical: {
                            direction: this.layoutDirection,
                            levelSeparation: 150
                        }
                    }
                });
                setTimeout(() => {
                    this.fitToScreen();
                }, 200);
            }
        },

        toggleLegend() {
            this.showLegend = !this.showLegend;
        },

        calculateAge(birthDate, deathDate) {
            if (!birthDate) return '?';
            const birth = new Date(birthDate);
            const end = deathDate ? new Date(deathDate) : new Date();
            let age = end.getFullYear() - birth.getFullYear();
            const monthDiff = end.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        },

        getGenderIcon(gender) {
            return gender === 'MALE'
                ? 'bi bi-gender-male'
                : gender === 'FEMALE'
                    ? 'bi bi-gender-female'
                    : 'bi bi-gender-ambiguous';
        },

        getGenderDisplay(gender) {
            return gender === 'MALE'
                ? 'Мужской'
                : gender === 'FEMALE'
                    ? 'Женский'
                    : 'Не указан';
        },

        formatDate(dateString) {
            if (!dateString) return '';
            try {
                return new Date(dateString).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (e) {
                return dateString;
            }
        },

        formatYear(dateString) {
            if (!dateString) return '';
            try {
                return new Date(dateString).getFullYear();
            } catch (e) {
                return '';
            }
        },

        destroyNetwork() {
            if (this.network) {
                try {
                    this.network.destroy();
                } catch (e) {
                    console.warn('Ошибка при уничтожении сети:', e);
                }
                this.network = null;
                this.nodesDataSet = null;
                this.edgesDataSet = null;
                this.highlightedNodeId = null;
            }
        }
    },

    beforeUnmount() {
        this.destroyNetwork();
        window.removeEventListener('resize', this.adjustTreeHeight);
    }
};