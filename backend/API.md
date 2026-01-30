# fxHook.io 日记系统 API文档

## 基础信息

- **Base URL**: `http://localhost:3000/api` (开发环境)
- **生产环境**: `https://your-domain/api`
- **Content-Type**: `application/json`

## 认证

部分API需要JWT认证。需要在请求头中添加：

```
Authorization: Bearer <your_jwt_token>
```

---

## API接口列表

### 1. 健康检查

**GET** `/api/health`

检查API服务是否正常运行

**响应示例:**
```json
{
  "success": true,
  "message": "API服务运行正常",
  "timestamp": "2026-01-30T12:00:00.000Z"
}
```

---

### 2. 管理员登录

**POST** `/api/auth/login`

**请求体:**
```json
{
  "password": "admin123456"
}
```

**响应示例:**
```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. 获取日记列表

**GET** `/api/diaries`

**查询参数:**
- `page` (number, 可选): 页码，默认1
- `limit` (number, 可选): 每页数量，默认10

**示例请求:**
```
GET /api/diaries?page=1&limit=10
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "diaries": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "date": "2026-01-21T00:00:00.000Z",
        "title": "",
        "content": "今天终于把前几门恶心的课给考完了...",
        "images": [],
        "createdAt": "2026-01-30T10:00:00.000Z",
        "updatedAt": "2026-01-30T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

---

### 4. 获取单条日记

**GET** `/api/diaries/:id`

**路径参数:**
- `id`: 日记ID

**示例请求:**
```
GET /api/diaries/65a1b2c3d4e5f6g7h8i9j0k1
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "date": "2026-01-21T00:00:00.000Z",
    "title": "",
    "content": "今天终于把前几门恶心的课给考完了...",
    "images": [],
    "createdAt": "2026-01-30T10:00:00.000Z",
    "updatedAt": "2026-01-30T10:00:00.000Z"
  }
}
```

---

### 5. 创建日记

**POST** `/api/diaries`

**请求体:**
```json
{
  "date": "2026-01-30T00:00:00.000Z",
  "title": "今天的心情",
  "content": "今天天气真好...",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

**字段说明:**
- `date` (string, 必填): ISO 8601日期格式
- `title` (string, 可选): 日记标题
- `content` (string, 必填): 日记内容
- `images` (array, 可选): 图片URL数组

**响应示例:**
```json
{
  "success": true,
  "message": "日记创建成功",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "date": "2026-01-30T00:00:00.000Z",
    "title": "今天的心情",
    "content": "今天天气真好...",
    "images": ["https://example.com/image1.jpg"],
    "createdAt": "2026-01-30T10:00:00.000Z",
    "updatedAt": "2026-01-30T10:00:00.000Z"
  }
}
```

**错误响应:**
```json
{
  "success": false,
  "errors": [
    {
      "msg": "日期格式不正确",
      "param": "date",
      "location": "body"
    }
  ]
}
```

---

### 6. 更新日记

**PUT** `/api/diaries/:id`

**路径参数:**
- `id`: 日记ID

**请求体:**
```json
{
  "date": "2026-01-30T00:00:00.000Z",
  "title": "修改后的标题",
  "content": "修改后的内容...",
  "images": ["https://example.com/new-image.jpg"]
}
```

**字段说明:**
所有字段都是可选的，只更新提供的字段

**响应示例:**
```json
{
  "success": true,
  "message": "日记更新成功",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "date": "2026-01-30T00:00:00.000Z",
    "title": "修改后的标题",
    "content": "修改后的内容...",
    "images": ["https://example.com/new-image.jpg"],
    "createdAt": "2026-01-30T10:00:00.000Z",
    "updatedAt": "2026-01-30T12:00:00.000Z"
  }
}
```

---

### 7. 删除日记

**DELETE** `/api/diaries/:id`

**路径参数:**
- `id`: 日记ID

**示例请求:**
```
DELETE /api/diaries/65a1b2c3d4e5f6g7h8i9j0k1
```

**响应示例:**
```json
{
  "success": true,
  "message": "日记删除成功"
}
```

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/认证失败 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 错误响应格式

```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息（仅开发环境）"
}
```

## 使用示例

### JavaScript (Fetch API)

```javascript
// 获取日记列表
async function getDiaries() {
  const response = await fetch('http://localhost:3000/api/diaries?page=1&limit=10');
  const data = await response.json();
  console.log(data);
}

// 创建日记
async function createDiary() {
  const response = await fetch('http://localhost:3000/api/diaries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      date: new Date().toISOString(),
      content: '这是我的第一篇日记'
    })
  });
  const data = await response.json();
  console.log(data);
}
```

### cURL

```bash
# 获取日记列表
curl http://localhost:3000/api/diaries?page=1&limit=10

# 创建日记
curl -X POST http://localhost:3000/api/diaries \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-01-30T00:00:00.000Z",
    "content": "今天天气真好"
  }'

# 更新日记
curl -X PUT http://localhost:3000/api/diaries/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Content-Type: application/json" \
  -d '{
    "content": "修改后的内容"
  }'

# 删除日记
curl -X DELETE http://localhost:3000/api/diaries/65a1b2c3d4e5f6g7h8i9j0k1
```

---

更多信息请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)
