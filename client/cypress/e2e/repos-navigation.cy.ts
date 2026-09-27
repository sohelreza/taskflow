describe("Repository list and navigation", () => {
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

      req.reply({
        statusCode: 500,
        body: {
          errors: [{ message: `Unmocked operation: ${opName ?? "unknown"}` }],
        },
      });
    }).as("graphql");
  });

  it("shows the repositories list", () => {
    cy.visit("/repos");
    cy.wait("@graphql");

    cy.contains("awesome-project").should("be.visible");
    cy.contains("test-app").should("be.visible");
    cy.contains("An awesome project for testing").should("be.visible");
    cy.contains("A test application").should("be.visible");
    cy.contains("TypeScript").should("be.visible");
    cy.contains("JavaScript").should("be.visible");
  });

  it("navigates from home to repos and back", () => {
    cy.visit("/");

    cy.contains("Repositories").click();
    cy.url().should("include", "/repos");

    cy.wait("@graphql");
    cy.contains("awesome-project").should("be.visible");

    cy.contains("TaskFlow").click();
    cy.url().should("not.include", "/repos");
  });
});
