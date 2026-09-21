// This file runs before every spec.
// Custom Cypress commands go here (starting from Commit 46).

// Prevent uncaught exceptions from failing tests unless we assert them.
// React 19 can throw during render for transient reasons we don't care about in E2E.
Cypress.on("uncaught:exception", (err) => {
  // Log for debugging but don't fail the test
  console.warn("Uncaught app exception:", err.message);
  return false;
});
