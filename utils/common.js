export function isArray(value) {
    return Array.isArray(value);
}

export function isObject(value) {
    const type = typeof value;
    return type === 'object' && value !== null && Object.prototype.toString.call(value) === '[object Object]';
}

export function isArrayOrObject(value) {
    return isArray(value) || isObject(value)
}

export const copyToClipboard = (text) => {
    return navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy: ', err);
    });
};
export const betterUUID = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(36)).join('').substring(0, 12);
};

