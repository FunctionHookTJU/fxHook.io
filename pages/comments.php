<?php
/**
 * 留言板 PHP 后端服务
 * 支持 GET（获取留言）和 POST（提交留言）请求
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 留言数据存储文件
$dataFile = __DIR__ . '/comments_data.json';

/**
 * 读取所有留言
 */
function getComments($dataFile) {
    if (!file_exists($dataFile)) {
        return [];
    }
    
    $content = file_get_contents($dataFile);
    if ($content === false) {
        return [];
    }
    
    $comments = json_decode($content, true);
    return is_array($comments) ? $comments : [];
}

/**
 * 保存留言到文件
 */
function saveComments($dataFile, $comments) {
    $result = file_put_contents($dataFile, json_encode($comments, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    return $result !== false;
}

/**
 * 清理用户输入
 */
function sanitizeInput($input, $maxLength = 500) {
    $input = trim($input);
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    return mb_substr($input, 0, $maxLength);
}

// 处理 GET 请求 - 获取留言列表
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $comments = getComments($dataFile);
    echo json_encode($comments, JSON_UNESCAPED_UNICODE);
    exit;
}

// 处理 POST 请求 - 提交新留言
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 获取 JSON 请求体
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => '无效的请求数据'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // 验证必填字段
    if (empty($data['name']) || empty($data['message'])) {
        http_response_code(400);
        echo json_encode(['error' => '称呼和留言内容不能为空'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // 清理并验证输入
    $name = sanitizeInput($data['name'], 24);
    $message = sanitizeInput($data['message'], 500);
    
    if (empty($name) || empty($message)) {
        http_response_code(400);
        echo json_encode(['error' => '称呼和留言内容不能为空'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // 创建新留言
    $newComment = [
        'id' => uniqid('comment_', true),
        'name' => $name,
        'message' => $message,
        'createdAt' => date('c'), // ISO 8601 格式
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];
    
    // 读取现有留言并添加新留言
    $comments = getComments($dataFile);
    $comments[] = $newComment;
    
    // 保存留言
    if (saveComments($dataFile, $comments)) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => '留言发布成功',
            'data' => $newComment
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode(['error' => '保存留言失败，请稍后重试'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// 不支持的请求方法
http_response_code(405);
echo json_encode(['error' => '不支持的请求方法'], JSON_UNESCAPED_UNICODE);
