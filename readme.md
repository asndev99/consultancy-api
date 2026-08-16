No need to install dotenv package

node --env-file=.env app.js
node --env-file=.env --env-file=.env.development app.


Logger
-Winston for application level logging and writing streams to winston(optional)
-Morgan for request level logging.

Practical rule of thumb:
If you control a single backend and want easy logout/revocation → sessions.
If you have multiple services or need stateless auth across domains → JWT, but plan for revocation (short expiry + refresh tokens is the common pattern).
