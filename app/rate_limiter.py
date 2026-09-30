from collections import defaultdict, deque
from dataclasses import dataclass
from math import ceil
from threading import Lock
from time import monotonic


@dataclass(frozen=True)
class LimitResult:
    allowed: bool
    retry_after: int = 0


@dataclass
class TokenBucketState:
    tokens: float
    updated_at: float
    last_seen: float


class InMemoryRateLimiter:
    def __init__(self) -> None:
        self._lock = Lock()
        self._windows: dict[str, deque[float]] = defaultdict(deque)
        self._window_last_seen: dict[str, float] = {}
        self._buckets: dict[str, TokenBucketState] = {}
        self._operations = 0

    def sliding_window(
        self,
        key: str,
        limit: int,
        window_seconds: float,
    ) -> LimitResult:
        now = monotonic()

        with self._lock:
            timestamps = self._windows[key]
            cutoff = now - window_seconds

            while timestamps and timestamps[0] <= cutoff:
                timestamps.popleft()

            self._window_last_seen[key] = now

            if len(timestamps) >= limit:
                retry_after = max(
                    1,
                    ceil(timestamps[0] + window_seconds - now),
                )
                self._maybe_cleanup(now)
                return LimitResult(
                    allowed=False,
                    retry_after=retry_after,
                )

            timestamps.append(now)
            self._maybe_cleanup(now)
            return LimitResult(allowed=True)

    def token_bucket(
        self,
        key: str,
        capacity: int,
        refill_tokens: float,
        refill_period_seconds: float,
    ) -> LimitResult:
        now = monotonic()
        refill_rate = refill_tokens / refill_period_seconds

        with self._lock:
            state = self._buckets.get(key)

            if state is None:
                state = TokenBucketState(
                    tokens=float(capacity),
                    updated_at=now,
                    last_seen=now,
                )
                self._buckets[key] = state
            else:
                elapsed = max(0.0, now - state.updated_at)
                state.tokens = min(
                    float(capacity),
                    state.tokens + elapsed * refill_rate,
                )
                state.updated_at = now
                state.last_seen = now

            if state.tokens < 1.0:
                retry_after = max(
                    1,
                    ceil((1.0 - state.tokens) / refill_rate),
                )
                self._maybe_cleanup(now)
                return LimitResult(
                    allowed=False,
                    retry_after=retry_after,
                )

            state.tokens -= 1.0
            self._maybe_cleanup(now)
            return LimitResult(allowed=True)

    def _maybe_cleanup(self, now: float) -> None:
        self._operations += 1

        if self._operations < 1000:
            return

        self._operations = 0
        stale_before = now - 3600

        stale_windows = [
            key
            for key, last_seen in self._window_last_seen.items()
            if last_seen < stale_before
        ]
        for key in stale_windows:
            self._windows.pop(key, None)
            self._window_last_seen.pop(key, None)

        stale_buckets = [
            key
            for key, state in self._buckets.items()
            if state.last_seen < stale_before
        ]
        for key in stale_buckets:
            self._buckets.pop(key, None)


rate_limiter = InMemoryRateLimiter()