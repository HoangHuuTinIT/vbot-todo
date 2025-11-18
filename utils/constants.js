// utils/constants.js

export const TODO_STATUS = {
    NEW: 'TO_DO',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE'
};

export const STATUS_LABELS = {
    [TODO_STATUS.NEW]: 'Chờ xử lý',
    [TODO_STATUS.IN_PROGRESS]: 'Đang xử lý',
    [TODO_STATUS.DONE]: 'Hoàn thành'
};

export const STATUS_COLORS = {
    [TODO_STATUS.DONE]: 'bg-green',
    [TODO_STATUS.IN_PROGRESS]: 'bg-orange',
    [TODO_STATUS.NEW]: 'bg-gray'
};

