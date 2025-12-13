/**
 * 统一Header组件 v1.0
 * 使用方法：在页面head中添加 <script src="[路径]/scripts/header.js" defer></script>
 * 脚本会自动检测页面位置并生成正确的链接路径
 */

(function() {
    'use strict';
    
    // 版本号 - 修改此值可强制刷新缓存
    const VERSION = '1.0.0';
    
    // 检测是否在子文件夹中
    const path = window.location.pathname;
    const isSubPage = path.includes('/pages/') || path.includes('/docs/');
    const prefix = isSubPage ? '../' : '';
    
    // 导航链接配置（便于维护）
    const navItems = [
        { text: '首页', href: 'index.html' },
        { text: '首页(测试)', href: 'pages/index_dev.html' },
        { text: '日记', href: 'pages/diary.html' },
        { text: '学习笔记', href: 'pages/study.html' },
        { text: 'Github', href: 'https://github.com/FunctionHookTJU', external: true },
        { text: '交流', href: 'pages/communicate.html' },
        { text: '图片墙', href: 'pages/picture.html' },
        { text: '新产品', href: 'pages/products.html' }
    ];
    
    // 生成导航链接HTML
    function generateNavLinks() {
        return navItems.map(item => {
            let href = item.href;
            // 处理相对路径
            if (!item.external && !href.startsWith('#')) {
                href = prefix + href;
            }
            const target = item.external ? ' target="_blank"' : '';
            const isActive = isCurrentPage(item.href);
            const activeClass = isActive ? ' class="active"' : '';
            return `<li><a href="${href}"${target}${activeClass}>${item.text}</a></li>`;
        }).join('\n                ');
    }
    
    // 检测是否为当前页面
    function isCurrentPage(href) {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop() || 'index.html';
        const hrefFile = href.split('/').pop();
        return currentFile === hrefFile;
    }
    
    // Header HTML模板
    const headerHTML = `
    <header>
        <nav>
            <div class="logo">宇佐见函钩</div>
            <ul class="nav-links">
                ${generateNavLinks()}
                <li id="mute-button-container">
                    <button id="mute-button" class="mute-btn" title="静音/取消静音">🔊</button>
                </li>
                <li id="toggle-audio-source-container">
                    <button id="toggle-audio-source" class="audio-source-btn" title="切换音频源">🎵1</button>
                </li>
            </ul>
            <div class="mobile-menu-btn" id="mobile-menu-btn">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </header>`;
    
    // 插入Header
    function insertHeader() {
        // 在body开头插入header
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
        
        // 高亮当前页面
        highlightCurrentPage();
        
        // 设置移动端菜单
        setupMobileMenu();
        
        // 加载音频播放器
        loadAudioPlayer();
        
        // 触发header加载完成事件
        window.dispatchEvent(new CustomEvent('headerLoaded', { detail: { version: VERSION } }));
    }
    
    // 高亮当前页面
    function highlightCurrentPage() {
        const links = document.querySelectorAll('.nav-links a.active');
        links.forEach(link => {
            link.style.fontWeight = 'bold';
            link.style.textDecoration = 'underline';
        });
    }
    
    // 移动端菜单
    function setupMobileMenu() {
        const btn = document.getElementById('mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (btn && navLinks) {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                navLinks.classList.toggle('mobile-open');
            });
            
            // 点击链接后关闭菜单
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    btn.classList.remove('active');
                    navLinks.classList.remove('mobile-open');
                });
            });
        }
    }
    
    // 加载音频播放器
    function loadAudioPlayer() {
        if (window.audioPlayer) {
            if (window.audioPlayer.setupEventListeners) {
                window.audioPlayer.setupEventListeners();
            }
            return;
        }
        
        const script = document.createElement('script');
        script.src = `${prefix}scripts/audioPlayer.js`;
        script.defer = true;
        document.head.appendChild(script);
    }
    
    // DOM加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', insertHeader);
    } else {
        insertHeader();
    }
})();
