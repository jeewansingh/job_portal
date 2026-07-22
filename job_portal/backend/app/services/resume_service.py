import re

from app.utils.pdf_reader import extract_text_from_pdf


# ============================================================
# REGEX
# ============================================================

EMAIL_REGEX = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"

PHONE_REGEX = r"(\+?\d[\d\s().-]{7,}\d)"


URL_REGEX = (
    r"(https?://\S+|www\.\S+|github\.com/\S+|linkedin\.com/in/\S+)"
)


# ============================================================
# NAME BLACKLIST
# ============================================================

NAME_BLACKLIST = {
    "resume",
    "curriculum vitae",
    "cv",
    "summary",
    "profile",
    "education",
    "experience",
    "projects",
    "skills",
    "contact",
    "objective",
    "certifications",
    "languages",
    "references",
}


# ============================================================
# SECTION HEADERS
# ============================================================

SECTION_HEADERS = [
    "SUMMARY",
    "PROFILE",
    "SKILLS",
    "EDUCATION",
    "EXPERIENCE",
    "PROJECT",
    "PROJECTS",
    "CERTIFICATIONS",
    "LANGUAGES",
]


# ============================================================
# HELPERS
# ============================================================
def normalize(text):

    return (
        text.lower()
        .replace(".", "")
        .replace(",", "")
        .replace("-", " ")
        .replace("_", " ")
        .strip()
    )

def clean_lines(text: str):
    """
    Remove empty lines.
    """

    return [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]
# ============================================================
# NAME
# ============================================================

def extract_name(text: str):

    lines = clean_lines(text)

    for line in lines[:10]:

        line_lower = line.lower()

        if line_lower in NAME_BLACKLIST:
            continue

        if "@" in line:
            continue

        if any(char.isdigit() for char in line):
            continue

        words = line.split()

        if len(words) < 2 or len(words) > 4:
            continue

        if len(line) > 40:
            continue

        return line.title()

    return ""

# ============================================================
# EMAIL
# ============================================================

def extract_email(text: str):

    match = re.search(EMAIL_REGEX, text)

    return match.group() if match else ""

# ============================================================
# PHONE
# ============================================================
def extract_phone(text):

    PHONE_PATTERNS = [

        # +977 9801234567
        r"\+\d{1,3}[\s-]?\d[\d\s()-]{6,}",

        # (123) 456-7890
        r"\(\d{3}\)\s*\d{3}[- ]?\d{4}",

        # 123-456-7890
        r"\d{3}[- ]\d{3}[- ]\d{4}",

        # 9801234567
        r"\d{8,15}",
    ]

    for line in text.splitlines():

        for pattern in PHONE_PATTERNS:

            match = re.search(pattern, line)

            if match:
                return match.group().strip()

    return ""

# ============================================================
# PORTFOLIO
# ============================================================

import re

def extract_portfolio(text):

    pattern = re.compile(
        r"(https?://[^\s,]+"
        r"|www\.[^\s,]+"
        r"|linkedin\.com/in/[^\s,]+"
        r"|github\.com/[^\s,]+"
        r"|behance\.net/[^\s,]+"
        r"|dribbble\.com/[^\s,]+)",
        re.IGNORECASE,
    )

    links = []

    for link in pattern.findall(text):

        link = link.strip()

        if not link.startswith(("http://", "https://")):
            link = "https://" + link

        links.append(link)

    return list(dict.fromkeys(links))

# ============================================================
# SECTION DETECTOR
# ============================================================

def detect_sections(text: str):

    lines = clean_lines(text)

    sections = {}

    current_section = "HEADER"

    sections[current_section] = []

    for line in lines:

        upper = line.upper()

        if upper in SECTION_HEADERS:

            current_section = upper

            sections[current_section] = []

            continue

        sections[current_section].append(line)

    return sections

# ============================================================
# SKILL EXTRACTION
# ============================================================
def extract_skills_text(sections):
    """
    Extract raw skill names from resume text.
    Returns list of raw skill strings (not matched yet).
    """
    skills_lines = sections.get("SKILLS", [])

    if not skills_lines:
        return []

    found = []

    for line in skills_lines:

        # Remove labels like "Languages:"
        line = re.sub(
            r"^(languages|frameworks|tools|database|databases|technologies|skills)\s*:\s*",
            "",
            line,
            flags=re.IGNORECASE,
        )

        # Split by common separators
        tokens = re.split(
            r"[,;|•/]+",
            line
        )

        for token in tokens:

            token = normalize(token)

            if not token:
                continue

            # Ignore useless words
            if token in {"etc", "etc.", "&", "and"}:
                continue
            
            found.append(token)

    return found

# ============================================================
# EDUCATION
# ============================================================
def extract_education(sections):

    education = sections.get("EDUCATION", [])

    for line in education:

        line = line.strip()

        if line:
            return line

    return ""

# ============================================================
# EXPERIENCE
# ============================================================

def extract_experience(sections):

    experience = sections.get("EXPERIENCE", [])

    cleaned = []

    for line in experience:

        line = line.strip()

        if line:

            cleaned.append(line)

    return cleaned

# ============================================================
# PROJECTS
# ============================================================

def extract_projects(sections):

    projects = []

    if "PROJECTS" in sections:
        projects = sections["PROJECTS"]

    elif "PROJECT" in sections:
        projects = sections["PROJECT"]

    cleaned = []

    for line in projects:

        line = line.strip()

        if line:

            cleaned.append(line)

    return cleaned

# ============================================================
# MAIN SERVICE
# ============================================================

async def extract_resume(file, db=None):
    """
    Extract resume information from PDF file.
    
    Args:
        file: Uploaded PDF file
        db: Optional database session for skill matching
    
    Returns:
        Dict with extracted information including matched skills
    """
    pdf_bytes = await file.read()

    text = extract_text_from_pdf(pdf_bytes)

    sections = detect_sections(text)
    
    # Extract raw skill names from text
    raw_skills = extract_skills_text(sections)
    
    # If database session provided, match skills using three-tier strategy
    matched_skills = []
    if db:
        from app.repositories.skill_matching_repository import match_skills
        matched_skills = match_skills(db, raw_skills)
    
    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "portfolio": extract_portfolio(text),
        "skills": matched_skills,  # Now returns [{"id": 1, "name": "Python"}, ...]
        "education": extract_education(sections),
        "projects": extract_projects(sections),
    }