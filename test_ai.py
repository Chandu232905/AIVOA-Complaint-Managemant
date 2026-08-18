from ai.graph import complaint_graph

result = complaint_graph.invoke({
    "complaint": "Customer reported broken tablets in Paracetamol 500mg from batch B12345.",
    "summary": "",
    "risk_level": "",
    "recommendation": ""
})

print("\nAI RESULT:")
print(result["summary"])