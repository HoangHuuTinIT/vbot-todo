// api/auth.js
import { request } from '@/utils/request.js';
import { SYSTEM_CONFIG } from '@/utils/enums.js'; // Import

// 1. API Đăng nhập hệ thống
export const systemLogin = (username, password) => {
    return new Promise((resolve, reject) => {
        uni.request({
            url: 'https://api-staging.vbot.vn/v1.0/token',
            method: 'POST',
            header: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: {
                username: username,
                password: password,
                grant_type: 'password',
                type_account: 0,
                
                // [SỬA] Thay thế 'Desktop-RTC'
                source: SYSTEM_CONFIG.SOURCE_PARAM 
            },
            success: (res) => {
                if (res.statusCode === 200 && res.data.access_token) {
                    resolve(res.data);
                } else {
                    reject(res.data);
                }
            },
            fail: (err) => reject(err)
        });
    });
};

// 2. API Lấy Token riêng cho module Todo
export const getTodoToken = (rootToken, projectCode, uid) => {
    return new Promise((resolve, reject) => {
        uni.request({
            url: `https://api-staging.vbot.vn/v1.0/api/module-crm/token`,
            method: 'GET',
            data: {
                projectCode: projectCode,
                uid: uid,
                
                // [SỬA] Thay thế cứng bằng Enum
                type: SYSTEM_CONFIG.MODULE_TYPE,   // 'TODO'
                source: SYSTEM_CONFIG.SOURCE_PARAM // 'Desktop-RTC'
            },
            header: {
                'Authorization': `Bearer ${rootToken}` 
            },
            success: (res) => {
                if (res.data && res.data.data && res.data.data.token) {
                    resolve(res.data.data.token);
                } else {
                    reject(res.data);
                }
            },
            fail: (err) => reject(err)
        });
    });
};