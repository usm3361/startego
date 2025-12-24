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