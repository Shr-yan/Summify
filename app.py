
import re
import torch

from fastapi import FastAPI, Request
from pydantic import BaseModel
from transformers import T5ForConditionalGeneration, T5Tokenizer
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

# Reduce CPU thread overhead on small hosting instances
torch.set_num_threads(1)

# Initialize FastAPI
app = FastAPI(
    title="Summify",
    description="Text summarization using T5",
    version="1.0"
)

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Hugging Face Model
MODEL_ID = "Shr-yan/Summify"

tokenizer = T5Tokenizer.from_pretrained(MODEL_ID)

model = T5ForConditionalGeneration.from_pretrained(
    MODEL_ID,
    use_safetensors=True
)

# CPU deployment
device = torch.device("cpu")
model.to(device)
model.eval()

# Templates
templates = Jinja2Templates(directory="templates")


# Input schema
class DialogueInput(BaseModel):
    dialogue: str


# Cleaning function
def clean_data(text: str) -> str:
    text = re.sub(r"\r\n|\r|\n", " ", text)
    text = re.sub(r"<.*?>", " ", text)
    text = re.sub(r"\s+", " ", text)
    text = text.strip()
    return text


# Summarization function
def summarize_dialogue(dialogue: str) -> str:

    dialogue = clean_data(dialogue)
    dialogue = "summarize: " + dialogue

    inputs = tokenizer(
        dialogue,
        max_length=512,
        truncation=True,
        return_tensors="pt"
    ).to(device)

    with torch.inference_mode():
        targets = model.generate(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_length=150,
            num_beams=2,
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


# Summarization API
@app.post("/summarize/")
async def summarize(dialogue_input: DialogueInput):

    summary = summarize_dialogue(dialogue_input.dialogue)

    return {"summary": summary}


# Homepage
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )


# Local execution
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )
