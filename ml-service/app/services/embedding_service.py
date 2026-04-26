import hashlib
from typing import Optional

import numpy as np
from sentence_transformers import SentenceTransformer

from app.core.logging import get_logger
from app.core.config import get_settings
from app.utils.preprocessing import normalize_text


logger = get_logger(__name__)


class EmbeddingService:
    def __init__(self) -> None:
        self._model: Optional[SentenceTransformer] = None
        self._model_name = get_settings().embedding_model_name

    def _load_model(self) -> Optional[SentenceTransformer]:
        if self._model is None:
            try:
                self._model = SentenceTransformer(self._model_name)
            except Exception as exc:
                logger.warning("Embedding model load failed, using fallback embeddings: %s", exc)
                self._model = None
        return self._model

    @staticmethod
    def _fallback_embedding(text: str, dim: int = 384) -> list[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        values = [((byte / 255.0) * 2.0) - 1.0 for byte in digest]
        repeated = (values * ((dim // len(values)) + 1))[:dim]
        return repeated

    def embed_text(self, text: str) -> list[float]:
        cleaned = normalize_text(text)
        if not cleaned:
            return []

        model = self._load_model()
        if model is None:
            return self._fallback_embedding(cleaned)

        try:
            vector = model.encode(cleaned, normalize_embeddings=True)
            if isinstance(vector, np.ndarray):
                return vector.astype(float).tolist()
            return list(vector)
        except Exception as exc:
            logger.warning("Embedding generation failed, using fallback embeddings: %s", exc)
            return self._fallback_embedding(cleaned)

    def cosine_similarity(self, text_a: str, text_b: str) -> float:
        vec_a = self.embed_text(text_a)
        vec_b = self.embed_text(text_b)
        if not vec_a or not vec_b:
            return 0.0

        arr_a = np.array(vec_a, dtype=float)
        arr_b = np.array(vec_b, dtype=float)

        denom = float(np.linalg.norm(arr_a) * np.linalg.norm(arr_b))
        if denom == 0:
            return 0.0

        return float(np.dot(arr_a, arr_b) / denom)
