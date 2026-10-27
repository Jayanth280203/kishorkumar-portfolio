/**
 * ==============================================================================
 * VERCEL SERVERLESS FUNCTION ENTRYPOINT
 * Exports the Express app instance for Vercel Serverless Function execution
 * ==============================================================================
 */

const { app } = require('../server.js');

module.exports = app;
