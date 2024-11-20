from langchain_community.chat_message_histories import ChatMessageHistory
from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi import HTTPException
from threading import Lock


class SessionStore:
    def __init__(self, expiration_time: timedelta = timedelta(hours=2)):
        self._store: Dict[str, Dict] = {}
        self._lock = Lock()
        self._expiration_time = expiration_time

    def get_session_history(self, session_id: str) -> Optional[ChatMessageHistory]:
        with self._lock:
            self._clean_expired_sessions()
            session = self._store.get(session_id)
            if session is None:
                return None
            session['last_accessed'] = datetime.now()
            print("Session ID in store:", session_id)
            return session['history']

    def create_session_history(self, session_id: str) -> ChatMessageHistory:
        with self._lock:
            print("Session ID in store:", session_id)
            if session_id in self._store:
                raise HTTPException(
                    status_code=400, detail="Session already exists")
            history = ChatMessageHistory()
            self._store[session_id] = {
                'history': history,
                'created_at': datetime.now(),
                'last_accessed': datetime.now()
            }
            return history

    def _clean_expired_sessions(self):
        now = datetime.now()
        expired = [
            sid for sid, session in self._store.items()
            if now - session['last_accessed'] > self._expiration_time
        ]
        for sid in expired:
            del self._store[sid]
