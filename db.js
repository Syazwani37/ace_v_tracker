// db.js - Extended JSON database helper module with RBAC and User Management
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
        const data = JSON.parse(content);
        if (!data.users) data.users = [];
        return data;
    } catch (err) {
        console.error('Error reading database file, returning empty schema:', err);
        return { companies: [], engagements: [], feedback: [], users: [] };
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
        ],
        users: []
    };
    writeData(data);
}

// Fetch all companies sorted by name (filtering out Archived status unless requested)
function getCompanies(includeArchived = false) {
    const data = readData();
    const engagements = data.engagements || [];
    let list = data.companies;
    
    if (!includeArchived) {
        list = list.filter(c => c.status !== 'Archived');
    }

    const companies = list.map(c => {
        const compEngs = engagements.filter(e => e.company_id === c.id && e.status === 'Completed');
        let lastEngagement = 'N/A';
        if (compEngs.length > 0) {
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

// Delete a company
function deleteCompany(id) {
    const data = readData();
    const companyIdx = data.companies.findIndex(c => c.id === parseInt(id));
    if (companyIdx === -1) return false;

    data.companies.splice(companyIdx, 1);
    // Clean up associated engagements
    data.engagements = data.engagements.filter(e => e.company_id !== parseInt(id));
    return writeData(data);
}

// Archive a company
function archiveCompany(id) {
    const data = readData();
    const company = data.companies.find(c => c.id === parseInt(id));
    if (!company) return false;

    // Toggle status to Archived or restore to Active Partner
    if (company.status === 'Archived') {
        company.status = 'Active Partner';
    } else {
        company.status = 'Archived';
    }
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
        rating_visits: Math.floor(Math.random() * 2) + 4, 
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

    if (eng.approval_hod === 'Approved' && eng.approval_industry === 'Approved') {
        if (eng.status === 'Pending Approval') {
            eng.status = 'Scheduled';
        }
    } else if (eng.approval_hod === 'Rejected' || eng.approval_industry === 'Rejected') {
        eng.status = 'Cancelled';
    } else {
        if (eng.status === 'Scheduled' || eng.status === 'Completed') {
            // Keep status
        } else {
            eng.status = 'Pending Approval';
        }
    }

    const result = writeData(data);
    if (result && eng.status === 'Completed') {
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

// --- USER AUTHENTICATION UTILS ---

// Hash password helper using PBKDF2
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

// Verify password helper
function verifyPassword(password, salt, hash) {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

// Register a new user
function createUser(username, email, password, fullName) {
    const data = readData();

    const trimmedEmail = (email || '').trim().toLowerCase();

    let cleanUsername = username.trim();
    if (cleanUsername.startsWith('@')) {
        cleanUsername = cleanUsername.slice(1);
    }

    // 2. Uniqueness check
    const usernameExists = data.users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    const emailExists = data.users.some(u => u.email.toLowerCase() === trimmedEmail);
    if (usernameExists) {
        return { error: 'Username is already taken.' };
    }
    if (emailExists) {
        return { error: 'Email is already registered.' };
    }

    // 3. Hash password and save
    const { salt, hash } = hashPassword(password);
    const newId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
    
    // Assign first user as active Admin, others default to pending Registered User
    const isFirstUser = data.users.length === 0;
    const role = isFirstUser ? 'Admin' : 'Registered User';
    const status = isFirstUser ? 'Active' : 'Pending';

    const newUser = {
        id: newId,
        username: cleanUsername,
        email: trimmedEmail,
        fullName: (fullName || '').trim(),
        salt,
        hash,
        role,
        status
    };

    data.users.push(newUser);
    const saved = writeData(data);
    if (!saved) return { error: 'Database save error.' };

    const { salt: _, hash: __, ...userProfile } = newUser;
    return { user: userProfile };
}

// Authenticate user credentials
function authenticateUser(usernameOrEmail, password) {
    const data = readData();
    let term = usernameOrEmail.trim().toLowerCase();
    if (term.startsWith('@')) {
        term = term.slice(1);
    }
    
    const user = data.users.find(u => u.username.toLowerCase() === term || u.email.toLowerCase() === term);
    if (!user) return null;

    const isValid = verifyPassword(password, user.salt, user.hash);
    if (!isValid) return null;

    const { salt, hash, ...userProfile } = user;
    return userProfile;
}

// Retrieve user by ID
function getUserById(id) {
    const data = readData();
    const user = data.users.find(u => u.id === parseInt(id));
    if (!user) return null;

    const { salt, hash, ...userProfile } = user;
    return userProfile;
}

// Get all users (for Admin User Management panel)
function getUsers() {
    const data = readData();
    return data.users.map(({ salt, hash, ...userProfile }) => userProfile);
}

// Update user status
function updateUserStatus(id, newStatus) {
    const data = readData();
    const user = data.users.find(u => u.id === parseInt(id));
    if (!user) return false;

    user.status = newStatus;
    // When approved to Active status, change role to Staff (unless already Admin)
    if (newStatus === 'Active' && user.role !== 'Admin') {
        user.role = 'Staff';
    }
    return writeData(data);
}

module.exports = {
    getCompanies,
    getCompanyById,
    addCompany,
    updateCompany,
    deleteCompany,
    archiveCompany,
    getEngagements,
    addEngagement,
    updateEngagementApproval,
    getFeedbackAnalytics,
    createUser,
    authenticateUser,
    getUserById,
    getUsers,
    updateUserStatus
};
