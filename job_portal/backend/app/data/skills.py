"""
Master Skill Database

This file contains all supported skills.

Rules:
- Use proper capitalization.
- Do not include duplicates.
- Add new skills anytime.
"""

SKILLS = {

    # -----------------------------
    # Programming Languages
    # -----------------------------

    "Programming Languages": [
        "Python",
        "Java",
        "JavaScript",
        "TypeScript",
        "C",
        "C++",
        "C#",
        "Go",
        "Rust",
        "PHP",
        "Kotlin",
        "Swift",
        "R",
        "Dart",
    ],

    # -----------------------------
    # Frontend
    # -----------------------------

    "Frontend": [
        "HTML",
        "CSS",
        "Bootstrap",
        "Tailwind CSS",
        "React",
        "Next.js",
        "Vue",
        "Angular",
        "Svelte",
        "Redux",
        "jQuery",
    ],

    # -----------------------------
    # Backend
    # -----------------------------

    "Backend": [
        "FastAPI",
        "Django",
        "Flask",
        "Spring Boot",
        "Express.js",
        "Laravel",
        "ASP.NET",
        "Node.js",
    ],

    # -----------------------------
    # Mobile
    # -----------------------------

    "Mobile": [
        "React Native",
        "Flutter",
        "Android",
        "iOS",
    ],

    # -----------------------------
    # Databases
    # -----------------------------

    "Database": [
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "SQLite",
        "Oracle",
        "Redis",
        "Firebase",
    ],

    # -----------------------------
    # DevOps
    # -----------------------------

    "DevOps": [
        "Docker",
        "Kubernetes",
        "Git",
        "GitHub",
        "GitLab",
        "Jenkins",
        "Terraform",
        "Ansible",
    ],

    # -----------------------------
    # Cloud
    # -----------------------------

    "Cloud": [
        "AWS",
        "Azure",
        "Google Cloud",
        "DigitalOcean",
    ],

    # -----------------------------
    # AI / Data Science
    # -----------------------------

    "AI": [
        "Machine Learning",
        "Deep Learning",
        "Artificial Intelligence",
        "TensorFlow",
        "PyTorch",
        "Scikit-learn",
        "Pandas",
        "NumPy",
        "OpenCV",
        "Matplotlib",
        "Seaborn",
    ],

    # -----------------------------
    # Tools
    # -----------------------------

    "Tools": [
        "Figma",
        "Adobe XD",
        "Photoshop",
        "Illustrator",
        "Postman",
        "VS Code",
        "Linux",
        "Windows",
    ],
}

# -------------------------------------------------------------------
# Flatten all skills for fast searching
# -------------------------------------------------------------------

ALL_SKILLS = []

for category in SKILLS.values():
    ALL_SKILLS.extend(category)

ALL_SKILLS_SET = {skill.lower() for skill in ALL_SKILLS}