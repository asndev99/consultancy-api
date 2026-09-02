


INSERT INTO "Business" (
  "businessCode",
  "studentSequence",
  "timeZone",
  "name",
  "isActive",
  "isDeleted",
  "address",
  "businessLogo",
  "googleMapUrl",
  "createdBy",
  "createdAt",
  "updatedAt"
) VALUES (
  'BUS-0001',
  0,
  'Asia/Karachi',
  'Acme Consultancy',
  true,
  false,
  '123 Main Street, Karachi',
  'https://example.com/logo.png',
  '',
  1,
  now(),
  now()
);

INSERT INTO "Branch" (
  "name", "branchCode", "businessId", "city", "country",
  "address", "latitude", "longitude", "isActive", "isDeleted",
  "createdBy", "createdAt", "updatedAt"
) VALUES (
  'Main Branch',
  'BR-0001',
  (SELECT id FROM "Business" WHERE "businessCode" = 'BUS-0001'),
  'Karachi',
  'Pakistan',
  '456 Business Avenue, Karachi',
  24.8607,
  67.0011,
  true,
  false,
  1,
  now(),
  now()
);



INSERT INTO "User" (
    "userNo",
    "role",
    "status",
    "name",
    "email",
    "password",
    "businessId",
    "branchId",
    "isEmailVerified",
    "isActive",
    "isDeleted",
    "createdBy",
    "createdAt",
    "updatedAt"
) 
VALUES (
    'EMP-001',             -- userNo
    'Business Admin',      -- role
    'ACTIVE',              -- status (adjust based on your shared constants)
    'John Doe',            -- name
    'admin@example.com',   -- email
    NULL,                  -- password (left empty/NULL)
    NULL,                  -- businessId
    NULL,                  -- branchId
    TRUE,                 -- isEmailVerified
    TRUE,                  -- isActive
    FALSE,                 -- isDeleted
    1,                     -- createdBy (ID of the user creating this record)
    NOW(),                 -- createdAt
    NOW()                  -- updatedAt
)
RETURNING *;

-- 12345678
-- $2b$10$YLuwbYRRbW62SjIWVbp7M.Qw8FfA.TMnWuQHvWYdeyLOX8I0N1H9y