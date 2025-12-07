// ==================== 节点类 ====================
class TreeNode {
    constructor(value) {
        this.value = value;
        this.children = [];  // 普通树的孩子们
    }
}

class BinaryTreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;   // 左孩子（第一个孩子）
        this.right = null;  // 右孩子（右兄弟）
    }
}

// ==================== 全局变量 ====================
let treeConvMode = 'tree';
let originalTree = null;
let convertedTree = null;
let forestTrees = [];

// ==================== 模式切换 ====================
function switchMode(mode) {
    treeConvMode = mode;
    
    // 更新模式按钮状态
    const container = document.querySelector('.tree-content') || document;
    container.querySelectorAll('.mode-option').forEach(opt => {
        opt.classList.remove('active');
        if (opt.querySelector(`input[value="${mode}"]`)) {
            opt.classList.add('active');
            opt.querySelector('input').checked = true;
        }
    });

    // 显示/隐藏对应输入框
    document.getElementById('treeInputGroup').style.display = mode === 'tree' ? 'block' : 'none';
    document.getElementById('forestInputGroup').style.display = mode === 'forest' ? 'block' : 'none';
    document.getElementById('binaryInputGroup').style.display = mode === 'binary' ? 'block' : 'none';

    // 显示/隐藏对应示例
    document.getElementById('treeExamples').style.display = mode === 'tree' ? 'block' : 'none';
    document.getElementById('forestExamples').style.display = mode === 'forest' ? 'block' : 'none';
    document.getElementById('binaryExamples').style.display = mode === 'binary' ? 'block' : 'none';

    saveToLocalStorage();
    resetAll();
}

// ==================== 示例设置 ====================
function setExample(mode, value) {
    if (mode === 'tree') {
        document.getElementById('treeInput').value = value;
    } else if (mode === 'forest') {
        document.getElementById('forestInput').value = value;
    } else {
        document.getElementById('binaryInput').value = value;
    }
}

// ==================== 错误处理 ====================
function showError(msg) {
    const el = document.getElementById('treeErrorMsg') || document.getElementById('errorMsg');
    if (el) {
        el.textContent = msg;
        el.classList.add('show');
    }
}

function hideError() {
    const el = document.getElementById('treeErrorMsg') || document.getElementById('errorMsg');
    if (el) {
        el.classList.remove('show');
    }
}

// ==================== 解析器 ====================

// 解析普通树: A(B(E,F),C,D(G))
function parseTree(str) {
    str = str.trim();
    if (!str) return null;

    let pos = 0;

    function parseNode() {
        let value = '';
        while (pos < str.length && /[a-zA-Z0-9]/.test(str[pos])) {
            value += str[pos++];
        }
        if (!value) return null;

        const node = new TreeNode(value);

        if (pos < str.length && str[pos] === '(') {
            pos++; // skip '('
            while (pos < str.length && str[pos] !== ')') {
                const child = parseNode();
                if (child) node.children.push(child);
                if (str[pos] === ',') pos++;
            }
            pos++; // skip ')'
        }
        return node;
    }

    return parseNode();
}

// 解析森林: A(B,C);D(E,F);G
function parseForest(str) {
    const parts = str.split(';').map(s => s.trim()).filter(s => s);
    return parts.map(part => parseTree(part)).filter(t => t);
}

// 解析二叉树: A(B(D,E),C(F,G))
function parseBinaryTree(str) {
    str = str.trim();
    if (!str) return null;

    let pos = 0;

    function parseNode() {
        // 跳过空格
        while (pos < str.length && str[pos] === ' ') pos++;
        
        // 空节点
        if (pos >= str.length || str[pos] === ',' || str[pos] === ')') {
            return null;
        }

        let value = '';
        while (pos < str.length && /[a-zA-Z0-9]/.test(str[pos])) {
            value += str[pos++];
        }
        if (!value) return null;

        const node = new BinaryTreeNode(value);

        if (pos < str.length && str[pos] === '(') {
            pos++; // skip '('
            node.left = parseNode();
            if (str[pos] === ',') pos++;
            node.right = parseNode();
            if (str[pos] === ')') pos++;
        }
        return node;
    }

    return parseNode();
}

// ==================== 转换算法 ====================

// 普通树 → 二叉树（左孩子右兄弟）
function treeToBinary(tree) {
    if (!tree) return null;

    const binaryNode = new BinaryTreeNode(tree.value);

    if (tree.children.length > 0) {
        // 第一个孩子变成左子树
        binaryNode.left = treeToBinary(tree.children[0]);

        // 其他孩子串成右链
        let current = binaryNode.left;
        for (let i = 1; i < tree.children.length; i++) {
            current.right = treeToBinary(tree.children[i]);
            current = current.right;
        }
    }

    return binaryNode;
}

// 森林 → 二叉树
function forestToBinary(trees) {
    if (!trees || trees.length === 0) return null;

    // 第一棵树转换为二叉树作为根
    const root = treeToBinary(trees[0]);

    // 其他树的根串成右链
    let current = root;
    for (let i = 1; i < trees.length; i++) {
        current.right = treeToBinary(trees[i]);
        current = current.right;
    }

    return root;
}

// 二叉树 → 普通树
function binaryToTree(binaryNode) {
    if (!binaryNode) return null;

    const node = new TreeNode(binaryNode.value);

    // 左子树是第一个孩子
    if (binaryNode.left) {
        node.children.push(binaryToTree(binaryNode.left));
        
        // 左孩子的右链都是兄弟，变成孩子
        let sibling = binaryNode.left.right;
        while (sibling) {
            node.children.push(binaryToTree(sibling));
            sibling = sibling.right;
        }
    }

    return node;
}

// 二叉树 → 森林
function binaryToForest(binaryNode) {
    const trees = [];
    let current = binaryNode;

    while (current) {
        // 断开右链
        const rightSibling = current.right;
        current.right = null;
        
        // 转换当前子树
        trees.push(binaryToTree(current));
        
        current = rightSibling;
    }

    return trees;
}

// ==================== 遍历 ====================

// 普通树先根遍历
function preorderTree(node) {
    if (!node) return [];
    let result = [node.value];
    for (let child of node.children) {
        result = result.concat(preorderTree(child));
    }
    return result;
}

// 普通树后根遍历
function postorderTree(node) {
    if (!node) return [];
    let result = [];
    for (let child of node.children) {
        result = result.concat(postorderTree(child));
    }
    result.push(node.value);
    return result;
}

// 二叉树先序遍历
function preorderBinary(node) {
    if (!node) return [];
    return [node.value].concat(preorderBinary(node.left), preorderBinary(node.right));
}

// 二叉树中序遍历
function inorderBinary(node) {
    if (!node) return [];
    return inorderBinary(node.left).concat([node.value], inorderBinary(node.right));
}

// ==================== 绘图 ====================

function drawTree(svg, tree, isOriginal = true) {
    svg.innerHTML = '';
    if (!tree) return;

    const nodeRadius = 22;
    const levelHeight = 70;
    const minNodeGap = 50;

    // 计算每个节点的位置
    function calculatePositions(node, depth = 0, positions = new Map()) {
        if (!node) return { width: 0, positions };

        if (node.children && node.children.length > 0) {
            // 普通树
            let totalWidth = 0;
            const childPositions = [];

            for (let child of node.children) {
                const result = calculatePositions(child, depth + 1, positions);
                childPositions.push({
                    width: Math.max(result.width, minNodeGap),
                    center: totalWidth + Math.max(result.width, minNodeGap) / 2
                });
                totalWidth += Math.max(result.width, minNodeGap);
            }

            const nodeX = totalWidth / 2;
            positions.set(node, { x: nodeX, y: depth * levelHeight + 40 });

            // 调整子节点位置
            let offset = 0;
            for (let i = 0; i < node.children.length; i++) {
                adjustPositions(node.children[i], offset, positions);
                offset += childPositions[i].width;
            }

            return { width: totalWidth, positions };
        } else if (node.left !== undefined) {
            // 二叉树
            const leftResult = calculatePositions(node.left, depth + 1, positions);
            const rightResult = calculatePositions(node.right, depth + 1, positions);

            const leftWidth = Math.max(leftResult.width, minNodeGap / 2);
            const rightWidth = Math.max(rightResult.width, minNodeGap / 2);
            const totalWidth = leftWidth + rightWidth;

            positions.set(node, { x: leftWidth, y: depth * levelHeight + 40 });

            adjustPositions(node.left, 0, positions);
            adjustPositions(node.right, leftWidth, positions);

            return { width: totalWidth, positions };
        } else {
            // 叶子节点
            positions.set(node, { x: minNodeGap / 2, y: depth * levelHeight + 40 });
            return { width: minNodeGap, positions };
        }
    }

    function adjustPositions(node, offsetX, positions) {
        if (!node) return;
        const pos = positions.get(node);
        if (pos) {
            pos.x += offsetX;
        }
        if (node.children) {
            for (let child of node.children) {
                adjustPositions(child, offsetX, positions);
            }
        }
        if (node.left !== undefined) {
            adjustPositions(node.left, offsetX, positions);
            adjustPositions(node.right, offsetX, positions);
        }
    }

    const result = calculatePositions(tree);
    const positions = result.positions;

    // 调整SVG大小
    const maxX = Math.max(...[...positions.values()].map(p => p.x)) + 50;
    const maxY = Math.max(...[...positions.values()].map(p => p.y)) + 50;
    svg.setAttribute('width', Math.max(maxX, 350));
    svg.setAttribute('height', Math.max(maxY, 300));

    // 绘制边
    function drawEdges(node, parentPos = null) {
        if (!node) return;
        const pos = positions.get(node);

        if (parentPos) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', parentPos.x);
            line.setAttribute('y1', parentPos.y + nodeRadius);
            line.setAttribute('x2', pos.x);
            line.setAttribute('y2', pos.y - nodeRadius);
            line.setAttribute('stroke', '#666');
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
        }

        if (node.children) {
            for (let child of node.children) {
                drawEdges(child, pos);
            }
        }
        if (node.left !== undefined) {
            drawEdges(node.left, pos);
            drawEdges(node.right, pos);
        }
    }

    drawEdges(tree);

    // 绘制节点
    function drawNodes(node, isRoot = true) {
        if (!node) return;
        const pos = positions.get(node);

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        circle.setAttribute('r', nodeRadius);
        circle.setAttribute('fill', isRoot ? '#E91E63' : (isOriginal ? '#4CAF50' : '#2196F3'));
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '2');
        g.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', pos.y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', 'white');
        text.textContent = node.value;
        g.appendChild(text);

        svg.appendChild(g);

        if (node.children) {
            for (let child of node.children) {
                drawNodes(child, false);
            }
        }
        if (node.left !== undefined) {
            drawNodes(node.left, false);
            drawNodes(node.right, false);
        }
    }

    drawNodes(tree);
}

// 绘制森林中的多棵树
function drawForestTrees(trees) {
    const container = document.getElementById('forestTreesGrid');
    container.innerHTML = '';

    trees.forEach((tree, index) => {
        const treePanel = document.createElement('div');
        treePanel.className = 'tree-panel';
        treePanel.style.cssText = 'min-width: 280px; flex: 1; max-width: 400px;';

        const header = document.createElement('div');
        header.className = 'tree-panel-header original';
        header.textContent = `第 ${index + 1} 棵树`;
        header.style.cssText = 'padding: 8px 15px; font-size: 14px;';

        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'canvas-container';
        canvasContainer.style.cssText = 'min-height: 200px; padding: 10px;';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '280');
        svg.setAttribute('height', '250');
        svg.id = `forestCanvas_${index}`;

        canvasContainer.appendChild(svg);
        treePanel.appendChild(header);
        treePanel.appendChild(canvasContainer);
        container.appendChild(treePanel);

        // 绘制这棵树
        drawTree(svg, tree, true);
    });
}

// ==================== 主要功能 ====================

function parseAndDraw() {
    hideError();
    let input, tree;

    try {
        if (treeConvMode === 'tree') {
            input = document.getElementById('treeInput').value.trim();
            if (!input) { showError('请输入树结构！'); return; }
            tree = parseTree(input);
            if (!tree) { showError('解析失败，请检查格式！'); return; }
            originalTree = tree;
            forestTrees = [tree];
        } else if (treeConvMode === 'forest') {
            input = document.getElementById('forestInput').value.trim();
            if (!input) { showError('请输入森林结构！'); return; }
            forestTrees = parseForest(input);
            if (forestTrees.length === 0) { showError('解析失败，请检查格式！'); return; }
            if (forestTrees.length > 10) {
                showError('森林最多支持10棵树！当前输入了 ' + forestTrees.length + ' 棵树。');
                forestTrees = forestTrees.slice(0, 10);
            }
            originalTree = forestTrees[0]; // 第一棵用于遍历对比
        } else {
            input = document.getElementById('binaryInput').value.trim();
            if (!input) { showError('请输入二叉树结构！'); return; }
            tree = parseBinaryTree(input);
            if (!tree) { showError('解析失败，请检查格式！'); return; }
            originalTree = tree;
        }

        // 显示可视化区域
        document.getElementById('visualSection').style.display = 'block';
        document.getElementById('convertedPanel').style.display = 'none';
        document.getElementById('convertArrow').style.display = 'none';
        document.getElementById('traversalSection').style.display = 'none';

        // 更新标题和显示
        if (treeConvMode === 'tree') {
            document.getElementById('originalHeader').textContent = '原始树';
            document.getElementById('forestTreesContainer').style.display = 'none';
            document.getElementById('originalPanel').style.display = 'block';
            drawTree(document.getElementById('originalCanvas'), originalTree, true);
        } else if (treeConvMode === 'forest') {
            // 森林模式：显示所有树
            document.getElementById('forestTreesContainer').style.display = 'block';
            document.getElementById('originalPanel').style.display = 'none';
            drawForestTrees(forestTrees);
        } else {
            document.getElementById('originalHeader').textContent = '原始二叉树';
            document.getElementById('forestTreesContainer').style.display = 'none';
            document.getElementById('originalPanel').style.display = 'block';
            drawTree(document.getElementById('originalCanvas'), originalTree, true);
        }

    } catch (e) {
        showError('解析错误: ' + e.message);
    }
}

function convert() {
    if (!originalTree && forestTrees.length === 0) {
        showError('请先解析树结构！');
        return;
    }

    try {
        if (treeConvMode === 'tree') {
            convertedTree = treeToBinary(originalTree);
            document.getElementById('convertedHeader').textContent = '转换后二叉树';
        } else if (treeConvMode === 'forest') {
            convertedTree = forestToBinary(forestTrees);
            document.getElementById('convertedHeader').textContent = '转换后二叉树';
        } else {
            // 二叉树转森林/树
            const forest = binaryToForest(parseBinaryTree(document.getElementById('binaryInput').value.trim()));
            convertedTree = forest[0];
            forestTrees = forest;
            document.getElementById('convertedHeader').textContent = forest.length > 1 ? '转换后森林（第一棵）' : '转换后树';
        }

        // 显示转换结果
        document.getElementById('convertedPanel').style.display = 'block';
        document.getElementById('convertArrow').style.display = 'flex';

        // 绘制转换后的树
        drawTree(document.getElementById('convertedCanvas'), convertedTree, treeConvMode === 'binary');

        // 显示遍历对比
        showTraversalComparison();

    } catch (e) {
        showError('转换错误: ' + e.message);
    }
}

function showTraversalComparison() {
    const section = document.getElementById('traversalSection');
    section.style.display = 'block';

    let html = '';

    if (treeConvMode === 'tree' || treeConvMode === 'forest') {
        const treePreorder = preorderTree(originalTree);
        const treePostorder = postorderTree(originalTree);
        const binaryPreorder = preorderBinary(convertedTree);
        const binaryInorder = inorderBinary(convertedTree);

        html = `
            <div class="traversal-item">
                <strong>树的先根遍历：</strong>${treePreorder.join(' → ')}
            </div>
            <div class="traversal-item">
                <strong>二叉树先序遍历：</strong>${binaryPreorder.join(' → ')}
            </div>
            <div class="traversal-item" style="background: #e8f5e9;">
                ✅ <strong>对应关系：</strong>树的先根遍历 = 二叉树的先序遍历
            </div>
            <div class="traversal-item">
                <strong>树的后根遍历：</strong>${treePostorder.join(' → ')}
            </div>
            <div class="traversal-item">
                <strong>二叉树中序遍历：</strong>${binaryInorder.join(' → ')}
            </div>
            <div class="traversal-item" style="background: #e8f5e9;">
                ✅ <strong>对应关系：</strong>树的后根遍历 = 二叉树的中序遍历
            </div>
        `;
    } else {
        const binaryPreorder = preorderBinary(originalTree);
        const binaryInorder = inorderBinary(originalTree);
        const treePreorder = preorderTree(convertedTree);
        const treePostorder = postorderTree(convertedTree);

        html = `
            <div class="traversal-item">
                <strong>二叉树先序遍历：</strong>${binaryPreorder.join(' → ')}
            </div>
            <div class="traversal-item">
                <strong>转换后树的先根遍历：</strong>${treePreorder.join(' → ')}
            </div>
            <div class="traversal-item">
                <strong>二叉树中序遍历：</strong>${binaryInorder.join(' → ')}
            </div>
            <div class="traversal-item">
                <strong>转换后树的后根遍历：</strong>${treePostorder.join(' → ')}
            </div>
        `;
    }

    document.getElementById('traversalResult').innerHTML = html;
}

function resetAll() {
    document.getElementById('treeInput').value = '';
    document.getElementById('forestInput').value = '';
    document.getElementById('binaryInput').value = '';
    document.getElementById('visualSection').style.display = 'none';
    document.getElementById('traversalSection').style.display = 'none';
    document.getElementById('originalCanvas').innerHTML = '';
    document.getElementById('convertedCanvas').innerHTML = '';
    document.getElementById('forestTreesGrid').innerHTML = '';
    document.getElementById('forestTreesContainer').style.display = 'none';
    document.getElementById('originalPanel').style.display = 'block';
    hideError();

    originalTree = null;
    convertedTree = null;
    forestTrees = [];
}

// ==================== 本地存储 ====================
const STORAGE_KEY = 'tree_conversion_inputs';

function saveToLocalStorage() {
    const data = {
        mode: treeConvMode,
        treeInput: document.getElementById('treeInput').value,
        forestInput: document.getElementById('forestInput').value,
        binaryInput: document.getElementById('binaryInput').value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.treeInput) document.getElementById('treeInput').value = data.treeInput;
            if (data.forestInput) document.getElementById('forestInput').value = data.forestInput;
            if (data.binaryInput) document.getElementById('binaryInput').value = data.binaryInput;
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
    ['treeInput', 'forestInput', 'binaryInput'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                parseAndDraw();
            }
        });
        // 输入时自动保存
        document.getElementById(id).addEventListener('input', saveToLocalStorage);
    });

    // 页面加载时恢复数据
    loadFromLocalStorage();
});
