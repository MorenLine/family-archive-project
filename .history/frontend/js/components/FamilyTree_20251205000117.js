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
                    <router-link v-if="selectedPersonInfo" :to="'/persons/' + selectedPersonInfo.id" class="btn btn-sm btn-primary">
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
            nodesDataSet: null,
            edgesDataSet: null
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
            this.selectedPersonInfo = null;

            try {
                // Загружаем данные дерева с бэкенда
                const response = await axios.get(
                    `http://localhost:8080/api/persons/${this.selectedPersonId}/tree-data`,
                    { params: { depth: this.treeDepth } }
                );

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

                // Обновляем визуализацию
                this.updateNetwork();

            } catch (error) {
                console.error('Ошибка загрузки дерева:', error);
                this.error = 'Не удалось загрузить дерево: ' + (error.response?.data?.message || error.message);
            } finally {
                this.loading = false;
            }
        },

        initNetwork() {
            // Создаем пустые DataSet для узлов и связей
            this.nodesDataSet = new vis.DataSet([]);
            this.edgesDataSet = new vis.DataSet([]);

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
                    },
                    stabilization: {
                        enabled: true,
                        iterations: 100
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
                    shadow: true,
                    color: {
                        border: '#2B7CE9',
                        background: '#97C2FC',
                        highlight: {
                            border: '#2B7CE9',
                            background: '#D2E5FF'
                        },
                        hover: {
                            border: '#2B7CE9',
                            background: '#D2E5FF'
                        }
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
                    },
                    color: {
                        color: '#6c757d',
                        highlight: '#0d6efd',
                        hover: '#0d6efd'
                    },
                    width: 2
                },
                interaction: {
                    hover: true,
                    hoverConnectedEdges: true,
                    selectConnectedEdges: true,
                    dragNodes: true,
                    zoomView: true,
                    dragView: true,
                    tooltipDelay: 100
                },
                manipulation: {
                    enabled: false
                }
            };

            // Создаем сеть
            const container = this.$refs.treeContainer;
            if (!container) {
                console.error('Контейнер для дерева не найден');
                return;
            }

            const data = {
                nodes: this.nodesDataSet,
                edges: this.edgesDataSet
            };

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

            // Обработчик изменения размера окна
            window.addEventListener('resize', this.handleResize);
        },

        updateNetwork() {
            if (!this.network || !this.treeData) return;

            try {
                // Преобразуем данные для vis-network
                const nodes = this.treeData.nodes.map(node => {
                    // Копируем узел, чтобы не изменять оригинальные данные
                    const processedNode = { ...node };

                    // Обрабатываем цвет - убедимся, что это правильный объект
                    if (processedNode.color) {
                        if (typeof processedNode.color === 'string') {
                            // Если цвет строка, преобразуем в объект
                            processedNode.color = {
                                background: processedNode.color,
                                border: '#2B7CE9'
                            };
                        }
                    } else {
                        // Цвет по умолчанию
                        const gender = node.data?.gender;
                        if (gender === 'MALE') {
                            processedNode.color = {
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
                            processedNode.color = {
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
                            processedNode.color = {
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
                    }

                    // Убедимся, что есть все необходимые поля
                    if (!processedNode.label) {
                        processedNode.label = 'Неизвестно';
                    }

                    // Добавляем всплывающую подсказку, если есть title
                    if (processedNode.title) {
                        processedNode.title = processedNode.title;
                    }

                    return processedNode;
                });

                // Преобразуем связи
                const edges = this.treeData.edges.map(edge => {
                    return {
                        ...edge,
                        id: `${edge.from}-${edge.to}`,
                        arrows: 'to',
                        smooth: {
                            type: 'cubicBezier',
                            forceDirection: 'vertical',
                            roundness: 0.4
                        }
                    };
                });

                // Очищаем существующие данные и добавляем новые
                this.nodesDataSet.clear();
                this.edgesDataSet.clear();

                if (nodes.length > 0) {
                    this.nodesDataSet.add(nodes);
                }

                if (edges.length > 0) {
                    this.edgesDataSet.add(edges);
                }

                // Подгоняем дерево под экран
                setTimeout(() => {
                    this.fitToScreen();
                }, 300);

            } catch (error) {
                console.error('Ошибка при обновлении сети:', error);
                this.error = 'Ошибка при отображении дерева: ' + error.message;
            }
        },

        handleNodeClick(nodeId) {
            // Находим информацию о персоне
            let personInfo = null;

            // Сначала ищем в данных дерева
            if (this.treeData && this.treeData.nodes) {
                const node = this.treeData.nodes.find(n => n.id === nodeId);
                if (node && node.data) {
                    personInfo = {
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
            if (!personInfo) {
                const person = this.allPersons.find(p => p.id === nodeId);
                if (person) {
                    personInfo = {
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

            this.selectedPersonInfo = personInfo;

            // Подсвечиваем выбранный узел
            if (this.network) {
                this.network.selectNodes([nodeId]);
                this.network.focus(nodeId, {
                    scale: 1.2,
                    animation: {
                        duration: 500,
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
                            direction: 'UD'
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
                // Получаем данные canvas
                const canvas = this.$refs.treeContainer.querySelector('canvas');
                if (canvas) {
                    const link = document.createElement('a');
                    link.download = `family-tree-${this.selectedPersonId || 'tree'}-${new Date().toISOString().slice(0, 10)}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                } else {
                    // Альтернативный способ экспорта
                    const dataUrl = this.network.getBase64Image('image/png');
                    if (dataUrl) {
                        const link = document.createElement('a');
                        link.download = `family-tree-${this.selectedPersonId || 'tree'}.png`;
                        link.href = dataUrl;
                        link.click();
                    }
                }
            } catch (error) {
                console.error('Ошибка при экспорте дерева:', error);
                alert('Не удалось экспортировать дерево');
            }
        },

        handleResize() {
            if (this.network) {
                setTimeout(() => {
                    this.network.redraw();
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
        // Очищаем сеть при уничтожении компонента
        if (this.network) {
            this.network.destroy();
            this.network = null;
        }

        // Удаляем обработчик изменения размера окна
        window.removeEventListener('resize', this.handleResize);
    }
};