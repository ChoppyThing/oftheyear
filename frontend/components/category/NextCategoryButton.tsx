"use client";

import { useState, useEffect } from "react";
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
  const [isLast, setIsLast] = useState(false);
  const [isFirst, setIsFirst] = useState(false);
  const [isAllNominated, setIsAllNominated] = useState<boolean | null>(null);

  const fetchFiltered = async () => {
    const currentYear = year || new Date().getFullYear();
    const allCategories = (await apiClient.get<Category[]>(`/category?year=${currentYear}`)) || [];
    const filtered = phase ? allCategories.filter((c) => c.phase === phase) : allCategories;
    // Trier par sort ASC (valeur par défaut 0 si undefined), puis par name ASC en cas d'égalité
    return filtered.sort((a, b) => {
      const aSort = (a.sort ?? 0) as number;
      const bSort = (b.sort ?? 0) as number;
      if (aSort !== bSort) return aSort - bSort;
      return a.name.localeCompare(b.name);
    });
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
        // We're on the last category. If all filtered categories already have nominations,
        // redirect to the finished page. Otherwise keep the user here (button will be grayed).
        try {
          let allNominated = isAllNominated;
          if (allNominated === null) {
            const checks = await Promise.all(
              filtered.map(async (cat) => {
                // Prefer `_count.nominees` when present
                // @ts-ignore
                if (typeof cat._count?.nominees === 'number') return cat._count.nominees > 0;
                // Fallback: call finalists endpoint for the category
                try {
                  const res = await apiClient.get<any>(`/category-nominee/category/${cat.slug}/finalists?year=${year || new Date().getFullYear()}`);
                  return Array.isArray(res) ? res.length > 0 : !!res?.data?.length;
                } catch (e) {
                  return false;
                }
              })
            );
            allNominated = checks.every(Boolean);
          }

          if (allNominated) {
            router.push(`${targetPathPrefix}/finished`);
          } else {
            // not all nominated: do not navigate to a non-existing next category
            // we keep user on the same page; button will be disabled by state
          }
        } catch (e) {
          console.error('Error checking nominations for finish redirect', e);
          router.push(fallbackPath);
        }
      }
    } catch (err) {
      console.error("NextCategoryButton error:", err);
      router.push(fallbackPath);
    } finally {
      setLoadingNext(false);
    }
  };

  // compute isLast and whether all filtered categories have nominations
  useEffect(() => {
    let mounted = true;
    const compute = async () => {
      if (!currentSlug) {
        setIsLast(false);
        setIsAllNominated(null);
        return;
      }
      try {
        const filtered = await fetchFiltered();
        const idx = filtered.findIndex((c) => c.slug === currentSlug);
        const last = idx >= 0 && idx === filtered.length - 1;
        const first = idx === 0;
        if (!mounted) return;
        setIsLast(last);
        setIsFirst(first);

        if (last) {
          try {
            const checks = await Promise.all(
              filtered.map(async (cat) => {
                // @ts-ignore
                if (typeof cat._count?.nominees === 'number') return cat._count.nominees > 0;
                try {
                  const res = await apiClient.get<any>(`/category-nominee/category/${cat.slug}/finalists?year=${year || new Date().getFullYear()}`);
                  return Array.isArray(res) ? res.length > 0 : !!res?.data?.length;
                } catch (e) {
                  return false;
                }
              })
            );
            if (!mounted) return;
            setIsAllNominated(checks.every(Boolean));
          } catch (e) {
            console.error('Error computing nominations status', e);
            if (mounted) setIsAllNominated(false);
          }
        } else {
          setIsAllNominated(null);
        }
      } catch (e) {
        console.error('Error checking if last category', e);
        if (mounted) {
          setIsLast(false);
          setIsAllNominated(null);
        }
      }
    };

    compute();

    return () => {
      mounted = false;
    };
  }, [currentSlug, year, phase]);

  const handlePrev = async () => {
    setLoadingPrev(true);
    try {
        if (!currentSlug) {
          // nothing to do when no current slug
          return;
        }

        const filtered = await fetchFiltered();
        const idx = filtered.findIndex((c) => c.slug === currentSlug);

        if (idx > 0) {
          router.push(`${targetPathPrefix}/${filtered[idx - 1].slug}`);
        } else {
          // On first category: do not navigate to a fallback that may not exist (avoids 404)
          return;
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
          disabled={loadingPrev || isFirst}
          aria-label={prevAria}
          title={isFirst ? dict?.navigation?.firstCategoryTitle || 'Première catégorie' : undefined}
          className={`fixed left-4 bottom-6 z-40 rounded-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white flex items-center gap-2 shadow-lg transition ${loadingPrev ? 'opacity-60 cursor-wait' : ''} ${isFirst && !loadingPrev ? 'opacity-50 cursor-not-allowed hover:bg-white/10' : 'hover:bg-white/20'}`}
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
        disabled={loadingNext || (isLast && isAllNominated === false)}
        aria-label={nextAria}
        aria-disabled={isLast && isAllNominated === false}
        title={isLast && isAllNominated === false ? dict?.navigation?.lastCategoryTitle || 'Dernière catégorie (il reste des nominations à faire)' : undefined}
        className={`fixed right-4 bottom-6 z-40 rounded-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white flex items-center gap-2 shadow-lg transition
          ${loadingNext ? 'opacity-60 cursor-wait' : ''}
          ${(isLast && isAllNominated === false && !loadingNext) ? 'opacity-50 cursor-not-allowed hover:bg-white/10' : 'hover:bg-white/20'}`}
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
