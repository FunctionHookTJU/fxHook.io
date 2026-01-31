// 日记API配置
// 根据环境自动选择 API 地址
function getApiBaseUrl() {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // 本地开发环境
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // 如果是 8080 端口（Docker Nginx），使用相对路径
    if (port === '8080') {
      return '/api';
    }
    // 其他情况直接访问后端
    return 'http://localhost:3000/api';
  }
  
  // 生产环境：优先使用相对路径（通过 Nginx 反向代理）
  return '/api';
}

const API_BASE_URL = getApiBaseUrl();

// 备用 API 地址（如果主地址失败）
const API_FALLBACK_URL = window.location.protocol + '//' + window.location.hostname + ':3000/api';

console.log('API_BASE_URL:', API_BASE_URL);
console.log('API_FALLBACK_URL:', API_FALLBACK_URL);

// 带重试的 fetch 函数
async function fetchWithFallback(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok && response.status === 0) {
      throw new Error('Network error');
    }
    return response;
  } catch (error) {
    // 如果主 URL 失败，尝试备用 URL
    if (url.startsWith(API_BASE_URL) && API_BASE_URL !== API_FALLBACK_URL) {
      console.log('尝试备用 API 地址...');
      const fallbackUrl = url.replace(API_BASE_URL, API_FALLBACK_URL);
      return fetch(fallbackUrl, options);
    }
    throw error;
  }
}

// API请求封装
const DiaryAPI = {
  // 获取日记列表
  async getDiaries(page = 1, limit = 6) {
    try {
      const response = await fetchWithFallback(`${API_BASE_URL}/diaries?page=${page}&limit=${limit}`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || '获取日记失败');
      }
      return data.data;
    } catch (error) {
      console.error('获取日记失败:', error);
      throw error;
    }
  },

  // 获取单条日记
  async getDiary(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/diaries/${id}`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || '获取日记失败');
      }
      return data.data;
    } catch (error) {
      console.error('获取日记失败:', error);
      throw error;
    }
  },

  // 创建日记
  async createDiary(diaryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/diaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diaryData)
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || '创建日记失败');
      }
      return data.data;
    } catch (error) {
      console.error('创建日记失败:', error);
      throw error;
    }
  },

  // 更新日记
  async updateDiary(id, diaryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/diaries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diaryData)
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || '更新日记失败');
      }
      return data.data;
    } catch (error) {
      console.error('更新日记失败:', error);
      throw error;
    }
  },

  // 删除日记
  async deleteDiary(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/diaries/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || '删除日记失败');
      }
      return data;
    } catch (error) {
      console.error('删除日记失败:', error);
      throw error;
    }
  },

  // 管理员登录
  async login(password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || '登录失败');
      }
      // 保存token
      localStorage.setItem('admin_token', data.token);
      return data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 检查是否已登录
  isLoggedIn() {
    return !!localStorage.getItem('admin_token');
  },

  // 退出登录
  logout() {
    localStorage.removeItem('admin_token');
  },

  // 获取token
  getToken() {
    return localStorage.getItem('admin_token');
  }
};

// 日期格式化函数
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = weekdays[d.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
}

// 渲染日记列表
function renderDiaries(diaries) {
  const container = document.getElementById('diary-entries');
  if (!container) return;

  if (diaries.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666;">暂无日记</p>';
    return;
  }

  container.innerHTML = diaries.map(diary => `
    <div class="diary-entry" data-id="${diary._id}">
      <div class="entry-date">${formatDate(diary.date)}</div>
      <div class="entry-content">
        ${diary.content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
        ${diary.images && diary.images.length > 0 ? `
          <div class="small-image-grid">
            ${diary.images.map(img => `
              <div class="small-image-card">
                <img src="${img}" alt="日记图片">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// 更新分页信息
function updatePagination(pagination) {
  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');

  if (pageInfo) {
    pageInfo.textContent = `第 ${pagination.page} 页 / 共 ${pagination.totalPages} 页`;
  }

  if (prevBtn) {
    prevBtn.disabled = pagination.page === 1;
  }

  if (nextBtn) {
    nextBtn.disabled = pagination.page >= pagination.totalPages;
  }
}

// 加载日记
async function loadDiaries(page = 1) {
  try {
    const data = await DiaryAPI.getDiaries(page, 6);
    renderDiaries(data.diaries);
    updatePagination(data.pagination);
    
    // 保存当前页码
    window.currentDiaryPage = page;
  } catch (error) {
    console.error('加载日记失败:', error);
    const container = document.getElementById('diary-entries');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <p style="color: #e74c3c;">加载日记失败，请检查后端服务是否运行</p>
          <p style="color: #666; font-size: 14px;">${error.message}</p>
        </div>
      `;
    }
  }
}
