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
                <div class="card-body p-0">
                    <div id="familyTreeContainer" style="width: 100%; height: 600px; border: 1px solid #dee2e6; border-radius: 4px;"></div>
                </div>
            </div>

            <!-- Легенда -->
            <div class="card mt-4">
                <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-info-circle"></i> Легенда</h6>
                </div>
                <div class="card-body">
                    <div class="d-flex align-items-center gap-4">
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
                </div>
            </div>

            <!-- Информация о выбранной персоне -->
            <div v-if="selectedPerson" class="card mt-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0"><i class="bi bi-person"></i> Выбранная персона</h6>
                    <router-link v-if="selectedPerson" :to="'/persons/' + selectedPerson.id" class="btn btn-sm btn-primary">
                        <i class="bi bi-eye"></i> Подробнее
                    </router-link>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <table class="table table-sm">
                                <tbody>
                                    <tr>
                                        <th style="width: 120px;">Имя:</th>
                                        <td>{{ selectedPerson.firstName }}</td>
                                    </tr>
                                    <tr>
                                        <th>Фамилия:</th>
                                        <td>{{ selectedPerson.lastName }}</td>
                                    </tr>
                                    <tr v-if="selectedPerson.middleName">
                                        <th>Отчество:</th>
                                        <td>{{ selectedPerson.middleName }}</td>
                                    </tr>
                                    <tr>
                                        <th>Пол:</th>
                                        <td>
                                            <span :class="selectedPerson.gender === 'MALE' ? 'text-primary' : 'text-danger'">
                                                <i :class="getGenderIcon(selectedPerson.gender)"></i>
                                                {{ getGenderDisplay(selectedPerson.gender) }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <table class="table table-sm">
                                <tbody>
                                    <tr v-if="selectedPerson.birthDate">
                                        <th style="width: 120px;">Дата рождения:</th>
                                        <td>{{ formatDate(selectedPerson.birthDate) }}</td>
                                    </tr>
                                    <tr v-if="selectedPerson.deathDate">
                                        <th>Дата смерти:</th>
                                        <td>{{ formatDate(selectedPerson.deathDate) }}</td>
                                    </tr>
                                    <tr>
                                        <th>ID в дереве:</th>
                                        <td><code>{{ selectedPerson.id }}</code></td>
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
            selectedPerson: null,
            treeDepth: 3,
            loading: false,
            error: null,
            network: null,
            treeData: null
        }
    },

    async mounted() {
        await this.loadAllPersons();

        // Если в URL есть ID персоны, выбираем ее
        if (this.$route.params.id) {
            this.selectedPersonId = parseInt(this.$route.params.id);
            await this.loadTree();
        }

        // Инициализируем сеть при загрузке компонента
        this.initNetwork();
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

            try {
                // Загружаем данные дерева с бэкенда
                const response = await axios.get(
                    `http://localhost:8080/api/persons/${this.selectedPersonId}/tree-data`,
                    { params: { depth: this.treeDepth } }
                );

                this.treeData = response.data;

                // Находим выбранную персону для отображения в инфо-панели
                this.selectedPerson = this.allPersons.find(p => p.id === this.selectedPersonId);

                // Обновляем визуализацию
                if (this.network) {
                    this.updateNetwork();
                }

            } catch (error) {
                console.error('Ошибка загрузки дерева:', error);
                this.error = 'Не удалось загрузить дерево: ' + (error.response?.data || error.message);
            } finally {
                this.loading = false;
            }
        },

        initNetwork() {
            // Создаем контейнер для сети
            const container = document.getElementById('familyTreeContainer');

            if (!container) {
                console.error('Контейнер для дерева не найден');
                return;
            }

            // Инициализируем пустые данные
            const data = {
                nodes: new vis.DataSet([]),
                edges: new vis.DataSet([])
            };

            // Настройки для иерархического дерева
            const options = {
                layout: {
                    hierarchical: {
                        direction: 'UD', // Up-Down (сверху вниз)
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
                    }
                },
                nodes: {
                    shape: 'box',
                    margin: 10,
                    widthConstraint: {
                        minimum: 100,
                        maximum: 200
                    },
                    font: {
                        size: 14,
                        face: 'Arial'
                    },
                    borderWidth: 2,
                    shadow: true
                },
                edges: {
                    arrows: {
                        to: {
                            enabled: true,
                            scaleFactor: 0.8
                        }
                    },
                    smooth: {
                        type: 'cubicBezier',
                        forceDirection: 'vertical',
                        roundness: 0.4
                    },
                    color: {
                        color: '#6c757d',
                        highlight: '#0d6efd'
                    },
                    width: 2
                },
                interaction: {
                    hover: true,
                    dragNodes: true,
                    zoomView: true,
                    dragView: true
                }
            };

            // Создаем сеть
            this.network = new vis.Network(container, data, options);

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
                    // Переходим на страницу персоны
                    this.$router.push(`/persons/${nodeId}`);
                }
            });

            // Обработчик наведения на узел
            this.network.on('hoverNode', (params) => {
                // Можно добавить дополнительную информацию при наведении
            });
        },

        updateNetwork() {
            if (!this.network || !this.treeData) return;

            // Преобразуем данные для vis-network
            const nodes = this.treeData.nodes.map(node => {
                // Преобразуем цвет из строки в объект, если нужно
                if (typeof node.color === 'string') {
                    return node;
                }

                // Обеспечиваем правильный формат цвета
                const colorObj = node.color || {};
                if (typeof colorObj === 'object' && colorObj.background) {
                    return node;
                }

                // Создаем цвет по умолчанию на основе пола
                const gender = node.data?.gender;
                let color;

                if (gender === 'MALE') {
                    color = {
                        background: '#d4edda',
                        border: '#28a745',
                        highlight: {
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
                        }
                    };
                } else {
                    color = {
                        background: '#e2e3e5',
                        border: '#6c757d',
                        highlight: {
                            background: '#d6d8db',
                            border: '#545b62'
                        }
                    };
                }

                return {
                    ...node,
                    color: color
                };
            });

            // Обновляем данные в сети
            this.network.setData({
                nodes: new vis.DataSet(nodes),
                edges: new vis.DataSet(this.treeData.edges)
            });

            // Подгоняем дерево под экран
            setTimeout(() => {
                this.fitToScreen();
            }, 100);
        },

        handleNodeClick(nodeId) {
            // Находим персону по ID
            this.selectedPerson = this.allPersons.find(p => p.id === nodeId);

            // Если не нашли в списке всех персон, ищем в данных дерева
            if (!this.selectedPerson && this.treeData) {
                const node = this.treeData.nodes.find(n => n.id === nodeId);
                if (node && node.data) {
                    this.selectedPerson = node.data;
                }
            }

            // Подсвечиваем выбранный узел
            this.network.selectNodes([nodeId]);
            this.network.focus(nodeId, {
                scale: 1.2,
                animation: {
                    duration: 500,
                    easingFunction: 'easeInOutQuad'
                }
            });
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
                            direction: 'UD'
                        }
                    }
                });

                this.fitToScreen();
            }
        },

        exportTree() {
            if (!this.network) return;

            try {
                // Получаем данные canvas
                const canvas = document.querySelector('#familyTreeContainer canvas');
                if (canvas) {
                    const link = document.createElement('a');
                    link.download = `family-tree-${this.selectedPersonId || 'tree'}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            } catch (error) {
                console.error('Ошибка при экспорте дерева:', error);
                alert('Не удалось экспортировать дерево');
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
        // Очищаем сеть при уничтожении компонента
        if (this.network) {
            this.network.destroy();
            this.network = null;
        }
    }
};