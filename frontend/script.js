
/* =========================================
   SUMMIFY - JAVASCRIPT
========================================= */

const form = document.getElementById("summarization-form");
const dialogueInput = document.getElementById("dialogue-input");

const summaryText = document.getElementById("summary-text");
const emptyState = document.getElementById("empty-state");

const summarizeButton = document.getElementById("summarize-btn");
const buttonContent = document.getElementById("button-content");

const clearButton = document.getElementById("clear-btn");
const copyButton = document.getElementById("copy-btn");
const copyLabel = document.getElementById("copy-label");

const characterCount = document.getElementById("character-count");
const loader = document.getElementById("loader");

let currentSummary = "";

/* =========================================
   CHARACTER COUNTER
========================================= */

dialogueInput.addEventListener("input", () => {
    const count = dialogueInput.value.length;

    characterCount.textContent =
        `${count.toLocaleString()} characters`;
});

/* =========================================
   SUMMARIZATION
========================================= */

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const dialogue = dialogueInput.value.trim();

    if (!dialogue) {
        dialogueInput.focus();
        showMessage("Please enter some text to summarize.", "error");
        return;
    }

    setLoading(true);

    showMessage(
        "Analyzing your text and generating a summary...",
        "processing"
    );

    try {
        const response = await fetch("/summarize/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ dialogue })
        });

        if (!response.ok) {
            let errorMessage = `Server error (${response.status})`;

            try {
                const errorData = await response.json();

                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch {
                // Use the default server error.
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.summary) {
            throw new Error("The server returned an empty summary.");
        }

        currentSummary = data.summary;

        showMessage(currentSummary, "success");

        copyButton.disabled = false;

    } catch (error) {

        currentSummary = "";

        showMessage(
            error.message || "Something went wrong.",
            "error"
        );

        copyButton.disabled = true;

    } finally {

        setLoading(false);

    }
});

/* =========================================
   DISPLAY MESSAGE
========================================= */

function showMessage(message, type = "success") {

    emptyState.style.display = "none";

    summaryText.textContent = message;
    summaryText.className = "summary-text";

    if (type === "error") {
        summaryText.classList.add("error");
    }

    if (type === "processing") {
        summaryText.classList.add("processing");
    }

    if (type === "success") {
        summaryText.classList.remove("error");
        summaryText.classList.remove("processing");
    }
}

/* =========================================
   LOADING STATE
========================================= */

function setLoading(isLoading) {

    summarizeButton.disabled = isLoading;

    summarizeButton.classList.toggle("loading", isLoading);

    if (isLoading) {
        buttonContent.style.display = "none";
        loader.style.display = "block";
    } else {
        buttonContent.style.display = "flex";
        loader.style.display = "none";
    }

    summarizeButton.setAttribute(
        "aria-busy",
        String(isLoading)
    );

    if (isLoading) {
        buttonContent.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2z"/>
                <path d="M19 3v4"/>
                <path d="M21 5h-4"/>
            </svg>
            Generating Summary...
        `;
    } else {
        buttonContent.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2z"/>
                <path d="M19 3v4"/>
                <path d="M21 5h-4"/>
            </svg>
            Summarize Text
        `;
    }
}

/* =========================================
   CLEAR INPUT AND OUTPUT
========================================= */

clearButton.addEventListener("click", () => {

    dialogueInput.value = "";
    characterCount.textContent = "0 characters";

    currentSummary = "";

    summaryText.textContent = "";
    summaryText.className = "summary-text";

    emptyState.style.display = "flex";

    copyButton.disabled = true;
    copyLabel.textContent = "Copy";

    dialogueInput.focus();
});

/* =========================================
   COPY SUMMARY
========================================= */

copyButton.addEventListener("click", async () => {

    if (!currentSummary) return;

    try {

        await navigator.clipboard.writeText(currentSummary);

        copyLabel.textContent = "Copied!";

        setTimeout(() => {
            copyLabel.textContent = "Copy";
        }, 2000);

    } catch (error) {

        // Fallback for clipboard restrictions
        const tempTextArea = document.createElement("textarea");

        tempTextArea.value = currentSummary;

        tempTextArea.style.position = "fixed";
        tempTextArea.style.opacity = "0";

        document.body.appendChild(tempTextArea);

        tempTextArea.select();

        try {
            document.execCommand("copy");
            copyLabel.textContent = "Copied!";
        } catch {
            copyLabel.textContent = "Copy failed";
        }

        tempTextArea.remove();

        setTimeout(() => {
            copyLabel.textContent = "Copy";
        }, 2000);
    }
});

/* =========================================
   FOOTER YEAR
========================================= */

document.getElementById("year").textContent =
    new Date().getFullYear();
