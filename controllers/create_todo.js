import { ref } from 'vue';
import { createTodo } from '@/api/todo.js';
import { PROJECT_CODE, UID } from '@/utils/config.js';
import { buildCreateTodoPayload } from '@/models/create_todo.js';
import { TODO_SOURCE, DEFAULT_VALUES } from '@/utils/enums.js'; // Import nếu cần dùng default

export const useCreateTodoController = () => {
    
    // Helpers cơ bản
    const pad = (n) => n.toString().padStart(2, '0');
    const getTodayISO = () => {
        const d = new Date();
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };
    const getCurrentTime = () => {
        const d = new Date();
        return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // --- FORM STATE ---
    const loading = ref(false);
    const form = ref({
        name: '',
        desc: '',
        customer: '',
        assignee: '',
        dueDate: getTodayISO(),
        notifyDate: getTodayISO(),
        notifyTime: getCurrentTime()
    });

    // --- LOGIC ACTIONS ---
    const goBack = () => uni.navigateBack();

    const submitForm = async () => {
        if (!form.value.name || !form.value.name.trim()) {
            uni.showToast({ title: 'Vui lòng nhập tên công việc', icon: 'none' });
            return;
        }
    
        loading.value = true;
    
        try {
            const payload = buildCreateTodoPayload(form.value, {
                projectCode: PROJECT_CODE,
                uid: UID
            });
    
            await createTodo(payload);
    
            uni.showToast({ title: 'Tạo thành công!', icon: 'success' });
            setTimeout(() => { uni.navigateBack(); }, 1500);
    
        } catch (error) {
            console.error("❌ Create Error:", error);
            uni.showToast({ title: 'Lỗi: ' + (error?.message || 'Thất bại'), icon: 'none' });
        } finally {
            loading.value = false;
        }
    };

    return {
        loading, form, goBack, submitForm
    };
};