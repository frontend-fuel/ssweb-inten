// Check for token
const token = localStorage.getItem('adminToken');
if (!token) {
    window.location.href = '/index.html';
}

const userName = localStorage.getItem('adminUsername') || 'Admin';
document.getElementById('userName').textContent = userName;
document.getElementById('userInitial').textContent = userName.charAt(0).toUpperCase();
if (document.getElementById('adminSidebarName')) {
    document.getElementById('adminSidebarName').textContent = userName;
}
if (document.querySelector('.sidebar-user-card .user-avatar-small')) {
    document.querySelector('.sidebar-user-card .user-avatar-small').textContent = userName.charAt(0).toUpperCase();
}

// DOM Elements
const certsTableBody = document.getElementById('certsTableBody');
const totalCertsEl = document.getElementById('totalCerts');
const activeCertsEl = document.getElementById('activeCerts');
const revokedCertsEl = document.getElementById('revokedCerts');
const certModal = document.getElementById('certModal');
const certForm = document.getElementById('certForm');
const modalTitle = document.getElementById('modalTitle');
const statusGroup = document.getElementById('statusGroup');
const tableLoader = document.getElementById('tableLoader');

// API Base URL (Hardcoded for stability)
const API_URL = '/v1/api';

// Fetch stats and certificates
async function fetchData() {
    if (tableLoader) tableLoader.style.display = 'flex';
    try {
        const [statsRes, certsRes] = await Promise.all([
            fetch(`${API_URL}/certificates/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_URL}/certificates`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        if (statsRes.status === 401 || certsRes.status === 401) {
            handleLogout();
            return;
        }

        const stats = await statsRes.json();
        const certs = await certsRes.json();

        updateStats(stats);
        renderTable(certs);
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        if (tableLoader) tableLoader.style.display = 'none';
    }
}

function updateStats(stats) {
    totalCertsEl.textContent = stats.totalCertificates || 0;
    activeCertsEl.textContent = stats.activeCertificates || 0;
    revokedCertsEl.textContent = stats.revokedCertificates || 0;
    if (document.getElementById('totalOffers')) {
        document.getElementById('totalOffers').textContent = stats.totalOffers || 0;
    }
}

function renderTable(certs) {
    if (!Array.isArray(certs) || certs.length === 0) {
        certsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: rgba(255,255,255,0.4);">No certificates found. Generate your first one!</td></tr>';
        return;
    }

    certsTableBody.innerHTML = certs.map(cert => `
        <tr>
            <td class="cert-id-cell">${cert.certificateId}</td>
            <td style="font-weight: 800; color: var(--dark);">${cert.studentName}</td>
            <td style="color: var(--text-muted);">${cert.internshipDomain}</td>
            <td style="color: var(--text-muted); font-weight: 500;">${new Date(cert.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
            <td>
                <span class="status-badge ${cert.status === 'Active' ? 'status-active' : 'status-revoked'}">
                    ${cert.status}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <a href="${API_URL}/certificates/${cert.certificateId}/pdf?preview=true&layout=portrait" target="_blank" class="btn-icon" title="Portrait Preview" style="color: var(--success); background: #f0fdf4;">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                    <a href="${API_URL}/certificates/${cert.certificateId}/pdf?preview=true&layout=landscape" target="_blank" class="btn-icon" title="Landscape Preview" style="color: #10b981; background: #ecfdf5;">
                        <i class="fa-solid fa-window-maximize"></i>
                    </a>
                    <a href="${API_URL}/certificates/${cert.certificateId}/pdf?layout=portrait" target="_blank" class="btn-icon" title="Portrait PDF" style="color: var(--primary); background: #eff6ff;">
                        <i class="fa-solid fa-file-invoice"></i>
                    </a>
                    <a href="${API_URL}/certificates/${cert.certificateId}/pdf?layout=landscape" target="_blank" class="btn-icon" title="Landscape PDF" style="color: #8b5cf6; background: #f3f0ff;">
                        <i class="fa-solid fa-file-alt"></i>
                    </a>
                    <button onclick="openEditModal('${cert.certificateId}')" class="btn-icon" title="Edit" style="color: var(--warning); background: #fffbeb;">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button onclick="deleteCert('${cert.certificateId}')" class="btn-icon" title="Delete" style="color: var(--error); background: #fef2f2;">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Modal logic
function openModal(isEdit = false) {
    certModal.classList.add('active');
    certModal.style.display = 'flex';
    if (!isEdit) {
        modalTitle.textContent = 'Generate Certificate';
        certForm.reset();
        document.getElementById('editCertId').value = '';
        statusGroup.style.display = 'none';
    } else {
        modalTitle.textContent = 'Edit Certificate';
        statusGroup.style.display = 'block';
    }
}

function closeModal() {
    certModal.classList.remove('active');
    setTimeout(() => {
        certModal.style.display = 'none';
    }, 300);
}

document.getElementById('newCertBtn').onclick = (e) => { e.preventDefault(); openModal(false); };
document.getElementById('panelNewBtn').onclick = () => openModal(false);
document.getElementById('closeModal').onclick = closeModal;
document.getElementById('cancelBtn').onclick = closeModal;

window.onclick = (event) => {
    if (event.target === certModal) closeModal();
};

// Edit certificate
window.openEditModal = async (id) => {
    try {
        const res = await fetch(`${API_URL}/certificates/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const cert = await res.json();
        
        document.getElementById('editCertId').value = cert.certificateId;
        document.getElementById('studentName').value = cert.studentName;
        document.getElementById('studentEmail').value = cert.studentEmail || '';
        document.getElementById('domain').value = cert.internshipDomain;
        document.getElementById('duration').value = cert.duration ? cert.duration.split(' ')[0] : '';
        document.getElementById('startDate').value = cert.startDate.split('T')[0];
        document.getElementById('endDate').value = cert.endDate.split('T')[0];
        document.getElementById('issueDate').value = cert.issueDate ? cert.issueDate.split('T')[0] : '';
        document.getElementById('status').value = cert.status;
        document.getElementById('description').value = cert.description || '';
        
        openModal(true);
    } catch (error) {
        alert('Error fetching certificate details');
    }
};

// Save/Update certificate
certForm.onsubmit = async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = 'Saving...';

    const id = document.getElementById('editCertId').value;
    const durationValue = document.getElementById('duration').value;
    const durationFormatted = durationValue == 1 ? "1 Month" : `${durationValue} Months`;

    const data = {
        studentName: document.getElementById('studentName').value,
        studentEmail: document.getElementById('studentEmail').value,
        internshipDomain: document.getElementById('domain').value,
        duration: durationFormatted,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        issueDate: document.getElementById('issueDate').value || null,
        status: document.getElementById('status').value,
        description: document.getElementById('description').value
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/certificates/${id}` : `${API_URL}/certificates`;
        
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeModal();
            fetchData();
        } else {
            const err = await res.json();
            alert(err.message || 'Operation failed');
        }
    } catch (error) {
        alert('Server connection failed');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
};

// Delete certificate
window.deleteCert = async (id) => {
    if (confirm(`Are you sure you want to delete certificate ${id}?`)) {
        try {
            const res = await fetch(`${API_URL}/certificates/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchData();
            } else {
                alert('Failed to delete');
            }
        } catch (error) {
            alert('Server connection failed');
        }
    }
};

function handleLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    window.location.href = '/index.html';
}

document.getElementById('logoutBtn').onclick = (e) => {
    e.preventDefault();
    handleLogout();
};

// Tab Switching Logic
const navItems = document.querySelectorAll('.nav-item[data-tab]');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = item.getAttribute('data-tab');
        
        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Show/Hide sections
        if (tabId === 'students') {
            document.getElementById('certificatesTab').style.display = 'none';
            document.getElementById('studentsTab').style.display = 'block';
            document.getElementById('offersTab').style.display = 'none';
            fetchStudents();
        } else if (tabId === 'offers') {
            document.getElementById('certificatesTab').style.display = 'none';
            document.getElementById('studentsTab').style.display = 'none';
            document.getElementById('offersTab').style.display = 'block';
            fetchOfferLetters();
        } else {
            document.getElementById('certificatesTab').style.display = 'block';
            document.getElementById('studentsTab').style.display = 'none';
            document.getElementById('offersTab').style.display = 'none';
            fetchData();
        }
    });
});

// Student Management Logic
async function fetchStudents() {
    try {
        const res = await fetch('/v1/api/admin/students', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const students = await res.json();
        renderStudentsTable(students);
        updateStudentStats(students);
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}

function updateStudentStats(students) {
    const total = students.length;
    const approved = students.filter(s => s.isApproved).length;
    document.getElementById('totalStudents').textContent = total;
    document.getElementById('approvedStudents').textContent = approved;
}

function renderStudentsTable(students) {
    const body = document.getElementById('studentsTableBody');
    if (!Array.isArray(students) || students.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">No students registered yet.</td></tr>';
        return;
    }

    body.innerHTML = students.map(student => `
        <tr>
            <td style="font-weight: 700; color: var(--dark);">${student.name}</td>
            <td style="color: var(--text-muted); font-size: 13px;">${student.email}</td>
            <td style="color: var(--primary); font-weight: 800;">${student.progressPercentage || 0}%</td>
            <td style="color: #10b981; font-weight: 800;">${student.masteryCount || '0 / 8'}</td>
            <td>
                ${student.projectLink ? 
                    `<a href="${student.projectLink}" target="_blank" style="color: #8b5cf6; text-decoration: none; font-weight: 800; display: flex; align-items: center; gap: 5px;">
                        <i class="fas fa-external-link-alt"></i> View Project
                     </a>` : 
                    `<span style="color: var(--text-muted); font-size: 11px; font-weight: 600;">Pending</span>`
                }
            </td>
            <td style="color: var(--text-muted); font-size: 13px;">${new Date(student.createdAt).toLocaleDateString()}</td>
            <td>
                <span class="status-badge ${student.isApproved ? 'status-active' : 'status-revoked'}" style="padding: 5px 12px; font-size: 11px;">
                    ${student.isApproved ? 'Approved' : 'Pending'}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button onclick="toggleApproval('${student._id}')" class="btn-primary" style="padding: 8px 12px; font-size: 11px; width: auto; background: ${student.isApproved ? '#ef4444' : '#10b981'};">
                        ${student.isApproved ? 'Revoke' : 'Grant'}
                    </button>
                    <button onclick="resetPassword('${student._id}', '${student.name}')" class="btn-primary" style="padding: 8px 12px; font-size: 11px; width: auto; background: var(--dark);">
                        Reset PWD
                    </button>
                    <button onclick="deleteStudent('${student._id}', '${student.name}')" class="btn-icon" style="color: var(--error); border-color: var(--error); background: #fef2f2;" title="Delete Student">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.deleteStudent = async (id, name) => {
    if (confirm(`Are you sure you want to PERMANENTLY delete student ${name}? This cannot be undone.`)) {
        try {
            const res = await fetch(`${API_URL}/admin/students/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchStudents();
            } else {
                alert('Failed to delete student');
            }
        } catch (error) {
            alert('Server connection failed');
        }
    }
};

window.toggleApproval = async (id) => {
    try {
        const res = await fetch(`${API_URL}/admin/students/${id}/approve`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            fetchStudents();
        }
    } catch (error) {
        console.error('Error toggling approval:', error);
    }
};

window.resetPassword = async (id, name) => {
    const newPass = prompt(`Enter new password for ${name}:`);
    if (!newPass) return;
    if (newPass.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/admin/students/${id}/reset-password`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ newPassword: newPass })
        });

        if (res.ok) {
            alert(`Password for ${name} has been reset successfully!`);
        } else {
            alert('Failed to reset password');
        }
    } catch (error) {
        alert('Server connection failed');
    }
};

// Auto-calculate internship duration in months
function updateDuration() {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    const durationInput = document.getElementById('duration');

    if (start && end) {
        const d1 = new Date(start);
        const d2 = new Date(end);
        
        // Calculate difference in months
        let months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        
        // Rounding logic for partial months (if > 15 days, count as another month)
        const dayDiff = d2.getDate() - d1.getDate();
        if (dayDiff >= 15) months++;
        
        if (months < 1) months = 1; // Minimum 1 month usually

        durationInput.value = months === 1 ? '1 Month' : `${months} Months`;
    }
}

document.getElementById('startDate').addEventListener('change', updateDuration);
document.getElementById('endDate').addEventListener('change', updateDuration);

// Initial fetch
fetchData();

// FAB Logic
function toggleFab() {
    const options = document.getElementById('fabOptions');
    const icon = document.getElementById('fabIcon');
    options.classList.toggle('active');
    if (options.classList.contains('active')) {
        icon.className = 'fas fa-times';
    } else {
        icon.className = 'fas fa-comment-dots';
    }
}

// --- Offer Letter Logic ---

const offerModal = document.getElementById('offerModal');
const offerForm = document.getElementById('offerForm');
const offersTableBody = document.getElementById('offersTableBody');

async function fetchOfferLetters() {
    try {
        const res = await fetch(`${API_URL}/offers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) {
            handleLogout();
            return;
        }
        const offers = await res.json();
        renderOffersTable(offers);
    } catch (error) {
        console.error('Error fetching offer letters:', error);
    }
}

function renderOffersTable(offers) {
    if (!Array.isArray(offers) || offers.length === 0) {
        offersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">No offer letters found.</td></tr>';
        return;
    }

    offersTableBody.innerHTML = offers.map(offer => `
        <tr>
            <td class="cert-id-cell">${offer.offerId}</td>
            <td style="font-weight: 800; color: var(--dark);">${offer.studentName}<br><small style="font-weight: 400; color: var(--text-muted);">${offer.studentEmail}</small></td>
            <td style="color: var(--text-muted);">${offer.internshipDomain}</td>
            <td style="color: var(--text-muted); font-weight: 500;">${offer.duration}</td>
            <td>
                <span class="status-badge ${offer.status === 'Active' ? 'status-active' : 'status-revoked'}">
                    ${offer.status}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <a href="${API_URL}/offers/${offer.offerId}/pdf?preview=true" target="_blank" class="btn-icon" title="Preview PDF" style="color: var(--success); background: #f0fdf4;">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                    <a href="${API_URL}/offers/${offer.offerId}/pdf" target="_blank" class="btn-icon" title="Download PDF" style="color: var(--primary); background: #eff6ff;">
                        <i class="fa-solid fa-download"></i>
                    </a>
                    <button onclick="openOfferEditModal('${offer.offerId}')" class="btn-icon" title="Edit" style="color: var(--warning); background: #fffbeb;">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button onclick="deleteOffer('${offer.offerId}')" class="btn-icon" title="Delete" style="color: var(--error); background: #fef2f2;">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openOfferModal(isEdit = false) {
    offerModal.classList.add('active');
    offerModal.style.display = 'flex';
    if (!isEdit) {
        document.getElementById('offerModalTitle').textContent = 'Create Offer Letter';
        offerForm.reset();
        document.getElementById('editOfferId').value = '';
        document.getElementById('offerStatusGroup').style.display = 'none';
        document.getElementById('offerStipend').value = 'Unpaid';
    } else {
        document.getElementById('offerModalTitle').textContent = 'Edit Offer Letter';
        document.getElementById('offerStatusGroup').style.display = 'block';
    }
}

function closeOfferModal() {
    offerModal.classList.remove('active');
    setTimeout(() => {
        offerModal.style.display = 'none';
    }, 300);
}

document.getElementById('newOfferBtn').onclick = () => openOfferModal(false);
document.getElementById('closeOfferOfferModal').onclick = closeOfferModal;
document.getElementById('cancelOfferBtn').onclick = closeOfferModal;

window.onclick = (event) => {
    if (event.target === certModal) closeModal();
    if (event.target === offerModal) closeOfferModal();
};

window.openOfferEditModal = async (id) => {
    try {
        const res = await fetch(`${API_URL}/offers/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const offer = await res.json();
        
        document.getElementById('editOfferId').value = offer.offerId;
        document.getElementById('offerStudentName').value = offer.studentName;
        document.getElementById('offerStudentEmail').value = offer.studentEmail;
        document.getElementById('offerDomain').value = offer.internshipDomain;
        document.getElementById('offerDuration').value = offer.duration.split(' ')[0];
        document.getElementById('offerStartDate').value = offer.startDate.split('T')[0];
        document.getElementById('offerEndDate').value = offer.endDate.split('T')[0];
        document.getElementById('offerStipend').value = offer.stipend;
        document.getElementById('offerIssueDate').value = offer.issueDate ? offer.issueDate.split('T')[0] : '';
        document.getElementById('offerStatus').value = offer.status;
        
        openOfferModal(true);
    } catch (error) {
        alert('Error fetching offer letter details');
    }
};

offerForm.onsubmit = async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveOfferBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = 'Saving...';

    const id = document.getElementById('editOfferId').value;
    const durationValue = document.getElementById('offerDuration').value;
    const durationFormatted = durationValue == 1 ? "1 Month" : `${durationValue} Months`;

    const data = {
        studentName: document.getElementById('offerStudentName').value,
        studentEmail: document.getElementById('offerStudentEmail').value,
        internshipDomain: document.getElementById('offerDomain').value,
        duration: durationFormatted,
        startDate: document.getElementById('offerStartDate').value,
        endDate: document.getElementById('offerEndDate').value,
        stipend: document.getElementById('offerStipend').value,
        issueDate: document.getElementById('offerIssueDate').value || null,
        status: document.getElementById('offerStatus').value
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/offers/${id}` : `${API_URL}/offers`;
        
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeOfferModal();
            fetchOfferLetters();
        } else {
            const err = await res.json();
            alert(err.message || 'Operation failed');
        }
    } catch (error) {
        alert('Server connection failed');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
};

window.deleteOffer = async (id) => {
    if (confirm(`Are you sure you want to delete offer letter ${id}?`)) {
        try {
            const res = await fetch(`${API_URL}/offers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchOfferLetters();
            } else {
                alert('Failed to delete');
            }
        } catch (error) {
            alert('Server connection failed');
        }
    }
};

// Sync duration for offer letter
document.getElementById('offerStartDate').addEventListener('change', () => {
    const start = document.getElementById('offerStartDate').value;
    const end = document.getElementById('offerEndDate').value;
    if (start && end) {
        const d1 = new Date(start);
        const d2 = new Date(end);
        let months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        const dayDiff = d2.getDate() - d1.getDate();
        if (dayDiff >= 15) months++;
        if (months < 1) months = 1;
        document.getElementById('offerDuration').value = months;
    }
});

document.getElementById('offerEndDate').addEventListener('change', () => {
    const start = document.getElementById('offerStartDate').value;
    const end = document.getElementById('offerEndDate').value;
    if (start && end) {
        const d1 = new Date(start);
        const d2 = new Date(end);
        let months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        const dayDiff = d2.getDate() - d1.getDate();
        if (dayDiff >= 15) months++;
        if (months < 1) months = 1;
        document.getElementById('offerDuration').value = months;
    }
});
