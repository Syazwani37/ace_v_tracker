// server.js - Extended Express application server
const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up template engine (EJS) and static files routing
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Support parsing URL-encoded request bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---

// 1. Dashboard Page
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

    res.render('index', {
        page_title: "Dashboard",
        current_page: "index",
        engagements,
        companies,
        total_engagements: totalEngagements,
        upcoming_visits: upcomingVisits,
        total_students: totalStudents,
        success_param: successParam
    });
});

// 2. Partner Directory Page (List, Filter, Add/Edit)
app.get('/companies', (req, res) => {
    let companies = db.getCompanies();
    const searchQuery = (req.query.search || '').trim();
    const industryFilter = (req.query.industry || '').trim();

    // Industry options for dropdown menu
    const allCompaniesRaw = db.getCompanies();
    const industries = [...new Set(allCompaniesRaw.map(c => c.industry).filter(Boolean))].sort();

    // Filter list by search term or industry selection
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
        message_type: messageType
    });
});

// 3. Add/Edit Company Handler
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
        // Edit existing company
        const updated = db.updateCompany(id, name, industry, location, status, partnershipDate, contactPerson, email, phone, website, notes);
        if (updated) {
            return res.redirect(`/companies?msg=${encodeURIComponent(`Success! Partner company '<strong>${name}</strong>' has been updated.`)}&msgType=success`);
        } else {
            return res.redirect(`/companies?msg=${encodeURIComponent('Error: Failed to update company. Please try again.')}&msgType=danger`);
        }
    } else {
        // Add new company
        const added = db.addCompany(name, industry, location, status, partnershipDate, contactPerson, email, phone, website, notes);
        if (added) {
            return res.redirect(`/companies?msg=${encodeURIComponent(`Success! Partner company '<strong>${name}</strong>' has been added.`)}&msgType=success`);
        } else {
            return res.redirect(`/companies?msg=${encodeURIComponent(`Error: A partner company named '<strong>${name}</strong>' already exists.`)}&msgType=danger`);
        }
    }
});

// 4. Log Visit Page
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

// 5. Log Visit Handler
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
    
    // Checkboxes will be present if checked, otherwise undefined
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
            if (status === 'Pending Approval') {
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

// 6. Visit Approval Workflow Page
app.get('/visits/approvals', (req, res) => {
    const engagements = db.getEngagements();
    const pendingVisits = engagements.filter(e => e.status === 'Pending Approval');
    const processedVisits = engagements.filter(e => e.status !== 'Pending Approval');

    // Selected visit (via query param ?id=X, default to first pending visit)
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

// 7. Process Visit Approval Handler
app.post('/visits/approvals', (req, res) => {
    const id = parseInt(req.body.id || 0);
    const approvalType = (req.body.approval_type || '').trim(); // 'hod', 'industry', or 'status'
    const approvalStatus = (req.body.approval_status || '').trim(); // 'Approved', 'Rejected', etc.

    if (id > 0 && approvalType && approvalStatus) {
        const updated = db.updateEngagementApproval(id, approvalType, approvalStatus);
        if (updated) {
            return res.redirect(`/visits/approvals?id=${id}&success=approval_updated`);
        }
    }
    return res.redirect('/visits/approvals');
});

// 8. Reports & Analytics Page
app.get('/reports', (req, res) => {
    const engagements = db.getEngagements();
    const companies = db.getCompanies();
    const feedback = db.getFeedbackAnalytics();

    // Aggregate stats by engagement type
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

    // Group engagements by month for Chart.js
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

    const chartMonths = sortedMonths.slice(-5); // last 5 months
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

// 9. CSV Export Route
app.get('/export', (req, res) => {
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
