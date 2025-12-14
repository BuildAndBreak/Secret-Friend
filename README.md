# Secret Santa 🎅

Secret Santa is a full-stack web application that helps groups organize a Secret Santa exchange without the usual confusion.
It handles participants, exclusions, gift budget voting, wishlists, chat, and the final draw.

The goal of this project was to build something close to a real-world product, not just a demo or tutorial app.

## Table of contents

- [Overview](#overview)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Features](#features)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

## Overview

The organizer starts by creating a group and submitting their email address.
Before anything else happens, the organizer must confirm and validate the group through a verification email. This step ensures that only valid groups can continue.

Once the group is confirmed, each user receives an email with a button that takes them directly to their private page. This link gives access to their own Secret Santa page.

On their personal page, members can:

- See all participants in the group
- Vote on the gift price range
- Interact through a public group chat

After all members have voted, each participant can:

- choose to add up to three wishlist items. These wishes are visible only to the person who is assigned to give them a gift, which is especially helpful for groups where participants may not know each other very well.

- reveal their Secret Santa and see the wishlist of the person they are buying a gift for, making the exchange easier and more thoughtful.

### Screenshot

**Mobile Version**

![Mobile](./Frontend/public/screenshots/mobile-secretSanta.png)

**Laptop Version**

![Laptop](./Frontend/public/screenshots/laptop-secretSanta.png)

### Links

- Live Site URL: [Secret Santa](https://secret-santa-bnb.netlify.app/)

## My process

### Features

- Create a Secret Santa group with email verification
- Invite participants using secure tokens
- Optional organizer participation
- Exclusion rules (with validation to prevent impossible draws)
- Gift budget voting
- Public group chat
- Personal wishlist (up to 3 items per member)
- Final Secret Santa reveal
- Responsive layout (mobile-first)
- Accessibility-focused HTML and form semantics

### Built with

Frontend

- React (Vite)
- React Router
- Plain CSS (component-scoped)
- Semantic HTML + accessibility attributes

Backend

- Node.js
- Express
- MongoDB with Mongoose
- Brevo (Sendinblue) Transactional Email API
- NanoID / UUID for tokens

Tooling

-Concurrently
-Git & GitHub
-Environment variables

### What I learned

This project helped me revisit and deepen many of the concepts I learned during my full-stack bootcamp, especially around backend routing, frontend–backend communication, and state persistence.

Some key takeaways:

- Structuring backend routes in a scalable and maintainable way
- Coordinating state across frontend, backend, URL tokens, and localStorage
- Building resilient multi-step forms with draft recovery
- Designing validation logic that prevents impossible states (such as invalid exclusion combinations)
- Using secure, token-based access instead of traditional authentication
- Handling transactional emails through an external API rather than a local SMTP setup
- Making pragmatic architectural trade-offs based on project scope and complexity

### Continued development

- Improve error handling and user feedback across the app
- Add automated tests for both frontend and backend
- Explore real-time updates (e.g. WebSockets) instead of polling
- Improve performance and scalability

### Useful resources

- [MDN Web Docs](https://www.example.com) - Constant reference for HTML, CSS, and JS.
- [React Docs](https://www.example.com) - Official guidance for hooks and component patterns.
- [MongoDB Manual](https://www.mongodb.com/docs/manual/) – Reference for core MongoDB concepts and database operations.
- [Mongoose Docs](https://mongoosejs.com/docs/) – Used for schema design and data validation.

## Author

- Website - [Tiago Pereira](https://social-links-buildandbreak.netlify.app/)
- Frontend Mentor - [@BuildAndBreak](https://www.frontendmentor.io/profile/BuildAndBreak)
- Linkedin - [Tiago Pereira](https://www.linkedin.com/in/tiago-pereira-5a4698289/)
- Github - [@BuildAndBreak](https://github.com/BuildAndBreak)

## Acknowledgments

Thanks to [@WebDevSimplified](https://www.youtube.com/@WebDevSimplified) for clear explanations on frontend architecture and UI patterns.

Thanks to [@TraversyMedia](https://www.youtube.com/@TraversyMedia) for clear explanations of backend routing, REST APIs, and Express fundamentals.
