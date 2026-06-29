<?php
require_once 'db.php';

$page_title = "Reports & Analytics";
include 'header.php';

// Fetch data
$engagements = get_engagements();
$companies = get_companies();
$feedback = get_feedback_analytics();

// Calculate engagement types stats
$type_stats = [
    'Site Visit' => ['visits' => 0, 'students' => 0],
    'Guest Lecture' => ['visits' => 0, 'students' => 0],
    'Workshop' => ['visits' => 0, 'students' => 0],
    'Tech Talk' => ['visits' => 0, 'students' => 0],
    'Career Fair' => ['visits' => 0, 'students' => 0],
    'Advisory Panel' => ['visits' => 0, 'students' => 0],
];

$total_visits_calc = 0;
$total_students_calc = 0;

foreach ($engagements as $eng) {
    $t = $eng['engagement_type'];
    if (isset($type_stats[$t])) {
        $type_stats[$t]['visits']++;
        if ($eng['status'] == 'Completed') {
            $type_stats[$t]['students'] += intval($eng['students_count']);
            $total_students_calc += intval($eng['students_count']);
        }
        $total_visits_calc++;
    }
}

// Group engagements by month for Chart.js
$monthly_data = [];
foreach ($engagements as $eng) {
    if (!empty($eng['date_occurred'])) {
        $month = date('F Y', strtotime($eng['date_occurred'])); // e.g. "May 2024"
        if (!isset($monthly_data[$month])) {
            $monthly_data[$month] = 0;
        }
        $monthly_data[$month]++;
    }
}
// Sort chronological-ish or keep order of date. Let's sort by date key.
uksort($monthly_data, function($a, $b) {
    return strtotime($a) - strtotime($b);
});

// Take the last 6 months for chart display
$chart_months = array_keys($monthly_data);
$chart_counts = array_values($monthly_data);

// Feedback stars rendering helper
function render_stars($rating) {
    $rating = round($rating * 2) / 2; // round to nearest 0.5
    $output = '<div class="text-warning d-flex gap-1">';
    for ($i = 1; $i <= 5; $i++) {
        if ($rating >= $i) {
            $output .= '<i class="fas fa-star"></i>';
        } elseif ($rating >= $i - 0.5) {
            $output .= '<i class="fas fa-star-half-alt"></i>';
        } else {
            $output .= '<i class="far fa-star"></i>';
        }
    }
    $output .= '</div>';
    return $output;
}
?>

<div class="app-container">
    <?php include 'sidebar.php'; ?>
    
    <main class="main-content">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="page-title-section mb-0">
                <h2>Reports Center</h2>
                <p>View analysis reports, student feedback, and monthly dynamic engagement analytics.</p>
            </div>
            <div>
                <a href="export.php" class="btn btn-primary btn-sm">
                    <i class="fa-solid fa-file-export me-1"></i> Export Data CSV
                </a>
            </div>
        </div>

        <!-- Top Row: Engagement Summary & Partnerships -->
        <div class="row g-4 mb-4">
            <!-- Summary Table and Chart -->
            <div class="col-lg-7">
                <div class="panel-card h-100 mb-0">
                    <div class="panel-card-header">
                        <h5>Engagement Type Summary</h5>
                        <span class="text-muted text-xs">Dynamic DB aggregation</span>
                    </div>
                    <div class="panel-card-body">
                        <div class="row g-4">
                            <!-- Table -->
                            <div class="col-md-7">
                                <div class="table-responsive">
                                    <table class="table align-middle m-0" style="font-size: 0.85rem;">
                                        <thead>
                                            <tr class="border-b text-muted text-uppercase text-xxs">
                                                <th class="pb-2">Type</th>
                                                <th class="pb-2 text-end">Visits</th>
                                                <th class="pb-2 text-end">Students Reached</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y text-secondary">
                                            <?php foreach ($type_stats as $type => $stats): ?>
                                                <tr>
                                                    <td class="py-2 fw-medium text-dark"><?php echo $type; ?></td>
                                                    <td class="py-2 text-end"><?php echo $stats['visits']; ?></td>
                                                    <td class="py-2 text-end"><?php echo $stats['students']; ?></td>
                                                </tr>
                                            <?php endforeach; ?>
                                            <tr class="fw-bold text-dark border-top">
                                                <td class="py-2">Total Combined</td>
                                                <td class="py-2 text-end"><?php echo $total_visits_calc; ?></td>
                                                <td class="py-2 text-end"><?php echo $total_students_calc; ?></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <!-- Chart -->
                            <div class="col-md-5 d-flex flex-column justify-content-between">
                                <div>
                                    <h6 class="text-xs font-semibold text-secondary text-uppercase tracking-wider mb-3 text-center">Monthly Activities</h6>
                                    <div class="relative" style="height: 160px; position: relative;">
                                        <canvas id="monthlyChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Partnership Status Table -->
            <div class="col-lg-5">
                <div class="panel-card h-100 mb-0">
                    <div class="panel-card-header">
                        <h5>Partner Status Report</h5>
                        <a href="companies.php" class="text-primary text-xs text-decoration-none fw-semibold">View All</a>
                    </div>
                    <div class="panel-card-body p-0">
                        <div class="table-responsive">
                            <table class="table custom-table align-middle" style="font-size: 0.85rem;">
                                <thead>
                                    <tr>
                                        <th>Company</th>
                                        <th>Industry</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php 
                                    // Display first 5 companies
                                    $limited_companies = array_slice($companies, 0, 5);
                                    foreach ($limited_companies as $c): 
                                        $status_class = 'badge-pending';
                                        if ($c['status'] == 'Active Partner') $status_class = 'badge-completed';
                                        elseif ($c['status'] == 'Pending') $status_class = 'badge-pending';
                                        elseif ($c['status'] == 'Inactive') $status_class = 'badge-cancelled';
                                    ?>
                                        <tr>
                                            <td><strong><?php echo htmlspecialchars($c['name']); ?></strong></td>
                                            <td><?php echo htmlspecialchars($c['industry']); ?></td>
                                            <td>
                                                <span class="badge-custom <?php echo $status_class; ?>" style="font-size: 0.7rem; padding: 0.2em 0.5em;">
                                                    <?php echo htmlspecialchars($c['status']); ?>
                                                </span>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Row: Feedback, Word Cloud & Export Logs -->
        <div class="panel-card">
            <div class="panel-card-header">
                <h5>Student Feedback & Insights</h5>
                <span class="text-muted text-xs">Based on completed visits</span>
            </div>
            <div class="panel-card-body">
                <div class="row g-4 align-items-center">
                    <!-- Feedback Stars -->
                    <div class="col-md-4">
                        <h6 class="text-xs font-semibold text-secondary text-uppercase tracking-wider mb-3">Average Ratings</h6>
                        <div class="d-flex flex-column gap-3">
                            <div class="d-flex align-items-center justify-content-between">
                                <span class="text-sm font-medium text-dark">Logistics & Organization</span>
                                <?php echo render_stars($feedback['avg_visits']); ?>
                            </div>
                            <div class="d-flex align-items-center justify-content-between">
                                <span class="text-sm font-medium text-dark">Learning & Technical Value</span>
                                <?php echo render_stars($feedback['avg_learning']); ?>
                            </div>
                            <div class="d-flex align-items-center justify-content-between">
                                <span class="text-sm font-medium text-dark">Overall Satisfaction</span>
                                <?php echo render_stars($feedback['avg_feedback']); ?>
                            </div>
                            <div class="text-xxs text-muted mt-2 border-top pt-2 text-center">
                                Compiled from <?php echo intval($feedback['total_feedback']); ?> submitted student surveys.
                            </div>
                        </div>
                    </div>

                    <!-- Word Cloud Mock -->
                    <div class="col-md-4 border-start border-end">
                        <h6 class="text-xs font-semibold text-secondary text-uppercase tracking-wider mb-3 text-center">Student Feedback Keywords</h6>
                        <div class="word-cloud-container">
                            <span class="word-cloud-item text-primary fw-bold fs-4">learning</span>
                            <span class="word-cloud-item text-success fw-semibold fs-5">industry</span>
                            <span class="word-cloud-item text-warning fw-medium fs-6">knowledge</span>
                            <span class="word-cloud-item text-info fw-bold fs-5">practical</span>
                            <span class="word-cloud-item text-danger fw-semibold fs-6">skills</span>
                            <span class="word-cloud-item text-secondary fw-medium text-xs">exposure</span>
                            <span class="word-cloud-item text-primary fw-semibold fs-5">experience</span>
                            <span class="word-cloud-item text-success fw-bold fs-4">feedback</span>
                        </div>
                    </div>

                    <!-- Recent Activity Logs -->
                    <div class="col-md-4">
                        <h6 class="text-xs font-semibold text-secondary text-uppercase tracking-wider mb-3">Log Activity Feed</h6>
                        <div class="d-flex flex-column gap-2">
                            <div class="p-2 bg-light rounded border d-flex justify-content-between align-items-center" style="font-size: 0.8rem;">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fa-solid fa-cloud-arrow-down text-primary"></i>
                                    <span>CSV Export executed</span>
                                </div>
                                <span class="text-xxs text-muted">Just now</span>
                            </div>
                            <div class="p-2 bg-light rounded border d-flex justify-content-between align-items-center" style="font-size: 0.8rem;">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fa-solid fa-plus-circle text-success"></i>
                                    <span>Added Partner 'Tesla'</span>
                                </div>
                                <span class="text-xxs text-muted">2 hours ago</span>
                            </div>
                            <div class="p-2 bg-light rounded border d-flex justify-content-between align-items-center" style="font-size: 0.8rem;">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fa-solid fa-calendar-check text-info"></i>
                                    <span>Logged visit with 'Google'</span>
                                </div>
                                <span class="text-xxs text-muted">1 day ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

<!-- Chart Script -->
<script>
document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: <?php echo json_encode(array_slice($chart_months, -5)); ?>,
            datasets: [{
                label: 'Engagements',
                data: <?php echo json_encode(array_slice($chart_counts, -5)); ?>,
                backgroundColor: '#4f46e5',
                hoverBackgroundColor: '#4338ca',
                borderRadius: 6,
                barPercentage: 0.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { borderDash: [2, 4], color: '#f1f5f9' },
                    border: { display: false },
                    ticks: { font: { size: 9 }, color: '#94a3b8', stepSize: 1 }
                },
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { font: { size: 9 }, color: '#94a3b8' }
                }
            }
        }
    });
});
</script>

<?php include 'footer.php'; ?>
