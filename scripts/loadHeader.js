// 动态加载header组件
// 添加标志变量防止重复加载
let headerLoaded = false;

async function loadHeader() {
    // 如果已经加载过header，则不再执行
    if (headerLoaded) {
        console.log('Header已加载，跳过重复加载');
        return;
    }
    
    try {
        console.log('开始加载header...');
        // 检测当前文件所在的位置，确定路径前缀
        const isInSubfolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/docs/');
        const pathPrefix = isInSubfolder ? '../' : '';
        
        console.log('当前路径前缀:', pathPrefix);
        console.log('Header路径:', `${pathPrefix}components/header.html`);
        
        const response = await fetch(`${pathPrefix}components/header.html`);
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status}`);
        }
        const html = await response.text();
        
        console.log('获取到header内容');
        
        // 查找header占位符并插入内容
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            console.log('找到header占位符，插入内容');
            headerPlaceholder.innerHTML = html;
        } else {
            console.log('未找到header占位符，使用备用方式插入');
            // 如果没有找到占位符，则回退到原来的方式
            const headerContainer = document.createElement('div');
            headerContainer.innerHTML = html;
            if (document.body.firstChild) {
                document.body.insertBefore(headerContainer.firstElementChild, document.body.firstChild);
            } else {
                document.body.appendChild(headerContainer.firstElementChild);
            }
        }
        
        // 设置标志为已加载
        headerLoaded = true;
        console.log('Header加载成功');
        
        // 动态调整导航链接路径
        if (isInSubfolder) {
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                // 只处理相对路径，跳过绝对路径和锚点
                if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('#')) {
                    link.setAttribute('href', `../${href}`);
                }
            });
        }
        
        // 高亮当前页面的导航项
        highlightCurrentPage();
        
        // 加载音频播放器
        await loadAudioPlayer(pathPrefix);
        
        // 触发 header 加载完成事件
        window.dispatchEvent(new Event('headerLoaded'));
        
    } catch (error) {
        console.error('加载header失败:', error);
        headerLoaded = false; // 加载失败时重置标志，允许重试
    }
}

// 高亮当前页面的导航项
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath || 
            (link.getAttribute('href') === 'index.html' && currentPath === '/')) {
            link.style.fontWeight = 'bold';
            link.style.color = '#fff';
            link.style.textDecoration = 'underline';
        }
    });
}

// 加载音频播放器
async function loadAudioPlayer(pathPrefix) {
    // 检查是否已经加载过音频播放器
    if (window.audioPlayer) {
        // 如果已经加载过，只需要更新 UI
        if (window.audioPlayer.setupEventListeners) {
            window.audioPlayer.setupEventListeners();
        }
        return;
    }
    
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `${pathPrefix}scripts/audioPlayer.js`;
        script.defer = true;
        script.onload = resolve;
        document.head.appendChild(script);
    });
}

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', loadHeader);
