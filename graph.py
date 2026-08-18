import re
from typing import TypedDict

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END


# =========================================================
# LOAD ENVIRONMENT
# =========================================================

load_dotenv()


# =========================================================
# STATE
# =========================================================

class ComplaintState(TypedDict, total=False):

    complaint: str
    summary: str
    risk_level: str
    recommendation: str


# =========================================================
# GROQ MODEL
# =========================================================

llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0
)


# =========================================================
# ANALYZE COMPLAINT
# =========================================================

def analyze_complaint(
    state: ComplaintState
):

    complaint = state.get(
        "complaint",
        ""
    )


    prompt = f"""
You are an AI assistant for a pharmaceutical
customer complaint management system.

Analyze this complaint:

{complaint}

Give a professional assessment.

You MUST include exactly these sections:

Complaint Summary:
<summary>

Risk Level: <one of Critical, High, Medium, Low>

Recommended Action:
<recommended actions>

Risk levels:

Critical:
Serious potential patient safety issue,
contamination, wrong medicine, or severe defect.

High:
Significant quality or patient safety risk
requiring urgent investigation.

Medium:
Product quality issue that may affect
product integrity but has no reported serious harm.

Low:
Minor issue with little or no potential
patient safety impact.

Keep the assessment professional and practical.
"""


    # -----------------------------------------------------
    # CALL GROQ
    # -----------------------------------------------------

    response = llm.invoke(prompt)

    ai_text = response.content


    # -----------------------------------------------------
    # EXTRACT RISK LEVEL
    # -----------------------------------------------------

    match = re.search(
        r"Risk\s*Level\s*[:\-]\s*"
        r"(Critical|High|Medium|Low)",

        ai_text,

        re.IGNORECASE
    )


    if match:

        risk_level = (
            match.group(1)
            .capitalize()
        )

    else:

        lower_text = ai_text.lower()

        if "critical" in lower_text:
            risk_level = "Critical"

        elif "high" in lower_text:
            risk_level = "High"

        elif "medium" in lower_text:
            risk_level = "Medium"

        elif "low" in lower_text:
            risk_level = "Low"

        else:
            risk_level = (
                "Needs AI assessment"
            )


    # -----------------------------------------------------
    # EXTRACT SUMMARY
    # -----------------------------------------------------

    summary = ai_text


    summary_match = re.search(
        r"Complaint Summary\s*:\s*"
        r"(.*?)(?=\n\s*Risk Level)",

        ai_text,

        re.IGNORECASE |
        re.DOTALL
    )


    if summary_match:

        summary = (
            summary_match
            .group(1)
            .strip()
        )


    # -----------------------------------------------------
    # EXTRACT RECOMMENDATION
    # -----------------------------------------------------

    recommendation = (
        "Review the AI assessment."
    )


    recommendation_match = re.search(
        r"Recommended Action\s*:\s*"
        r"(.*)",

        ai_text,

        re.IGNORECASE |
        re.DOTALL
    )


    if recommendation_match:

        recommendation = (
            recommendation_match
            .group(1)
            .strip()
        )


    # -----------------------------------------------------
    # RETURN AI RESULT
    # -----------------------------------------------------

    return {

        "summary":
            summary,

        "risk_level":
            risk_level,

        "recommendation":
            recommendation
    }


# =========================================================
# LANGGRAPH
# =========================================================

workflow = StateGraph(
    ComplaintState
)


workflow.add_node(
    "analyze_complaint",
    analyze_complaint
)


workflow.add_edge(
    START,
    "analyze_complaint"
)


workflow.add_edge(
    "analyze_complaint",
    END
)


# =========================================================
# COMPILE GRAPH
# =========================================================

complaint_graph = (
    workflow.compile()
)