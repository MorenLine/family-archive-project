const FamilyTree = {
    template: `
        <div class="family-tree-container">
            <!-- Упрощенная шапка -->
            <div class="card mb-3">
                <div class="card-body">
                    <h1 class="h4 mb-3">
                        <i class="bi bi-diagram-3"></i> Генеалогическое древо
                    </h1>
                    
                    <!-- Простой выбор персоны -->
                    <div class="mb-3">
                        <label class="form-label">Выберите корневую персону:</label>
                        <select v-model="selectedPersonId" @change="onPersonSelected" class="form-select">
                            <option value="">-- Выберите персону --</option>
                            <option v-for="person in allPersons" :key="person.id" :value="person.id">
                                {{ person.firstName }} {{ person.lastName }}
                                <span v-if="person.birthDate">({{ formatYear(person.birthDate) }})</span>
                            </option>
                        </select>
                    </div>
                    
                    <div class="btn-group mb-3">
                        <button class="btn btn-sm" :class="treeType === 'ancestors' ? 'btn-primary' : 'btn-outline-primary'"
                                @click="setTreeType('ancestors')">
                            Предки
                        </button>
                        <button class="btn btn-sm" :class="treeType === 'descendants' ? 'btn-primary' : 'btn-outline-primary'"
                                @click="setTreeType('descendants')">
                            Потомки
                        </button>
                        <button class="btn btn-sm" :class="treeType === 'both' ? 'btn-primary' : 'btn-outline-primary'"
                                @click="setTreeType('both')">
                            Полное
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Сообщения -->
            <div v-if="!selectedPersonId" class="alert alert-info">
                <i class="bi bi-info-circle"></i> Выберите персону для отображения древа
            </div>
            
            <div v-else-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
                <p>Построение дерева...</p>
            </div>
            
            <div v-else-if="error" class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> {{ error }}
            </div>
            
            <!-- Контейнер для дерева - ВСЕГДА присутствует в DOM -->
            <div v-show="treeVisible" ref="treeWrapper">
                <div class="card">
                    <div class="card-body p-0">
                        <div ref="treeContainer" style="width: 100%; height: 600px;"></div>
                    </div>
                </div>
                
                <!-- Простая статистика -->
                <div class="mt-3">
                    <p>Узлов: {{ treeData.nodes.length }}, Связей: {{ treeData.edges.length }}</p>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            allPersons: [],
            selectedPersonId: null,
            loading: false,
            error: null,
            treeType: 'both',
            treeData: {
                nodes: [],
                edges: []
            },
            network: null,
            treeVisible: false // Флаг видимости дерева
        };
    },

    async created() {
        console.log('🔵 FamilyTree компонент создан');
        await this.loadAllPersons();
    },

    mounted() {
        console.log('✅ FamilyTree компонент смонтирован');

        // Если в URL есть ID, выбираем его
        const personId = this.$route.params.personId;
        if (personId) {
            this.selectedPersonId = parseInt(personId);
            // Используем setTimeout чтобы дать Vue отрендерить DOM
            setTimeout(() => {
                this.buildTree();
            }, 100);
        }
    },

    methods: {
        async loadAllPersons() {
            try {
                const response = await axios.get('http://localhost:8080/api/persons');
                this.allPersons = response.data;
                console.log('✅ Загружено персон:', this.allPersons.length);
            } catch (error) {
                console.error('❌ Ошибка загрузки персон:', error);
                this.error = 'Не удалось загрузить список персон';
            }
        },

        onPersonSelected() {
            console.log('Выбрана персона ID:', this.selectedPersonId);
            if (this.selectedPersonId) {
                this.buildTree();
            }
        },

        setTreeType(type) {
            this.treeType = type;
            if (this.selectedPersonId) {
                this.buildTree();
            }
        },

        async buildTree() {
            if (!this.selectedPersonId) {
                console.log('❌ Нет выбранной персоны');
                return;
            }

            console.log('🔄 Начинаем построение дерева...');
            this.loading = true;
            this.error = null;
            this.treeVisible = false; // Скрываем старое дерево

            try {
                // Получаем данные дерева
                const treePersons = await this.fetchTreeData();
                console.log('✅ Получено персон:', treePersons.length);

                // Создаем визуализацию
                this.treeData = this.createVisData(treePersons);
                console.log('✅ Создано узлов:', this.treeData.nodes.length);

                // Показываем контейнер и рендерим дерево
                this.treeVisible = true;

                // Ждем обновления DOM
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.renderTree();
                    }, 50);
                });

            } catch (error) {
                console.error('❌ Ошибка построения дерева:', error);
                this.error = 'Ошибка построения дерева: ' + error.message;
                this.loading = false;
            }
        },

        async fetchTreeData() {
            console.log('🔄 Получение данных дерева...');

            try {
                // Получаем все персоны
                const response = await axios.get('http://localhost:8080/api/persons');
                const allPersons = response.data;

                // Находим корневую персону
                const rootPerson = allPersons.find(p => p.id === this.selectedPersonId);
                if (!rootPerson) {
                    throw new Error('Персона не найдена');
                }

                // Собираем дерево
                const treePersons = [rootPerson];
                const personMap = new Map();
                allPersons.forEach(p => personMap.set(p.id, p));

                // Функция для добавления родителей (рекурсивно)
                const addParents = (person, depth, maxDepth) => {
                    if (depth >= maxDepth) return;

                    if (person.parent1 && person.parent1.id) {
                        const parent = personMap.get(person.parent1.id);
                        if (parent && !treePersons.find(p => p.id === parent.id)) {
                            treePersons.push(parent);
                            addParents(parent, depth + 1, maxDepth);
                        }
                    }

                    if (person.parent2 && person.parent2.id) {
                        const parent = personMap.get(person.parent2.id);
                        if (parent && !treePersons.find(p => p.id === parent.id)) {
                            treePersons.push(parent);
                            addParents(parent, depth + 1, maxDepth);
                        }
                    }
                };

                // Функция для добавления детей (рекурсивно)
                const addChildren = (person, depth, maxDepth) => {
                    if (depth >= maxDepth) return;

                    // Находим детей - всех, у кого текущая персона является родителем
                    const children = allPersons.filter(p => {
                        return (p.parent1 && p.parent1.id === person.id) ||
                            (p.parent2 && p.parent2.id === person.id);
                    });

                    children.forEach(child => {
                        if (!treePersons.find(p => p.id === child.id)) {
                            treePersons.push(child);
                            addChildren(child, depth + 1, maxDepth);
                        }
                    });
                };

                // В зависимости от типа дерева собираем данные
                const maxDepth = 3; // Максимальная глубина

                if (this.treeType === 'ancestors' || this.treeType === 'both') {
                    addParents(rootPerson, 0, maxDepth);
                }

                if (this.treeType === 'descendants' || this.treeType === 'both') {
                    addChildren(rootPerson, 0, maxDepth);
                }

                return treePersons;

            } catch (error) {
                console.error('Ошибка получения данных:', error);
                throw error;
            }
        },

        createVisData(persons) {
            const nodes = [];
            const edges = new Set(); // Используем Set для избежания дубликатов

            persons.forEach(person => {
                // Определяем цвет в зависимости от пола
                let backgroundColor;
                let borderColor;

                if (person.gender === 'MALE') {
                    backgroundColor = '#d4edda'; // светло-зеленый
                    borderColor = '#28a745'; // зеленый
                } else if (person.gender === 'FEMALE') {
                    backgroundColor = '#f8d7da'; // светло-розовый
                    borderColor = '#dc3545'; // красный
                } else {
                    backgroundColor = '#e2e3e5'; // серый
                    borderColor = '#6c757d'; // серый
                }

                // Определяем, является ли это корневой персоной
                const isRoot = person.id === this.selectedPersonId;
                if (isRoot) {
                    borderColor = '#ffc107'; // желтый для корневой
                }

                // Создаем узел
                const node = {
                    id: person.id,
                    label: `${person.firstName}\n${person.lastName}`,
                    color: {
                        background: backgroundColor,
                        border: borderColor,
                        highlight: {
                            background: backgroundColor,
                            border: borderColor
                        }
                    },
                    shape: 'box',
                    font: {
                        size: 14,
                        face: 'Arial',
                        multi: true
                    },
                    borderWidth: isRoot ? 3 : 2,
                    size: 30,
                    margin: 8
                };

                nodes.push(node);

                // Добавляем связи с родителями
                if (person.parent1 && person.parent1.id) {
                    const edgeKey = `${person.parent1.id}-${person.id}`;
                    edges.add({
                        id: edgeKey,
                        from: person.parent1.id,
                        to: person.id,
                        arrows: 'to',
                        color: '#007bff',
                        width: 2
                    });
                }

                if (person.parent2 && person.parent2.id) {
                    const edgeKey = `${person.parent2.id}-${person.id}`;
                    edges.add({
                        id: edgeKey,
                        from: person.parent2.id,
                        to: person.id,
                        arrows: 'to',
                        color: '#fd7e14',
                        width: 2
                    });
                }
            });

            return {
                nodes: nodes,
                edges: Array.from(edges)
            };
        },

        renderTree() {
            console.log('🔄 Рендеринг дерева...');

            // Проверяем доступность refs
            if (!this.$refs.treeContainer) {
                console.error('❌ Контейнер не найден в $refs!');
                console.log('Доступные refs:', Object.keys(this.$refs));
                console.log('treeVisible:', this.treeVisible);

                // Пробуем найти контейнер в DOM
                const container = document.querySelector('.family-tree-container [ref="treeContainer"]') ||
                    document.querySelector('[ref="treeContainer"]');
                console.log('Найден через querySelector:', container);

                if (!container) {
                    this.error = 'Контейнер для дерева не найден. Попробуйте обновить страницу.';
                    this.loading = false;
                    return;
                }

                // Сохраняем найденный контейнер в refs
                this.$refs.treeContainer = container;
            }

            console.log('✅ Контейнер найден');

            // Уничтожаем предыдущую сеть, если есть
            if (this.network) {
                console.log('Уничтожаем предыдущую сеть...');
                this.network.destroy();
                this.network = null;
            }

            try {
                // Проверяем наличие данных
                if (this.treeData.nodes.length === 0) {
                    console.error('Нет данных для отображения');
                    this.error = 'Нет данных для отображения дерева';
                    this.loading = false;
                    return;
                }

                console.log('✅ Данные для рендеринга:', {
                    nodes: this.treeData.nodes.length,
                    edges: this.treeData.edges.length
                });

                // Создаем DataSets для vis.js
                const nodes = new vis.DataSet(this.treeData.nodes);
                const edges = new vis.DataSet(this.treeData.edges);

                // Настройки для визуализации
                const options = {
                    layout: {
                        hierarchical: {
                            enabled: true,
                            direction: 'UD', // сверху вниз
                            sortMethod: 'directed',
                            nodeSpacing: 150,
                            levelSeparation: 200
                        }
                    },
                    interaction: {
                        hover: true,
                        dragNodes: true,
                        zoomView: true,
                        dragView: true
                    },
                    physics: {
                        enabled: false
                    },
                    nodes: {
                        shape: 'box',
                        font: {
                            size: 14,
                            face: 'Arial',
                            multi: true
                        },
                        margin: 10,
                        widthConstraint: {
                            maximum: 150
                        }
                    },
                    edges: {
                        smooth: {
                            type: 'cubicBezier',
                            roundness: 0.2
                        },
                        arrows: {
                            to: {
                                enabled: true,
                                scaleFactor: 0.8
                            }
                        }
                    }
                };

                // Создаем визуализацию
                console.log('Создаем сеть Vis.js...');
                const container = this.$refs.treeContainer;
                const data = { nodes, edges };

                this.network = new vis.Network(container, data, options);
                console.log('✅ Сеть Vis.js создана!');

                // Добавляем обработчики событий
                this.network.on('click', (params) => {
                    if (params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        console.log('Клик по узлу:', nodeId);
                        this.$router.push(`/persons/${nodeId}`);
                    }
                });

                // Масштабируем чтобы все узлы были видны
                setTimeout(() => {
                    if (this.network) {
                        this.network.fit({
                            animation: {
                                duration: 500,
                                easingFunction: 'easeInOutQuad'
                            }
                        });
                        console.log('✅ Дерево отмасштабировано');
                    }
                }, 200);

                console.log('✅ Рендеринг завершен успешно');

            } catch (error) {
                console.error('❌ Ошибка создания сети:', error);
                console.error('Детали ошибки:', error.message);
                if (error.stack) console.error('Stack:', error.stack);
                this.error = 'Ошибка создания визуализации: ' + error.message;
            } finally {
                this.loading = false;
            }
        },

        formatYear(dateString) {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                return date.getFullYear();
            } catch (e) {
                return '';
            }
        }
    },

    beforeDestroy() {
        // Уничтожаем сеть при удалении компонента
        if (this.network) {
            console.log('Уничтожаем сеть перед уничтожением компонента');
            this.network.destroy();
        }
    }
};