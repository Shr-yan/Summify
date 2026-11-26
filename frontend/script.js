
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
    summaryText.innerText = "Connecting to AI...";

    try {
        console.log("Connecting to Hugging Face Space...");

        const client = await Client.connect("Shr-yan/summify-AI");

        console.log("Connected. Calling API...");

        const result = await client.predict(
            "/summarize_dialogue",
            {
                dialogue: dialogue
            }
        );

        console.log("API result:", result);

        summaryText.innerText =
            result.data?.[0] ?? "No summary returned.";

    } catch (error) {
        console.error("Full error:", error);

        summaryText.innerText =
            "Error: " + (error.message || String(error));

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Summarize";
    }
});
