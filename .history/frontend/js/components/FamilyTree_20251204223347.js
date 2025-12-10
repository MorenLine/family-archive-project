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

            <!-- Панель управления -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label class="form-label">Выберите корневую персону:</label>
                                <select v-model="selectedPersonId" class="form-select" @change="loadTree">
                                    <option value="">-- Выберите персону --</option>
                                    <option v-for="person in allPersons" :key="person.id" :value="person.id">
                                        {{ person.firstName }} {{ person.lastName }}
                                        <span v-if="person.birthDate">({{ formatYear(person.birthDate) }})</span>
                                    </option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label class="form-label">Глубина дерева:</label>
                                <div class="d-flex align-items-center">
                                    <input type="range" v-model="treeDepth" min="1" max="5" class="form-range me-2" 
                                           style="flex: 1;" @change="loadTree">
                                    <span class="badge bg-primary">{{ treeDepth }}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="d-flex gap-2 justify-content-end">
                                <button class="btn btn-outline-primary" @click="fitToScreen" title="Подогнать под экран">
                                    <i class="bi bi-fullscreen"></i>
                                </button>
                                <button class="btn btn-outline-secondary" @click="resetView" title="Сброс вида">
                                    <i class="bi bi-arrow-clockwise"></i>
                                </button>
                                <button class="btn btn-outline-success" @click="exportTree" title="Экспорт в PNG">
                                    <i class="bi bi-download"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Статус -->
                    <div v-if="loading" class="alert alert-info">
                        <div class="spinner-border spinner-border-sm me-2"></div>
                        Загрузка дерева...
                    </div>
                    
                    <div v-if="error" class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i> {{ error }}
                    </div>
                    
                    <div v-if="!selectedPersonId" class="alert alert-warning">
                        <i class="bi bi-info-circle"></i> Выберите корневую персону для отображения дерева
                    </div>
                </div>
            </div>

            <!-- Контейнер для дерева -->
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Визуализация дерева</h5>
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

            <!-- ИНФОРМАЦИЯ О ВЫБРАННОМ ЧЕЛОВЕКЕ (располагается снизу) -->
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
                                
                                <div class="col-12 mb-2">
                                    <label class="small text-muted">ID в системе:</label>
                                    <p class="mb-1"><code>{{ selectedPerson.id }}</code></p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Правая колонка: Связи и дополнительная информация -->
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
                                            <router-link :to="'/persons/' + parent.id" class="text-decoration-none">
                                                <i :class="parent.gender === 'MALE' ? 'bi bi-gender-male text-primary' : 'bi bi-gender-female text-danger'"></i>
                                                {{ parent.firstName }} {{ parent.lastName }}
                                            </router-link>
                                        </div>
                                    </div>
                                    <p v-else class="mb-1 text-muted small">Не указаны</p>
                                </div>
                                
                                <!-- Дети -->
                                <div class="col-md-6 mb-3">
                                    <label class="small text-muted">Дети:</label>
                                    <div v-if="selectedPerson.children && selectedPerson.children.length > 0">
                                        <div v-for="child in selectedPerson.children" :key="child.id" class="mb-1">
                                            <router-link :to="'/persons/' + child.id" class="text-decoration-none">
                                                <i :class="child.gender === 'MALE' ? 'bi bi-gender-male text-primary' : 'bi bi-gender-female text-danger'"></i>
                                                {{ child.firstName }} {{ child.lastName }}
                                            </router-link>
                                        </div>
                                    </div>
                                    <p v-else class="mb-1 text-muted small">Не указаны</p>
                                </div>
                                
                                <!-- Биография (кратко) -->
                                <div class="col-12 mb-3" v-if="selectedPerson.biography">
                                    <label class="small text-muted">Биография:</label>
                                    <p class="mb-1 small text-truncate" style="max-height: 60px; overflow: hidden;">
                                        {{ truncateText(selectedPerson.biography, 150) }}
                                    </p>
                                </div>
                                
                                <!-- Статистика -->
                                <div class="col-12">
                                    <div class="d-flex gap-3">
                                        <div class="text-center">
                                            <div class="fs-4">{{ selectedPerson.parentCount || 0 }}</div>
                                            <small class="text-muted">Родителей</small>
                                        </div>
                                        <div class="text-center">
                                            <div class="fs-4">{{ selectedPerson.childrenCount || 0 }}</div>
                                            <small class="text-muted">Детей</small>
                                        </div>
                                        <div class="text-center">
                                            <div class="fs-4">{{ selectedPerson.photoCount || 0 }}</div>
                                            <small class="text-muted">Фото</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Быстрые действия -->
                    <div class="row mt-3">
                        <div class="col-12">
                            <div class="d-flex gap-2 border-top pt-3">
                                <button class="btn btn-sm btn-outline-secondary" @click="zoomToNode(selectedPerson.id)">
                                    <i class="bi bi-search"></i> Приблизить к узлу
                                </button>
                                <button class="btn btn-sm btn-outline-secondary" @click="highlightConnections(selectedPerson.id)">
                                    <i class="bi bi-arrow-left-right"></i> Показать связи
                                </button>
                                <button class="btn btn-sm btn-outline-secondary" @click="addToTree(selectedPerson.id)">
                                    <i class="bi bi-plus-circle"></i> Добавить родственника
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Легенда (если дерево загружено) -->
            <div v-if="selectedPersonId" class="card mt-4">
                <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-info-circle"></i> Обозначения</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="d-flex align-items-center mb-2">
                                <div style="width: 20px; height: 20px; background-color: #d4edda; border: 2px solid #28a745; margin-right: 8px;"></div>
                                <span>Мужской пол</span>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                                <div style="width: 20px; height: 20px; background-color: #f8d7da; border: 2px solid #dc3545; margin-right: 8px;"></div>
                                <span>Женский пол</span>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                                <div style="width: 20px; height: 20px; background-color: #e2e3e5; border: 2px solid #6c757d; margin-right: 8px;"></div>
                                <span>Пол не указан</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="text-muted small">
                                <p><i class="bi bi-mouse"></i> <strong>Управление:</strong></p>
                                <ul class="mb-0">
                                    <li>Клик по узлу - выбрать персону</li>
                                    <li>Двойной клик - открыть профиль</li>
                                    <li>Перетаскивание - перемещение дерева</li>
                                    <li>Колесо мыши - масштабирование</li>
                                </ul>
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
            treeData: null
        }
    },

    async mounted() {
        await this.loadAllPersons();

        // Инициализация сети после загрузки DOM
        this.$nextTick(() => {
            this.initNetwork();

            // Если в URL есть ID персоны, выбираем ее
            if (this.$route.params.id) {
                this.selectedPersonId = parseInt(this.$route.params.id);
                // Даем время на инициализацию сети
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
            if (!this.selectedPersonId) {
                this.error = 'Выберите корневую персону';
                return;
            }

            this.loading = true;
            this.error = null;
            this.selectedPerson = null;

            try {
                const response = await axios.get(
                    `http://localhost:8080/api/persons/${this.selectedPersonId}/tree-data`,
                    { params: { depth: this.treeDepth } }
                );

                this.treeData = response.data;

                // Находим корневую персону
                const rootPerson = this.allPersons.find(p => p.id === this.selectedPersonId);
                if (rootPerson) {
                    this.selectedPerson = {
                        ...rootPerson,
                        parents: [],
                        children: [],
                        parentCount: 0,
                        childrenCount: 0,
                        photoCount: 0
                    };
                }

                // Обновляем визуализацию
                this.updateNetwork();

            } catch (error) {
                console.error('Ошибка загрузки дерева:', error);
                this.error = 'Не удалось загрузить дерево';
                if (error.response?.status === 404) {
                    this.error = 'Эндпоинт дерева не найден на сервере';
                }
            } finally {
                this.loading = false;
            }
        },

        initNetwork() {
            if (!this.$refs.treeContainer) {
                console.error('Контейнер для дерева не найден');
                return;
            }

            try {
                // Проверяем наличие vis
                if (typeof vis === 'undefined') {
                    throw new Error('Библиотека vis-network не загружена');
                }

                // Создаем DataSet'ы
                this.nodes = new vis.DataSet([]);
                this.edges = new vis.DataSet([]);

                const container = this.$refs.treeContainer;
                const data = {
                    nodes: this.nodes,
                    edges: this.edges
                };

                // Простые настройки
                const options = {
                    layout: {
                        hierarchical: {
                            enabled: true,
                            direction: 'UD',
                            levelSeparation: 120,
                            nodeSpacing: 100
                        }
                    },
                    physics: {
                        enabled: true
                    },
                    interaction: {
                        hover: true,
                        selectable: true
                    },
                    nodes: {
                        shape: 'box',
                        margin: 10,
                        widthConstraint: 100,
                        font: { size: 12 }
                    },
                    edges: {
                        arrows: 'to',
                        color: '#6c757d'
                    }
                };

                // Создаем сеть
                this.network = new vis.Network(container, data, options);

                // Обработчики событий
                this.network.on('click', this.handleNodeClick.bind(this));
                this.network.on('doubleClick', this.handleDoubleClick.bind(this));

                console.log('Сеть инициализирована');

            } catch (error) {
                console.error('Ошибка инициализации сети:', error);
                this.error = 'Не удалось инициализировать дерево: ' + error.message;
            }
        },

        updateNetwork() {
            if (!this.network || !this.treeData) return;

            try {
                // Очищаем данные
                this.nodes.clear();
                this.edges.clear();

                // Добавляем узлы
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

                // Подгоняем под экран
                setTimeout(() => {
                    if (this.network) {
                        this.fitToScreen();
                    }
                }, 100);

            } catch (error) {
                console.error('Ошибка обновления сети:', error);
                this.error = 'Ошибка отображения дерева';
            }
        },

        getNodeColor(gender) {
            const colors = {
                MALE: { background: '#d4edda', border: '#28a745' },
                FEMALE: { background: '#f8d7da', border: '#dc3545' }
            };

            return colors[gender] || { background: '#e2e3e5', border: '#6c757d' };
        },

        async handleNodeClick(params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                await this.loadPersonDetails(nodeId);

                // Выделяем узел в дереве
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
                // Загружаем детальную информацию о персоне
                const response = await axios.get(`http://localhost:8080/api/persons/${personId}`);
                const personData = response.data;

                // Загружаем информацию о родителях
                const parents = [];
                if (personData.parent1) parents.push(personData.parent1);
                if (personData.parent2) parents.push(personData.parent2);

                // Загружаем информацию о детях
                const childrenResponse = await axios.get(`http://localhost:8080/api/persons/${personId}/children`);
                const children = childrenResponse.data || [];

                // Загружаем количество фотографий
                const photosResponse = await axios.get(`http://localhost:8080/api/photos/person/${personId}`);
                const photos = photosResponse.data || [];

                // Обновляем информацию о выбранной персоне
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
                    photoCount: photos.length
                };

            } catch (error) {
                console.error('Ошибка загрузки деталей персоны:', error);

                // Если не удалось загрузить детали, показываем базовую информацию
                const personInList = this.allPersons.find(p => p.id === personId);
                if (personInList) {
                    this.selectedPerson = {
                        id: personInList.id,
                        firstName: personInList.firstName,
                        lastName: personInList.lastName,
                        middleName: personInList.middleName,
                        birthDate: personInList.birthDate,
                        deathDate: personInList.deathDate,
                        gender: personInList.gender,
                        biography: '',
                        parents: [],
                        children: [],
                        parentCount: 0,
                        childrenCount: 0,
                        photoCount: 0
                    };
                }
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
                    this.network.fit({ animation: false });
                } catch (error) {
                    console.warn('Не удалось подогнать дерево:', error);
                }
            }
        },

        resetView() {
            this.fitToScreen();
        },

        exportTree() {
            if (!this.network) return;

            try {
                const canvas = this.$refs.treeContainer.querySelector('canvas');
                if (canvas) {
                    const link = document.createElement('a');
                    link.download = `family-tree-${this.selectedPersonId || 'tree'}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            } catch (error) {
                console.error('Ошибка экспорта:', error);
                alert('Не удалось экспортировать дерево');
            }
        },

        zoomToNode(nodeId) {
            if (this.network) {
                try {
                    this.network.focus(nodeId, {
                        scale: 1.5,
                        animation: { duration: 500 }
                    });
                } catch (error) {
                    console.warn('Не удалось приблизить к узлу:', error);
                }
            }
        },

        highlightConnections(nodeId) {
            if (this.network) {
                try {
                    // Находим все связанные узлы
                    const connectedEdges = this.edges.get({
                        filter: edge => edge.from === nodeId || edge.to === nodeId
                    });

                    const connectedNodes = new Set();
                    connectedEdges.forEach(edge => {
                        connectedNodes.add(edge.from);
                        connectedNodes.add(edge.to);
                    });

                    // Выделяем связанные узлы
                    this.network.selectNodes(Array.from(connectedNodes));

                } catch (error) {
                    console.warn('Не удалось выделить связи:', error);
                }
            }
        },

        addToTree(personId) {
            // Переходим на страницу редактирования для добавления родственника
            this.$router.push(`/persons/new?parentId=${personId}`);
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
            if (!dateString) return 'Не указано';
            return new Date(dateString).toLocaleDateString('ru-RU');
        },

        formatYear(dateString) {
            if (!dateString) return '';
            return new Date(dateString).getFullYear();
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
        },

        truncateText(text, maxLength) {
            if (!text) return '';
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        }
    },

    beforeUnmount() {
        // Очищаем сеть
        if (this.network) {
            try {
                this.network.destroy();
            } catch (error) {
                console.warn('Ошибка при очистке сети:', error);
            }
        }
    }
};