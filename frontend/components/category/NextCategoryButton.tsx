"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Category } from "@/types/CategoryType";

interface Props {
  currentSlug?: string;
  year?: number;
  phase?: "nomination" | "vote" | "closed";
  targetPathPrefix?: string; // ex: '/user/category/nomination'
  fallbackPath?: string; // where to go if no next category
  dict?: any;
}

export default function NextCategoryButton({
  currentSlug,
  year,
  phase,
  targetPathPrefix = "/user/category/nomination",
  fallbackPath = "/user",
  dict,
}: Props) {
  const router = useRouter();
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingPrev, setLoadingPrev] = useState(false);

  const fetchFiltered = async () => {
    const currentYear = year || new Date().getFullYear();
    const allCategories = (await apiClient.get<Category[]>(`/category?year=${currentYear}`)) || [];
    return phase ? allCategories.filter((c) => c.phase === phase) : allCategories;
  };

  const handleNext = async () => {
    setLoadingNext(true);
    try {
      const filtered = await fetchFiltered();
      if (!filtered || filtered.length === 0) {
        router.push(fallbackPath);
        return;
      }

      if (!currentSlug) {
        router.push(`${targetPathPrefix}/${filtered[0].slug}`);
        return;
      }

      const idx = filtered.findIndex((c) => c.slug === currentSlug);
      const next = idx >= 0 ? filtered[idx + 1] : null;

      if (next) {
        router.push(`${targetPathPrefix}/${next.slug}`);
      } else {
        router.push(fallbackPath);
      }
    } catch (err) {
      console.error("NextCategoryButton error:", err);
      router.push(fallbackPath);
    } finally {
      setLoadingNext(false);
    }
  };

  const handlePrev = async () => {
    setLoadingPrev(true);
    try {
      if (!currentSlug) {
        router.push(fallbackPath);
        return;
      }

      const filtered = await fetchFiltered();
      const idx = filtered.findIndex((c) => c.slug === currentSlug);

      if (idx > 0) {
        router.push(`${targetPathPrefix}/${filtered[idx - 1].slug}`);
      } else {
        router.push(fallbackPath);
      }
    } catch (err) {
      console.error("NextCategoryButton(prev) error:", err);
      router.push(fallbackPath);
    } finally {
      setLoadingPrev(false);
    }
  };

  const nextLabel = dict?.navigation?.next || 'Suivante';
  const prevLabel = dict?.navigation?.prev || 'Précédente';
  const nextAria = dict?.navigation?.nextAria || 'Passer à la catégorie suivante';
  const prevAria = dict?.navigation?.prevAria || 'Revenir à la catégorie précédente';

  return (
    <>
      {/* Prev button - only useful when currentSlug is provided */}
      {currentSlug && (
        <button
          onClick={handlePrev}
          disabled={loadingPrev}
          aria-label={prevAria}
          className={`fixed left-4 bottom-6 z-40 rounded-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white flex items-center gap-2 shadow-lg hover:bg-white/20 transition ${loadingPrev ? 'opacity-60 cursor-wait' : ''}`}
        >
          <svg className="w-5 h-5 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
          <span className="text-sm">{prevLabel}</span>
        </button>
      )}

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={loadingNext}
        aria-label={nextAria}
        className={`fixed right-4 bottom-6 z-40 rounded-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white flex items-center gap-2 shadow-lg hover:bg-white/20 transition ${loadingNext ? 'opacity-60 cursor-wait' : ''}`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
        <span className="text-sm">{nextLabel}</span>
      </button>
    </>
  );
}
