# API Reference

Base URL: `http://localhost:5000/api`

All endpoints require `Authorization: Bearer <token>` unless marked public.

---

## Auth

### POST `/auth/login` *(public)*
```json
Request:  { "email": "user@example.com", "password": "secret" }
Response: { "access_token": "...", "user_id": "...", "role": "patient" }
```

---

## Scores

### POST `/scores/`
Submit a risk score from the Android app after on-device inference.
```json
Request: {
  "user_id":      "uuid",
  "score":        0.72,
  "window_start": "2024-06-01T08:00:00",
  "window_end":   "2024-06-01T20:00:00"
}
Response 201: { "id": "uuid", "score": 0.72, "severity": "high", ... }
```

### GET `/scores/<user_id>?limit=30`
Returns paginated risk scores for a user ordered by most recent.

### GET `/scores/latest/<user_id>`
Returns the single most recent risk score entry.

---

## PHQ-9

### POST `/phq/`
Submit a weekly PHQ-9 questionnaire score.
```json
Request:  { "user_id": "uuid", "score": 14 }
Response: { "id": "uuid", "score": 14, "severity": "moderate", ... }
```

### GET `/phq/<user_id>?limit=10`
Returns PHQ-9 history ordered by most recent.

### GET `/phq/latest/<user_id>`
Returns the most recent PHQ-9 entry.

---

## Trends

### GET `/trends/<user_id>/weekly?weeks=8`
Returns weekly average risk scores.
```json
Response: [
  { "week_start": "2024-05-27", "week_end": "2024-06-03", "avg_score": 0.43, "sample_count": 7 },
  ...
]
```

### GET `/trends/<user_id>/phq-correlation`
Returns aligned PHQ-9 score and risk score per submission date.

### GET `/trends/<user_id>/feature-summary`
Returns 7-day behavioral feature summary including trend direction.

---

## Alerts

### GET `/alerts/<user_id>?unread_only=true`
Returns alerts for a user. Pass `unread_only=true` to filter.

### PATCH `/alerts/<alert_id>/read`
Marks a single alert as read.

### PATCH `/alerts/<user_id>/read-all`
Marks all alerts for a user as read.

### GET `/alerts/<user_id>/count`
Returns unread alert count.
```json
Response: { "unread_count": 3 }
```

---

## Error Responses

| Code | Meaning                          |
|------|----------------------------------|
| 400  | Bad request / validation error   |
| 401  | Missing or invalid JWT token     |
| 404  | Resource not found               |
| 500  | Internal server error            |

All errors return: `{ "error": "description" }`