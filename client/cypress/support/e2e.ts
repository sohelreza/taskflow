Cypress.on("uncaught:exception", (err) => {
  console.warn("Uncaught app exception:", err.message);
  return false;
});

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in as a test user via the server's test-login endpoint.
       * Requires the server to be running in TEST_MODE.
       */
      loginAsTestUser(login?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("loginAsTestUser", (login = "cypress-user") => {
  cy.request({
    method: "POST",
    url: "/auth/test-login",
    body: { login },
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.authenticated).to.be.true;
  });
});

export {};
