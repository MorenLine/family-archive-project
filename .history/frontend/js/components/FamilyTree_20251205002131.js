const FamilyTree = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1><i class="bi bi-diagram-3"></i> Генеалогическое дерево</h1>
                <div>
                    <button class="btn btn-outline-info me-2" @click="loadTestData">
                        <i class="bi bi-bug"></i> Тест
                    </button>
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
                            </div>
                        </div>
                    </div>
                    
                    <!-- Отладочная информация -->
                    <div v-if="debugInfo" class="alert alert-secondary mt-3">
                        <small>
                            <strong>Отладка:</strong><br>
                            API URL: {{ apiUrl }}<br>
                            Узлов: {{ treeData?.nodes?.length || 0 }}, 
                            Связей: {{ treeData?.edges?.length || 0 }}<br>
                            Ошибка: {{ error }}
                        </small>
                    </div>
                    
                    <!-- Статус -->
                    <div v-if="loading" class="alert alert-info">
                        <div class="spinner-border spinner-border-sm me-2"></div>
                        Загрузка дерева...
                    </div>
                    
                    <div v-if="error" class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i> {{ error }}
                    </div>
                    
                    <div v-if="!selectedPersonId && !useTestData" class="alert alert-warning">
                        <i class="bi bi-info-circle"></i> Выберите корневую персону для отображения дерева
                    </div>
                </div>
            </div>

            <!-- Контейнер для дерева -->
            <div class="card">
                <div class="card-body p-0 position-relative">
                    <div ref="treeContainer" style="width: 100%; height: 600px; min-height: 400px;"></div>
                    <div v-if="!treeData || treeData.nodes.length === 0" 
                         class="position-absolute top-50 start-50 translate-middle text-center text-muted">
                        <i class="bi bi-tree display-1"></i>
                        <p class="mt-2">Дерево не загружено</p>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            allPersons: [],
            selectedPersonId: null,
            treeDepth: 3,
            loading: false,
            error: null,
            network: null,
            treeData: null,
            useTestData: false,
            debugInfo: true,
            apiUrl: ''
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
                console.log('Загружено персон:', this.allPersons.length);
            } catch (error) {
                console.error('Ошибка загрузки списка персон:', error);
                this.error = 'Не удалось загрузить список персон: ' + error.message;
            }
        },

        async loadTree() {
            if (!this.selectedPersonId && !this.useTestData) {
                this.error = 'Выберите корневую персону';
                return;
            }

            this.loading = true;
            this.error = null;
            this.treeData = null;

            // Уничтожаем старую сеть
            this.destroyNetwork();

            try {
                if (this.useTestData) {
                    // Используем тестовые данные
                    this.apiUrl = 'http://localhost:8080/api/test-tree';
                    const response = await axios.get(this.apiUrl);
                    this.treeData = response.data;
                    console.log('Тестовые данные загружены:', this.treeData);
                } else {
                    // Используем реальные данные
                    this.apiUrl = `http://localhost:8080/api/persons/${this.selectedPersonId}/tree-data?depth=${this.treeDepth}`;
                    const response = await axios.get(this.apiUrl);

                    if (response.data.error) {
                        throw new Error(response.data.error);
                    }

                    this.treeData = response.data;
                    console.log('Данные дерева загружены:', this.treeData);
                }

                // Создаем сеть
                this.createNetwork();

            } catch (error) {
                console.error('Ошибка загрузки дерева:', error);
                console.error('Детали ошибки:', error.response?.data);
                this.error = 'Ошибка загрузки дерева: ' +
                    (error.response?.data?.error || error.response?.data?.message || error.message);
            } finally {
                this.loading = false;
            }
        },

        async loadTestData() {
            this.useTestData = true;
            this.selectedPersonId = null;
            await this.loadTree();
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

            try {
                // Подготавливаем узлы
                const nodes = new vis.DataSet(this.treeData.nodes.map(node => {
                    // Убедимся, что узел имеет все необходимые поля
                    const processedNode = { ...node };

                    // Убедимся, что цвет - это объект
                    if (processedNode.color && typeof processedNode.color === 'string') {
                        processedNode.color = { background: processedNode.color, border: '#2B7CE9' };
                    } else if (!processedNode.color) {
                        // Цвет по умолчанию
                        const gender = node.data?.gender;
                        processedNode.color = gender === 'MALE' ?
                            { background: '#d4edda', border: '#28a745' } :
                            gender === 'FEMALE' ?
                                { background: '#f8d7da', border: '#dc3545' } :
                                { background: '#e2e3e5', border: '#6c757d' };
                    }

                    // Базовые настройки
                    processedNode.shape = processedNode.shape || 'box';
                    processedNode.margin = processedNode.margin || 8;
                    processedNode.font = processedNode.font || { size: 12 };
                    processedNode.borderWidth = processedNode.borderWidth || 2;

                    return processedNode;
                }));

                // Подготавливаем связи
                const edges = new vis.DataSet(this.treeData.edges.map(edge => ({
                    id: edge.id || `${edge.from}-${edge.to}`,
                    from: edge.from,
                    to: edge.to,
                    arrows: 'to',
                    smooth: { type: 'cubicBezier', roundness: 0.4 },
                    color: { color: '#6c757d', highlight: '#0d6efd' },
                    width: 2
                })));

                // Настройки сети
                const options = {
                    layout: {
                        hierarchical: {
                            direction: 'UD',
                            sortMethod: 'directed',
                            levelSeparation: 150,
                            nodeSpacing: 120
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
                    }
                };

                // Создаем сеть
                const data = { nodes, edges };
                this.network = new vis.Network(container, data, options);

                // Настраиваем обработчики
                this.network.on('click', (params) => {
                    if (params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        console.log('Выбран узел:', nodeId);
                    }
                });

                // Подгоняем под экран
                setTimeout(() => {
                    this.fitToScreen();
                }, 500);

                console.log('Сеть создана успешно');

            } catch (error) {
                console.error('Ошибка при создании сети:', error);
                this.error = 'Ошибка при создании дерева: ' + error.message;
            }
        },

        fitToScreen() {
            if (this.network) {
                this.network.fit({
                    animation: { duration: 1000 }
                });
            }
        },

        resetView() {
            if (this.network) {
                this.network.setOptions({
                    layout: { hierarchical: { direction: 'UD' } }
                });
                setTimeout(() => this.fitToScreen(), 100);
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