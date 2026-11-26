
from fastapi import FastAPI, Request
from pydantic import BaseModel
from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch
import re

from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

# Initialize FastAPI
app = FastAPI(
    title="Summifier App",
    description="Text summarization using T5",
    version="1.0"
)

# Serve CSS and JavaScript from the static folder
app.mount("/static", StaticFiles(directory="static"), name="static")

# Model and Tokenizer
tokenizer = T5Tokenizer.from_pretrained("./saved_summary_model")
model = T5ForConditionalGeneration.from_pretrained("./saved_summary_model")

# Device
if torch.backends.mps.is_available():
    device = torch.device("mps")
elif torch.cuda.is_available():
    device = torch.device("cuda")
else:
    device = torch.device("cpu")

model.to(device)

# Templates
templates = Jinja2Templates(directory="templates")


# Input schema
class DialogueInput(BaseModel):
    dialogue: str


# Cleaning function
def clean_data(text):
    text = re.sub(r"\r\n", " ", text)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"<.*?>", " ", text)
    text = text.strip().lower()
    return text


# Summarization function
def summarize_dialogue(dialogue: str) -> str:

    dialogue = clean_data(dialogue)
    dialogue = "summarize: " + dialogue

    inputs = tokenizer(
        dialogue,
        padding="max_length",
        max_length=512,
        truncation=True,
        return_tensors="pt"
    ).to(device)

    targets = model.generate(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        max_length=150,
        num_beams=4,
        early_stopping=True
    )

    summary = tokenizer.decode(
        targets[0],
        skip_special_tokens=True
    )

    if summary:
        summary = summary[0].upper() + summary[1:]
        if not summary.endswith("."):
            summary += "."

    return summary


# API endpoint
@app.post("/summarize/")
async def summarize(dialogue_input: DialogueInput):

    summary = summarize_dialogue(dialogue_input.dialogue)

    return {"summary": summary}


# Home page
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )


# Run locally
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )
