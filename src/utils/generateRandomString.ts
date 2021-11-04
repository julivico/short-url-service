const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const generateRandomString = (length: number = 8): string => {
    var result = '';
    for (var i = length; i > 0; --i) result += CHARS[Math.round(Math.random() * (CHARS.length - 1))];
    return result;
}
