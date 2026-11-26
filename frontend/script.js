
import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

const form = document.getElementById("summarization-form");
const dialogueInput = document.getElementById("dialogue-input");
const summaryText = document.getElementById("summary-text");
const submitButton = form.querySelector("button");

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
        // Connect to your Hugging Face Space
        const client = await Client.connect("Shr-yan/Summify-AI");

        summaryText.innerText = "Generating summary...";

        // Call your exact API endpoint
        const result = await client.predict(
            "/summarize_dialogue",
            {
                dialogue: dialogue
            }
        );

        // Gradio returns outputs inside result.data
        summaryText.innerText =
            result.data?.[0] ?? "No summary returned.";

    } catch (error) {
        console.error("Summarization error:", error);

        summaryText.innerText =
            "Something went wrong. The AI server may be sleeping or busy. Please try again.";
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Summarize";
    }
});
