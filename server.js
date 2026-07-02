// server.js - Extended Express application server with RBAC and User Management
const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up template engine (EJS) and static files routing
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Support parsing URL-encoded request bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// Configure Express Session Management
app.use(session({
    secret: 'avtracker-secret-key-987654321',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: false // Set to true if running on HTTPS
    }
}));

// Authentication Guard Middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        const user = db.getUserById(req.session.userId);
        if (user && user.status === 'Active') {
            return next();
        }
        // If account has been suspended or is pending in real-time, destroy session
        req.session.destroy();
        return res.redirect('/login?error=Your session is invalid or account status is not Active.');
    } else {
        res.redirect('/login');
    }
}

// Admin-Only Guard Middleware
function requireAdmin(req, res, next) {
    if (req.session && req.session.userId) {
        const user = db.getUserById(req.session.userId);
        if (user && user.role === 'Admin') {
            return next();
        }
    }
    // Access Denied: redirect to dashboard with alert
    res.redirect('/?error=access_denied');
}

// Global router interceptor for public paths
app.use((req, res, next) => {
    const publicPaths = ['/login', '/signup'];
    if (publicPaths.includes(req.path) || req.path.startsWith('/static')) {
        return next();
    }
    requireAuth(req, res, next);
});

// Inject logged-in user profile details and pending accounts count into templates
app.use((req, res, next) => {
    if (req.session && req.session.userId) {
        res.locals.user = db.getUserById(req.session.userId);
        if (res.locals.user && res.locals.user.role === 'Admin') {
            const allUsers = db.getUsers();
            res.locals.pendingUsersCount = allUsers.filter(u => u.status === 'Pending').length;
        } else {
            res.locals.pendingUsersCount = 0;
        }
    } else {
        res.locals.user = null;
        res.locals.pendingUsersCount = 0;
    }
    next();
});

// --- AUTHENTICATION ROUTES ---

// Get Login View
app.get('/login', (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/');
    }
    res.render('login', {
        error: req.query.error || '',
        success: req.query.success || ''
    });
});

// Post Login Handler (with user status verification)
app.post('/login', (req, res) => {
    const usernameOrEmail = (req.body.usernameOrEmail || '').trim();
    const password = req.body.password || '';

    if (!usernameOrEmail || !password) {
        return res.redirect('/login?error=Please fill in all fields.');
    }

    const user = db.authenticateUser(usernameOrEmail, password);
    if (user) {
        if (user.status === 'Pending') {
            return res.redirect('/login?error=Your account is pending administrator approval.');
        } else if (user.status === 'Suspended') {
            return res.redirect('/login?error=Your account has been suspended.');
        }
        
        req.session.userId = user.id;
        return res.redirect('/');
    } else {
        return res.redirect('/login?error=Invalid email/username or password.');
    }
});

// Get Sign Up View
app.get('/signup', (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/');
    }
    res.render('signup', {
        error: req.query.error || ''
    });
});

// Post Sign Up Handler
app.post('/signup', (req, res) => {
    const username = (req.body.username || '').trim();
    const email = (req.body.email || '').trim();
    const password = req.body.password || '';
    const confirmPassword = req.body.confirm_password || '';
    const fullName = (req.body.fullName || '').trim();

    if (!username || !email || !password || !confirmPassword || !fullName) {
        return res.redirect('/signup?error=Please fill in all fields.');
    }

    if (password !== confirmPassword) {
        return res.redirect('/signup?error=Passwords do not match.');
    }

    const result = db.createUser(username, email, password, fullName);
    if (result.error) {
        return res.redirect(`/signup?error=${encodeURIComponent(result.error)}`);
    }

    // If the registered user is Active (i.e. the first bootstrapped admin user), log them in
    if (result.user.status === 'Active') {
        req.session.userId = result.user.id;
        return res.send(`
            <script>
                alert("Administrator account created successfully! Logging you in...");
                window.location.href = "/";
            </script>
        `);
    } else {
        return res.send(`
            <script>
                alert("Account registered successfully! Please wait for an administrator to approve your access.");
                window.location.href = "/login";
            </script>
        `);
    }
});

// Logout Handler
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
        }
        res.redirect('/login?success=You have logged out successfully.');
    });
});

// --- ADMINISTRATIVE USER MANAGEMENT ROUTES ---

// Get User List (Admin Only)
app.get('/admin/users', requireAdmin, (req, res) => {
    const users = db.getUsers();
    res.render('admin_users', {
        page_title: "User Account Approvals",
        current_page: "users",
        users,
        success: req.query.success || '',
        error: req.query.error || ''
    });
});

// Update User Account Status (Admin Only)
app.post('/admin/users/status', requireAdmin, (req, res) => {
    const id = parseInt(req.body.id || 0);
    const status = (req.body.status || '').trim();

    if (id > 0 && ['Active', 'Suspended'].includes(status)) {
        // Prevent admins from suspending themselves
        if (id === req.session.userId) {
            return res.redirect('/admin/users?error=You cannot modify your own access status.');
        }

        const updated = db.updateUserStatus(id, status);
        if (updated) {
            return res.redirect(`/admin/users?success=User account status successfully updated to ${status}.`);
        }
    }
    return res.redirect('/admin/users?error=Failed to update user status.');
});

// --- CORE FUNCTIONAL ROUTES ---

// Dashboard Page
app.get('/', (req, res) => {
    const engagements = db.getEngagements();
    const companies = db.getCompanies();
    
    // Compute dashboard statistics dynamically
    const totalEngagements = engagements.length;
    const upcomingVisits = engagements.filter(e => e.status === 'Scheduled' || e.status === 'Pending Approval').length; 
    const totalStudents = engagements.reduce((sum, eng) => {
        return eng.status === 'Completed' ? sum + (parseInt(eng.students_count) || 0) : sum;
    }, 0);

    const successParam = req.query.success || '';
    const errorParam = req.query.error || '';

    res.render('index', {
        page_title: "Dashboard",
        current_page: "index",
        engagements,
        companies,
        total_engagements: totalEngagements,
        upcoming_visits: upcomingVisits,
        total_students: totalStudents,
        success_param: successParam,
        error_param: errorParam
    });
});

// Update Visit Status to Completed (Staff/Admin)
app.post('/visits/complete', (req, res) => {
    const id = parseInt(req.body.id || 0);
    if (id > 0) {
        // Sets status directly to Completed
        const updated = db.updateEngagementApproval(id, 'status', 'Completed');
        if (updated) {
            return res.redirect('/?success=visit_completed');
        }
    }
    return res.redirect('/?error=failed_completion');
});

// Partner Directory Page
app.get('/companies', (req, res) => {
    const isAdmin = res.locals.user && res.locals.user.role === 'Admin';
    // Admins can see Archived companies in database settings if they want
    const includeArchived = req.query.include_archived === 'true' && isAdmin;
    
    let companies = db.getCompanies(includeArchived);
    const searchQuery = (req.query.search || '').trim();
    const industryFilter = (req.query.industry || '').trim();

    const allCompaniesRaw = db.getCompanies(includeArchived);
    const industries = [...new Set(allCompaniesRaw.map(c => c.industry).filter(Boolean))].sort();

    if (searchQuery || industryFilter) {
        companies = companies.filter(c => {
            const matchesSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesIndustry = !industryFilter || c.industry.toLowerCase() === industryFilter.toLowerCase();
            return matchesSearch && matchesIndustry;
        });
    }

    const message = req.query.msg || '';
    const messageType = req.query.msgType || '';

    res.render('companies', {
        page_title: "Partner Directory",
        current_page: "companies",
        companies,
        industries,
        search_query: searchQuery,
        industry_filter: industryFilter,
        message,
        message_type: messageType,
        include_archived: includeArchived
    });
});

// Add/Edit Company Handler
app.post('/companies', (req, res) => {
    const id = req.body.id ? parseInt(req.body.id) : null;
    const name = (req.body.name || '').trim();
    const industry = (req.body.industry || '').trim();
    const location = (req.body.location || '').trim();
    const status = (req.body.status || 'Active Partner').trim();
    const partnershipDate = (req.body.partnership_date || '').trim();
    const contactPerson = (req.body.contact_person || '').trim();
    const email = (req.body.email || '').trim();
    const phone = (req.body.phone || '').trim();
    const website = (req.body.website || '').trim();
    const notes = (req.body.notes || '').trim();

    if (!name || !industry || !location) {
        return res.redirect(`/companies?msg=${encodeURIComponent('Error: Name, Industry, and Location are required.')}&msgType=warning`);
    }

    if (id) {
        const updated = db.updateCompany(id, name, industry, location, status, partnershipDate, contactPerson, email, phone, website, notes);
        if (updated) {
            return res.redirect(`/companies?msg=${encodeURIComponent(`Success! Partner company '<strong>${name}</strong>' has been updated.`)}&msgType=success`);
        } else {
            return res.redirect(`/companies?msg=${encodeURIComponent('Error: Failed to update company. Please try again.')}&msgType=danger`);
        }
    } else {
        const added = db.addCompany(name, industry, location, status, partnershipDate, contactPerson, email, phone, website, notes);
        if (added) {
            return res.redirect(`/companies?msg=${encodeURIComponent(`Success! Partner company '<strong>${name}</strong>' has been added.`)}&msgType=success`);
        } else {
            return res.redirect(`/companies?msg=${encodeURIComponent(`Error: A partner company named '<strong>${name}</strong>' already exists.`)}&msgType=danger`);
        }
    }
});

// Delete Company Handler (Admin Only)
app.post('/companies/delete', requireAdmin, (req, res) => {
    const id = parseInt(req.body.id || 0);
    if (id > 0) {
        const deleted = db.deleteCompany(id);
        if (deleted) {
            return res.redirect(`/companies?msg=${encodeURIComponent('Success! The company profile has been permanently deleted.')}&msgType=success`);
        }
    }
    return res.redirect(`/companies?msg=${encodeURIComponent('Error: Failed to delete the company.')}&msgType=danger`);
});

// Archive Company Handler (Admin Only)
app.post('/companies/archive', requireAdmin, (req, res) => {
    const id = parseInt(req.body.id || 0);
    if (id > 0) {
        const archived = db.archiveCompany(id);
        if (archived) {
            return res.redirect(`/companies?msg=${encodeURIComponent('Success! The company status has been toggled (Archived / Restored).')}&msgType=success`);
        }
    }
    return res.redirect(`/companies?msg=${encodeURIComponent('Error: Failed to toggle archiving status.')}&msgType=danger`);
});

// Log Visit Page
app.get('/add-visit', (req, res) => {
    const companies = db.getCompanies();
    res.render('add_visit', {
        page_title: "Log New Visit",
        current_page: "add-visit",
        companies,
        selected_company_id: req.query.company_id || '',
        message: req.query.msg || '',
        message_type: req.query.msgType || ''
    });
});

// Log Visit Handler
app.post('/add-visit', (req, res) => {
    const companyId = parseInt(req.body.company_id || 0);
    const dateOccurred = (req.body.date_occurred || '').trim();
    const startTime = (req.body.start_time || '').trim();
    const endTime = (req.body.end_time || '').trim();
    const engagementType = (req.body.engagement_type || '').trim();
    const contactPerson = (req.body.contact_person || '').trim();
    const coordinator = (req.body.coordinator || '').trim();
    const status = (req.body.status || 'Pending Approval').trim();
    const studentsCount = parseInt(req.body.students_count || 0);
    const objective = (req.body.objective || '').trim();
    
    const checklistApproved = req.body.checklist_approved === 'on';
    const requiredApproved = req.body.required_approved === 'on';

    if (companyId > 0 && dateOccurred && engagementType && contactPerson) {
        const added = db.addEngagement(
            companyId, 
            dateOccurred, 
            startTime, 
            endTime, 
            engagementType, 
            contactPerson, 
            coordinator, 
            status, 
            objective, 
            studentsCount,
            checklistApproved,
            requiredApproved
        );
        if (added) {
            // Staff users redirect to dashboard, Admin redirect to approvals
            const isAdmin = res.locals.user && res.locals.user.role === 'Admin';
            if (status === 'Pending Approval' && isAdmin) {
                return res.redirect('/visits/approvals?success=visit_logged');
            } else {
                return res.redirect('/?success=visit_logged');
            }
        } else {
            return res.redirect(`/add-visit?msg=${encodeURIComponent('Error: Failed to save the visit. Please check inputs and try again.')}&msgType=danger`);
        }
    } else {
        return res.redirect(`/add-visit?msg=${encodeURIComponent('Error: Please fill in all required fields.')}&msgType=warning`);
    }
});

// Visit Approvals Workflow Page (Admin Only)
app.get('/visits/approvals', requireAdmin, (req, res) => {
    const engagements = db.getEngagements();
    const pendingVisits = engagements.filter(e => e.status === 'Pending Approval');
    const processedVisits = engagements.filter(e => e.status !== 'Pending Approval');

    let selectedVisit = null;
    const selectedId = parseInt(req.query.id);
    if (selectedId) {
        selectedVisit = engagements.find(e => e.id === selectedId) || null;
    } else if (pendingVisits.length > 0) {
        selectedVisit = pendingVisits[0];
    } else if (engagements.length > 0) {
        selectedVisit = engagements[0];
    }

    const successParam = req.query.success || '';

    res.render('approvals', {
        page_title: "Visit Approvals",
        current_page: "visits",
        pending_visits: pendingVisits,
        processed_visits: processedVisits,
        selected_visit: selectedVisit,
        success_param: successParam
    });
});

// Process Visit Approval Handler (Admin Only)
app.post('/visits/approvals', requireAdmin, (req, res) => {
    const id = parseInt(req.body.id || 0);
    const approvalType = (req.body.approval_type || '').trim();
    const approvalStatus = (req.body.approval_status || '').trim();

    if (id > 0 && approvalType && approvalStatus) {
        const updated = db.updateEngagementApproval(id, approvalType, approvalStatus);
        if (updated) {
            return res.redirect(`/visits/approvals?id=${id}&success=approval_updated`);
        }
    }
    return res.redirect('/visits/approvals');
});

// Reports & Analytics Page (Admin Only)
app.get('/reports', requireAdmin, (req, res) => {
    const engagements = db.getEngagements();
    const companies = db.getCompanies(true); // include archived in full reports if needed
    const feedback = db.getFeedbackAnalytics();

    const typeStats = {
        'Site Visit': { visits: 0, students: 0 },
        'Guest Lecture': { visits: 0, students: 0 },
        'Workshop': { visits: 0, students: 0 },
        'Tech Talk': { visits: 0, students: 0 },
        'Career Fair': { visits: 0, students: 0 },
        'Advisory Panel': { visits: 0, students: 0 }
    };

    let totalVisitsCalc = 0;
    let totalStudentsCalc = 0;

    engagements.forEach(eng => {
        const t = eng.engagement_type;
        if (typeStats[t]) {
            typeStats[t].visits++;
            if (eng.status === 'Completed') {
                typeStats[t].students += (parseInt(eng.students_count) || 0);
                totalStudentsCalc += (parseInt(eng.students_count) || 0);
            }
            totalVisitsCalc++;
        }
    });

    const monthlyDataMap = {};
    engagements.forEach(eng => {
        if (eng.date_occurred) {
            const dateObj = new Date(eng.date_occurred);
            if (!isNaN(dateObj)) {
                const monthName = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                monthlyDataMap[monthName] = (monthlyDataMap[monthName] || 0) + 1;
            }
        }
    });

    const sortedMonths = Object.keys(monthlyDataMap).sort((a, b) => {
        return new Date(a) - new Date(b);
    });

    const chartMonths = sortedMonths.slice(-5);
    const chartCounts = chartMonths.map(m => monthlyDataMap[m]);

    res.render('report_analytics', {
        page_title: "Reports & Analytics",
        current_page: "reports",
        engagements,
        companies,
        feedback,
        type_stats: typeStats,
        total_visits_calc: totalVisitsCalc,
        total_students_calc: totalStudentsCalc,
        chart_months: chartMonths,
        chart_counts: chartCounts
    });
});

// CSV Export Route (Admin Only)
app.get('/export', requireAdmin, (req, res) => {
    const engagements = db.getEngagements();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=avtracker_engagements_export_${new Date().toISOString().slice(0,10).replace(/-/g, '')}.csv`);
    
    let csvContent = 'Date Occurred,Start Time,End Time,Company Name,Engagement Type,Contact Person,Coordinator,Status,Students Count,Objective\n';
    
    engagements.forEach(row => {
        const escapeCsv = (val) => {
            if (val === null || val === undefined) return '""';
            return `"${val.toString().replace(/"/g, '""')}"`;
        };

        csvContent += [
            escapeCsv(row.date_occurred),
            escapeCsv(row.start_time),
            escapeCsv(row.end_time),
            escapeCsv(row.company_name),
            escapeCsv(row.engagement_type),
            escapeCsv(row.contact_person),
            escapeCsv(row.coordinator),
            escapeCsv(row.status),
            row.students_count,
            escapeCsv(row.objective)
        ].join(',') + '\n';
    });

    res.send(csvContent);
});

// Start listening for requests
app.listen(PORT, () => {
    console.log(`AVTracker server successfully started at http://localhost:${PORT}`);
});
