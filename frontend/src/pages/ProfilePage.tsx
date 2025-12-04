import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { User } from "../types";
import { FormField } from "../components/FormField";
import { Icon } from "../components/Icon";

async function fetchProfile() {
  const { data } = await api.get<User>("/users/me");
  return data;
}

export default function ProfilePage() {
  const { data: profile, isLoading, refetch } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setBio(profile.bio ?? "");
      setPhoneNumber(profile.phone_number ?? "");
      // Format date for input field (YYYY-MM-DD)
      if (profile.date_of_birth) {
        const date = new Date(profile.date_of_birth);
        setDateOfBirth(date.toISOString().split('T')[0]);
      } else {
        setDateOfBirth("");
      }
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: async () => {
      await api.put("/users/me", {
        full_name: fullName,
        bio,
        phone_number: phoneNumber || null,
        date_of_birth: dateOfBirth || null,
      });
    },
    onSuccess: async () => {
      setMessage("Profile updated successfully.");
      await refetch();
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-base-content">Profile</h1>
        <p className="text-sm text-base-content/70">Manage your personal information and preferences.</p>
      </div>

      <section className="rounded-2xl border border-base-300 bg-base-200 p-6 shadow-sm hover-lift">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <FormField label="Full name" id="full_name" value={fullName} onChange={setFullName} required />
          <div>
            <label htmlFor="email" className="flex flex-col gap-2 text-sm font-medium text-base-content">
              <span>Email</span>
              <input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="rounded-xl border-2 border-base-300 bg-base-300 px-4 py-3 text-base-content/70 shadow-sm cursor-not-allowed"
              />
              <p className="text-xs text-base-content/70">Email cannot be changed</p>
            </label>
          </div>
          <div>
            <label htmlFor="phone_number" className="flex flex-col gap-2 text-sm font-medium text-base-content">
              <span>Phone Number</span>
              <input
                id="phone_number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 234 567 8900"
                className="rounded-xl border-2 border-base-300 bg-base-100 px-4 py-3 text-base-content shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
              />
            </label>
          </div>
          <div>
            <label htmlFor="date_of_birth" className="flex flex-col gap-2 text-sm font-medium text-base-content">
              <span>Date of Birth</span>
              <input
                id="date_of_birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="rounded-xl border-2 border-base-300 bg-base-100 px-4 py-3 text-base-content shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
              />
            </label>
          </div>
          <div className="md:col-span-2">
            <FormField label="Bio" id="bio" value={bio} onChange={setBio} textarea />
          </div>

          <div className="md:col-span-2 flex items-center justify-between">
            <p className="text-sm text-base-content/70">Role: <span className="font-medium capitalize">{profile.role}</span></p>
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-content shadow-lg transition-all hover:scale-110 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Icon name="hourglass_top" className="mr-2 text-xl" /> Saving...
                </>
              ) : (
                <>
                  <Icon name="save" className="mr-2 text-xl" /> Save changes
                </>
              )}
            </button>
          </div>
          {message && (
            <div className="md:col-span-2 rounded-lg bg-success/10 border-2 border-success/30 p-3">
              <p className="text-sm font-semibold text-success">{message}</p>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
