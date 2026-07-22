"""
Skill Matching Algorithm

Three-tier fallback strategy for matching resume skills to database skills:
1. Exact match (case-insensitive)
2. Alias lookup (using skill_aliases table)
3. Levenshtein distance (fuzzy matching)

PURE PYTHON IMPLEMENTATION - NO EXTERNAL LIBRARIES
"""

from typing import List, Dict, Optional


def normalize_skill_name(text: str) -> str:
    """
    Normalize skill name for matching.
    
    Removes: dots, commas, hyphens, underscores
    Converts: to lowercase, strips whitespace
    
    Args:
        text: Raw skill name
    
    Returns:
        Normalized lowercase string
    
    Example:
        "React.js" -> "reactjs"
        "Node-JS" -> "nodejs"
    """
    return (
        text.lower()
        .replace(".", "")
        .replace(",", "")
        .replace("-", "")
        .replace("_", "")
        .strip()
    )


def calculate_levenshtein_distance(str1: str, str2: str) -> int:
    """
    Calculate Levenshtein (edit) distance between two strings.
    
    PURE PYTHON IMPLEMENTATION using Dynamic Programming.
    
    Levenshtein distance is the minimum number of single-character edits
    (insertions, deletions, or substitutions) required to change one word
    into the other.
    
    Algorithm:
    - Uses a 2D matrix (dynamic programming table)
    - matrix[i][j] = min edits to transform str1[0:i] to str2[0:j]
    - Three operations: insert, delete, substitute
    
    Time Complexity: O(m * n) where m, n are string lengths
    Space Complexity: O(m * n)
    
    Args:
        str1: First string
        str2: Second string
    
    Returns:
        Edit distance (0 = identical)
    
    Examples:
        calculate_levenshtein_distance("python", "python") -> 0
        calculate_levenshtein_distance("react", "reactjs") -> 2
        calculate_levenshtein_distance("java", "javascript") -> 6
        calculate_levenshtein_distance("pythno", "python") -> 2
    
    Visual Example for "cat" vs "hat":
    
        ""  c  a  t
    ""   0  1  2  3
    h    1  1  2  3
    a    2  2  1  2
    t    3  3  2  1
    
    Result: distance = 1 (substitute 'c' with 'h')
    """
    # Handle empty strings
    if not str1:
        return len(str2)
    if not str2:
        return len(str1)
    
    # Handle identical strings (optimization)
    if str1 == str2:
        return 0
    
    # Get lengths
    m = len(str1)
    n = len(str2)
    
    # Create a 2D matrix (m+1) x (n+1)
    # matrix[i][j] = distance between str1[0:i] and str2[0:j]
    matrix = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Initialize first row (transforming empty string to str2)
    # Need j insertions to create str2[0:j]
    for j in range(n + 1):
        matrix[0][j] = j
    
    # Initialize first column (transforming str1 to empty string)
    # Need i deletions to remove str1[0:i]
    for i in range(m + 1):
        matrix[i][0] = i
    
    # Fill the matrix using dynamic programming
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            # If characters match, no operation needed
            if str1[i - 1] == str2[j - 1]:
                cost = 0
            else:
                cost = 1  # Substitution cost
            
            # Calculate minimum of three operations:
            matrix[i][j] = min(
                matrix[i - 1][j] + 1,      # Deletion from str1
                matrix[i][j - 1] + 1,      # Insertion to str1
                matrix[i - 1][j - 1] + cost  # Substitution (or no-op if match)
            )
    
    # Bottom-right cell contains the final distance
    return matrix[m][n]


def match_skill_levenshtein(
    skill_name: str,
    all_skills: List[Dict],
    max_distance: int = 2
) -> Optional[Dict]:
    """
    Match skill using Levenshtein distance (fuzzy matching).
    
    This is the final fallback when exact match and alias lookup fail.
    Finds the closest matching skill within the maximum edit distance.
    
    Args:
        skill_name: Normalized skill name to match
        all_skills: List of all available skills from database
                    Format: [{"id": 1, "name": "Python"}, ...]
        max_distance: Maximum edit distance to consider (default: 2)
    
    Returns:
        Dict with {id, name} if match found within threshold, None otherwise
    
    Example:
        skill_name: "reactjs"
        all_skills: [{"id": 1, "name": "React"}, {"id": 2, "name": "Redux"}]
        max_distance: 2
        
        Process:
        - "reactjs" normalized vs "react" normalized
        - calculate_levenshtein_distance("reactjs", "react") = 2
        - 2 <= max_distance (2) ✓
        
        Returns: {"id": 1, "name": "React"}
    
    Algorithm Steps:
    1. Normalize the input skill name
    2. For each skill in database:
       - Normalize database skill name
       - Calculate Levenshtein distance using pure Python algorithm
       - Track best match (lowest distance)
    3. If best match distance <= max_distance, return it
    4. Otherwise, return None (no close match found)
    """
    normalized_input = normalize_skill_name(skill_name)
    
    best_match = None
    best_distance = max_distance + 1  # Start with distance beyond threshold
    
    # Compare input skill with every skill in database
    for skill in all_skills:
        skill_normalized = normalize_skill_name(skill["name"])
        
        # Calculate edit distance using pure Python implementation
        dist = calculate_levenshtein_distance(normalized_input, skill_normalized)
        
        # Track the closest match
        if dist < best_distance:
            best_distance = dist
            best_match = skill
    
    # Only return if within acceptable threshold
    if best_match and best_distance <= max_distance:
        return {
            "id": best_match["id"],
            "name": best_match["name"]
        }
    
    return None


def filter_invalid_skills(skill_names: List[str]) -> List[str]:
    """
    Filter out invalid or useless skill names.
    
    Removes:
    - Empty strings
    - Very short strings (< 2 characters)
    - Common words that aren't skills
    
    Args:
        skill_names: List of raw skill names
    
    Returns:
        Filtered list of valid skill names
    """
    # Common words to exclude
    EXCLUDED_WORDS = {
        "etc", "etc.", "and", "or", "the", "a", "an",
        "&", "+", "-", ":", ";", ",", "."
    }
    
    filtered = []
    for skill in skill_names:
        if not skill or not skill.strip():
            continue
        
        normalized = normalize_skill_name(skill)
        
        # Skip if too short
        if len(normalized) < 2:
            continue
        
        # Skip if in excluded words
        if normalized in EXCLUDED_WORDS:
            continue
        
        filtered.append(skill)
    
    return filtered
