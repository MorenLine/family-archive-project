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
                    
                    <div class="btn-group">
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
            
            <!-- Контейнер для дерева -->
            <div v-else>
                <div class="card">
                    <div class="card-body p-0">
                        <div id="family-tree" style="width: 100%; height: 600px; border: 1px solid #ddd;"></div>
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
            network: null
        };
    },

    async mounted() {
        console.log('🔵 FamilyTree компонент монтирован');

        // Загружаем все персоны
        await this.loadAllPersons();

        // Проверяем наличие vis.js
        if (typeof vis === 'undefined') {
            console.error('❌ Библиотека vis.js не загружена!');
            this.error = 'Библиотека визуализации не загружена. Проверьте подключение vis.js';
            return;
        }

        console.log('✅ Vis.js загружена');

        // Если в URL есть ID, выбираем его
        const personId = this.$route.params.personId;
        if (personId) {
            this.selectedPersonId = parseInt(personId);
            await this.buildTree();
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

            try {
                // Получаем данные дерева
                const treePersons = await this.fetchTreeData();
                console.log('✅ Получено персон:', treePersons.length);

                // Создаем визуализацию
                this.treeData = this.createVisData(treePersons);
                console.log('✅ Создано узлов:', this.treeData.nodes.length);

                // Рендерим дерево
                this.renderTree();

            } catch (error) {
                console.error('❌ Ошибка построения дерева:', error);
                this.error = 'Ошибка построения дерева: ' + error.message;
            } finally {
                this.loading = false;
            }
        },

        async fetchTreeData() {
            console.log('🔄 Получение данных дерева...');

            try {
                // Получаем все персоны для локальной обработки
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

                // Функция для добавления родителей
                const addParents = (person, depth, maxDepth) => {
                    if (depth >= maxDepth) return;

                    if (person.parent1) {
                        const parent = personMap.get(person.parent1.id);
                        if (parent && !treePersons.find(p => p.id === parent.id)) {
                            treePersons.push(parent);
                            addParents(parent, depth + 1, maxDepth);
                        }
                    }

                    if (person.parent2) {
                        const parent = personMap.get(person.parent2.id);
                        if (parent && !treePersons.find(p => p.id === parent.id)) {
                            treePersons.push(parent);
                            addParents(parent, depth + 1, maxDepth);
                        }
                    }
                };

                // Функция для добавления детей
                const addChildren = (person, depth, maxDepth) => {
                    if (depth >= maxDepth) return;

                    const children = allPersons.filter(p =>
                        (p.parent1 && p.parent1.id === person.id) ||
                        (p.parent2 && p.parent2.id === person.id)
                    );

                    children.forEach(child => {
                        if (!treePersons.find(p => p.id === child.id)) {
                            treePersons.push(child);
                            addChildren(child, depth + 1, maxDepth);
                        }
                    });
                };

                // В зависимости от типа дерева собираем данные
                if (this.treeType === 'ancestors' || this.treeType === 'both') {
                    addParents(rootPerson, 0, 3); // Ограничиваем глубину 3 поколениями
                }

                if (this.treeType === 'descendants' || this.treeType === 'both') {
                    addChildren(rootPerson, 0, 3); // Ограничиваем глубину 3 поколениями
                }

                return treePersons;

            } catch (error) {
                console.error('Ошибка получения данных:', error);
                throw error;
            }
        },

        createVisData(persons) {
            const nodes = [];
            const edges = [];

            persons.forEach(person => {
                // Определяем цвет в зависимости от пола
                let color;
                if (person.gender === 'MALE') {
                    color = '#d4edda'; // светло-зеленый для мужчин
                } else if (person.gender === 'FEMALE') {
                    color = '#f8d7da'; // светло-розовый для женщин
                } else {
                    color = '#e2e3e5'; // серый для неопределенного пола
                }

                // Определяем форму узла
                const isRoot = person.id === this.selectedPersonId;
                const shape = isRoot ? 'circle' : 'box';

                // Создаем узел
                const node = {
                    id: person.id,
                    label: `${person.firstName}\n${person.lastName}`,
                    color: {
                        background: color,
                        border: isRoot ? '#dc3545' : '#6c757d',
                        highlight: {
                            background: color,
                            border: isRoot ? '#dc3545' : '#6c757d'
                        }
                    },
                    shape: shape,
                    font: {
                        size: 14,
                        multi: true
                    },
                    borderWidth: isRoot ? 3 : 2,
                    size: isRoot ? 50 : 40,
                    margin: 10
                };

                nodes.push(node);

                // Добавляем связи с родителями
                if (person.parent1 && persons.find(p => p.id === person.parent1.id)) {
                    edges.push({
                        from: person.parent1.id,
                        to: person.id,
                        arrows: 'to',
                        color: '#3498db',
                        width: 2
                    });
                }

                if (person.parent2 && persons.find(p => p.id === person.parent2.id)) {
                    edges.push({
                        from: person.parent2.id,
                        to: person.id,
                        arrows: 'to',
                        color: '#e74c3c',
                        width: 2
                    });
                }
            });

            return { nodes, edges };
        },

        renderTree() {
            console.log('🔄 Рендеринг дерева...');

            // Уничтожаем предыдущую сеть, если есть
            if (this.network) {
                this.network.destroy();
                this.network = null;
            }

            // Находим контейнер
            const container = document.getElementById('family-tree');
            if (!container) {
                console.error('❌ Контейнер #family-tree не найден!');
                this.error = 'Контейнер для дерева не найден';
                return;
            }

            console.log('✅ Контейнер найден:', container);

            try {
                // Создаем сеть
                const options = {
                    layout: {
                        hierarchical: {
                            enabled: true,
                            direction: 'UD', // сверху вниз
                            sortMethod: 'directed',
                            nodeSpacing: 100,
                            levelSeparation: 150
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
                            multi: true
                        },
                        margin: 10
                    },
                    edges: {
                        smooth: false,
                        arrows: {
                            to: {
                                enabled: true,
                                scaleFactor: 0.5
                            }
                        }
                    }
                };

                console.log('✅ Данные для рендеринга:', {
                    nodes: this.treeData.nodes.length,
                    edges: this.treeData.edges.length
                });

                // Создаем визуализацию
                this.network = new vis.Network(container, this.treeData, options);
                console.log('✅ Сеть создана');

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
                        this.network.fit();
                        console.log('✅ Дерево отмасштабировано');
                    }
                }, 100);

            } catch (error) {
                console.error('❌ Ошибка создания сети:', error);
                this.error = 'Ошибка создания визуализации: ' + error.message;
            }
        },

        formatYear(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.getFullYear();
        }
    },

    beforeDestroy() {
        // Уничтожаем сеть при удалении компонента
        if (this.network) {
            this.network.destroy();
        }
    }
};