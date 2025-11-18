// models/todo.js
import { TODO_STATUS, STATUS_LABELS, STATUS_COLORS } from '@/utils/constants.js';

// --- PRIVATE HELPERS (Dùng nội bộ) ---

// Hàm format đầy đủ: DD/MM/YYYY HH:mm:ss
const formatFullDateTime = (timestamp) => {
    // Handle trường hợp server trả về null, 0 hoặc -1
    if (!timestamp || timestamp === -1 || timestamp === 0) return '';
    
    const date = new Date(timestamp);
    
    // Lấy ngày, tháng, năm
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    
    // Lấy giờ, phút, giây
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    
    // Trả về định dạng: 18/11/2025 14:30:05
    return `${d}/${m}/${y} ${h}:${min}:${s}`;
};

const dateToTimestamp = (dateStr) => (!dateStr ? -1 : new Date(dateStr).getTime());

// --- PUBLIC MODELS ---

/**
 * 1. Request Model: Chuẩn hóa tham số filter gửi lên API
 */
export const buildTodoParams = (filter, statusValue) => {
    return {
        keySearch: filter.title || '',
        code: filter.jobCode || '',
        status: statusValue || '',
        
        startDate: dateToTimestamp(filter.createdFrom),
        endDate: dateToTimestamp(filter.createdTo),
        
        dueDateFrom: -1,
        dueDateTo: -1,
        customerCode: '',
        groupId: '',
        transId: '',
        createdBy: '',
        assigneeId: '',
        pluginType: '',
        links: ''
    };
};

/**
 * 2. Response Model: Chuẩn hóa dữ liệu từ Server về UI
 */
export const mapTodoFromApi = (apiData) => {
    if (!apiData) return {};

    const status = apiData.status || TODO_STATUS.NEW;
    const title = apiData.title || 'Không tên';

    return {
        id: apiData.id,
        code: apiData.code,
        title: title,
        
        // Class màu sắc
        statusClass: STATUS_COLORS[status] || 'bg-orange',
        
        // Label trạng thái
        statusLabel: STATUS_LABELS[status] || status,
        
        // Avatar text (nếu còn dùng ở đâu đó)
        avatarText: title.substring(0, 2).toUpperCase(),
        
        // --- THAY ĐỔI TẠI ĐÂY ---
        // Sử dụng hàm formatFullDateTime vừa viết ở trên
        createdAtFormatted: formatFullDateTime(apiData.createdAt),
        
        raw: apiData
    };
};