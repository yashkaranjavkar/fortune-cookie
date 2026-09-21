import { useState, useRef, useEffect, useMemo } from 'react';
import './MultiSelect.css';
import { loadCustomOptions, saveCustomOption, mergeOptions, normalizeOption } from '../utils/customOptions';

// Multi-select dropdown with type-to-filter.
// allowAdd: typed text that isn't in the list can be added as a new option.
// storageKey: remembers added options so they appear in the list next time.
export default function MultiSelect({ options, selected, onToggle, placeholder, allowAdd, storageKey, related = [], onAddRelated }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [custom, setCustom] = useState(() => (allowAdd ? loadCustomOptions(storageKey) : []));
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allOptions = useMemo(() => mergeOptions(options, custom), [options, custom]);
  const selectedLower = selected.map(s => s.toLowerCase());

  const text = query.trim();
  const filtered = allOptions.filter(opt =>
    !selectedLower.includes(opt.toLowerCase()) &&
    opt.toLowerCase().includes(text.toLowerCase())
  );
  const exact = allOptions.find(o => o.toLowerCase() === text.toLowerCase());
  const alreadySelected = selectedLower.includes(text.toLowerCase());
  const canAdd = allowAdd && text && !exact && !alreadySelected;

  const pick = (option) => {
    onToggle(option);
    setQuery('');
  };

  const addNew = () => {
    const item = normalizeOption(text);
    if (storageKey) setCustom(saveCustomOption(storageKey, item));
    onToggle(item);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (exact && !alreadySelected) pick(exact);
      else if (canAdd) addNew();
      else if (filtered.length === 1) pick(filtered[0]);
    } else if (e.key === 'Backspace' && !query && selected.length > 0) {
      onToggle(selected[selected.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="multiselect-wrapper" ref={wrapperRef}>
      <div className="multiselect-input" onClick={() => setIsOpen(true)}>
        {selected.length > 0 && (
          <div className="chips">
            {selected.map(s => (
              <span key={s} className="chip" onClick={(e) => { e.stopPropagation(); onToggle(s); }}>
                {s} ✕
              </span>
            ))}
          </div>
        )}
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onKeyDown={handleKeyDown}
        />
        <span className="arrow">▼</span>
      </div>
      {isOpen && (
        <div className="multiselect-list">
          {related.length > 0 && onAddRelated && (
            <div className="multiselect-related">
              <span className="multiselect-related-label">Related to your picks</span>
              <div className="multiselect-related-chips">
                {related.map(r => (
                  <button key={r} type="button" className="related-chip" onClick={() => onAddRelated(r)}>
                    {r} +
                  </button>
                ))}
              </div>
            </div>
          )}
          {canAdd && (
            <div className="multiselect-item add-new" onClick={addNew}>
              + Add “{normalizeOption(text)}” as new
            </div>
          )}
          {filtered.map(opt => (
            <div key={opt} className="multiselect-item" onClick={() => pick(opt)}>
              {opt}
            </div>
          ))}
          {filtered.length === 0 && !canAdd && (
            <div className="multiselect-item empty">No more matches</div>
          )}
        </div>
      )}
    </div>
  );
}
