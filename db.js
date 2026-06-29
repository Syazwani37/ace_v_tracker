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

// Seed real MMU industrial visits data from news highlights
function seedMockData() {
    const data = {
        companies: [
            { 
                id: 1, 
                name: 'Infineon Technologies Melaka', 
                industry: 'Manufacturing', 
                location: 'Melaka', 
                status: 'Active Partner', 
                partnership_date: '2022-10-12',
                contact_person: 'Mr. Tan (HR Director)',
                email: 'contact.melaka@infineon.com',
                phone: '+606-2821212',
                website: 'https://www.infineon.com',
                notes: 'Semiconductor manufacturing plant. Regularly hosts cleanroom visits and career talks for engineering and IT students.'
            },
            { 
                id: 2, 
                name: 'PPK Technology Sdn Bhd', 
                industry: 'IT/Tech', 
                location: 'Kuala Lumpur', 
                status: 'Active Partner', 
                partnership_date: '2025-02-10',
                contact_person: 'Dr. Amir (CTO)',
                email: 'info@ppktech.com.my',
                phone: '+603-79883456',
                website: 'https://www.ppktech.com.my',
                notes: 'AI-driven smart traffic solutions provider. Hosts engineering students to study traffic controllers and IoT system designs.'
            },
            { 
                id: 3, 
                name: 'CelcomDigi', 
                industry: 'IT/Tech', 
                location: 'Petaling Jaya', 
                status: 'Active Partner', 
                partnership_date: '2024-03-15',
                contact_person: 'Ms. Cheryl (Corporate Comms)',
                email: 'partnerships@celcomdigi.com',
                phone: '+603-72008000',
                website: 'https://www.celcomdigi.com',
                notes: 'Hosts CelcomDigi Ai Experience (AiX) visits for Faculty of Applied Communication (FAC) students.'
            },
            { 
                id: 4, 
                name: 'Olympic Cable Company', 
                industry: 'Manufacturing', 
                location: 'Melaka', 
                status: 'Active Partner', 
                partnership_date: '2023-09-01',
                contact_person: 'Ir. Liew (Plant Manager)',
                email: 'liew@olympic-cable.com',
                phone: '+606-3373000',
                website: 'https://www.olympic-cable.com.my',
                notes: 'Cable manufacturing processes plant. Engineering study tour partner.'
            },
            { 
                id: 5, 
                name: 'V.S. Industry Berhad', 
                industry: 'Manufacturing', 
                location: 'Johor', 
                status: 'Active Partner', 
                partnership_date: '2023-11-20',
                contact_person: 'Mr. Ng (Automation Head)',
                email: 'ng.auto@vsindustry.com.my',
                phone: '+607-5994111',
                website: 'https://www.vsindustry.com.my',
                notes: 'Specializes in plastic injection molding and automated lines.'
            },
            { 
                id: 6, 
                name: 'Malaysia Airports (Sepang) Sdn. Bhd.', 
                industry: 'Services', 
                location: 'Sepang', 
                status: 'Active Partner', 
                partnership_date: '2024-05-18',
                contact_person: 'Pn. Shuhada (Operations Coordinator)',
                email: 'shuhada@malaysiaairports.com.my',
                phone: '+603-87778888',
                website: 'https://www.malaysiaairports.com.my',
                notes: 'KLIA Terminal 1 logistics, innovations, and customer experience study visits for Faculty of Management (FOM) students.'
            }
        ],
        engagements: [
            { 
                id: 1, 
                company_id: 1, 
                date_occurred: '2025-06-18', 
                start_time: '09:30',
                end_time: '14:30',
                engagement_type: 'Site Visit', 
                contact_person: 'Mr. Tan (HR Director)', 
                coordinator: 'Dr. Wong (FET Faculty)',
                status: 'Completed', 
                objective: 'Semiconductor manufacturing cleanroom tour and industrial career talk.', 
                students_count: 40,
                approval_hod: 'Approved',
                approval_industry: 'Approved',
                checklist_approved: true,
                required_approved: true
            },
            { 
                id: 2, 
                company_id: 2, 
                date_occurred: '2026-04-12', 
                start_time: '10:00',
                end_time: '13:00',
                engagement_type: 'Site Visit', 
                contact_person: 'Dr. Amir (CTO)', 
                coordinator: 'Dr. Lim (FET Faculty)',
                status: 'Completed', 
                objective: 'Study AI-driven smart traffic systems and IoT controller integration.', 
                students_count: 25,
                approval_hod: 'Approved',
                approval_industry: 'Approved',
                checklist_approved: true,
                required_approved: true
            },
            { 
                id: 3, 
                company_id: 3, 
                date_occurred: '2024-08-22', 
                start_time: '10:30',
                end_time: '15:30',
                engagement_type: 'Tech Talk', 
                contact_person: 'Ms. Cheryl (Corporate Comms)', 
                coordinator: 'Pn. Rohana (FAC Faculty)',
                status: 'Completed', 
                objective: 'CelcomDigi Ai Experience (AiX) state-of-the-art telecom facility demonstration.', 
                students_count: 50,
                approval_hod: 'Approved',
                approval_industry: 'Approved',
                checklist_approved: true,
                required_approved: true
            },
            { 
                id: 4, 
                company_id: 4, 
                date_occurred: '2025-04-09', 
                start_time: '09:00',
                end_time: '12:00',
                engagement_type: 'Site Visit', 
                contact_person: 'Ir. Liew (Plant Manager)', 
                coordinator: 'Ir. Dr. Tan (FET Mechanical Dept)',
                status: 'Completed', 
                objective: 'Observe wire drawing, annealing, and cable extrusion mechanical systems.', 
                students_count: 30,
                approval_hod: 'Approved',
                approval_industry: 'Approved',
                checklist_approved: true,
                required_approved: true
            },
            { 
                id: 5, 
                company_id: 5, 
                date_occurred: '2024-05-15', 
                start_time: '09:00',
                end_time: '16:00',
                engagement_type: 'Site Visit', 
                contact_person: 'Mr. Ng (Automation Head)', 
                coordinator: 'Dr. Wong (FET Electrical Dept)',
                status: 'Completed', 
                objective: 'Robotics and injection molding automation systems study.', 
                students_count: 35,
                approval_hod: 'Approved',
                approval_industry: 'Approved',
                checklist_approved: true,
                required_approved: true
            },
            { 
                id: 6, 
                company_id: 6, 
                date_occurred: '2025-05-24', 
                start_time: '10:00',
                end_time: '16:00',
                engagement_type: 'Site Visit', 
                contact_person: 'Pn. Shuhada (Operations Coordinator)', 
                coordinator: 'Dr. Farhan (FOM Faculty)',
                status: 'Completed', 
                objective: 'Airport logistics center and baggage handling system study tour.', 
                students_count: 42,
                approval_hod: 'Approved',
                approval_industry: 'Approved',
                checklist_approved: true,
                required_approved: true
            }
        ],
        feedback: [
            { id: 1, engagement_id: 1, rating_visits: 5, rating_learning: 5, rating_feedback: 5, comments: 'Excellent explanation of wafer fabrication and testing processes.' },
            { id: 2, engagement_id: 2, rating_visits: 5, rating_learning: 4, rating_feedback: 5, comments: 'Highly technical exposure to urban traffic controller boards and IoT hubs.' },
            { id: 3, engagement_id: 3, rating_visits: 5, rating_learning: 5, rating_feedback: 5, comments: 'Stunning tech displays on 5G and innovative communications.' },
            { id: 4, engagement_id: 6, rating_visits: 5, rating_learning: 5, rating_feedback: 5, comments: 'Gained behind-the-scenes insights of KLIA logistics.' }
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
