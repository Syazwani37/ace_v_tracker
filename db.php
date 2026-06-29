<?php
// db.php - Database connection and helpers

// Determine if SQLite is available
$use_sqlite = extension_loaded('pdo_sqlite');
$db_file = __DIR__ . '/tracker.db';
$json_file = __DIR__ . '/database.json';

// Initialize Database connection
$pdo = null;
if ($use_sqlite) {
    try {
        $pdo = new PDO("sqlite:" . $db_file);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        
        // Create tables if they don't exist
        $pdo->exec("CREATE TABLE IF NOT EXISTS companies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            industry TEXT,
            location TEXT,
            status TEXT,
            partnership_date TEXT
        )");

        $pdo->exec("CREATE TABLE IF NOT EXISTS engagements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id INTEGER,
            date_occurred TEXT,
            engagement_type TEXT,
            contact_person TEXT,
            status TEXT,
            objective TEXT,
            students_count INTEGER DEFAULT 0,
            FOREIGN KEY (company_id) REFERENCES companies(id)
        )");

        $pdo->exec("CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            engagement_id INTEGER,
            rating_visits INTEGER,
            rating_learning INTEGER,
            rating_feedback INTEGER,
            comments TEXT,
            FOREIGN KEY (engagement_id) REFERENCES engagements(id)
        )");

        // Seed default data if empty
        $count = $pdo->query("SELECT COUNT(*) FROM companies")->fetchColumn();
        if ($count == 0) {
            seed_mock_data_sqlite($pdo);
        }
    } catch (PDOException $e) {
        // Fallback to JSON if PDO fails
        $use_sqlite = false;
    }
}

// If SQLite is not available or failed, check JSON database
if (!$use_sqlite) {
    if (!file_exists($json_file)) {
        seed_mock_data_json($json_file);
    }
}

// --- HELPER FUNCTIONS ---

// SQLite seed
function seed_mock_data_sqlite($pdo) {
    $companies = [
        ['Tesla Motors', 'Automotive', 'Selangor', 'Active Partner', '2023-10-15'],
        ['Google', 'IT/Tech', 'Kuala Lumpur', 'Active Partner', '2023-08-20'],
        ['Intel Corporation', 'Manufacturing', 'Penang', 'Active Partner', '2022-11-05'],
        ['Microsoft', 'IT/Tech', 'Kuala Lumpur', 'Active Partner', '2023-05-12'],
        ['Petronas', 'Energy', 'Terengganu', 'Active Partner', '2023-12-01'],
        ['Dyson', 'Manufacturing', 'Johor', 'Pending', '2024-01-10']
    ];

    $stmt = $pdo->prepare("INSERT OR IGNORE INTO companies (name, industry, location, status, partnership_date) VALUES (?, ?, ?, ?, ?)");
    foreach ($companies as $c) {
        $stmt->execute($c);
    }

    $engagements = [
        [2, '2024-05-12', 'Tech Talk', 'Sarah Jenkins', 'Scheduled', 'Guest lecture on cloud services', 85],
        [1, '2024-04-18', 'Site Visit', 'Ahmad Rizal', 'Completed', 'Industrial visit to Tesla Selangor factory', 35],
        [3, '2024-03-22', 'Workshop', 'Lim Wei Sheung', 'Completed', 'Hands-on embedded systems training', 28],
        [4, '2024-02-15', 'Guest Lecture', 'Pradeep Kumar', 'Completed', 'DevOps career talk and panel', 120],
        [5, '2024-01-20', 'Site Visit', 'Farhana Rahim', 'Completed', 'Visit to Kerteh refinery control center', 45]
    ];

    $stmt2 = $pdo->prepare("INSERT INTO engagements (company_id, date_occurred, engagement_type, contact_person, status, objective, students_count) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($engagements as $eng) {
        $stmt2->execute($eng);
    }

    $feedbacks = [
        [2, 5, 4, 5, 'Highly interactive, students loved the live demonstrations.'],
        [3, 4, 5, 4, 'Very technical, good for engineering students.'],
        [4, 5, 5, 5, 'Inspirational speaker, excellent career insights.'],
        [5, 4, 4, 4, 'Great safety briefing, clean facilities.']
    ];

    $stmt3 = $pdo->prepare("INSERT INTO feedback (engagement_id, rating_visits, rating_learning, rating_feedback, comments) VALUES (?, ?, ?, ?, ?)");
    foreach ($feedbacks as $fb) {
        $stmt3->execute($fb);
    }
}

// JSON database seeding
function seed_mock_data_json($filepath) {
    $data = [
        'companies' => [
            ['id' => 1, 'name' => 'Tesla Motors', 'industry' => 'Automotive', 'location' => 'Selangor', 'status' => 'Active Partner', 'partnership_date' => '2023-10-15'],
            ['id' => 2, 'name' => 'Google', 'industry' => 'IT/Tech', 'location' => 'Kuala Lumpur', 'status' => 'Active Partner', 'partnership_date' => '2023-08-20'],
            ['id' => 3, 'name' => 'Intel Corporation', 'industry' => 'Manufacturing', 'location' => 'Penang', 'status' => 'Active Partner', 'partnership_date' => '2022-11-05'],
            ['id' => 4, 'name' => 'Microsoft', 'industry' => 'IT/Tech', 'location' => 'Kuala Lumpur', 'status' => 'Active Partner', 'partnership_date' => '2023-05-12'],
            ['id' => 5, 'name' => 'Petronas', 'industry' => 'Energy', 'location' => 'Terengganu', 'status' => 'Active Partner', 'partnership_date' => '2023-12-01'],
            ['id' => 6, 'name' => 'Dyson', 'industry' => 'Manufacturing', 'location' => 'Johor', 'status' => 'Pending', 'partnership_date' => '2024-01-10']
        ],
        'engagements' => [
            ['id' => 1, 'company_id' => 2, 'date_occurred' => '2024-05-12', 'engagement_type' => 'Tech Talk', 'contact_person' => 'Sarah Jenkins', 'status' => 'Scheduled', 'objective' => 'Guest lecture on cloud services', 'students_count' => 85],
            ['id' => 2, 'company_id' => 1, 'date_occurred' => '2024-04-18', 'engagement_type' => 'Site Visit', 'contact_person' => 'Ahmad Rizal', 'status' => 'Completed', 'objective' => 'Industrial visit to Tesla Selangor factory', 'students_count' => 35],
            ['id' => 3, 'company_id' => 3, 'date_occurred' => '2024-03-22', 'engagement_type' => 'Workshop', 'contact_person' => 'Lim Wei Sheung', 'status' => 'Completed', 'objective' => 'Hands-on embedded systems training', 'students_count' => 28],
            ['id' => 4, 'company_id' => 4, 'date_occurred' => '2024-02-15', 'engagement_type' => 'Guest Lecture', 'contact_person' => 'Pradeep Kumar', 'status' => 'Completed', 'objective' => 'DevOps career talk and panel', 'students_count' => 120],
            ['id' => 5, 'company_id' => 5, 'date_occurred' => '2024-01-20', 'engagement_type' => 'Site Visit', 'contact_person' => 'Farhana Rahim', 'status' => 'Completed', 'objective' => 'Visit to Kerteh refinery control center', 'students_count' => 45]
        ],
        'feedback' => [
            ['id' => 1, 'engagement_id' => 2, 'rating_visits' => 5, 'rating_learning' => 4, 'rating_feedback' => 5, 'comments' => 'Highly interactive, students loved the live demonstrations.'],
            ['id' => 2, 'engagement_id' => 3, 'rating_visits' => 4, 'rating_learning' => 5, 'rating_feedback' => 4, 'comments' => 'Very technical, good for engineering students.'],
            ['id' => 3, 'engagement_id' => 4, 'rating_visits' => 5, 'rating_learning' => 5, 'rating_feedback' => 5, 'comments' => 'Inspirational speaker, excellent career insights.'],
            ['id' => 4, 'engagement_id' => 5, 'rating_visits' => 4, 'rating_learning' => 4, 'rating_feedback' => 4, 'comments' => 'Great safety briefing, clean facilities.']
        ]
    ];
    file_put_contents($filepath, json_encode($data, JSON_PRETTY_PRINT));
}

// Fetch all companies
function get_companies() {
    global $use_sqlite, $pdo, $json_file;
    if ($use_sqlite) {
        $stmt = $pdo->query("SELECT * FROM companies ORDER BY name ASC");
        return $stmt->fetchAll();
    } else {
        $data = json_decode(file_get_contents($json_file), true);
        $companies = $data['companies'];
        usort($companies, function($a, $b) {
            return strcmp($a['name'], $b['name']);
        });
        return $companies;
    }
}

// Fetch single company
function get_company_by_id($id) {
    global $use_sqlite, $pdo, $json_file;
    if ($use_sqlite) {
        $stmt = $pdo->prepare("SELECT * FROM companies WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    } else {
        $data = json_decode(file_get_contents($json_file), true);
        foreach ($data['companies'] as $c) {
            if ($c['id'] == $id) return $c;
        }
        return null;
    }
}

// Add a company
function add_company($name, $industry, $location, $status, $partnership_date) {
    global $use_sqlite, $pdo, $json_file;
    if ($use_sqlite) {
        try {
            $stmt = $pdo->prepare("INSERT INTO companies (name, industry, location, status, partnership_date) VALUES (?, ?, ?, ?, ?)");
            return $stmt->execute([$name, $industry, $location, $status, $partnership_date]);
        } catch (PDOException $e) {
            return false;
        }
    } else {
        $data = json_decode(file_get_contents($json_file), true);
        // Check uniqueness
        foreach ($data['companies'] as $c) {
            if (strcasecmp($c['name'], $name) == 0) return false;
        }
        $new_id = count($data['companies']) > 0 ? max(array_column($data['companies'], 'id')) + 1 : 1;
        $data['companies'][] = [
            'id' => $new_id,
            'name' => $name,
            'industry' => $industry,
            'location' => $location,
            'status' => $status,
            'partnership_date' => $partnership_date
        ];
        file_put_contents($json_file, json_encode($data, JSON_PRETTY_PRINT));
        return true;
    }
}

// Fetch engagements with company names
function get_engagements() {
    global $use_sqlite, $pdo, $json_file;
    if ($use_sqlite) {
        $stmt = $pdo->query("
            SELECT e.*, c.name as company_name 
            FROM engagements e 
            JOIN companies c ON e.company_id = c.id 
            ORDER BY e.date_occurred DESC
        ");
        return $stmt->fetchAll();
    } else {
        $data = json_decode(file_get_contents($json_file), true);
        $engagements = $data['engagements'];
        $companies = [];
        foreach ($data['companies'] as $c) {
            $companies[$c['id']] = $c['name'];
        }
        foreach ($engagements as &$e) {
            $e['company_name'] = isset($companies[$e['company_id']]) ? $companies[$e['company_id']] : 'Unknown';
        }
        usort($engagements, function($a, $b) {
            return strcmp($b['date_occurred'], $a['date_occurred']); // DESC
        });
        return $engagements;
    }
}

// Add an engagement
function add_engagement($company_id, $date_occurred, $engagement_type, $contact_person, $status, $objective, $students_count) {
    global $use_sqlite, $pdo, $json_file;
    if ($use_sqlite) {
        $stmt = $pdo->prepare("INSERT INTO engagements (company_id, date_occurred, engagement_type, contact_person, status, objective, students_count) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $result = $stmt->execute([$company_id, $date_occurred, $engagement_type, $contact_person, $status, $objective, $students_count]);
        
        if ($result && $status == 'Completed') {
            // Seed a random feedback for completed ones to keep analytics interesting
            $engagement_id = $pdo->lastInsertId();
            add_random_feedback($engagement_id);
        }
        return $result;
    } else {
        $data = json_decode(file_get_contents($json_file), true);
        $new_id = count($data['engagements']) > 0 ? max(array_column($data['engagements'], 'id')) + 1 : 1;
        $data['engagements'][] = [
            'id' => $new_id,
            'company_id' => intval($company_id),
            'date_occurred' => $date_occurred,
            'engagement_type' => $engagement_type,
            'contact_person' => $contact_person,
            'status' => $status,
            'objective' => $objective,
            'students_count' => intval($students_count)
        ];
        file_put_contents($json_file, json_encode($data, JSON_PRETTY_PRINT));
        
        if ($status == 'Completed') {
            add_random_feedback_json($new_id);
        }
        return true;
    }
}

// Random feedback generator to populate database beautifully
function add_random_feedback($engagement_id) {
    global $pdo;
    $comments = [
        'Fantastic engagement, students were highly involved.',
        'Good insights into industry realities.',
        'Speaker was very informative. Recommended for next year.',
        'Interesting visit, though some parts could be shorter.',
        'Excellent practical learning opportunity!'
    ];
    $comment = $comments[array_rand($comments)];
    $rating_visits = rand(4, 5);
    $rating_learning = rand(4, 5);
    $rating_feedback = rand(4, 5);
    
    $stmt = $pdo->prepare("INSERT INTO feedback (engagement_id, rating_visits, rating_learning, rating_feedback, comments) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$engagement_id, $rating_visits, $rating_learning, $rating_feedback, $comment]);
}

function add_random_feedback_json($engagement_id) {
    global $json_file;
    $data = json_decode(file_get_contents($json_file), true);
    $comments = [
        'Fantastic engagement, students were highly involved.',
        'Good insights into industry realities.',
        'Speaker was very informative. Recommended for next year.',
        'Interesting visit, though some parts could be shorter.',
        'Excellent practical learning opportunity!'
    ];
    $comment = $comments[array_rand($comments)];
    $new_id = count($data['feedback']) > 0 ? max(array_column($data['feedback'], 'id')) + 1 : 1;
    $data['feedback'][] = [
        'id' => $new_id,
        'engagement_id' => intval($engagement_id),
        'rating_visits' => rand(4, 5),
        'rating_learning' => rand(4, 5),
        'rating_feedback' => rand(4, 5),
        'comments' => $comment
    ];
    file_put_contents($json_file, json_encode($data, JSON_PRETTY_PRINT));
}

// Get feedback average and feedback data
function get_feedback_analytics() {
    global $use_sqlite, $pdo, $json_file;
    if ($use_sqlite) {
        $stmt = $pdo->query("
            SELECT 
                AVG(rating_visits) as avg_visits,
                AVG(rating_learning) as avg_learning,
                AVG(rating_feedback) as avg_feedback,
                COUNT(*) as total_feedback
            FROM feedback
        ");
        return $stmt->fetch();
    } else {
        $data = json_decode(file_get_contents($json_file), true);
        $feedbacks = $data['feedback'];
        $total = count($feedbacks);
        if ($total == 0) {
            return ['avg_visits' => 0, 'avg_learning' => 0, 'avg_feedback' => 0, 'total_feedback' => 0];
        }
        $visits = array_sum(array_column($feedbacks, 'rating_visits')) / $total;
        $learning = array_sum(array_column($feedbacks, 'rating_learning')) / $total;
        $feedback = array_sum(array_column($feedbacks, 'rating_feedback')) / $total;
        return [
            'avg_visits' => $visits,
            'avg_learning' => $learning,
            'avg_feedback' => $feedback,
            'total_feedback' => $total
        ];
    }
}
