// controllers/create_todo.js
import { ref, computed, nextTick } from 'vue';
import { createTodo } from '@/api/todo.js';
import { PROJECT_CODE, UID } from '@/utils/config.js';
import { buildCreateTodoPayload } from '@/models/create_todo.js';

export const useCreateTodoController = () => {
    
    // --- 1. HELPER FUNCTIONS ---
    const pad = (n) => n.toString().padStart(2, '0');

    const getTodayISO = () => {
        const d = new Date();
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const getCurrentTime = () => {
        const d = new Date();
        return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const formatDateDisplay = (isoStr) => {
        if (!isoStr) return '';
        try {
            if (isoStr.includes('-')) {
                const [y, m, d] = isoStr.split('-');
                return `${d}/${m}/${y}`;
            }
            return isoStr;
        } catch (e) {
            return isoStr;
        }
    };

    // --- 2. FORM STATE & LOGIC ---
    const loading = ref(false);
    const form = ref({
        name: '',
        desc: '',
        customer: '',
        assignee: '',
        dueDate: getTodayISO(),      // Chỉ ngày (YYYY-MM-DD)
        notifyDate: getTodayISO(),   // Ngày thông báo (YYYY-MM-DD)
        notifyTime: getCurrentTime() // Giờ thông báo (HH:mm) -> THÊM MỚI
    });

    const bindDateChange = (e, field) => {
        form.value[field] = e.detail.value;
    };

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

    // --- 3. EDITOR STATE & LOGIC (Giữ nguyên) ---
    const editorCtx = ref(null);
    const formats = ref({});
    const showLinkPopup = ref(false);
    const linkUrl = ref('');
    const linkText = ref('');
    const canInsertLink = ref(false);
    const isLinkSelected = ref(false);
    const focusLinkInput = ref(false);
    const showColorPopup = ref(false);
    const colorType = ref('color');
    const currentColor = ref('#000000');
    const currentBgColor = ref('transparent');
    const currentHeader = ref('Normal');

    const colorList = ['#000000', '#424242', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF', '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF', '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0', '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79'];
    const headerOptions = [{label:'Normal',value:null},{label:'H1',value:1},{label:'H2',value:2},{label:'H3',value:3}];

    const alignIcon = computed(() => formats.value.align === 'center' ? 'https://img.icons8.com/ios/50/666666/align-center.png' : (formats.value.align === 'right' ? 'https://img.icons8.com/ios/50/666666/align-right.png' : 'https://img.icons8.com/ios/50/666666/align-left.png'));
    const isPopupOpen = computed(() => showLinkPopup.value || showColorPopup.value);

    const onEditorReady = () => { uni.createSelectorQuery().select('#editor').context((res) => { editorCtx.value = res.context; if (form.value.desc) editorCtx.value.setContents({ html: form.value.desc }); }).exec(); };
    const onEditorInput = (e) => { form.value.desc = e.detail.html; };
    
    const onStatusChange = (e) => { 
        formats.value = e.detail;
        if (e.detail.color) currentColor.value = e.detail.color;
        if (e.detail.backgroundColor) currentBgColor.value = e.detail.backgroundColor;
        if (e.detail.hasOwnProperty('link')) { isLinkSelected.value = true; linkUrl.value = e.detail.link || ''; } 
        else { isLinkSelected.value = false; linkUrl.value = ''; }
        if (editorCtx.value) {
            editorCtx.value.getSelectionText({
                success: (res) => { if (res.text && res.text.length > 0) { canInsertLink.value = true; if (!isLinkSelected.value) linkText.value = res.text; } else { canInsertLink.value = false; if (!isLinkSelected.value) linkText.value = ''; } },
                fail: () => { canInsertLink.value = false; }
            });
        }
    };

    const handleLinkBtn = () => { if (isLinkSelected.value || canInsertLink.value) { if(canInsertLink.value && !isLinkSelected.value) linkUrl.value=''; showLinkPopup.value = true; nextTick(() => { focusLinkInput.value = true; }); } else { uni.showToast({ title: 'Bôi đen chữ để chèn Link', icon: 'none' }); } };
    const closeLinkPopup = () => { showLinkPopup.value = false; focusLinkInput.value = false; };
    const confirmLink = () => { const url = linkUrl.value; const text = linkText.value; closeLinkPopup(); setTimeout(() => { if (url && text) { editorCtx.value.insertText({ text: text }); editorCtx.value.format('link', url); } }, 300); };
    const removeLink = () => { closeLinkPopup(); setTimeout(() => { editorCtx.value.format('link', null); }, 300); };
    const format = (name, value) => { if (editorCtx.value) editorCtx.value.format(name, value); };
    const onHeaderChange = (e) => { const sel = headerOptions[e.detail.value]; currentHeader.value = sel.label; format('header', sel.value); };
    const toggleAlign = () => { let a = 'center'; if(formats.value.align==='center') a='right'; else if(formats.value.align==='right') a='left'; format('align', a); };
    const openColorPicker = (type) => { colorType.value = type; showColorPopup.value = true; };
    const closeColorPopup = () => { showColorPopup.value = false; };
    const selectColor = (color) => { if (colorType.value === 'color') { currentColor.value = color || '#000000'; format('color', color); } else { currentBgColor.value = color || 'transparent'; format('backgroundColor', color); } closeColorPopup(); };
    const insertImage = () => { uni.chooseImage({ count: 1, success: (r) => editorCtx.value.insertImage({ src: r.tempFilePaths[0], width: '80%' }) }); };
    const insertVideo = () => { uni.chooseVideo({ count: 1, success: (r) => editorCtx.value.insertVideo({ src: r.tempFilePath, width: '80%' }) }); };

    // --- EXPORT ---
    return {
        loading, form, formatDateDisplay, bindDateChange, goBack, submitForm,
        formats, showLinkPopup, linkUrl, linkText, canInsertLink, isLinkSelected,
        focusLinkInput, showColorPopup, currentColor, currentBgColor, currentHeader,
        colorList, headerOptions, alignIcon, isPopupOpen,
        onEditorReady, onEditorInput, onStatusChange, handleLinkBtn, closeLinkPopup,
        confirmLink, removeLink, format, onHeaderChange, toggleAlign, openColorPicker,
        closeColorPopup, selectColor, insertImage, insertVideo
    };
};