const FamilyTree = {
    template: `
        <div class="family-tree-container">
            <!-- Шапка с настройками -->
            <div class="card mb-3">
                <div class="card-body py-2">
                    <div class="d-flex justify-content-between align-items-center">
                        <h1 class="h4 mb-0">
                            <i class="bi bi-diagram-3"></i> Генеалогическое древо
                        </h1>
                        
                        <div class="btn-group" role="group">
                            <!-- Выбор корневой персоны -->
                            <div class="dropdown me-2">
                                <button class="btn btn-outline-secondary dropdown-toggle" type="button" 
                                        id="rootPersonDropdown" data-bs-toggle="dropdown">
                                    <i class="bi bi-person"></i> 
                                    {{ selectedRootPerson ? selectedRootPerson.firstName + ' ' + selectedRootPerson.lastName : 'Выбрать корень' }}
                                </button>
                                <ul class="dropdown-menu" style="max-height: 300px; overflow-y: auto;">
                                    <li v-for="person in allPersons" :key="person.id">
                                        <a class="dropdown-item" href="#" @click="setRootPerson(person)">
                                            {{ person.firstName }} {{ person.lastName }}
                                            <span v-if="person.birthDate" class="text-muted">
                                                ({{ formatYear(person.birthDate) }})
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            
                            <!-- Уровни отображения -->
                            <div class="btn-group me-2">
                                <button class="btn btn-outline-secondary" 
                                        :class="{ 'active': treeDepth === 2 }"
                                        @click="treeDepth = 2">
                                    2 поколения
                                </button>
                                <button class="btn btn-outline-secondary" 
                                        :class="{ 'active': treeDepth === 3 }"
                                        @click="treeDepth = 3">
                                    3 поколения
                                </button>
                                <button class="btn btn-outline-secondary" 
                                        :class="{ 'active': treeDepth === 4 }"
                                        @click="treeDepth = 4">
                                    4 поколения
                                </button>
                            </div>
                            
                            <!-- Тип дерева -->
                            <div class="btn-group">
                                <button class="btn btn-outline-primary" 
                                        :class="{ 'active': treeType === 'ancestors' }"
                                        @click="setTreeType('ancestors')">
                                    <i class="bi bi-arrow-up"></i> Предки
                                </button>
                                <button class="btn btn-outline-primary" 
                                        :class="{ 'active': treeType === 'descendants' }"
                                        @click="setTreeType('descendants')">
                                    <i class="bi bi-arrow-down"></i> Потомки
                                </button>
                                <button class="btn btn-outline-primary" 
                                        :class="{ 'active': treeType === 'both' }"
                                        @click="setTreeType('both')">
                                    <i class="bi bi-arrows-expand"></i> Полное
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Контейнер для дерева -->
            <div class="tree-wrapper card">
                <div class="card-body p-0">
                    <!-- Сообщение, если нет корневой персоны -->
                    <div v-if="!selectedRootPerson" class="text-center py-5">
                        <i class="bi bi-diagram-3 display-1 text-muted"></i>
                        <p class="mt-3">Выберите корневую персону для отображения древа</p>
                        <button class="btn btn-primary" @click="openPersonSelector">
                            <i class="bi bi-search"></i> Выбрать персону
                        </button>
                    </div>

                    <!-- Загрузка -->
                    <div v-else-if="loading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Загрузка...</span>
                        </div>
                        <p class="mt-2">Построение дерева...</p>
                    </div>

                    <!-- Ошибка -->
                    <div v-else-if="error" class="alert alert-danger m-3">
                        <i class="bi bi-exclamation-triangle"></i> {{ error }}
                    </div>

                    <!-- Контейнер для Vis.js -->
                    <div v-else>
                        <div id="family-tree-network" style="width: 100%; height: 600px;"></div>
                        
                        <!-- Легенда -->
                        <div class="tree-legend p-3 border-top">
                            <div class="d-flex flex-wrap gap-3">
                                <div class="legend-item">
                                    <div class="legend-color male"></div>
                                    <span>Мужчина</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color female"></div>
                                    <span>Женщина</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color unknown"></div>
                                    <span>Пол не указан</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color root"></div>
                                    <span>Корневая персона</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Статистика -->
            <div v-if="selectedRootPerson && !loading && !error" class="row mt-3">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">
                                <i class="bi bi-info-circle"></i> Статистика дерева
                            </h6>
                            <ul class="list-unstyled mb-0">
                                <li><strong>Всего персон:</strong> {{ treeStats.totalPersons }}</li>
                                <li><strong>Мужчин:</strong> {{ treeStats.males }}</li>
                                <li><strong>Женщин:</strong> {{ treeStats.females }}</li>
                                <li><strong>Самый старший:</strong> {{ formatYear(treeStats.oldestBirthDate) }}</li>
                                <li><strong>Самый младший:</strong> {{ formatYear(treeStats.youngestBirthDate) }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">
                                <i class="bi bi-arrow-90deg-right"></i> Быстрые действия
                            </h6>
                            <div class="d-flex gap-2 flex-wrap">
                                <button class="btn btn-outline-primary" @click="exportTreeAsImage">
                                    <i class="bi bi-download"></i> Экспорт как изображение
                                </button>
                                <button class="btn btn-outline-secondary" @click="printTree">
                                    <i class="bi bi-printer"></i> Печать
                                </button>
                                <router-link :to="'/persons/' + selectedRootPerson.id" 
                                             class="btn btn-outline-info">
                                    <i class="bi bi-person"></i> Профиль корневой персоны
                                </router-link>
                                <button class="btn btn-outline-success" @click="addMissingPerson">
                                    <i class="bi bi-person-plus"></i> Добавить отсутствующую персону
                                </button>
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
            selectedRootPerson: null,
            loading: false,
            error: null,
            treeDepth: 3,
            treeType: 'both', // 'ancestors', 'descendants', 'both'
            network: null,
            treeData: {
                nodes: [],
                edges: []
            },
            treeStats: {
                totalPersons: 0,
                males: 0,
                females: 0,
                oldestBirthDate: null,
                youngestBirthDate: null
            }
        };
    },

    async mounted() {
        await this.loadAllPersons();
        // Если в URL есть ID персоны, загружаем ее как корневую
        const personId = this.$route.params.personId;
        if (personId) {
            await this.setRootPersonById(personId);
        }

        // Инициализация Vis.js после загрузки DOM
        this.$nextTick(() => {
            this.initVisNetwork();
        });
    },

    watch: {
        selectedRootPerson() {
            this.buildTree();
        },
        treeDepth() {
            this.buildTree();
        },
        treeType() {
            this.buildTree();
        },
        '$route.params.personId'(newId) {
            if (newId) {
                this.setRootPersonById(newId);
            }
        }
    },

    methods: {
        async loadAllPersons() {
            try {
                const response = await axios.get('http://localhost:8080/api/persons');
                this.allPersons = response.data;
            } catch (error) {
                console.error('Ошибка загрузки персон:', error);
            }
        },

        async setRootPerson(person) {
            this.selectedRootPerson = person;
            // Обновляем URL без перезагрузки страницы
            this.$router.push({ path: `/tree/${person.id}` });
        },

        async setRootPersonById(personId) {
            try {
                const response = await axios.get(`http://localhost:8080/api/persons/${personId}`);
                this.selectedRootPerson = response.data;
            } catch (error) {
                console.error('Ошибка загрузки персоны:', error);
                this.error = 'Не удалось загрузить персону';
            }
        },

        setTreeType(type) {
            this.treeType = type;
        },

        async buildTree() {
            if (!this.selectedRootPerson) return;

            this.loading = true;
            this.error = null;

            try {
                // Получаем данные для дерева
                const treePersons = await this.fetchTreeData();

                // Формируем узлы и связи для Vis.js
                this.treeData = this.createVisData(treePersons);

                // Обновляем статистику
                this.updateTreeStats(treePersons);

                // Обновляем визуализацию
                if (this.network) {
                    this.network.setData(this.treeData);
                    this.fitNetworkToScreen();
                }

            } catch (error) {
                console.error('Ошибка построения дерева:', error);
                this.error = 'Ошибка при построении дерева';
            } finally {
                this.loading = false;
            }
        },

        async fetchTreeData() {
            const persons = new Map();
            const processedIds = new Set();

            // Рекурсивная функция для получения предков
            const fetchAncestors = async (personId, currentDepth) => {
                if (currentDepth >= this.treeDepth || processedIds.has(personId)) return;

                processedIds.add(personId);

                try {
                    const response = await axios.get(`http://localhost:8080/api/persons/${personId}`);
                    const person = response.data;
                    persons.set(personId, person);

                    // Если нужны предки, получаем родителей
                    if (this.treeType !== 'descendants' && currentDepth < this.treeDepth - 1) {
                        if (person.parent1) {
                            await fetchAncestors(person.parent1.id, currentDepth + 1);
                        }
                        if (person.parent2) {
                            await fetchAncestors(person.parent2.id, currentDepth + 1);
                        }
                    }

                    // Если нужны потомки, получаем детей
                    if (this.treeType !== 'ancestors' && currentDepth < this.treeDepth - 1) {
                        const childrenResponse = await axios.get(`http://localhost:8080/api/persons/${personId}/children`);
                        const children = childrenResponse.data;

                        for (const child of children) {
                            await fetchAncestors(child.id, currentDepth + 1);
                        }
                    }

                } catch (error) {
                    console.error(`Ошибка загрузки персоны ${personId}:`, error);
                }
            };

            await fetchAncestors(this.selectedRootPerson.id, 0);

            return Array.from(persons.values());
        },

        createVisData(persons) {
            const nodes = [];
            const edges = [];

            // Создаем узлы для каждой персоны
            persons.forEach(person => {
                const node = {
                    id: person.id,
                    label: `${person.firstName}\n${person.lastName}`,
                    title: this.createNodeTooltip(person),
                    color: this.getNodeColor(person),
                    shape: 'box',
                    margin: 10,
                    font: {
                        size: 14,
                        face: 'Arial'
                    },
                    borderWidth: person.id === this.selectedRootPerson.id ? 3 : 1,
                    borderColor: person.id === this.selectedRootPerson.id ? '#ff6b6b' : '#2c3e50',
                    // Добавляем URL фото, если есть главное фото
                    image: person.mainPhotoUrl || null,
                    shapeProperties: {
                        useImageSize: false,
                        useBorderWithImage: true
                    }
                };

                nodes.push(node);

                // Создаем связи с родителями
                if (person.parent1) {
                    edges.push({
                        from: person.parent1.id,
                        to: person.id,
                        arrows: 'to',
                        color: { color: '#3498db', width: 2 },
                        dashes: false
                    });
                }

                if (person.parent2) {
                    edges.push({
                        from: person.parent2.id,
                        to: person.id,
                        arrows: 'to',
                        color: { color: '#e74c3c', width: 2 },
                        dashes: false
                    });
                }
            });

            return { nodes, edges };
        },

        createNodeTooltip(person) {
            let tooltip = `<strong>${person.firstName} ${person.lastName}</strong>`;

            if (person.middleName) {
                tooltip += ` ${person.middleName}`;
            }

            if (person.birthDate) {
                tooltip += `<br>Родился: ${this.formatDate(person.birthDate)}`;
            }

            if (person.deathDate) {
                tooltip += `<br>Умер: ${this.formatDate(person.deathDate)}`;
            }

            if (person.gender) {
                tooltip += `<br>Пол: ${person.gender === 'MALE' ? 'Мужской' : 'Женский'}`;
            }

            return tooltip;
        },

        getNodeColor(person) {
            if (person.id === this.selectedRootPerson.id) {
                return {
                    background: '#fff9c4',
                    border: '#ff6b6b',
                    highlight: {
                        background: '#fff59d',
                        border: '#ff5252'
                    }
                };
            }

            switch (person.gender) {
                case 'MALE':
                    return {
                        background: '#e3f2fd',
                        border: '#2196f3',
                        highlight: {
                            background: '#bbdefb',
                            border: '#1976d2'
                        }
                    };
                case 'FEMALE':
                    return {
                        background: '#fce4ec',
                        border: '#e91e63',
                        highlight: {
                            background: '#f8bbd9',
                            border: '#c2185b'
                        }
                    };
                default:
                    return {
                        background: '#f5f5f5',
                        border: '#9e9e9e',
                        highlight: {
                            background: '#eeeeee',
                            border: '#757575'
                        }
                    };
            }
        },

        initVisNetwork() {
            const container = document.getElementById('family-tree-network');

            if (!container) return;

            const options = {
                layout: {
                    hierarchical: {
                        enabled: true,
                        direction: 'UD', // Up-Down направление
                        sortMethod: 'directed',
                        nodeSpacing: 150,
                        levelSeparation: 200,
                        treeSpacing: 200
                    }
                },
                interaction: {
                    hover: true,
                    dragNodes: true,
                    zoomView: true,
                    dragView: true
                },
                physics: {
                    enabled: false, // Отключаем физику для иерархического вида
                    hierarchicalRepulsion: {
                        nodeDistance: 120
                    }
                },
                nodes: {
                    shape: 'box',
                    size: 40,
                    font: {
                        size: 14,
                        face: 'Arial'
                    }
                },
                edges: {
                    smooth: {
                        type: 'cubicBezier',
                        forceDirection: 'horizontal'
                    },
                    arrows: {
                        to: {
                            enabled: true,
                            scaleFactor: 0.5
                        }
                    }
                }
            };

            this.network = new vis.Network(container, this.treeData, options);

            // Обработчики событий
            this.network.on('click', (params) => {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    this.onNodeClick(nodeId);
                }
            });

            this.network.on('doubleClick', (params) => {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    this.onNodeDoubleClick(nodeId);
                }
            });
        },

        onNodeClick(nodeId) {
            // Показываем информацию о персоне в тултипе или мини-панели
            const person = this.treeData.nodes.find(n => n.id === nodeId);
            if (person) {
                console.log('Клик по персоне:', person.label);
                // Можно добавить всплывающее окно с детальной информацией
            }
        },

        onNodeDoubleClick(nodeId) {
            // Переход к профилю персоны
            this.$router.push(`/persons/${nodeId}`);
        },

        fitNetworkToScreen() {
            if (this.network) {
                this.network.fit({
                    animation: {
                        duration: 1000,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            }
        },

        updateTreeStats(persons) {
            let males = 0;
            let females = 0;
            let oldestBirthDate = null;
            let youngestBirthDate = null;

            persons.forEach(person => {
                if (person.gender === 'MALE') males++;
                if (person.gender === 'FEMALE') females++;

                if (person.birthDate) {
                    const birthDate = new Date(person.birthDate);

                    if (!oldestBirthDate || birthDate < oldestBirthDate) {
                        oldestBirthDate = birthDate;
                    }

                    if (!youngestBirthDate || birthDate > youngestBirthDate) {
                        youngestBirthDate = birthDate;
                    }
                }
            });

            this.treeStats = {
                totalPersons: persons.length,
                males,
                females,
                oldestBirthDate,
                youngestBirthDate
            };
        },

        exportTreeAsImage() {
            if (this.network) {
                const dataURL = this.network.canvas.frame.canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `family-tree-${this.selectedRootPerson.lastName}-${new Date().toISOString().slice(0, 10)}.png`;
                link.href = dataURL;
                link.click();
            }
        },

        printTree() {
            window.print();
        },

        addMissingPerson() {
            this.$router.push('/persons/new');
        },

        openPersonSelector() {
            // Можно реализовать модальное окно для выбора персоны
            alert('Выберите персону из выпадающего списка вверху');
        },

        formatDate(dateString) {
            if (!dateString) return 'Не указана';
            return new Date(dateString).toLocaleDateString('ru-RU');
        },

        formatYear(dateString) {
            if (!dateString) return '';
            return new Date(dateString).getFullYear();
        }
    },

    beforeDestroy() {
        if (this.network) {
            this.network.destroy();
        }
    }
};