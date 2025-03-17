// API URL
const API_URL = 'http://localhost:3000/api';

// Global Variables
let statusChart;
let currentJobId = null;
let jobs = [];
let isEditMode = false;
let editJobId = null;

// DOM Elements
let jobsList;
let addJobBtn;
let addJobModal;
let addJobForm;
let jobDetailsModal;
let jobDetailsContent;
let addContactModal;
let addContactForm;
let statusFilter;
let searchInput;

// Dashboard Elements
let totalApplicationsEl;
let interviewRatioEl;
let appliedCountEl;
let interviewingCountEl;
let statusChartEl;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize DOM Elements
  jobsList = document.getElementById('jobs-list');
  addJobBtn = document.getElementById('add-job-btn');
  addJobModal = document.getElementById('add-job-modal');
  addJobForm = document.getElementById('add-job-form');
  jobDetailsModal = document.getElementById('job-details-modal');
  jobDetailsContent = document.getElementById('job-details-content');
  addContactModal = document.getElementById('add-contact-modal');
  addContactForm = document.getElementById('add-contact-form');
  statusFilter = document.getElementById('status-filter');
  searchInput = document.getElementById('search-input');
  
  // Initialize Dashboard Elements
  totalApplicationsEl = document.getElementById('total-applications');
  interviewRatioEl = document.getElementById('interview-ratio');
  appliedCountEl = document.getElementById('applied-count');
  interviewingCountEl = document.getElementById('interviewing-count');
  statusChartEl = document.getElementById('status-chart');
  
  // Load dashboard data
  loadDashboardData();
  
  // Load jobs
  loadJobs();
  
  // Event listeners
  addJobBtn.addEventListener('click', openAddJobModal);
  
  // Close modals when clicking on X
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      addJobModal.style.display = 'none';
      jobDetailsModal.style.display = 'none';
      addContactModal.style.display = 'none';
    });
  });
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === addJobModal) addJobModal.style.display = 'none';
    if (e.target === jobDetailsModal) jobDetailsModal.style.display = 'none';
    if (e.target === addContactModal) addContactModal.style.display = 'none';
  });
  
  // Form submissions
  addJobForm.addEventListener('submit', handleJobFormSubmit);
  if (addContactForm) {
    addContactForm.addEventListener('submit', handleAddContact);
  }
  
  // Cancel buttons
  const cancelBtn = document.querySelector('.cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      addJobModal.style.display = 'none';
    });
  }
  
  const cancelContactBtn = document.querySelector('.cancel-contact-btn');
  if (cancelContactBtn) {
    cancelContactBtn.addEventListener('click', () => {
      addContactModal.style.display = 'none';
    });
  }
  
  // Filters
  statusFilter.addEventListener('change', filterJobs);
  searchInput.addEventListener('input', filterJobs);
});

// Load dashboard data
async function loadDashboardData() {
  try {
    const response = await fetch(`${API_URL}/jobs/stats/dashboard`);
    const stats = await response.json();
    
    // Update dashboard stats
    totalApplicationsEl.textContent = stats.totalApplications || 0;
    interviewRatioEl.textContent = `${stats.interviewRatio || 0}%`;
    appliedCountEl.textContent = stats.applied || 0;
    interviewingCountEl.textContent = stats.interviewing || 0;
    
    // Create chart if it doesn't exist
    if (!statusChart && stats.totalApplications > 0) {
      const ctx = statusChartEl.getContext('2d');
      statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Applied', 'Waiting', 'Interviewing', 'Rejected'],
          datasets: [{
            data: [
              stats.applied || 0,
              stats.waiting || 0,
              stats.interviewing || 0,
              stats.rejected || 0
            ],
            backgroundColor: [
              '#4A6FA5',
              '#FFB347',
              '#4CAF50',
              '#F44336'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            position: 'bottom'
          }
        }
      });
    } else if (statusChart) {
      // Update existing chart
      statusChart.data.datasets[0].data = [
        stats.applied || 0,
        stats.waiting || 0,
        stats.interviewing || 0,
        stats.rejected || 0
      ];
      statusChart.update();
    }
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// Load jobs
async function loadJobs() {
  try {
    console.log('Fetching jobs from:', `${API_URL}/jobs`);
    const response = await fetch(`${API_URL}/jobs`);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    jobs = await response.json();
    console.log('Jobs loaded:', jobs);
    renderJobs(jobs);
  } catch (error) {
    console.error('Error loading jobs:', error);
    jobsList.innerHTML = '<p class="error-message">Failed to load jobs. Please check the console for errors.</p>';
  }
}

// Render jobs
function renderJobs(jobsToRender) {
  jobsList.innerHTML = '';
  
  if (jobsToRender.length === 0) {
    jobsList.innerHTML = '<p class="no-jobs">No job applications found. Add your first job application!</p>';
    return;
  }
  
  jobsToRender.forEach(job => {
    const jobCard = document.createElement('div');
    jobCard.className = 'job-card';
    jobCard.dataset.id = job.id;
    
    const statusClass = `status-${job.status.toLowerCase()}`;
    
    jobCard.innerHTML = `
      <div class="job-card-header">
        <h3>${job.role}</h3>
        <span class="job-status ${statusClass}">${job.status}</span>
      </div>
      <div class="job-card-content">
        <p>${job.company}</p>
        <p class="job-date">Applied: ${formatDate(job.applicationDate)}</p>
      </div>
    `;
    
    jobCard.addEventListener('click', () => openJobDetails(job.id));
    
    jobsList.appendChild(jobCard);
  });
}

// Filter jobs
function filterJobs() {
  const statusValue = statusFilter.value;
  const searchValue = searchInput.value.toLowerCase();
  
  let filteredJobs = jobs;
  
  // Filter by status
  if (statusValue !== 'all') {
    filteredJobs = filteredJobs.filter(job => job.status === statusValue);
  }
  
  // Filter by search
  if (searchValue) {
    filteredJobs = filteredJobs.filter(job => 
      job.company.toLowerCase().includes(searchValue) || 
      job.role.toLowerCase().includes(searchValue)
    );
  }
  
  renderJobs(filteredJobs);
}

// Open add job modal
function openAddJobModal() {
  // Reset form
  addJobForm.reset();
  
  // Set default application date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('applicationDate').value = today;
  
  // Set mode to add
  isEditMode = false;
  editJobId = null;
  
  // Update modal title
  document.querySelector('#add-job-modal h2').textContent = 'Add New Job Application';
  document.querySelector('#add-job-form button[type="submit"]').textContent = 'Save Job';
  
  // Show modal
  addJobModal.style.display = 'block';
}

// Handle job form submission (for both add and edit)
async function handleJobFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(addJobForm);
  const jobData = {
    company: formData.get('company'),
    role: formData.get('role'),
    applicationLink: formData.get('applicationLink'),
    applicationDate: formData.get('applicationDate'),
    status: formData.get('status'),
    salaryMin: formData.get('salaryMin') ? parseInt(formData.get('salaryMin')) : null,
    salaryMax: formData.get('salaryMax') ? parseInt(formData.get('salaryMax')) : null,
    jobDescription: formData.get('jobDescription'),
    notes: formData.get('notes')
  };
  
  try {
    let response;
    let jobId;
    
    if (isEditMode) {
      // Update existing job
      response = await fetch(`${API_URL}/jobs/${editJobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update job`);
      }
      
      jobId = editJobId;
    } else {
      // Add new job
      response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add job`);
      }
      
      const result = await response.json();
      jobId = result.id;
    }
    
    // Close modal
    addJobModal.style.display = 'none';
    
    // Reload jobs and dashboard
    loadJobs();
    loadDashboardData();
    
    // If we were in edit mode and had the job details open, refresh them
    if (isEditMode && currentJobId === editJobId) {
      openJobDetails(editJobId);
    }
    
  } catch (error) {
    console.error(`Error ${isEditMode ? 'updating' : 'adding'} job:`, error);
    alert(`Failed to ${isEditMode ? 'update' : 'add'} job. Please try again.`);
  }
}

// Handle adding a contact from the add contact modal
async function handleAddContact(e) {
  e.preventDefault();
  
  const formData = new FormData(addContactForm);
  const jobId = document.getElementById('contact-job-id').value;
  
  const contactData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    linkedin: formData.get('linkedin'),
    notes: formData.get('notes')
  };
  
  try {
    const response = await fetch(`${API_URL}/jobs/${jobId}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to add contact');
    }
    
    // Close contact modal
    addContactModal.style.display = 'none';
    
    // Refresh job details
    openJobDetails(jobId);
    
  } catch (error) {
    console.error('Error adding contact:', error);
    alert('Failed to add contact. Please try again.');
  }
}

// Open job details
async function openJobDetails(jobId) {
  try {
    currentJobId = jobId;
    
    const response = await fetch(`${API_URL}/jobs/${jobId}`);
    const job = await response.json();
    
    // Get contacts for this job
    const contactsResponse = await fetch(`${API_URL}/jobs/${jobId}/contacts`);
    const contacts = await contactsResponse.json();
    
    // Format job details
    const jobDetails = `
      <div class="job-details-header">
        <h2>${job.role} at ${job.company}</h2>
        <div class="job-status status-${job.status.toLowerCase()}">${job.status}</div>
      </div>
      
      <div class="job-details-content">
        <div class="job-details-section">
          <h3>Application Details</h3>
          <p><strong>Applied:</strong> ${formatDate(job.applicationDate)}</p>
          ${job.applicationLink ? `<p><strong>Link:</strong> <a href="${job.applicationLink}" target="_blank">${job.applicationLink}</a></p>` : ''}
          ${job.salaryMin || job.salaryMax ? `<p><strong>Salary Range:</strong> ${formatSalary(job.salaryMin, job.salaryMax)}</p>` : ''}
        </div>
        
        ${job.jobDescription ? `
          <div class="job-details-section">
            <h3>Job Description</h3>
            <p>${job.jobDescription.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ''}
        
        ${job.notes ? `
          <div class="job-details-section">
            <h3>Notes</h3>
            <p>${job.notes.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ''}
        
        <div class="job-details-section">
          <h3>Networking Contacts</h3>
          ${contacts.length > 0 ? `
            <div class="contacts-list">
              ${contacts.map(contact => `
                <div class="contact-card">
                  <h4>${contact.name}</h4>
                  ${contact.email ? `<p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>` : ''}
                  ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
                  ${contact.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${contact.linkedin}" target="_blank">${contact.linkedin}</a></p>` : ''}
                  ${contact.notes ? `<p><strong>Notes:</strong> ${contact.notes}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : '<p>No contacts added yet.</p>'}
          <button class="primary-btn add-contact-btn" onclick="openAddContactModal(${jobId})">Add Contact</button>
        </div>
      </div>
      
      <div class="job-details-actions">
        <button class="secondary-btn edit-btn" onclick="openEditJobModal(${jobId})">Edit</button>
        <button class="danger-btn delete-btn" onclick="confirmDeleteJob(${jobId})">Delete</button>
      </div>
    `;
    
    jobDetailsContent.innerHTML = jobDetails;
    jobDetailsModal.style.display = 'block';
    
  } catch (error) {
    console.error('Error loading job details:', error);
    alert('Failed to load job details. Please try again.');
  }
}

// Open add contact modal
function openAddContactModal(jobId) {
  // Reset form
  addContactForm.reset();
  
  // Set job ID
  document.getElementById('contact-job-id').value = jobId;
  
  // Show modal
  addContactModal.style.display = 'block';
}

// Open edit job modal
async function openEditJobModal(jobId) {
  try {
    // Close the job details modal first
    jobDetailsModal.style.display = 'none';
    
    // Fetch the job data
    const response = await fetch(`${API_URL}/jobs/${jobId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch job data');
    }
    
    const job = await response.json();
    
    // Set form fields with job data
    document.getElementById('company').value = job.company || '';
    document.getElementById('role').value = job.role || '';
    document.getElementById('applicationLink').value = job.applicationLink || '';
    document.getElementById('applicationDate').value = job.applicationDate ? job.applicationDate.split('T')[0] : '';
    document.getElementById('status').value = job.status || 'Applied';
    document.getElementById('salaryMin').value = job.salaryMin || '';
    document.getElementById('salaryMax').value = job.salaryMax || '';
    document.getElementById('jobDescription').value = job.jobDescription || '';
    document.getElementById('notes').value = job.notes || '';
    
    // Set mode to edit
    isEditMode = true;
    editJobId = jobId;
    
    // Update modal title and button text
    document.querySelector('#add-job-modal h2').textContent = 'Edit Job Application';
    document.querySelector('#add-job-form button[type="submit"]').textContent = 'Update Job';
    
    // Show modal
    addJobModal.style.display = 'block';
    
  } catch (error) {
    console.error('Error opening edit modal:', error);
    alert('Failed to load job data for editing. Please try again.');
  }
}

// Confirm delete job
function confirmDeleteJob(jobId) {
  if (confirm('Are you sure you want to delete this job application? This action cannot be undone.')) {
    deleteJob(jobId);
  }
}

// Delete job
async function deleteJob(jobId) {
  try {
    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete job');
    }
    
    // Close modal
    jobDetailsModal.style.display = 'none';
    
    // Reload jobs and dashboard
    loadJobs();
    loadDashboardData();
    
  } catch (error) {
    console.error('Error deleting job:', error);
    alert('Failed to delete job. Please try again.');
  }
}

// Format date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format salary
function formatSalary(min, max) {
  if (!min && !max) return 'Not specified';
  
  const formatNumber = num => num ? `$${num.toLocaleString()}` : '';
  
  if (min && max) {
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  } else if (min) {
    return `${formatNumber(min)}+`;
  } else {
    return `Up to ${formatNumber(max)}`;
  }
}
