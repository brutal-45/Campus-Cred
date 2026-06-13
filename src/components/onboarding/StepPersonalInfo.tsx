'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, ArrowRight, ArrowLeft, Search, CheckCircle2, X, GraduationCap } from 'lucide-react';
import Fuse from 'fuse.js';
import { INDIAN_CITIES, IndianCity } from '@/data/indianCities';
import { INDIAN_COLLEGES, IndianCollege } from '@/data/indianColleges';

interface CityState {
  city: string;
  state: string;
}

interface StepPersonalInfoProps {
  data: { college: string; city: string; state?: string };
  onUpdate: (data: { college: string; city: string; state?: string }) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Fuse.js instances
const cityFuse = new Fuse(INDIAN_CITIES, {
  keys: ['city', 'state'],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
});

const collegeFuse = new Fuse(INDIAN_COLLEGES, {
  keys: ['name', 'city', 'state'],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
});

export function StepPersonalInfo({
  data,
  onUpdate,
  onNext,
  onPrev,
}: StepPersonalInfoProps) {
  const [formData, setFormData] = useState({
    college: data.college || '',
    city: data.city || '',
    state: data.state || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // College autocomplete
  const [collegeQuery, setCollegeQuery] = useState(data.college || '');
  const [collegeSuggestions, setCollegeSuggestions] = useState<IndianCollege[]>([]);
  const [showCollegeSuggestions, setShowCollegeSuggestions] = useState(false);
  const [collegeVerified, setCollegeVerified] = useState(false);
  const [collegeSelectedIndex, setCollegeSelectedIndex] = useState(-1);
  const collegeInputRef = useRef<HTMLInputElement>(null);
  const collegeDropdownRef = useRef<HTMLDivElement>(null);

  // City autocomplete
  const [cityQuery, setCityQuery] = useState(data.city || '');
  const [citySuggestions, setCitySuggestions] = useState<IndianCity[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [citySelectedIndex, setCitySelectedIndex] = useState(-1);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(e.target as Node) &&
          collegeInputRef.current && !collegeInputRef.current.contains(e.target as Node)) {
        setShowCollegeSuggestions(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node) &&
          cityInputRef.current && !cityInputRef.current.contains(e.target as Node)) {
        setShowCitySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── College search ───
  const handleCollegeChange = useCallback((value: string) => {
    setCollegeQuery(value);
    setFormData(prev => ({ ...prev, college: value }));
    setCollegeVerified(false);
    if (errors.college) setErrors(prev => { const n = { ...prev }; delete n.college; return n; });

    if (value.length >= 2) {
      const results = collegeFuse.search(value, { limit: 8 });
      setCollegeSuggestions(results.map(r => r.item));
      setShowCollegeSuggestions(true);
      setCollegeSelectedIndex(-1);
    } else {
      setCollegeSuggestions([]);
      setShowCollegeSuggestions(false);
    }
  }, [errors.college]);

  const selectCollege = useCallback((college: IndianCollege) => {
    setCollegeQuery(college.name);
    setFormData(prev => ({ ...prev, college: college.name }));
    setCollegeVerified(true);
    setShowCollegeSuggestions(false);
    if (errors.college) setErrors(prev => { const n = { ...prev }; delete n.college; return n; });
  }, [errors.college]);

  const handleCollegeKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showCollegeSuggestions || collegeSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCollegeSelectedIndex(prev => Math.min(prev + 1, collegeSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCollegeSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && collegeSelectedIndex >= 0) {
      e.preventDefault();
      selectCollege(collegeSuggestions[collegeSelectedIndex]);
    } else if (e.key === 'Escape') {
      setShowCollegeSuggestions(false);
    }
  }, [showCollegeSuggestions, collegeSuggestions, collegeSelectedIndex, selectCollege]);

  // ─── City search with Fuse.js ───
  const handleCityChange = useCallback((value: string) => {
    setCityQuery(value);
    setFormData(prev => ({ ...prev, city: value, state: '' }));
    if (errors.city) setErrors(prev => { const n = { ...prev }; delete n.city; return n; });

    if (value.length >= 2) {
      const results = cityFuse.search(value, { limit: 10 });
      setCitySuggestions(results.map(r => r.item));
      setShowCitySuggestions(true);
      setCitySelectedIndex(-1);
    } else {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    }
  }, [errors.city]);

  const selectCity = useCallback((cityObj: IndianCity) => {
    setCityQuery(cityObj.city);
    setFormData(prev => ({ ...prev, city: cityObj.city, state: cityObj.state }));
    setShowCitySuggestions(false);
    if (errors.city) setErrors(prev => { const n = { ...prev }; delete n.city; return n; });
  }, [errors.city]);

  const handleCityKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showCitySuggestions || citySuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCitySelectedIndex(prev => Math.min(prev + 1, citySuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCitySelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && citySelectedIndex >= 0) {
      e.preventDefault();
      selectCity(citySuggestions[citySelectedIndex]);
    } else if (e.key === 'Escape') {
      setShowCitySuggestions(false);
    }
  }, [showCitySuggestions, citySuggestions, citySelectedIndex, selectCity]);

  // ─── Validate ───
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.college.trim()) {
      newErrors.college = 'College name is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    onUpdate(formData);
    onNext();
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const inputClass = (field: string) =>
    `pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-300/30 focus:border-electric/50 focus:ring-electric/20 h-11 transition-all duration-200 ${
      errors[field] ? 'border-red-400/60' : ''
    }`;

  return (
    <div
      className="animate-fade-in-up w-full max-w-lg mx-auto"
    >
      <div className="text-center mb-6">
        <div
          className="animate-fade-in w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30"
          style={{ animationDelay: '100ms' }}
        >
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h2
          className="animate-fade-in text-3xl font-bold text-white font-[family-name:var(--font-poppins)]"
          style={{ animationDelay: '150ms' }}
        >
          Academic Details
        </h2>
        <p
          className="animate-fade-in text-text-secondary mt-2 text-sm"
          style={{ animationDelay: '200ms' }}
        >
          Help us personalize your experience
        </p>
      </div>

      <div className="p-6 space-y-5 rounded-xl shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: '#E2E8F0', border: '1px solid' }}>
        {/* College Name with Autocomplete */}
        <div
          className="animate-fade-in-up space-y-2"
          style={{ animationDelay: '250ms' }}
        >
          <Label htmlFor="college" className="text-blue-100 text-sm font-medium">
            College / University Name <span className="text-red-400">*</span>
          </Label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/50" />
            <Input
              ref={collegeInputRef}
              id="college"
              placeholder="Start typing your college name..."
              value={collegeQuery}
              onChange={(e) => handleCollegeChange(e.target.value)}
              onKeyDown={handleCollegeKeyDown}
              onFocus={() => {
                if (collegeQuery.length >= 2 && collegeSuggestions.length > 0) setShowCollegeSuggestions(true);
              }}
              className={`${inputClass('college')} pr-10`}
            />
            {collegeVerified && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-400" />
            )}
            {!collegeVerified && collegeQuery.length >= 2 && (
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/30" />
            )}

            {/* College Suggestions Dropdown */}
            {showCollegeSuggestions && collegeSuggestions.length > 0 && (
              <div
                ref={collegeDropdownRef}
                className="absolute z-50 mt-1 w-full bg-[#111827] rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                style={{ borderColor: '#E2E8F0', border: '1px solid' }}
              >
                {collegeSuggestions.map((college, idx) => (
                  <button
                    key={`${college.name}-${idx}`}
                    onClick={() => selectCollege(college)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      idx === collegeSelectedIndex
                        ? 'bg-electric/10 text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    } ${idx !== collegeSuggestions.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <p className="font-medium truncate">{college.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {college.city}, {college.state}
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/30">
                        {college.type}
                      </span>
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
          {!collegeVerified && collegeQuery.length >= 2 && (
            <p className="text-[10px] text-blue-300/30">Can&apos;t find your college? Just type the name manually.</p>
          )}
          {errors.college && (
            <p className="text-red-400 text-xs mt-1">{errors.college}</p>
          )}
        </div>

        {/* City with Fuse.js Smart Search */}
        <div
          className="animate-fade-in-up space-y-2"
          style={{ animationDelay: '300ms' }}
        >
          <Label htmlFor="city" className="text-blue-100 text-sm font-medium">
            City <span className="text-red-400">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/50" />
            <Input
              ref={cityInputRef}
              id="city"
              placeholder="Start typing your city... (e.g., mumba)"
              value={cityQuery}
              onChange={(e) => handleCityChange(e.target.value)}
              onKeyDown={handleCityKeyDown}
              onFocus={() => {
                if (cityQuery.length >= 2 && citySuggestions.length > 0) setShowCitySuggestions(true);
              }}
              className={`${inputClass('city')} pr-10`}
            />
            {formData.state && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400/70 font-medium">
                {formData.state}
              </span>
            )}

            {/* City Suggestions Dropdown */}
            {showCitySuggestions && citySuggestions.length > 0 && (
              <div
                ref={cityDropdownRef}
                className="absolute z-50 mt-1 w-full bg-[#111827] rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                style={{ borderColor: '#E2E8F0', border: '1px solid' }}
              >
                {citySuggestions.map((cityObj, idx) => (
                  <button
                    key={`${cityObj.city}-${cityObj.state}`}
                    onClick={() => selectCity(cityObj)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      idx === citySelectedIndex
                        ? 'bg-electric/10 text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    } ${idx !== citySuggestions.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cityObj.city}</span>
                      <span className="text-xs text-white/40">{cityObj.state}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {cityQuery.length >= 2 && citySuggestions.length === 0 && !formData.state && (
            <p className="text-[10px] text-blue-300/30">No match found. You can enter your city manually.</p>
          )}
          {errors.city && (
            <p className="text-red-400 text-xs mt-1">{errors.city}</p>
          )}
        </div>

        {/* State (auto-filled) */}
        <div
          className="animate-fade-in-up space-y-2"
          style={{ animationDelay: '320ms' }}
        >
          <Label htmlFor="state" className="text-blue-100 text-sm font-medium">
            State <span className="text-blue-300/40 text-xs">(auto-filled from city)</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/50" />
            <Input
              id="state"
              placeholder="Auto-filled when city is selected"
              value={formData.state}
              onChange={(e) => updateField('state', e.target.value)}
              className={inputClass('state')}
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div
        className="animate-fade-in-up flex items-center justify-between mt-8"
        style={{ animationDelay: '400ms' }}
      >
        <Button
          type="button"
          variant="ghost"
          onClick={onPrev}
          className="text-blue-200/60 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="btn-press bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 h-11 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-300"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
