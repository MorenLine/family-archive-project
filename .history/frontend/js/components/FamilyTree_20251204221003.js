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
                                <div class="dropdown">
                                    <button class="btn btn-outline-success dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                        <i class="bi bi-download"></i> Экспорт
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#" @click="exportPNG">PNG</a></li>
                                        <li><a class="dropdown-item" href="#" @click="exportJSON">JSON</a></li>
                                    </ul>
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
            network: null,
            treeData: null,
            dataSet: {
                nodes: null,
                edges: null
            }
        }
    },

    async mounted() {
        await this.loadAllPersons();

        // Если в URL есть ID персоны, выбираем ее
        if (this.$route.params.id) {
            this.selectedPersonId = parseInt(this.$route.params.id);
            // Даем время на рендеринг контейнера
            setTimeout(() => {
                this.initNetwork();
                this.loadTree();
            }, 100);
        } else {
            this.initNetwork();
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

                this.treeData = response.data;

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

                // Обновляем визуализацию
                this.updateNetwork();

            } catch (error) {
                console.error('Ошибка загрузки дерева:', error);
                this.error = 'Не удалось загрузить дерево: ' + (error.message || 'Неизвестная ошибка');
                if (error.response?.status === 404) {
                    this.error += '. Возможно, эндпоинт не реализован на сервере.';
                }
            } finally {
                this.loading = false;
            }
        },

        initNetwork() {
            // Ждем пока контейнер будет доступен
            this.$nextTick(() => {
                const container = this.$refs.treeContainer;

                if (!container) {
                    console.error('Контейнер для дерева не найден');
                    return;
                }

                // Инициализируем DataSet'ы
                this.dataSet.nodes = new vis.DataSet([]);
                this.dataSet.edges = new vis.DataSet([]);

                // Настройки для иерархического дерева
                const options = {
                    layout: {
                        hierarchical: {
                            enabled: true,
                            direction: 'UD', // Up-Down (сверху вниз)
                            sortMethod: 'directed',
                            levelSeparation: 150,
                            nodeSpacing: 100,
                            treeSpacing: 200,
                            parentCentralization: true
                        }
                    },
                    physics: {
                        enabled: true,
                        hierarchicalRepulsion: {
                            nodeDistance: 120,
                            springLength: 100
                        },
                        solver: 'hierarchicalRepulsion'
                    },
                    interaction: {
                        hover: true,
                        dragNodes: true,
                        zoomView: true,
                        dragView: true,
                        selectable: true,
                        selectConnectedEdges: false
                    },
                    nodes: {
                        shape: 'box',
                        margin: 10,
                        widthConstraint: {
                            minimum: 120,
                            maximum: 180
                        },
                        font: {
                            size: 14,
                            face: 'Arial'
                        },
                        borderWidth: 2,
                        shadow: {
                            enabled: true,
                            color: 'rgba(0,0,0,0.2)',
                            size: 10,
                            x: 5,
                            y: 5
                        }
                    },
                    edges: {
                        arrows: {
                            to: {
                                enabled: true,
                                type: 'arrow',
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
                        width: 2,
                        hoverWidth: 3
                    }
                };

                // Создаем сеть
                this.network = new vis.Network(container, this.dataSet, options);

                // Обработчик клика по узлу
                this.network.on('click', (params) => {
                    if (params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        this.handleNodeClick(nodeId);
                    } else {
                        this.selectedPersonInfo = null;
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

                // Обработчик завершения рендеринга
                this.network.on('afterDrawing', () => {
                    // Можно добавить дополнительную логику
                });
            });
        },

        updateNetwork() {
            if (!this.network || !this.treeData) return;

            try {
                // Преобразуем узлы для vis-network
                const nodes = this.treeData.nodes.map(node => {
                    // Убедимся, что узел имеет правильный формат
                    const formattedNode = {
                        id: node.id,
                        label: node.label || `${node.data?.firstName || ''} ${node.data?.lastName || ''}`.trim(),
                        title: node.title || '',
                        shape: 'box',
                        margin: 10,
                        widthConstraint: {
                            minimum: 120,
                            maximum: 180
                        }
                    };

                    // Обрабатываем цвет
                    if (node.color && typeof node.color === 'object') {
                        formattedNode.color = node.color;
                    } else {
                        // Создаем цвет на основе пола
                        const gender = node.data?.gender;
                        formattedNode.color = this.getNodeColor(gender);
                    }

                    // Добавляем данные
                    if (node.data) {
                        formattedNode.data = node.data;
                    }

                    return formattedNode;
                });

                // Преобразуем ребра
                const edges = this.treeData.edges.map(edge => ({
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
                }));

                // Очищаем и обновляем данные
                this.dataSet.nodes.clear();
                this.dataSet.edges.clear();

                this.dataSet.nodes.add(nodes);
                this.dataSet.edges.add(edges);

                // Подгоняем дерево под экран через небольшой таймаут
                setTimeout(() => {
                    this.fitToScreen();
                }, 300);

            } catch (error) {
                console.error('Ошибка при обновлении сети:', error);
                this.error = 'Ошибка при отображении дерева: ' + error.message;
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

        handleNodeClick(nodeId) {
            // Находим информацию о персоне в данных дерева
            if (this.treeData && this.treeData.nodes) {
                const node = this.treeData.nodes.find(n => n.id === nodeId);
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
                // Сброс к иерархическому виду
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

        exportPNG() {
            if (!this.network) return;

            try {
                // Получаем canvas
                const canvas = document.querySelector('#familyTreeContainer canvas');
                if (canvas) {
                    const link = document.createElement('a');
                    const date = new Date().toISOString().split('T')[0];
                    link.download = `family-tree-${date}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                } else {
                    alert('Не удалось получить изображение дерева');
                }
            } catch (error) {
                console.error('Ошибка при экспорте PNG:', error);
                alert('Не удалось экспортировать дерево в PNG');
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

                // Очищаем URL
                setTimeout(() => URL.revokeObjectURL(link.href), 100);
            } catch (error) {
                console.error('Ошибка при экспорте JSON:', error);
                alert('Не удалось экспортировать дерево в JSON');
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