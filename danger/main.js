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
