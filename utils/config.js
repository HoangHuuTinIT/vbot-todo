// utils/config.js
import { SYSTEM_CONFIG } from '@/utils/enums.js'; // Import

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN;
export const PROJECT_CODE = import.meta.env.VITE_PROJECT_CODE;
export const UID = import.meta.env.VITE_UID;

// Sử dụng biến từ enums.js thay vì gán cứng Desktop-RTC và TODO
export const FULL_API_URL = `${BASE_URL}?projectCode=${PROJECT_CODE}&uid=${UID}&type=${SYSTEM_CONFIG.MODULE_TYPE}&source=${SYSTEM_CONFIG.SOURCE_PARAM}`;