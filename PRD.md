# Product Requirements Document (PRD): Beacon

## 1. Overview
**Project Name:** Beacon

**Purpose:** A centralized Telegram-based communication system designed to bridge the gap between the College Student Committee (CSC) and individual House Chats. Beacon streamlines outreach, announcements, and feedback collection while maintaining a standardized message flow.

## 2. Value Proposition & Selling Points
- **Centralized Communication, Decentralized Outreach:** Allows the CSC to broadcast messages from a single central interface while reaching students directly where they are—in their individual, decentralized House Chats.
- **Stronger Coordination:** Enhances alignment, transparency, and communication efficiency between the central CSC and the various Houses.
- **Standardized Message Flow:** Ensures that announcements, infographics, and polls are delivered consistently and professionally across all channels without manual forwarding or formatting errors.

## 3. Core Features
1. **House Chat Integration:** The Beacon Telegram bot (telebot) can be seamlessly invited into and configured for existing House Chats.
2. **Announcement Broadcasting:** The CSC can send text-based announcements and rich media (infographics) directly to all or selected House Chats via the bot.
3. **Interest-Check Polls:** The CSC has the ability to deploy "interest-check" polls to gauge student engagement, event interest, and opinions.
4. **Automated Response Collation:** The bot automatically gathers, collates, and summarizes poll responses across all participating House Chats, providing actionable insights back to the CSC without requiring manual tallying.

## 4. Technical Architecture & Implementation Flow
### 4.1 Interface & Client
- **CSC Interface:** A small-scale, intuitive web dashboard or interface tailored for the CSC to compose messages, upload media, create polls, and trigger broadcasts to the bot.
- **Client-Side Bot:** A Telegram bot instance that handles user interactions, webhook events, message routing to mapped House Chats, and processing of incoming poll interactions.

### 4.2 Backend & Storage
- **Application Deployment:** The backend service powering the bot and CSC interface will be run on `localhost` (for local development/testing) or deployed via **Firebase**.
- **Media Storage:** An object storage service such as **AWS S3** (or equivalent like Firebase Storage/Cloudflare R2) will be utilized for hosting and serving uploaded images and infographics.
- **Database (Messaging & Data Logging):** 
  - **Firebase** or **Supabase** will be used to persist outgoing message logs, house chat ID mappings, and collated poll responses.

## 5. Future Considerations & Enhancements
- **Role-Based Access Control (RBAC):** For the CSC Interface to ensure only authorized committee members can draft or send broadcasts.
- **Message Scheduling:** Allowing the CSC to prepare announcements and polls in advance and schedule them for automatic deployment at optimal times.
- **Engagement Analytics:** Tracking metrics such as poll participation rates and link click-throughs to measure the effectiveness of CSC outreach.
