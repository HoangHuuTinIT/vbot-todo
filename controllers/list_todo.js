// controllers/list_todo.js
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getTodos, deleteTodo } from '@/api/todo.js';
import { TODO_STATUS, STATUS_LABELS } from '@/utils/constants.js';
import { buildTodoParams } from '@/models/todo.js';

export const useListTodoController = () => {
    // --- STATE ---
    const todos = ref([]);
    const isLoading = ref(false);
    const isFilterOpen = ref(false);
    
    // State cho Popup xác nhận xóa
    const isConfirmDeleteOpen = ref(false);
    const itemToDelete = ref(null);

    // Config Filter
    const statusOptions = ['Tất cả', STATUS_LABELS[TODO_STATUS.NEW], STATUS_LABELS[TODO_STATUS.IN_PROGRESS], STATUS_LABELS[TODO_STATUS.DONE]];
    const statusValues = ['', TODO_STATUS.NEW, TODO_STATUS.IN_PROGRESS, TODO_STATUS.DONE];
    const statusIndex = ref(0);
    const filter = ref({ title: '', jobCode: '', createdFrom: '', createdTo: '' });

    // --- UI STATE CHO FOOTER (MỚI THÊM) ---
    // Danh sách text hiển thị trong picker
    const pageSizeOptions = ['5/trang', '10/trang', '15/trang', '20/trang'];
    // Index được chọn (mặc định là 2 tương ứng với 15/trang)
    const pageSizeIndex = ref(2); 
    // Trang hiện tại (mặc định là 1)
    const currentPage = ref(1);
    
    // Hàm xử lý khi chọn pageSize (Chỉ UI tạm thời)
    const onPageSizeChange = (e) => {
        pageSizeIndex.value = e.detail.value;
        // Sau này sẽ thêm logic gọi API tại đây
    };

    // --- METHODS ---

    const getTodoList = async () => {
        isLoading.value = true;
        try {
            const params = buildTodoParams(filter.value, statusValues[statusIndex.value]);
            // Lưu ý: params hiện tại chưa truyền pageNo/pageSize động,
            // sau này bạn lấy từ pageSizeOptions[pageSizeIndex.value] để parse ra số.
            const data = await getTodos(params);
            todos.value = data || [];
        } catch (error) {
            console.error(error);
            uni.showToast({ title: 'Lỗi tải dữ liệu', icon: 'none' });
        } finally {
            isLoading.value = false;
        }
    };

    // --- Logic Xóa ---
    const onRequestDelete = (item) => {
        itemToDelete.value = item;
        isConfirmDeleteOpen.value = true;
    };

    const cancelDelete = () => {
        isConfirmDeleteOpen.value = false;
        itemToDelete.value = null;
    };

    const confirmDelete = async () => {
        if (!itemToDelete.value) return;
        try {
            await deleteTodo(itemToDelete.value.id);
            uni.showToast({ title: 'Đã xóa thành công', icon: 'success' });
            isConfirmDeleteOpen.value = false;
            itemToDelete.value = null;
            getTodoList(); 
        } catch (error) {
            console.error("Delete Error:", error);
            uni.showToast({ title: 'Xóa thất bại', icon: 'none' });
        }
    };

    const showActionMenu = (item) => {
        uni.showActionSheet({
            itemList: ['Xóa công việc'],
            itemColor: '#ff3b30',
            success: (res) => {
                if (res.tapIndex === 0) {
                    onRequestDelete(item);
                }
            }
        });
    };

    // Các hàm UI khác
    const addNewTask = () => { uni.navigateTo({ url: '/pages/todo/create_todo' }); };
    const openFilter = () => { isFilterOpen.value = true; };
    const closeFilter = () => { isFilterOpen.value = false; };
    const onStatusChange = (e) => { statusIndex.value = e.detail.value; };
    const resetFilter = () => { filter.value = { title: '', jobCode: '', createdFrom: '', createdTo: '' }; statusIndex.value = 0; };
    const applyFilter = () => { closeFilter(); getTodoList(); };

    onShow(() => { getTodoList(); });

    return {
        todos, isLoading, isFilterOpen, statusOptions, statusIndex, filter,
        isConfirmDeleteOpen, itemToDelete,
        // Export thêm các biến mới
        pageSizeOptions, pageSizeIndex, currentPage, onPageSizeChange,
        // ------------------------
        addNewTask, openFilter, closeFilter, onStatusChange, resetFilter, applyFilter,
        showActionMenu, cancelDelete, confirmDelete
    };
};