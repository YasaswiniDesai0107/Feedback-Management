/**
 * src/hooks/useSearch.js
 * ----------------------
 * Custom React hook for the search/filter feature.
 *
 * Manages:
 *   - Search state (keyword, rating filter, program filter, pagination)
 *   - Debounced API calls so we don't send a request on every keystroke
 *   - Loading and error states for search results
 *   - Reset functionality
 *
 * Usage:
 *   const {
 *     results, total, loading, error,
 *     keyword, setKeyword,
 *     ratingFilter, setRatingFilter,
 *     programFilter, setProgramFilter,
 *     page, setPage, pageSize,
 *     hasActiveFilters, resetFilters,
 *   } = useSearch();
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { searchFeedbacks } from '../services/feedbackService';

const PAGE_SIZE = 12; // feedbacks per page

const useSearch = () => {
  // --- Filter state ---
  const [keyword,       setKeyword]       = useState('');
  const [ratingFilter,  setRatingFilter]  = useState('');     // '' = no filter, '1'–'5' = exact
  const [programFilter, setProgramFilter] = useState('');     // '' = no filter

  // --- Pagination state ---
  const [page, setPage] = useState(1);

  // --- Result state ---
  const [results,  setResults]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  // Ref to hold the debounce timer
  const debounceTimer = useRef(null);

  // --- Computed ---
  const hasActiveFilters = keyword !== '' || ratingFilter !== '' || programFilter !== '';
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const skip = (page - 1) * PAGE_SIZE;

  // --- Core fetch function ---
  const fetchResults = useCallback(async (kw, rating, program, currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchFeedbacks({
        keyword:      kw      || undefined,
        rating:       rating  ? parseInt(rating, 10) : undefined,
        program_name: program || undefined,
        skip:         (currentPage - 1) * PAGE_SIZE,
        limit:        PAGE_SIZE,
      });
      setResults(data.results);
      setTotal(data.total);
    } catch (err) {
      setError(err.userMessage || 'Search failed. Please try again.');
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Debounced effect: fires 400ms after any filter change ---
  useEffect(() => {
    // Cancel any pending timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      fetchResults(keyword, ratingFilter, programFilter, page);
    }, 400); // 400ms debounce — balanced UX vs. API load

    // Cleanup: cancel timer if component unmounts mid-debounce
    return () => clearTimeout(debounceTimer.current);
  }, [keyword, ratingFilter, programFilter, page, fetchResults]);

  // When filters change, reset to page 1
  const handleSetKeyword = (val) => { setKeyword(val); setPage(1); };
  const handleSetRating  = (val) => { setRatingFilter(val); setPage(1); };
  const handleSetProgram = (val) => { setProgramFilter(val); setPage(1); };

  // Reset all filters + results
  const resetFilters = () => {
    setKeyword('');
    setRatingFilter('');
    setProgramFilter('');
    setPage(1);
  };

  return {
    // Data
    results,
    total,
    totalPages,
    // State
    loading,
    error,
    // Filter values + setters
    keyword,       setKeyword: handleSetKeyword,
    ratingFilter,  setRatingFilter: handleSetRating,
    programFilter, setProgramFilter: handleSetProgram,
    // Pagination
    page, setPage, pageSize: PAGE_SIZE,
    // Helpers
    hasActiveFilters,
    resetFilters,
    refetch: () => fetchResults(keyword, ratingFilter, programFilter, page),
  };
};

export default useSearch;
