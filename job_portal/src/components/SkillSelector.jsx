import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/SkillSelector.css";

/**
 * SkillSelector Component
 * A searchable dropdown for selecting skills from a predefined list
 * Similar to the skills section in PostJob page
 * 
 * @param {Array} availableSkills - Array of skill objects from backend [{id, name, category}, ...]
 * @param {Array} selectedSkills - Array of selected skill objects
 * @param {Function} onChange - Callback when skills selection changes
 * @param {boolean} required - Whether at least one skill is required
 */
export default function SkillSelector({ 
  availableSkills = [], 
  selectedSkills = [], 
  onChange,
  required = false 
}) {
  const [skillInput, setSkillInput] = useState("");
  const [skillOpen, setSkillOpen] = useState(false);
  const skillWrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (skillWrapRef.current && !skillWrapRef.current.contains(event.target)) {
        setSkillOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const skillSuggestions = useMemo(() => {
    const query = skillInput.trim().toLowerCase();
    return availableSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(query) &&
        !selectedSkills.some((selected) => selected.id === skill.id)
    );
  }, [availableSkills, selectedSkills, skillInput]);

  const handleSkillChange = (event) => {
    setSkillInput(event.target.value);
    setSkillOpen(true);
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const selectSkill = (skill) => {
    onChange([...selectedSkills, skill]);
    setSkillInput("");
    setSkillOpen(false);
  };

  const removeSkill = (skillToRemove) => {
    onChange(selectedSkills.filter((skill) => skill.id !== skillToRemove.id));
  };

  return (
    <div className="skill-selector" ref={skillWrapRef}>
      <div className="skill-selector__container">
        {selectedSkills.map((skill) => (
          <span key={skill.id} className="skill-selector__chip">
            {skill.name}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              aria-label={`Remove ${skill.name}`}
              className="skill-selector__remove"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={skillInput}
          onChange={handleSkillChange}
          onKeyDown={handleSkillKeyDown}
          onFocus={() => setSkillOpen(true)}
          placeholder={selectedSkills.length === 0 ? "Search and select skills..." : "Add more..."}
          className="skill-selector__input"
          autoComplete="off"
          required={required && selectedSkills.length === 0}
        />
      </div>
      
      {skillOpen && skillSuggestions.length > 0 && (
        <div className="skill-selector__dropdown" role="listbox">
          {skillSuggestions.map((skill) => (
            <button
              key={skill.id}
              type="button"
              className="skill-selector__option"
              onMouseDown={(event) => {
                event.preventDefault();
                selectSkill(skill);
              }}
            >
              <span className="skill-selector__option-name">{skill.name}</span>
              {skill.category && (
                <span className="skill-selector__option-category">{skill.category}</span>
              )}
            </button>
          ))}
        </div>
      )}
      
      {skillOpen && skillInput && skillSuggestions.length === 0 && (
        <div className="skill-selector__dropdown skill-selector__dropdown--empty">
          <div className="skill-selector__empty">
            No skills found matching "{skillInput}"
          </div>
        </div>
      )}
    </div>
  );
}
