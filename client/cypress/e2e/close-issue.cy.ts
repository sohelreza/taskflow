describe("Close issue flow", () => {
  beforeEach(() => {
    cy.loginAsTestUser();
    cy.mockGraphQL({
      CloseIssue: { fixture: "close-issue-response.json", delay: 2000 },
    });
  });

  it("closes an issue with optimistic state transition", () => {
    cy.visit("/repos/cypress-user/awesome-project");

    cy.contains("li", "Fix the critical bug").as("issueItem");

    cy.get("@issueItem")
      .find("button")
      .contains("Close")
      .should("be.visible")
      .click();

    cy.get("@issueItem").find("button").should("have.length", 0);

    cy.wait("@graphql");

    cy.get("@issueItem").find("button").should("have.length", 0);
  });

  it("switches between Open, Closed, and All filter tabs", () => {
    cy.visit("/repos/cypress-user/awesome-project");

    cy.contains("Fix the critical bug").should("be.visible");

    cy.url().should("not.include", "state=");

    cy.contains("button", "Closed").click();
    cy.url().should("include", "state=closed");

    cy.contains("button", "All").click();
    cy.url().should("include", "state=all");

    cy.contains("button", "Open").click();
    cy.url().should("not.include", "state=");
  });
});
