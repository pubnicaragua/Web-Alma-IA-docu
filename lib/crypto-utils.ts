export const encryptData = (data: string): string => {
    try {
        return encodeURIComponent(data);
    } catch (error) {
        console.error('Error encoding data:', error);
        return data;
    }
};

export const decryptData = (encryptedData: string): string => {
    try {
        return decodeURIComponent(encryptedData);
    } catch (error) {
        console.error('Error decoding data:', error);
        return encryptedData;
    }
};
