"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import Image from "next/image";
import { Locale } from "@/i18n.config";
import { z } from "zod";
import { useRecaptcha } from "@/hooks/useRecaptcha";

// Schéma de validation Zod
const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  nickname: z.string().min(3, "Le pseudo doit contenir au moins 3 caractères"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins 1 majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins 1 chiffre")
    .regex(
      /[^A-Za-z0-9]/,
      "Le mot de passe doit contenir au moins 1 caractère spécial"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: any;
}) {
  const { executeRecaptcha } = useRecaptcha();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    firstName: "",
    lastName: "",
    nickname: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");
    setErrors({});
    setIsLoading(true);

    try {
      // Validation avec Zod
      const validatedData = registerSchema.parse(formData);

      // Obtenir le token reCAPTCHA
      const recaptchaToken = await executeRecaptcha('register');
      if (!recaptchaToken) {
        throw new Error('Échec de la vérification reCAPTCHA. Veuillez réessayer.');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: validatedData.email,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            nickname: validatedData.nickname,
            password: validatedData.password,
            locale: locale,
            recaptchaToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || dict.register.error);
      }

      setSuccess(true);

      // Redirection après 2 secondes
      /*setTimeout(() => {
        window.location.href = `/${locale}/login`;
      }, 2000);*/
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Erreurs de validation Zod - CORRECTION ICI
        const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
        err.issues.forEach((issue) => {
          const field = issue.path[0] as keyof RegisterFormData;
          if (field) {
            fieldErrors[field] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        // Erreur API
        setApiError(err instanceof Error ? err.message : dict.register.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <AnimatedBackground />
        <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-12 border border-white/20 text-center max-w-md">
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-green-400 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {dict.register.successTitle}
            </h2>
            <p className="text-white/70 font-bold">{dict.register.successMessage}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatedBackground />

      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-6xl">
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
                {dict.register.welcome}
              </p>
            </div>

            {/* Register Form */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-12 border border-white/20 max-h-[90vh] overflow-y-auto">
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

              <h3 className="text-2xl font-bold text-white mb-6">
                {dict.register.title}
              </h3>

              {apiError && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-white/90 font-semibold mb-2"
                  >
                    {dict.register.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border ${
                      errors.email ? "border-red-500" : "border-white/30"
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all`}
                    placeholder={dict.register.emailPlaceholder}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-white/90 font-semibold mb-2"
                    >
                      {dict.register.firstName}
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border ${
                        errors.firstName ? "border-red-500" : "border-white/30"
                      } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all`}
                      placeholder={dict.register.firstNamePlaceholder}
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-white/90 font-semibold mb-2"
                    >
                      {dict.register.lastName}
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className={`w-full px-4 py-3 bg-white/10 border ${
                        errors.lastName ? "border-red-500" : "border-white/30"
                      } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all`}
                      placeholder={dict.register.lastNamePlaceholder}
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Nickname */}
                <div>
                  <label
                    htmlFor="nickname"
                    className="block text-white/90 font-semibold mb-2"
                  >
                    {dict.register.nickname}
                  </label>
                  <input
                    type="text"
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => handleChange("nickname", e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border ${
                      errors.nickname ? "border-red-500" : "border-white/30"
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all`}
                    placeholder={dict.register.nicknamePlaceholder}
                  />
                  {errors.nickname && (
                    <p className="text-red-400 text-sm mt-1">{errors.nickname}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-white/90 font-semibold mb-2"
                  >
                    {dict.register.password}
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border ${
                      errors.password ? "border-red-500" : "border-white/30"
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all`}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                  <p className="text-white/60 text-xs mt-1">
                    {dict.register.passwordHint}
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-white/90 font-semibold mb-2"
                  >
                    {dict.register.confirmPassword}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    className={`w-full px-4 py-3 bg-white/10 border ${
                      errors.confirmPassword ? "border-red-500" : "border-white/30"
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
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
                      {dict.register.creating}
                    </span>
                  ) : (
                    dict.register.submit
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-white/70">
                  {dict.register.hasAccount}{" "}
                  <Link
                    href={`/${locale}/login`}
                    className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors"
                  >
                    {dict.register.loginLink}
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
