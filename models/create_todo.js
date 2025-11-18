// models/create_todo.js
import { TODO_STATUS } from '@/utils/constants.js'; // Import Status
import { TODO_SOURCE, DEFAULT_VALUES } from '@/utils/enums.js'; // Import Enums

// Helper: Chuyển đổi chuỗi ngày giờ sang timestamp
const dateToTimestamp = (dateStr) => {
    if (!dateStr) return -1;
    const safeDateStr = dateStr.replace(/\//g, '-');
    const dateObj = new Date(safeDateStr);
    return isNaN(dateObj.getTime()) ? -1 : dateObj.getTime();
};

/**
 * Model: Xây dựng Payload
 */
export const buildCreateTodoPayload = (form, config) => {
    
    const fullNotifyDateTime = `${form.notifyDate} ${form.notifyTime || '00:00'}`;
    const fullDueDate = form.dueDate; 

    return {
        title: form.name,
        description: form.desc || DEFAULT_VALUES.STRING, 
        
        projectCode: config.projectCode,
        createdBy: config.uid,
        
        // [SỬA] Dùng Constant có sẵn
        status: TODO_STATUS.NEW, // Thay cho 'TO_DO'
        
        // [SỬA] Dùng Enum
        links: TODO_SOURCE.CALL, // Thay cho 'CALL'
        
        pluginType: DEFAULT_VALUES.PLUGIN_TYPE, 
        
        // [SỬA] Dùng Default Values
        customerCode: form.customer || DEFAULT_VALUES.CUSTOMER_CODE, 
        assigneeId: form.assignee || DEFAULT_VALUES.ASSIGNEE_ID,       
        
        groupId: DEFAULT_VALUES.GROUP_ID,
        transId: DEFAULT_VALUES.TRANS_ID,
        
        // Các trường legacy (nếu chưa clear được thì để tạm hoặc tạo const)
        tagCodes: "", 
        groupMemberUid: "",
        files: DEFAULT_VALUES.STRING,
        phone: DEFAULT_VALUES.PHONE_PLACEHOLDER,
        
        dueDate: dateToTimestamp(fullDueDate),
        notificationReceivedAt: dateToTimestamp(fullNotifyDateTime)
    };
};