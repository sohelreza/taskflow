describe("Authenticated smoke test", () => {
  beforeEach(() => {
    cy.loginAsTestUser();
  });

  it("shows the authenticated app instead of the sign-in prompt", () => {
    cy.visit("/");

    cy.contains("@cypress-user").should("be.visible");
    cy.contains("Sign in with GitHub").should("not.exist");
    cy.contains("Sign out").should("be.visible");
  });
});
