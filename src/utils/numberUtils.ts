export const validateNumber = (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? defaultValue : num;
};

export const formatPercentage = (value: any, decimals: number = 2): string => {
    const num = validateNumber(value, 0);
    return `${(num * 100).toFixed(decimals)}%`;
};

export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
}; 