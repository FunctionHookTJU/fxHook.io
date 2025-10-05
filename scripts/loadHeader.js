// 加载通用header的函数
function loadHeader() {
    fetch('header.html')
        .then(response => response.text())
        .then(html => {
            // 找到body的第一个子元素（应该是header或main）
            const body = document.querySelector('body');
            const firstChild = body.firstElementChild;
            
            // 创建一个临时容器来解析HTML
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;
            
            // 获取解析后的header元素
            const header = tempContainer.querySelector('header');
            
            // 如果body已经有header元素，替换它；否则在最前面添加
            if (firstChild && firstChild.tagName === 'HEADER') {
                body.replaceChild(header, firstChild);
            } else {
                body.insertBefore(header, firstChild);
            }
            
            // 可选：高亮当前页面的导航项
            highlightCurrentPage();
        })
        .catch(error => console.error('加载header失败:', error));
}

// 高亮当前页面导航项的函数
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        // 如果是首页，或者路径匹配
        if ((currentPath === '/' || currentPath.endsWith('index.html')) && linkPath.endsWith('index.html')) {
            link.style.fontWeight = 'bold';
            link.style.color = '#fff';
        } else if (currentPath.includes('study.html') && linkPath.includes('study.html')) {
            link.style.fontWeight = 'bold';
            link.style.color = '#fff';
        } else if (currentPath.includes('diary.html') && linkPath.includes('diary.html')) {
            link.style.fontWeight = 'bold';
            link.style.color = '#fff';
        }
    });
}

// 在页面加载完成后执行
window.addEventListener('DOMContentLoaded', loadHeader);