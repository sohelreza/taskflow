import { Button } from "@/components/ui/button";

type SignInPromptProps = {
  errorMessage?: string;
};

export function SignInPrompt({ errorMessage }: Readonly<SignInPromptProps>) {
  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">TaskFlow</h1>
          <p className="text-gray-600">
            A GraphQL-powered task manager built on GitHub Issues.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 border border-red-200 bg-red-50 rounded text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div>
          <a href="/auth/login">
            <Button size="lg" className="w-full">
              Sign in with GitHub
            </Button>
          </a>
          <p className="mt-4 text-xs text-gray-500">
            We'll redirect you to GitHub to authorize this app.
          </p>
        </div>
      </div>
    </div>
  );
}
