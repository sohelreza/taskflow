Cypress.on("uncaught:exception", (err) => {
  console.warn("Uncaught app exception:", err.message);
  return false;
});

type GraphQLOverride = {
  fixture?: string;
  delay?: number;
  statusCode?: number;
  body?: unknown;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- required by Cypress typing conventions
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in as a test user via the server's test-login endpoint.
       * Requires the server to be running in TEST_MODE.
       */
      loginAsTestUser(login?: string): Chainable<void>;

      /**
       * Sets up standard GraphQL mocks for all common operations.
       * Pass `overrides` to replace specific operation responses — useful for
       * delayed mutations or error-path testing.
       *
       * @example
       * cy.mockGraphQL({
       *   CreateIssue: { fixture: 'create-issue-response.json', delay: 2000 }
       * })
       */
      mockGraphQL(overrides?: Record<string, GraphQLOverride>): Chainable<void>;
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
    expect(response.body.authenticated).to.equal(true);
  });
});

const DEFAULT_MOCKS: Record<string, GraphQLOverride> = {
  GetViewer: { fixture: "viewer.json" },
  GetRepositories: { fixture: "repositories.json" },
  GetRepository: { fixture: "repository-detail.json" },
  GetIssues: { fixture: "issues-with-open.json" },
  CreateIssue: { fixture: "create-issue-response.json" },
  CloseIssue: { fixture: "close-issue-response.json" },
};

Cypress.Commands.add("mockGraphQL", (overrides = {}) => {
  const mocks: Record<string, GraphQLOverride> = {
    ...DEFAULT_MOCKS,
    ...overrides,
  };

  cy.intercept("POST", "/api/graphql", (req) => {
    const opName = req.body?.operationName;
    const mock = mocks[opName];

    if (mock) {
      req.reply(mock);
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

export {};
