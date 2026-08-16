# Gauntlet API

REST API for [Gauntlet](https://github.com/arham-a/gauntlet-web) — a platform for hosting and running competitions.

Express 4 · MongoDB (Mongoose 6) · JWT auth · Cloudinary for uploads · Nodemailer

---

## Running locally

```bash
npm install
cp .env.example .env    # then fill in the values
node index.js           # http://localhost:5000
```

A local MongoDB via Docker is the easiest way to get started:

```bash
docker run -d --name gauntlet-mongo -p 27017:27017 \
  -v gauntlet-mongo-data:/data/db mongo:7
```

Check it came up with `GET /healthz`, which reports both server and database status.

---

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | yes | Read by `index.js` for the actual connection |
| `MONGO_URI` | yes | Read by `constants/index.js` — **keep in sync with `MONGODB_URI`** |
| `JWT_SECRET` | yes | Falls back to an unsafe default if unset |
| `PORT` | no | Defaults to 5000 |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | no | Required for payment slips, ZIP submissions, and profile pictures |
| `EMAIL_USER` / `EMAIL_PASS` | no | Required for approval notification emails |

The two Mongo variables are a known wart: two modules read different names. Both must be set to the same value.

---

## Routes

### `/auth`
| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/register` | Create an account. Requires `username`, `email`, `password` |
| POST | `/login` | Authenticate by **`username`** (not email) and `password` |
| GET | `/refresh` | Refresh session — requires `Authorization: Bearer <token>` |
| GET | `/user/:uid` | Public details for one user |

### `/comp`
| Method | Path | Purpose |
| --- | --- | --- |
| GET / POST | `/type` | List or create competition categories (field: `compTypeName`) |
| GET / POST | `/` | List all competitions, or create one |
| GET | `/:id` | Full competition detail |
| GET | `/user/:userId` | Competitions created by a user |
| PATCH | `/:id/participants` | Add a participant |
| DELETE | `/:id/participants` | Remove a participant |
| POST | `/:id/register` | Apply, with optional `paymentSlip` upload |
| GET | `/:id/registrations` | Pending applications |
| POST | `/:id/approve` | Approve an applicant and email them |
| POST / GET | `/:id/submissions` | Submit a `zipFile`, or list submissions |
| PATCH | `/:id/submissions/points` | Score a submission |
| GET | `/:id/participants/leaderboard` | Participants ranked by points |
| GET / POST | `/:id/announcements` | Read or post announcements |
| PATCH | `/:id/points` | Update total points |

### `/user`
| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/:userId/stats` | Joined count, created count, total points |
| GET | `/:userId/myJoinComp` | Competitions joined |
| GET | `/:userId/myCreatedComp` | Competitions created |
| POST | `/:userId/:compId/myJoinComp` | Link a joined competition |
| POST | `/:userId/:compId/myCreatedComp` | Link a created competition |

### `/setting`
All take `userID` (capital `ID`) in the body.

| Method | Path | Purpose |
| --- | --- | --- |
| PUT | `/update-user` | Update `name` and `language` |
| PUT | `/update-pass` | Change password (`currentPassword`, `newPassword`) |
| PUT | `/update-subs` | Set subscription tier |
| PUT | `/update-api-keys` | Store `chatGPT` / `gemini` keys |
| PUT | `/profile-picture` | Upload `profilePicture` — needs Cloudinary |

`update-subs`, `update-api-keys` and the API-key fields are carried over from the codebase this was forked from and are not used by the web client.

---

## Deployment

Deployed on Vercel via `vercel.json` (`@vercel/node` on `index.js`, all methods routed to it).

If the database is hosted on MongoDB Atlas, add `0.0.0.0/0` under **Network Access** — Vercel's functions use dynamic IPs, and without it every query fails with a buffering timeout while the server still returns 200.
