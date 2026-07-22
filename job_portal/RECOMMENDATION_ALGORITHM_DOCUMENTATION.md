# Job Recommendation Algorithm Documentation

**Project:** Job Portal System  
**Module:** Recommendation Engine  
**Language:** Python (Pure - No External ML Libraries)  
**Complexity:** Simple & Explainable (Suitable for Final Year Project)

---

## Table of Contents

1. [Overview](#overview)
2. [Algorithm Components](#algorithm-components)
3. [Detailed Explanation](#detailed-explanation)
4. [Mathematical Formulas](#mathematical-formulas)
5. [Code Examples](#code-examples)
6. [Viva Questions & Answers](#viva-questions--answers)
7. [Future Improvements](#future-improvements)

---

## Overview

The Job Recommendation System matches users with suitable job postings based on their profile, skills, experience, and preferences. The algorithm uses a **weighted scoring system** combining four key factors.

### Key Features
- ✅ **Pure Python** - No external ML libraries (sklearn, numpy, etc.)
- ✅ **Simple & Explainable** - Easy to understand and defend in viva
- ✅ **Fast Performance** - Suitable for real-time recommendations
- ✅ **Transparent Scoring** - Provides score breakdown for each factor

### Scoring Factors & Weights

| Factor | Weight | Method |
|--------|--------|--------|
| **Skills Match** | 60% | Cosine Similarity on Skill IDs |
| **Position Match** | 20% | Exact Text Comparison |
| **Experience Match** | 15% | Ratio Comparison |
| **Job Type Match** | 5% | Exact Text Comparison |

**Final Score Range:** 0-100 (percentage)

---

## Algorithm Components

### 1. Skills Match (60% Weight)

**Purpose:** Measure how well user's skills align with job requirements

**Method:** Cosine Similarity

**Input:**
- User Skill IDs: `[1, 2, 3, 4]` (e.g., Python, React, SQL, Git)
- Job Skill IDs: `[2, 3, 5]` (e.g., React, SQL, Docker)

**Formula:**
```
cosine_similarity = dot_product / (norm_user × norm_job)

where:
  dot_product = number of common skills
  norm_user = √(total user skills)
  norm_job = √(total job skills)
```

**Example Calculation:**
```
User Skills:  [1, 2, 3, 4]  → 4 total skills
Job Skills:   [2, 3, 5]     → 3 total skills
Common:       [2, 3]        → 2 matching skills

dot_product = 2
norm_user = √4 = 2.0
norm_job = √3 = 1.732

similarity = 2 / (2.0 × 1.732) = 2 / 3.464 = 0.577

Score: 57.7%
```

**Why Cosine Similarity?**
- Measures angle between vectors, not magnitude
- Suitable for sparse data (skill sets)
- Gives fair results regardless of total skill count
- Simple to calculate with basic math

---

### 2. Position Match (20% Weight)

**Purpose:** Check if user's desired position matches job title

**Method:** Case-insensitive exact string comparison

**Formula:**
```python
if user_desired_position.lower() == job_title.lower():
    score = 1.0  # 100% match
else:
    score = 0.0  # No match
```

**Examples:**

| User Desired Position | Job Title | Score |
|----------------------|-----------|-------|
| "Python Developer" | "python developer" | 1.0 ✓ |
| "Frontend Developer" | "Frontend Developer" | 1.0 ✓ |
| "Java Developer" | "Python Developer" | 0.0 ✗ |

**Rationale:**
- Job titles are specific and short
- Either you want that position or you don't
- Simple exact matching is appropriate

---

### 3. Experience Match (15% Weight)

**Purpose:** Evaluate if user meets experience requirements

**Method:** Ratio-based scoring with special cases

**Logic:**
```python
if required_experience == 0:
    score = 1.0                    # No experience required
elif user_experience >= required_experience:
    score = 1.0                    # User qualifies
else:
    score = user_experience / required_experience  # Partial credit
```

**Examples:**

| User Experience | Required Experience | Calculation | Score |
|----------------|---------------------|-------------|-------|
| 5 years | 3 years | 5 ≥ 3 | 1.0 (100%) ✓ |
| 3 years | 5 years | 3 / 5 | 0.6 (60%) ◐ |
| 2 years | 0 years | 0 required | 1.0 (100%) ✓ |
| 1 year | 4 years | 1 / 4 | 0.25 (25%) ◔ |

**Rationale:**
- Rewards users who meet/exceed requirements
- Gives partial credit for less experience
- Fair to entry-level candidates (0 exp required = everyone qualifies)
- Encourages users to apply even with less experience

---

### 4. Job Type Match (5% Weight)

**Purpose:** Check if employment type matches user preference

**Method:** Case-insensitive exact string comparison

**Formula:**
```python
if user_preferred_type.lower() == job_employment_type.lower():
    score = 1.0  # Match
else:
    score = 0.0  # No match
```

**Examples:**

| User Preferred Type | Job Type | Score |
|--------------------|----------|-------|
| "Full-time" | "full-time" | 1.0 ✓ |
| "Remote" | "Remote" | 1.0 ✓ |
| "Part-time" | "Full-time" | 0.0 ✗ |

**Rationale:**
- Lowest weight (5%) because it's least critical
- Users might be flexible about job type
- Binary decision: matches or doesn't

---

## Mathematical Formulas

### Cosine Similarity (Skills)

**Vector Representation:**
```
User Skills Vector:  U = {skill_id₁, skill_id₂, ..., skill_idₙ}
Job Skills Vector:   J = {skill_id₁, skill_id₂, ..., skill_idₘ}
```

**Formula:**
```
similarity = |U ∩ J| / (√|U| × √|J|)

where:
  |U ∩ J| = cardinality of intersection (common skills)
  |U| = cardinality of U (total user skills)
  |J| = cardinality of J (total job skills)
  √ = square root
```

**Properties:**
- Range: [0, 1]
- 0 = No common skills
- 1 = Perfect overlap (all skills match)

### Weighted Score Combination

**Final Score Formula:**
```
match_score = (
    skills_similarity    × 0.60 +
    position_similarity  × 0.20 +
    experience_similarity × 0.15 +
    job_type_similarity  × 0.05
) × 100

Result: Rounded to 2 decimal places (0.00 - 100.00)
```

---

## Code Examples

### Complete Example Calculation

**Scenario:**

```python
# User Profile
user = {
    "skills": [1, 2, 3],           # Python, React, SQL
    "desired_position": "Python Developer",
    "experience_years": 3.0,
    "preferred_job_type": "Full-time"
}

# Job Requirements
job = {
    "skills": [2, 3, 4],           # React, SQL, Node.js
    "title": "Python Developer",
    "experience_years": 2.0,
    "employment_type": "Full-time"
}
```

**Step-by-Step Calculation:**

**1. Skills Match (60% weight):**
```python
# User: [1, 2, 3], Job: [2, 3, 4]
common_skills = {2, 3}             # React and SQL
dot_product = 2

norm_user = sqrt(3) = 1.732
norm_job = sqrt(3) = 1.732

skills_similarity = 2 / (1.732 × 1.732)
                  = 2 / 3.0
                  = 0.667

Skills Score: 66.7%
```

**2. Position Match (20% weight):**
```python
"Python Developer" == "Python Developer"
position_similarity = 1.0

Position Score: 100%
```

**3. Experience Match (15% weight):**
```python
user_exp = 3.0
required_exp = 2.0

3.0 >= 2.0  # User exceeds requirement
experience_similarity = 1.0

Experience Score: 100%
```

**4. Job Type Match (5% weight):**
```python
"Full-time" == "Full-time"
job_type_similarity = 1.0

Job Type Score: 100%
```

**5. Final Score Calculation:**
```python
total_score = (
    0.667 × 0.60 +   # Skills:    0.400
    1.0   × 0.20 +   # Position:  0.200
    1.0   × 0.15 +   # Experience: 0.150
    1.0   × 0.05     # Job Type:  0.050
)

total_score = 0.400 + 0.200 + 0.150 + 0.050
            = 0.800

match_score = 0.800 × 100
            = 80.0%

Final Match Score: 80.0%
```

**Score Breakdown:**
```json
{
    "match_score": 80.0,
    "matched_skills": ["React", "SQL"],
    "score_breakdown": {
        "skills_score": 66.7,
        "position_score": 100.0,
        "experience_score": 100.0,
        "job_type_score": 100.0
    }
}
```

---

## Viva Questions & Answers

### Q1: Why did you choose these four factors for recommendation?

**Answer:**  
These four factors represent the most critical aspects of job matching:
- **Skills** (60%): The most tangible and verifiable requirement
- **Position** (20%): Shows career direction alignment
- **Experience** (15%): Indicates readiness for the role
- **Job Type** (5%): Preference, but users are often flexible

The weights reflect their relative importance in actual hiring decisions.

---

### Q2: Why use Cosine Similarity for skills instead of simple percentage?

**Answer:**  
Cosine similarity has advantages over simple percentage matching:

**Example:**
```
Scenario 1: User has 10 skills, Job requires 3 skills, 3 match
  Simple %: 3/10 = 30% (underestimates match)
  Cosine:   3/(√10 × √3) = 54.8% (more fair)

Scenario 2: User has 3 skills, Job requires 10 skills, 3 match
  Simple %: 3/3 = 100% (overestimates match)
  Cosine:   3/(√3 × √10) = 54.8% (same as above - consistent)
```

Cosine similarity measures the **angle** between vectors, not magnitude. This treats both scenarios equally, which is more appropriate for skill matching.

---

### Q3: Why not use machine learning or TF-IDF?

**Answer:**  
For this project, a rule-based algorithm is more suitable because:

1. **Explainability**: Every score can be traced back to clear logic
2. **No Training Data Required**: Works immediately with any data
3. **Deterministic**: Same inputs always produce same output
4. **Fast**: No model training or prediction overhead
5. **Maintainable**: Easy to adjust weights and logic
6. **Project Scope**: Appropriate for final-year college project

TF-IDF would be overkill for short, structured data like job titles and skill names.

---

### Q4: How would you handle edge cases?

**Answer:**  
The algorithm handles several edge cases:

**Case 1: User has no skills**
```python
if not user_skill_ids:
    skills_similarity = 0.0
```
Result: User won't match highly with any job

**Case 2: Job requires no skills**
```python
if not job_skill_ids:
    skills_similarity = 0.0
```
Result: Job appears less relevant

**Case 3: No experience required**
```python
if required_experience == 0:
    experience_similarity = 1.0
```
Result: Everyone qualifies (fair for entry-level)

**Case 4: Empty strings**
```python
if not user_desired_position or not job_title:
    position_similarity = 0.0
```
Result: No match when data is missing

---

### Q5: What are the limitations of this algorithm?

**Answer:**  
Current limitations:

1. **No fuzzy matching**: "Python Dev" ≠ "Python Developer"
2. **No synonym handling**: "JavaScript" ≠ "JS"
3. **No location consideration**: Doesn't check proximity
4. **No salary matching**: Doesn't verify salary expectations
5. **Binary position matching**: Either matches exactly or not at all

---

### Q6: How would you improve this algorithm?

**Answer:**  
Potential improvements:

**1. Fuzzy Position Matching:**
```python
# Use edit distance or partial matching
if "developer" in job_title.lower() and "developer" in desired_position.lower():
    score = 0.8  # Partial match
```

**2. Skill Synonyms:**
```python
synonyms = {
    "javascript": ["js", "ecmascript"],
    "python": ["py"],
}
# Check both skill names and synonyms
```

**3. Location Distance:**
```python
distance = calculate_distance(user_location, job_location)
if distance <= 10km:
    location_score = 1.0
elif distance <= 50km:
    location_score = 0.5
else:
    location_score = 0.0
```

**4. Salary Matching:**
```python
if job_salary_min <= user_expected_salary <= job_salary_max:
    salary_score = 1.0
else:
    salary_score = 0.0
```

**5. Machine Learning (Advanced):**
- Train a model on user application history
- Learn user preferences over time
- Predict which jobs user is likely to apply to

---

### Q7: How do you ensure the algorithm is fair and unbiased?

**Answer:**  
The algorithm is designed to be objective:

1. **Skill-based**: Focuses on technical requirements, not demographics
2. **Transparent**: Every score can be explained
3. **Consistent**: Same inputs always produce same outputs
4. **No personal data**: Doesn't consider age, gender, name, etc.
5. **Equal opportunity**: Only looks at qualifications

However, bias could still exist in:
- Job descriptions (if biased)
- Skill requirements (if unnecessarily restrictive)
- Data quality (if user profiles are incomplete)

---

### Q8: How do you validate that your algorithm works correctly?

**Answer:**  
Validation methods:

**1. Unit Tests:**
```python
def test_skills_similarity():
    # Test case: 2 common out of 3 and 3
    user_skills = [1, 2, 3]
    job_skills = [2, 3, 4]
    score, matched = calculate_skills_similarity(user_skills, job_skills)
    assert abs(score - 0.667) < 0.01
    assert matched == [2, 3]
```

**2. Manual Verification:**
- Test with known examples
- Verify score breakdown makes sense
- Check edge cases return expected values

**3. User Feedback:**
- Track which recommended jobs users apply to
- Measure click-through rate
- Collect user satisfaction ratings

**4. A/B Testing:**
- Compare with random recommendations
- Measure application conversion rate
- Analyze user engagement metrics

---

## Future Improvements

### Short-term Enhancements

1. **Skill Taxonomy**
   - Group related skills (Python, Django → Backend)
   - Give partial credit for related skills

2. **Recency Bias**
   - Prioritize recently posted jobs
   - Boost score for jobs posted in last 7 days

3. **User Feedback Loop**
   - Track which jobs user clicks/applies to
   - Learn user preferences over time
   - Adjust weights based on behavior

### Long-term Enhancements

1. **Collaborative Filtering**
   - "Users similar to you also liked these jobs"
   - Use user-job interaction matrix

2. **Content-Based Filtering**
   - Analyze job descriptions using NLP
   - Match against user's resume/profile text

3. **Hybrid Approach**
   - Combine rule-based + ML predictions
   - Use ensemble methods

4. **Real-time Personalization**
   - Update recommendations as user browses
   - Track session behavior
   - Adapt to changing preferences

---

## Implementation Details

### Code Structure

```
backend/app/
├── algorithms/
│   └── recommendation.py          # Algorithm implementation
│       ├── calculate_skills_similarity()
│       ├── calculate_position_similarity()
│       ├── calculate_experience_similarity()
│       ├── calculate_job_type_similarity()
│       ├── calculate_match_score()
│       └── rank_jobs_by_match()
│
├── services/
│   └── recommendation_service.py  # Business logic orchestration
│       └── get_recommended_jobs()
│
├── routers/
│   └── jobs.py                    # API endpoint
│       └── GET /jobs/recommended
│
└── schemas/
    └── job.py                     # Response models
        ├── RecommendedJobItem
        └── RecommendedJobsResponse
```

### API Endpoint

**Request:**
```http
GET /jobs/recommended?skip=0&limit=12
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "jobs": [
    {
      "id": 1,
      "job_title": "Python Developer",
      "company_name": "Google",
      "match_score": 85.5,
      "matched_skills": ["Python", "Django", "PostgreSQL"],
      "score_breakdown": {
        "skills_score": 80.0,
        "position_score": 100.0,
        "experience_score": 100.0,
        "job_type_score": 0.0
      },
      "skills": [...],
      ...
    }
  ],
  "total": 45,
  "skip": 0,
  "limit": 12
}
```

---

## Conclusion

This recommendation algorithm provides a **simple, transparent, and effective** way to match users with suitable jobs. It's:

✅ Easy to understand and explain  
✅ Fast and efficient  
✅ Requires no external ML libraries  
✅ Produces explainable results  
✅ Suitable for a college final-year project  

The algorithm can serve as a solid foundation and be enhanced with more sophisticated techniques as the project evolves.

---

**Document Version:** 1.0  
**Last Updated:** 2026  
**Author:** Job Portal Team  
**Contact:** jeewansingh@example.com
