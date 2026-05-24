// 决策树数据结构
const decisionTree = {
    nodeType: 'root',
    feature: 'hasHouse',
    question: '是否有房产？',
    branches: {
        'true': {
            nodeType: 'leaf',
            result: '批准贷款',
            resultType: 'approved'
        },
        'false': {
            nodeType: 'internal',
            feature: 'hasCar',
            question: '是否有车辆？',
            branches: {
                'true': {
                    nodeType: 'leaf',
                    result: '批准贷款',
                    resultType: 'approved'
                },
                'false': {
                    nodeType: 'internal',
                    feature: 'income',
                    question: '年收入是否大于30万？',
                    branches: {
                        'true': {
                            nodeType: 'leaf',
                            result: '批准贷款',
                            resultType: 'approved'
                        },
                        'false': {
                            nodeType: 'internal',
                            feature: 'credit',
                            question: '信用评分如何？',
                            branches: {
                                'excellent': {
                                    nodeType: 'leaf',
                                    result: '批准贷款',
                                    resultType: 'approved'
                                },
                                'good': {
                                    nodeType: 'leaf',
                                    result: '批准贷款',
                                    resultType: 'approved'
                                },
                                'fair': {
                                    nodeType: 'leaf',
                                    result: '拒绝贷款',
                                    resultType: 'rejected'
                                },
                                'poor': {
                                    nodeType: 'leaf',
                                    result: '拒绝贷款',
                                    resultType: 'rejected'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

// 信息熵计算
function calculateEntropy(data) {
    const counts = {};
    data.forEach(item => {
        const label = item.label;
        counts[label] = (counts[label] || 0) + 1;
    });
    
    let entropy = 0;
    const total = data.length;
    for (const key in counts) {
        const probability = counts[key] / total;
        entropy -= probability * Math.log2(probability);
    }
    return entropy;
}

// 信息增益计算
function calculateInformationGain(data, feature) {
    const originalEntropy = calculateEntropy(data);
    
    const featureValues = {};
    data.forEach(item => {
        const value = item[feature];
        if (!featureValues[value]) {
            featureValues[value] = [];
        }
        featureValues[value].push(item);
    });
    
    let conditionalEntropy = 0;
    const total = data.length;
    for (const value in featureValues) {
        const subset = featureValues[value];
        conditionalEntropy += (subset.length / total) * calculateEntropy(subset);
    }
    
    return originalEntropy - conditionalEntropy;
}

// 基尼系数计算
function calculateGini(data) {
    const counts = {};
    data.forEach(item => {
        const label = item.label;
        counts[label] = (counts[label] || 0) + 1;
    });
    
    let gini = 1;
    const total = data.length;
    for (const key in counts) {
        const probability = counts[key] / total;
        gini -= probability * probability;
    }
    return gini;
}

// 遍历决策树进行预测
function predict(node, input, path = []) {
    if (node.nodeType === 'leaf') {
        return {
            result: node.result,
            resultType: node.resultType,
            path: path
        };
    }
    
    const featureValue = input[node.feature];
    let branchValue;
    
    if (node.feature === 'income') {
        branchValue = parseInt(featureValue) > 30 ? 'true' : 'false';
        path.push(`${node.question} ${branchValue === 'true' ? '是' : '否'}`);
    } else {
        branchValue = featureValue;
        path.push(`${node.question} ${featureValue === 'true' ? '是' : '否'}`);
    }
    
    if (node.feature === 'credit') {
        path.push(`${node.question} ${getCreditLabel(featureValue)}`);
    }
    
    return predict(node.branches[branchValue], input, path);
}

function getCreditLabel(value) {
    const labels = {
        'excellent': '优秀',
        'good': '良好',
        'fair': '一般',
        'poor': '较差'
    };
    return labels[value] || value;
}

// 绘制决策树
function drawTree(node, x, y, width, depth = 0) {
    const svg = document.getElementById('treeSvg');
    svg.innerHTML = '';
    
    const drawNode = (node, x, y, level = 0) => {
        const nodeWidth = 120;
        const nodeHeight = 40;
        const verticalGap = 80;
        const horizontalGap = 150;
        
        // 创建节点
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x - nodeWidth / 2);
        rect.setAttribute('y', y - nodeHeight / 2);
        rect.setAttribute('width', nodeWidth);
        rect.setAttribute('height', nodeHeight);
        rect.setAttribute('rx', 8);
        rect.setAttribute('ry', 8);
        
        if (node.nodeType === 'leaf') {
            rect.setAttribute('fill', node.resultType === 'approved' ? '#8BC34A' : '#F44336');
        } else {
            rect.setAttribute('fill', '#4CAF50');
        }
        svg.appendChild(rect);
        
        // 创建文本
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '12px');
        text.setAttribute('font-weight', 'bold');
        
        const displayText = node.nodeType === 'leaf' ? node.result : node.question;
        text.textContent = displayText.length > 12 ? displayText.substring(0, 12) + '...' : displayText;
        svg.appendChild(text);
        
        // 绘制分支
        if (node.nodeType !== 'leaf') {
            const branchKeys = Object.keys(node.branches);
            const numBranches = branchKeys.length;
            const startX = x - (numBranches - 1) * horizontalGap / 2;
            
            branchKeys.forEach((key, index) => {
                const childX = startX + index * horizontalGap;
                const childY = y + verticalGap;
                
                // 绘制连接线
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x);
                line.setAttribute('y1', y + nodeHeight / 2);
                line.setAttribute('x2', childX);
                line.setAttribute('y2', childY - nodeHeight / 2);
                line.setAttribute('stroke', '#333');
                line.setAttribute('stroke-width', '2');
                svg.appendChild(line);
                
                // 分支标签
                const labelY = y + verticalGap / 2;
                const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                labelText.setAttribute('x', (x + childX) / 2);
                labelText.setAttribute('y', labelY);
                labelText.setAttribute('text-anchor', 'middle');
                labelText.setAttribute('fill', '#666');
                labelText.setAttribute('font-size', '12px');
                
                let label = key;
                if (key === 'true') label = '是';
                else if (key === 'false') label = '否';
                else if (key === 'excellent') label = '优秀';
                else if (key === 'good') label = '良好';
                else if (key === 'fair') label = '一般';
                else if (key === 'poor') label = '较差';
                
                labelText.textContent = label;
                svg.appendChild(labelText);
                
                // 递归绘制子节点
                drawNode(node.branches[key], childX, childY, level + 1);
            });
        }
    };
    
    drawNode(node, 250, 40, 0);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 绘制初始决策树
    drawTree(decisionTree, 250, 40, 500);
    
    // 收入滑块事件
    const incomeSlider = document.getElementById('income');
    const incomeValue = document.getElementById('incomeValue');
    incomeSlider.addEventListener('input', (e) => {
        incomeValue.textContent = e.target.value;
    });
    
    // 提交按钮事件
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('click', () => {
        const input = {
            hasHouse: document.getElementById('hasHouse').value,
            hasCar: document.getElementById('hasCar').value,
            income: document.getElementById('income').value,
            credit: document.getElementById('credit').value
        };
        
        const result = predict(decisionTree, input, []);
        
        // 显示结果
        const resultDiv = document.getElementById('result');
        resultDiv.textContent = result.result;
        resultDiv.className = `result ${result.resultType}`;
        
        // 显示决策路径
        const pathDiv = document.getElementById('decisionPath');
        pathDiv.innerHTML = '<strong>决策路径：</strong><br>' + result.path.join(' → ');
        
        // 高亮决策路径（简化版：重新绘制树）
        drawTree(decisionTree, 250, 40, 500);
    });
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});