
# Summify - AI Text Summarizer

Summify is an AI-powered text summarization application
built using FastAPI and the T5 Transformer model.

It transforms long text into concise, meaningful summaries.

## Features

- AI-powered text summarization
- T5 Transformer model
- FastAPI backend
- Responsive frontend
- Copy summaries
- Local model inference

## Tech Stack

- Python
- FastAPI
- Hugging Face Transformers
- PyTorch
- HTML
- CSS
- JavaScript

## Project Structure

    Summifier_AI/
    ├── app.py
    ├── requirements.txt
    ├── templates/
    │   └── index.html
    ├── static/
    │   ├── style.css
    │   └── script.js
    └── saved_summary_model/
        └── Local model files (not included in Git)

## Installation

Clone the repository:

    git clone https://github.com/YOUR_USERNAME/Summifier-AI.git

Navigate into the project:

    cd Summifier-AI

Create a virtual environment:

    python -m venv venv

Activate it on Windows:

    venv\Scripts\activate

Install dependencies:

    pip install -r requirements.txt

## Model Setup

Place the trained T5 model files inside:

    saved_summary_model/

This directory is excluded from Git because model weights
may be large.

## Run the application

    uvicorn app:app --reload

Open:

    http://127.0.0.1:8000

## Author

Your Name

GitHub: https://github.com/shr-yan

LinkedIn: https://www.linkedin.com/in/shreyansh-pal-07si28sh/
