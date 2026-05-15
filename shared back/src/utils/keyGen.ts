import crypto from 'crypto';

export const generateLicenseKey = (prefix: string = 'ZYRO'): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = `${prefix}-`;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 3) key += '-';
    }
    return key;
};
