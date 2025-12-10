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
                                <button class="btn btn-outline-secondary" @click="resetView" title="Сбросить вид">
                                    <i class="bi bi-arrow-clockwise"></i>
                                </button>
                                <div class="btn-group">
                                    <button class="btn btn-outline-success" @click="exportTree" title="Экспорт в PNG">
                                        <i class="bi bi-download"></i>
                                    </button>
                                    <button class="btn btn-outline-info" @click="toggleLayout" title="Сменить ориентацию">
                                        <i class="bi bi-arrow-repeat"></i>
                                    </button>
                                </div>
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
            <div class="card">
                <div class="card-body p-0 position-relative">
                    <div ref="treeContainer" style="width: 100%; height: 600px;"></div>
                    <div v-if="!treeData || treeData.nodes.length === 0" 
                         class="position-absolute top-50 start-50 translate-middle text-center text-muted">
                        <i class="bi bi-tree display-1"></i>
                        <p class="mt-2">Дерево не загружено</p>
                    </div>
                </div>
            </div>

            <!-- Легенда -->
            <div class="card mt-4">
                <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-info-circle"></i> Легенда</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="d-flex align-items-center mb-2">
                                <div style="width: 20px; height: 20px; background-color: #d4edda; border: 2px solid #28a745; margin-right: 8px;"></div>
                                <span>Мужской пол</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="d-flex align-items-center mb-2">
                                <div style="width: 20px; height: 20px; background-color: #f8d7da; border: 2px solid #dc3545; margin-right: 8px;"></div>
                                <span>Женский пол</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="d-flex align-items-center mb-2">
                                <div style="width: 20px; height: 20px; background-color: #e2e3e5; border: 2px solid #6c757d; margin-right: 8px;"></div>
                                <span>Пол не указан</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Информация о выбранной персоне -->
            <div v-if="selectedPersonInfo" class="card mt-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0"><i class="bi bi-person"></i> Выбранная персона</h6>
                    <div>
                        <button class="btn btn-sm btn-outline-secondary me-2" @click="centerOnNode(selectedPersonInfo.id)">
                            <i class="bi bi-zoom-in"></i> Центрировать
                        </button>
                        <router-link :to="'/persons/' + selectedPersonInfo.id" class="btn btn-sm btn-primary">
                            <i class="bi bi-eye"></i> Подробнее
                        </router-link>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <table class="table table-sm">
                                <tbody>
                                    <tr>
                                        <th style="width: 120px;">Имя:</th>
                                        <td>{{ selectedPersonInfo.firstName }}</td>
                                    </tr>
                                    <tr>
                                        <th>Фамилия:</th>
                                        <td>{{ selectedPersonInfo.lastName }}</td>
                                    </tr>
                                    <tr v-if="selectedPersonInfo.middleName">
                                        <th>Отчество:</th>
                                        <td>{{ selectedPersonInfo.middleName }}</td>
                                    </tr>
                                    <tr>
                                        <th>Пол:</th>
                                        <td>
                                            <span :class="selectedPersonInfo.gender === 'MALE' ? 'text-primary' : 'text-danger'">
                                                <i :class="getGenderIcon(selectedPersonInfo.gender)"></i>
                                                {{ getGenderDisplay(selectedPersonInfo.gender) }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <table class="table table-sm">
                                <tbody>
                                    <tr v-if="selectedPersonInfo.birthDate">
                                        <th style="width: 120px;">Дата рождения:</th>
                                        <td>{{ formatDate(selectedPersonInfo.birthDate) }}</td>
                                    </tr>
                                    <tr v-if="selectedPersonInfo.deathDate">
                                        <th>Дата смерти:</th>
                                        <td>{{ formatDate(selectedPersonInfo.deathDate) }}</td>
                                    </tr>
                                    <tr>
                                        <th>ID в дереве:</th>
                                        <td><code>{{ selectedPersonInfo.id }}</code></td>
                                    </tr>
                                </tbody>
                            </table>
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
            loading: false,
            error: null,
            network: null,
            treeData: null,
            layoutDirection: 'UD' // UD - сверху вниз, LR - слева направо
        }
    },

    async mounted() {
        await this.loadAllPersons();

        // Если в URL есть ID персоны, выбираем ее
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
                this.destroyNetwork();
                return;
            }

            this.loading = true;
            this.error = null;
            this.selectedPersonInfo = null;
            this.treeData = null;

            // Уничтожаем старую сеть
            this.destroyNetwork();

            try {
                // Загружаем данные дерева с бэкенда
                const response = await axios.get(
                    `http://localhost:8080/api/persons/${this.selectedPersonId}/tree-data`,
                    { params: { depth: this.treeDepth } }
                );

                if (response.data.error) {
                    throw new Error(response.data.error);
                }

                this.treeData = response.data;

                // Находим выбранную персону для отображения в инфо-панели
                const person = this.allPersons.find(p => p.id === this.selectedPersonId);
                if (person) {
                    this.selectedPersonInfo = {
                        id: person.id,
                        firstName: person.firstName,
                        lastName: person.lastName,
                        middleName: person.middleName,
                        birthDate: person.birthDate,
                        deathDate: person.deathDate,
                        gender: person.gender
                    };
                }

                // Создаем новую сеть с полученными данными
                this.createNetwork();

            } catch (error) {
                console.error('Ошибка загрузки дерева:', error);
                this.error = 'Не удалось загрузить дерево: ' + error.message;
            } finally {
                this.loading = false;
            }
        },

        createNetwork() {
            if (!this.treeData || !this.treeData.nodes || this.treeData.nodes.length === 0) {
                console.warn('Нет данных для создания дерева');
                return;
            }

            const container = this.$refs.treeContainer;
            if (!container) {
                console.error('Контейнер для дерева не найден');
                return;
            }

            // Подготавливаем узлы
            const nodes = new vis.DataSet(this.treeData.nodes.map(node => {
                const processedNode = { ...node };

                // Обрабатываем цвет
                if (processedNode.color && typeof processedNode.color === 'object') {
                    // Цвет уже в правильном формате
                } else {
                    // Создаем цвет на основе пола
                    const gender = node.data?.gender;
                    processedNode.color = this.getNodeColor(gender);
                }

                // Добавляем тень и рамку
                processedNode.shadow = true;
                processedNode.borderWidth = 2;
                processedNode.font = { size: 14, face: 'Arial' };
                processedNode.shape = 'box';
                processedNode.margin = 10;
                processedNode.widthConstraint = { minimum: 100, maximum: 200 };

                return processedNode;
            }));

            // Подготавливаем связи
            const edges = new vis.DataSet(this.treeData.edges.map(edge => ({
                ...edge,
                id: `${edge.from}-${edge.to}`,
                arrows: 'to',
                smooth: {
                    type: 'cubicBezier',
                    forceDirection: this.layoutDirection === 'UD' ? 'vertical' : 'horizontal',
                    roundness: 0.4
                },
                color: { color: '#6c757d', highlight: '#0d6efd', hover: '#0d6efd' },
                width: 2
            })));

            // Настройки сети
            const options = {
                layout: {
                    hierarchical: {
                        direction: this.layoutDirection, // UD или LR
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
                    hoverConnectedEdges: true,
                    selectConnectedEdges: false,
                    dragNodes: true,
                    zoomView: true,
                    dragView: true,
                    tooltipDelay: 100
                },
                nodes: {
                    // Настройки уже применены к каждому узлу индивидуально
                },
                edges: {
                    // Настройки уже применены к каждой связи индивидуально
                }
            };

            // Создаем сеть
            const data = { nodes, edges };
            this.network = new vis.Network(container, data, options);

            // Настраиваем обработчики событий
            this.setupNetworkEvents();

            // Автоматически подгоняем под экран
            setTimeout(() => {
                this.fitToScreen();
            }, 300);
        },

        setupNetworkEvents() {
            if (!this.network) return;

            // Обработчик клика по узлу
            this.network.on('click', (params) => {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    this.handleNodeClick(nodeId);
                }
            });

            // Обработчик двойного клика по узлу
            this.network.on('doubleClick', (params) => {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    this.$router.push(`/persons/${nodeId}`);
                }
            });
        },

        handleNodeClick(nodeId) {
            // Находим информацию о персоне в данных дерева
            if (this.treeData && this.treeData.nodes) {
                const node = this.treeData.nodes.find(n => n.id === nodeId);
                if (node && node.data) {
                    this.selectedPersonInfo = {
                        id: nodeId,
                        firstName: node.data.firstName,
                        lastName: node.data.lastName,
                        middleName: node.data.middleName,
                        birthDate: node.data.birthDate,
                        deathDate: node.data.deathDate,
                        gender: node.data.gender
                    };
                }
            }

            // Если не нашли в данных дерева, ищем в общем списке
            if (!this.selectedPersonInfo) {
                const person = this.allPersons.find(p => p.id === nodeId);
                if (person) {
                    this.selectedPersonInfo = {
                        id: person.id,
                        firstName: person.firstName,
                        lastName: person.lastName,
                        middleName: person.middleName,
                        birthDate: person.birthDate,
                        deathDate: person.deathDate,
                        gender: person.gender
                    };
                }
            }

            // Подсвечиваем выбранный узел (без использования selectNodes)
            if (this.network && this.selectedPersonInfo) {
                // Просто фокусируемся на узле без выделения
                this.network.focus(nodeId, {
                    scale: 1.2,
                    animation: {
                        duration: 500,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            }
        },

        centerOnNode(nodeId) {
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
                            direction: this.layoutDirection
                        }
                    }
                });

                setTimeout(() => {
                    this.fitToScreen();
                }, 100);
            }
        },

        toggleLayout() {
            this.layoutDirection = this.layoutDirection === 'UD' ? 'LR' : 'UD';
            if (this.network) {
                this.network.setOptions({
                    layout: {
                        hierarchical: {
                            direction: this.layoutDirection
                        }
                    }
                });
                setTimeout(() => {
                    this.fitToScreen();
                }, 100);
            }
        },

        exportTree() {
            if (!this.network) return;

            try {
                // Используем встроенный метод vis-network для получения изображения
                const dataUrl = this.network.canvasToBase64('image/png', 1.0);
                if (dataUrl) {
                    const link = document.createElement('a');
                    link.download = `family-tree-${this.selectedPersonId || 'tree'}-${new Date().toISOString().slice(0, 10)}.png`;
                    link.href = dataUrl;
                    link.click();
                }
            } catch (error) {
                console.error('Ошибка при экспорте дерева:', error);
                // Альтернативный способ
                try {
                    const canvas = this.$refs.treeContainer.querySelector('canvas');
                    if (canvas) {
                        const link = document.createElement('a');
                        link.download = `family-tree-${this.selectedPersonId || 'tree'}.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                    }
                } catch (err) {
                    alert('Не удалось экспортировать дерево: ' + error.message);
                }
            }
        },

        getNodeColor(gender) {
            if (gender === 'MALE') {
                return {
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
                return {
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
                return {
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
        },

        destroyNetwork() {
            if (this.network) {
                try {
                    this.network.destroy();
                } catch (e) {
                    console.warn('Ошибка при уничтожении сети:', e);
                }
                this.network = null;
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
            try {
                return new Date(dateString).toLocaleDateString('ru-RU');
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
        }
    },

    beforeUnmount() {
        this.destroyNetwork();
    }
};