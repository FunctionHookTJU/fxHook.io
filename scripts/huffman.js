// ==================== 霍夫曼节点类 ====================
class HuffmanNode {
    constructor(char, freq) {
        this.char = char;       // 字符（叶节点）
        this.freq = freq;       // 频率
        this.left = null;       // 左子树
        this.right = null;      // 右子树
        this.code = '';         // 编码
    }
    
    isLeaf() {
        return this.left === null && this.right === null;
    }
}

// ==================== 全局变量 ====================
let inputString = '';
let freqMap = new Map();
let nodeQueue = [];
let buildSteps = [];
let currentStep = 0;
let huffmanTree = null;
let codeMap = new Map();
let huffmanMode = 'string';  // 'string' 或 'weights'
let weightsArray = [];       // 权值数组

// ==================== 主要函数 ====================

// 模式切换
function switchMode(mode) {
    huffmanMode = mode;
    const stringGroup = document.getElementById('stringInputGroup') || document.getElementById('huffmanStringInputGroup');
    const weightsGroup = document.getElementById('weightsInputGroup') || document.getElementById('huffmanWeightsInputGroup');
    const stringExamples = document.getElementById('stringExamples') || document.getElementById('huffmanStringExamples');
    const weightsExamples = document.getElementById('weightsExamples') || document.getElementById('huffmanWeightsExamples');
    
    if (mode === 'string') {
        stringGroup.style.display = 'block';
        weightsGroup.style.display = 'none';
        stringExamples.style.display = 'block';
        weightsExamples.style.display = 'none';
    } else {
        stringGroup.style.display = 'none';
        weightsGroup.style.display = 'block';
        stringExamples.style.display = 'none';
        weightsExamples.style.display = 'block';
    }
    saveToLocalStorage();
    resetAll();
}

// 设置示例
function setExample(text) {
    document.getElementById('inputString').value = text;
}

// 设置权值示例
function setWeightsExample(text) {
    document.getElementById('inputWeights').value = text;
}

// 显示错误
function showError(msg) {
    const errorEl = document.getElementById('errorMsg') || document.getElementById('huffmanErrorMsg');
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.add('show');
    }
}

// 隐藏错误
function hideError() {
    const errorEl = document.getElementById('errorMsg') || document.getElementById('huffmanErrorMsg');
    if (errorEl) {
        errorEl.classList.remove('show');
    }
}

// 验证字符串输入
function validateInput(str) {
    if (!str) {
        showError('请输入字符串！');
        return false;
    }
    if (!/^[a-zA-Z]+$/.test(str)) {
        showError('请只输入字母（A-Z, a-z）！');
        return false;
    }
    if (str.length < 2) {
        showError('请至少输入2个字符！');
        return false;
    }
    hideError();
    return true;
}

// 验证权值输入
function validateWeights(str) {
    if (!str) {
        showError('请输入权值集合！');
        return false;
    }
    // 解析权值
    const parts = str.split(/[,，\s]+/).filter(s => s.trim() !== '');
    weightsArray = [];
    for (let part of parts) {
        const num = parseInt(part.trim());
        if (isNaN(num) || num <= 0) {
            showError('请输入有效的正整数权值！');
            return false;
        }
        weightsArray.push(num);
    }
    if (weightsArray.length < 2) {
        showError('请至少输入2个权值！');
        return false;
    }
    hideError();
    return true;
}

// 统计字符频率
function countFrequency(str) {
    freqMap.clear();
    for (let char of str.toUpperCase()) {
        freqMap.set(char, (freqMap.get(char) || 0) + 1);
    }
    return freqMap;
}

// 显示频率表格
function showFrequencyTable() {
    const section = document.getElementById('freqSection');
    section.style.display = 'block';

    const sorted = [...freqMap.entries()].sort((a, b) => b[1] - a[1]);
    
    let html = '<table class="freq-table">';
    html += '<tr><th>字符</th><th>出现次数</th><th>频率</th></tr>';
    
    const total = inputString.length;
    for (let [char, count] of sorted) {
        const percent = ((count / total) * 100).toFixed(1);
        html += `<tr><td><strong>${char}</strong></td><td>${count}</td><td>${percent}%</td></tr>`;
    }
    html += '</table>';
    
    document.getElementById('freqTable').innerHTML = html;
}

// 初始化节点队列
function initNodeQueue() {
    nodeQueue = [];
    for (let [char, freq] of freqMap) {
        nodeQueue.push(new HuffmanNode(char, freq));
    }
    // 按频率排序
    nodeQueue.sort((a, b) => a.freq - b.freq);
}

// 准备构建步骤
function prepareBuildSteps() {
    buildSteps = [];
    let queue = [...nodeQueue];
    let stepNum = 0;

    // 初始状态
    buildSteps.push({
        step: stepNum++,
        description: '初始化：创建所有叶节点',
        queue: queue.map(n => ({char: n.char, freq: n.freq, isLeaf: true})),
        merged: null
    });

    // 模拟合并过程
    while (queue.length > 1) {
        queue.sort((a, b) => a.freq - b.freq);
        const left = queue.shift();
        const right = queue.shift();
        
        const newNode = new HuffmanNode(null, left.freq + right.freq);
        newNode.left = left;
        newNode.right = right;
        
        queue.push(newNode);
        queue.sort((a, b) => a.freq - b.freq);

        buildSteps.push({
            step: stepNum++,
            description: `合并节点: ${left.char || '内部'} (${left.freq}) + ${right.char || '内部'} (${right.freq}) = 新节点 (${newNode.freq})`,
            queue: queue.map(n => ({char: n.char, freq: n.freq, isLeaf: n.isLeaf()})),
            merged: {left: left.char || `[${left.freq}]`, right: right.char || `[${right.freq}]`, result: newNode.freq}
        });
    }

    document.getElementById('totalSteps').textContent = buildSteps.length - 1;
}

// 实际构建霍夫曼树
function buildTree() {
    initNodeQueue();
    
    while (nodeQueue.length > 1) {
        nodeQueue.sort((a, b) => a.freq - b.freq);
        const left = nodeQueue.shift();
        const right = nodeQueue.shift();
        
        const newNode = new HuffmanNode(null, left.freq + right.freq);
        newNode.left = left;
        newNode.right = right;
        
        nodeQueue.push(newNode);
    }
    
    huffmanTree = nodeQueue[0];
    return huffmanTree;
}

// 生成编码
function generateCodes(node, code = '') {
    if (!node) return;
    
    if (node.isLeaf()) {
        node.code = code || '0'; // 单个字符情况
        codeMap.set(node.char, node.code);
    } else {
        generateCodes(node.left, code + '0');
        generateCodes(node.right, code + '1');
    }
}

// 一键生成
function buildHuffman() {
    if (huffmanMode === 'string') {
        buildHuffmanFromString();
    } else {
        buildHuffmanFromWeights();
    }
}

// 从字符串构建
function buildHuffmanFromString() {
    inputString = document.getElementById('inputString').value.trim();
    
    if (!validateInput(inputString)) return;
    
    inputString = inputString.toUpperCase();
    
    // 统计频率
    countFrequency(inputString);
    showFrequencyTable();
    
    // 初始化和准备
    initNodeQueue();
    prepareBuildSteps();
    
    // 构建树
    buildTree();
    
    // 生成编码
    codeMap.clear();
    generateCodes(huffmanTree);
    
    // 显示所有区域
    document.getElementById('processSection').style.display = 'block';
    document.getElementById('treeSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'block';
    
    // 显示最终步骤
    currentStep = buildSteps.length - 1;
    updateStepDisplay();
    showAllBuildLog();
    
    // 绘制树
    drawHuffmanTree();
    
    // 显示编码表和结果
    showCodeTable();
    showEncodedResult();
}

// 从权值构建
function buildHuffmanFromWeights() {
    const weightsInput = document.getElementById('inputWeights').value.trim();
    
    if (!validateWeights(weightsInput)) return;
    
    // 用权值初始化freqMap（使用数字标签）
    freqMap.clear();
    for (let i = 0; i < weightsArray.length; i++) {
        freqMap.set(`W${i+1}`, weightsArray[i]);
    }
    
    // 显示权值表
    showWeightsTable();
    
    // 初始化和准备
    initNodeQueueFromWeights();
    prepareBuildSteps();
    
    // 构建树
    buildTreeFromWeights();
    
    // 生成编码
    codeMap.clear();
    generateCodes(huffmanTree);
    
    // 显示所有区域
    document.getElementById('processSection').style.display = 'block';
    document.getElementById('treeSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'block';
    
    // 显示最终步骤
    currentStep = buildSteps.length - 1;
    updateStepDisplay();
    showAllBuildLog();
    
    // 绘制树
    drawHuffmanTree();
    
    // 显示WPL结果
    showWPLResult();
}

// 显示权值表格
function showWeightsTable() {
    const section = document.getElementById('freqSection');
    section.style.display = 'block';
    
    let html = '<table class="weight-table">';
    html += '<tr><th>节点</th><th>权值</th></tr>';
    
    for (let i = 0; i < weightsArray.length; i++) {
        html += `<tr><td><strong>W${i+1}</strong></td><td>${weightsArray[i]}</td></tr>`;
    }
    html += '</table>';
    
    document.getElementById('freqTable').innerHTML = html;
}

// 从权值初始化节点队列
function initNodeQueueFromWeights() {
    nodeQueue = [];
    for (let i = 0; i < weightsArray.length; i++) {
        const node = new HuffmanNode(`W${i+1}`, weightsArray[i]);
        node.weight = weightsArray[i];  // 保存原始权值
        nodeQueue.push(node);
    }
    nodeQueue.sort((a, b) => a.freq - b.freq);
}

// 从权值构建树
function buildTreeFromWeights() {
    initNodeQueueFromWeights();
    
    while (nodeQueue.length > 1) {
        nodeQueue.sort((a, b) => a.freq - b.freq);
        const left = nodeQueue.shift();
        const right = nodeQueue.shift();
        
        const newNode = new HuffmanNode(null, left.freq + right.freq);
        newNode.left = left;
        newNode.right = right;
        
        nodeQueue.push(newNode);
    }
    
    huffmanTree = nodeQueue[0];
    return huffmanTree;
}

// 计算并显示WPL
function showWPLResult() {
    // 计算WPL
    let wpl = 0;
    let formulaParts = [];
    
    function calculateWPL(node, depth) {
        if (!node) return;
        if (node.isLeaf()) {
            wpl += node.freq * depth;
            formulaParts.push(`${node.freq}×${depth}`);
        } else {
            calculateWPL(node.left, depth + 1);
            calculateWPL(node.right, depth + 1);
        }
    }
    
    calculateWPL(huffmanTree, 0);
    
    // 显示结果
    let html = '<h2>📋 带权路径长度 (WPL)</h2>';
    
    // 编码表
    html += '<table class="code-table">';
    html += '<tr><th>节点</th><th>权值</th><th>路径长度</th><th>编码</th><th>权值×路径长度</th></tr>';
    
    const sorted = [...codeMap.entries()].sort((a, b) => a[1].length - b[1].length);
    for (let [label, code] of sorted) {
        const weight = freqMap.get(label);
        const pathLen = code.length;
        html += `<tr>
            <td><strong>${label}</strong></td>
            <td>${weight}</td>
            <td>${pathLen}</td>
            <td class="code">${code}</td>
            <td>${weight} × ${pathLen} = ${weight * pathLen}</td>
        </tr>`;
    }
    html += '</table>';
    
    // WPL结果卡片
    html += `
        <div class="wpl-result">
            <h4>🎯 带权路径长度 WPL</h4>
            <div class="wpl-value">${wpl}</div>
            <div class="wpl-formula">
                WPL = ${formulaParts.join(' + ')} = ${wpl}
            </div>
        </div>
    `;
    
    document.getElementById('codeTable').innerHTML = html;
    
    // 隐藏字符串编码结果区
    document.querySelector('.encoded-result').style.display = 'none';
}

// 单步构建
function buildStep() {
    if (huffmanMode === 'string') {
        buildStepString();
    } else {
        buildStepWeights();
    }
}

function buildStepString() {
    inputString = document.getElementById('inputString').value.trim();
    
    if (!validateInput(inputString)) return;
    
    inputString = inputString.toUpperCase();
    
    // 首次点击，初始化
    if (currentStep === 0 || !buildSteps.length) {
        countFrequency(inputString);
        showFrequencyTable();
        initNodeQueue();
        prepareBuildSteps();
        
        document.getElementById('processSection').style.display = 'block';
        document.getElementById('treeSection').style.display = 'block';
        
        currentStep = 0;
    }
    
    // 执行下一步
    if (currentStep < buildSteps.length) {
        updateStepDisplay();
        addBuildLogEntry(buildSteps[currentStep]);
        drawStepTree(currentStep);
        currentStep++;
        
        // 如果完成了
        if (currentStep >= buildSteps.length) {
            buildTree();
            codeMap.clear();
            generateCodes(huffmanTree);
            
            document.getElementById('resultSection').style.display = 'block';
            showCodeTable();
            showEncodedResult();
            drawHuffmanTree();
        }
    }
}

function buildStepWeights() {
    const weightsInput = document.getElementById('inputWeights').value.trim();
    
    if (!validateWeights(weightsInput)) return;
    
    // 首次点击，初始化
    if (currentStep === 0 || !buildSteps.length) {
        freqMap.clear();
        for (let i = 0; i < weightsArray.length; i++) {
            freqMap.set(`W${i+1}`, weightsArray[i]);
        }
        showWeightsTable();
        initNodeQueueFromWeights();
        prepareBuildSteps();
        
        document.getElementById('processSection').style.display = 'block';
        document.getElementById('treeSection').style.display = 'block';
        
        currentStep = 0;
    }
    
    // 执行下一步
    if (currentStep < buildSteps.length) {
        updateStepDisplay();
        addBuildLogEntry(buildSteps[currentStep]);
        drawStepTree(currentStep);
        currentStep++;
        
        // 如果完成了
        if (currentStep >= buildSteps.length) {
            buildTreeFromWeights();
            codeMap.clear();
            generateCodes(huffmanTree);
            
            document.getElementById('resultSection').style.display = 'block';
            showWPLResult();
            drawHuffmanTree();
        }
    }
}

// 更新步骤显示
function updateStepDisplay() {
    const step = buildSteps[currentStep];
    document.getElementById('stepCounter').textContent = currentStep;
    document.getElementById('stepDescription').textContent = step.description;
}

// 添加构建日志条目
function addBuildLogEntry(step) {
    const log = document.getElementById('buildLog');
    const entry = document.createElement('div');
    entry.className = 'build-step active';
    entry.textContent = `步骤 ${step.step}: ${step.description}`;
    log.appendChild(entry);
    
    // 滚动到底部
    log.scrollTop = log.scrollHeight;
    
    // 移除之前的active
    setTimeout(() => {
        entry.classList.remove('active');
    }, 500);
}

// 显示所有构建日志
function showAllBuildLog() {
    const log = document.getElementById('buildLog');
    log.innerHTML = '<h4>📝 构建日志</h4>';
    
    for (let step of buildSteps) {
        const entry = document.createElement('div');
        entry.className = 'build-step';
        entry.textContent = `步骤 ${step.step}: ${step.description}`;
        log.appendChild(entry);
    }
}

// ==================== 绘图函数 ====================

function drawHuffmanTree() {
    const svg = document.getElementById('huffmanCanvas');
    svg.innerHTML = '';
    
    if (!huffmanTree) return;
    
    // 计算树的尺寸
    const treeDepth = getTreeDepth(huffmanTree);
    const treeWidth = Math.pow(2, treeDepth) * 60;
    const treeHeight = treeDepth * 100 + 100;
    
    svg.setAttribute('width', Math.max(treeWidth, 800));
    svg.setAttribute('height', Math.max(treeHeight, 500));
    
    // 绘制树
    const startX = svg.getAttribute('width') / 2;
    const startY = 50;
    const levelGap = 80;
    
    drawNode(svg, huffmanTree, startX, startY, treeWidth / 4, levelGap, true);
}

function drawNode(svg, node, x, y, hOffset, vOffset, isRoot = false) {
    if (!node) return;
    
    const nodeRadius = 25;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // 绘制到子节点的边
    if (node.left) {
        const childX = x - hOffset;
        const childY = y + vOffset;
        drawEdge(svg, x, y + nodeRadius, childX, childY - nodeRadius, '0');
        drawNode(svg, node.left, childX, childY, hOffset / 2, vOffset, false);
    }
    
    if (node.right) {
        const childX = x + hOffset;
        const childY = y + vOffset;
        drawEdge(svg, x, y + nodeRadius, childX, childY - nodeRadius, '1');
        drawNode(svg, node.right, childX, childY, hOffset / 2, vOffset, false);
    }
    
    // 确定节点颜色
    let fillColor;
    if (isRoot) {
        fillColor = '#E91E63';
    } else if (node.isLeaf()) {
        fillColor = '#4CAF50';
    } else {
        fillColor = '#FF9800';
    }
    
    // 绘制节点圆
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', nodeRadius);
    circle.setAttribute('fill', fillColor);
    circle.setAttribute('stroke', '#333');
    circle.setAttribute('stroke-width', '2');
    g.appendChild(circle);
    
    // 节点文本
    if (node.isLeaf()) {
        // 叶节点显示字符
        const charText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        charText.setAttribute('x', x);
        charText.setAttribute('y', y - 3);
        charText.setAttribute('text-anchor', 'middle');
        charText.setAttribute('font-size', '16');
        charText.setAttribute('font-weight', 'bold');
        charText.setAttribute('fill', 'white');
        charText.textContent = node.char;
        g.appendChild(charText);
        
        // 频率
        const freqText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        freqText.setAttribute('x', x);
        freqText.setAttribute('y', y + 12);
        freqText.setAttribute('text-anchor', 'middle');
        freqText.setAttribute('font-size', '11');
        freqText.setAttribute('fill', 'white');
        freqText.textContent = `(${node.freq})`;
        g.appendChild(freqText);
    } else {
        // 内部节点显示频率
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', 'white');
        text.textContent = node.freq;
        g.appendChild(text);
    }
    
    svg.appendChild(g);
}

function drawEdge(svg, x1, y1, x2, y2, label) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // 边
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#666');
    line.setAttribute('stroke-width', '2');
    g.appendChild(line);
    
    // 边上的标签 (0 或 1)
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    labelBg.setAttribute('cx', midX);
    labelBg.setAttribute('cy', midY);
    labelBg.setAttribute('r', 12);
    labelBg.setAttribute('fill', 'white');
    labelBg.setAttribute('stroke', label === '0' ? '#E91E63' : '#2196F3');
    labelBg.setAttribute('stroke-width', '2');
    g.appendChild(labelBg);
    
    const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelText.setAttribute('x', midX);
    labelText.setAttribute('y', midY + 5);
    labelText.setAttribute('text-anchor', 'middle');
    labelText.setAttribute('font-size', '14');
    labelText.setAttribute('font-weight', 'bold');
    labelText.setAttribute('fill', label === '0' ? '#E91E63' : '#2196F3');
    labelText.textContent = label;
    g.appendChild(labelText);
    
    svg.appendChild(g);
}

function getTreeDepth(node) {
    if (!node) return 0;
    return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
}

// 绘制构建步骤的树
function drawStepTree(stepIndex) {
    const svg = document.getElementById('huffmanCanvas');
    svg.innerHTML = '';
    
    const step = buildSteps[stepIndex];
    if (!step) return;
    
    // 绘制当前队列中的节点
    const nodes = step.queue;
    const startX = 50;
    const y = 200;
    const gap = 100;
    
    nodes.forEach((node, index) => {
        const x = startX + index * gap;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // 节点
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 25);
        circle.setAttribute('fill', node.isLeaf ? '#4CAF50' : '#FF9800');
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '2');
        g.appendChild(circle);
        
        // 文本
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y - 3);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', node.char ? '16' : '14');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', 'white');
        text.textContent = node.char || node.freq;
        g.appendChild(text);
        
        if (node.char) {
            const freqText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            freqText.setAttribute('x', x);
            freqText.setAttribute('y', y + 12);
            freqText.setAttribute('text-anchor', 'middle');
            freqText.setAttribute('font-size', '11');
            freqText.setAttribute('fill', 'white');
            freqText.textContent = `(${node.freq})`;
            g.appendChild(freqText);
        }
        
        svg.appendChild(g);
    });
    
    // 标题
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', 400);
    title.setAttribute('y', 50);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', '18');
    title.setAttribute('font-weight', 'bold');
    title.setAttribute('fill', '#667eea');
    title.textContent = `步骤 ${stepIndex}: 当前队列 (${nodes.length} 个节点)`;
    svg.appendChild(title);
}

// 显示编码表
function showCodeTable() {
    const sorted = [...codeMap.entries()].sort((a, b) => a[1].length - b[1].length);
    
    let html = '<table class="code-table">';
    html += '<tr><th>字符</th><th>频率</th><th>霍夫曼编码</th><th>编码长度</th></tr>';
    
    for (let [char, code] of sorted) {
        const freq = freqMap.get(char);
        html += `<tr>
            <td><strong>${char}</strong></td>
            <td>${freq}</td>
            <td class="code">${code}</td>
            <td>${code.length} bit</td>
        </tr>`;
    }
    html += '</table>';
    
    document.getElementById('codeTable').innerHTML = html;
}

// 显示编码结果
function showEncodedResult() {
    // 编码整个字符串
    let encoded = '';
    for (let char of inputString) {
        encoded += codeMap.get(char);
    }
    
    // 统计
    const originalBits = inputString.length * 8; // ASCII 8位
    const encodedBits = encoded.length;
    const ratio = ((1 - encodedBits / originalBits) * 100).toFixed(1);
    
    // 平均编码长度
    let avgLength = 0;
    const total = inputString.length;
    for (let [char, code] of codeMap) {
        avgLength += (freqMap.get(char) / total) * code.length;
    }
    
    document.getElementById('stats').innerHTML = `
        <div class="stat-item">原文: <strong>${inputString.length}</strong> 字符</div>
        <div class="stat-item">原始: <strong>${originalBits}</strong> bits (ASCII)</div>
        <div class="stat-item">压缩后: <strong>${encodedBits}</strong> bits</div>
        <div class="stat-item">压缩率: <strong>${ratio}%</strong></div>
        <div class="stat-item">平均码长: <strong>${avgLength.toFixed(2)}</strong> bit/字符</div>
    `;
    
    // 编码字符串（分组显示）
    let formattedCode = '';
    for (let i = 0; i < inputString.length; i++) {
        const char = inputString[i];
        const code = codeMap.get(char);
        formattedCode += `<span title="${char}" style="color: ${getCharColor(i)};">${code}</span> `;
    }
    
    document.getElementById('encodedString').innerHTML = `
        <strong>原文:</strong> ${inputString}<br><br>
        <strong>编码:</strong> ${formattedCode}<br><br>
        <strong>连续编码:</strong> ${encoded}
    `;
}

function getCharColor(index) {
    const colors = ['#E91E63', '#9C27B0', '#3F51B5', '#2196F3', '#009688', '#4CAF50', '#FF9800', '#795548'];
    return colors[index % colors.length];
}

// 重置
function resetAll() {
    document.getElementById('inputString').value = '';
    document.getElementById('inputWeights').value = '';
    document.getElementById('freqSection').style.display = 'none';
    document.getElementById('processSection').style.display = 'none';
    document.getElementById('treeSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('buildLog').innerHTML = '<h4>📝 构建日志</h4>';
    document.getElementById('huffmanCanvas').innerHTML = '';
    
    // 恢复编码结果区显示
    const encodedResult = document.querySelector('.encoded-result');
    if (encodedResult) encodedResult.style.display = 'block';
    
    hideError();
    
    inputString = '';
    freqMap.clear();
    nodeQueue = [];
    buildSteps = [];
    currentStep = 0;
    huffmanTree = null;
    codeMap.clear();
    weightsArray = [];
}

// ==================== 本地存储 ====================
const STORAGE_KEY = 'huffman_inputs';

function saveToLocalStorage() {
    const data = {
        mode: huffmanMode,
        inputString: document.getElementById('inputString').value,
        inputWeights: document.getElementById('inputWeights').value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.inputString) document.getElementById('inputString').value = data.inputString;
            if (data.inputWeights) document.getElementById('inputWeights').value = data.inputWeights;
            if (data.mode) {
                switchMode(data.mode);
            }
        } catch (e) {
            console.error('加载保存数据失败:', e);
        }
    }
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    // 回车键触发
    document.getElementById('inputString').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buildHuffman();
        }
    });

    document.getElementById('inputWeights').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buildHuffman();
        }
    });

    // 输入时自动保存
    document.getElementById('inputString').addEventListener('input', saveToLocalStorage);
    document.getElementById('inputWeights').addEventListener('input', saveToLocalStorage);

    // 页面加载时恢复数据
    loadFromLocalStorage();
});
