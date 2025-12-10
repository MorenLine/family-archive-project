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
                        <div class="col-md-6">
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
                        
                        <div class="col-md-6">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Глубина дерева:</label>
                                        <div class="d-flex align-items-center">
                                            <input type="range" v-model="treeDepth" min="1" max="5" 
                                                   class="form-range me-2" @change="loadTree">
                                            <span class="badge bg-primary">{{ treeDepth }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Тип расположения:</label>
                                        <select v-model="layoutDirection" class="form-select" @change="changeLayout">
                                            <option value="UD">Сверху вниз</option>
                                            <option value="DU">Снизу вверх</option>
                                            <option value="LR">Слева направо</option>
                                            <option value="RL">Справа налево</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Кнопки управления -->
                    <div class="d-flex gap-2 mt-3">
                        <button class="btn btn-outline-primary" @click="fitToScreen">
                            <i class="bi bi-fullscreen"></i> Подогнать под экран
                        </button>
                        <button class="btn btn-outline-secondary" @click="resetView">
                            <i class="bi bi-arrow-clockwise"></i> Сбросить вид
                        </button>
                        <button class="btn btn-outline-success" @click="expandAll">
                            <i class="bi bi-arrows-angle-expand"></i> Развернуть все
                        </button>
                        <button class="btn btn-outline-info" @click="collapseAll">
                            <i class="bi bi-arrows-angle-contract"></i> Свернуть все
                        </button>
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

            <!-- Основной контейнер для дерева -->
            <div class="card">
                <div class="card-body p-0">
                    <div ref="treeContainer" 
                         style="width: 100%; height: 700px; border: 1px solid #dee2e6; border-radius: 4px; overflow: hidden;">
                    </div>
                </div>
            </div>

            <!-- Панель информации и легенда -->
            <div class="row mt-4">
                <div class="col-md-8">
                    <!-- Информация о выбранной персоне -->
                    <div v-if="selectedPersonInfo" class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0"><i class="bi bi-person"></i> Выбранная персона</h6>
                            <div>
                                <button v-if="selectedPersonInfo.id !== selectedPersonId" 
                                        class="btn btn-sm btn-outline-primary me-2" 
                                        @click="setAsRoot(selectedPersonInfo.id)">
                                    Сделать корнем
                                </button>
                                <router-link :to="'/persons/' + selectedPersonInfo.id" 
                                            class="btn btn-sm btn-primary">
                                    <i class="bi bi-eye"></i> Подробнее
                                </router-link>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-2">
                                        <strong>Имя:</strong> {{ selectedPersonInfo.firstName }}
                                    </div>
                                    <div class="mb-2">
                                        <strong>Фамилия:</strong> {{ selectedPersonInfo.lastName }}
                                    </div>
                                    <div v-if="selectedPersonInfo.middleName" class="mb-2">
                                        <strong>Отчество:</strong> {{ selectedPersonInfo.middleName }}
                                    </div>
                                    <div class="mb-2">
                                        <strong>Пол:</strong>
                                        <span :class="selectedPersonInfo.gender === 'MALE' ? 'text-primary' : 'text-danger'">
                                            <i :class="getGenderIcon(selectedPersonInfo.gender)"></i>
                                            {{ getGenderDisplay(selectedPersonInfo.gender) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div v-if="selectedPersonInfo.birthDate" class="mb-2">
                                        <strong>Дата рождения:</strong> {{ formatDate(selectedPersonInfo.birthDate) }}
                                    </div>
                                    <div v-if="selectedPersonInfo.deathDate" class="mb-2">
                                        <strong>Дата смерти:</strong> {{ formatDate(selectedPersonInfo.deathDate) }}
                                    </div>
                                    <div class="mb-2">
                                        <strong>ID в дереве:</strong> <code>{{ selectedPersonInfo.id }}</code>
                                    </div>
                                    <div v-if="selectedPersonInfo.biography" class="mt-3">
                                        <strong>Биография:</strong>
                                        <p class="small text-muted mt-1" style="max-height: 100px; overflow-y: auto;">
                                            {{ selectedPersonInfo.biography }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <!-- Легенда -->
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="bi bi-info-circle"></i> Легенда</h6>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <div class="d-flex align-items-center mb-2">
                                    <div style="width: 20px; height: 20px; background-color: #d4edda; 
                                               border: 2px solid #28a745; margin-right: 8px;"></div>
                                    <span>Мужской пол</span>
                                </div>
                                <div class="d-flex align-items-center mb-2">
                                    <div style="width: 20px; height: 20px; background-color: #f8d7da; 
                                               border: 2px solid #dc3545; margin-right: 8px;"></div>
                                    <span>Женский пол</span>
                                </div>
                                <div class="d-flex align-items-center">
                                    <div style="width: 20px; height: 20px; background-color: #e2e3e5; 
                                               border: 2px solid #6c757d; margin-right: 8px;"></div>
                                    <span>Пол не указан</span>
                                </div>
                            </div>
                            
                            <div class="mt-3">
                                <h6 class="small">Управление деревом:</h6>
                                <ul class="small mb-0">
                                    <li><strong>Клик</strong> - выбрать персону</li>
                                    <li><strong>Двойной клик</strong> - открыть профиль</li>
                                    <li><strong>Колесо мыши</strong> - масштабирование</li>
                                    <li><strong>Перетаскивание</strong> - перемещение дерева</li>
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
            selectedPersonInfo: null,
            treeDepth: 3,
            layoutDirection: 'UD',
            loading: false,
            error: null,
            network: null,
            treeData: null
        }
    },

    async mounted() {
        await this.loadAllPersons();

        if (this.$route.params.id) {
            this.selectedPersonId = parseInt(this.$route.params.id);
            await this.loadTree();
        }
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
            this.selectedPersonInfo = null;

            try {
                const response = await axios.get(
                    `http://localhost:8080/api/persons/${this.selectedPersonId}/tree-data`,
                    { params: { depth: this.treeDepth } }
                );

                this.treeData = response.data;
                await this.createTreeVisualization();

                // Находим корневую персону
                const rootPerson = this.allPersons.find(p => p.id === this.selectedPersonId);
                if (rootPerson) {
                    this.selectedPersonInfo = {
                        id: rootPerson.id,
                        firstName: rootPerson.firstName,
                        lastName: rootPerson.lastName,
                        middleName: rootPerson.middleName,
                        birthDate: rootPerson.birthDate,
                        deathDate: rootPerson.deathDate,
                        gender: rootPerson.gender,
                        biography: rootPerson.biography
                    };
                }

            } catch (error) {
                console.error('Ошибка загрузки дерева:', error);
                this.error = 'Не удалось загрузить дерево';
                if (error.response?.status === 404) {
                    this.error += '. Эндпоинт не найден. Убедитесь, что сервер запущен и реализован метод tree-data.';
                }
            } finally {
                this.loading = false;
            }
        },

        async createTreeVisualization() {
            // Удаляем предыдущее дерево
            if (this.network) {
                this.network.destroy();
                this.network = null;
            }

            await this.$nextTick();

            const container = this.$refs.treeContainer;
            if (!container) return;

            // Очищаем контейнер
            container.innerHTML = '';

            // Преобразуем данные для vis-network
            const nodes = this.transformNodes();
            const edges = this.transformEdges();

            // Настройки для дерева с исправленным layout
            const options = {
                layout: {
                    improvedLayout: true,
                    hierarchical: {
                        enabled: true,
                        direction: this.layoutDirection,
                        sortMethod: 'directed',
                        levelSeparation: 200,    // Увеличиваем расстояние между уровнями
                        nodeSpacing: 150,        // Увеличиваем расстояние между узлами на одном уровне
                        treeSpacing: 250,        // Увеличиваем расстояние между деревьями
                        blockShifting: true,
                        edgeMinimization: true,
                        parentCentralization: true
                    }
                },
                physics: {
                    enabled: false, // Отключаем физику для стабильного расположения
                    stabilization: {
                        enabled: true,
                        iterations: 1000,
                        updateInterval: 100
                    },
                    hierarchicalRepulsion: {
                        centralGravity: 0.0,
                        springLength: 200,
                        springConstant: 0.01,
                        nodeDistance: 200,
                        damping: 0.09
                    }
                },
                nodes: {
                    shape: 'box',
                    margin: 15,
                    widthConstraint: {
                        minimum: 140,
                        maximum: 200
                    },
                    heightConstraint: {
                        minimum: 60,
                        maximum: 80
                    },
                    font: {
                        size: 14,
                        face: 'Arial',
                        bold: {
                            color: '#343a40'
                        }
                    },
                    borderWidth: 2,
                    shadow: {
                        enabled: true,
                        color: 'rgba(0,0,0,0.1)',
                        size: 8,
                        x: 3,
                        y: 3
                    }
                },
                edges: {
                    arrows: {
                        to: {
                            enabled: true,
                            type: 'arrow',
                            scaleFactor: 0.7
                        }
                    },
                    smooth: {
                        type: 'cubicBezier',
                        roundness: 0.3
                    },
                    color: {
                        color: '#adb5bd',
                        highlight: '#0d6efd',
                        hover: '#0d6efd'
                    },
                    width: 2,
                    hoverWidth: 3,
                    selectionWidth: 3
                },
                interaction: {
                    hover: true,
                    hoverConnectedEdges: true,
                    selectable: true,
                    selectConnectedEdges: false,
                    zoomView: true,
                    dragView: true,
                    dragNodes: false, // Отключаем перетаскивание узлов
                    multiselect: false,
                    navigationButtons: true,
                    keyboard: {
                        enabled: true,
                        speed: { x: 10, y: 10, zoom: 0.02 }
                    }
                },
                manipulation: {
                    enabled: false
                }
            };

            // Создаем сеть
            const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
            this.network = new vis.Network(container, data, options);

            // Добавляем обработчики событий
            this.setupEventHandlers();

            // Ждем стабилизации и подгоняем под экран
            setTimeout(() => {
                this.fitToScreen();
            }, 500);
        },

        transformNodes() {
            if (!this.treeData?.nodes) return [];

            return this.treeData.nodes.map(node => {
                const gender = node.data?.gender;

                // Цвет в зависимости от пола
                let color;
                if (gender === 'MALE') {
                    color = {
                        background: '#d4edda',
                        border: '#28a745',
                        highlight: {
                            background: '#c3e6cb',
                            border: '#1e7e34'
                        },
                        hover: {
                            background: '#c3e6cb',
                            border: '#1e7e34'
                        }
                    };
                } else if (gender === 'FEMALE') {
                    color = {
                        background: '#f8d7da',
                        border: '#dc3545',
                        highlight: {
                            background: '#f5c6cb',
                            border: '#bd2130'
                        },
                        hover: {
                            background: '#f5c6cb',
                            border: '#bd2130'
                        }
                    };
                } else {
                    color = {
                        background: '#e2e3e5',
                        border: '#6c757d',
                        highlight: {
                            background: '#d6d8db',
                            border: '#545b62'
                        },
                        hover: {
                            background: '#d6d8db',
                            border: '#545b62'
                        }
                    };
                }

                // Дополнительная информация для всплывающей подсказки
                let title = `<div style="text-align: left; padding: 8px; min-width: 200px;">
                    <strong>${node.label || ''}</strong><br/>`;

                if (node.data?.birthDate) {
                    title += `Родился: ${this.formatDate(node.data.birthDate)}<br/>`;
                }
                if (node.data?.deathDate) {
                    title += `Умер: ${this.formatDate(node.data.deathDate)}<br/>`;
                }
                if (gender) {
                    title += `Пол: ${gender === 'MALE' ? 'Мужской' : 'Женский'}<br/>`;
                }
                if (node.data?.biography && node.data.biography.length > 0) {
                    const shortBio = node.data.biography.length > 100
                        ? node.data.biography.substring(0, 100) + '...'
                        : node.data.biography;
                    title += `<br/><em>${shortBio}</em>`;
                }
                title += `</div>`;

                return {
                    id: node.id,
                    label: node.label || `${node.data?.firstName || ''} ${node.data?.lastName || ''}`,
                    title: title,
                    color: color,
                    shape: 'box',
                    margin: 12,
                    widthConstraint: { minimum: 140, maximum: 200 },
                    heightConstraint: { minimum: 60 },
                    font: { size: 13, face: 'Arial' },
                    data: node.data
                };
            });
        },

        transformEdges() {
            if (!this.treeData?.edges) return [];

            return this.treeData.edges.map(edge => ({
                from: edge.from,
                to: edge.to,
                arrows: 'to',
                smooth: {
                    type: 'cubicBezier',
                    roundness: 0.3
                },
                color: {
                    color: '#adb5bd',
                    highlight: '#0d6efd',
                    hover: '#0d6efd'
                },
                width: 2
            }));
        },

        setupEventHandlers() {
            if (!this.network) return;

            // Клик по узлу - выбираем персону
            this.network.on('click', (params) => {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    this.selectPerson(nodeId);
                }
            });

            // Двойной клик - открываем профиль
            this.network.on('doubleClick', (params) => {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    this.$router.push(`/persons/${nodeId}`);
                }
            });

            // При выделении узла
            this.network.on('selectNode', (params) => {
                if (params.nodes.length > 0) {
                    this.network.selectNodes(params.nodes);
                }
            });
        },

        selectPerson(nodeId) {
            // Ищем персону в данных дерева
            if (this.treeData?.nodes) {
                const node = this.treeData.nodes.find(n => n.id === nodeId);
                if (node?.data) {
                    this.selectedPersonInfo = {
                        id: node.id,
                        firstName: node.data.firstName,
                        lastName: node.data.lastName,
                        middleName: node.data.middleName,
                        birthDate: node.data.birthDate,
                        deathDate: node.data.deathDate,
                        gender: node.data.gender,
                        biography: node.data.biography
                    };
                }
            }

            // Выделяем узел в дереве
            if (this.network) {
                try {
                    this.network.selectNodes([nodeId]);
                    this.network.focus(nodeId, {
                        scale: 1.1,
                        offset: { x: 0, y: 0 },
                        animation: {
                            duration: 400,
                            easingFunction: 'easeInOutQuad'
                        }
                    });
                } catch (error) {
                    console.warn('Не удалось выделить узел:', error);
                }
            }
        },

        changeLayout() {
            if (this.network && this.treeData) {
                this.network.setOptions({
                    layout: {
                        hierarchical: {
                            direction: this.layoutDirection
                        }
                    }
                });

                setTimeout(() => {
                    this.fitToScreen();
                }, 300);
            }
        },

        setAsRoot(personId) {
            this.selectedPersonId = personId;
            this.loadTree();
        },

        fitToScreen() {
            if (this.network) {
                this.network.fit({
                    animation: {
                        duration: 800,
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
                            direction: 'UD',
                            levelSeparation: 200,
                            nodeSpacing: 150
                        }
                    }
                });

                this.layoutDirection = 'UD';

                setTimeout(() => {
                    this.fitToScreen();
                }, 300);
            }
        },

        expandAll() {
            if (this.network) {
                this.network.fit({
                    animation: {
                        duration: 1000,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            }
        },

        collapseAll() {
            // Для vis-network нет встроенной функции свертывания,
            // но можно уменьшить масштаб
            if (this.network) {
                this.network.moveTo({
                    scale: 0.5,
                    animation: {
                        duration: 800,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            }
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
            return new Date(dateString).toLocaleDateString('ru-RU');
        },

        formatYear(dateString) {
            if (!dateString) return '';
            return new Date(dateString).getFullYear();
        }
    },

    beforeUnmount() {
        if (this.network) {
            this.network.destroy();
            this.network = null;
        }
    }
};