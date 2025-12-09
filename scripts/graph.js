// 图算法可视化 - Prim、Kruskal、拓扑排序和 AOE 关键路径算法实现

// 全局状态
let currentAlgorithm = 'prim'; // 当前算法: 'prim', 'kruskal', 'topo' 或 'aoe'
let currentMode = 'addNode'; // 当前模式: 'addNode', 'addEdge', 'delete'
let nodes = []; // 节点数组
let edges = []; // 边数组
let selectedNode = null; // 选中的第一个节点（用于添加边）
let tempEdgeEnd = null; // 临时边的终点（鼠标位置）
let isRunning = false; // 算法是否正在运行
let algorithmState = null; // 算法执行状态

// 画布相关
let canvas, ctx;
let canvas2, ctx2; // Kruskal 的画布
let canvas3, ctx3; // 拓扑排序的画布
let canvas4, ctx4; // AOE 的画布

// 节点和边的样式配置
const NODE_RADIUS = 25;
const NODE_COLOR = '#667eea';
const NODE_SELECTED_COLOR = '#764ba2';
const NODE_IN_MST_COLOR = '#11998e';
const NODE_TOPO_PROCESSED_COLOR = '#ff6b6b';
const NODE_AOE_CRITICAL_COLOR = '#764ba2';
const EDGE_COLOR = '#999';
const EDGE_IN_MST_COLOR = '#11998e';
const EDGE_TOPO_PROCESSED_COLOR = '#ff6b6b';
const EDGE_AOE_CRITICAL_COLOR = '#764ba2';
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
    
    // 绑定事件
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas2.addEventListener('click', handleCanvasClick);
    canvas2.addEventListener('mousemove', handleCanvasMouseMove);
    canvas3.addEventListener('click', handleCanvasClick);
    canvas3.addEventListener('mousemove', handleCanvasMouseMove);
    canvas4.addEventListener('click', handleCanvasClick);
    canvas4.addEventListener('mousemove', handleCanvasMouseMove);
    
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
    const toolId = (prefix === 'topo' || prefix === 'aoe') ? `${prefix}Tool` : `${prefix}Tool`;
    document.querySelectorAll(`#${toolId} .control-btn`).forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (mode === 'addNode') {
        document.getElementById(`${prefix}-add-node`).classList.add('active');
    } else if (mode === 'addEdge') {
        document.getElementById(`${prefix}-add-edge`).classList.add('active');
    } else if (mode === 'delete') {
        document.getElementById(`${prefix}-delete`).classList.add('active');
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
            // 对于拓扑排序和 AOE，边是有向的，不需要检查反向边
            if (currentAlgorithm === 'topo' || currentAlgorithm === 'aoe') {
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
                
                // AOE 需要权重，拓扑排序不需要
                if (currentAlgorithm === 'aoe') {
                    showWeightModal(selectedNode, clickedNode);
                } else {
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
                }
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
function showWeightModal(fromNode, toNode) {
    document.getElementById('modalOverlay').classList.add('show');
    document.getElementById('weightModal').classList.add('show');
    document.getElementById('weightInput').value = '';
    document.getElementById('weightInput').focus();
    
    // 保存临时数据
    window.tempEdgeData = { from: fromNode, to: toNode };
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
    
    const { from, to } = window.tempEdgeData;
    
    edges.push({
        from: from.id,
        to: to.id,
        weight: weight,
        inMST: false
    });
    
    closeWeightModal();
    updateInfo();
    draw();
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
        
        // 重置所有算法的按钮状态
        resetAllButtons();
        
        updateInfo();
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
    
    // 隐藏所有步骤信息
    const stepInfos = ['prim-step-info', 'kruskal-step-info', 'topo-step-info', 'aoe-step-info'];
    stepInfos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
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

// 加载 AOE 示例图
function loadAOEExample() {
    if (isRunning) return;
    
    nodes = [
        { id: 0, x: 100, y: 300, label: 'V0' },
        { id: 1, x: 250, y: 150, label: 'V1' },
        { id: 2, x: 250, y: 450, label: 'V2' },
        { id: 3, x: 450, y: 150, label: 'V3' },
        { id: 4, x: 450, y: 300, label: 'V4' },
        { id: 5, x: 450, y: 450, label: 'V5' },
        { id: 6, x: 650, y: 300, label: 'V6' },
        { id: 7, x: 800, y: 300, label: 'V7' }
    ];
    
    edges = [
        { from: 0, to: 1, weight: 3, inMST: false, directed: true },
        { from: 0, to: 2, weight: 4, inMST: false, directed: true },
        { from: 1, to: 3, weight: 5, inMST: false, directed: true },
        { from: 1, to: 4, weight: 6, inMST: false, directed: true },
        { from: 2, to: 4, weight: 7, inMST: false, directed: true },
        { from: 2, to: 5, weight: 8, inMST: false, directed: true },
        { from: 3, to: 6, weight: 3, inMST: false, directed: true },
        { from: 4, to: 6, weight: 2, inMST: false, directed: true },
        { from: 5, to: 6, weight: 4, inMST: false, directed: true },
        { from: 6, to: 7, weight: 5, inMST: false, directed: true }
    ];
    
    selectedNode = null;
    tempEdgeEnd = null;
    algorithmState = null;
    
    // 重置AOE按钮状态
    const aoeRun = document.getElementById('aoe-run');
    const aoeStep = document.getElementById('aoe-step');
    if (aoeRun) aoeRun.disabled = false;
    if (aoeStep) aoeStep.disabled = true;
    const aoeStepInfo = document.getElementById('aoe-step-info');
    if (aoeStepInfo) aoeStepInfo.style.display = 'none';
    
    updateInfo();
    draw();
}

// 运行 AOE 关键路径算法（初始化）
function runAOE() {
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
    
    // 计算入度
    const inDegree = new Array(nodes.length).fill(0);
    for (let edge of edges) {
        inDegree[edge.to]++;
    }
    
    // 拓扑排序
    const ve = new Array(nodes.length).fill(0);
    const queue = [];
    const topoOrder = [];
    const tempInDegree = [...inDegree];
    
    for (let i = 0; i < nodes.length; i++) {
        if (tempInDegree[i] === 0) {
            queue.push(i);
        }
    }
    
    while (queue.length > 0) {
        const u = queue.shift();
        topoOrder.push(u);
        
        for (let edge of edges) {
            if (edge.from === u) {
                ve[edge.to] = Math.max(ve[edge.to], ve[u] + edge.weight);
                tempInDegree[edge.to]--;
                if (tempInDegree[edge.to] === 0) {
                    queue.push(edge.to);
                }
            }
        }
    }
    
    // 检查是否有环
    if (topoOrder.length !== nodes.length) {
        alert('图中存在环路，无法计算关键路径！');
        isRunning = false;
        return;
    }
    
    // 计算 vl（最晚发生时间）
    const criticalLength = ve[topoOrder[topoOrder.length - 1]];
    const vl = new Array(nodes.length).fill(criticalLength);
    
    for (let i = topoOrder.length - 1; i >= 0; i--) {
        const u = topoOrder[i];
        for (let edge of edges) {
            if (edge.from === u) {
                vl[u] = Math.min(vl[u], vl[edge.to] - edge.weight);
            }
        }
    }
    
    // 预计算所有边的 e 和 l 值
    const edgeAnalysis = edges.map((edge, index) => {
        const e = ve[edge.from];  // 最早开始时间
        const l = vl[edge.to] - edge.weight;  // 最晚开始时间
        const slack = l - e;  // 松弛时间
        const isCritical = (slack === 0);
        return { index, edge, e, l, slack, isCritical };
    });
    
    // 保存算法状态
    algorithmState = {
        type: 'aoe',
        ve: ve,
        vl: vl,
        topoOrder: topoOrder,
        edgeAnalysis: edgeAnalysis,
        currentEdgeIndex: 0,
        criticalLength: criticalLength,
        criticalCount: 0
    };
    
    // 更新按钮状态
    const runBtn = document.getElementById('aoe-run');
    const stepBtn = document.getElementById('aoe-step');
    if (runBtn) runBtn.disabled = true;
    if (stepBtn) stepBtn.disabled = false;
    
    // 显示初始化信息
    const stepInfoDiv = document.getElementById('aoe-step-info');
    if (stepInfoDiv) {
        stepInfoDiv.style.display = 'block';
        stepInfoDiv.innerHTML = 
            'AOE网络初始化完成！<br>' +
            've[] = [' + ve.join(', ') + ']<br>' +
            'vl[] = [' + vl.join(', ') + ']<br>' +
            '关键路径长度: ' + criticalLength + '<br>' +
            '点击"单步执行"逐条分析活动';
    }
    
    updateInfo();
    draw();
}

// AOE 单步执行
function stepAOE() {
    if (!algorithmState || algorithmState.type !== 'aoe') {
        console.error('AOE 状态无效');
        return;
    }
    
    const edgeAnalysis = algorithmState.edgeAnalysis;
    const currentIdx = algorithmState.currentEdgeIndex;
    const vl = algorithmState.vl;
    
    if (currentIdx >= edgeAnalysis.length) {
        finishAOE();
        return;
    }
    
    const analysis = edgeAnalysis[currentIdx];
    const edge = analysis.edge;
    const fromLabel = nodes[edge.from].label;
    const toLabel = nodes[edge.to].label;
    
    // 构建信息
    let info = '活动 ' + fromLabel + '→' + toLabel + ' (持续时间: ' + edge.weight + ')<br>';
    info += 'e(最早开始) = ve[' + fromLabel + '] = ' + analysis.e + '<br>';
    info += 'l(最晚开始) = vl[' + toLabel + '] - ' + edge.weight + ' = ' + vl[edge.to] + ' - ' + edge.weight + ' = ' + analysis.l + '<br>';
    info += '松弛时间 = l - e = ' + analysis.slack + '<br>';
    
    if (analysis.isCritical) {
        edge.inMST = true;
        algorithmState.criticalCount++;
        info += '<strong style="color: #764ba2;">★ 这是关键活动！</strong>';
    } else {
        info += '非关键活动，有 ' + analysis.slack + ' 个时间单位的余量';
    }
    
    // 显示信息
    const stepInfoDiv = document.getElementById('aoe-step-info');
    if (stepInfoDiv) {
        stepInfoDiv.style.display = 'block';
        stepInfoDiv.innerHTML = info;
    }
    
    algorithmState.currentEdgeIndex++;
    
    updateInfo();
    draw();
    
    // 检查是否完成
    if (algorithmState.currentEdgeIndex >= edgeAnalysis.length) {
        finishAOE();
    }
}

// AOE 算法完成
function finishAOE() {
    isRunning = false;
    
    const stepBtn = document.getElementById('aoe-step');
    const runBtn = document.getElementById('aoe-run');
    if (stepBtn) stepBtn.disabled = true;
    if (runBtn) runBtn.disabled = false;
    
    // 找出所有关键活动
    const criticalList = algorithmState.edgeAnalysis
        .filter(a => a.isCritical)
        .map(a => nodes[a.edge.from].label + '→' + nodes[a.edge.to].label + '(' + a.edge.weight + ')')
        .join(' → ');
    
    const info = 
        '<strong>算法完成！</strong><br>' +
        '关键路径长度: ' + algorithmState.criticalLength + '<br>' +
        '关键活动数: ' + algorithmState.criticalCount + '<br>' +
        '关键路径: ' + criticalList;
    
    const stepInfoDiv = document.getElementById('aoe-step-info');
    if (stepInfoDiv) {
        stepInfoDiv.style.display = 'block';
        stepInfoDiv.innerHTML = info;
    }
    
    updateInfo();
}

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
    
    document.getElementById(`${prefix}-node-count`).textContent = nodes.length;
    document.getElementById(`${prefix}-edge-count`).textContent = edges.length;
    
    if (prefix === 'topo') {
        if (algorithmState && algorithmState.result) {
            const resultLabels = algorithmState.result.map(i => nodes[i].label).join(' → ');
            document.getElementById('topo-result').textContent = resultLabels || '-';
        } else {
            document.getElementById('topo-result').textContent = '-';
        }
    } else if (prefix === 'aoe') {
        if (algorithmState) {
            document.getElementById('aoe-critical-length').textContent = algorithmState.criticalLength;
            document.getElementById('aoe-critical-count').textContent = algorithmState.criticalEdges.length;
        } else {
            document.getElementById('aoe-critical-length').textContent = '-';
            document.getElementById('aoe-critical-count').textContent = '-';
        }
    } else {
        if (algorithmState) {
            document.getElementById(`${prefix}-total-weight`).textContent = algorithmState.totalWeight;
        } else {
            document.getElementById(`${prefix}-total-weight`).textContent = '-';
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
    } else {
        activeCanvas = canvas4;
        activeCtx = ctx4;
    }
    
    // 清空画布
    activeCtx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
    
    // 绘制边
    for (let edge of edges) {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];
        
        if (currentAlgorithm === 'topo' || currentAlgorithm === 'aoe') {
            drawDirectedEdge(activeCtx, fromNode, toNode, edge.inMST, edge.weight, currentAlgorithm === 'aoe');
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
            }
        }
        
        const isSelected = selectedNode && selectedNode.id === node.id;
        drawNode(activeCtx, node, isSelected, isProcessed);
    }
}

// 绘制节点
function drawNode(context, node, isSelected, isProcessed) {
    // 绘制圆形
    context.beginPath();
    context.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
    
    if (isProcessed) {
        if (currentAlgorithm === 'topo') {
            context.fillStyle = NODE_TOPO_PROCESSED_COLOR;
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
function drawDirectedEdge(context, fromNode, toNode, isProcessed, weight = 0, isAOE = false) {
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
    
    if (isAOE && isProcessed) {
        // AOE关键路径
        context.strokeStyle = EDGE_AOE_CRITICAL_COLOR;
        context.lineWidth = EDGE_IN_MST_WIDTH;
    } else if (!isAOE && isProcessed) {
        // 拓扑排序已处理
        context.strokeStyle = EDGE_TOPO_PROCESSED_COLOR;
        context.lineWidth = EDGE_IN_MST_WIDTH;
    } else {
        context.strokeStyle = EDGE_COLOR;
        context.lineWidth = EDGE_WIDTH;
    }
    
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
    
    if (isAOE && isProcessed) {
        context.strokeStyle = EDGE_AOE_CRITICAL_COLOR;
        context.lineWidth = 3;
    } else if (!isAOE && isProcessed) {
        context.strokeStyle = EDGE_TOPO_PROCESSED_COLOR;
        context.lineWidth = 3;
    } else {
        context.strokeStyle = EDGE_COLOR;
        context.lineWidth = 2;
    }
    
    context.stroke();
    
    // AOE显示权重（活动持续时间）
    if (isAOE && weight > 0) {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        
        // 计算权重文本的偏移位置（垂直于边的方向）
        const offsetDistance = 15;
        const perpAngle = angle + Math.PI / 2;
        const textX = midX + offsetDistance * Math.cos(perpAngle);
        const textY = midY + offsetDistance * Math.sin(perpAngle);
        
        // 绘制权重背景
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const weightText = weight.toString();
        const textWidth = context.measureText(weightText).width;
        
        context.fillStyle = 'white';
        context.fillRect(textX - textWidth / 2 - 3, textY - 8, textWidth + 6, 16);
        
        // 绘制权重文本
        if (isProcessed) {
            context.fillStyle = EDGE_AOE_CRITICAL_COLOR;
        } else {
            context.fillStyle = '#666';
        }
        context.fillText(weightText, textX, textY);
    }
}
