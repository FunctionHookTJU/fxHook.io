// 图算法可视化 - Prim、Kruskal、Dijkstra、拓扑排序、AOE 关键路径算法实现

// 全局状态
let currentAlgorithm = 'prim'; // 当前算法: 'prim', 'kruskal', 'dijkstra', 'topo', 'aoe'
let currentMode = 'addNode'; // 当前模式: 'addNode', 'addEdge', 'delete', 'setStart'
let nodes = []; // 节点数组
let edges = []; // 边数组
let selectedNode = null; // 选中的第一个节点（用于添加边）
let tempEdgeEnd = null; // 临时边的终点（鼠标位置）
let isRunning = false; // 算法是否正在运行
let algorithmState = null; // 算法执行状态
let dijkstraStartNode = -1; // Dijkstra 起点

// 画布相关
let canvas, ctx;
let canvas2, ctx2; // Kruskal 的画布
let canvas3, ctx3; // 拓扑排序的画布
let canvas4, ctx4; // AOE 的画布
let canvas5, ctx5; // Dijkstra 的画布

// 节点和边的样式配置
const NODE_RADIUS = 25;
const NODE_COLOR = '#667eea';
const NODE_SELECTED_COLOR = '#764ba2';
const NODE_IN_MST_COLOR = '#11998e';
const NODE_TOPO_PROCESSED_COLOR = '#ff6b6b';
const NODE_DIJKSTRA_START_COLOR = '#00b4db';
const NODE_DIJKSTRA_CURRENT_COLOR = '#f093fb';
const EDGE_COLOR = '#999';
const EDGE_IN_MST_COLOR = '#11998e';
const EDGE_TOPO_PROCESSED_COLOR = '#ff6b6b';
const EDGE_DIJKSTRA_PATH_COLOR = '#00b4db';
const EDGE_WIDTH = 2;
const EDGE_IN_MST_WIDTH = 4;

// 并查集类（用于 Kruskal 算法）
class UnionFind {
    constructor(size) {
        this.parent = Array.from({ length: size }, (_, i) => i);
        this.rank = Array(size).fill(0);
    }

    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }

    union(x, y) {
        const rootX = this.find(x);
        const rootY = this.find(y);
        
        if (rootX === rootY) return false;
        
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++;
        }
        return true;
    }
}

// 初始化
window.addEventListener('load', function() {
    canvas = document.getElementById('graphCanvas');
    ctx = canvas.getContext('2d');
    
    canvas2 = document.getElementById('kruskalCanvas');
    ctx2 = canvas2.getContext('2d');
    
    canvas3 = document.getElementById('topoCanvas');
    ctx3 = canvas3.getContext('2d');

    canvas4 = document.getElementById('aoeCanvas');
    ctx4 = canvas4.getContext('2d');

    canvas5 = document.getElementById('dijkstraCanvas');
    ctx5 = canvas5.getContext('2d');
    
    // 绑定事件
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas2.addEventListener('click', handleCanvasClick);
    canvas2.addEventListener('mousemove', handleCanvasMouseMove);
    canvas3.addEventListener('click', handleCanvasClick);
    canvas3.addEventListener('mousemove', handleCanvasMouseMove);

    canvas4.addEventListener('click', handleCanvasClick);
    canvas4.addEventListener('mousemove', handleCanvasMouseMove);

    canvas5.addEventListener('click', handleCanvasClick);
    canvas5.addEventListener('mousemove', handleCanvasMouseMove);
    
    // 权重输入框回车确认
    document.getElementById('weightInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            confirmWeight();
        }
    });
    
    draw();
});

// 切换算法
function switchAlgorithm(algorithm) {
    currentAlgorithm = algorithm;
    
    // 更新标签页样式
    document.querySelectorAll('.tool-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tool-content').forEach(content => content.classList.remove('active'));
    
    if (algorithm === 'prim') {
        document.querySelector('.prim-tab').classList.add('active');
        document.getElementById('primTool').classList.add('active');
    } else if (algorithm === 'kruskal') {
        document.querySelector('.kruskal-tab').classList.add('active');
        document.getElementById('kruskalTool').classList.add('active');
    } else if (algorithm === 'topo') {
        document.querySelector('.topo-tab').classList.add('active');
        document.getElementById('topoTool').classList.add('active');
    } else if (algorithm === 'aoe') {
        document.querySelector('.aoe-tab').classList.add('active');
        document.getElementById('aoeTool').classList.add('active');
    } else if (algorithm === 'dijkstra') {
        document.querySelector('.dijkstra-tab').classList.add('active');
        document.getElementById('dijkstraTool').classList.add('active');
    }
    
    // 重置状态
    resetAlgorithm();
    draw();
}

// 设置操作模式
function setMode(mode) {
    currentMode = mode;
    selectedNode = null;
    tempEdgeEnd = null;
    
    // 更新按钮状态
    const prefix = currentAlgorithm;
    const toolId = `${prefix}Tool`;
    document.querySelectorAll(`#${toolId} .control-btn`).forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (mode === 'addNode') {
        document.getElementById(`${prefix}-add-node`).classList.add('active');
    } else if (mode === 'addEdge') {
        document.getElementById(`${prefix}-add-edge`).classList.add('active');
    } else if (mode === 'delete') {
        document.getElementById(`${prefix}-delete`).classList.add('active');
    } else if (mode === 'setStart' && prefix === 'dijkstra') {
        document.getElementById(`${prefix}-set-start`).classList.add('active');
    }
    
    draw();
}

// 处理画布点击
function handleCanvasClick(e) {
    if (isRunning) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentMode === 'addNode') {
        addNode(x, y);
    } else if (currentMode === 'addEdge') {
        handleEdgeClick(x, y);
    } else if (currentMode === 'delete') {
        handleDelete(x, y);
    } else if (currentMode === 'setStart') {
        handleSetStart(x, y);
    }
}

// 处理设置起点（Dijkstra）
function handleSetStart(x, y) {
    const clickedNode = getNodeAt(x, y);
    if (clickedNode !== null) {
        dijkstraStartNode = clickedNode.id;
        updateInfo();
        updateDijkstraTable();
        draw();
    }
}

// 处理鼠标移动（用于显示临时边）
function handleCanvasMouseMove(e) {
    if (currentMode === 'addEdge' && selectedNode !== null) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        tempEdgeEnd = { x, y };
        draw();
    }
}

// 添加节点
function addNode(x, y) {
    // 检查是否与现有节点重叠
    for (let node of nodes) {
        const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        if (dist < NODE_RADIUS * 2) {
            return; // 太近，不添加
        }
    }
    
    nodes.push({
        id: nodes.length,
        x: x,
        y: y,
        label: String.fromCharCode(65 + nodes.length) // A, B, C, ...
    });
    
    updateInfo();
    draw();
    // 部分浏览器在 canvas 元素从隐藏切到可见时需要下一帧才能正确刷新
    requestAnimationFrame(draw);
}

// 处理边的点击
function handleEdgeClick(x, y) {
    const clickedNode = getNodeAt(x, y);
    
    if (clickedNode === null) {
        selectedNode = null;
        tempEdgeEnd = null;
        draw();
        return;
    }
    
    if (selectedNode === null) {
        selectedNode = clickedNode;
    } else {
        if (selectedNode.id === clickedNode.id) {
            selectedNode = null;
            tempEdgeEnd = null;
        } else {
            // 对于拓扑排序，边是有向的，不需要检查反向边
            if (currentAlgorithm === 'topo') {
                // 检查是否已存在相同方向的边
                const existingEdge = edges.find(e => 
                    e.from === selectedNode.id && e.to === clickedNode.id
                );
                
                if (existingEdge) {
                    selectedNode = null;
                    tempEdgeEnd = null;
                    draw();
                    return;
                }
                
                // 拓扑排序不需要权重，直接添加边
                edges.push({
                    from: selectedNode.id,
                    to: clickedNode.id,
                    weight: 1,
                    inMST: false,
                    directed: true
                });
                
                selectedNode = null;
                tempEdgeEnd = null;
                updateInfo();
                draw();
                return;
            }

            // AOE：有向 + 需要工期（权重）
            if (currentAlgorithm === 'aoe') {
                // 检查是否已存在相同方向的边
                const existingEdge = edges.find(e =>
                    e.from === selectedNode.id && e.to === clickedNode.id
                );

                if (existingEdge) {
                    selectedNode = null;
                    tempEdgeEnd = null;
                    draw();
                    return;
                }

                // 打开权重输入模态框（工期）
                showWeightModal(selectedNode, clickedNode, { directed: true });
                return;
            }
            
            // 检查是否已存在边（无向图）
            const existingEdge = edges.find(e => 
                (e.from === selectedNode.id && e.to === clickedNode.id) ||
                (e.from === clickedNode.id && e.to === selectedNode.id)
            );
            
            if (existingEdge) {
                selectedNode = null;
                tempEdgeEnd = null;
                draw();
                return;
            }
            
            // 打开权重输入模态框
            showWeightModal(selectedNode, clickedNode);
        }
    }
    
    draw();
}

// 显示权重输入模态框
function showWeightModal(fromNode, toNode, options = {}) {
    document.getElementById('modalOverlay').classList.add('show');
    document.getElementById('weightModal').classList.add('show');
    document.getElementById('weightInput').value = '';
    document.getElementById('weightInput').focus();
    
    // 保存临时数据
    window.tempEdgeData = { from: fromNode, to: toNode, ...options };
}

// 关闭权重输入模态框
function closeWeightModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    document.getElementById('weightModal').classList.remove('show');
    selectedNode = null;
    tempEdgeEnd = null;
    window.tempEdgeData = null;
    draw();
}

// 确认权重
function confirmWeight() {
    const weight = parseInt(document.getElementById('weightInput').value);
    
    if (isNaN(weight) || weight <= 0) {
        alert('请输入有效的正整数权重！');
        return;
    }
    
    const { from, to, directed } = window.tempEdgeData;

    const edge = {
        from: from.id,
        to: to.id,
        weight: weight,
        inMST: false
    };
    if (directed) edge.directed = true;

    edges.push(edge);
    
    closeWeightModal();
    updateInfo();
    draw();
    requestAnimationFrame(draw);
}

// 处理删除
function handleDelete(x, y) {
    // 检查是否点击了节点
    const clickedNode = getNodeAt(x, y);
    if (clickedNode !== null) {
        // 删除与该节点相关的所有边
        edges = edges.filter(e => e.from !== clickedNode.id && e.to !== clickedNode.id);
        
        // 删除节点
        const nodeIndex = nodes.findIndex(n => n.id === clickedNode.id);
        nodes.splice(nodeIndex, 1);
        
        // 重新分配节点 ID 和标签
        nodes.forEach((node, index) => {
            node.id = index;
            node.label = String.fromCharCode(65 + index);
        });
        
        // 更新边的节点引用
        edges.forEach(edge => {
            if (edge.from > clickedNode.id) edge.from--;
            if (edge.to > clickedNode.id) edge.to--;
        });
        
        updateInfo();
        draw();
        return;
    }
    
    // 检查是否点击了边
    const clickedEdge = getEdgeAt(x, y);
    if (clickedEdge !== null) {
        const edgeIndex = edges.findIndex(e => 
            e.from === clickedEdge.from && e.to === clickedEdge.to
        );
        edges.splice(edgeIndex, 1);
        
        updateInfo();
        draw();
    }
}

// 获取点击位置的节点
function getNodeAt(x, y) {
    for (let node of nodes) {
        const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        if (dist <= NODE_RADIUS) {
            return node;
        }
    }
    return null;
}

// 获取点击位置的边
function getEdgeAt(x, y) {
    for (let edge of edges) {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];
        
        // 计算点到线段的距离
        const dist = pointToLineDistance(x, y, fromNode.x, fromNode.y, toNode.x, toNode.y);
        
        if (dist <= 8) { // 8像素的容差
            return edge;
        }
    }
    return null;
}

// 计算点到线段的距离
function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
        param = dot / lenSq;
    }
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
}

// 清空画布
function clearCanvas() {
    if (isRunning) return;
    
    if (confirm('确定要清空画布吗？')) {
        nodes = [];
        edges = [];
        selectedNode = null;
        tempEdgeEnd = null;
        algorithmState = null;
        dijkstraStartNode = -1;
        
        // 重置所有算法的按钮状态
        resetAllButtons();
        
        updateInfo();
        if (currentAlgorithm === 'dijkstra') {
            updateDijkstraTable();
        }
        draw();
    }
}

// 重置所有算法按钮状态
function resetAllButtons() {
    // Prim
    const primStep = document.getElementById('prim-step');
    const primRun = document.getElementById('prim-run');
    if (primStep) primStep.disabled = true;
    if (primRun) primRun.disabled = false;
    
    // Kruskal
    const kruskalStep = document.getElementById('kruskal-step');
    const kruskalRun = document.getElementById('kruskal-run');
    if (kruskalStep) kruskalStep.disabled = true;
    if (kruskalRun) kruskalRun.disabled = false;
    
    // Topo
    const topoStep = document.getElementById('topo-step');
    const topoRun = document.getElementById('topo-run');
    if (topoStep) topoStep.disabled = true;
    if (topoRun) topoRun.disabled = false;

    // AOE
    const aoeStep = document.getElementById('aoe-step');
    const aoeRun = document.getElementById('aoe-run');
    if (aoeStep) aoeStep.disabled = true;
    if (aoeRun) aoeRun.disabled = false;

    // Dijkstra
    const dijkstraStep = document.getElementById('dijkstra-step');
    const dijkstraRun = document.getElementById('dijkstra-run');
    if (dijkstraStep) dijkstraStep.disabled = true;
    if (dijkstraRun) dijkstraRun.disabled = false;
    
    // 隐藏所有步骤信息
    const stepInfos = ['prim-step-info', 'kruskal-step-info', 'topo-step-info', 'aoe-step-info', 'dijkstra-step-info'];
    stepInfos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// 加载 AOE 示例图
function loadAOEExample() {
    if (isRunning) return;

    nodes = [
        { id: 0, x: 120, y: 250, label: 'A' },
        { id: 1, x: 280, y: 140, label: 'B' },
        { id: 2, x: 280, y: 360, label: 'C' },
        { id: 3, x: 480, y: 140, label: 'D' },
        { id: 4, x: 480, y: 360, label: 'E' },
        { id: 5, x: 700, y: 250, label: 'F' }
    ];

    edges = [
        { from: 0, to: 1, weight: 3, inMST: false, directed: true },
        { from: 0, to: 2, weight: 2, inMST: false, directed: true },
        { from: 1, to: 3, weight: 2, inMST: false, directed: true },
        { from: 2, to: 3, weight: 1, inMST: false, directed: true },
        { from: 2, to: 4, weight: 4, inMST: false, directed: true },
        { from: 3, to: 5, weight: 3, inMST: false, directed: true },
        { from: 4, to: 5, weight: 2, inMST: false, directed: true }
    ];

    selectedNode = null;
    tempEdgeEnd = null;
    algorithmState = null;
    updateInfo();
    draw();
}

// 加载示例图
function loadExample() {
    if (isRunning) return;
    
    nodes = [
        { id: 0, x: 150, y: 150, label: 'A' },
        { id: 1, x: 400, y: 100, label: 'B' },
        { id: 2, x: 650, y: 150, label: 'C' },
        { id: 3, x: 200, y: 350, label: 'D' },
        { id: 4, x: 450, y: 400, label: 'E' },
        { id: 5, x: 700, y: 350, label: 'F' }
    ];
    
    edges = [
        { from: 0, to: 1, weight: 4, inMST: false },
        { from: 0, to: 3, weight: 2, inMST: false },
        { from: 1, to: 2, weight: 3, inMST: false },
        { from: 1, to: 4, weight: 5, inMST: false },
        { from: 2, to: 5, weight: 6, inMST: false },
        { from: 3, to: 4, weight: 7, inMST: false },
        { from: 4, to: 5, weight: 8, inMST: false },
        { from: 1, to: 3, weight: 1, inMST: false }
    ];
    
    selectedNode = null;
    tempEdgeEnd = null;
    algorithmState = null;
    updateInfo();
    draw();
    requestAnimationFrame(draw);
}

// 加载拓扑排序示例图
function loadTopoExample() {
    if (isRunning) return;
    
    nodes = [
        { id: 0, x: 150, y: 200, label: 'A' },
        { id: 1, x: 300, y: 100, label: 'B' },
        { id: 2, x: 300, y: 300, label: 'C' },
        { id: 3, x: 500, y: 100, label: 'D' },
        { id: 4, x: 500, y: 300, label: 'E' },
        { id: 5, x: 700, y: 200, label: 'F' }
    ];
    
    edges = [
        { from: 0, to: 1, weight: 1, inMST: false, directed: true },
        { from: 0, to: 2, weight: 1, inMST: false, directed: true },
        { from: 1, to: 3, weight: 1, inMST: false, directed: true },
        { from: 2, to: 3, weight: 1, inMST: false, directed: true },
        { from: 2, to: 4, weight: 1, inMST: false, directed: true },
        { from: 3, to: 5, weight: 1, inMST: false, directed: true },
        { from: 4, to: 5, weight: 1, inMST: false, directed: true }
    ];
    
    selectedNode = null;
    tempEdgeEnd = null;
    algorithmState = null;
    updateInfo();
    draw();
}

// 运行拓扑排序算法
function runTopo() {
    if (nodes.length === 0) {
        alert('请先添加节点！');
        return;
    }
    
    if (edges.length === 0) {
        alert('请先添加边！');
        return;
    }
    
    isRunning = true;
    
    // 重置所有边的状态
    edges.forEach(e => e.inMST = false);
    
    // 计算每个节点的入度
    const inDegree = new Array(nodes.length).fill(0);
    for (let edge of edges) {
        inDegree[edge.to]++;
    }
    
    // 找出所有入度为0的节点
    const queue = [];
    for (let i = 0; i < nodes.length; i++) {
        if (inDegree[i] === 0) {
            queue.push(i);
        }
    }
    
    // 初始化算法状态
    algorithmState = {
        type: 'topo',
        inDegree: inDegree,
        queue: queue,
        result: [],
        processed: new Set(),
        processedEdges: new Set(),
        currentStep: 0
    };
    
    // 启用单步执行按钮
    document.getElementById('topo-step').disabled = false;
    document.getElementById('topo-run').disabled = true;
    
    // 显示步骤信息
    const zeroNodes = queue.map(i => nodes[i].label).join(', ');
    updateStepInfo(`拓扑排序开始，入度为0的节点：${zeroNodes || '无'}`);
    
    draw();
}

// ==================== AOE 关键路径（CPM） ====================

function runAOE() {
    if (nodes.length === 0) {
        alert('请先添加节点！');
        return;
    }

    if (edges.length === 0) {
        alert('请先添加活动（边）！');
        return;
    }

    isRunning = true;

    // 重置高亮
    edges.forEach(e => e.inMST = false);

    // 入度
    const inDegree = new Array(nodes.length).fill(0);
    for (let edge of edges) {
        inDegree[edge.to]++;
    }

    const queue = [];
    for (let i = 0; i < nodes.length; i++) {
        if (inDegree[i] === 0) queue.push(i);
    }

    algorithmState = {
        type: 'aoe',
        stage: 'forward', // forward(ve) -> backward(vl) -> critical
        inDegree,
        queue,
        topo: [],
        ve: new Array(nodes.length).fill(0),
        vl: null,
        projectDuration: null,
        criticalEdges: [],
        processed: new Set(),
        currentStep: 0,
        reverseIndex: null
    };

    document.getElementById('aoe-step').disabled = false;
    document.getElementById('aoe-run').disabled = true;

    const zeroNodes = queue.map(i => nodes[i].label).join(', ');
    updateStepInfo(`AOE 开始：先拓扑推进计算 ve。<br>入度为 0 的事件：${zeroNodes || '无'}`);
    updateInfo();
    draw();
}

function stepAOE() {
    if (!algorithmState || algorithmState.type !== 'aoe') return;

    const state = algorithmState;

    if (state.stage === 'forward') {
        if (state.queue.length === 0) {
            if (state.topo.length < nodes.length) {
                updateStepInfo('图中存在环路（无法完成拓扑序），AOE 网不成立。');
                finishAlgorithm();
                return;
            }

            const T = Math.max(...state.ve);
            state.projectDuration = T;
            state.vl = new Array(nodes.length).fill(T);
            state.stage = 'backward';
            state.reverseIndex = state.topo.length - 1;

            updateStepInfo(`ve 计算完成，工程总工期 T = ${T}。<br>开始逆拓扑回推计算 vl。`);
            updateInfo();
            draw();
            return;
        }

        const u = state.queue.shift();
        state.topo.push(u);
        state.processed.add(u);

        const changes = [];
        const pushed = [];

        for (let edge of edges) {
            if (edge.from !== u) continue;
            const v = edge.to;
            const candidate = state.ve[u] + edge.weight;
            if (candidate > state.ve[v]) {
                const old = state.ve[v];
                state.ve[v] = candidate;
                changes.push(`${nodes[edge.from].label}→${nodes[edge.to].label}：ve[${nodes[v].label}] ${old} → ${candidate}`);
            }

            state.inDegree[v]--;
            if (state.inDegree[v] === 0) {
                state.queue.push(v);
                pushed.push(nodes[v].label);
            }
        }

        state.currentStep++;
        const topoLabels = state.topo.map(i => nodes[i].label).join(' → ');
        const queueLabels = state.queue.map(i => nodes[i].label).join(', ');
        const lines = [
            `步骤 ${state.currentStep}（ve 推进）：处理事件 ${nodes[u].label}`,
            `当前拓扑序：${topoLabels || '-'}`,
            `队列：${queueLabels || '空'}`
        ];
        if (changes.length) lines.push(`更新 ve：<br>${changes.join('<br>')}`);
        if (pushed.length) lines.push(`入队（入度变 0）：${pushed.join(', ')}`);
        updateStepInfo(lines.join('<br>'));

        updateInfo();
        draw();
        return;
    }

    if (state.stage === 'backward') {
        if (state.reverseIndex === null || state.reverseIndex < 0) {
            // 计算关键活动
            state.criticalEdges = [];
            edges.forEach(edge => {
                const ee = state.ve[edge.from];
                const ll = state.vl[edge.to] - edge.weight;
                if (ee === ll) {
                    edge.inMST = true; // 复用高亮标记
                    state.criticalEdges.push(`${nodes[edge.from].label}→${nodes[edge.to].label}(${edge.weight})`);
                } else {
                    edge.inMST = false;
                }
            });

            state.stage = 'critical';
            const list = state.criticalEdges.length ? state.criticalEdges.join(', ') : '无';
            updateStepInfo(`关键活动判定完成。<br>关键活动：${list}<br>工程总工期：${state.projectDuration}`);
            updateInfo();
            draw();
            finishAlgorithm();
            return;
        }

        const u = state.topo[state.reverseIndex];
        const changes = [];

        for (let edge of edges) {
            if (edge.from !== u) continue;
            const v = edge.to;
            const candidate = state.vl[v] - edge.weight;
            if (candidate < state.vl[u]) {
                const old = state.vl[u];
                state.vl[u] = candidate;
                changes.push(`${nodes[edge.from].label}→${nodes[edge.to].label}：vl[${nodes[u].label}] ${old} → ${candidate}`);
            }
        }

        state.currentStep++;
        const lines = [
            `步骤 ${state.currentStep}（vl 回推）：处理事件 ${nodes[u].label}`,
            `当前 vl[${nodes[u].label}] = ${state.vl[u]}`
        ];
        if (changes.length) lines.push(`更新 vl：<br>${changes.join('<br>')}`);
        else lines.push('本步无 vl 更新');

        state.reverseIndex--;

        updateStepInfo(lines.join('<br>'));
        updateInfo();
        draw();
        return;
    }
}

// 拓扑排序单步执行
function stepTopo() {
    if (!algorithmState || algorithmState.type !== 'topo') return;
    
    const { inDegree, queue, result, processed, processedEdges } = algorithmState;
    
    // 如果队列为空
    if (queue.length === 0) {
        if (result.length < nodes.length) {
            updateStepInfo('图中存在环路，无法完成拓扑排序！');
        } else {
            const resultLabels = result.map(i => nodes[i].label).join(' → ');
            updateStepInfo(`拓扑排序完成！结果：${resultLabels}`);
        }
        finishAlgorithm();
        return;
    }
    
    // 取出一个入度为0的节点
    const currentNode = queue.shift();
    result.push(currentNode);
    processed.add(currentNode);
    
    // 处理该节点的所有出边
    for (let edge of edges) {
        if (edge.from === currentNode) {
            inDegree[edge.to]--;
            processedEdges.add(`${edge.from}-${edge.to}`);
            edge.inMST = true; // 复用 inMST 来标记已处理的边
            
            if (inDegree[edge.to] === 0) {
                queue.push(edge.to);
            }
        }
    }
    
    algorithmState.currentStep++;
    
    const nodeLabel = nodes[currentNode].label;
    const resultLabels = result.map(i => nodes[i].label).join(' → ');
    updateStepInfo(`步骤 ${algorithmState.currentStep}：处理节点 ${nodeLabel}，当前序列：${resultLabels}`);
    
    updateInfo();
    draw();
}

// ==================== Dijkstra 算法 ====================

// 加载 Dijkstra 示例图
function loadDijkstraExample() {
    if (isRunning) return;

    nodes = [
        { id: 0, x: 100, y: 200, label: 'A' },
        { id: 1, x: 250, y: 100, label: 'B' },
        { id: 2, x: 250, y: 300, label: 'C' },
        { id: 3, x: 450, y: 100, label: 'D' },
        { id: 4, x: 450, y: 300, label: 'E' },
        { id: 5, x: 600, y: 200, label: 'F' }
    ];

    edges = [
        { from: 0, to: 1, weight: 4, inMST: false },
        { from: 0, to: 2, weight: 2, inMST: false },
        { from: 1, to: 2, weight: 1, inMST: false },
        { from: 1, to: 3, weight: 5, inMST: false },
        { from: 2, to: 4, weight: 10, inMST: false },
        { from: 3, to: 4, weight: 2, inMST: false },
        { from: 3, to: 5, weight: 6, inMST: false },
        { from: 4, to: 5, weight: 3, inMST: false }
    ];

    dijkstraStartNode = 0;
    selectedNode = null;
    tempEdgeEnd = null;
    algorithmState = null;
    updateInfo();
    updateDijkstraTable();
    draw();
}

// 运行 Dijkstra 算法
function runDijkstra() {
    if (nodes.length === 0) {
        alert('请先添加节点！');
        return;
    }

    if (dijkstraStartNode === -1) {
        alert('请先设置起点！');
        return;
    }

    if (edges.length === 0) {
        alert('请先添加边！');
        return;
    }

    isRunning = true;

    // 重置边状态
    edges.forEach(e => e.inMST = false);

    const n = nodes.length;
    const dist = new Array(n).fill(Infinity);
    const prev = new Array(n).fill(-1);
    const visited = new Array(n).fill(false);

    dist[dijkstraStartNode] = 0;

    algorithmState = {
        type: 'dijkstra',
        dist: dist,
        prev: prev,
        visited: visited,
        currentNode: -1,
        currentStep: 0
    };

    document.getElementById('dijkstra-step').disabled = false;
    document.getElementById('dijkstra-run').disabled = true;

    updateStepInfo(`Dijkstra 算法开始，起点：${nodes[dijkstraStartNode].label}，距离设为 0`);
    updateDijkstraTable();
    draw();
}

// Dijkstra 单步执行
function stepDijkstra() {
    if (!algorithmState || algorithmState.type !== 'dijkstra') return;

    const { dist, prev, visited } = algorithmState;
    const n = nodes.length;

    // 找未访问且距离最小的节点
    let u = -1;
    let minD = Infinity;
    for (let i = 0; i < n; i++) {
        if (!visited[i] && dist[i] < minD) {
            minD = dist[i];
            u = i;
        }
    }

    if (u === -1) {
        updateStepInfo('算法完成！所有可达节点均已处理。');
        finishAlgorithm();
        return;
    }

    visited[u] = true;
    algorithmState.currentNode = u;
    algorithmState.currentStep++;

    // 松弛邻居
    const updates = [];
    edges.forEach(edge => {
        let v = -1;
        if (edge.from === u) v = edge.to;
        else if (edge.to === u) v = edge.from;

        if (v !== -1 && !visited[v]) {
            const newDist = dist[u] + edge.weight;
            if (newDist < dist[v]) {
                dist[v] = newDist;
                prev[v] = u;
                updates.push(`${nodes[v].label}(${newDist})`);
            }
        }
    });

    // 更新边的路径高亮
    edges.forEach(edge => {
        edge.inMST = (prev[edge.to] === edge.from || prev[edge.from] === edge.to) && 
                     (visited[edge.from] || visited[edge.to]);
    });

    const msg = updates.length > 0 
        ? `步骤 ${algorithmState.currentStep}：访问节点 ${nodes[u].label}（距离 ${minD}），更新邻居：${updates.join(', ')}`
        : `步骤 ${algorithmState.currentStep}：访问节点 ${nodes[u].label}（距离 ${minD}），无需更新`;

    updateStepInfo(msg);
    updateDijkstraTable();
    updateInfo();
    draw();

    // 检查是否完成
    const allVisited = visited.every(v => v) || visited.filter(v => v).length === n;
    if (allVisited) {
        setTimeout(() => {
            updateStepInfo('算法完成！所有节点的最短路径已计算。');
            finishAlgorithm();
        }, 100);
    }
}

// 更新 Dijkstra 表格
function updateDijkstraTable() {
    const tbody = document.querySelector('#dijkstraTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    nodes.forEach((node, i) => {
        const tr = document.createElement('tr');

        let distVal = '∞';
        let prevVal = '-';
        let status = '未访问';

        if (algorithmState && algorithmState.type === 'dijkstra') {
            distVal = algorithmState.dist[i] === Infinity ? '∞' : algorithmState.dist[i];
            prevVal = algorithmState.prev[i] === -1 ? '-' : nodes[algorithmState.prev[i]].label;
            if (algorithmState.visited[i]) {
                status = '已确定';
                tr.style.backgroundColor = 'rgba(17, 153, 142, 0.1)';
            } else if (algorithmState.dist[i] !== Infinity) {
                status = '待处理';
            }
            if (i === algorithmState.currentNode) {
                tr.style.backgroundColor = 'rgba(0, 180, 219, 0.2)';
            }
        } else if (dijkstraStartNode !== -1) {
            distVal = i === dijkstraStartNode ? 0 : '∞';
            status = i === dijkstraStartNode ? '起点' : '未访问';
        }

        tr.innerHTML = `
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${node.label}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${distVal}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${prevVal}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${status}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ==================== Prim 算法 ====================

// 运行 Prim 算法
function runPrim() {
    if (nodes.length === 0) {
        alert('请先添加节点！');
        return;
    }
    
    if (edges.length === 0) {
        alert('请先添加边！');
        return;
    }
    
    isRunning = true;
    
    // 重置所有边的状态
    edges.forEach(e => e.inMST = false);
    
    // 初始化算法状态
    algorithmState = {
        type: 'prim',
        visited: new Set([0]), // 从第一个节点开始
        mstEdges: [],
        candidateEdges: [],
        currentStep: 0,
        totalWeight: 0
    };
    
    // 启用单步执行按钮
    document.getElementById('prim-step').disabled = false;
    document.getElementById('prim-run').disabled = true;
    
    // 显示步骤信息
    updateStepInfo('Prim 算法开始，从节点 A 开始');
    
    draw();
}

// Prim 单步执行
function stepPrim() {
    if (!algorithmState || algorithmState.type !== 'prim') return;
    
    const { visited, mstEdges } = algorithmState;
    
    // 如果所有节点都访问过，算法结束
    if (visited.size === nodes.length) {
        finishAlgorithm();
        return;
    }
    
    // 找出所有候选边（一端在 MST 中，另一端不在）
    let candidateEdges = [];
    for (let edge of edges) {
        const fromInMST = visited.has(edge.from);
        const toInMST = visited.has(edge.to);
        
        if (fromInMST && !toInMST) {
            candidateEdges.push({ ...edge, newNode: edge.to });
        } else if (!fromInMST && toInMST) {
            candidateEdges.push({ ...edge, newNode: edge.from });
        }
    }
    
    // 选择权重最小的边
    if (candidateEdges.length === 0) {
        updateStepInfo('图不连通，算法无法继续');
        finishAlgorithm();
        return;
    }
    
    candidateEdges.sort((a, b) => a.weight - b.weight);
    const minEdge = candidateEdges[0];
    
    // 将新节点加入 MST
    visited.add(minEdge.newNode);
    mstEdges.push(minEdge);
    algorithmState.totalWeight += minEdge.weight;
    
    // 更新边的状态
    const edgeIndex = edges.findIndex(e => 
        (e.from === minEdge.from && e.to === minEdge.to) ||
        (e.from === minEdge.to && e.to === minEdge.from)
    );
    if (edgeIndex !== -1) {
        edges[edgeIndex].inMST = true;
    }
    
    algorithmState.currentStep++;
    
    const newNodeLabel = nodes[minEdge.newNode].label;
    updateStepInfo(`步骤 ${algorithmState.currentStep}：添加边 (权重 ${minEdge.weight})，将节点 ${newNodeLabel} 加入 MST`);
    
    updateInfo();
    draw();
}

// 运行 Kruskal 算法
function runKruskal() {
    if (nodes.length === 0) {
        alert('请先添加节点！');
        return;
    }
    
    if (edges.length === 0) {
        alert('请先添加边！');
        return;
    }
    
    isRunning = true;
    
    // 重置所有边的状态
    edges.forEach(e => e.inMST = false);
    
    // 按权重排序边
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    
    // 初始化算法状态
    algorithmState = {
        type: 'kruskal',
        uf: new UnionFind(nodes.length),
        sortedEdges: sortedEdges,
        currentEdgeIndex: 0,
        mstEdges: [],
        currentStep: 0,
        totalWeight: 0
    };
    
    // 启用单步执行按钮
    document.getElementById('kruskal-step').disabled = false;
    document.getElementById('kruskal-run').disabled = true;
    
    // 显示步骤信息
    updateStepInfo('Kruskal 算法开始，按权重从小到大考虑每条边');
    
    draw();
}

// Kruskal 单步执行
function stepKruskal() {
    if (!algorithmState || algorithmState.type !== 'kruskal') return;
    
    const { uf, sortedEdges, currentEdgeIndex, mstEdges } = algorithmState;
    
    // 如果 MST 已经包含 n-1 条边，算法结束
    if (mstEdges.length === nodes.length - 1) {
        finishAlgorithm();
        return;
    }
    
    // 如果所有边都考虑过了
    if (currentEdgeIndex >= sortedEdges.length) {
        if (mstEdges.length < nodes.length - 1) {
            updateStepInfo('图不连通，无法形成最小生成树');
        }
        finishAlgorithm();
        return;
    }
    
    // 考虑当前边
    const edge = sortedEdges[currentEdgeIndex];
    const fromLabel = nodes[edge.from].label;
    const toLabel = nodes[edge.to].label;
    
    // 检查是否会形成环
    if (uf.find(edge.from) !== uf.find(edge.to)) {
        // 不会形成环，加入 MST
        uf.union(edge.from, edge.to);
        mstEdges.push(edge);
        algorithmState.totalWeight += edge.weight;
        
        // 更新边的状态
        const edgeIndex = edges.findIndex(e => 
            (e.from === edge.from && e.to === edge.to) ||
            (e.from === edge.to && e.to === edge.from)
        );
        if (edgeIndex !== -1) {
            edges[edgeIndex].inMST = true;
        }
        
        algorithmState.currentStep++;
        updateStepInfo(`步骤 ${algorithmState.currentStep}：添加边 ${fromLabel}-${toLabel} (权重 ${edge.weight})`);
    } else {
        // 会形成环，跳过
        updateStepInfo(`跳过边 ${fromLabel}-${toLabel} (权重 ${edge.weight})，会形成环`);
    }
    
    algorithmState.currentEdgeIndex++;
    
    updateInfo();
    draw();
}

// 完成算法
function finishAlgorithm() {
    isRunning = false;
    
    const prefix = currentAlgorithm;
    const stepBtn = document.getElementById(`${prefix}-step`);
    const runBtn = document.getElementById(`${prefix}-run`);
    
    if (stepBtn) stepBtn.disabled = true;
    if (runBtn) runBtn.disabled = false;
    
    if (algorithmState && algorithmState.type === 'aoe') {
        if (algorithmState.projectDuration !== null) {
            const list = algorithmState.criticalEdges && algorithmState.criticalEdges.length
                ? algorithmState.criticalEdges.join(', ')
                : '无';
            updateStepInfo(`算法完成！工程总工期：${algorithmState.projectDuration}<br>关键活动：${list}`);
        }
        return;
    }

    if (algorithmState && algorithmState.mstEdges && algorithmState.mstEdges.length === nodes.length - 1) {
        updateStepInfo(`算法完成！最小生成树权重和：${algorithmState.totalWeight}`);
    }
}

// 重置算法
function resetAlgorithm() {
    isRunning = false;
    algorithmState = null;
    
    // 重置所有边的状态
    edges.forEach(e => e.inMST = false);
    
    // 重置按钮状态
    const prefix = currentAlgorithm;
    const stepBtn = document.getElementById(`${prefix}-step`);
    const runBtn = document.getElementById(`${prefix}-run`);
    
    if (stepBtn) stepBtn.disabled = true;
    if (runBtn) runBtn.disabled = false;
    
    // 隐藏步骤信息
    const stepInfo = document.getElementById(`${prefix}-step-info`);
    if (stepInfo) stepInfo.style.display = 'none';
    
    updateInfo();
    draw();
}

// 更新信息面板
function updateInfo() {
    const prefix = currentAlgorithm;
    
    const nodeCountEl = document.getElementById(`${prefix}-node-count`);
    const edgeCountEl = document.getElementById(`${prefix}-edge-count`);
    if (nodeCountEl) nodeCountEl.textContent = nodes.length;
    if (edgeCountEl) edgeCountEl.textContent = edges.length;
    
    if (prefix === 'topo') {
        if (algorithmState && algorithmState.result) {
            const resultLabels = algorithmState.result.map(i => nodes[i].label).join(' → ');
            document.getElementById('topo-result').textContent = resultLabels || '-';
        } else {
            document.getElementById('topo-result').textContent = '-';
        }
    } else if (prefix === 'aoe') {
        const durationEl = document.getElementById('aoe-project-duration');
        const criticalEl = document.getElementById('aoe-critical-activities');

        if (algorithmState && algorithmState.type === 'aoe') {
            durationEl.textContent = algorithmState.projectDuration ?? '-';
            if (algorithmState.criticalEdges && algorithmState.criticalEdges.length) {
                criticalEl.textContent = algorithmState.criticalEdges.join(', ');
            } else {
                criticalEl.textContent = '-';
            }
        } else {
            durationEl.textContent = '-';
            criticalEl.textContent = '-';
        }
    } else if (prefix === 'dijkstra') {
        const startNodeEl = document.getElementById('dijkstra-start-node');
        if (startNodeEl) {
            startNodeEl.textContent = dijkstraStartNode !== -1 ? nodes[dijkstraStartNode].label : '未设置';
        }
    } else {
        const weightEl = document.getElementById(`${prefix}-total-weight`);
        if (weightEl) {
            if (algorithmState) {
                weightEl.textContent = algorithmState.totalWeight;
            } else {
                weightEl.textContent = '-';
            }
        }
    }
}

// 更新步骤信息
function updateStepInfo(message) {
    const prefix = currentAlgorithm;
    const stepInfoDiv = document.getElementById(`${prefix}-step-info`);
    if (stepInfoDiv) {
        stepInfoDiv.style.display = 'block';
        stepInfoDiv.innerHTML = message;
    } else {
        console.error(`找不到元素: ${prefix}-step-info`);
    }
}

// 绘制图形
function draw() {
    let activeCanvas, activeCtx;

    if (currentAlgorithm === 'prim') {
        activeCanvas = canvas;
        activeCtx = ctx;
    } else if (currentAlgorithm === 'kruskal') {
        activeCanvas = canvas2;
        activeCtx = ctx2;
    } else if (currentAlgorithm === 'topo') {
        activeCanvas = canvas3;
        activeCtx = ctx3;
    } else if (currentAlgorithm === 'aoe') {
        activeCanvas = canvas4;
        activeCtx = ctx4;
    } else if (currentAlgorithm === 'dijkstra') {
        activeCanvas = canvas5;
        activeCtx = ctx5;
    }

    if (!activeCanvas || !activeCtx) return;
    
    // 清空画布
    activeCtx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);;
    
    // 绘制边
    for (let edge of edges) {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];
        
        if (currentAlgorithm === 'topo' || currentAlgorithm === 'aoe') {
            drawDirectedEdge(activeCtx, fromNode, toNode, edge.inMST, edge.weight);
        } else {
            drawEdge(activeCtx, fromNode, toNode, edge.weight, edge.inMST);
        }
    }
    
    // 绘制临时边（添加边模式）
    if (currentMode === 'addEdge' && selectedNode !== null && tempEdgeEnd !== null) {
        activeCtx.beginPath();
        activeCtx.moveTo(selectedNode.x, selectedNode.y);
        activeCtx.lineTo(tempEdgeEnd.x, tempEdgeEnd.y);
        activeCtx.strokeStyle = '#999';
        activeCtx.lineWidth = 2;
        activeCtx.setLineDash([5, 5]);
        activeCtx.stroke();
        activeCtx.setLineDash([]);
    }
    
    // 绘制节点
    for (let node of nodes) {
        let isProcessed = false;
        if (algorithmState) {
            if (algorithmState.type === 'prim') {
                isProcessed = algorithmState.visited.has(node.id);
            } else if (algorithmState.type === 'topo') {
                isProcessed = algorithmState.processed.has(node.id);
            } else if (algorithmState.type === 'aoe') {
                isProcessed = algorithmState.processed.has(node.id);
            } else if (algorithmState.type === 'dijkstra') {
                isProcessed = algorithmState.visited[node.id];
            }
        }
        
        const isSelected = selectedNode && selectedNode.id === node.id;
        const isDijkstraStart = (currentAlgorithm === 'dijkstra' && dijkstraStartNode === node.id);
        const isDijkstraCurrent = (currentAlgorithm === 'dijkstra' && algorithmState && algorithmState.currentNode === node.id);
        drawNode(activeCtx, node, isSelected, isProcessed, isDijkstraStart, isDijkstraCurrent);
    }
}

// 绘制节点
function drawNode(context, node, isSelected, isProcessed, isDijkstraStart = false, isDijkstraCurrent = false) {
    // 绘制圆形
    context.beginPath();
    context.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
    
    if (isDijkstraCurrent) {
        context.fillStyle = NODE_DIJKSTRA_CURRENT_COLOR;
    } else if (isDijkstraStart) {
        context.fillStyle = NODE_DIJKSTRA_START_COLOR;
    } else if (isProcessed) {
        if (currentAlgorithm === 'topo') {
            context.fillStyle = NODE_TOPO_PROCESSED_COLOR;
        } else if (currentAlgorithm === 'dijkstra') {
            context.fillStyle = NODE_IN_MST_COLOR;
        } else {
            context.fillStyle = NODE_IN_MST_COLOR;
        }
    } else if (isSelected) {
        context.fillStyle = NODE_SELECTED_COLOR;
    } else {
        context.fillStyle = NODE_COLOR;
    }
    
    context.fill();
    context.strokeStyle = 'white';
    context.lineWidth = 3;
    context.stroke();
    
    // 绘制标签
    context.fillStyle = 'white';
    context.font = 'bold 18px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(node.label, node.x, node.y);
}

// 绘制边
function drawEdge(context, fromNode, toNode, weight, inMST) {
    // 计算边的起点和终点（在节点圆的边缘）
    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
    const startX = fromNode.x + NODE_RADIUS * Math.cos(angle);
    const startY = fromNode.y + NODE_RADIUS * Math.sin(angle);
    const endX = toNode.x - NODE_RADIUS * Math.cos(angle);
    const endY = toNode.y - NODE_RADIUS * Math.sin(angle);
    
    // 绘制线
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    
    if (inMST) {
        context.strokeStyle = EDGE_IN_MST_COLOR;
        context.lineWidth = EDGE_IN_MST_WIDTH;
    } else {
        context.strokeStyle = EDGE_COLOR;
        context.lineWidth = EDGE_WIDTH;
    }
    
    context.stroke();
    
    // 绘制权重
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    
    // 权重背景
    context.fillStyle = 'white';
    context.beginPath();
    context.arc(midX, midY, 15, 0, 2 * Math.PI);
    context.fill();
    context.strokeStyle = inMST ? EDGE_IN_MST_COLOR : EDGE_COLOR;
    context.lineWidth = 2;
    context.stroke();
    
    // 权重文字
    context.fillStyle = inMST ? EDGE_IN_MST_COLOR : '#333';
    context.font = 'bold 14px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(weight, midX, midY);
}

// 绘制有向边（用于拓扑排序）
function drawDirectedEdge(context, fromNode, toNode, isCritical, weight) {
    // 计算边的起点和终点（在节点圆的边缘）
    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
    const startX = fromNode.x + NODE_RADIUS * Math.cos(angle);
    const startY = fromNode.y + NODE_RADIUS * Math.sin(angle);
    const endX = toNode.x - NODE_RADIUS * Math.cos(angle);
    const endY = toNode.y - NODE_RADIUS * Math.sin(angle);
    
    // 确定线条样式
    let lineColor = EDGE_COLOR;
    let lineWidth = EDGE_WIDTH;
    
    if (isCritical) {
        lineColor = EDGE_TOPO_PROCESSED_COLOR;
        lineWidth = EDGE_IN_MST_WIDTH;
    }
    
    // 绘制线
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.strokeStyle = lineColor;
    context.lineWidth = lineWidth;
    context.stroke();
    
    // 绘制箭头
    const arrowLength = 12;
    const arrowAngle = Math.PI / 6;
    
    const arrow1X = endX - arrowLength * Math.cos(angle - arrowAngle);
    const arrow1Y = endY - arrowLength * Math.sin(angle - arrowAngle);
    const arrow2X = endX - arrowLength * Math.cos(angle + arrowAngle);
    const arrow2Y = endY - arrowLength * Math.sin(angle + arrowAngle);
    
    context.beginPath();
    context.moveTo(endX, endY);
    context.lineTo(arrow1X, arrow1Y);
    context.moveTo(endX, endY);
    context.lineTo(arrow2X, arrow2Y);
    context.strokeStyle = lineColor;
    context.lineWidth = isCritical ? 3 : 2;
    context.stroke();
    
    // 显示权重
    if (weight > 0) {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        
        const offsetDistance = 15;
        const perpAngle = angle + Math.PI / 2;
        const textX = midX + offsetDistance * Math.cos(perpAngle);
        const textY = midY + offsetDistance * Math.sin(perpAngle);
        
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const weightText = weight.toString();
        const textWidth = context.measureText(weightText).width;
        
        context.fillStyle = 'white';
        context.fillRect(textX - textWidth / 2 - 3, textY - 8, textWidth + 6, 16);
        
        context.fillStyle = isCritical ? EDGE_TOPO_PROCESSED_COLOR : '#666';
        context.fillText(weightText, textX, textY);
    }
}
