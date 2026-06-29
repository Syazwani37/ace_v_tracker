// db.js - Extended JSON database helper module
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

// Seed mock data with expanded fields
function seedMockData() {
    const data = {
        companies: [
            { 
                id: 1, 
                name: 'Tesla Motors', 
                industry: 'Automotive', 
                location: 'Selangor', 
                status: 'Active Partner', 
                partnership_date: '2023-10-15',
                contact_person: 'Ahmad Rizal',
                email: 'contact@tesla.my',
                phone: '+603-88881111',
                website: 'https://tesla.com.my',
                notes: 'Interested in industrial site visits and hiring electrical engineering graduates.'
            },
            { 
                id: 2, 
                name: 'Google', 
                industry: 'IT/Tech', 
                location: 'Kuala Lumpur', 
                status: 'Active Partner', 
                partnership_date: '2023-08-20',
                contact_person: 'Sarah Jenkins',
                email: 'sarah.j@google.com',
                phone: '+603-22223333',
                website: 'https://google.com.my',
                notes: 'Provides speakers for cloud architecture and software engineering tech talks.'
            },
            { 
                id: 3, 
                name: 'Intel Corporation', 
                industry: 'Manufacturing', 
                location: 'Penang', 
                status: 'Active Partner', 
                partnership_date: '2022-11-05',
                contact_person: 'Lim Wei Sheung',
                email: 'wei.sheung.lim@intel.com',
                phone: '+604-55556666',
                website: 'https://intel.com.my',
                notes: 'Supports embedded system workshops. Donates micro-controller kits.'
            },
            { 
                id: 4, 
                name: 'Microsoft', 
                industry: 'IT/Tech', 
                location: 'Kuala Lumpur', 
                status: 'Active Partner', 
                partnership_date: '2023-05-12',
                contact_person: 'Pradeep Kumar',
                email: 'pradeep@microsoft.com',
                phone: '+603-44445555',
                website: 'https://microsoft.com/en-my',
                notes: 'Interested in hosting annual cloud hackathons and guest lectures.'
            },
            { 
                id: 5, 
                name: 'Petronas', 
                industry: 'Energy', 
                location: 'Terengganu', 
                status: 'Active Partner', 
                partnership_date: '2023-12-01',
                contact_person: 'Farhana Rahim',
                email: 'farhana.r@petronas.com.my',
                phone: '+609-66667777',
                website: 'https://petronas.com',
                notes: 'Mainly site visits for instrumentation & chemical control systems.'
            },
            { 
                id: 6, 
                name: 'Dyson', 
                industry: 'Manufacturing', 
                location: 'Johor', 
                status: 'Pending', 
                partnership_date: '2024-01-10',
                contact_person: 'Tan Sri Hisham',
                email: 'hisham.t@dyson.com',
                phone: '+607-77778888',
                website: 'https://dyson.my',
                notes: 'Pending final partnership agreement sign-off from HOD.'
            }
        ],
        engagements: [
            { 
                id: 1, 
                company_id: 2, 
                date_occurred: '2024-05-12', 
                start_time: '10:00',
                end_time: '12:00',
                engagement_type: 'Tech Talk', 
                contact_person: 'Sarah Jenkins', 
                coordinator: 'Dr. Zulfadli',
                status: 'Scheduled', 
                objective: 'Guest lecture on cloud services', 
                students_count: 85,
                approval_hod: 'Approved',
                approval_industry: 'Approved',
                checklist_approved: true,
                required_approved: true
            },
            { 
                id: 2, 
                company_id: 1, 
                date_occurred: '2024-04-18', 
                start_time: '09:00',
                end_time: '15:00',
                engagement_type: 'Site Visit', 
                contact_person: 'Ahmad Rizal', 
                coordinator: 'Prof. Marina',
                status: 'Completed', 
                objective: 'Industrial visit to Tesla Selangor factory', 
                students_count: 35,
                approval_hod: 'Approved',
                approval_industry: 'Approved',
                checklist_approved: true,
                required_approved: true
            },
            { 
                id: 3, 
                company_id: 3, 
                date_occurred: '2024-03-22', 
                start_time: '14:00',
                end_time: '17:00',
                engagement_type: 'Workshop', 
                contact_person: 'Lim Wei Sheung', 
                coordinator: 'Dr. Wong',
                status: 'Completed', 
                objective: 'Hands-on embedded systems training', 
                students_count: 28,
                approval_hod: 'Approved',
                approval_industry: 'Approved',
                checklist_approved: true,
                required_approved: true
            },
            { 
                id: 4, 
                company_id: 4, 
                date_occurred: '2024-02-15', 
                start_time: '11:00',
                end_time: '13:00',
                engagement_type: 'Guest Lecture', 
                contact_person: 'Pradeep Kumar', 
                coordinator: 'Dr. Zulfadli',
                status: 'Completed', 
                objective: 'DevOps career talk and panel', 
                students_count: 120,
                approval_hod: 'Approved',
                approval_industry: 'Approved',
                checklist_approved: true,
                required_approved: true
            },
            { 
                id: 5, 
                company_id: 5, 
                date_occurred: '2024-01-20', 
                start_time: '08:30',
                end_time: '16:30',
                engagement_type: 'Site Visit', 
                contact_person: 'Farhana Rahim', 
                coordinator: 'Prof. Marina',
                status: 'Completed', 
                objective: 'Visit to Kerteh refinery control center', 
                students_count: 45,
                approval_hod: 'Approved',
                approval_industry: 'Approved',
                checklist_approved: true,
                required_approved: true
            },
            { 
                id: 6, 
                company_id: 6, 
                date_occurred: '2026-07-15', 
                start_time: '10:00',
                end_time: '12:00',
                engagement_type: 'Workshop', 
                contact_person: 'Tan Sri Hisham', 
                coordinator: 'Dr. Wong',
                status: 'Pending Approval', 
                objective: 'Dyson vacuum technology workshop and exhibition', 
                students_count: 50,
                approval_hod: 'Pending',
                approval_industry: 'Pending',
                checklist_approved: true,
                required_approved: false
            }
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
    // Compute last engagement date for each company
    const engagements = data.engagements || [];
    const companies = data.companies.map(c => {
        const compEngs = engagements.filter(e => e.company_id === c.id && e.status === 'Completed');
        let lastEngagement = 'N/A';
        if (compEngs.length > 0) {
            // Sort to find latest
            compEngs.sort((a, b) => b.date_occurred.localeCompare(a.date_occurred));
            lastEngagement = compEngs[0].date_occurred;
        }
        return {
            ...c,
            last_engagement: lastEngagement
        };
    });
    return companies.sort((a, b) => a.name.localeCompare(b.name));
}

// Fetch single company
function getCompanyById(id) {
    const data = readData();
    return data.companies.find(c => c.id === parseInt(id)) || null;
}

// Add a company
function addCompany(name, industry, location, status, partnershipDate, contactPerson, email, phone, website, notes) {
    const data = readData();
    const exists = data.companies.some(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) return false;

    const newId = data.companies.length > 0 ? Math.max(...data.companies.map(c => c.id)) + 1 : 1;
    data.companies.push({
        id: newId,
        name: name.trim(),
        industry: industry.trim(),
        location: location.trim(),
        status: status || 'Active Partner',
        partnership_date: partnershipDate || new Date().toISOString().split('T')[0],
        contact_person: (contactPerson || '').trim(),
        email: (email || '').trim(),
        phone: (phone || '').trim(),
        website: (website || '').trim(),
        notes: (notes || '').trim()
    });
    return writeData(data);
}

// Edit a company
function updateCompany(id, name, industry, location, status, partnershipDate, contactPerson, email, phone, website, notes) {
    const data = readData();
    const company = data.companies.find(c => c.id === parseInt(id));
    if (!company) return false;

    company.name = name.trim();
    company.industry = industry.trim();
    company.location = location.trim();
    company.status = status;
    company.partnership_date = partnershipDate;
    company.contact_person = (contactPerson || '').trim();
    company.email = (email || '').trim();
    company.phone = (phone || '').trim();
    company.website = (website || '').trim();
    company.notes = (notes || '').trim();

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

// Add random feedback for completed engagements
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
function addEngagement(companyId, dateOccurred, startTime, endTime, engagementType, contactPerson, coordinator, status, objective, studentsCount, checklistApproved, requiredApproved) {
    const data = readData();
    const newId = data.engagements.length > 0 ? Math.max(...data.engagements.map(e => e.id)) + 1 : 1;
    
    // If status is scheduled or completed on entry, approvals can be pre-approved
    const isPreApproved = status === 'Completed' || status === 'Scheduled';

    data.engagements.push({
        id: newId,
        company_id: parseInt(companyId),
        date_occurred: dateOccurred,
        start_time: startTime || '09:00',
        end_time: endTime || '17:00',
        engagement_type: engagementType,
        contact_person: contactPerson,
        coordinator: coordinator || 'Coordinator',
        status: status || 'Pending Approval',
        objective: objective || '',
        students_count: parseInt(studentsCount) || 0,
        approval_hod: isPreApproved ? 'Approved' : 'Pending',
        approval_industry: isPreApproved ? 'Approved' : 'Pending',
        checklist_approved: !!checklistApproved,
        required_approved: !!requiredApproved
    });
    
    const result = writeData(data);
    if (result && status === 'Completed') {
        addRandomFeedback(newId);
    }
    return result;
}

// Update visit approval status
function updateEngagementApproval(id, approvalType, approvalStatus) {
    const data = readData();
    const eng = data.engagements.find(e => e.id === parseInt(id));
    if (!eng) return false;
    
    if (approvalType === 'hod') {
        eng.approval_hod = approvalStatus;
    } else if (approvalType === 'industry') {
        eng.approval_industry = approvalStatus;
    } else if (approvalType === 'status') {
        eng.status = approvalStatus;
    }

    // Pipeline state progression logic
    if (eng.approval_hod === 'Approved' && eng.approval_industry === 'Approved') {
        if (eng.status === 'Pending Approval') {
            eng.status = 'Scheduled';
        }
    } else if (eng.approval_hod === 'Rejected' || eng.approval_industry === 'Rejected') {
        eng.status = 'Cancelled';
    } else {
        // If moved back or reset
        if (eng.status === 'Scheduled' || eng.status === 'Completed') {
            // Keep status but verify approvals
        } else {
            eng.status = 'Pending Approval';
        }
    }

    const result = writeData(data);
    if (result && eng.status === 'Completed') {
        // Add random feedback if it has none yet
        const feedbackExists = data.feedback.some(f => f.engagement_id === eng.id);
        if (!feedbackExists) {
            addRandomFeedback(eng.id);
        }
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
    updateCompany,
    getEngagements,
    addEngagement,
    updateEngagementApproval,
    getFeedbackAnalytics
};
