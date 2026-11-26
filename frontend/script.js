
const form = document.getElementById("summarization-form");
const dialogueInput = document.getElementById("dialogue-input");
const summaryText = document.getElementById("summary-text");
const characterCount = document.getElementById("character-count");

const clearBtn = document.getElementById("clear-btn");
const copyBtn = document.getElementById("copy-btn");
const copyLabel = document.getElementById("copy-label");

const emptyState = document.getElementById("empty-state");
const submitButton = document.getElementById("summarize-btn");
const buttonContent = document.getElementById("button-content");
const loader = document.getElementById("loader");

const API_URL = "https://summify-api-proxy.2shreyansh8.workers.dev";

// -----------------------------
// Character Counter
// -----------------------------
function updateCharacterCount() {
    const count = dialogueInput.value.length;
    characterCount.textContent = `${count} characters`;
}

dialogueInput.addEventListener("input", updateCharacterCount);

// -----------------------------
// Clear Input and Summary
// -----------------------------
clearBtn.addEventListener("click", () => {
    dialogueInput.value = "";
    summaryText.textContent = "";

    emptyState.style.display = "";
    copyBtn.disabled = true;

    updateCharacterCount();
    dialogueInput.focus();
});

// -----------------------------
// Copy Summary
// -----------------------------
copyBtn.addEventListener("click", async () => {
    const text = summaryText.textContent.trim();

    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);

        copyLabel.textContent = "Copied!";

        setTimeout(() => {
            copyLabel.textContent = "Copy";
        }, 1500);

    } catch (error) {
        console.error("Copy error:", error);
        copyLabel.textContent = "Failed";

        setTimeout(() => {
            copyLabel.textContent = "Copy";
        }, 1500);
    }
});

// -----------------------------
// Summarization
// -----------------------------
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dialogue = dialogueInput.value.trim();

    if (!dialogue) {
        summaryText.textContent = "Please enter text first.";
        emptyState.style.display = "none";
        copyBtn.disabled = true;
        return;
    }

    submitButton.disabled = true;
    buttonContent.style.display = "none";
    loader.style.display = "inline-block";

    summaryText.textContent = "";
    emptyState.style.display = "none";
    copyBtn.disabled = true;

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
            throw new Error("Invalid response from API proxy.");
        }

        if (!response.ok) {
            throw new Error(data.error || "Summarization failed.");
        }

        if (!data.summary) {
            throw new Error("No summary returned by AI.");
        }

        summaryText.textContent = data.summary;
        copyBtn.disabled = false;

    } catch (error) {
        console.error("Summarization error:", error);

        summaryText.textContent = "Error: " + error.message;
        copyBtn.disabled = true;

    } finally {
        submitButton.disabled = false;
        buttonContent.style.display = "";
        loader.style.display = "none";
    }
});

// -----------------------------
// Initial Setup
// -----------------------------
updateCharacterCount();
copyBtn.disabled = true;
loader.style.display = "none";