describe("Create issue flow", () => {
  beforeEach(() => {
    cy.loginAsTestUser();
    cy.mockGraphQL({
      GetIssues: { fixture: "issues-empty.json" },
      CreateIssue: { fixture: "create-issue-response.json", delay: 2000 },
    });
  });

  it("creates an issue with optimistic UI", () => {
    cy.visit("/repos/cypress-user/awesome-project");

    cy.contains("awesome-project").should("be.visible");

    cy.contains("New Issue").click();

    cy.get("input#title").type("Fix the bug we discussed");
    cy.get("textarea#body").type("More details about the bug");

    cy.contains("button", "Create issue").click();

    cy.contains("New issue", { timeout: 2000 }).should("not.exist");

    cy.contains("Fix the bug we discussed", { timeout: 1000 }).should(
      "be.visible",
    );

    cy.wait("@graphql");

    cy.contains("Fix the bug we discussed").should("be.visible");
  });
});
