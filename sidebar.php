<?php
$current_page = basename($_SERVER['SCRIPT_NAME']);
?>
<div class="sidebar">
    <div class="sidebar-brand">
        <div class="brand-icon">
            <i class="fa-solid fa-graduation-cap"></i>
        </div>
        <div>
            <h4>EEIV Tracker</h4>
            <span class="brand-subtitle">Employer Engagement</span>
        </div>
    </div>
    
    <ul class="nav flex-column mt-4 sidebar-menu">
        <li class="nav-item mb-2">
            <a href="index.php" class="nav-link <?php echo ($current_page == 'index.php' || $current_page == '') ? 'active' : ''; ?>">
                <i class="fa-solid fa-chart-pie me-2"></i> Dashboard
            </a>
        </li>
        <li class="nav-item mb-2">
            <a href="companies.php" class="nav-link <?php echo ($current_page == 'companies.php') ? 'active' : ''; ?>">
                <i class="fa-solid fa-building me-2"></i> Partner List
            </a>
        </li>
        <li class="nav-item mb-2">
            <a href="add_visit.php" class="nav-link <?php echo ($current_page == 'add_visit.php') ? 'active' : ''; ?>">
                <i class="fa-solid fa-calendar-plus me-2"></i> Log New Visit
            </a>
        </li>
        <li class="nav-item mb-2">
            <a href="report_analytics.php" class="nav-link <?php echo ($current_page == 'report_analytics.php') ? 'active' : ''; ?>">
                <i class="fa-solid fa-chart-line me-2"></i> Reports & Analytics
            </a>
        </li>
    </ul>

    <div class="sidebar-footer mt-auto p-3 text-center">
        <div class="user-profile d-flex align-items-center justify-content-start gap-2 bg-dark-subtle p-2 rounded">
            <div class="avatar bg-primary text-white rounded-circle flex-shrink-0">
                <i class="fa-solid fa-user-tie"></i>
            </div>
            <div class="text-start overflow-hidden">
                <div class="profile-name text-white fw-semibold text-truncate text-xs">Admin Portal</div>
                <div class="profile-role text-muted text-truncate text-xxs">Coordinator</div>
            </div>
        </div>
    </div>
</div>
