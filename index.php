<?php
require_once 'db.php';

$page_title = "Dashboard";
include 'header.php';

$engagements = get_engagements();
$companies = get_companies();

// Calculate metrics
$total_engagements = count($engagements);
$total_companies = count($companies);
$total_students = 0;
foreach ($engagements as $eng) {
    if ($eng['status'] == 'Completed') {
        $total_students += intval($eng['students_count']);
    }
}
?>

<div class="app-container">
    <?php include 'sidebar.php'; ?>
    
    <main class="main-content">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="page-title-section mb-0">
                <h2>Engagement Dashboard</h2>
                <p>Welcome back! Here is a summary of employer engagements and partnership activity.</p>
            </div>
            <div>
                <a href="export.php" class="btn btn-outline-secondary btn-sm me-2">
                    <i class="fa-solid fa-file-csv me-1"></i> Export CSV
                </a>
                <a href="add_visit.php" class="btn btn-primary btn-sm">
                    <i class="fa-solid fa-plus me-1"></i> Log Visit
                </a>
            </div>
        </div>

        <!-- Success Notifications -->
        <?php if (($status_param = ($_GET['success'] ?? '')) === 'visit_logged'): ?>
            <div class="alert alert-success alert-dismissible fade show mb-4" role="alert">
                <i class="fa-solid fa-circle-check me-2"></i> Industrial visit has been successfully logged into the database.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        <?php endif; ?>

        <!-- Metrics Row -->
        <div class="row g-4 mb-4">
            <div class="col-md-4 stat-card-wrapper">
                <div class="stat-card">
                    <div class="stat-icon primary">
                        <i class="fa-solid fa-calendar-check"></i>
                    </div>
                    <div class="stat-card-info">
                        <h6>Total Engagements</h6>
                        <h2><?php echo $total_engagements; ?></h2>
                    </div>
                </div>
            </div>
            <div class="col-md-4 stat-card-wrapper">
                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fa-solid fa-handshake"></i>
                    </div>
                    <div class="stat-card-info">
                        <h6>Industry Partners</h6>
                        <h2><?php echo $total_companies; ?></h2>
                    </div>
                </div>
            </div>
            <div class="col-md-4 stat-card-wrapper">
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fa-solid fa-users text-warning"></i>
                    </div>
                    <div class="stat-card-info">
                        <h6>Student Impact</h6>
                        <h2><?php echo $total_students; ?></h2>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Panel: Recent Engagements -->
        <div class="panel-card">
            <div class="panel-card-header">
                <h5>Recent Employer Engagements</h5>
                <span class="text-muted text-xs"><?php echo count($engagements); ?> records logged</span>
            </div>
            <div class="panel-card-body p-0">
                <div class="table-responsive">
                    <table class="table custom-table align-middle">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Organization</th>
                                <th>Type</th>
                                <th>Point of Contact</th>
                                <th>Students</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (count($engagements) > 0): ?>
                                <?php foreach ($engagements as $row): ?>
                                    <?php
                                    $status_class = 'badge-pending';
                                    if ($row['status'] == 'Completed') $status_class = 'badge-completed';
                                    elseif ($row['status'] == 'Scheduled') $status_class = 'badge-scheduled';
                                    elseif ($row['status'] == 'Cancelled') $status_class = 'badge-cancelled';
                                    ?>
                                    <tr>
                                        <td><span class="fw-medium text-dark"><?php echo htmlspecialchars($row['date_occurred']); ?></span></td>
                                        <td><strong><?php echo htmlspecialchars($row['company_name']); ?></strong></td>
                                        <td><?php echo htmlspecialchars($row['engagement_type']); ?></td>
                                        <td><?php echo htmlspecialchars($row['contact_person']); ?></td>
                                        <td><?php echo intval($row['students_count']); ?></td>
                                        <td>
                                            <span class="badge-custom <?php echo $status_class; ?>">
                                                <?php echo htmlspecialchars($row['status']); ?>
                                            </span>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="6" class="text-center py-4 text-muted">No engagements logged yet.</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
</div>

<?php include 'footer.php'; ?>
