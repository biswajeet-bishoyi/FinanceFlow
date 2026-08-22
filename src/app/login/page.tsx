"use client";

import { login } from "@/app/actions/auth";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await login(formData);
      if (res && !res.success) {
        setError(res.error || "Login failed");
        setLoading(false);
      }
    } catch (e) {
      // Redirect throws an error we need to catch in Next.js
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-container-padding absolute inset-0 z-[100]">
      <style>{`
        header, nav { display: none !important; }
      `}</style>
      <div className="w-full max-w-sm bg-surface-container-lowest p-8 rounded-2xl shadow-[0px_8px_24px_rgba(15,23,42,0.08)] flex flex-col items-center border border-surface-container-high">
        
        <div className="w-16 h-16 rounded-full bg-primary-fixed bg-opacity-30 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-primary text-[32px]">lock</span>
        </div>
        
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2 font-bold text-center">FinanceFlow</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-8 text-center">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">EMAIL</label>
            <input 
              type="email" 
              name="email"
              className="bg-[#F1F5F9] border-0 text-body-lg text-primary rounded-xl focus:ring-2 focus:ring-primary block w-full p-3 transition-all"
              required 
            />
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1">PASSWORD</label>
            <input 
              type="password" 
              name="password"
              className="bg-[#F1F5F9] border-0 text-body-lg text-primary rounded-xl focus:ring-2 focus:ring-primary block w-full p-3 transition-all"
              required 
            />
          </div>
          
          {error && <p className="text-error font-body-sm text-body-sm mt-2 text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-primary text-on-primary font-headline-md text-headline-md rounded-xl py-4 shadow-[0px_8px_20px_rgba(15,23,42,0.08)] hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 font-body-sm text-body-sm text-on-surface-variant">
          Don't have an account? <Link href="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
