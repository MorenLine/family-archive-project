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
                        <label class="form-label">
                            Выберите корневую персону 
                            <span v-if="treeType === 'both'" class="text-muted small">(необязательно для полного дерева)</span>:
                        </label>
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
            <div v-if="!selectedPersonId && treeType !== 'both'" class="alert alert-info">
                <i class="bi bi-info-circle"></i> Выберите персону для отображения древа
            </div>
            
            <div v-if="loading" class="text-center py-5">
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
            // Строим дерево если выбрана персона или режим "Полное"
            if (this.selectedPersonId || this.treeType === 'both') {
                this.buildTree();
            }
        },

        setTreeType(type) {
            this.treeType = type;
            // Для режима "Полное" можно строить дерево без выбранной персоны
            if (this.selectedPersonId || type === 'both') {
                this.buildTree();
            }
        },

        async buildTree() {
            // Для режима "Полное" не требуется выбранная персона
            if (!this.selectedPersonId && this.treeType !== 'both') {
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

                // Проверяем ID узлов для отладки
                const nodeIds = this.treeData.nodes.map(n => n.id);
                const invalidIds = nodeIds.filter(id => !id || isNaN(parseInt(id)));
                if (invalidIds.length > 0) {
                    console.warn('⚠️ Найдены узлы с некорректными ID:', invalidIds);
                }

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

                // Для режима "Полное" возвращаем все персоны
                if (this.treeType === 'both') {
                    console.log('✅ Режим "Полное": возвращаем все персоны');
                    return allPersons;
                }

                // Для режимов "Предки" и "Потомки" требуется выбранная персона
                if (!this.selectedPersonId) {
                    throw new Error('Для этого режима требуется выбрать персону');
                }

                // Находим корневую персону
                const rootPerson = allPersons.find(p => p.id === this.selectedPersonId);
                if (!rootPerson) {
                    throw new Error('Персона не найдена');
                }

                // Собираем дерево вокруг корня
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

                // Функция для добавления супругов
                const addSpouses = (person) => {
                    if (person.spouse && person.spouse.id) {
                        const spouse = personMap.get(person.spouse.id);
                        if (spouse && !treePersons.find(p => p.id === spouse.id)) {
                            treePersons.push(spouse);
                        }
                    }
                };

                // В зависимости от типа дерева собираем данные
                const maxDepth = 3; // Максимальная глубина

                if (this.treeType === 'ancestors') {
                    addParents(rootPerson, 0, maxDepth);
                } else if (this.treeType === 'descendants') {
                    addChildren(rootPerson, 0, maxDepth);
                }

                // Добавляем супругов для всех найденных персон
                const personsToProcess = [...treePersons];
                personsToProcess.forEach(person => {
                    addSpouses(person);
                });

                return treePersons;

            } catch (error) {
                console.error('Ошибка получения данных:', error);
                throw error;
            }
        },

        // Упрощенная версия - только для демонстрации
        calculateLevels(persons) {
            const levels = {};
            const personMap = new Map();
            persons.forEach(p => {
                if (p && p.id) {
                    personMap.set(p.id, p);
                }
            });

            // Начинаем с корневых персон (без родителей в дереве)
            const rootPersons = persons.filter(p => {
                const hasParent1InTree = p.parent1 && p.parent1.id && personMap.has(p.parent1.id);
                const hasParent2InTree = p.parent2 && p.parent2.id && personMap.has(p.parent2.id);
                return !hasParent1InTree && !hasParent2InTree;
            });

            // Присваиваем уровень 0 корневым персонам
            rootPersons.forEach(person => {
                if (person && person.id) {
                    levels[person.id] = 0;
                }
            });

            // Распределяем остальных: дети на уровень+1 от родителей
            const assignLevels = (personId, currentLevel) => {
                const person = personMap.get(personId);
                if (!person) return;

                // Находим детей
                const children = persons.filter(p => {
                    return (p.parent1 && p.parent1.id === personId) ||
                        (p.parent2 && p.parent2.id === personId);
                });

                children.forEach(child => {
                    if (child && child.id && levels[child.id] === undefined) {
                        levels[child.id] = currentLevel + 1;
                        // Добавляем супруга ребенка на тот же уровень
                        if (child.spouse && child.spouse.id && personMap.has(child.spouse.id)) {
                            levels[child.spouse.id] = currentLevel + 1;
                        }
                        assignLevels(child.id, currentLevel + 1);
                    }
                });
            };

            // Запускаем для всех корней
            rootPersons.forEach(person => {
                if (person && person.id) {
                    assignLevels(person.id, 0);
                    // Супруги корней тоже на уровне 0
                    if (person.spouse && person.spouse.id && personMap.has(person.spouse.id)) {
                        levels[person.spouse.id] = 0;
                    }
                }
            });

            // Убедимся, что у всех есть уровень
            persons.forEach(person => {
                if (person && person.id && levels[person.id] === undefined) {
                    // Если уровень не назначен, пытаемся найти через родителей
                    const parentIds = [];
                    if (person.parent1 && person.parent1.id) parentIds.push(person.parent1.id);
                    if (person.parent2 && person.parent2.id) parentIds.push(person.parent2.id);

                    const parentLevels = parentIds.map(id => levels[id]).filter(l => l !== undefined);
                    if (parentLevels.length > 0) {
                        levels[person.id] = Math.max(...parentLevels) + 1;
                    } else {
                        // Если родители не в дереве или без уровня, назначаем 0
                        levels[person.id] = 0;
                    }
                }
            });

            return levels;
        },

        createVisData(persons) {
            const nodes = [];
            const edges = new Map(); // ключ -> ребро, чтобы избегать дубликатов

            // Сначала вычисляем уровни для всех персон на основе родительских связей
            const levels = this.calculateLevels(persons);

            persons.forEach(person => {
                // Пропускаем персон без валидного ID
                if (!person || !person.id || isNaN(parseInt(person.id))) {
                    console.warn('⚠️ Пропущена персона без валидного ID:', person);
                    return;
                }

                const isRoot = person.id === this.selectedPersonId;
                const colors = this.getNodeColors(person, isRoot);

                // Получаем уровень персоны
                const level = levels[person.id] !== undefined ? levels[person.id] : 0;

                const node = {
                    id: person.id,
                    label: this.buildNodeLabel(person),
                    title: this.buildNodeTooltip(person),
                    color: colors,
                    shape: 'box',
                    level: level, // Явно задаем уровень для иерархического layout
                    font: {
                        size: 15,
                        face: 'Inter, Arial',
                        multi: true,
                        bold: {
                            color: '#0f172a',
                            size: 16,
                            mod: 'bold'
                        }
                    },
                    borderWidth: isRoot ? 3 : 2,
                    margin: { top: 12, bottom: 12, left: 16, right: 16 },
                    shadow: {
                        enabled: true,
                        color: 'rgba(15, 23, 42, 0.25)',
                        size: 8,
                        x: 0,
                        y: 2
                    },
                    widthConstraint: { maximum: 180 }
                };

                nodes.push(node);

                // Добавляем связи с родителями
                if (person.parent1 && person.parent1.id) {
                    const edgeKey = `${person.parent1.id}-${person.id}`;
                    if (!edges.has(edgeKey)) {
                        edges.set(edgeKey, {
                            id: edgeKey,
                            from: person.parent1.id,
                            to: person.id,
                            arrows: { to: { enabled: true, scaleFactor: 0.7 } },
                            color: { color: '#38bdf8', highlight: '#0ea5e9' },
                            width: 2.4,
                            smooth: { enabled: true, roundness: 0.15 }
                        });
                    }
                }

                if (person.parent2 && person.parent2.id) {
                    const edgeKey = `${person.parent2.id}-${person.id}`;
                    if (!edges.has(edgeKey)) {
                        edges.set(edgeKey, {
                            id: edgeKey,
                            from: person.parent2.id,
                            to: person.id,
                            arrows: { to: { enabled: true, scaleFactor: 0.7 } },
                            color: { color: '#fb7185', highlight: '#f43f5e' },
                            width: 2.4,
                            smooth: { enabled: true, roundness: 0.15 }
                        });
                    }
                }
            });

            // Добавляем супружеские связи (горизонтальные, без стрелок)
            persons.forEach(person => {
                if (!person || !person.id || isNaN(parseInt(person.id))) {
                    return;
                }

                // Проверяем наличие супруга
                if (person.spouse && person.spouse.id) {
                    const spouseId = person.spouse.id;
                    // Проверяем, что супруг тоже в дереве
                    const spouseInTree = persons.find(p => p && p.id === spouseId);
                    if (spouseInTree) {
                        // Создаем уникальный ключ для супружеской связи (меньший ID -> больший ID)
                        const spouseIds = [person.id, spouseId].sort((a, b) => a - b);
                        const spouseEdgeKey = `spouse-${spouseIds[0]}-${spouseIds[1]}`;

                        if (!edges.has(spouseEdgeKey)) {
                            edges.set(spouseEdgeKey, {
                                id: spouseEdgeKey,
                                from: spouseIds[0],
                                to: spouseIds[1],
                                arrows: { to: { enabled: false } }, // Без стрелок для супружеских связей
                                color: { color: '#9333ea', highlight: '#7c3aed' }, // Фиолетовый цвет для супружеских связей
                                width: 2.5,
                                dashes: [8, 4], // Пунктирная линия: 8px штрих, 4px пробел
                                smooth: {
                                    enabled: true,
                                    type: 'horizontal', // Горизонтальная линия
                                    roundness: 0
                                }
                            });
                        }
                    }
                }
            });

            return {
                nodes: nodes,
                edges: Array.from(edges.values())
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
                            direction: 'LR', // Слева направо: поколения как столбцы
                            sortMethod: 'directed',
                            nodeSpacing: 200, // Расстояние между узлами в одном уровне
                            levelSeparation: 300, // Расстояние между столбцами (поколениями)
                            treeSpacing: 150, // Расстояние между разными деревьями (если есть несколько корней)
                            blockShifting: true,
                            edgeMinimization: true,
                            parentCentralization: false // Отключаем, чтобы супруги были рядом
                        }
                    },
                    interaction: {
                        hover: true,
                        dragNodes: true,
                        zoomView: true,
                        dragView: true,
                        hoverConnectedEdges: true,
                        tooltipDelay: 150
                    },
                    physics: {
                        enabled: false
                    },
                    nodes: {
                        shape: 'box',
                        font: {
                            size: 15,
                            face: 'Inter, Arial',
                            multi: true
                        },
                        margin: 12
                    },
                    edges: {
                        smooth: {
                            enabled: true,
                            type: 'cubicBezier',
                            roundness: 0.3
                        },
                        arrows: {
                            to: {
                                enabled: true,
                                scaleFactor: 0.8
                            }
                        },
                        color: {
                            color: '#94a3b8',
                            highlight: '#64748b',
                            inherit: 'from'
                        },
                        width: 2.5,
                        dashes: false
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
                        console.log('Клик по узлу:', nodeId, 'тип:', typeof nodeId);

                        // Проверяем валидность ID перед переходом
                        if (nodeId !== undefined && nodeId !== null && !isNaN(parseInt(nodeId))) {
                            const validId = parseInt(nodeId);
                            console.log('✅ Переход к персоне с ID:', validId);
                            this.$router.push(`/persons/${validId}`);
                        } else {
                            console.error('❌ Некорректный ID узла:', nodeId, 'тип:', typeof nodeId);
                        }
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

        buildNodeLabel(person) {
            const lifeLine = this.getLifeLine(person);
            const location = person.birthPlace || person.city || '';
            const parts = [
                `${person.firstName || ''} ${person.lastName || ''}`.trim(),
                lifeLine,
                location
            ].filter(Boolean);

            return parts.join('\n');
        },

        buildNodeTooltip(person) {
            const lifeLine = this.getLifeLine(person);
            const lines = [
                `<strong>${person.firstName || ''} ${person.lastName || ''}</strong>`,
                lifeLine ? `Жизнь: ${lifeLine}` : '',
                person.birthPlace ? `Родился: ${person.birthPlace}` : '',
                person.deathPlace ? `Умер: ${person.deathPlace}` : ''
            ].filter(Boolean);

            return lines.join('<br>');
        },

        getNodeColors(person, isRoot) {
            const palette = {
                male: { bg: '#e0f2fe', border: '#0ea5e9' },
                female: { bg: '#ffe4e6', border: '#f43f5e' },
                unknown: { bg: '#f1f5f9', border: '#cbd5e1' },
                root: { bg: '#fef9c3', border: '#f59e0b' }
            };

            let base;
            if (isRoot) {
                base = palette.root;
            } else if (person.gender === 'MALE') {
                base = palette.male;
            } else if (person.gender === 'FEMALE') {
                base = palette.female;
            } else {
                base = palette.unknown;
            }

            return {
                background: base.bg,
                border: base.border,
                highlight: {
                    background: base.bg,
                    border: base.border
                },
                hover: {
                    background: base.bg,
                    border: base.border
                }
            };
        },

        getLifeLine(person) {
            const birth = this.formatYear(person.birthDate);
            const death = this.formatYear(person.deathDate);

            if (!birth && !death) return '';
            if (birth && death) return `${birth} — ${death}`;
            if (birth) return `${birth} — `;
            return `— ${death}`;
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