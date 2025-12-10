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
                                <button class="btn btn-outline-secondary" @click="resetTree" title="Сброс дерева">
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
            <div class="card">
                <div class="card-body p-0 position-relative">
                    <div ref="treeContainer" style="width: 100%; height: 600px;"></div>
                    <div v-if="!network && !loading" class="position-absolute top-50 start-50 translate-middle text-center">
                        <div class="spinner-border text-primary"></div>
                        <p class="mt-2">Инициализация дерева...</p>
                    </div>
                </div>
            </div>

            <!-- Легенда -->
            <div class="card mt-4">
                <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-info-circle"></i> Легенда и управление</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="d-flex align-items-center gap-4 mb-3">
                                <div class="d-flex align-items-center">
                                    <div style="width: 20px; height: 20px; background-color: #d4edda; border: 2px solid #28a745; margin-right: 8px;"></div>
                                    <span>Мужской пол</span>
                                </div>
                                <div class="d-flex align-items-center">
                                    <div style="width: 20px; height: 20px; background-color: #f8d7da; border: 2px solid #dc3545; margin-right: 8px;"></div>
                                    <span>Женский пол</span>
                                </div>
                                <div class="d-flex align-items-center">
                                    <div style="width: 20px; height: 20px; background-color: #e2e3e5; border: 2px solid #6c757d; margin-right: 8px;"></div>
                                    <span>Пол не указан</span>
                                </div>
                            </div>
                            <div class="text-muted small">
                                <i class="bi bi-mouse"></i> Управление: ЛКМ - выделение, ПКМ - контекстное меню, Колесо мыши - масштаб, Двойной клик - переход к персоне
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div v-if="selectedNode" class="alert alert-info p-2">
                                <small>
                                    <strong>Выбрано:</strong> {{ selectedNode.firstName }} {{ selectedNode.lastName }}<br>
                                    <button v-if="selectedNode.id !== selectedPersonId" 
                                            @click="setRootNode(selectedNode.id)" 
                                            class="btn btn-sm btn-outline-primary mt-1">
                                        Сделать корнем
                                    </button>
                                </small>
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
            selectedNode: null,
            treeDepth: 3,
            loading: false,
            error: null,
            network: null,
            nodes: null,
            edges: null
        }
    },

    async mounted() {
        await this.loadAllPersons();

        // Даем время на рендеринг DOM
        this.$nextTick(() => {
            this.initNetwork();

            // Если в URL есть ID персоны, выбираем ее
            if (this.$route.params.id) {
                this.selectedPersonId = parseInt(this.$route.params.id);
                setTimeout(() => this.loadTree(), 100);
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
            this.selectedNode = null;

            try {
                console.log('Загрузка дерева для персоны ID:', this.selectedPersonId);

                const response = await axios.get(
                    `http://localhost:8080/api/persons/${this.selectedPersonId}/tree-data`,
                    {
                        params: { depth: this.treeDepth },
                        timeout: 10000
                    }
                );

                console.log('Данные дерева получены:', response.data);

                if (!response.data || !response.data.nodes) {
                    throw new Error('Некорректный формат данных дерева');
                }

                // Обновляем данные сети
                this.updateNetworkData(response.data);

            } catch (error) {
                console.error('❌ Ошибка загрузки дерева:', error);

                if (error.response) {
                    if (error.response.status === 404) {
                        this.error = 'Эндпоинт дерева не найден. Убедитесь, что бэкенд реализует /api/persons/{id}/tree-data';
                    } else if (error.response.status === 500) {
                        this.error = 'Ошибка сервера при построении дерева';
                    } else {
                        this.error = `Ошибка сервера: ${error.response.status}`;
                    }
                } else if (error.code === 'ECONNABORTED') {
                    this.error = 'Таймаут запроса. Проверьте работу сервера.';
                } else {
                    this.error = 'Не удалось загрузить дерево: ' + (error.message || 'Неизвестная ошибка');
                }

                // Показываем ошибку в контейнере
                if (this.$refs.treeContainer) {
                    this.$refs.treeContainer.innerHTML = `
                        <div class="alert alert-danger m-3">
                            <i class="bi bi-exclamation-triangle"></i> ${this.error}<br>
                            <small>Проверьте консоль для подробностей</small>
                        </div>
                    `;
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
                // Проверяем, что vis доступен
                if (typeof vis === 'undefined') {
                    throw new Error('Библиотека vis-network не загружена');
                }

                // Инициализируем пустые DataSet
                this.nodes = new vis.DataSet([]);
                this.edges = new vis.DataSet([]);

                const container = this.$refs.treeContainer;
                const data = {
                    nodes: this.nodes,
                    edges: this.edges
                };

                // Простые настройки для минимизации ошибок
                const options = {
                    layout: {
                        hierarchical: {
                            enabled: true,
                            direction: 'UD',
                            sortMethod: 'directed',
                            levelSeparation: 120,
                            nodeSpacing: 100
                        }
                    },
                    physics: {
                        enabled: true,
                        hierarchicalRepulsion: {
                            nodeDistance: 120
                        }
                    },
                    interaction: {
                        hover: true,
                        selectable: true,
                        selectConnectedEdges: false
                    },
                    nodes: {
                        shape: 'box',
                        margin: 8,
                        widthConstraint: {
                            minimum: 100,
                            maximum: 150
                        },
                        font: {
                            size: 12,
                            face: 'Arial'
                        },
                        borderWidth: 2
                    },
                    edges: {
                        arrows: {
                            to: {
                                enabled: true,
                                scaleFactor: 0.5
                            }
                        },
                        smooth: false,
                        color: '#6c757d',
                        width: 2
                    }
                };

                // Создаем сеть
                this.network = new vis.Network(container, data, options);

                // Обработчики событий - с обработкой ошибок
                this.network.on('click', this.handleNetworkClick.bind(this));
                this.network.on('doubleClick', this.handleNetworkDoubleClick.bind(this));
                this.network.on('selectNode', this.handleNodeSelect.bind(this));

                console.log('✅ Сеть инициализирована');

            } catch (error) {
                console.error('❌ Ошибка инициализации сети:', error);
                this.error = 'Ошибка инициализации дерева: ' + error.message;

                if (this.$refs.treeContainer) {
                    this.$refs.treeContainer.innerHTML = `
                        <div class="alert alert-danger m-3">
                            <h5>Ошибка инициализации</h5>
                            <p>${error.message}</p>
                            <p>Убедитесь, что подключена библиотека vis-network</p>
                        </div>
                    `;
                }
            }
        },

        updateNetworkData(treeData) {
            if (!this.network || !treeData) {
                console.error('Сеть или данные недоступны');
                return;
            }

            try {
                console.log('Обновление данных сети...');

                // Подготавливаем узлы
                const nodesArray = treeData.nodes.map(node => {
                    const gender = node.data?.gender || node.gender;

                    return {
                        id: node.id,
                        label: node.label || `${node.data?.firstName || ''} ${node.data?.lastName || ''}`.trim(),
                        title: node.title || this.createTooltip(node),
                        shape: 'box',
                        margin: 8,
                        widthConstraint: { minimum: 100, maximum: 150 },
                        color: this.getNodeColor(gender),
                        font: { size: 12 },
                        data: node.data || node
                    };
                });

                // Подготавливаем ребра
                const edgesArray = treeData.edges.map(edge => ({
                    id: `edge_${edge.from}_${edge.to}`,
                    from: edge.from,
                    to: edge.to,
                    arrows: 'to',
                    color: '#6c757d',
                    width: 2
                }));

                // Безопасное обновление данных
                this.nodes.clear();
                this.edges.clear();

                setTimeout(() => {
                    this.nodes.add(nodesArray);
                    this.edges.add(edgesArray);

                    // Подгоняем под экран с задержкой
                    setTimeout(() => {
                        if (this.network) {
                            try {
                                this.network.fit({ animation: false });
                            } catch (e) {
                                console.warn('Не удалось подогнать под экран:', e);
                            }
                        }
                    }, 200);

                    console.log('✅ Данные сети обновлены:', nodesArray.length, 'узлов,', edgesArray.length, 'ребер');
                }, 50);

            } catch (error) {
                console.error('❌ Ошибка обновления данных сети:', error);
                this.error = 'Ошибка отображения дерева: ' + error.message;
            }
        },

        getNodeColor(gender) {
            const colors = {
                MALE: {
                    background: '#d4edda',
                    border: '#28a745',
                    highlight: { background: '#c3e6cb', border: '#1e7e34' }
                },
                FEMALE: {
                    background: '#f8d7da',
                    border: '#dc3545',
                    highlight: { background: '#f5c6cb', border: '#bd2130' }
                },
                default: {
                    background: '#e2e3e5',
                    border: '#6c757d',
                    highlight: { background: '#d6d8db', border: '#545b62' }
                }
            };

            return colors[gender] || colors.default;
        },

        createTooltip(node) {
            const data = node.data || node;
            let tooltip = `<div style="text-align:left;padding:5px;max-width:200px;">`;
            tooltip += `<strong>${data.firstName || ''} ${data.lastName || ''}</strong><br>`;

            if (data.birthDate) {
                tooltip += `Родился: ${new Date(data.birthDate).toLocaleDateString('ru-RU')}<br>`;
            }

            if (data.deathDate) {
                tooltip += `Умер: ${new Date(data.deathDate).toLocaleDateString('ru-RU')}<br>`;
            }

            if (data.gender) {
                tooltip += `Пол: ${data.gender === 'MALE' ? 'Мужской' : 'Женский'}`;
            }

            tooltip += `</div>`;
            return tooltip;
        },

        handleNetworkClick(params) {
            try {
                if (params.nodes && params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    const nodeData = this.nodes.get(nodeId);

                    if (nodeData && nodeData.data) {
                        this.selectedNode = {
                            id: nodeId,
                            firstName: nodeData.data.firstName,
                            lastName: nodeData.data.lastName,
                            gender: nodeData.data.gender
                        };

                        // Безопасное выделение узла
                        setTimeout(() => {
                            if (this.network) {
                                try {
                                    this.network.selectNodes([nodeId]);
                                } catch (e) {
                                    console.warn('Не удалось выделить узел:', e);
                                }
                            }
                        }, 10);
                    }
                } else {
                    this.selectedNode = null;
                }
            } catch (error) {
                console.warn('Ошибка обработки клика:', error);
            }
        },

        handleNetworkDoubleClick(params) {
            if (params.nodes && params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                this.$router.push(`/persons/${nodeId}`);
            }
        },

        handleNodeSelect(params) {
            // Дополнительная обработка выделения узла
            console.log('Узел выделен:', params);
        },

        setRootNode(nodeId) {
            this.selectedPersonId = nodeId;
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
                    console.warn('Не удалось подогнать под экран:', error);
                }
            }
        },

        resetTree() {
            this.selectedNode = null;
            this.fitToScreen();
        },

        exportTree() {
            if (!this.network) return;

            try {
                const canvas = this.$refs.treeContainer.querySelector('canvas');
                if (canvas) {
                    const link = document.createElement('a');
                    const date = new Date().toISOString().split('T')[0];
                    link.download = `family-tree-${date}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            } catch (error) {
                console.error('Ошибка экспорта:', error);
                alert('Не удалось экспортировать дерево');
            }
        },

        formatYear(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? '' : date.getFullYear();
        }
    },

    beforeUnmount() {
        // Очищаем сеть безопасно
        if (this.network) {
            try {
                this.network.destroy();
            } catch (error) {
                console.warn('Ошибка при очистке сети:', error);
            }
            this.network = null;
        }
    }
};