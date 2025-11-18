import { useAuthStore } from '@/stores/auth.js';

// Hàm request bọc ngoài (Wrapper)
export const request = async (options) => {
    const authStore = useAuthStore();

    // 1. Chuẩn bị Header
    // Lấy token hiện tại từ Store
    const token = authStore.todoToken || authStore.rootToken;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.header
    };

    // Chỉ thêm Authorization nếu có token
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 2. Trả về Promise (Gọi API)
    return new Promise((resolve, reject) => {
        uni.request({
            url: options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header: headers,
            
            success: async (res) => {
                // --- XỬ LÝ KẾT QUẢ TẬP TRUNG ---

                // TRƯỜNG HỢP 1: THÀNH CÔNG (HTTP 200 & Code hệ thống báo Success)
                // Lưu ý: VBot API đôi khi trả HTTP 200 nhưng body.errorCode != 0 thì vẫn là lỗi logic
                if (res.statusCode === 200) {
                    resolve(res.data.data); 
                    return;
                }

                // TRƯỜNG HỢP 2: LỖI 401 (UNAUTHORIZED - Token hết hạn/sai)
                if (res.statusCode === 401) {
                    console.warn(`⚠️ API 401: Token hết hạn tại ${options.url}`);

                    // Kiểm tra cờ '_isRetry' để tránh vòng lặp vô tận
                    // Nếu request này đã là request thử lại rồi mà vẫn lỗi -> Chết hẳn
                    if (options._isRetry) {
                        console.error('❌ Refresh Token cũng thất bại -> Logout.');
                        authStore.logout();
                        reject(res.data);
                        return;
                    }

                    // Nếu chưa thử lại -> Bắt đầu quy trình Cứu Token
                    try {
                        // Bước A: Gọi Store để đổi Token mới
                        await authStore.exchangeForTodoToken();
                        
                        console.log('🔄 Đã Refresh Token -> Đang gọi lại API cũ...');

                        // Bước B: Gọi lại request ban đầu (Đệ quy)
                        // Đánh dấu _isRetry = true để nếu lần này lỗi nữa thì dừng
                        const retryResult = await request({ 
                            ...options, 
                            _isRetry: true 
                        });
                        
                        // Bước C: Trả về kết quả của lần gọi lại thành công
                        resolve(retryResult);

                    } catch (err) {
                        // Nếu quá trình đổi token bị lỗi -> Logout
                        authStore.logout();
                        reject(err);
                    }
                    return;
                }

                // TRƯỜNG HỢP 3: CÁC LỖI KHÁC (404, 500...)
                console.error(`[API Error ${res.statusCode}]`, res.data);
                // Có thể thêm logic hiển thị Toast lỗi chung ở đây nếu muốn
                // uni.showToast({ title: 'Lỗi hệ thống', icon: 'none' });
                reject(res.data);
            },

            fail: (err) => {
                // Lỗi mạng (mất mạng, server sập hẳn)
                console.error('[Network Error]', err);
                uni.showToast({ title: 'Không có kết nối mạng', icon: 'none' });
                reject(err);
            }
        });
    });
};