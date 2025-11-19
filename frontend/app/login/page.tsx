"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    console.log('🚀 Login attempt');
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();
    console.log('📡 Login response:', response.status, data);

    if (!response.ok) {
      throw new Error(data.message || "Erreur de connexion");
    }

    console.log('💾 Saving token');
    document.cookie = `authToken=${data.token}; path=/; max-age=86400; SameSite=Strict`;
    
    console.log('✅ Token saved, redirecting');
    
    // Rediriger
    //router.push("/");
    window.location.href = '/';
  } catch (err) {
    console.error('❌ Login error:', err);
    setError(err instanceof Error ? err.message : "Une erreur est survenue");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <>
      <AnimatedBackground />

      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-6xl">
          {/* Grid 2 columns */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Logo Section - Hidden on mobile */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <h1
                className="text-7xl font-bold mb-4"
                style={{
                  color: "#ffffff",
                  letterSpacing: ".15em",
                  textShadow: `
                    -1px -1px 1px #ffffff, 
                    0px 1px 0 #f5f5f5, 
                    0px 2px 0 #f0f0f0, 
                    0px 3px 0 #ebebeb, 
                    0px 4px 0 #e6e6e6, 
                    0px 5px 0 #e1e1e1, 
                    0px 6px 0 #dcdcdc, 
                    0px 7px 0 #d7d7d7, 
                    0px 8px 0 #d2d2d2, 
                    0px 9px 0 #cdcdcd, 
                    0px 10px 0 #c8c8c8, 
                    0px 11px 0 #c3c3c3, 
                    0px 12px 0 #bebebe, 
                    0px 13px 0 #b9b9b9, 
                    0px 14px 0 #b4b4b4, 
                    0px 15px 0 #afafaf,
                    0px 0px 10px rgba(255, 255, 255, 0.8),
                    0px 0px 20px rgba(0, 195, 216, 0.6),
                    0px 0px 30px rgba(55, 130, 165, 0.4),
                    2px 20px 40px rgba(0, 195, 216, 0.3)
                  `,
                }}
              >
                <Image
                  src="/logo/logo.png"
                  width="350"
                  height="350"
                  alt="Logo"
                />
              </h1>
              <p className="text-white/80 text-xl text-center max-w-md">
                Bienvenue aux game of the year
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-12 border border-white/20">
              {/* Mobile Logo */}
              <div className="md:hidden text-center mb-8">
                <h2
                  className="text-4xl font-bold"
                  style={{
                    color: "#ffffff",
                    letterSpacing: ".1em",
                    textShadow: `
                      0px 0px 10px rgba(255, 255, 255, 0.8),
                      0px 0px 20px rgba(0, 195, 216, 0.6)
                    `,
                  }}
                >
                  <Image
                    className="m-auto"
                    src="/logo/logo.png"
                    width="350"
                    height="350"
                    alt="Logo"
                  />
                </h2>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-white/90 font-semibold mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    placeholder="votre@email.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-white/90 font-semibold mb-2"
                  >
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-700 text-white font-bold py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 transition-all duration-200 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Connexion...
                    </span>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </form>

              {/* Create Account Link */}
              <div className="mt-8 text-center">
                <p className="text-white/70">
                  Pas encore de compte ?{" "}
                  <Link
                    href="/register"
                    className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors"
                  >
                    Créer un compte
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
