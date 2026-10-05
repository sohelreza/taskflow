describe("Create issue flow", () => {
  beforeEach(() => {
    cy.loginAsTestUser();

    cy.intercept("POST", "/api/graphql", (req) => {
      const opName = req.body?.operationName;

      if (opName === "GetViewer") {
        req.reply({ fixture: "viewer.json" });
        return;
      }

      if (opName === "GetRepositories") {
        req.reply({ fixture: "repositories.json" });
        return;
      }

      if (opName === "GetRepository") {
        req.reply({ fixture: "repository-detail.json" });
        return;
      }

      if (opName === "GetIssues") {
        req.reply({ fixture: "issues-empty.json" });
        return;
      }

      if (opName === "CreateIssue") {
        // Delay the response by 2 seconds. If the UI shows the new issue
        // before this delay completes, that's optimistic UI working.
        req.reply({
          fixture: "create-issue-response.json",
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

  it("creates an issue with optimistic UI", () => {
    cy.visit("/repos/cypress-user/awesome-project");

    // Wait for the page to load (viewer + repository + issues)
    cy.contains("awesome-project").should("be.visible");

    // Open the dialog
    cy.contains("New Issue").click();

    // Fill in the form
    cy.get("input#title").type("Fix the bug we discussed");
    cy.get("textarea#body").type("More details about the bug");

    // Submit — the dialog should close instantly
    cy.contains("button", "Create issue").click();

    // Dialog is gone
    cy.contains("New issue", { timeout: 2000 }).should("not.exist");

    // The optimistic issue should appear IMMEDIATELY, before the 2s delay.
    // If this assertion passes in under 2s, optimistic UI is working.
    cy.contains("Fix the bug we discussed", { timeout: 1000 }).should(
      "be.visible",
    );

    // Now wait for the real mutation response to complete
    cy.wait("@graphql");

    // The issue should still be visible (real response replaces optimistic)
    cy.contains("Fix the bug we discussed").should("be.visible");
  });
});
