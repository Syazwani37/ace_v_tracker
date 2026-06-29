// db.js - JSON database helper module
const fs = require('fs');
const path = require('path');

const jsonFile = path.join(__dirname, 'database.json');

// Initialize database
function initDb() {
    if (!fs.existsSync(jsonFile)) {
        seedMockData();
    }
}

// Read database helper
function readData() {
    initDb();
    try {
        const content = fs.readFileSync(jsonFile, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        console.error('Error reading database file, returning empty schema:', err);
        return { companies: [], engagements: [], feedback: [] };
    }
}

// Write database helper
function writeData(data) {
    try {
        fs.writeFileSync(jsonFile, JSON.stringify(data, null, 4), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing to database file:', err);
        return false;
    }
}

// Seed mock data
function seedMockData() {
    const data = {
        companies: [
            { id: 1, name: 'Tesla Motors', industry: 'Automotive', location: 'Selangor', status: 'Active Partner', partnership_date: '2023-10-15' },
            { id: 2, name: 'Google', industry: 'IT/Tech', location: 'Kuala Lumpur', status: 'Active Partner', partnership_date: '2023-08-20' },
            { id: 3, name: 'Intel Corporation', industry: 'Manufacturing', location: 'Penang', status: 'Active Partner', partnership_date: '2022-11-05' },
            { id: 4, name: 'Microsoft', industry: 'IT/Tech', location: 'Kuala Lumpur', status: 'Active Partner', partnership_date: '2023-05-12' },
            { id: 5, name: 'Petronas', industry: 'Energy', location: 'Terengganu', status: 'Active Partner', partnership_date: '2023-12-01' },
            { id: 6, name: 'Dyson', industry: 'Manufacturing', location: 'Johor', status: 'Pending', partnership_date: '2024-01-10' }
        ],
        engagements: [
            { id: 1, company_id: 2, date_occurred: '2024-05-12', engagement_type: 'Tech Talk', contact_person: 'Sarah Jenkins', status: 'Scheduled', objective: 'Guest lecture on cloud services', students_count: 85 },
            { id: 2, company_id: 1, date_occurred: '2024-04-18', engagement_type: 'Site Visit', contact_person: 'Ahmad Rizal', status: 'Completed', objective: 'Industrial visit to Tesla Selangor factory', students_count: 35 },
            { id: 3, company_id: 3, date_occurred: '2024-03-22', engagement_type: 'Workshop', contact_person: 'Lim Wei Sheung', status: 'Completed', objective: 'Hands-on embedded systems training', students_count: 28 },
            { id: 4, company_id: 4, date_occurred: '2024-02-15', engagement_type: 'Guest Lecture', contact_person: 'Pradeep Kumar', status: 'Completed', objective: 'DevOps career talk and panel', students_count: 120 },
            { id: 5, company_id: 5, date_occurred: '2024-01-20', engagement_type: 'Site Visit', contact_person: 'Farhana Rahim', status: 'Completed', objective: 'Visit to Kerteh refinery control center', students_count: 45 }
        ],
        feedback: [
            { id: 1, engagement_id: 2, rating_visits: 5, rating_learning: 4, rating_feedback: 5, comments: 'Highly interactive, students loved the live demonstrations.' },
            { id: 2, engagement_id: 3, rating_visits: 4, rating_learning: 5, rating_feedback: 4, comments: 'Very technical, good for engineering students.' },
            { id: 3, engagement_id: 4, rating_visits: 5, rating_learning: 5, rating_feedback: 5, comments: 'Inspirational speaker, excellent career insights.' },
            { id: 4, engagement_id: 5, rating_visits: 4, rating_learning: 4, rating_feedback: 4, comments: 'Great safety briefing, clean facilities.' }
        ]
    };
    writeData(data);
}

// Fetch all companies sorted by name
function getCompanies() {
    const data = readData();
    return [...data.companies].sort((a, b) => a.name.localeCompare(b.name));
}

// Fetch single company
function getCompanyById(id) {
    const data = readData();
    return data.companies.find(c => c.id === parseInt(id)) || null;
}

// Add a company
function addCompany(name, industry, location, status, partnershipDate) {
    const data = readData();
    // Case-insensitive name uniqueness check
    const exists = data.companies.some(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) return false;

    const newId = data.companies.length > 0 ? Math.max(...data.companies.map(c => c.id)) + 1 : 1;
    data.companies.push({
        id: newId,
        name: name.trim(),
        industry: industry.trim(),
        location: location.trim(),
        status: status || 'Active Partner',
        partnership_date: partnershipDate || new Date().toISOString().split('T')[0]
    });
    return writeData(data);
}

// Fetch engagements with company names, sorted by date occurred DESC
function getEngagements() {
    const data = readData();
    const companyMap = {};
    data.companies.forEach(c => {
        companyMap[c.id] = c.name;
    });

    const engagements = data.engagements.map(e => ({
        ...e,
        company_name: companyMap[e.company_id] || 'Unknown'
    }));

    return engagements.sort((a, b) => b.date_occurred.localeCompare(a.date_occurred));
}

// Add random feedback for completed engagements to keep analytics dynamic
function addRandomFeedback(engagementId) {
    const data = readData();
    const comments = [
        'Fantastic engagement, students were highly involved.',
        'Good insights into industry realities.',
        'Speaker was very informative. Recommended for next year.',
        'Interesting visit, though some parts could be shorter.',
        'Excellent practical learning opportunity!'
    ];
    const comment = comments[Math.floor(Math.random() * comments.length)];
    const newId = data.feedback.length > 0 ? Math.max(...data.feedback.map(f => f.id)) + 1 : 1;
    
    data.feedback.push({
        id: newId,
        engagement_id: parseInt(engagementId),
        rating_visits: Math.floor(Math.random() * 2) + 4, // 4 or 5
        rating_learning: Math.floor(Math.random() * 2) + 4,
        rating_feedback: Math.floor(Math.random() * 2) + 4,
        comments: comment
    });
    writeData(data);
}

// Add an engagement
function addEngagement(companyId, dateOccurred, engagementType, contactPerson, status, objective, studentsCount) {
    const data = readData();
    const newId = data.engagements.length > 0 ? Math.max(...data.engagements.map(e => e.id)) + 1 : 1;
    
    data.engagements.push({
        id: newId,
        company_id: parseInt(companyId),
        date_occurred: dateOccurred,
        engagement_type: engagementType,
        contact_person: contactPerson,
        status: status || 'Scheduled',
        objective: objective || '',
        students_count: parseInt(studentsCount) || 0
    });
    
    const result = writeData(data);
    if (result && status === 'Completed') {
        addRandomFeedback(newId);
    }
    return result;
}

// Fetch feedback average and analytics
function getFeedbackAnalytics() {
    const data = readData();
    const total = data.feedback.length;
    if (total === 0) {
        return { avg_visits: 0, avg_learning: 0, avg_feedback: 0, total_feedback: 0 };
    }
    const visitsSum = data.feedback.reduce((sum, f) => sum + f.rating_visits, 0);
    const learningSum = data.feedback.reduce((sum, f) => sum + f.rating_learning, 0);
    const feedbackSum = data.feedback.reduce((sum, f) => sum + f.rating_feedback, 0);
    
    return {
        avg_visits: (visitsSum / total).toFixed(1),
        avg_learning: (learningSum / total).toFixed(1),
        avg_feedback: (feedbackSum / total).toFixed(1),
        total_feedback: total
    };
}

module.exports = {
    getCompanies,
    getCompanyById,
    addCompany,
    getEngagements,
    addEngagement,
    getFeedbackAnalytics
};
