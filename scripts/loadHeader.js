// 动态加载header组件
// 添加标志变量防止重复加载
let headerLoaded = false;

async function loadHeader() {
    // 如果已经加载过header，则不再执行
    if (headerLoaded) {
        return;
    }
    
    try {
        // 检测当前文件所在的位置，确定路径前缀
        const isInSubfolder = window.location.pathname.includes('/md/');
        const pathPrefix = isInSubfolder ? '../' : '';
        
        const response = await fetch(`${pathPrefix}header.html`);
        const html = await response.text();
        
        // 查找header占位符并插入内容
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = html;
        } else {
            // 如果没有找到占位符，则回退到原来的方式
            const headerContainer = document.createElement('div');
            headerContainer.innerHTML = html;
            document.body.insertBefore(headerContainer.firstElementChild, document.body.firstChild);
        }
        
        // 设置标志为已加载
        headerLoaded = true;
        
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
