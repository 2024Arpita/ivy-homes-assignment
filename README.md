# Ivy Homes — Real Estate Intelligence Platform

A full-stack real estate intelligence application built for the Ivy Homes Software Engineering Internship Assignment.

The project has two complementary goals:

- Build a reliable frontend on top of the Ivy Homes Property API.
- Investigate the API empirically and identify where the provided documentation differs from the behaviour of the running service.

The core principle throughout the implementation was:

> **Treat the running API as the source of truth, not the documentation.**

---

## Overview

The application provides an authenticated interface for exploring property listings, rentals, projects, saved listings, and analytical insights.

Alongside the frontend, I investigated the API behaviour by retrieving the available datasets, testing documented parameters, validating response metadata, checking data relationships, and looking for data-quality anomalies.

### Key areas covered

- Real authentication and persistent sessions
- Property listing discovery and filtering
- Listing detail pages
- User-specific saved listings
- Rental listings
- Builder projects
- Assignment insights
- API trust/discrepancy report
- Data-quality investigation
- Reproducible answers to all ten assignment questions

---

# Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- React Router

### Backend / Data

- Ivy Homes REST API
- Bearer-token authentication
- Client-side filtering where the API does not reliably enforce documented filters

### Investigation

- Python
- JSON-based dataset analysis
- Custom scripts for API collection, validation and investigation

### Development

- Git
- GitHub
- Antigravity IDE
- OpenAI ChatGPT for LLM-assisted development and reasoning

LLM assistance was used during development and investigation, as permitted by the assignment.

---

# Features

## 1. Authentication

The application uses the real Ivy Homes authentication flow.

- Login with demo credentials
- Bearer access-token authentication
- Persistent session across page refreshes
- Logout support
- User-specific saved listings
- Graceful handling of invalid credentials and API errors

The authentication implementation follows the behaviour of the running API rather than relying solely on the provided documentation.

---

## 2. Browse Listings

The listings page provides:

- Search
- Locality filtering
- Bedroom filtering
- Price range filtering
- Furnishing filtering
- Live/inactive status filtering
- Pagination
- Save/unsave actions

The assignment requires the filters to actually filter the displayed results, regardless of whether the server provides working support for them.

Because investigation showed that some documented API filters are silently ignored, affected filtering is handled on the frontend to ensure the user-facing behaviour remains correct.

---

## 3. Listing Details

Each listing has its own URL-based detail page.

The detail view displays the available property information, including:

- Property name
- Locality
- Property type
- Bedrooms
- Bathrooms
- Floor information
- Furnishing
- Facing direction
- Carpet area
- Super built-up area
- Price
- Verification status
- Posted information
- Description
- Original listing link where available

Example route:

```text
/listings/{listingId}
