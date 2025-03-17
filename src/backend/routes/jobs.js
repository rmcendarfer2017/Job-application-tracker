const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Get all jobs
router.get('/', (req, res) => {
  console.log('GET /api/jobs request received');
  db.all('SELECT * FROM jobs ORDER BY applicationDate DESC', (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log(`Returning ${rows.length} jobs`);
    res.json(rows);
  });
});

// Get job by id
router.get('/:id', (req, res) => {
  console.log(`GET /api/jobs/${req.params.id} request received`);
  const { id } = req.params;
  db.get('SELECT * FROM jobs WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      console.log(`Job ${id} not found`);
      return res.status(404).json({ error: 'Job not found' });
    }
    console.log(`Returning job ${id}`);
    res.json(row);
  });
});

// Create new job
router.post('/', (req, res) => {
  console.log('POST /api/jobs request received');
  const {
    company,
    role,
    jobDescription,
    applicationLink,
    salaryMin,
    salaryMax,
    applicationDate,
    status,
    notes
  } = req.body;

  if (!company || !role) {
    console.error('Invalid request: company and role are required');
    return res.status(400).json({ error: 'Company and role are required' });
  }

  const sql = `
    INSERT INTO jobs (company, role, jobDescription, applicationLink, salaryMin, salaryMax, applicationDate, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [company, role, jobDescription, applicationLink, salaryMin, salaryMax, applicationDate, status || 'Applied', notes],
    function(err) {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: err.message });
      }
      
      console.log(`Job created with id ${this.lastID}`);
      res.status(201).json({
        id: this.lastID,
        company,
        role,
        status: status || 'Applied'
      });
    }
  );
});

// Update job
router.put('/:id', (req, res) => {
  console.log(`PUT /api/jobs/${req.params.id} request received`);
  const { id } = req.params;
  const {
    company,
    role,
    jobDescription,
    applicationLink,
    salaryMin,
    salaryMax,
    applicationDate,
    status,
    notes
  } = req.body;

  if (!company || !role) {
    console.error('Invalid request: company and role are required');
    return res.status(400).json({ error: 'Company and role are required' });
  }

  const sql = `
    UPDATE jobs
    SET company = ?,
        role = ?,
        jobDescription = ?,
        applicationLink = ?,
        salaryMin = ?,
        salaryMax = ?,
        applicationDate = ?,
        status = ?,
        notes = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [company, role, jobDescription, applicationLink, salaryMin, salaryMax, applicationDate, status, notes, id],
    function(err) {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        console.log(`Job ${id} not found`);
        return res.status(404).json({ error: 'Job not found' });
      }
      
      console.log(`Job ${id} updated`);
      res.json({
        id,
        company,
        role,
        status
      });
    }
  );
});

// Delete job
router.delete('/:id', (req, res) => {
  console.log(`DELETE /api/jobs/${req.params.id} request received`);
  const { id } = req.params;
  
  db.run('DELETE FROM jobs WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      console.log(`Job ${id} not found`);
      return res.status(404).json({ error: 'Job not found' });
    }
    
    console.log(`Job ${id} deleted`);
    res.json({ message: 'Job deleted successfully' });
  });
});

// Get dashboard stats
router.get('/stats/dashboard', (req, res) => {
  console.log('GET /api/jobs/stats/dashboard request received');
  db.all(`
    SELECT 
      COUNT(*) as totalApplications,
      SUM(CASE WHEN status = 'Interviewing' THEN 1 ELSE 0 END) as interviewing,
      SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN status = 'Waiting' THEN 1 ELSE 0 END) as waiting,
      SUM(CASE WHEN status = 'Applied' THEN 1 ELSE 0 END) as applied
    FROM jobs
  `, (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    
    const stats = rows[0];
    const interviewRatio = stats.totalApplications > 0 
      ? (stats.interviewing / stats.totalApplications * 100).toFixed(2) 
      : 0;
    
    console.log(`Returning dashboard stats`);
    res.json({
      ...stats,
      interviewRatio
    });
  });
});

// Get contacts for a job
router.get('/:id/contacts', (req, res) => {
  console.log(`GET /api/jobs/${req.params.id}/contacts request received`);
  const { id } = req.params;
  
  db.all('SELECT * FROM contacts WHERE job_id = ?', [id], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log(`Returning ${rows.length} contacts for job ${id}`);
    res.json(rows);
  });
});

// Add contact for a job
router.post('/:id/contacts', (req, res) => {
  console.log(`POST /api/jobs/${req.params.id}/contacts request received`);
  const { id } = req.params;
  const { name, email, phone, linkedin, notes } = req.body;
  
  if (!name) {
    console.error('Invalid request: contact name is required');
    return res.status(400).json({ error: 'Contact name is required' });
  }
  
  const sql = `
    INSERT INTO contacts (job_id, name, email, phone, linkedin, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [id, name, email, phone, linkedin, notes], function(err) {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    
    console.log(`Contact added for job ${id}`);
    res.status(201).json({
      id: this.lastID,
      job_id: id,
      name,
      email,
      phone,
      linkedin,
      notes
    });
  });
});

module.exports = router;
