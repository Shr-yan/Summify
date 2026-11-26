
const form = document.getElementById("summarization-form");
const dialogueInput = document.getElementById("dialogue-input");
const summaryText = document.getElementById("summary-text");
const submitButton = form.querySelector("button");

// Replace with your actual Cloudflare API Worker URL
const API_URL = "https://summify-api-proxy.2shreyansh8.workers.dev/";

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dialogue = dialogueInput.value.trim();

    if (!dialogue) {
        summaryText.innerText = "Please enter some text first.";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Summarizing...";
    summaryText.innerText = "Connecting to Summify AI...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ dialogue }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Server error");
        }

        summaryText.innerText = data.summary || "No summary returned.";

    } catch (error) {
        console.error("Summarization error:", error);

        summaryText.innerText =
            "Error: " + error.message;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Summarize";
    }
});
