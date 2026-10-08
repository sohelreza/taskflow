describe("Close issue flow", () => {
  beforeEach(() => {
    cy.loginAsTestUser();

    cy.intercept("POST", "/api/graphql", (req) => {
      const opName = req.body?.operationName;

      if (opName === "GetViewer") {
        req.reply({ fixture: "viewer.json" });
        return;
      }

      if (opName === "GetRepository") {
        req.reply({ fixture: "repository-detail.json" });
        return;
      }

      if (opName === "GetIssues") {
        req.reply({ fixture: "issues-with-open.json" });
        return;
      }

      if (opName === "CloseIssue") {
        req.reply({
          fixture: "close-issue-response.json",
          delay: 2000,
        });
        return;
      }

      req.reply({
        statusCode: 500,
        body: {
          errors: [{ message: `Unmocked operation: ${opName ?? "unknown"}` }],
        },
      });
    }).as("graphql");
  });

  it("closes an issue with optimistic state transition", () => {
    cy.visit("/repos/cypress-user/awesome-project");

    // Scope everything inside the issue's list item to avoid matching the filter tabs
    cy.contains("li", "Fix the critical bug").as("issueItem");

    // The Close button exists on the open issue
    cy.get("@issueItem")
      .find("button")
      .contains("Close")
      .should("be.visible")
      .click();

    // Optimistic transition: button is gone from the list item in under 1s
    cy.get("@issueItem").find("button").should("have.length", 0);

    // Wait for the real mutation
    cy.wait("@graphql");

    // Still closed after real response
    cy.get("@issueItem").find("button").should("have.length", 0);
  });

  it("switches between Open, Closed, and All filter tabs", () => {
    cy.visit("/repos/cypress-user/awesome-project");

    cy.contains("Fix the critical bug").should("be.visible");

    // Default is Open — no state param
    cy.url().should("not.include", "state=");

    // Click Closed tab
    cy.contains("button", "Closed").click();
    cy.url().should("include", "state=closed");

    // Click All tab
    cy.contains("button", "All").click();
    cy.url().should("include", "state=all");

    // Back to Open — URL cleans up
    cy.contains("button", "Open").click();
    cy.url().should("not.include", "state=");
  });
});
