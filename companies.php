<?php
require_once 'db.php';

// Handle Add Company POST request
$message = '';
$message_type = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_company') {
    $name = trim($_POST['name'] ?? '');
    $industry = trim($_POST['industry'] ?? '');
    $location = trim($_POST['location'] ?? '');
    $status = trim($_POST['status'] ?? 'Active Partner');
    $partnership_date = trim($_POST['partnership_date'] ?? date('Y-m-d'));

    if (!empty($name) && !empty($industry) && !empty($location)) {
        $added = add_company($name, $industry, $location, $status, $partnership_date);
        if ($added) {
            $message = "Success! Partner company '<strong>$name</strong>' has been added.";
            $message_type = "success";
        } else {
            $message = "Error: A partner company named '<strong>$name</strong>' already exists or an error occurred.";
            $message_type = "danger";
        }
    } else {
        $message = "Error: All fields (Name, Industry, Location) are required.";
        $message_type = "warning";
    }
}

// Get list of companies
$companies = get_companies();

// Get filter inputs
$search_query = trim($_GET['search'] ?? '');
$industry_filter = trim($_GET['industry'] ?? '');

// Filter list based on inputs
if (!empty($search_query) || !empty($industry_filter)) {
    $companies = array_filter($companies, function($c) use ($search_query, $industry_filter) {
        $matches_search = empty($search_query) || stripos($c['name'], $search_query) !== false;
        $matches_industry = empty($industry_filter) || strcasecmp($c['industry'], $industry_filter) === 0;
        return $matches_search && $matches_industry;
    });
}

// Extract distinct industries for filter dropdown
$all_companies_raw = get_companies();
$industries = array_unique(array_filter(array_column($all_companies_raw, 'industry')));
sort($industries);

$page_title = "Partner Directory";
include 'header.php';
?>

<div class="app-container">
    <?php include 'sidebar.php'; ?>
    
    <main class="main-content">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="page-title-section mb-0">
                <h2>Partner Directory</h2>
                <p>Manage list of active, pending, and archived industry partner companies.</p>
            </div>
            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addCompanyModal">
                <i class="fa-solid fa-plus me-1"></i> Add Company
            </button>
        </div>

        <!-- Alert Notification -->
        <?php if (!empty($message)): ?>
            <div class="alert alert-<?php echo $message_type; ?> alert-dismissible fade show" role="alert">
                <?php echo $message; ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        <?php endif; ?>

        <!-- Search & Filter Card -->
        <div class="panel-card mb-4">
            <div class="panel-card-body py-3">
                <form method="GET" action="companies.php" class="row g-3 align-items-end">
                    <div class="col-md-5">
                        <label class="form-label text-xs fw-semibold text-secondary uppercase">Search Name</label>
                        <input type="text" name="search" class="form-control" placeholder="Search Company Name..." value="<?php echo htmlspecialchars($search_query); ?>">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label text-xs fw-semibold text-secondary uppercase">Industry Filter</label>
                        <select name="industry" class="form-select">
                            <option value="">All Industries</option>
                            <?php foreach ($industries as $ind): ?>
                                <option value="<?php echo htmlspecialchars($ind); ?>" <?php echo ($industry_filter === $ind) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($ind); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="fa-solid fa-filter me-1"></i> Filter
                            </button>
                            <?php if (!empty($search_query) || !empty($industry_filter)): ?>
                                <a href="companies.php" class="btn btn-outline-secondary w-50" title="Clear Filters">
                                    <i class="fa-solid fa-rotate-left"></i>
                                </a>
                            <?php endif; ?>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <!-- Companies Table -->
        <div class="panel-card">
            <div class="panel-card-header">
                <h5>Industry Partners List</h5>
                <span class="text-muted text-xs"><?php echo count($companies); ?> matching partners</span>
            </div>
            <div class="panel-card-body p-0">
                <div class="table-responsive">
                    <table class="table custom-table align-middle">
                        <thead>
                            <tr>
                                <th>Company Name</th>
                                <th>Industry</th>
                                <th>Location</th>
                                <th>Partnership Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (count($companies) > 0): ?>
                                <?php foreach ($companies as $row): ?>
                                    <?php
                                    $status_class = 'badge-pending';
                                    if ($row['status'] == 'Active Partner') $status_class = 'badge-completed';
                                    elseif ($row['status'] == 'Pending') $status_class = 'badge-pending';
                                    elseif ($row['status'] == 'Archived' || $row['status'] == 'Inactive') $status_class = 'badge-cancelled';
                                    ?>
                                    <tr>
                                        <td>
                                            <div class="d-flex align-items-center gap-2">
                                                <div class="avatar bg-light text-primary rounded border fw-bold text-uppercase d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 0.8rem;">
                                                    <?php echo substr($row['name'], 0, 2); ?>
                                                </div>
                                                <span class="fw-bold text-dark"><?php echo htmlspecialchars($row['name']); ?></span>
                                            </div>
                                        </td>
                                        <td><?php echo htmlspecialchars($row['industry']); ?></td>
                                        <td><i class="fa-solid fa-location-dot me-1 text-muted"></i> <?php echo htmlspecialchars($row['location']); ?></td>
                                        <td><?php echo htmlspecialchars($row['partnership_date']); ?></td>
                                        <td>
                                            <span class="badge-custom <?php echo $status_class; ?>">
                                                <?php echo htmlspecialchars($row['status']); ?>
                                            </span>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="5" class="text-center py-4 text-muted">No partners match the search criteria.</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
</div>

<!-- Add Company Modal -->
<div class="modal fade" id="addCompanyModal" tabindex="-1" aria-labelledby="addCompanyModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow">
            <div class="modal-header border-bottom-0 pt-4 px-4">
                <h5 class="modal-title fw-bold" id="addCompanyModalLabel">Add Industry Partner</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form method="POST" action="companies.php">
                <input type="hidden" name="action" value="add_company">
                <div class="modal-body px-4 pb-4">
                    <div class="mb-3">
                        <label for="name" class="form-label text-xs fw-semibold text-secondary uppercase">Company Name</label>
                        <input type="text" class="form-control" id="name" name="name" required placeholder="e.g. Microsoft Malaysia">
                    </div>
                    <div class="mb-3">
                        <label for="industry" class="form-label text-xs fw-semibold text-secondary uppercase">Industry Area</label>
                        <select class="form-select" id="industry" name="industry" required>
                            <option value="" disabled selected>Select Industry</option>
                            <option value="IT/Tech">IT / Tech / Software</option>
                            <option value="Automotive">Automotive</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Energy">Energy & Utilities</option>
                            <option value="Finance">Finance & Banking</option>
                            <option value="Services">Professional Services</option>
                            <option value="Consultancy">Consultancy</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="location" class="form-label text-xs fw-semibold text-secondary uppercase">Location State/City</label>
                        <input type="text" class="form-control" id="location" name="location" required placeholder="e.g. Selangor / Penang">
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="status" class="form-label text-xs fw-semibold text-secondary uppercase">Partnership Status</label>
                            <select class="form-select" id="status" name="status">
                                <option value="Active Partner">Active Partner</option>
                                <option value="Pending">Pending</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="partnership_date" class="form-label text-xs fw-semibold text-secondary uppercase">Start Date</label>
                            <input type="date" class="form-control" id="partnership_date" name="partnership_date" value="<?php echo date('Y-m-d'); ?>">
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-top-0 px-4 pb-4">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary px-4">Save Company</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php include 'footer.php'; ?>
