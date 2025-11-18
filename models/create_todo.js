// models/create_todo.js

// Helper: Chuyển đổi chuỗi ngày giờ sang timestamp
const dateToTimestamp = (dateStr) => {
    if (!dateStr) return -1;
    // Thay thế dấu / bằng - để đảm bảo chuẩn ISO nếu cần (cho iOS)
    const safeDateStr = dateStr.replace(/\//g, '-');
    const dateObj = new Date(safeDateStr);
    return isNaN(dateObj.getTime()) ? -1 : dateObj.getTime();
};

/**
 * Model: Xây dựng Payload
 */
export const buildCreateTodoPayload = (form, config) => {
    
    // Ghép Ngày + Giờ cho phần thông báo
    // Ví dụ: "2025-11-18" + " " + "14:30" = "2025-11-18 14:30"
    const fullNotifyDateTime = `${form.notifyDate} ${form.notifyTime || '00:00'}`;

    // Với ngày hết hạn, thường mặc định là cuối ngày hoặc đầu ngày (ở đây để nguyên ngày)
    const fullDueDate = form.dueDate; 

    return {
        // 1. Các trường Text cơ bản
        title: form.name,
        description: form.desc || "", 
        
        // 2. Các trường Config / System
        projectCode: config.projectCode,
        createdBy: config.uid,
        status: 'TO_DO',
        
        // 3. Enum & Loại
        links: 'CALL', 
        pluginType: 'test1', 
        
        // 4. Các trường Optional
        customerCode: form.customer || "test1", 
        assigneeId: form.assignee || "test1",    
        groupId: "test1",
        transId: "test1",
        tagCodes: "test1",
        groupMemberUid: "test1",
        files: "",
        phone: "072836272322",
        
        // 5. Các trường Thời gian (Đã xử lý ghép chuỗi ở trên)
        dueDate: dateToTimestamp(fullDueDate),
        notificationReceivedAt: dateToTimestamp(fullNotifyDateTime)
    };
};