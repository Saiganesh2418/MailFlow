MailFlow — Product Requirements Document

Product: MailFlow
Tagline: Smarter Emails. Seamless Flow.
Type: AI-Powered Email Campaign Platform
Version: 1.0 MVP
Status: Product Specification

---

1. Product Overview

MailFlow is a web-based email campaign platform that allows users to upload contacts, create professional emails, personalize messages, preview campaigns, and send emails through a configured email delivery provider.

MailFlow will also use AI to help users generate and improve email content.

Core Value Proposition

«Create once. Personalize automatically. Send professionally.»

---

2. Problem Statement

Sending personalized emails to many recipients manually is slow and repetitive.

Users often need to:

- Copy and paste recipient information
- Create the same email repeatedly
- Maintain contact lists manually
- Design HTML emails
- Track campaign results
- Rewrite emails professionally

MailFlow brings these tasks into one simple workflow.

---

3. Target Users

Primary Users

- Students
- Colleges and student communities
- Internship coordinators
- Event organizers
- Small businesses
- Startup teams
- Community managers

Example Use Cases

- Internship congratulations
- Event invitations
- Hackathon announcements
- Certificate distribution
- Community announcements
- Customer newsletters
- Marketing campaigns

---

4. Goals

MVP Goals

1. Upload contacts using CSV.
2. Create an email campaign.
3. Personalize emails using variables.
4. Preview emails before sending.
5. Send test emails.
6. Send campaigns through an email provider.
7. Display campaign results.
8. Generate email content using AI.

Future Goals

- Email scheduling
- Advanced analytics
- Templates
- Contact segmentation
- Campaign history
- A/B testing
- Automated campaigns
- Team collaboration

---

5. Core Features

5.1 Dashboard

The dashboard displays:

- Total campaigns
- Emails sent
- Successful emails
- Failed emails
- Recent campaigns
- Quick action to create a campaign

---

5.2 Contact Management

Users can upload a CSV file containing contacts.

Example:

name| email| company
Rahul| rahul@example.com| ABC
Priya| priya@example.com| XYZ

Supported personalization variables:

"{{name}}"

"{{email}}"

"{{company}}"

The system validates email addresses before sending.

---

5.3 Campaign Creation

Users can create a campaign with:

- Campaign name
- Sender name
- Subject
- Email body
- Contact list
- Email template

Example:

Subject:

Congratulations, {{name}}!

Body:

Hello {{name}},

Congratulations on successfully completing your internship at {{company}}.

We appreciate your contribution and wish you success in your future journey.

Best regards,
MailFlow Team

---

5.4 AI Email Assistant

Users can provide a simple instruction:

«Write a professional internship completion email.»

AI generates a draft.

Users can also request:

- Make it more professional
- Make it shorter
- Make it friendly
- Fix grammar
- Improve subject line
- Generate multiple versions

AI output must remain editable before sending.

---

5.5 Email Preview

Before sending, users can preview:

- Desktop version
- Mobile-friendly version
- Personalized recipient version

Example:

«Preview for Rahul»

The system replaces:

"{{name}}"

with:

"Rahul"

---

5.6 Test Email

Users can enter their own email address and send a test version.

The test email should clearly indicate that it is a preview/test.

---

5.7 Campaign Sending

After confirmation:

1. Validate contacts.
2. Generate personalized emails.
3. Queue emails.
4. Send through configured email provider.
5. Record delivery status.
6. Display campaign progress.

Possible statuses:

- Pending
- Sent
- Failed

---

5.8 Campaign Analytics

The MVP should display:

- Total recipients
- Sent
- Failed
- Pending

Future versions may include:

- Opens
- Clicks
- Unsubscribes
- Bounce rate

---

6. User Flow

Login
  ↓
Dashboard
  ↓
Create Campaign
  ↓
Upload Contacts
  ↓
Write / Generate Email
  ↓
Personalize
  ↓
Preview
  ↓
Send Test
  ↓
Confirm Campaign
  ↓
Send
  ↓
Campaign Results

---

7. Authentication

Users should be able to:

- Sign up
- Log in
- Log out
- Reset password

User-specific campaigns and contacts must not be accessible to other users.

---

8. Data Model

Users

- id
- name
- email
- created_at

Contacts

- id
- user_id
- name
- email
- company
- created_at

Campaigns

- id
- user_id
- name
- subject
- body
- status
- created_at

Campaign Recipients

- id
- campaign_id
- contact_id
- email
- status
- error_message
- sent_at

---

9. Recommended Technology Stack

Frontend
any thing but make it easy to use and understand 

- React
- TypeScript
- Tailwind CSS

Backend
use easy and dont use unwantad node file only limated node file

- Node.js
- API routes / server functions

Database

- SQL Workbench 
- Supabase 
user can enter any thing 

AI

- AI API

Email Delivery

Use a transactional email provider such as:

- Resend
- SendGrid
- Mailgun
- Amazon SES
-smpt will can also use 
The provider should be responsible for actual email delivery.

---

10. Security Requirements

Never expose:

- API keys
- SMTP passwords
- AI API keys
- Email provider credentials

Secrets must be stored in server-side environment variables.
imp env.
any thing will use for api so add this things 
1. SMPT
2. Supabase
3. SQL workbanch
4. JWT tokan 
5. Google API 
6.  etc

Example:

EMAIL_API_KEY=...
AI_API_KEY=...

These must never be committed to GitHub.

---

11. Abuse Prevention

MailFlow must not be designed for spam.

The platform should include:

- Sending limits
- Email validation
- User authentication
- Campaign confirmation
- Unsubscribe support for marketing campaigns
- Provider rate limits
- Basic abuse monitoring

Users should only send emails to recipients they are authorized to contact.

---

12. MVP Success Criteria

The MVP is successful when a user can:

1. Create an account.
2. Upload a CSV.
3. Create an email.
4. Use personalization variables.
5. Generate content with AI.
6. Preview the campaign.
7. Send a test email.
8. Send a campaign through a configured provider.
9. View sent/failed results.

---

13. Future Roadmap

Version 1.1

- Email templates
- Campaign duplication
- Scheduling
- Better analytics

Version 2.0

- Contact segmentation
- A/B testing
- Automated workflows
- Advanced analytics

Version 3.0

- Team collaboration
- Multiple sender identities
- Marketing automation
- Enterprise features

---

14. Product Principle

MailFlow should remain:

Simple → Fast → Professional → Safe

The goal is not to become the biggest email platform.

The goal is to make sending personalized email campaigns dramatically easier.

23. IMP Points 
 1. use Backend not server 
 2. use Frontend not Clint 
 3. no unwanted Node moulde 
 4. no over engneering 
 5. NO Heavy Codeing Only Baseic and clere all the requiment 
 6. use NMP Only NO other unwanted file other file 
 7. make it minimal and full working Mailflow 
