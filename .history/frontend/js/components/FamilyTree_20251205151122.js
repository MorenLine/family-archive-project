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
                            <!-- Выбор корневой персоны - исправленная версия -->
                            <div class="dropdown me-2" ref="rootDropdown">
                                <button class="btn btn-outline-secondary dropdown-toggle" type="button" 
                                        @click="toggleRootDropdown"
                                        :class="{ show: showRootDropdown }"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="showRootDropdown">
                                    <i class="bi bi-person"></i> 
                                    {{ selectedRootPerson ? selectedRootPerson.firstName + ' ' + selectedRootPerson.lastName : 'Выбрать корень' }}
                                </button>
                                <ul class="dropdown-menu" 
                                    :class="{ show: showRootDropdown }"
                                    style="max-height: 300px; overflow-y: auto;"
                                    @click.stop>
                                    <li v-for="person in allPersons" :key="person.id">
                                        <a class="dropdown-item" href="#" @click.prevent="setRootPerson(person)">
                                            {{ person.firstName }} {{ person.lastName }}
                                            <span v-if="person.birthDate" class="text-muted">
                                                ({{ formatYear(person.birthDate) }})
                                            </span>
                                        </a>
                                    </li>
                                    <li v-if="allPersons.length === 0">
                                        <a class="dropdown-item disabled" href="#">
                                            Нет персон для выбора
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
                        <button class="btn btn-primary" @click="showRootDropdown = true">
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
            treeType: 'both',
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
            },
            showRootDropdown: false
        };
    },

    async mounted() {
        await this.loadAllPersons();

        // Закрываем dropdown при клике вне его
        document.addEventListener('click', this.handleClickOutside);

        const personId = this.$route.params.personId;
        if (personId) {
            await this.setRootPersonById(personId);
        }

        this.$nextTick(() => {
            this.initVisNetwork();
        });
    },

    beforeDestroy() {
        document.removeEventListener('click', this.handleClickOutside);
        if (this.network) {
            this.network.destroy();
        }
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
                console.log('✅ Загружено персон:', this.allPersons.length);
            } catch (error) {
                console.error('❌ Ошибка загрузки персон:', error);
                this.error = 'Не удалось загрузить список персон';
            }
        },

        toggleRootDropdown() {
            this.showRootDropdown = !this.showRootDropdown;
            console.log('Dropdown toggled:', this.showRootDropdown);
        },

        handleClickOutside(event) {
            const dropdown = this.$refs.rootDropdown;
            if (dropdown && !dropdown.contains(event.target)) {
                this.showRootDropdown = false;
            }
        },

        async setRootPerson(person) {
            console.log('Выбрана персона:', person);
            this.selectedRootPerson = person;
            this.showRootDropdown = false; // Закрываем dropdown

            // Обновляем URL без перезагрузки страницы
            this.$router.push({ path: `/tree/${person.id}` });

            // Не нужно вызывать buildTree() здесь, так как он вызовится через watch
        },

        async setRootPersonById(personId) {
            try {
                console.log('Загрузка персоны по ID:', personId);
                const response = await axios.get(`http://localhost:8080/api/persons/${personId}`);
                this.selectedRootPerson = response.data;
                console.log('✅ Корневая персона установлена:', this.selectedRootPerson);
            } catch (error) {
                console.error('❌ Ошибка загрузки персоны:', error);
                this.error = 'Не удалось загрузить персону';
            }
        },

        setTreeType(type) {
            this.treeType = type;
        },

        async buildTree() {
            if (!this.selectedRootPerson) {
                console.log('❌ Нет корневой персоны для построения дерева');
                return;
            }

            console.log('🔄 Построение дерева для:', this.selectedRootPerson.firstName);
            this.loading = true;
            this.error = null;

            try {
                // Получаем данные для дерева
                const treePersons = await this.fetchTreeData();
                console.log('✅ Получено персон для дерева:', treePersons.length);

                if (treePersons.length === 0) {
                    this.error = 'Не удалось получить данные для дерева';
                    return;
                }

                // Формируем узлы и связи для Vis.js
                this.treeData = this.createVisData(treePersons);
                console.log('✅ Создано узлов:', this.treeData.nodes.length, 'связей:', this.treeData.edges.length);

                // Обновляем статистику
                this.updateTreeStats(treePersons);

                // Обновляем визуализацию
                if (this.network) {
                    this.network.setData(this.treeData);
                    this.fitNetworkToScreen();
                }

            } catch (error) {
                console.error('❌ Ошибка построения дерева:', error);
                this.error = 'Ошибка при построении дерева: ' + error.message;
            } finally {
                this.loading = false;
            }
        },

        async fetchTreeData() {
            try {
                console.log('🔄 Получение всех персон для локальной фильтрации...');

                // Просто получаем всех персон и фильтруем на фронтенде
                const response = await axios.get('http://localhost:8080/api/persons');
                const allPersons = response.data;

                // Получаем корневую персону с деталями
                const rootResponse = await axios.get(`http://localhost:8080/api/persons/${this.selectedRootPerson.id}`);
                const rootPerson = rootResponse.data;

                // Собираем дерево локально
                const treePersons = [rootPerson];
                const personMap = new Map();
                allPersons.forEach(p => personMap.set(p.id, p));

                // Добавляем родителей
                if ((this.treeType === 'ancestors' || this.treeType === 'both') && this.treeDepth > 1) {
                    this.addParentsRecursive(rootPerson, treePersons, personMap, 1);
                }

                // Добавляем детей
                if ((this.treeType === 'descendants' || this.treeType === 'both') && this.treeDepth > 1) {
                    this.addChildrenRecursive(rootPerson, treePersons, personMap, 1);
                }

                console.log('✅ Собрано персон для дерева:', treePersons.length);
                return treePersons;

            } catch (error) {
                console.error('❌ Ошибка получения данных:', error);
                return [];
            }
        },

        addParentsRecursive(person, treePersons, personMap, currentDepth) {
            if (currentDepth >= this.treeDepth) return;

            if (person.parent1) {
                const parent1 = personMap.get(person.parent1.id);
                if (parent1 && !treePersons.find(p => p.id === parent1.id)) {
                    treePersons.push(parent1);
                    this.addParentsRecursive(parent1, treePersons, personMap, currentDepth + 1);
                }
            }

            if (person.parent2) {
                const parent2 = personMap.get(person.parent2.id);
                if (parent2 && !treePersons.find(p => p.id === parent2.id)) {
                    treePersons.push(parent2);
                    this.addParentsRecursive(parent2, treePersons, personMap, currentDepth + 1);
                }
            }
        },

        addChildrenRecursive(person, treePersons, personMap, currentDepth) {
            if (currentDepth >= this.treeDepth) return;

            // Находим детей этой персоны
            const children = Array.from(personMap.values()).filter(p =>
                (p.parent1 && p.parent1.id === person.id) ||
                (p.parent2 && p.parent2.id === person.id)
            );

            for (const child of children) {
                if (!treePersons.find(p => p.id === child.id)) {
                    treePersons.push(child);
                    this.addChildrenRecursive(child, treePersons, personMap, currentDepth + 1);
                }
            }
        },

        createVisData(persons) {
            const nodes = [];
            const edges = [];

            // Создаем узлы для каждой персоны
            persons.forEach(person => {
                // Получаем фото персоны
                let photoUrl = null;
                if (person.photos && person.photos.length > 0) {
                    // Ищем главное фото или первое фото
                    const mainPhoto = person.photos.find(p => p.isMain) || person.photos[0];
                    if (mainPhoto) {
                        photoUrl = `http://localhost:8080/api/photos/file/${mainPhoto.fileName}`;
                    }
                }

                const node = {
                    id: person.id,
                    label: `${person.firstName}\n${person.lastName}`,
                    title: this.createNodeTooltip(person),
                    color: this.getNodeColor(person),
                    shape: photoUrl ? 'circularImage' : 'box',
                    image: photoUrl,
                    size: photoUrl ? 60 : 40,
                    font: {
                        size: photoUrl ? 12 : 14,
                        face: 'Arial',
                        multi: true
                    },
                    borderWidth: person.id === this.selectedRootPerson.id ? 3 : 2,
                    borderColor: person.id === this.selectedRootPerson.id ? '#ff6b6b' : '#2c3e50',
                    margin: 8
                };

                nodes.push(node);

                // Создаем связи с родителями
                if (person.parent1 && persons.find(p => p.id === person.parent1.id)) {
                    edges.push({
                        from: person.parent1.id,
                        to: person.id,
                        arrows: 'to',
                        color: { color: '#3498db', width: 2 },
                        dashes: false,
                        smooth: { type: 'curvedCW', roundness: 0.2 }
                    });
                }

                if (person.parent2 && persons.find(p => p.id === person.parent2.id)) {
                    edges.push({
                        from: person.parent2.id,
                        to: person.id,
                        arrows: 'to',
                        color: { color: '#e74c3c', width: 2 },
                        dashes: false,
                        smooth: { type: 'curvedCW', roundness: 0.2 }
                    });
                }
            });

            return { nodes, edges };
        },

        createNodeTooltip(person) {
            let tooltip = `<div style="text-align: left; max-width: 250px;">`;
            tooltip += `<strong>${person.firstName} ${person.lastName}</strong>`;

            if (person.middleName) {
                tooltip += ` ${person.middleName}`;
            }

            tooltip += `<br><hr style="margin: 5px 0;">`;

            if (person.birthDate) {
                tooltip += `<strong>Родился:</strong> ${this.formatDate(person.birthDate)}<br>`;
            }

            if (person.deathDate) {
                tooltip += `<strong>Умер:</strong> ${this.formatDate(person.deathDate)}<br>`;
            }

            if (person.gender) {
                tooltip += `<strong>Пол:</strong> ${person.gender === 'MALE' ? 'Мужской' : 'Женский'}<br>`;
            }

            tooltip += `</div>`;
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

            if (!container) {
                console.error('❌ Контейнер для дерева не найден');
                return;
            }

            const options = {
                layout: {
                    hierarchical: {
                        enabled: true,
                        direction: 'UD', // Up-Down (сверху вниз)
                        sortMethod: 'directed',
                        nodeSpacing: 120,
                        levelSeparation: 150,
                        treeSpacing: 100,
                        shakeTowards: 'roots'
                    }
                },
                interaction: {
                    hover: true,
                    dragNodes: true,
                    zoomView: true,
                    dragView: true,
                    tooltipDelay: 200,
                    hideEdgesOnDrag: true
                },
                physics: {
                    enabled: false,
                },
                nodes: {
                    shapeProperties: {
                        useBorderWithImage: true,
                        useImageSize: false
                    },
                    shadow: {
                        enabled: true,
                        color: 'rgba(0,0,0,0.2)',
                        size: 5,
                        x: 2,
                        y: 2
                    }
                },
                edges: {
                    width: 2,
                    hoverWidth: 3,
                    selectionWidth: 3,
                    smooth: {
                        type: 'curvedCW',
                        roundness: 0.2
                    },
                    arrows: {
                        to: {
                            enabled: true,
                            scaleFactor: 0.8,
                            type: 'arrow'
                        }
                    }
                }
            };

            // Проверяем, загружена ли библиотека vis
            if (typeof vis === 'undefined') {
                console.error('❌ Библиотека vis не загружена');
                this.error = 'Библиотека визуализации не загружена';
                return;
            }

            try {
                this.network = new vis.Network(container, this.treeData, options);
                console.log('✅ Сеть Vis.js инициализирована');

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

                this.network.on('afterDrawing', () => {
                    console.log('✅ Дерево отрисовано');
                });

            } catch (error) {
                console.error('❌ Ошибка инициализации Vis.js:', error);
                this.error = 'Ошибка инициализации визуализации дерева';
            }
        },

        onNodeClick(nodeId) {
            console.log('Клик по узлу:', nodeId);
            // Можно добавить всплывающее окно или подсветку
        },

        onNodeDoubleClick(nodeId) {
            console.log('Двойной клик по узлу:', nodeId);
            this.$router.push(`/persons/${nodeId}`);
        },

        fitNetworkToScreen() {
            if (this.network) {
                setTimeout(() => {
                    this.network.fit({
                        animation: {
                            duration: 500,
                            easingFunction: 'easeInOutQuad'
                        }
                    });
                }, 100);
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
            if (this.network && this.network.canvas && this.network.canvas.frame) {
                try {
                    const dataURL = this.network.canvas.frame.canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.download = `family-tree-${this.selectedRootPerson.lastName}-${new Date().toISOString().slice(0, 10)}.png`;
                    link.href = dataURL;
                    link.click();
                } catch (error) {
                    console.error('Ошибка экспорта:', error);
                    alert('Не удалось экспортировать изображение');
                }
            } else {
                alert('Дерево еще не загружено для экспорта');
            }
        },

        printTree() {
            window.print();
        },

        addMissingPerson() {
            this.$router.push('/persons/new');
        },

        formatDate(dateString) {
            if (!dateString) return 'Не указана';
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU');
        },

        formatYear(date) {
            if (!date) return 'Не указан';
            if (typeof date === 'string') {
                return new Date(date).getFullYear();
            }
            return date.getFullYear();
        }
    }
};