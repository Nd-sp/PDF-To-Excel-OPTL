const express = require('express');
const router = express.Router();
const searchService = require('../services/searchService');

/**
 * Advanced search with filters
 */
router.post('/', async (req, res) => {
  try {
    const filters = req.body.filters || {};
    const pagination = req.body.pagination || {};

    const results = await searchService.search(filters, pagination);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * Full-text search
 */
router.get('/fulltext', async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search term required' });
    }

    const results = await searchService.fullTextSearch(
      q,
      limit ? parseInt(limit) : 100
    );

    res.json(results);
  } catch (error) {
    console.error('Full-text search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * Search by circuit ID
 */
router.get('/circuit/:circuitId', async (req, res) => {
  try {
    const { circuitId } = req.params;
    const results = await searchService.searchByCircuit(circuitId);
    res.json(results);
  } catch (error) {
    console.error('Circuit search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * Search by relationship number
 */
router.get('/relationship/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const results = await searchService.searchByRelationship(number);
    res.json(results);
  } catch (error) {
    console.error('Relationship search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * Get filter options (for dropdowns)
 */
router.get('/filters', async (req, res) => {
  try {
    const options = await searchService.getFilterOptions();
    res.json(options);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    // Return empty filter options if error occurs
    return res.json({
      vendors: [],
      circuits: [],
      cities: [],
      states: []
    });
  }
});

/**
 * Get recent invoices
 */
router.get('/recent', async (req, res) => {
  try {
    const { limit } = req.query;
    const results = await searchService.getRecentInvoices(
      limit ? parseInt(limit) : 20
    );
    res.json(results);
  } catch (error) {
    console.error('Error fetching recent invoices:', error);
    // Return empty array if table doesn't exist
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_WRONG_ARGUMENTS') {
      return res.json([]);
    }
    res.status(500).json({ error: 'Failed to fetch recent invoices' });
  }
});

/**
 * Search by amount range
 */
router.get('/amount', async (req, res) => {
  try {
    const { min, max } = req.query;

    if (!min || !max) {
      return res.status(400).json({ error: 'Min and max amounts required' });
    }

    const results = await searchService.searchByAmountRange(
      parseFloat(min),
      parseFloat(max)
    );

    res.json(results);
  } catch (error) {
    console.error('Amount range search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * Search by due date range
 */
router.get('/due-date', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start and end dates required' });
    }

    const results = await searchService.searchByDueDateRange(startDate, endDate);
    res.json(results);
  } catch (error) {
    console.error('Due date search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
