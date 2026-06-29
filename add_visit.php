<?php
require_once 'db.php';

$message = '';
$message_type = '';

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $company_id = intval($_POST['company_id'] ?? 0);
    $date_occurred = trim($_POST['date_occurred'] ?? '');
    $engagement_type = trim($_POST['engagement_type'] ?? '');
    $contact_person = trim($_POST['contact_person'] ?? '');
    $status = trim($_POST['status'] ?? 'Scheduled');
    $students_count = intval($_POST['students_count'] ?? 0);
    $objective = trim($_POST['objective'] ?? '');

    if ($company_id > 0 && !empty($date_occurred) && !empty($engagement_type) && !empty($contact_person)) {
        $added = add_engagement($company_id, $date_occurred, $engagement_type, $contact_person, $status, $objective, $students_count);
        if ($added) {
            // Redirect to dashboard with success query param
            header("Location: index.php?success=visit_logged");
            exit;
        } else {
            $message = "Error: Failed to save the visit. Please check inputs and try again.";
            $message_type = "danger";
        }
    } else {
        $message = "Error: Please fill in all required fields (Company, Date, Engagement Type, and Point of Contact).";
        $message_type = "warning";
    }
}

// Fetch companies for dropdown
$companies = get_companies();

$page_title = "Log New Visit";
include 'header.php';
?>

<div class="app-container">
    <?php include 'sidebar.php'; ?>
    
    <main class="main-content">
        <!-- Page Header -->
        <div class="page-title-section mb-4">
            <h2>Log Industrial Visit & Engagement</h2>
            <p>Record a new employer engagement, site visit, or student talk in the tracker database.</p>
        </div>

        <!-- Alert Notification -->
        <?php if (!empty($message)): ?>
            <div class="alert alert-<?php echo $message_type; ?> alert-dismissible fade show" role="alert">
                <?php echo $message; ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        <?php endif; ?>

        <!-- Form Card -->
        <div class="panel-card max-w-4xl mx-auto shadow-sm">
            <div class="panel-card-header">
                <h5>Engagement Details</h5>
            </div>
            <div class="panel-card-body">
                <form method="POST" action="add_visit.php">
                    <div class="row g-4">
                        <!-- Company Selector -->
                        <div class="col-md-6">
                            <label for="company_id" class="form-label text-xs fw-semibold text-secondary uppercase">Employer / Company *</label>
                            <select class="form-select" id="company_id" name="company_id" required>
                                <option value="" disabled selected>Select Company...</option>
                                <?php foreach ($companies as $comp): ?>
                                    <option value="<?php echo $comp['id']; ?>">
                                        <?php echo htmlspecialchars($comp['name']); ?> (<?php echo htmlspecialchars($comp['industry']); ?>)
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <div class="form-text text-xxs mt-1">
                                Don't see the company? <a href="companies.php" class="text-primary text-decoration-none">Add new company partner first</a>.
                            </div>
                        </div>

                        <!-- Date -->
                        <div class="col-md-6">
                            <label for="date_occurred" class="form-label text-xs fw-semibold text-secondary uppercase">Scheduled Date *</label>
                            <input type="date" class="form-control" id="date_occurred" name="date_occurred" required value="<?php echo date('Y-m-d'); ?>">
                        </div>

                        <!-- Engagement Type -->
                        <div class="col-md-6">
                            <label for="engagement_type" class="form-label text-xs fw-semibold text-secondary uppercase">Engagement Type *</label>
                            <select class="form-select" id="engagement_type" name="engagement_type" required>
                                <option value="" disabled selected>Select type...</option>
                                <option value="Site Visit">Site Visit</option>
                                <option value="Guest Lecture">Guest Lecture</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Tech Talk">Tech Talk</option>
                                <option value="Career Fair">Career Fair</option>
                                <option value="Advisory Panel">Advisory Panel</option>
                            </select>
                        </div>

                        <!-- Point of Contact -->
                        <div class="col-md-6">
                            <label for="contact_person" class="form-label text-xs fw-semibold text-secondary uppercase">Point of Contact (Name) *</label>
                            <input type="text" class="form-control" id="contact_person" name="contact_person" required placeholder="e.g. Dr. Adam / Ms. Janice">
                        </div>

                        <!-- Status -->
                        <div class="col-md-6">
                            <label for="status" class="form-label text-xs fw-semibold text-secondary uppercase">Status</label>
                            <select class="form-select" id="status" name="status">
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <!-- Student Count -->
                        <div class="col-md-6">
                            <label for="students_count" class="form-label text-xs fw-semibold text-secondary uppercase">Students Impacted / Attending</label>
                            <input type="number" class="form-control" id="students_count" name="students_count" min="0" value="0">
                            <div class="form-text text-xxs mt-1">Number of students attending this engagement.</div>
                        </div>

                        <!-- Objective / Description -->
                        <div class="col-md-12">
                            <label for="objective" class="form-label text-xs fw-semibold text-secondary uppercase">Visit Objective & Notes</label>
                            <textarea class="form-control" id="objective" name="objective" rows="4" placeholder="Describe the objectives, outline of the event, or specific notes regarding this engagement..."></textarea>
                        </div>

                        <!-- Submit Buttons -->
                        <div class="col-md-12 text-end mt-4">
                            <a href="index.php" class="btn btn-outline-secondary me-2">Cancel</a>
                            <button type="submit" class="btn btn-primary px-4">
                                <i class="fa-solid fa-floppy-disk me-1"></i> Save Visit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </main>
</div>

<?php include 'footer.php'; ?>
