import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { FormField } from "../components/FormField";
import { useAuth } from "../hooks/useAuth";
import { Icon } from "../components/Icon";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          placeholder="you@example.com"
        />
        <FormField
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
        {error && (
          <div className="rounded-lg bg-error/10 border-2 border-error/30 p-3 animate-pulse-slow">
            <p className="text-sm font-semibold text-error">{error}</p>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-6 py-3 text-lg font-bold text-primary-content shadow-lg transition-all hover:scale-110 hover:shadow-xl hover:rotate-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:rotate-0"
        >
          {loading ? (
            <>
              <Icon name="hourglass_top" className="mr-2 text-xl" /> Signing in...
            </>
          ) : (
            <>
              <Icon name="login" className="mr-2 text-xl" /> Sign In
            </>
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-base-content">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-bold text-primary hover:text-primary-focus transition-all">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}
