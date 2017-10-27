

export function isArray (value):boolean {
    return value && typeof value === 'object' && value.constructor === Array;
};