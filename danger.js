// config.js
export const BASE_URL = "http://localhost:3000"; // Replace with actual URL

// fileService.js
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

// apiService.js
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

// analysisService.js
const DANGER_WORDS = ['death', 'knife', 'bomb', 'attack'];

const calculateMessageScore = (content) => {
    let score = 0;
    const lowerText = content.toLowerCase();
    
    DANGER_WORDS.forEach(word => {
        const parts = lowerText.split(word);
        score += (parts.length - 1);
    });
    
    return score;
};

export const findDangerousAges = (transcriptions) => {
    const ageStats = {};

    transcriptions.forEach(record => {
        const age = record.age;
        // Check both 'call_content' and 'content' keys just in case
        const score = calculateMessageScore(record.call_content || record.content || "");

        if (!ageStats[age]) {
            ageStats[age] = { totalScore: 0, count: 0 };
        }
        
        // Logic: Calculate average danger level per age
        if (score > 0) {
            ageStats[age].totalScore += score;
        }
        
        // Counting every message for the average (assuming average = total danger / total calls)
        ageStats[age].count += 1;
    });

    const averages = Object.keys(ageStats).map(age => {
        const stats = ageStats[age];
        return {
            age: parseInt(age),
            average: stats.totalScore / stats.count
        };
    });

    // Sort descending and take top 3
    averages.sort((a, b) => b.average - a.average);
    return averages.slice(0, 3).map(item => item.age);
};

export const searchPerson = (people, key, value) => {
    // using == to allow string/number comparison (e.g. "45" == 45)
    return people.filter(p => p[key] == value);
};

// main.js
import readline from 'readline';
import { fetchPeople, fetchTranscriptions, sendReport } from './apiService.js';
import { saveFile, loadFile } from './fileService.js';
import { findDangerousAges, searchPerson } from './analysisService.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const showMenu = () => {
    console.log("\n--- INTELLIGENCE MENU ---");
    console.log("1. Get People List");
    console.log("2. Get Call Records");
    console.log("3. Search People by Name");
    console.log("4. Search People by Age");
    console.log("5. Find Dangerous People");
    console.log("6. Exit");
    rl.question("Select an option: ", handleInput);
};

const handleInput = async (option) => {
    switch (option.trim()) {
        case '1':
            console.log("Fetching people...");
            const people = await fetchPeople();
            await saveFile('PEOPLE.json', people);
            break;

        case '2':
            console.log("Fetching transcriptions...");
            const transcriptions = await fetchTranscriptions();
            await saveFile('TRANSCRIPTIONS.json', transcriptions);
            break;

        case '3':
            const pListName = await loadFile('PEOPLE.json');
            rl.question("Enter Name: ", (name) => {
                const found = searchPerson(pListName, 'name', name);
                console.log(found.length ? found : "Person not found.");
                showMenu();
            });
            return; 

        case '4':
            const pListAge = await loadFile('PEOPLE.json');
            rl.question("Enter Age: ", (age) => {
                const found = searchPerson(pListAge, 'age', age);
                console.log(found.length ? found : "Person not found.");
                showMenu();
            });
            return;

        case '5':
            console.log("Analyzing data...");
            const transData = await loadFile('TRANSCRIPTIONS.json');
            const peopleData = await loadFile('PEOPLE.json');

            if (!transData || transData.length === 0 || !peopleData || peopleData.length === 0) {
                console.log("Please download data (Option 1 & 2) first.");
                break;
            }

            // 1. Find top 3 dangerous ages
            const topAges = findDangerousAges(transData);
            console.log("Top 3 Dangerous Ages:", topAges);

            // 2. Find people with those ages
            const dangerousPeople = peopleData.filter(p => topAges.includes(p.age));
            console.log(`Found ${dangerousPeople.length} suspects.`);

            // 3. Send report
            await sendReport(dangerousPeople);
            break;

        case '6':
            console.log("Goodbye.");
            rl.close();
            process.exit(0);

        default:
            console.log("Invalid option.");
    }
    showMenu();
};

// Start
showMenu();
