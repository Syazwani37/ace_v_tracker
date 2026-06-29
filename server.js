// server.js - Core Express application server
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
    
    // Compute dashboard statistics
    const totalEngagements = engagements.length;
    const totalCompanies = companies.length;
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
        total_companies: totalCompanies,
        total_students: totalStudents,
        success_param: successParam
    });
});

// 2. Partner Directory Page (List & Filters)
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

// 3. Add Company Handler
app.post('/companies', (req, res) => {
    const name = (req.body.name || '').trim();
    const industry = (req.body.industry || '').trim();
    const location = (req.body.location || '').trim();
    const status = (req.body.status || 'Active Partner').trim();
    const partnershipDate = (req.body.partnership_date || '').trim();

    if (name && industry && location) {
        const added = db.addCompany(name, industry, location, status, partnershipDate);
        if (added) {
            return res.redirect(`/companies?msg=${encodeURIComponent(`Success! Partner company '<strong>${name}</strong>' has been added.`)}&msgType=success`);
        } else {
            return res.redirect(`/companies?msg=${encodeURIComponent(`Error: A partner company named '<strong>${name}</strong>' already exists or an error occurred.`)}&msgType=danger`);
        }
    } else {
        return res.redirect(`/companies?msg=${encodeURIComponent('Error: All fields (Name, Industry, Location) are required.')}&msgType=warning`);
    }
});

// 4. Log Visit Page
app.get('/add-visit', (req, res) => {
    const companies = db.getCompanies();
    res.render('add_visit', {
        page_title: "Log New Visit",
        current_page: "add-visit",
        companies,
        message: req.query.msg || '',
        message_type: req.query.msgType || ''
    });
});

// 5. Log Visit Handler
app.post('/add-visit', (req, res) => {
    const companyId = parseInt(req.body.company_id || 0);
    const dateOccurred = (req.body.date_occurred || '').trim();
    const engagementType = (req.body.engagement_type || '').trim();
    const contactPerson = (req.body.contact_person || '').trim();
    const status = (req.body.status || 'Scheduled').trim();
    const studentsCount = parseInt(req.body.students_count || 0);
    const objective = (req.body.objective || '').trim();

    if (companyId > 0 && dateOccurred && engagementType && contactPerson) {
        const added = db.addEngagement(companyId, dateOccurred, engagementType, contactPerson, status, objective, studentsCount);
        if (added) {
            return res.redirect('/?success=visit_logged');
        } else {
            return res.redirect(`/add-visit?msg=${encodeURIComponent('Error: Failed to save the visit. Please check inputs and try again.')}&msgType=danger`);
        }
    } else {
        return res.redirect(`/add-visit?msg=${encodeURIComponent('Error: Please fill in all required fields.')}&msgType=warning`);
    }
});

// 6. Reports & Analytics Page
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
                // Formatting month e.g., "May 2024"
                const monthName = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                monthlyDataMap[monthName] = (monthlyDataMap[monthName] || 0) + 1;
            }
        }
    });

    // Sort chronologically by date
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

// 7. CSV Export Route
app.get('/export', (req, res) => {
    const engagements = db.getEngagements();
    
    // Set headers for CSV attachment download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=avtracker_engagements_export_${new Date().toISOString().slice(0,10).replace(/-/g, '')}.csv`);
    
    let csvContent = 'Date Occurred,Company Name,Engagement Type,Contact Person,Status,Students Count,Objective\n';
    
    engagements.forEach(row => {
        const escapeCsv = (val) => {
            if (val === null || val === undefined) return '""';
            return `"${val.toString().replace(/"/g, '""')}"`;
        };

        csvContent += [
            escapeCsv(row.date_occurred),
            escapeCsv(row.company_name),
            escapeCsv(row.engagement_type),
            escapeCsv(row.contact_person),
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
