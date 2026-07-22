# KNN-Based "Jobs You May Like" Feature Documentation

**Project:** Job Portal System  
**Feature:** Job-to-Job Similarity Recommendations  
**Algorithm:** K-Nearest Neighbors (KNN)  
**Authentication:** Not Required (Public Feature)  

---

## Table of Contents

1. [Overview](#overview)
2. [Algorithm Explanation](#algorithm-explanation)
3. [Mathematical Formulas](#mathematical-formulas)
4. [Implementation Details](#implementation-details)
5. [API Documentation](#api-documentation)
6. [Code Examples](#code-examples)
7. [Viva Questions & Answers](#viva-questions--answers)

---

## Overview

The "Jobs You May Like" feature recommends similar jobs to users viewing a specific job posting. Unlike user-based recommendations that require login, this feature uses **job-to-job similarity** and works for everyone.

### Key Features

✅ **No Authentication Required** - Works for both logged-in and anonymous users  
✅ **Pure Python** - No external ML libraries (sklearn, numpy)  
✅ **Fast & Efficient** - Simple calculations, quick response  
✅ **Explainable** - Clear scoring with interpretable factors  
✅ **KNN Algorithm** - Finds K most similar jobs  

### Use Case

When a user views a job details page, the system shows 3 similar jobs at the bottom in a "Jobs You May Like" section. This helps users discover related opportunities without needing to search manually.

---

## Algorithm Explanation

### What is KNN (K-Nearest Neighbors)?

KNN is a simple machine learning algorithm that finds the K most similar items to a reference item. In our case:

- **Reference Item:** The job the user is currently viewing
- **Candidate Items:** All other active jobs in the database
- **K:** Number of similar jobs to return (we use K=3)

### KNN Process

1. **Calculate Similarity:** Compare the reference job with every other job
2. **Score Each Job:** Assign a similarity score (0-100)
3. **Sort by Score:** Arrange jobs from most to least similar
4. **Return Top K:** Select the 3 highest-scoring jobs

---

## Mathematical Formulas

### Similarity Factors & Weights

The algorithm compares jobs using 5 factors:

| Factor | Weight | Method | Description |
|--------|--------|--------|-------------|
| **Skills** | 50% | Cosine Similarity | Overlap of required skills |
| **Job Title** | 20% | Exact Match | Same position or not |
| **Experience** | 15% | Inverse Distance | How close the requirements are |
| **Category** | 10% | Exact Match | Same job category or not |
| **Employment Type** | 5% | Exact Match | Same type (Full-time, etc.) |

### 1. Skills Similarity (50% Weight)

**Formula: Cosine Similarity**

```
similarity = |A ∩ B| / (√|A| × √|B|)

where:
  A = skill IDs of Job A
  B = skill IDs of Job B
  |A ∩ B| = number of common skills
  |A| = total skills in Job A
  |B| = total skills in Job B
  √ = square root
```

**Example:**

```
Job A skills: [1, 2, 3, 4]  (Python, React, SQL, Git)
Job B skills: [2, 3, 5]     (React, SQL, Docker)

Common skills: {2, 3} = 2 skills
|A| = 4, |B| = 3

similarity = 2 / (√4 × √3)
           = 2 / (2.0 × 1.732)
           = 2 / 3.464
           = 0.577
           = 57.7%
```

**Why Cosine Similarity?**
- Measures the angle between vectors
- Not affected by magnitude (number of skills)
- Ideal for sparse data like skill sets
- Range: 0 (no overlap) to 1 (identical)

---

### 2. Job Title Similarity (20% Weight)

**Formula: Exact Match**

```python
if job_title_1.lower() == job_title_2.lower():
    score = 1.0  # 100%
else:
    score = 0.0  # 0%
```

**Examples:**

| Job A Title | Job B Title | Score |
|-------------|-------------|-------|
| "Python Developer" | "python developer" | 1.0 ✓ |
| "Senior Python Developer" | "Python Developer" | 0.0 ✗ |
| "Frontend Developer" | "Frontend Developer" | 1.0 ✓ |

**Why Exact Match?**
- Job titles are specific and short
- Partial matches could be misleading
- Simple and fast to compute

---

### 3. Experience Similarity (15% Weight)

**Formula: Inverse Normalized Distance**

```
max_diff = 10.0  (assume max meaningful difference)
diff = |exp_A - exp_B|

similarity = max(0, 1 - (diff / max_diff))
```

**Examples:**

| Job A Exp | Job B Exp | Difference | Calculation | Score |
|-----------|-----------|------------|-------------|-------|
| 3 years | 3 years | 0 | 1 - (0/10) | 1.0 (100%) ✓ |
| 2 years | 4 years | 2 | 1 - (2/10) | 0.8 (80%) ◐ |
| 0 years | 5 years | 5 | 1 - (5/10) | 0.5 (50%) ◑ |
| 0 years | 10 years | 10 | 1 - (10/10) | 0.0 (0%) ✗ |

**Why Inverse Distance?**
- Jobs with similar experience requirements are more alike
- Gradual decrease as difference grows
- Fair for entry-level to senior positions

---

### 4. Category Similarity (10% Weight)

**Formula: Exact Match**

```python
if category_1.lower() == category_2.lower():
    score = 1.0  # 100%
else:
    score = 0.0  # 0%
```

**Examples:**

| Job A Category | Job B Category | Score |
|----------------|----------------|-------|
| "IT" | "IT" | 1.0 ✓ |
| "Software Development" | "Software Development" | 1.0 ✓ |
| "Marketing" | "IT" | 0.0 ✗ |

---

### 5. Employment Type Similarity (5% Weight)

**Formula: Exact Match**

```python
if type_1.lower() == type_2.lower():
    score = 1.0  # 100%
else:
    score = 0.0  # 0%
```

**Examples:**

| Job A Type | Job B Type | Score |
|------------|------------|-------|
| "Full-time" | "full-time" | 1.0 ✓ |
| "Remote" | "Remote" | 1.0 ✓ |
| "Part-time" | "Full-time" | 0.0 ✗ |

---

### Final Similarity Score

**Weighted Sum Formula:**

```
total_similarity = 
    (skills_sim     × 0.50) +
    (title_sim      × 0.20) +
    (experience_sim × 0.15) +
    (category_sim   × 0.10) +
    (type_sim       × 0.05)

match_score = total_similarity × 100
```

**Complete Example:**

```
Job A (Reference):
  - Title: "Python Developer"
  - Skills: [1, 2, 3]      (Python, Django, PostgreSQL)
  - Experience: 3 years
  - Category: "IT"
  - Type: "Full-time"

Job B (Candidate):
  - Title: "Python Developer"
  - Skills: [2, 3, 4]      (Django, PostgreSQL, Docker)
  - Experience: 2 years
  - Category: "IT"
  - Type: "Full-time"

Calculations:

1. Skills:
   Common: {2, 3} = 2
   similarity = 2 / (√3 × √3) = 2/3 = 0.667 (66.7%)

2. Title:
   "Python Developer" == "Python Developer"
   similarity = 1.0 (100%)

3. Experience:
   diff = |3 - 2| = 1
   similarity = 1 - (1/10) = 0.9 (90%)

4. Category:
   "IT" == "IT"
   similarity = 1.0 (100%)

5. Type:
   "Full-time" == "Full-time"
   similarity = 1.0 (100%)

Final Score:
  = (0.667 × 0.50) + (1.0 × 0.20) + (0.9 × 0.15) + (1.0 × 0.10) + (1.0 × 0.05)
  = 0.333 + 0.200 + 0.135 + 0.100 + 0.050
  = 0.818
  = 81.8%
```

---

## Implementation Details

### Code Structure

```
backend/app/
├── algorithms/
│   └── knn_similarity.py              # KNN algorithm implementation
│       ├── calculate_skills_cosine_similarity()
│       ├── calculate_text_similarity()
│       ├── calculate_experience_similarity()
│       ├── calculate_job_similarity()
│       └── find_similar_jobs()
│
├── services/
│   └── similar_jobs_service.py        # Business logic
│       └── get_similar_jobs()
│
├── routers/
│   └── jobs.py                        # API endpoints
│       └── GET /jobs/{job_id}/similar
│
└── schemas/
    └── job.py                         # Response models
        ├── SimilarJobItem
        └── SimilarJobsResponse
```

### Algorithm Functions

**1. `calculate_skills_cosine_similarity(skill_ids_1, skill_ids_2)`**
```python
- Input: Two lists of skill IDs
- Output: Similarity score (0-1)
- Method: Set intersection + cosine formula
```

**2. `calculate_text_similarity(text_1, text_2)`**
```python
- Input: Two text strings
- Output: 1.0 or 0.0
- Method: Case-insensitive exact match
```

**3. `calculate_experience_similarity(exp_1, exp_2)`**
```python
- Input: Two experience values (years)
- Output: Similarity score (0-1)
- Method: Inverse normalized distance
```

**4. `calculate_job_similarity(reference_job, candidate_job, ...)`**
```python
- Input: Two job dictionaries with skill IDs
- Output: Overall similarity score (0-100)
- Method: Weighted sum of all factors
```

**5. `find_similar_jobs(reference_job, all_jobs, k=3)`**
```python
- Input: Reference job, list of all jobs, K value
- Output: Top K most similar jobs
- Method: KNN algorithm (calculate all, sort, take top K)
```

---

## API Documentation

### Endpoint

```http
GET /jobs/{job_id}/similar?limit=3
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `job_id` | int | Yes | - | ID of the job to find similar jobs for |
| `limit` | int | No | 3 | Number of similar jobs to return (1-10) |

### Request Example

```bash
curl -X GET "http://localhost:8000/jobs/123/similar?limit=3"
```

### Response Schema

```json
{
  "jobs": [
    {
      "id": 456,
      "job_title": "Python Developer",
      "category": "Software Development",
      "employment_type": "Full-time",
      "experience_years": 2,
      "salary_per_month": "$5000-7000",
      "location": "New York",
      "job_description": "...",
      "job_specification": "...",
      "deadline": "2024-12-31",
      "created_at": "2024-01-15T10:30:00",
      "is_closed": false,
      "is_active": true,
      "company_name": "Tech Corp",
      "company_logo_url": "/uploads/logos/tech-corp.png",
      "skills": [
        {"id": 1, "name": "Python"},
        {"id": 2, "name": "Django"}
      ],
      "match_score": 81.8
    },
    {
      "id": 789,
      "job_title": "Backend Developer",
      "match_score": 75.5,
      ...
    },
    {
      "id": 321,
      "job_title": "Full Stack Developer",
      "match_score": 68.3,
      ...
    }
  ],
  "total": 3
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `jobs` | array | List of similar jobs |
| `total` | int | Number of similar jobs returned |
| `match_score` | float | Similarity score (0-100) for each job |

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Similar jobs returned |
| 404 | Not Found - Job ID doesn't exist |
| 500 | Server Error |

---

## Code Examples

### Python (Backend)

**Finding Similar Jobs:**

```python
from app.algorithms.knn_similarity import find_similar_jobs

# Reference job (user is viewing this)
reference_job = {
    "id": 123,
    "job_title": "Python Developer",
    "category": "IT",
    "employment_type": "Full-time",
    "experience_years": 3.0
}
reference_skills = [1, 2, 3]  # Python, Django, PostgreSQL

# All other active jobs
all_jobs = [
    ({"id": 456, "job_title": "Python Developer", ...}, [2, 3, 4]),
    ({"id": 789, "job_title": "Backend Developer", ...}, [1, 2, 5]),
    ...
]

# Find top 3 similar jobs
similar_jobs = find_similar_jobs(
    reference_job=reference_job,
    reference_job_skill_ids=reference_skills,
    all_jobs_with_skills=all_jobs,
    k=3
)

# Result: [Job 456 (81.8%), Job 789 (75.5%), Job 321 (68.3%)]
```

---

### JavaScript (Frontend)

**Fetching Similar Jobs:**

```javascript
import { getSimilarJobs } from '../../services/job';

async function fetchSimilarJobs(jobId) {
  try {
    const response = await getSimilarJobs(jobId, 3);
    
    console.log(`Found ${response.total} similar jobs`);
    
    response.jobs.forEach(job => {
      console.log(`${job.job_title} - ${job.match_score}% match`);
    });
    
    return response.jobs;
  } catch (error) {
    console.error('Failed to fetch similar jobs:', error);
  }
}

// Usage
const similarJobs = await fetchSimilarJobs(123);
```

---

## Viva Questions & Answers

### Q1: What is KNN and how does it work?

**Answer:**  
KNN stands for K-Nearest Neighbors. It's a simple machine learning algorithm that finds the K most similar items to a reference item.

In our job portal:
1. We take the job the user is viewing as the reference
2. We calculate similarity scores with all other active jobs
3. We sort jobs by similarity (highest to lowest)
4. We return the top K jobs (we use K=3)

The "nearest" neighbors are the jobs with the highest similarity scores.

---

### Q2: Why use 5 factors with different weights?

**Answer:**  
Different factors have different importance levels in determining job similarity:

1. **Skills (50%)** - Most important because technical requirements are concrete
2. **Job Title (20%)** - Important for role identification
3. **Experience (15%)** - Indicates seniority level
4. **Category (10%)** - Groups related fields
5. **Employment Type (5%)** - Least important, users are often flexible

These weights were chosen based on typical job-seeking priorities and can be adjusted based on user feedback.

---

### Q3: Why use cosine similarity for skills instead of simple percentage?

**Answer:**  
Cosine similarity is better than simple percentage because it handles magnitude differences fairly.

**Example:**
```
Scenario 1: User has 10 skills, Job requires 3, 3 match
  Simple %: 3/10 = 30% (underestimates)
  Cosine: 3/(√10 × √3) = 54.8% (fairer)

Scenario 2: User has 3 skills, Job requires 10, 3 match
  Simple %: 3/3 = 100% (overestimates)
  Cosine: 3/(√3 × √10) = 54.8% (same as above - consistent!)
```

Cosine similarity treats both scenarios equally, which is more appropriate.

---

### Q4: Why doesn't this feature require user login?

**Answer:**  
This is a **job-to-job** similarity feature, not a user-to-job recommendation. It answers the question: "What jobs are similar to this job?" rather than "What jobs match this user?"

Benefits of not requiring login:
- Helps anonymous visitors discover more jobs
- Increases engagement before signup
- Simpler implementation
- Faster response (no user data needed)

For personalized recommendations based on user profile, we have a separate "Recommended Jobs" feature that requires login.

---

### Q5: How is this different from the user recommendation system?

**Answer:**  

| Aspect | KNN Similar Jobs | User Recommendations |
|--------|------------------|---------------------|
| **Input** | Current job | User profile + skills |
| **Output** | Similar jobs | Matching jobs |
| **Authentication** | Not required | Required |
| **Comparison** | Job vs Job | User vs Job |
| **Factors** | Job features only | User preferences + job features |
| **Use Case** | "Jobs like this one" | "Jobs for you" |
| **Algorithm** | KNN | User-Job matching |

---

### Q6: Can this algorithm be improved?

**Answer:**  
Yes, potential improvements include:

1. **Fuzzy Title Matching**: Use string similarity for partial matches
   - "Python Dev" would match "Python Developer"

2. **Skill Synonyms**: Handle similar skills
   - "JavaScript" = "JS" = "ECMAScript"

3. **Location Consideration**: Add distance calculation
   - Prefer jobs in same city/region

4. **Salary Range Matching**: Compare salary bands
   - Similar compensation levels

5. **Company Size**: Consider organization scale
   - Startup vs Enterprise

6. **Industry Tags**: More granular categorization
   - Beyond just "IT"

7. **Machine Learning**: Train on user click patterns
   - Learn which similarities users actually prefer

---

### Q7: What happens if no similar jobs are found?

**Answer:**  
The algorithm always calculates similarity scores, even if they're low. We simply return the top K jobs with the highest scores, even if those scores are relatively low.

However, in the frontend:
- We could set a minimum threshold (e.g., only show jobs with >30% similarity)
- We could show a message like "No closely similar jobs found"
- We could fall back to showing jobs from the same category

Currently, we always return 3 jobs (if available) regardless of similarity score.

---

### Q8: How fast is this algorithm?

**Answer:**  
Very fast for typical job portal scale:

**Time Complexity:**
- O(N × M) where N = number of jobs, M = average skills per job
- For 1000 jobs with 10 skills each: ~10,000 comparisons
- Each comparison is simple math (no complex ML)

**Performance:**
- Typical response time: <100ms
- No training required (unlike ML models)
- Can handle thousands of jobs easily
- Could add caching for popular jobs

**Optimization opportunities:**
- Cache results for frequently viewed jobs
- Pre-calculate similarities in background
- Use database indexing on category

---

### Q9: Why no external libraries?

**Answer:**  
We avoided libraries like scikit-learn and numpy for several reasons:

1. **Project Requirement**: College project needs explainable, simple code
2. **Dependency Management**: Fewer dependencies = easier deployment
3. **Understanding**: Writing from scratch ensures we understand the math
4. **Sufficient Complexity**: Our algorithm is simple enough for pure Python
5. **Educational Value**: Better for explaining in vivas and reports

For production systems at scale, libraries would be beneficial for optimization.

---

### Q10: How do you validate the algorithm works correctly?

**Answer:**  
Validation methods:

**1. Unit Tests:**
```python
def test_exact_match():
    job_a = {"job_title": "Python Dev", ...}
    job_b = {"job_title": "Python Dev", ...}
    score = calculate_job_similarity(job_a, [], job_b, [])
    assert score > 80  # High similarity expected
```

**2. Manual Testing:**
- Create test jobs with known similarities
- Verify scores make intuitive sense
- Check edge cases (no skills, identical jobs, etc.)

**3. User Feedback:**
- Track which similar jobs users click
- Measure click-through rate
- Adjust weights based on user behavior

**4. Visual Inspection:**
- Review recommended similar jobs manually
- Check if they actually seem related
- Ensure no obvious mismatches

---

## Conclusion

The KNN-based "Jobs You May Like" feature provides a simple, fast, and explainable way to recommend similar jobs. It works for all users (no login required), uses pure Python (no ML libraries), and calculates similarity based on 5 concrete job factors.

The algorithm is suitable for:
- ✅ College final-year project demonstration
- ✅ Viva defense and explanation
- ✅ Production use at moderate scale
- ✅ Further enhancement and learning

---

**Document Version:** 1.0  
**Last Updated:** 2026  
**Author:** Job Portal Team
