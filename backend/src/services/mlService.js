// Wraps calls to the ML service and degrades gracefully on failures.
const axios = require("axios");

const ML_TIMEOUT = 10000; // 10 seconds

/**
 * Helper to delay execution (used for retry)
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Classifies complaint text via ML service with retry and timeout.
 * @param {string} title
 * @param {string} description
 * @returns {Promise<{category:string,urgency:string,confidence:number,urgency_score:number,processed_text:string}|null>}
 */
async function classifyComplaint(title, description) {
  const payload = { title, description };
  const url = `${process.env.ML_SERVICE_URL}/classify`;
  
  let attempts = 0;
  const maxAttempts = 2; // 1 initial + 1 retry

  while (attempts < maxAttempts) {
    attempts++;
    const startTime = Date.now();
    try {
      const { data } = await axios.post(url, payload, { timeout: ML_TIMEOUT });
      const duration = Date.now() - startTime;
      console.log(`[ML] classifyComplaint took ${duration}ms (Attempt ${attempts})`);
      
      return {
        category: data.category,
        urgency: data.urgency,
        confidence: data.confidence,
        urgency_score: data.urgency_score,
        processed_text: data.processed_text
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[ML] classify error on attempt ${attempts} after ${duration}ms: ${error.message}`);
      
      if (attempts < maxAttempts) {
        console.log(`[ML] Retrying classifyComplaint in 1 second...`);
        await delay(1000);
      }
    }
  }
  return null;
}

/**
 * Checks complaint duplication via ML service with retry and timeout.
 * @param {string} title
 * @param {string} description
 * @param {string} complaintId
 * @param {Array<{id:string, text:string}>} existingComplaints
 * @returns {Promise<{isDuplicate:boolean,similarComplaintId:string|null,similarityScore:number}>}
 */
async function checkDuplicate(title, description, complaintId, existingComplaints) {
  const payload = {
    title,
    description,
    complaint_id: complaintId,
    existing_complaints: existingComplaints || []
  };
  const url = `${process.env.ML_SERVICE_URL}/duplicate-check`;
  
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    const startTime = Date.now();
    try {
      const { data } = await axios.post(url, payload, { timeout: ML_TIMEOUT });
      const duration = Date.now() - startTime;
      console.log(`[ML] checkDuplicate took ${duration}ms (Attempt ${attempts})`);
      
      return {
        isDuplicate: Boolean(data.is_duplicate),
        similarComplaintId: data.similar_complaint_id ?? null,
        similarityScore: data.similarity_score ?? 0
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[ML] duplicate-check error on attempt ${attempts} after ${duration}ms: ${error.message}`);
      
      if (attempts < maxAttempts) {
        console.log(`[ML] Retrying checkDuplicate in 1 second...`);
        await delay(1000);
      }
    }
  }
  
  return {
    isDuplicate: false,
    similarComplaintId: null,
    similarityScore: 0
  };
}

module.exports = { classifyComplaint, checkDuplicate };
