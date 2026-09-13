# Ivy Homes — Real Estate Intelligence Platform

A full-stack real estate application built for the Ivy Homes Software Engineering Internship assignment.

The application provides authenticated property browsing, filtering, saved listings, rental/project discovery, and an insights section backed by investigation of the provided API.

## Features

- User login with persistent authentication
- Property listings with:
  - Locality filter
  - Bedroom filter
  - Furnishing filter
  - Price range filter
  - Search
  - Sorting and pagination
- Listing detail pages with URL-based navigation
- Save/unsave listings per user
- Rentals browsing
- Projects browsing
- Assignment insights and API trust report
- Responsive UI

## Tech Stack

- React.js
- Vite
- JavaScript
- CSS
- REST APIs
- Vercel for deployment

## How to Run

### 1. Install dependencies
npm install

2. Configure environment variables
Create a .env file:

API_BASE_URL=<provided API base URL>
API_KEY=<provided API key>
API_PASSWORD=<provided password>

The .env file is excluded from Git using .gitignore.

3. Start the application
npm run dev

For a production build:
npm run build

## API Investigation
The provided API documentation was treated as a starting point rather than as guaranteed truth.
I tested the API behaviour directly and compared documented behaviour with actual responses. The investigation focused on:
Authentication
Pagination
Filtering
Sorting
Timestamps
Units
Duplicate records
Data completeness
Data quality
Cross-resource consistency
When documented behaviour differed from the actual API, the implementation was based on the observed API behaviour.

## Important Findings

Some of the main discrepancies discovered were:
Area	Finding
Authentication	API key is required through the X-API-Key header
Listings pagination	offset is used; documented page behaviour does not work as expected
Rentals pagination	Results are capped at 50 per request
Projects pagination	Results are capped at 50 per request
Listings filters	Some documented filters such as bedroom and is_live are not reliably applied by the API
Area units	Some MagicHomes area values are represented in square metres
Timestamps	Some sales posted_at timestamps omit the Z suffix
Project consistency	Project listing counts do not consistently match linked listings
Data quality	Several corrupt and fake listing records were identified

A more detailed investigation is available in the API Trust Report section of the application.

## Assignment Answers

Total listing records: 900
Unique physical properties: 888
Active listings: 723
Corrupt listing IDs:
100-6002071
MAG-6000453
MAG-6000527
MAG-6002834
SQU-6003044
Total monthly rent in Sector 49: INR 4,328,000
Average price/sqft for live 2BHK listings: INR 13,872.30
Costliest project: P60090 — Puravankara Willows — INR 989,000,000
Listings posted during the specified date range: 37
Fake listing ID: MAG-6002941
Projects with incorrect listing counts: 375
Checks That Turned Out Fine

The investigation also verified several behaviours successfully:

Listing IDs are unique.
Rental IDs are unique.
Project IDs are unique.
Locality filtering works.
Price sorting works.
Authentication using the required API-key header works.
Listing detail records can be retrieved using their IDs.
Data Handling Decisions

Where the API returned unreliable data, I avoided silently treating it as correct.

For example:

Client-side filtering is used where the API's documented filter behaviour was unreliable.
MagicHomes area values that were identified as square metres were normalized to square feet where required.
Corrupt/fake records were excluded from calculations where the assignment specifically required their exclusion.
API inconsistencies are documented rather than hidden from the user.

## If I Had Two More Days

I would focus on:

Adding automated API regression tests for the discovered behaviours.
Improving caching and request handling.
Adding more detailed analytics to the insights screen.
Improving frontend loading/error states.
Further investigating project/listing relationship inconsistencies.

## LLM Usage

I used an LLM (ChatGPT) during development for assistance with API investigation, debugging, implementation ideas, documentation, and reviewing potential edge cases.

API behaviour and assignment results were independently tested against the provided API rather than being accepted solely from the LLM.

## Links

GitHub:
https://github.com/2024Arpita/ivy-homes-assignment

Live Demo:
https://ivy-homes-assignment-pi.vercel.app


