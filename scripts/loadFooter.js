// 动态加载footer组件
// 添加标志变量防止重复加载
let footerLoaded = false;

async function loadFooter() {
    // 如果已经加载过footer，则不再执行
    if (footerLoaded) {
        console.log('Footer已加载，跳过重复加载');
        return;
    }
    
    try {
        console.log('开始加载footer...');
        // 检测当前文件所在的位置，确定路径前缀
        const isInSubfolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/docs/');
        const pathPrefix = isInSubfolder ? '../' : '';
        
        console.log('当前路径前缀:', pathPrefix);
        console.log('Footer路径:', `${pathPrefix}components/footer.html`);
        
        const response = await fetch(`${pathPrefix}components/footer.html`);
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status}`);
        }
        const html = await response.text();
        
        console.log('获取到footer内容');
        
        // 查找footer占位符并插入内容
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            console.log('找到footer占位符，插入内容');
            footerPlaceholder.innerHTML = html;
        } else {
            console.log('未找到footer占位符，使用备用方式插入');
            // 如果没有找到占位符，则在body末尾添加
            const footerContainer = document.createElement('div');
            footerContainer.innerHTML = html;
            document.body.appendChild(footerContainer.firstElementChild);
        }
        
        // 设置标志为已加载
        footerLoaded = true;
        console.log('Footer加载成功');
        
        // 动态调整导航链接路径
        adjustFooterLinks(pathPrefix);
        
    } catch (error) {
        console.error('加载footer时出错:', error);
    }
}

// 调整footer中的链接路径
function adjustFooterLinks(pathPrefix) {
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    const links = footer.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href.startsWith('#') && pathPrefix) {
            // 如果在子文件夹中，需要添加返回主页的路径
            link.setAttribute('href', `${pathPrefix}index.html${href}`);
        }
    });
}

// 页面加载完成后自动加载footer
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
} else {
    loadFooter();
}
