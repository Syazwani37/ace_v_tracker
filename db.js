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

// Seed empty structure for first boot
function seedMockData() {
    const data = {
        companies: [],
        engagements: [],
        feedback: []
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
