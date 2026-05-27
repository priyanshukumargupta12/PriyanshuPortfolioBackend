import "dotenv/config";

async function testChatbotEndpoint() {
  const baseUrl = "http://localhost:5000/api";
  console.log("=== Testing Chatbot API Endpoint ===");

  try {
    const userQuery = "What projects has Priyanshu built?";
    console.log(`Sending message: "${userQuery}"`);

    const response = await fetch(`${baseUrl}/chatbot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userQuery,
        history: []
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const result = await response.json();
    console.log("\nResponse Status: SUCCESS ✅");
    console.log("Response Payload:", JSON.stringify(result, null, 2));

    // Verify response schema
    if (result.success && result.data && result.data.parts?.[0]?.text) {
      console.log("\nResult Verification: PASSED 🌟");
      console.log(`Chatbot Output text: "${result.data.parts[0].text}"`);
    } else {
      console.log("\nResult Verification: FAILED ❌ (Invalid output format)");
    }
  } catch (error) {
    console.error("Test failed with error:", error);
    process.exit(1);
  }
}

testChatbotEndpoint();
