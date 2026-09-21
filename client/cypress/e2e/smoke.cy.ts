describe("TaskFlow smoke test", () => {
  it("loads the app and shows the sign-in prompt for unauthenticated users", () => {
    cy.visit("/");

    // The sign-in prompt should appear
    cy.contains("TaskFlow").should("be.visible");
    cy.contains("Sign in with GitHub").should("be.visible");
  });
});
