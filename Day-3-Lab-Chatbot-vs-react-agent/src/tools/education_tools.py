from typing import Dict, List


CURRICULUM = {
    "math": {
        "9": ["linear equations", "quadratic equations", "systems of equations"],
        "10": ["functions", "vectors", "trigonometry"],
        "11": ["sequences", "derivatives", "combinatorics"],
        "12": ["integrals", "complex numbers", "logarithms"],
    },
    "english": {
        "9": ["passive voice", "relative clauses", "conditional sentences"],
        "10": ["reported speech", "reading comprehension", "essay writing"],
        "11": ["inversion", "word formation", "argumentative writing"],
        "12": ["reading comprehension", "cloze tests", "graduation exam review"],
    },
}


def curriculum_lookup(subject: str, grade: str, topic: str) -> str:
    subject_key = subject.strip().lower()
    grade_key = str(grade).strip()
    topic_key = topic.strip().lower()
    topics = CURRICULUM.get(subject_key, {}).get(grade_key, [])

    if not topics:
        return (
            f"Curriculum check: unknown subject/grade pair "
            f"subject={subject}, grade={grade}."
        )

    is_match = any(topic_key in item or item in topic_key for item in topics)
    status = "aligned" if is_match else "needs review"
    return (
        f"Curriculum check: {status}. Known topics for {subject} grade {grade}: "
        f"{', '.join(topics)}."
    )


def question_generator(
    subject: str,
    grade: str,
    topic: str,
    multiple_choice: int = 4,
    short_answer: int = 2,
    difficulty: str = "medium",
) -> str:
    total_score = 10
    mc_score = multiple_choice * 1
    remaining = max(total_score - mc_score, 0)
    short_score = round(remaining / max(short_answer, 1), 2)

    questions: List[str] = []
    for idx in range(1, multiple_choice + 1):
        questions.append(
            f"{idx}. [MCQ - 1 point] {subject} grade {grade}: "
            f"{topic} concept check ({difficulty}). Options: A, B, C, D. "
            f"Answer: A."
        )

    for idx in range(1, short_answer + 1):
        number = multiple_choice + idx
        questions.append(
            f"{number}. [Short answer - {short_score} points] Solve an applied "
            f"{topic} problem for grade {grade}. Include reasoning steps. "
            f"Answer rubric: correct method + final answer."
        )

    return "\n".join(questions)


def score_validator(exam_text: str, target_score: int = 10) -> str:
    point_values = []
    for fragment in exam_text.split("["):
        if "point" not in fragment:
            continue
        first_token = fragment.split("point", 1)[0].split("-")[-1].strip()
        try:
            point_values.append(float(first_token))
        except ValueError:
            continue

    total = round(sum(point_values), 2)
    if total == target_score:
        return f"Score validation: passed. Total score = {total}/{target_score}."
    return (
        f"Score validation: failed. Total score = {total}/{target_score}. "
        "Revise the point allocation before final answer."
    )


def exam_formatter(title: str, exam_text: str, validation: str = "") -> str:
    return f"""# {title}

## Student Instructions
- Time: 45 minutes
- Answer all questions.
- Show your reasoning for short-answer questions.

## Questions
{exam_text}

## Quality Check
{validation}
"""


EDUCATION_TOOLS: List[Dict[str, object]] = [
    {
        "name": "curriculum_lookup",
        "description": (
            "Check whether an exam topic is suitable for a subject and grade. "
            "Arguments: subject, grade, topic."
        ),
        "func": curriculum_lookup,
    },
    {
        "name": "question_generator",
        "description": (
            "Generate a draft exam question set. Arguments: subject, grade, topic, "
            "multiple_choice, short_answer, difficulty."
        ),
        "func": question_generator,
    },
    {
        "name": "score_validator",
        "description": (
            "Validate whether point values in an exam add up to the target score. "
            "Arguments: exam_text, target_score."
        ),
        "func": score_validator,
    },
    {
        "name": "exam_formatter",
        "description": (
            "Format a finished exam as Markdown. Arguments: title, exam_text, validation."
        ),
        "func": exam_formatter,
    },
]
