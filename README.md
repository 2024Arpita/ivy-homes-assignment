# Ivy Homes - Real Estate Intelligence Platform

A React-based real estate application built for the Ivy Homes Software Engineering Internship Assignment.

The project focuses on two things:

1. Building a usable frontend on top of the Ivy Homes Property API.
2. Investigating the API and validating where its documented behaviour differs from the actual running service.

The main approach throughout the project was simple:

> Treat the running API as the source of truth and verify assumptions with actual data.

---

## Project Overview

The application provides an authenticated interface for exploring real estate listings, rentals, projects, saved properties, and investigation results.

The API investigation was performed alongside the frontend implementation. Instead of assuming that the API documentation was always correct, I tested important endpoints and parameters, collected the available datasets, and validated the results programmatically.

This helped identify issues around authentication, pagination, filtering, units, timestamps, data completeness, and data quality.

---

## Features

### Authentication

- Real Ivy Homes login flow
- Bearer-token authentication
- Persistent login session
- Logout support
- Invalid-login error handling
- User-specific saved listings

### Listings

- Browse property listings
- Search listings
- Locality filter
- Bedroom/BHK filter
- Price range filter
- Furnishing filter
- Live/inactive status filter
- Pagination
- Save/unsave listings

The frontend applies filtering where the corresponding API filter was found to be unreliable.

### Listing Details

Each listing has its own URL-based detail page.

Example:

```text
/listings/{listingId}

The detail page displays relevant property information such as:

Property name
Locality
Property type
Bedrooms
Bathrooms
Floor
Furnishing
Facing
Carpet area
Super built-up area
Price
Verification status
Posted information
Description
Original listing URL where available
Saved Listings

Users can:

Save listings
Remove listings
View saved listings
Keep saved listings associated with their account

Saved listings persist across page refreshes and re-login.

Rentals

The rental section provides:

Rental listings
Search
Locality filtering
Status filtering
Pagination
Rental price information
Area information
Projects

The projects section provides:

Builder projects
Project search
Project locality
Project pricing
Project area information
Pagination
Project/listing relationship information
Insights

The Insights section presents the results of the data investigation and the ten assignment questions.

It includes the calculated assignment answers and provides access to the API Trust Report containing the documented-vs-actual API behaviour discovered during the investigation.

API Trust Report

A separate report presents the API discrepancies in a human-readable format.

Each finding includes:

Endpoint
Category
Documented behaviour
Actual behaviour
How the behaviour was reproduced
Impact
Evidence identifiers where applicable
Tech Stack
Frontend
React
Vite
JavaScript
React Router
CSS
API
Ivy Homes REST API
Bearer-token authentication
REST-based data fetching
Data Investigation
Python
JSON data analysis
Programmatic API collection
Dataset validation
Development Tools
Git
GitHub
Antigravity IDE
OpenAI ChatGPT

LLM assistance was used during development and investigation, as allowed by the assignment.

Application Structure
src/
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── Layout.jsx
│   └── ErrorBoundary.jsx
│
├── pages/
│   ├── LoginPage.jsx
│   ├── ListingsPage.jsx
│   ├── ListingDetailPage.jsx
│   ├── RentalsPage.jsx
│   ├── ProjectsPage.jsx
│   ├── SavedListingsPage.jsx
│   ├── InsightsPage.jsx
│   ├── ApiTrustReportPage.jsx
│   └── NotFoundPage.jsx
│
├── services/
│   ├── api.js
│   └── auth.js
│
├── utils/
│   └── formatters.js
│
├── styles/
│   └── index.css
│
├── App.jsx
└── main.jsx
API Investigation

The API documentation was treated as a hypothesis rather than an unquestioned contract.

I first looked at the documented endpoints and then tested their behaviour against the live API.

The investigation focused on:

Authentication
Pagination
Filtering
Sorting
Timestamps
Units
Listing uniqueness
Duplicate physical properties
Project/listing relationships
Data completeness
Data quality
Suspicious/fake listings

The complete datasets were collected programmatically rather than manually inspecting records one by one.

Investigation Approach
1. Establish the Expected Behaviour

I started by reading the API documentation and identifying the important claims made by each endpoint.

For example:

How authentication should work
How pagination should work
Which filters should be supported
What units fields should use
How totals should behave
What timestamp format should be returned
2. Test the API Directly

I then tested the documented behaviour against the running API.

For example, when a documented filter was expected to restrict results, I sent the filter and checked whether the returned records actually satisfied it.

Similarly, pagination was tested using different limits, offsets, and page parameters.

3. Collect the Available Data

After identifying the actual pagination behaviour, I retrieved the available listings, rentals, and projects.

The data was then analyzed programmatically.

This allowed comparisons such as:

reported total
      vs
records actually retrievable

and:

reported project listing count
      vs
actual listings linked to the project
4. Validate Before Reporting

I only included a discrepancy after reproducing it against the running API.

This was particularly important for data-quality and fraud-related findings, where an unusual record by itself is not enough to establish a real problem.

Important API Findings

The investigation identified several differences between the documentation and the running API.

Authentication

The documentation described API-key authentication using a query parameter.

The running API instead requires the API key in the:

X-API-Key

request header.

Listings Pagination

The documented page-based pagination behaviour does not match the running API.

The page parameter is ignored and offset-based pagination is required.

Rental Pagination

The rental endpoint enforces a maximum response size of 50 records even when a larger limit is requested.

The response metadata and actual retrievable records also revealed a completeness discrepancy in the reported total.

Project Pagination

The projects endpoint similarly enforces a maximum response size of 50 records.

The reported total also differs from the number of unique project records that can actually be retrieved.

Listing Filters

The documented bedroom filter was found to be ignored by the API.

The documented is_live filter was also found to be ignored.

Because these filters are required to work correctly in the application, the frontend applies the necessary filtering logic itself.

Inactive Listings

The listings endpoint returns both live and inactive listings.

The application therefore explicitly handles listing status instead of assuming that every returned listing is active.

Area Units

Some MagicHomes records contain area values represented in square metres despite the documentation describing the area fields as square feet.

These records are normalized before performing price-per-square-foot calculations.

The conversion used is:

1 square metre = 10.7639 square feet
Timestamp Format

Sales listing timestamps were observed without the trailing UTC Z suffix, while rental timestamps include the suffix.

The application treats the actual API response format as authoritative.

Data Quality Investigation

The dataset was also checked for anomalies beyond documentation mismatches.

The investigation identified:

Corrupt listing records
A fake listing
Multiple listings representing the same physical property
Project/listing count inconsistencies
Area-unit inconsistencies

These findings are included in submission.json and presented in the API Trust Report.

Assignment Answers

The calculated answers for the assigned dataset are:

Question	Result
Total listing records	900
Unique physical properties	888
Active listings	723
Total monthly rent	INR 4,328,000
Average price/sqft for live 2BHK listings	INR 13,872.30
Costliest project	P60090
Costliest project price	INR 989,000,000
Listings in required seven-day period	37
Fake listing	MAG-6002941
Projects with incorrect listing count	375
Corrupt Listing IDs
100-6002071
MAG-6000453
MAG-6000527
MAG-6002834
SQU-6003044
Checks That Turned Out To Be Fine

I also tested behaviours that did not result in discrepancies.

Examples include:

Authentication works when the API key is supplied using the required header.
Locality filtering works.
Price sorting works.
Listing IDs are unique across the retrieved listings.
Rental IDs are unique across the retrieved rentals.
Project IDs are unique across the retrieved projects.
API responses expose useful pagination metadata such as limit, offset, count, total, and has_more.

These checks were kept separate from the actual findings so that the report did not treat every unexpected observation as an API problem.

Handling API Inconsistencies

One of the main design decisions was to separate the unreliable API behaviour from the user-facing application experience.

For example, if the backend accepts a filter but silently ignores it, the application does not simply pass that behaviour to the user.

Instead, the frontend applies the required filter to the retrieved data.

This approach was used for filters such as:

Bedroom
Price range
Furnishing
Locality
Live/inactive status

Similarly, area normalization is performed before price-per-square-foot calculations so that the displayed calculations are based on consistent units.

Authentication and Session Handling

The application uses the real authentication flow provided by the Ivy Homes API.

After successful login, the returned bearer token is persisted so that a page refresh does not immediately terminate the session.

Protected application functionality is available only after authentication.

Invalid credentials are handled with a user-facing error rather than leaving the application in a blank or broken state.

Saved Listings Design

Saved listings are associated with the logged-in user rather than being treated as one global list.

This ensures that:

User A -> User A's saved listings

User B -> User B's saved listings

The saved state is persisted so that it remains available after refreshing the application and after logging out and logging back in.

Setup
Prerequisites
Node.js
npm
Clone the Repository
git clone https://github.com/2024Arpita/ivy-homes-assignment.git
cd ivy-homes-assignment
Install Dependencies
npm install
Environment Variables

Create a .env file containing the required API configuration:

API_BASE_URL=your_api_base_url
API_KEY=your_api_key
API_PASSWORD=your_api_password

Do not commit the .env file.

Run Locally
npm run dev

The application will be available through the local Vite development server.

Production Build
npm run build

The production build is generated in:

dist/
Deployment

The application is deployed using Vercel.

Live Application

https://ivy-homes-assignment-pi.vercel.app

The Vercel deployment is connected to the GitHub repository and uses the Vite production build.

Security

Sensitive local configuration is stored through environment variables.

The following files are excluded from Git:

.env
node_modules/
dist/

API passwords and local credentials are not included in the repository.

What I Would Improve With Another Two Days

If I had another two days, I would focus primarily on reliability and maintainability rather than adding a large number of new UI features.

1. Automated API Contract Tests

I would create automated checks for:

Pagination behaviour
Filters
Sorting
Authentication
Timestamp formats
Units
Response metadata
Endpoint availability

This would make it possible to rerun the API investigation automatically.

2. Automated Data Validation

I would turn the data-quality investigation into a reusable validation pipeline that checks:

Duplicate physical properties
Corrupt records
Suspicious listings
Unit inconsistencies
Project/listing relationships
Missing or inconsistent fields
3. Better Backend Separation

For a production version, I would place privileged API configuration behind a backend/serverless layer rather than relying on direct browser-to-API communication.

This would provide better control over credentials, request validation, and rate limiting.

4. Automated Frontend Tests

I would add tests for:

Login
Session persistence
Listing filters
Pagination
Saved listings
Listing detail routes
Data normalization
5. Improved Analytics

I would expand the insights experience with additional visual analysis of:

Locality distribution
BHK distribution
Price distribution
Price per square foot
Inventory quality
API/data-quality findings
LLM Usage Disclosure

OpenAI ChatGPT was used as an LLM-assisted development and investigation tool.

It was used for:

Exploring investigation hypotheses
Reasoning about API behaviour
Assisting with implementation
Debugging
Reviewing implementation decisions
Structuring documentation

The API findings and calculated answers were validated against the running API and retrieved datasets before being included in the final submission.

The LLM was used as an assistant rather than as a substitute for validating the actual API behaviour.

Repository

GitHub:

https://github.com/2024Arpita/ivy-homes-assignment

Live Demo:

https://ivy-homes-assignment-pi.vercel.app
