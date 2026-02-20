import os
from app.core.config import settings

class LocalStorageProvider:
    def __init__(self):
        self.base = settings.LOCAL_STORAGE_PATH
        os.makedirs(self.base, exist_ok=True)

    def _fullpath(self, key: str) -> str:
        key = key.lstrip("/")
        return os.path.join(self.base, key)

    def put_bytes(self, key: str, data: bytes, content_type: str) -> str:
        path = self._fullpath(key)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            f.write(data)
        return f"local://{key}"

    def get_bytes(self, uri: str) -> bytes:
        if not uri.startswith("local://"):
            raise ValueError("Unsupported URI")
        key = uri.replace("local://", "", 1)
        path = self._fullpath(key)
        with open(path, "rb") as f:
            return f.read()