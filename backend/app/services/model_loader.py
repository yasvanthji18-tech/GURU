import logging
from typing import Optional, Dict, Any, List
from app.config import SUMMARIZER_MODEL_NAME, FLAN_MODEL_NAME, WHISPER_MODEL_NAME

logger = logging.getLogger("guru.model_loader")

class ModelLoaderService:
    def __init__(self):
        self._summarizer_pipeline = None
        self._flan_pipeline = None
        self._whisper_pipeline = None

    def get_summarizer(self):
        if self._summarizer_pipeline is None:
            try:
                from transformers import pipeline
                self._summarizer_pipeline = pipeline(
                    "summarization",
                    model=SUMMARIZER_MODEL_NAME,
                    tokenizer=SUMMARIZER_MODEL_NAME,
                    device=-1 # CPU
                )
                logger.info(f"Loaded HF summarizer model: {SUMMARIZER_MODEL_NAME}")
            except Exception as e:
                logger.warning(f"Could not load Hugging Face summarizer model '{SUMMARIZER_MODEL_NAME}': {e}. Using algorithmic fallback summarizer.")
                self._summarizer_pipeline = False
        return self._summarizer_pipeline if self._summarizer_pipeline else None

    def get_text_generator(self):
        if self._flan_pipeline is None:
            try:
                from transformers import pipeline
                self._flan_pipeline = pipeline(
                    "text2text-generation",
                    model=FLAN_MODEL_NAME,
                    tokenizer=FLAN_MODEL_NAME,
                    device=-1
                )
                logger.info(f"Loaded HF FLAN-T5 model: {FLAN_MODEL_NAME}")
            except Exception as e:
                logger.warning(f"Could not load Hugging Face instruction model '{FLAN_MODEL_NAME}': {e}. Using template AI generator fallback.")
                self._flan_pipeline = False
        return self._flan_pipeline if self._flan_pipeline else None

    def get_speech_recognizer(self):
        if self._whisper_pipeline is None:
            try:
                from transformers import pipeline
                self._whisper_pipeline = pipeline(
                    "automatic-speech-recognition",
                    model=WHISPER_MODEL_NAME,
                    device=-1
                )
                logger.info(f"Loaded HF Whisper model: {WHISPER_MODEL_NAME}")
            except Exception as e:
                logger.warning(f"Could not load Whisper speech model: {e}")
                self._whisper_pipeline = False
        return self._whisper_pipeline if self._whisper_pipeline else None

model_loader = ModelLoaderService()
