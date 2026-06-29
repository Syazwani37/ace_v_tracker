<?php
require_once 'db.php';

// Fetch engagements
$engagements = get_engagements();

// Clean column values for safe output
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=eeiv_engagements_export_' . date('Ymd_His') . '.csv');

$output = fopen('php://output', 'w');

// Column headers
fputcsv($output, ['Date Occurred', 'Company Name', 'Engagement Type', 'Contact Person', 'Status', 'Students Count', 'Objective']);

// Insert rows
foreach ($engagements as $row) {
    fputcsv($output, [
        $row['date_occurred'],
        $row['company_name'],
        $row['engagement_type'],
        $row['contact_person'],
        $row['status'],
        $row['students_count'],
        $row['objective']
    ]);
}

fclose($output);
exit;
