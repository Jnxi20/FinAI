const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function run() {
    try {
        // This is a hacky way to check validity if listModels isn't directly exposed easily in the helper
        // But actually the SDK doesn't expose listModels easily in the main class in older versions?
        // Let's try a direct fetch if the SDK fails, but let's try a simple generation with 'gemini-pro' first again.

        console.log("Testing with key:", process.env.GOOGLE_API_KEY.substring(0, 10) + "...");

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hi");
        console.log("gemini-pro works!");
    } catch (error) {
        console.log("gemini-pro failed:", error.message);
    }

    try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result2 = await model2.generateContent("Hi");
        console.log("gemini-2.5-flash works!");
    } catch (error) {
        console.log("gemini-2.5-flash failed:", error.message);
    }
}

run();
