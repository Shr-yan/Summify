const form = document.getElementById("summarization-form");
const dialogueInput = document.getElementById("dialogue-input");
const summaryText = document.getElementById("summary-text");
const submitButton = form.querySelector("button");

// Cloudflare API Proxy
const API_URL = "https://summify-api-proxy.2shreyansh8.workers.dev";

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dialogue = dialogueInput.value.trim();

    if (!dialogue) {
        summaryText.innerText = "Please enter text first.";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Summarizing...";
    summaryText.innerText = "Connecting to Summify AI...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ dialogue })
        });

        const raw = await response.text();

        let data;
        try {
            data = JSON.parse(raw);
        } catch {
            throw new Error("Proxy returned an invalid response. Check Cloudflare Worker.");
        }

        if (!response.ok) {
            throw new Error(data.error || "Server error");
        }

        summaryText.innerText = data.summary || "No summary received.";

    } catch (error) {
        console.error("Full error:", error);
        summaryText.innerText = "Error: " + error.message;

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Summarize";
    }
});