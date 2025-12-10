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
                    <div ref="treeContainer" style="width: 100%; height: 600px; border: 1px solid #dee2e6; border-radius: 4px;"></div>
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
            <div v-if="selectedPersonInfo" class="card mt-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0"><i class="bi bi-person"></i> Выбранная персона</h6>
                    <div>
                        <button v-if="selectedPersonInfo.id !== selectedPersonId" 
                                class="btn btn-sm btn-outline-primary me-2" 
                                @click="setAsRoot(selectedPersonInfo.id)">
                            Сделать корнем
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
            network: null
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
                return;
            }

            this.loading = true;
            this.error = null;
            this.selectedPersonInfo = null;

            try {
                // Загружаем данные дерева с бэкенда
                const response = await axios.get(
                    `http://localhost:8080/api/persons/${this.selectedPersonId}/tree-data`,
                    { params: { depth: this.treeDepth } }
                );

                const treeData = response.data;

                // Находим выбранную персону для отображения в инфо-панели
                const rootPerson = this.allPersons.find(p => p.id === this.selectedPersonId);
                if (rootPerson) {
                    this.selectedPersonInfo = {
                        id: rootPerson.id,
                        firstName: rootPerson.firstName,
                        lastName: rootPerson.lastName,
                        middleName: rootPerson.middleName,
                        birthDate: rootPerson.birthDate,
                        deathDate: rootPerson.deathDate,
                        gender: rootPerson.gender
                    };
                }

                // Создаем или обновляем визуализацию
                this.createTreeVisualization(treeData);

            } catch (error) {
                console.error('Ошибка загрузки дерева:', error);
                this.error = 'Не удалось загрузить дерево: ' + (error.message || 'Неизвестная ошибка');
                if (error.response?.status === 404) {
                    this.error += '. Убедитесь, что эндпоинт реализован на сервере.';
                }
            } finally {
                this.loading = false;
            }
        },

        createTreeVisualization(treeData) {
            // Удаляем предыдущую визуализацию, если она есть
            if (this.network) {
                this.network.destroy();
                this.network = null;
            }

            this.$nextTick(() => {
                const container = this.$refs.treeContainer;
                if (!container) {
                    console.error('Контейнер для дерева не найден');
                    return;
                }

                // Очищаем контейнер
                container.innerHTML = '';

                // Создаем узлы
                const nodes = new vis.DataSet(
                    treeData.nodes.map(node => {
                        // Определяем цвет на основе пола
                        let color;
                        const gender = node.data?.gender;

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
                            id: node.id,
                            label: node.label,
                            title: node.title,
                            shape: 'box',
                            margin: 10,
                            color: color,
                            widthConstraint: {
                                minimum: 120,
                                maximum: 180
                            },
                            font: {
                                size: 14,
                                face: 'Arial'
                            },
                            data: node.data
                        };
                    })
                );

                // Создаем ребра
                const edges = new vis.DataSet(
                    treeData.edges.map(edge => ({
                        from: edge.from,
                        to: edge.to,
                        arrows: 'to',
                        smooth: {
                            type: 'cubicBezier',
                            roundness: 0.4
                        },
                        color: {
                            color: '#6c757d',
                            highlight: '#0d6efd'
                        }
                    }))
                );

                // Настройки для иерархического дерева
                const options = {
                    layout: {
                        hierarchical: {
                            enabled: true,
                            direction: 'UD', // Up-Down (сверху вниз)
                            sortMethod: 'directed',
                            levelSeparation: 150,
                            nodeSpacing: 100,
                            treeSpacing: 200
                        }
                    },
                    physics: {
                        enabled: false, // Отключаем физику для стабильности
                        hierarchicalRepulsion: {
                            nodeDistance: 120
                        }
                    },
                    interaction: {
                        hover: true,
                        dragNodes: false, // Отключаем перетаскивание для избежания ошибок
                        zoomView: true,
                        dragView: true,
                        selectable: true
                    },
                    nodes: {
                        shape: 'box',
                        margin: 10,
                        widthConstraint: {
                            minimum: 120,
                            maximum: 180
                        }
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
                        }
                    }
                };

                // Создаем сеть
                const data = { nodes, edges };
                this.network = new vis.Network(container, data, options);

                // Упрощенный обработчик клика - без selectNodes
                this.network.on('click', (params) => {
                    if (params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        this.handleNodeClick(nodeId, treeData);
                    }
                });

                // Подгоняем дерево под экран
                setTimeout(() => {
                    this.network.fit({
                        animation: {
                            duration: 1000,
                            easingFunction: 'easeInOutQuad'
                        }
                    });
                }, 100);
            });
        },

        handleNodeClick(nodeId, treeData) {
            // Находим информацию о персоне в данных дерева
            if (treeData && treeData.nodes) {
                const node = treeData.nodes.find(n => n.id === nodeId);
                if (node && node.data) {
                    this.selectedPersonInfo = {
                        id: node.id,
                        firstName: node.data.firstName,
                        lastName: node.data.lastName,
                        middleName: node.data.middleName,
                        birthDate: node.data.birthDate,
                        deathDate: node.data.deathDate,
                        gender: node.data.gender
                    };
                }
            }

            // Визуально выделяем узел (меняем цвет границы)
            if (this.network) {
                try {
                    // Простой способ выделения - без использования selectNodes
                    const node = this.network.body.data.nodes.get(nodeId);
                    if (node) {
                        // Временно меняем цвет границы
                        const originalColor = node.color.border;
                        node.color.border = '#ffc107'; // Желтый цвет для выделения
                        this.network.body.data.nodes.update(node);

                        // Возвращаем оригинальный цвет через 2 секунды
                        setTimeout(() => {
                            node.color.border = originalColor;
                            this.network.body.data.nodes.update(node);
                        }, 2000);
                    }
                } catch (error) {
                    console.warn('Не удалось выделить узел:', error);
                }
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
                            enabled: true,
                            direction: 'UD'
                        }
                    }
                });

                setTimeout(() => {
                    this.fitToScreen();
                }, 100);
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