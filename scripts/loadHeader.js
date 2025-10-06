// 动态加载header组件
async function loadHeader() {
    try {
        const response = await fetch('header.html');
        const html = await response.text();
        const headerContainer = document.createElement('div');
        headerContainer.innerHTML = html;
        
        // 将header添加到页面顶部
        document.body.insertBefore(headerContainer.firstElementChild, document.body.firstChild);
        
        // 高亮当前页面的导航项
        highlightCurrentPage();
        
        // 加载音频播放器
        loadAudioPlayer();
        
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
function loadAudioPlayer() {
    // 检查是否已经加载过音频播放器
    if (window.audioPlayer) {
        return;
    }
    
    const script = document.createElement('script');
    script.src = 'scripts/audioPlayer.js';
    script.defer = true;
    document.head.appendChild(script);
}

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', loadHeader);