import { BASE_URL } from './config.js';

export const fetchPeople = async () => {
    try {
        const res = await fetch(`${BASE_URL}/people`);
        const text = await res.text();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error fetching people:", error.message);
        return [];
    }
};

export const fetchTranscriptions = async () => {
    try {
        const res = await fetch(`${BASE_URL}/transcriptions`);
        const text = await res.text();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error fetching transcriptions:", error.message);
        return [];
    }
};

export const sendReport = async (peopleList) => {
    try {
        const res = await fetch(`${BASE_URL}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(peopleList)
        });
        const text = await res.text();
        console.log("Report Response:", text);
    } catch (error) {
        console.error("Error sending report:", error.message);
    }
};
