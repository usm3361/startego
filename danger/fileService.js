import fs from 'fs/promises';

export const saveFile = async (fileName, data) => {
    try {
        await fs.writeFile(fileName, JSON.stringify(data, null, 2));
        console.log(`Saved to ${fileName}`);
    } catch (error) {
        console.error("Error saving file:", error.message);
    }
};

export const loadFile = async (fileName) => {
    try {
        const data = await fs.readFile(fileName, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading file:", error.message);
        return [];
    }
};