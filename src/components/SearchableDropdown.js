import { useState, useRef, useEffect, useMemo } from 'react';
import './SearchableDropdown.css';
import { loadCustomOptions, saveCustomOption, mergeOptions, normalizeOption } from '../utils/customOptions';
import { playSound } from '../sounds';

// Single-select dropdown with type-to-filter.
// allowAdd: typed text that isn't in the list can be added as a new option.
// storageKey: remembers added options so they appear in the list next time.
export default function SearchableDropdown({ options, value = '', placeholder, onSelect, allowAdd, storageKey }) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [custom, setCustom] = useState(() => (allowAdd ? loadCustomOptions(storageKey) : []));
  const wrapperRef = useRef(null);

  const allOptions = useMemo(() => mergeOptions(options, custom), [options, custom]);

  const text = query.trim();
  const exact = allOptions.find(o => o.toLowerCase() === text.toLowerCase());
  // Right after choosing an option, show the whole list instead of just that option
  const filtered = query === value
    ? allOptions
    : allOptions.filter(o => o.toLowerCase().includes(text.toLowerCase()));
  const canAdd = allowAdd && text && !exact;

  const choose = (option) => {
    onSelect(option);
    setQuery(option);
    setIsOpen(false);
    playSound('select');
  };

  const addNew = () => {
    const item = normalizeOption(text);
    if (storageKey) setCustom(saveCustomOption(storageKey, item));
    onSelect(item, true);
    setQuery(item);
    setIsOpen(false);
    playSound('select');
  };

  // Clicking away commits an exact match; otherwise the field reverts to the chosen value
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        if (exact && exact !== value) {
          onSelect(exact);
          setQuery(exact);
        } else if (query !== value && !canAdd) {
          setQuery(value);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });

  const handleChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
    if (value) onSelect(''); // editing invalidates the previous choice
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (exact) choose(exact);
      else if (filtered.length === 1 && !canAdd) choose(filtered[0]);
      else if (canAdd) addNew();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="dropdown-wrapper" ref={wrapperRef}>
      <div className="dropdown-input" onClick={() => setIsOpen(true)}>
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <span className="arrow">▼</span>
      </div>
      {isOpen && (
        <div className="dropdown-list">
          {canAdd && (
            <div className="dropdown-item add-new" onClick={addNew}>
              + Add “{normalizeOption(text)}” as new
            </div>
          )}
          {filtered.map(opt => (
            <div
              key={opt}
              className={`dropdown-item${opt === value ? ' active' : ''}`}
              onClick={() => choose(opt)}
            >
              {opt}
            </div>
          ))}
          {filtered.length === 0 && !canAdd && (
            <div className="dropdown-item empty">No matches</div>
          )}
        </div>
      )}
    </div>
  );
}
