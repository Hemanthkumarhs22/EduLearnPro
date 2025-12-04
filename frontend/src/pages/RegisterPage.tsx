import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { FormField } from "../components/FormField";
import { useAuth } from "../hooks/useAuth";
import { Icon } from "../components/Icon";

export default function RegisterPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ full_name: fullName, email, password, role });
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField label="Full name" id="full_name" value={fullName} onChange={setFullName} required />
        <FormField label="Email" id="email" type="email" value={email} onChange={setEmail} required />
        <FormField label="Password" id="password" type="password" value={password} onChange={setPassword} required />

        <label className="flex flex-col gap-2 text-sm font-medium text-base-content">
          <span>Role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as "student" | "instructor")}
            className="rounded-xl border-2 border-base-300 bg-base-100 px-4 py-3 text-base-content shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </label>

        {error && (
          <div className="rounded-lg bg-error/10 border-2 border-error/30 p-3">
            <p className="text-sm font-semibold text-error">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-6 py-3 text-lg font-bold text-primary-content shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            "Creating account..."
          ) : (
            <>
              <Icon name="rocket_launch" className="mr-2 text-xl" /> Sign Up
            </>
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-base-content">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-primary hover:text-primary-focus transition-all">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
