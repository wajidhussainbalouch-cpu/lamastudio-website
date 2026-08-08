<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lama School Management - Portal & Student Directory</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { background-color: #f8f9fa; color: #000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        
        .print-signature { display: none; }

        /* Strict A4 Single Page Print Formatting & Crisp Black-and-White Optimizations */
        @media print {
            @page {
                size: A4;
                margin: 4mm;
            }
            body { background-color: #fff; color: #000; }
            body * { visibility: hidden; }
            #admissionFormContainer, #admissionFormContainer * { visibility: visible; }
            #admissionFormContainer {
                position: absolute;
                left: 0;
                top: 0;
                width: 202mm !important;
                max-width: 202mm !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
                font-size: 7.5pt !important;
            }
            .no-print { display: none !important; }
            .print-signature { display: block !important; }

            h3, h6, .bg-success, .bg-secondary {
                background: transparent !important;
                color: #000 !important;
                font-weight: bold !important;
                border-bottom: 1.5px solid #000 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            h6 {
                font-size: 8pt !important;
                padding: 1px 0px !important;
                margin-bottom: 2px !important;
                text-transform: uppercase;
            }

            input, textarea, select {
                border: none !important;
                border-bottom: 1px solid #000 !important;
                background: transparent !important;
                padding: 0 !important;
                box-shadow: none !important;
                font-size: 7.5pt !important;
                color: #000 !important;
            }
            .form-control:disabled, .form-control[readonly] { background-color: transparent !important; color: #000 !important; }
            .table th, .table td { padding: 1px 3px !important; font-size: 7pt !important; border-color: #000 !important; }
        }
    </style>
</head>
<body>

<div class="container py-2" style="max-width: 210mm;">
    
    <!-- Action Bar & Software Configuration Panel (Hidden on Print) -->
    <div class="d-flex justify-content-between align-items-center mb-2 px-1 no-print flex-wrap gap-2">
        <h5 class="text-success fw-bold mb-0"><i class="fa-solid fa-cloud-arrow-up me-2"></i>Lama School Management Portal</h5>
        <div class="d-flex gap-1 flex-wrap align-items-center">
            <a href="<?php echo e(route('dashboard')); ?>" class="btn btn-outline-primary btn-sm fw-bold">
                <i class="fa-solid fa-gauge-high me-1"></i> Dashboard
            </a>
            <button type="button" class="btn btn-outline-success btn-sm fw-bold active" id="navFormBtn" onclick="switchView('form')">
                <i class="fa-solid fa-file-pen me-1"></i> Admission Form
            </button>
            <button type="button" class="btn btn-outline-dark btn-sm fw-bold" id="navListBtn" onclick="switchView('list')">
                <i class="fa-solid fa-list-ul me-1"></i> Student Directory (<span id="directoryCountBadge">0</span>)
            </button>
            <button type="button" class="btn btn-dark btn-sm fw-bold" data-bs-toggle="modal" data-bs-target="#schoolConfigModal">
                <i class="fa-solid fa-gear me-1"></i> Settings
            </button>
            <button type="button" class="btn btn-success btn-sm" id="printFormTopBtn" onclick="window.print()">
                <i class="fa-solid fa-print me-1"></i> Print Form
            </button>
            <button type="button" class="btn btn-primary btn-sm" id="saveAndSyncBtn">
                <i class="fa-solid fa-floppy-disk me-1"></i> Save & Register
            </button>
        </div>
    </div>

    <!-- MAIN SOFTWARE APP CONTAINER (Replaces Content Dynamically) -->
    <div id="softwareWorkspace">

        <!-- VIEW 1: SINGLE PAGE STRICT A4 ADMISSION FORM CONTAINER -->
        <div class="card shadow-sm p-3 bg-white mx-auto" id="admissionFormContainer" style="max-width: 200mm;">
            <form id="studentAdmissionForm">
                
                <!-- Hidden field for tracking editing state if record exists -->
                <input type="hidden" class="global-sync" id="editingRecordIndex" value="-1">

                <!-- School Header Branding with Logo Placeholder and Big Bold Name -->
                <div class="border-bottom pb-2 mb-2 position-relative">
                    <div class="row align-items-center g-2">
                        <!-- School Logo Box -->
                        <div class="col-2 text-center">
                            <div id="schoolLogoContainer" style="width: 55px; height: 55px; border: 1.5px dashed #6c757d; display: flex; align-items: center; justify-content: center; background: #fff; overflow: hidden; border-radius: 50%; margin: 0 auto;" class="shadow-sm">
                                <img id="schoolLogoPreview" src="" alt="Logo" style="width: 100%; height: 100%; object-fit: cover; display: none;">
                                <i id="logoPlaceholderIcon" class="fa-solid fa-school text-muted fa-lg"></i>
                            </div>
                            <input type="file" id="schoolLogoUpload" accept="image/*" class="d-none">
                            <label for="schoolLogoUpload" class="btn btn-xxs btn-outline-secondary mt-1 py-0 px-1 no-print" style="font-size: 0.55rem; cursor: pointer;">Logo</label>
                        </div>

                        <!-- School Name & Tagline -->
                        <div class="col-10 text-center">
                            <h3 class="fw-bold text-uppercase text-success mb-0" id="displaySchoolName" style="font-size: 1.5rem; letter-spacing: 0.5px;">LAMA SCHOOL MANAGEMENT</h3>
                            <p class="text-muted mb-0" id="displaySchoolTagline" style="font-size: 0.7rem;">Official Admission & Registration Portal</p>
                            <span class="badge bg-secondary mt-1" id="displaySchoolTenant" style="font-size: 0.55rem;">Tenant ID: aims_demo_01</span>
                        </div>
                    </div>
                    
                    <div class="row mt-2 justify-content-between text-start px-1">
                        <div class="col-4">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">ADMISSION NO:</label>
                            <input type="text" class="form-control form-control-sm global-sync fw-bold bg-light" data-key="admission_no" id="admissionNoField" readonly>
                        </div>
                        <div class="col-4 text-end">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">DATE OF ISSUE:</label>
                            <input type="date" class="form-control form-control-sm global-sync" data-key="date_of_issue" id="dateOfIssueField">
                        </div>
                    </div>
                </div>

                <!-- SECTION 1: STUDENT PERSONAL INFORMATION SECTION -->
                <div class="mb-2">
                    <h6 class="bg-success text-white p-1 rounded mb-1" style="font-size: 0.75rem;"><i class="fa-solid fa-user-graduate me-1"></i> STUDENT PERSONAL INFORMATION SECTION</h6>
                    <div class="row g-2 align-items-center">
                        <div class="col-9">
                            <div class="row g-2">
                                <div class="col-6">
                                    <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Candidate’s Full Name:</label>
                                    <input type="text" class="form-control form-control-sm global-sync" data-key="full_name" placeholder="Full name" required>
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">B-Form No / CRC (Strict 13 Digits):</label>
                                    <input type="text" class="form-control form-control-sm cnic-input global-sync" data-key="bform_no" maxlength="13" placeholder="3520200000000">
                                </div>
                                <div class="col-4">
                                    <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Date of Birth:</label>
                                    <input type="date" class="form-control form-control-sm global-sync" data-key="dob" id="inputDob" required>
                                </div>
                                <div class="col-2">
                                    <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Age:</label>
                                    <input type="text" class="form-control form-control-sm bg-light global-sync" data-key="age" id="inputAge" readonly placeholder="Auto">
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Gender:</label>
                                    <div class="mt-0">
                                        <div class="form-check form-check-inline mb-0">
                                            <input class="form-check-input global-sync" type="radio" name="gender" data-key="gender" value="Male" checked>
                                            <label class="form-check-label small" style="font-size: 0.75rem;">Male</label>
                                        </div>
                                        <div class="form-check form-check-inline mb-0">
                                            <input class="form-check-input global-sync" type="radio" name="gender" data-key="gender" value="Female">
                                            <label class="form-check-label small" style="font-size: 0.75rem;">Female</label>
                                        </div>
                                    </div>
                                </div>
                                <!-- Student Category Indicators -->
                                <div class="col-12">
                                    <label class="form-label fw-bold small mb-0 text-success" style="font-size: 0.7rem;">Student Category Indicators:</label>
                                    <div class="d-flex flex-wrap gap-2 mt-1">
                                        <div class="form-check form-check-inline mb-0"><input class="form-check-input global-sync" type="checkbox" data-key="cat_special" value="Special"><label class="form-check-label small" style="font-size: 0.7rem;">Special</label></div>
                                        <div class="form-check form-check-inline mb-0"><input class="form-check-input global-sync" type="checkbox" data-key="cat_brickline" value="Brickline"><label class="form-check-label small" style="font-size: 0.7rem;">Brickline</label></div>
                                        <div class="form-check form-check-inline mb-0"><input class="form-check-input global-sync" type="checkbox" data-key="cat_doc" value="DOC"><label class="form-check-label small" style="font-size: 0.7rem;">DOC</label></div>
                                        <div class="form-check form-check-inline mb-0"><input class="form-check-input global-sync" type="checkbox" data-key="cat_osc" value="OSC"><label class="form-check-label small" style="font-size: 0.7rem;">OSC</label></div>
                                        <div class="form-check form-check-inline mb-0"><input class="form-check-input global-sync" type="checkbox" data-key="cat_repeater" value="Repeater"><label class="form-check-label small" style="font-size: 0.7rem;">Repeater</label></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Passport Photo Box -->
                        <div class="col-3 text-center">
                            <div class="d-flex flex-column align-items-center">
                                <div id="photoPreviewContainer" style="width: 75px; height: 95px; border: 1.5px solid #6c757d; display: flex; align-items: center; justify-content: center; background: #fff; overflow: hidden; border-radius: 3px;" class="shadow-sm">
                                    <img id="studentPhotoPreview" src="" alt="Photo" style="width: 100%; height: 100%; object-fit: cover; display: none;">
                                    <i id="photoPlaceholderIcon" class="fa-solid fa-user text-muted fa-2x"></i>
                                </div>
                                <span class="text-muted mt-1 fw-bold" style="font-size: 0.55rem;">Passport Photo</span>
                                <span class="text-danger" style="font-size: 0.55rem;">(10-25 KB Max)</span>
                                <div class="d-flex gap-1 mt-1 no-print">
                                    <label class="btn btn-xxs btn-outline-primary py-0 px-1" style="font-size: 0.6rem; cursor: pointer;">
                                        <i class="fa-solid fa-upload"></i> <input type="file" id="photoUploadInput" accept="image/*" class="d-none">
                                    </label>
                                    <button type="button" class="btn btn-xxs btn-outline-success py-0 px-1" style="font-size: 0.6rem;" id="openCameraBtn"><i class="fa-solid fa-camera"></i></button>
                                </div>
                                <input type="hidden" class="global-sync" data-key="compressed_student_photo" id="compressedPhotoData">
                            </div>
                        </div>
                    </div>

                    <!-- Live Camera Modal Container -->
                    <div id="cameraModal" class="card p-2 mb-2 bg-dark text-white text-center no-print" style="display: none;">
                        <video id="cameraStream" autoplay playsinline style="width: 100%; max-width: 180px; border-radius: 4px; margin: 0 auto;"></video>
                        <canvas id="cameraCanvas" style="display: none;"></canvas>
                        <div class="mt-1">
                            <button type="button" class="btn btn-danger btn-xs py-0 px-2" id="captureSnapshotBtn">Capture</button>
                            <button type="button" class="btn btn-secondary btn-xs py-0 px-2" id="closeCameraBtn">Cancel</button>
                        </div>
                    </div>
                </div>

                <!-- SECTION 2: PARENTAGE INFORMATION SECTION -->
                <div class="mb-2">
                    <h6 class="bg-success text-white p-1 rounded mb-1" style="font-size: 0.75rem;"><i class="fa-solid fa-user-shield me-1"></i> PARENTAGE INFORMATION SECTION</h6>
                    <div class="row g-2">
                        <div class="col-4">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Father’s Name:</label>
                            <input type="text" class="form-control form-control-sm global-sync" data-key="father_name" placeholder="Father name" required>
                        </div>
                        <div class="col-4">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Father’s CNIC (13 Digits):</label>
                            <input type="text" class="form-control form-control-sm cnic-input global-sync" data-key="father_cnic" maxlength="13" placeholder="3520200000000">
                        </div>
                        <div class="col-4">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Cell No (11 Digits):</label>
                            <div class="input-group input-group-sm">
                                <input type="text" class="form-control form-control-sm phone-input global-sync" data-key="father_phone" id="fatherPhoneInput" maxlength="11" placeholder="03000000000" required>
                                <span class="input-group-text bg-white p-0 px-2" id="whatsappBadgeWrapper" style="display: none;">
                                    <a href="#" id="sendWhatsAppBtn" target="_blank" class="text-success text-decoration-none fw-bold" title="WhatsApp Active - Click to Chat">
                                        <i class="fa-brands fa-whatsapp fs-5"></i>
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div class="col-3">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Caste:</label>
                            <input type="text" class="form-control form-control-sm global-sync" data-key="caste" placeholder="Caste">
                        </div>
                        <div class="col-3">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Religion:</label>
                            <input type="text" class="form-control form-control-sm global-sync" data-key="religion" value="Islam">
                        </div>
                        <div class="col-3">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Profession:</label>
                            <input type="text" class="form-control form-control-sm global-sync" data-key="father_profession" placeholder="Profession">
                        </div>
                        <div class="col-3">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Monthly Income:</label>
                            <input type="text" class="form-control form-control-sm global-sync" data-key="monthly_income" placeholder="Rs.">
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Full Residential Address:</label>
                            <input type="text" class="form-control form-control-sm global-sync" data-key="full_address" placeholder="House #, Street, Area, City" required>
                        </div>
                    </div>
                </div>

                <!-- SECTION 3: GUARDIAN INFORMATION SECTION (If applicable) -->
                <div class="mb-2">
                    <h6 class="bg-success text-white p-1 rounded mb-1" style="font-size: 0.75rem;"><i class="fa-solid fa-user-tie me-1"></i> GUARDIAN INFORMATION SECTION (If applicable)</h6>
                    <div class="row g-2">
                        <div class="col-4">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Guardian’s Name:</label>
                            <input type="text" class="form-control form-control-sm global-sync" data-key="guardian_name" placeholder="Guardian name">
                        </div>
                        <div class="col-4">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Guardian’s CNIC (13 Digits):</label>
                            <input type="text" class="form-control form-control-sm cnic-input global-sync" data-key="guardian_cnic" maxlength="13" placeholder="3520200000000">
                        </div>
                        <div class="col-4">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Cell No (11 Digits):</label>
                            <input type="text" class="form-control form-control-sm phone-input global-sync" data-key="guardian_phone" maxlength="11" placeholder="03000000000">
                        </div>
                        <div class="col-3">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Relation to Child:</label>
                            <input type="text" class="form-control form-control-sm global-sync" data-key="guardian_relation" placeholder="Relation">
                        </div>
                        <div class="col-3">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Profession:</label>
                            <input type="text" class="form-control form-control-sm global-sync" data-key="guardian_profession" placeholder="Profession">
                        </div>
                        <div class="col-3">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Distant from School (KM):</label>
                            <input type="text" class="form-control form-control-sm global-sync" data-key="distance_km" placeholder="KM">
                        </div>
                        <div class="col-3">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Guardian Full Address:</label>
                            <input type="text" class="form-control form-control-sm global-sync" data-key="guardian_address" placeholder="Address">
                        </div>
                        <div class="col-4 mt-2 print-signature">
                            <div class="border-top pt-1 text-center">
                                <span class="text-muted" style="font-size: 6.5pt;">Signature of Father / Guardian</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECTION 4: SCHOOL OFFICIAL USE SECTION -->
                <div class="mb-1">
                    <h6 class="bg-secondary text-white p-1 rounded mb-1" style="font-size: 0.75rem;"><i class="fa-solid fa-clipboard-check me-1"></i> SCHOOL OFFICIAL USE SECTION</h6>
                    <div class="row g-2">
                        <div class="col-3">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">School Admission No:</label>
                            <input type="text" class="form-control form-control-sm global-sync bg-light" data-key="school_admission_no" id="schoolAdmissionNoField" readonly>
                        </div>
                        <div class="col-3">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Date of Enrollment:</label>
                            <input type="date" class="form-control form-control-sm global-sync" data-key="date_of_enrollment" id="dateOfEnrollmentField">
                        </div>
                        <div class="col-3">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Class of Student:</label>
                            <select class="form-select form-select-sm global-sync" data-key="class_enrolled" required>
                                <option value="Grade 6">Grade 6</option>
                                <option value="Grade 7">Grade 7</option>
                                <option value="Grade 8">Grade 8</option>
                                <option value="Grade 9">Grade 9</option>
                                <option value="Grade 10">Grade 10</option>
                            </select>
                        </div>
                        <div class="col-3">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Section:</label>
                            <select class="form-select form-select-sm global-sync" data-key="section_enrolled">
                                <option value="Section A">Section A</option>
                                <option value="Section B">Section B</option>
                            </select>
                        </div>
                        <div class="col-4">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Session:</label>
                            <input type="text" class="form-control form-control-sm global-sync" data-key="session_year" value="2026-2027">
                        </div>

                        <!-- Admission Test Evaluation Marks -->
                        <div class="col-12 mt-1">
                            <label class="form-label fw-bold small mb-0 text-success" style="font-size: 0.7rem;">Admission Test Evaluation Marks:</label>
                            <table class="table table-bordered text-center align-middle mb-1" style="font-size: 7pt;">
                                <thead class="table-light">
                                    <tr>
                                        <th>English</th>
                                        <th>Urdu</th>
                                        <th>Maths</th>
                                        <th>Science</th>
                                        <th>Interview / Oral</th>
                                        <th>Total Marks Obtained</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><input type="number" class="form-control form-control-sm text-center test-mark global-sync" data-key="marks_english" value="85" min="0" max="100"></td>
                                        <td><input type="number" class="form-control form-control-sm text-center test-mark global-sync" data-key="marks_urdu" value="80" min="0" max="100"></td>
                                        <td><input type="number" class="form-control form-control-sm text-center test-mark global-sync" data-key="marks_maths" value="90" min="0" max="100"></td>
                                        <td><input type="number" class="form-control form-control-sm text-center test-mark global-sync" data-key="marks_science" value="88" min="0" max="100"></td>
                                        <td><input type="number" class="form-control form-control-sm text-center test-mark global-sync" data-key="marks_interview" value="92" min="0" max="100"></td>
                                        <td><input type="text" class="form-control form-control-sm text-center bg-light fw-bold global-sync" data-key="marks_total" id="totalTestMarks" readonly value="435"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Fee Slabs Structure & Total Payable Fee Section -->
                        <div class="col-12 mt-1">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <label class="form-label fw-bold small mb-0 text-success" style="font-size: 0.7rem;">Fee Slabs Structure & Total Payable Fee:</label>
                                <button type="button" class="btn btn-xxs btn-outline-success py-0 px-2 no-print" id="addFeeRowBtn" style="font-size: 0.65rem;"><i class="fa-solid fa-plus"></i> Add Fee Category</button>
                            </div>
                            
                            <table class="table table-bordered text-center align-middle mb-1" style="font-size: 7pt;" id="feeSlabsTable">
                                <thead class="table-light">
                                    <tr>
                                        <th>Fee Category Description</th>
                                        <th style="width: 150px;">Amount (Rs.)</th>
                                        <th class="no-print" style="width: 50px;">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="feeSlabsBody">
                                    <tr>
                                        <td><input type="text" class="form-control form-control-sm global-sync" data-key="fee_cat_1" value="Admission & Tuition Fee"></td>
                                        <td><input type="number" class="form-control form-control-sm text-center fee-amount global-sync" data-key="fee_amt_1" value="4500"></td>
                                        <td class="no-print"><button type="button" class="btn btn-xxs btn-outline-danger py-0 px-1" onclick="this.closest('tr').remove(); calculateTotalFee();"><i class="fa-solid fa-trash"></i></button></td>
                                    </tr>
                                    <tr>
                                        <td><input type="text" class="form-control form-control-sm global-sync" data-key="fee_cat_2" value="Books & Stationary Fund"></td>
                                        <td><input type="number" class="form-control form-control-sm text-center fee-amount global-sync" data-key="fee_amt_2" value="1000"></td>
                                        <td class="no-print"><button type="button" class="btn btn-xxs btn-outline-danger py-0 px-1" onclick="this.closest('tr').remove(); calculateTotalFee();"><i class="fa-solid fa-trash"></i></button></td>
                                    </tr>
                                </tbody>
                                <tfoot class="table-group-divider">
                                    <tr class="fw-bold bg-light">
                                        <td class="text-end py-1">TOTAL PAYABLE FEE:</td>
                                        <td>
                                            <input type="text" class="form-control form-control-sm text-center fw-bold bg-white text-success global-sync" data-key="total_fee" id="hiddenTotalFeeInput" readonly value="Rs. 5500">
                                        </td>
                                        <td class="no-print"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div class="col-12 mt-1">
                            <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Head Master / Principal Comments:</label>
                            <input type="text" class="form-control form-control-sm global-sync" data-key="headmaster_comments" value="Admitted on merit. Eligible for all school sessions, fee ledger, and parent portal access.">
                        </div>

                        <div class="col-8 mt-2">
                            <div class="border p-1 text-center bg-light rounded d-inline-block px-3">
                                <span class="text-muted d-block" style="font-size: 6pt;">OFFICIAL SCHOOL STAMP</span>
                                <div style="height: 18px;"></div>
                            </div>
                        </div>
                        <div class="col-4 mt-2 text-end">
                            <div class="border-top pt-1 d-inline-block px-2">
                                <span class="fw-bold" style="font-size: 6.5pt;">SIGNATURE OF PRINCIPAL / H.M.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>

    </div>

</div>

<!-- School Configuration Modal for Multi-Tenant Software Live Setup -->
<div class="modal fade no-print" id="schoolConfigModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-success text-white py-2">
                <h6 class="modal-title fw-bold"><i class="fa-solid fa-school-flag me-1"></i> SaaS Tenant School Configuration</h6>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p class="text-muted" style="font-size: 0.8rem;">Configure your school's live profile. Once saved, this replaces the demo school profile globally across the software and printed receipts.</p>
                <div class="mb-2">
                    <label class="form-label fw-bold small">School Official Name:</label>
                    <input type="text" class="form-control form-control-sm" id="configSchoolName" value="LAMA SCHOOL MANAGEMENT">
                </div>
                <div class="mb-2">
                    <label class="form-label fw-bold small">School Tagline / Address:</label>
                    <input type="text" class="form-control form-control-sm" id="configSchoolTagline" value="Official Admission & Registration Portal">
                </div>
                <div class="mb-2">
                    <label class="form-label fw-bold small">Tenant Unique ID / Code:</label>
                    <input type="text" class="form-control form-control-sm" id="configTenantId" value="aims_demo_01">
                </div>
            </div>
            <div class="modal-footer py-1">
                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-success btn-sm" id="saveSchoolConfigBtn" data-bs-dismiss="modal">Save Live Configuration</button>
            </div>
        </div>
    </div>
</div>

<!-- Bootstrap 5 JS Bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- JavaScript Logic & Multi-Tenant SaaS State Engine -->
<script>
function calculateTotalFee() {
    let total = 0;
    document.querySelectorAll('.fee-amount').forEach(inp => {
        total += parseFloat(inp.value) || 0;
    });
    const feeInput = document.getElementById('hiddenTotalFeeInput');
    if (feeInput) feeInput.value = 'Rs. ' + total;
}

// Function to check and update WhatsApp icon availability and link next to the input
function checkWhatsAppAvailability() {
    const phoneInputElem = document.getElementById('fatherPhoneInput');
    if (!phoneInputElem) return;
    const phoneInput = phoneInputElem.value.trim();
    const whatsappBadgeWrapper = document.getElementById('whatsappBadgeWrapper');
    const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
    
    if (phoneInput.length >= 10 && whatsappBadgeWrapper && sendWhatsAppBtn) {
        let formattedPhone = phoneInput;
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '92' + formattedPhone.substring(1);
        }
        
        const schoolName = document.getElementById('displaySchoolName').innerText || 'School';
        const studentNameElem = document.querySelector('[data-key="full_name"]');
        const studentName = studentNameElem ? studentNameElem.value || 'Student' : 'Student';
        const admissionNoElem = document.getElementById('admissionNoField');
        const admissionNo = admissionNoElem ? admissionNoElem.value || 'ADM' : 'ADM';
        const msg = encodeURIComponent(`Dear Parent, your child ${studentName}'s admission form (Admission No: ${admissionNo}) has been successfully registered and approved at ${schoolName}. Welcome!`);
        
        sendWhatsAppBtn.href = `https://wa.me/${formattedPhone}?text=${msg}`;
        whatsappBadgeWrapper.style.display = 'block';
    } else if (whatsappBadgeWrapper) {
        whatsappBadgeWrapper.style.display = 'none';
    }
}

// Switch between Form and Student Directory inside the exact workspace area
function switchView(viewName) {
    const workspace = document.getElementById('softwareWorkspace');
    const navFormBtn = document.getElementById('navFormBtn');
    const navListBtn = document.getElementById('navListBtn');
    const printBtn = document.getElementById('printFormTopBtn');

    let globalStudentDatabase = JSON.parse(localStorage.getItem('lama_student_database')) || [];
    document.getElementById('directoryCountBadge').innerText = globalStudentDatabase.length;

    if (viewName === 'form') {
        workspace.innerHTML = `
            <div class="card shadow-sm p-3 bg-white mx-auto" id="admissionFormContainer" style="max-width: 200mm;">
                <form id="studentAdmissionForm">
                    <input type="hidden" class="global-sync" id="editingRecordIndex" value="-1">
                    <div class="border-bottom pb-2 mb-2 position-relative">
                        <div class="row align-items-center g-2">
                            <div class="col-2 text-center">
                                <div id="schoolLogoContainer" style="width: 55px; height: 55px; border: 1.5px dashed #6c757d; display: flex; align-items: center; justify-content: center; background: #fff; overflow: hidden; border-radius: 50%; margin: 0 auto;" class="shadow-sm">
                                    <img id="schoolLogoPreview" src="" alt="Logo" style="width: 100%; height: 100%; object-fit: cover; display: none;">
                                    <i id="logoPlaceholderIcon" class="fa-solid fa-school text-muted fa-lg"></i>
                                </div>
                                <input type="file" id="schoolLogoUpload" accept="image/*" class="d-none">
                                <label for="schoolLogoUpload" class="btn btn-xxs btn-outline-secondary mt-1 py-0 px-1 no-print" style="font-size: 0.55rem; cursor: pointer;">Logo</label>
                            </div>
                            <div class="col-10 text-center">
                                <h3 class="fw-bold text-uppercase text-success mb-0" id="displaySchoolName" style="font-size: 1.5rem; letter-spacing: 0.5px;">LAMA SCHOOL MANAGEMENT</h3>
                                <p class="text-muted mb-0" id="displaySchoolTagline" style="font-size: 0.7rem;">Official Admission & Registration Portal</p>
                                <span class="badge bg-secondary mt-1" id="displaySchoolTenant" style="font-size: 0.55rem;">Tenant ID: aims_demo_01</span>
                            </div>
                        </div>
                        <div class="row mt-2 justify-content-between text-start px-1">
                            <div class="col-4">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">ADMISSION NO:</label>
                                <input type="text" class="form-control form-control-sm global-sync fw-bold bg-light" data-key="admission_no" id="admissionNoField" readonly>
                            </div>
                            <div class="col-4 text-end">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">DATE OF ISSUE:</label>
                                <input type="date" class="form-control form-control-sm global-sync" data-key="date_of_issue" id="dateOfIssueField">
                            </div>
                        </div>
                    </div>
                    <div class="mb-2">
                        <h6 class="bg-success text-white p-1 rounded mb-1" style="font-size: 0.75rem;"><i class="fa-solid fa-user-graduate me-1"></i> STUDENT PERSONAL INFORMATION SECTION</h6>
                        <div class="row g-2 align-items-center">
                            <div class="col-9">
                                <div class="row g-2">
                                    <div class="col-6">
                                        <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Candidate’s Full Name:</label>
                                        <input type="text" class="form-control form-control-sm global-sync" data-key="full_name" placeholder="Full name" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">B-Form No / CRC (Strict 13 Digits):</label>
                                        <input type="text" class="form-control form-control-sm cnic-input global-sync" data-key="bform_no" maxlength="13" placeholder="3520200000000">
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Date of Birth:</label>
                                        <input type="date" class="form-control form-control-sm global-sync" data-key="dob" id="inputDob" required>
                                    </div>
                                    <div class="col-2">
                                        <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Age:</label>
                                        <input type="text" class="form-control form-control-sm bg-light global-sync" data-key="age" id="inputAge" readonly placeholder="Auto">
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Gender:</label>
                                        <div class="mt-0">
                                            <div class="form-check form-check-inline mb-0">
                                                <input class="form-check-input global-sync" type="radio" name="gender" data-key="gender" value="Male" checked>
                                                <label class="form-check-label small" style="font-size: 0.75rem;">Male</label>
                                            </div>
                                            <div class="form-check form-check-inline mb-0">
                                                <input class="form-check-input global-sync" type="radio" name="gender" data-key="gender" value="Female">
                                                <label class="form-check-label small" style="font-size: 0.75rem;">Female</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label fw-bold small mb-0 text-success" style="font-size: 0.7rem;">Student Category Indicators:</label>
                                        <div class="d-flex flex-wrap gap-2 mt-1">
                                            <div class="form-check form-check-inline mb-0"><input class="form-check-input global-sync" type="checkbox" data-key="cat_special" value="Special"><label class="form-check-label small" style="font-size: 0.7rem;">Special</label></div>
                                            <div class="form-check form-check-inline mb-0"><input class="form-check-input global-sync" type="checkbox" data-key="cat_brickline" value="Brickline"><label class="form-check-label small" style="font-size: 0.7rem;">Brickline</label></div>
                                            <div class="form-check form-check-inline mb-0"><input class="form-check-input global-sync" type="checkbox" data-key="cat_doc" value="DOC"><label class="form-check-label small" style="font-size: 0.7rem;">DOC</label></div>
                                            <div class="form-check form-check-inline mb-0"><input class="form-check-input global-sync" type="checkbox" data-key="cat_osc" value="OSC"><label class="form-check-label small" style="font-size: 0.7rem;">OSC</label></div>
                                            <div class="form-check form-check-inline mb-0"><input class="form-check-input global-sync" type="checkbox" data-key="cat_repeater" value="Repeater"><label class="form-check-label small" style="font-size: 0.7rem;">Repeater</label></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-3 text-center">
                                <div class="d-flex flex-column align-items-center">
                                    <div id="photoPreviewContainer" style="width: 75px; height: 95px; border: 1.5px solid #6c757d; display: flex; align-items: center; justify-content: center; background: #fff; overflow: hidden; border-radius: 3px;" class="shadow-sm">
                                        <img id="studentPhotoPreview" src="" alt="Photo" style="width: 100%; height: 100%; object-fit: cover; display: none;">
                                        <i id="photoPlaceholderIcon" class="fa-solid fa-user text-muted fa-2x"></i>
                                    </div>
                                    <span class="text-muted mt-1 fw-bold" style="font-size: 0.55rem;">Passport Photo</span>
                                    <span class="text-danger" style="font-size: 0.55rem;">(10-25 KB Max)</span>
                                    <div class="d-flex gap-1 mt-1 no-print">
                                        <label class="btn btn-xxs btn-outline-primary py-0 px-1" style="font-size: 0.6rem; cursor: pointer;">
                                            <i class="fa-solid fa-upload"></i> <input type="file" id="photoUploadInput" accept="image/*" class="d-none">
                                        </label>
                                        <button type="button" class="btn btn-xxs btn-outline-success py-0 px-1" style="font-size: 0.6rem;" id="openCameraBtn"><i class="fa-solid fa-camera"></i></button>
                                    </div>
                                    <input type="hidden" class="global-sync" data-key="compressed_student_photo" id="compressedPhotoData">
                                </div>
                            </div>
                        </div>
                        <div id="cameraModal" class="card p-2 mb-2 bg-dark text-white text-center no-print" style="display: none;">
                            <video id="cameraStream" autoplay playsinline style="width: 100%; max-width: 180px; border-radius: 4px; margin: 0 auto;"></video>
                            <canvas id="cameraCanvas" style="display: none;"></canvas>
                            <div class="mt-1">
                                <button type="button" class="btn btn-danger btn-xs py-0 px-2" id="captureSnapshotBtn">Capture</button>
                                <button type="button" class="btn btn-secondary btn-xs py-0 px-2" id="closeCameraBtn">Cancel</button>
                            </div>
                        </div>
                    </div>
                    <div class="mb-2">
                        <h6 class="bg-success text-white p-1 rounded mb-1" style="font-size: 0.75rem;"><i class="fa-solid fa-user-shield me-1"></i> PARENTAGE INFORMATION SECTION</h6>
                        <div class="row g-2">
                            <div class="col-4">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Father’s Name:</label>
                                <input type="text" class="form-control form-control-sm global-sync" data-key="father_name" placeholder="Father name" required>
                            </div>
                            <div class="col-4">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Father’s CNIC (13 Digits):</label>
                                <input type="text" class="form-control form-control-sm cnic-input global-sync" data-key="father_cnic" maxlength="13" placeholder="3520200000000">
                            </div>
                            <div class="col-4">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Cell No (11 Digits):</label>
                                <div class="input-group input-group-sm">
                                    <input type="text" class="form-control form-control-sm phone-input global-sync" data-key="father_phone" id="fatherPhoneInput" maxlength="11" placeholder="03000000000" required>
                                    <span class="input-group-text bg-white p-0 px-2" id="whatsappBadgeWrapper" style="display: none;">
                                        <a href="#" id="sendWhatsAppBtn" target="_blank" class="text-success text-decoration-none fw-bold" title="WhatsApp Active - Click to Chat">
                                            <i class="fa-brands fa-whatsapp fs-5"></i>
                                        </a>
                                    </span>
                                </div>
                            </div>
                            <div class="col-3">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Caste:</label>
                                <input type="text" class="form-control form-control-sm global-sync" data-key="caste" placeholder="Caste">
                            </div>
                            <div class="col-3">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Religion:</label>
                                <input type="text" class="form-control form-control-sm global-sync" data-key="religion" value="Islam">
                            </div>
                            <div class="col-3">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Profession:</label>
                                <input type="text" class="form-control form-control-sm global-sync" data-key="father_profession" placeholder="Profession">
                            </div>
                            <div class="col-3">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Monthly Income:</label>
                                <input type="text" class="form-control form-control-sm global-sync" data-key="monthly_income" placeholder="Rs.">
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Full Residential Address:</label>
                                <input type="text" class="form-control form-control-sm global-sync" data-key="full_address" placeholder="House #, Street, Area, City" required>
                            </div>
                        </div>
                    </div>
                    <div class="mb-2">
                        <h6 class="bg-success text-white p-1 rounded mb-1" style="font-size: 0.75rem;"><i class="fa-solid fa-user-tie me-1"></i> GUARDIAN INFORMATION SECTION (If applicable)</h6>
                        <div class="row g-2">
                            <div class="col-4">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Guardian’s Name:</label>
                                <input type="text" class="form-control form-control-sm global-sync" data-key="guardian_name" placeholder="Guardian name">
                            </div>
                            <div class="col-4">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Guardian’s CNIC (13 Digits):</label>
                                <input type="text" class="form-control form-control-sm cnic-input global-sync" data-key="guardian_cnic" maxlength="13" placeholder="3520200000000">
                            </div>
                            <div class="col-4">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Cell No (11 Digits):</label>
                                <input type="text" class="form-control form-control-sm phone-input global-sync" data-key="guardian_phone" maxlength="11" placeholder="03000000000">
                            </div>
                            <div class="col-3">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Relation to Child:</label>
                                <input type="text" class="form-control form-control-sm global-sync" data-key="guardian_relation" placeholder="Relation">
                            </div>
                            <div class="col-3">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Profession:</label>
                                <input type="text" class="form-control form-control-sm global-sync" data-key="guardian_profession" placeholder="Profession">
                            </div>
                            <div class="col-3">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Distant from School (KM):</label>
                                <input type="text" class="form-control form-control-sm global-sync" data-key="distance_km" placeholder="KM">
                            </div>
                            <div class="col-3">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Guardian Full Address:</label>
                                <input type="text" class="form-control form-control-sm global-sync" data-key="guardian_address" placeholder="Address">
                            </div>
                            <div class="col-4 mt-2 print-signature">
                                <div class="border-top pt-1 text-center">
                                    <span class="text-muted" style="font-size: 6.5pt;">Signature of Father / Guardian</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mb-1">
                        <h6 class="bg-secondary text-white p-1 rounded mb-1" style="font-size: 0.75rem;"><i class="fa-solid fa-clipboard-check me-1"></i> SCHOOL OFFICIAL USE SECTION</h6>
                        <div class="row g-2">
                            <div class="col-3">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">School Admission No:</label>
                                <input type="text" class="form-control form-control-sm global-sync bg-light" data-key="school_admission_no" id="schoolAdmissionNoField" readonly>
                            </div>
                            <div class="col-3">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Date of Enrollment:</label>
                                <input type="date" class="form-control form-control-sm global-sync" data-key="date_of_enrollment" id="dateOfEnrollmentField">
                            </div>
                            <div class="col-3">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Class of Student:</label>
                                <select class="form-select form-select-sm global-sync" data-key="class_enrolled" required>
                                    <option value="Grade 6">Grade 6</option>
                                    <option value="Grade 7">Grade 7</option>
                                    <option value="Grade 8">Grade 8</option>
                                    <option value="Grade 9">Grade 9</option>
                                    <option value="Grade 10">Grade 10</option>
                                </select>
                            </div>
                            <div class="col-3">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Section:</label>
                                <select class="form-select form-select-sm global-sync" data-key="section_enrolled">
                                    <option value="Section A">Section A</option>
                                    <option value="Section B">Section B</option>
                                </select>
                            </div>
                            <div class="col-4">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Session:</label>
                                <input type="text" class="form-control form-control-sm global-sync" data-key="session_year" value="2026-2027">
                            </div>
                            <div class="col-12 mt-1">
                                <label class="form-label fw-bold small mb-0 text-success" style="font-size: 0.7rem;">Admission Test Evaluation Marks:</label>
                                <table class="table table-bordered text-center align-middle mb-1" style="font-size: 7pt;">
                                    <thead class="table-light">
                                        <tr>
                                            <th>English</th>
                                            <th>Urdu</th>
                                            <th>Maths</th>
                                            <th>Science</th>
                                            <th>Interview / Oral</th>
                                            <th>Total Marks Obtained</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><input type="number" class="form-control form-control-sm text-center test-mark global-sync" data-key="marks_english" value="85" min="0" max="100"></td>
                                            <td><input type="number" class="form-control form-control-sm text-center test-mark global-sync" data-key="marks_urdu" value="80" min="0" max="100"></td>
                                            <td><input type="number" class="form-control form-control-sm text-center test-mark global-sync" data-key="marks_maths" value="90" min="0" max="100"></td>
                                            <td><input type="number" class="form-control form-control-sm text-center test-mark global-sync" data-key="marks_science" value="88" min="0" max="100"></td>
                                            <td><input type="number" class="form-control form-control-sm text-center test-mark global-sync" data-key="marks_interview" value="92" min="0" max="100"></td>
                                            <td><input type="text" class="form-control form-control-sm text-center bg-light fw-bold global-sync" data-key="marks_total" id="totalTestMarks" readonly value="435"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="col-12 mt-1">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <label class="form-label fw-bold small mb-0 text-success" style="font-size: 0.7rem;">Fee Slabs Structure & Total Payable Fee:</label>
                                    <button type="button" class="btn btn-xxs btn-outline-success py-0 px-2 no-print" id="addFeeRowBtn" style="font-size: 0.65rem;"><i class="fa-solid fa-plus"></i> Add Fee Category</button>
                                </div>
                                <table class="table table-bordered text-center align-middle mb-1" style="font-size: 7pt;" id="feeSlabsTable">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Fee Category Description</th>
                                            <th style="width: 150px;">Amount (Rs.)</th>
                                            <th class="no-print" style="width: 50px;">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody id="feeSlabsBody">
                                        <tr>
                                            <td><input type="text" class="form-control form-control-sm global-sync" data-key="fee_cat_1" value="Admission & Tuition Fee"></td>
                                            <td><input type="number" class="form-control form-control-sm text-center fee-amount global-sync" data-key="fee_amt_1" value="4500"></td>
                                            <td class="no-print"><button type="button" class="btn btn-xxs btn-outline-danger py-0 px-1" onclick="this.closest('tr').remove(); calculateTotalFee();"><i class="fa-solid fa-trash"></i></button></td>
                                        </tr>
                                        <tr>
                                            <td><input type="text" class="form-control form-control-sm global-sync" data-key="fee_cat_2" value="Books & Stationary Fund"></td>
                                            <td><input type="number" class="form-control form-control-sm text-center fee-amount global-sync" data-key="fee_amt_2" value="1000"></td>
                                            <td class="no-print"><button type="button" class="btn btn-xxs btn-outline-danger py-0 px-1" onclick="this.closest('tr').remove(); calculateTotalFee();"><i class="fa-solid fa-trash"></i></button></td>
                                        </tr>
                                    </tbody>
                                    <tfoot class="table-group-divider">
                                        <tr class="fw-bold bg-light">
                                            <td class="text-end py-1">TOTAL PAYABLE FEE:</td>
                                            <td>
                                                <input type="text" class="form-control form-control-sm text-center fw-bold bg-white text-success global-sync" data-key="total_fee" id="hiddenTotalFeeInput" readonly value="Rs. 5500">
                                            </td>
                                            <td class="no-print"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div class="col-12 mt-1">
                                <label class="form-label fw-bold small mb-0" style="font-size: 0.7rem;">Head Master / Principal Comments:</label>
                                <input type="text" class="form-control form-control-sm global-sync" data-key="headmaster_comments" value="Admitted on merit. Eligible for all school sessions, fee ledger, and parent portal access.">
                            </div>
                            <div class="col-8 mt-2">
                                <div class="border p-1 text-center bg-light rounded d-inline-block px-3">
                                    <span class="text-muted d-block" style="font-size: 6pt;">OFFICIAL SCHOOL STAMP</span>
                                    <div style="height: 18px;"></div>
                                </div>
                            </div>
                            <div class="col-4 mt-2 text-end">
                                <div class="border-top pt-1 d-inline-block px-2">
                                    <span class="fw-bold" style="font-size: 6.5pt;">SIGNATURE OF PRINCIPAL / H.M.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        `;
        navFormBtn.classList.add('active', 'btn-outline-success');
        navFormBtn.classList.remove('btn-outline-dark');
        navListBtn.classList.remove('active', 'btn-outline-success');
        navListBtn.classList.add('btn-outline-dark');
        if (printBtn) printBtn.style.display = 'inline-block';
        
        // Re-initialize dynamic number generation and profile bindings for the newly rendered form
        applyTenantProfileToDOM();
        generateNewAdmissionNumbers();
        attachFormEventListeners();
    } else {
        workspace.innerHTML = `
            <div class="card shadow-sm p-3 bg-white mx-auto" id="admissionListContainer" style="max-width: 200mm;">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="text-success fw-bold mb-0"><i class="fa-solid fa-users-rectangle me-2"></i>Registered Student Directory & Live Ledger</h5>
                    <button type="button" class="btn btn-success btn-sm fw-bold" onclick="switchView('form'); resetFormForNewAdmission();">
                        <i class="fa-solid fa-user-plus me-1"></i> New Admission
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-striped table-bordered align-middle" style="font-size: 8pt;">
                        <thead class="table-success">
                            <tr>
                                <th>Adm No</th>
                                <th>Student Name</th>
                                <th>Father Name</th>
                                <th>Class</th>
                                <th>Phone / WhatsApp</th>
                                <th class="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="studentDirectoryTableBody">
                            <!-- Populated dynamically via JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        navListBtn.classList.add('active', 'btn-outline-success');
        navListBtn.classList.remove('btn-outline-dark');
        navFormBtn.classList.remove('active', 'btn-outline-success');
        navFormBtn.classList.add('btn-outline-dark');
        if (printBtn) printBtn.style.display = 'none';
        renderStudentDirectory();
    }
}

// Generate sequential or unique Admission and Registration numbers based on database count
function generateNewAdmissionNumbers() {
    let globalStudentDatabase = JSON.parse(localStorage.getItem('lama_student_database')) || [];
    const nextSeq = globalStudentDatabase.length + 1;
    const paddedNum = String(nextSeq).padStart(3, '0');
    
    const newAdmNo = `LAMA-2026-${paddedNum}`;
    const newSchAdmNo = `LAMA-SCH-${paddedNum}`;

    const admField = document.getElementById('admissionNoField');
    const schAdmField = document.getElementById('schoolAdmissionNoField');
    if (admField) admField.value = newAdmNo;
    if (schAdmField) schAdmField.value = newSchAdmNo;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const issueField = document.getElementById('dateOfIssueField');
    const enrollField = document.getElementById('dateOfEnrollmentField');
    if (issueField && !issueField.value) issueField.value = todayStr;
    if (enrollField && !enrollField.value) enrollField.value = todayStr;
}

// Reset form fields for brand new admission entry
function resetFormForNewAdmission() {
    const form = document.getElementById('studentAdmissionForm');
    if (form) form.reset();
    const editIndexElem = document.getElementById('editingRecordIndex');
    if (editIndexElem) editIndexElem.value = "-1";
    const preview = document.getElementById('studentPhotoPreview');
    const placeholder = document.getElementById('photoPlaceholderIcon');
    const compressed = document.getElementById('compressedPhotoData');
    if (preview) preview.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
    if (compressed) compressed.value = "";
    generateNewAdmissionNumbers();
    calculateTotalFee();
    checkWhatsAppAvailability();
}

// Render Student Directory Table with Edit and Remove options
function renderStudentDirectory() {
    let globalStudentDatabase = JSON.parse(localStorage.getItem('lama_student_database')) || [];
    const tbody = document.getElementById('studentDirectoryTableBody');
    const badge = document.getElementById('directoryCountBadge');
    if (badge) badge.innerText = globalStudentDatabase.length;

    if (!tbody) return;

    if (globalStudentDatabase.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No student admissions recorded yet. Click 'New Admission' to register.</td></tr>`;
        return;
    }

    let html = '';
    globalStudentDatabase.forEach((student, index) => {
        html += `
            <tr>
                <td class="fw-bold">${student.admission_no || 'N/A'}</td>
                <td>${student.full_name || 'N/A'}</td>
                <td>${student.father_name || 'N/A'}</td>
                <td>${student.class_enrolled || 'N/A'} (${student.section_enrolled || ''})</td>
                <td>${student.father_phone || 'N/A'}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-xs btn-outline-primary py-0 px-2" onclick="editStudentRecord(${index})" title="Edit Entry"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button type="button" class="btn btn-xs btn-outline-danger py-0 px-2 ms-1" onclick="deleteStudentRecord(${index})" title="Remove Entry"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// Edit existing student record by loading into form
function editStudentRecord(index) {
    switchView('form');
    let globalStudentDatabase = JSON.parse(localStorage.getItem('lama_student_database')) || [];
    const record = globalStudentDatabase[index];
    if (!record) return;

    const formFields = document.querySelectorAll('.global-sync');
    formFields.forEach(field => {
        const key = field.getAttribute('data-key');
        if (record[key] !== undefined) {
            if (field.type === 'radio') {
                if (field.value === record[key]) field.checked = true;
            } else if (field.type === 'checkbox') {
                field.checked = (record[key] === field.value || record[key] === true);
            } else {
                field.value = record[key];
            }
        }
    });

    const editIndexElem = document.getElementById('editingRecordIndex');
    if (editIndexElem) editIndexElem.value = index;

    const preview = document.getElementById('studentPhotoPreview');
    const placeholder = document.getElementById('photoPlaceholderIcon');
    if (record.compressed_student_photo && preview && placeholder) {
        preview.src = record.compressed_student_photo;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
    } else if (preview && placeholder) {
        preview.style.display = 'none';
        placeholder.style.display = 'block';
    }

    calculateTotalFee();
    checkWhatsAppAvailability();
}

// Delete student record from directory list
function deleteStudentRecord(index) {
    if (confirm('Are you sure you want to remove this admission record from the live directory?')) {
        let globalStudentDatabase = JSON.parse(localStorage.getItem('lama_student_database')) || [];
        globalStudentDatabase.splice(index, 1);
        localStorage.setItem('lama_student_database', JSON.stringify(globalStudentDatabase));
        renderStudentDirectory();
    }
}

let tenantProfile = JSON.parse(localStorage.getItem('saas_tenant_school_profile')) || {
    name: "LAMA SCHOOL MANAGEMENT",
    tagline: "Official Admission & Registration Portal",
    tenant_id: "aims_demo_01",
    logo: ""
};

function applyTenantProfileToDOM() {
    const nameElem = document.getElementById('displaySchoolName');
    const taglineElem = document.getElementById('displaySchoolTagline');
    const tenantElem = document.getElementById('displaySchoolTenant');
    const cfgNameElem = document.getElementById('configSchoolName');
    const cfgTaglineElem = document.getElementById('configSchoolTagline');
    const cfgTenantElem = document.getElementById('configTenantId');
    const logoPreview = document.getElementById('schoolLogoPreview');
    const logoPlaceholder = document.getElementById('logoPlaceholderIcon');

    if (nameElem) nameElem.innerText = tenantProfile.name;
    if (taglineElem) taglineElem.innerText = tenantProfile.tagline;
    if (tenantElem) tenantElem.innerText = "Tenant ID: " + tenantProfile.tenant_id;
    if (cfgNameElem) cfgNameElem.value = tenantProfile.name;
    if (cfgTaglineElem) cfgTaglineElem.value = tenantProfile.tagline;
    if (cfgTenantElem) cfgTenantElem.value = tenantProfile.tenant_id;

    if (tenantProfile.logo && logoPreview && logoPlaceholder) {
        logoPreview.src = tenantProfile.logo;
        logoPreview.style.display = 'block';
        logoPlaceholder.style.display = 'none';
    }
}

function attachFormEventListeners() {
    const phoneInputElem = document.getElementById('fatherPhoneInput');
    if (phoneInputElem) {
        phoneInputElem.addEventListener('input', checkWhatsAppAvailability);
    }
    checkWhatsAppAvailability();

    const dobElem = document.getElementById('inputDob');
    if (dobElem) {
        dobElem.addEventListener('change', function() {
            const dob = new Date(this.value);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
            const ageInput = document.getElementById('inputAge');
            if (ageInput) ageInput.value = !isNaN(age) && age >= 0 ? age + " Years" : "";
        });
    }

    const testMarks = document.querySelectorAll('.test-mark');
    const totalTestMarksInput = document.getElementById('totalTestMarks');
    testMarks.forEach(input => {
        input.addEventListener('input', function() {
            let sum = 0;
            testMarks.forEach(f => sum += parseFloat(f.value) || 0);
            if (totalTestMarksInput) totalTestMarksInput.value = sum;
        });
    });

    const addFeeBtn = document.getElementById('addFeeRowBtn');
    if (addFeeBtn) {
        addFeeBtn.addEventListener('click', function() {
            const tbody = document.getElementById('feeSlabsBody');
            if (!tbody) return;
            const rowCount = tbody.rows.length + 1;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" class="form-control form-control-sm global-sync" data-key="fee_cat_${rowCount}" placeholder="Category Name"></td>
                <td><input type="number" class="form-control form-control-sm text-center fee-amount global-sync" data-key="fee_amt_${rowCount}" value="500" oninput="calculateTotalFee()"></td>
                <td class="no-print"><button type="button" class="btn btn-xxs btn-outline-danger py-0 px-1" onclick="this.closest('tr').remove(); calculateTotalFee();"><i class="fa-solid fa-trash"></i></button></td>
            `;
            tbody.appendChild(tr);
            calculateTotalFee();
        });
    }

    const photoUploadInput = document.getElementById('photoUploadInput');
    if (photoUploadInput) {
        photoUploadInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) processImageFile(e.target.files[0]);
        });
    }

    const openCameraBtn = document.getElementById('openCameraBtn');
    if (openCameraBtn) {
        let mediaStreamInstance = null;
        openCameraBtn.addEventListener('click', async function() {
            const cameraModal = document.getElementById('cameraModal');
            const cameraStream = document.getElementById('cameraStream');
            if (cameraModal) cameraModal.style.display = 'block';
            try {
                mediaStreamInstance = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
                if (cameraStream) cameraStream.srcObject = mediaStreamInstance;
            } catch (err) {
                alert('Camera access denied or unavailable.');
                if (cameraModal) cameraModal.style.display = 'none';
            }
        });

        const closeCamBtn = document.getElementById('closeCameraBtn');
        if (closeCamBtn) {
            closeCamBtn.addEventListener('click', function() {
                if (mediaStreamInstance) mediaStreamInstance.getTracks().forEach(t => t.stop());
                const cameraModal = document.getElementById('cameraModal');
                if (cameraModal) cameraModal.style.display = 'none';
            });
        }

        const captureBtn = document.getElementById('captureSnapshotBtn');
        if (captureBtn) {
            captureBtn.addEventListener('click', function() {
                const cameraStream = document.getElementById('cameraStream');
                const cameraCanvas = document.getElementById('cameraCanvas');
                const w = cameraStream ? cameraStream.videoWidth || 320 : 320;
                const h = cameraStream ? cameraStream.videoHeight || 240 : 240;
                if (cameraCanvas) {
                    cameraCanvas.width = w;
                    cameraCanvas.height = h;
                    cameraCanvas.getContext('2d').drawImage(cameraStream, 0, 0, w, h);
                }
                if (mediaStreamInstance) mediaStreamInstance.getTracks().forEach(t => t.stop());
                const cameraModal = document.getElementById('cameraModal');
                if (cameraModal) cameraModal.style.display = 'none';
                if (cameraCanvas) {
                    cameraCanvas.toBlob(blob => processImageFile(blob), 'image/jpeg', 0.8);
                }
            });
        }
    }
}

function processImageFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 110;
            canvas.height = 140;
            ctx.drawImage(img, 0, 0, 110, 140);

            let quality = 0.8;
            let dataUrl = canvas.toDataURL('image/jpeg', quality);
            while (dataUrl.length > 25000 && quality > 0.1) {
                quality -= 0.1;
                dataUrl = canvas.toDataURL('image/jpeg', quality);
            }

            const preview = document.getElementById('studentPhotoPreview');
            const placeholder = document.getElementById('photoPlaceholderIcon');
            const compressed = document.getElementById('compressedPhotoData');
            if (preview) {
                preview.src = dataUrl;
                preview.style.display = 'block';
            }
            if (placeholder) placeholder.style.display = 'none';
            if (compressed) compressed.value = dataUrl;
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

document.addEventListener('DOMContentLoaded', function() {
    applyTenantProfileToDOM();
    generateNewAdmissionNumbers();
    attachFormEventListeners();

    // Save School Configuration Handler
    const saveCfgBtn = document.getElementById('saveSchoolConfigBtn');
    if (saveCfgBtn) {
        saveCfgBtn.addEventListener('click', function() {
            const cfgName = document.getElementById('configSchoolName');
            const cfgTagline = document.getElementById('configSchoolTagline');
            const cfgTenant = document.getElementById('configTenantId');
            if (cfgName) tenantProfile.name = cfgName.value.trim() || "LAMA SCHOOL MANAGEMENT";
            if (cfgTagline) tenantProfile.tagline = cfgTagline.value.trim() || "Admission Portal";
            if (cfgTenant) tenantProfile.tenant_id = cfgTenant.value.trim() || "aims_demo_01";

            localStorage.setItem('saas_tenant_school_profile', JSON.stringify(tenantProfile));
            applyTenantProfileToDOM();
            alert('School live settings updated successfully! All future admissions and prints will now carry ' + tenantProfile.name + '.');
        });
    }

    // School Logo Upload Handler
    const logoUpload = document.getElementById('schoolLogoUpload');
    if (logoUpload) {
        logoUpload.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    tenantProfile.logo = evt.target.result;
                    localStorage.setItem('saas_tenant_school_profile', JSON.stringify(tenantProfile));
                    applyTenantProfileToDOM();
                }
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('fee-amount')) {
            calculateTotalFee();
        }
    });

    // Save & Register Handler with Duplicate Prevention & Editing support
    const saveAndSyncBtn = document.getElementById('saveAndSyncBtn');
    if (saveAndSyncBtn) {
        saveAndSyncBtn.addEventListener('click', function() {
            const formFields = document.querySelectorAll('.global-sync');
            const currentRecord = {};
            formFields.forEach(field => {
                const key = field.getAttribute('data-key');
                if (key === 'editingRecordIndex') return;
                if (field.type === 'radio') {
                    if (field.checked) currentRecord[key] = field.value;
                } else if (field.type === 'checkbox') {
                    currentRecord[key] = field.checked ? field.value : "";
                } else {
                    currentRecord[key] = field.value;
                }
            });

            currentRecord.tenant_id = tenantProfile.tenant_id;
            currentRecord.school_name = tenantProfile.name;

            let globalStudentDatabase = JSON.parse(localStorage.getItem('lama_student_database')) || [];
            const editingRecordIndexElem = document.getElementById('editingRecordIndex');
            const editingIndex = editingRecordIndexElem ? parseInt(editingRecordIndexElem.value) : -1;

            if (editingIndex >= 0 && editingIndex < globalStudentDatabase.length) {
                globalStudentDatabase[editingIndex] = currentRecord;
                alert('Admission record updated successfully in live directory!');
            } else {
                const duplicate = globalStudentDatabase.find(s => s.admission_no === currentRecord.admission_no || (currentRecord.bform_no && s.bform_no === currentRecord.bform_no));
                if (duplicate) {
                    if (!confirm('An admission record with this Admission No or B-Form already exists in the system. Do you want to proceed and save as a separate update?')) {
                        return;
                    }
                }
                globalStudentDatabase.push(currentRecord);
                alert('[Live SaaS Sync Success]: New student admission saved and registered successfully!');
            }

            localStorage.setItem('lama_student_database', JSON.stringify(globalStudentDatabase));

            const phoneInputElem = document.getElementById('fatherPhoneInput');
            if (phoneInputElem) {
                const phoneInput = phoneInputElem.value.trim();
                if (phoneInput.length >= 10) {
                    let formattedPhone = phoneInput;
                    if (formattedPhone.startsWith('0')) {
                        formattedPhone = '92' + formattedPhone.substring(1);
                    }
                    const studentName = currentRecord.full_name || 'Student';
                    const admissionNo = currentRecord.admission_no || 'ADM';
                    const msg = encodeURIComponent(`Dear Parent, your child ${studentName}'s admission form (Admission No: ${admissionNo}) has been successfully registered and approved at ${tenantProfile.name}. Welcome!`);
                    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, '_blank');
                }
            }

            switchView('list');
        });
    }
});
</script>
</body>
</html><?php /**PATH /workspaces/lamastudio-website/lamaStudio-sms/resources/views/students/admission-form.blade.php ENDPATH**/ ?>