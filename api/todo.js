// api/todo.js
import { request } from '@/utils/request.js';
import { PROJECT_CODE } from '@/utils/config.js';
import { mapTodoFromApi } from '@/models/todo.js';

const API_URL = 'https://api-staging.vbot.vn/v1.0/api/module-todo/todo';

// 1. API Lấy danh sách (Có phân trang)
export const getTodos = async (params) => {
    const rawData = await request({
        url: `${API_URL}/getAll`,
        method: 'GET',
        data: {
            projectCode: PROJECT_CODE,
            // pageNo và pageSize sẽ được truyền từ params bên ngoài vào
            // Nếu không có thì mới lấy mặc định
            pageNo: params.pageNo || 1,
            pageSize: params.pageSize || 15, 
            ...params
        }
    });

    if (Array.isArray(rawData)) {
        return rawData.map(item => mapTodoFromApi(item));
    }
    return [];
};

// 2. API Đếm tổng số lượng (Để tính số trang)
export const getTodoCount = async (params) => {
    const result = await request({
        url: `${API_URL}/countAll`,
        method: 'GET',
        data: {
            projectCode: PROJECT_CODE,
            ...params 
            // params ở đây chính là bộ lọc (keySearch, code, status,...)
            // buildTodoParams đã chuẩn hóa đúng format (-1, rỗng) như yêu cầu
        }
    });
    
    // API trả về số nguyên trực tiếp trong data (ví dụ: 65)
    return result || 0; 
};

export const createTodo = (data) => {
    return request({
        url: `${API_URL}/create`,
        method: 'POST',
        data: data
    });
};

export const deleteTodo = (id) => {
    return request({
        url: `${API_URL}/delete`,
        method: 'POST',
        data: { id: id }
    });
};