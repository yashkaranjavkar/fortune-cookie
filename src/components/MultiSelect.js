import { useState, useRef, useEffect } from 'react';
import './MultiSelect.css';

export default function MultiSelect({ options, selected, onToggle, placeholder, allowAdd }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(opt =>
    !selected.includes(opt) &&
    opt.toLowerCase().includes(query.toLowerCase())
  );

  const addNew = () => {
    if (query.trim() && !selected.includes(query.trim())) {
      onToggle(query.trim());
      setQuery('');
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
        />
        <span className="arrow">▼</span>
      </div>
      {isOpen && (
        <div className="multiselect-list">
          {filtered.length > 0 ? (
            filtered.map(opt => (
              <div key={opt} className="multiselect-item" onClick={() => onToggle(opt)}>
                {opt}
              </div>
            ))
          ) : allowAdd ? (
            <div className="multiselect-item add-new" onClick={addNew}>
              Add “{query}” as new
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}