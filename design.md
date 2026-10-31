MailFlow — Design.md

Product: MailFlow
Tagline: Smarter Emails. Seamless Flow.

---

1. Design Direction

MailFlow should feel like a modern SaaS product.

Design Keywords

- Clean
- Modern
- Professional
- Fast
- Minimal
- Trustworthy
- Developer-friendly

Avoid excessive gradients, unnecessary animations, and crowded dashboards.

---

2. Brand

Logo

Primary logo:

MailFlow

Recommended visual concept:

Mail + Flow
✉ → → →

The visual identity can combine an envelope with a flowing arrow.

---

3. Color System

Use a restrained SaaS color palette.

Primary

Blue / Indigo

Used for:

- Primary buttons
- Links
- Active states
- Important actions

Background

Very light neutral background.

Surface

White cards with subtle borders.

Text

Dark neutral for headings and readable gray for secondary text.

Status

- Success → Green
- Warning → Amber
- Error → Red
- Pending → Gray/Blue

---

4. Typography

Recommended font:

Inter

Heading hierarchy

H1 — 36–44px
H2 — 28–32px
H3 — 20–24px
Body — 14–16px
Small — 12–13px

Use strong typography rather than oversized decorative text.

---

5. Layout

Desktop:

┌──────────────────────────────────────────────────────┐
│ MailFlow                         Profile / Settings │
├───────────────┬──────────────────────────────────────┤
│               │                                      │
│ Dashboard     │                                      │
│ Campaigns     │           Main Content               │
│ Contacts      │                                      │
│ Templates     │                                      │
│ Analytics     │                                      │
│               │                                      │
│ Settings      │                                      │
└───────────────┴──────────────────────────────────────┘

Mobile:

┌───────────────────────┐
│ MailFlow          ☰   │
├───────────────────────┤
│                       │
│ Main Content          │
│                       │
└───────────────────────┘

---

6. Dashboard

Header

Good evening, Saiganesh

Create and manage your email campaigns.

[ + Create Campaign ]

Statistics

Four cards:

Campaigns
12

Emails Sent
2,480

Successful
2,421

Failed
59

Recent Campaigns

Table:

Campaign| Recipients| Status| Date
Internship Certificates| 120| Completed| Today
Hackathon Invite| 85| Completed| Yesterday
Community Update| 250| Processing| Yesterday

---

7. Create Campaign Page

Use a step-based interface.

1. Contacts → 2. Compose → 3. Preview → 4. Send

---

8. Contacts Step

Upload area

Large drag-and-drop box:

┌─────────────────────────────────────┐
│                                     │
│       ↑ Upload CSV                  │
│                                     │
│   Drag & drop your CSV here         │
│   or click to browse                │
│                                     │
└─────────────────────────────────────┘

Below:

✓ 120 contacts imported
✓ 118 valid emails
⚠ 2 invalid emails

Provide an option to download/view invalid contacts.

---

9. Compose Step

Layout:

┌──────────────────────────┬─────────────────────┐
│ Email Composer           │ AI Assistant        │
│                          │                     │
│ Subject                  │ Generate Email      │
│ [____________________]   │                     │
│                          │ Prompt:             │
│ Email Body               │ [________________]  │
│                          │                     │
│ [ Rich Text Editor ]     │ [ Generate ]        │
│                          │                     │
│ [Insert Variable]        │                     │
└──────────────────────────┴─────────────────────┘

AI actions:

Generate
Improve
Shorten
Professional
Friendly
Fix Grammar

---

10. Personalization

Display available variables:

Available Variables

{{name}}
{{email}}
{{company}}

Clicking a variable inserts it into the email.

Example:

Hello {{name}},

---

11. Preview Step

Show:

Desktop | Mobile

Example:

┌────────────────────────────────────┐
│ To: Rahul                          │
│ Subject: Congratulations, Rahul!  │
├────────────────────────────────────┤
│                                    │
│ Hello Rahul,                       │
│                                    │
│ Congratulations on completing...  │
│                                    │
│ Best regards,                      │
│ MailFlow Team                      │
│                                    │
└────────────────────────────────────┘

Allow user to switch between recipients to verify personalization.

---

12. Send Step

Before sending, show a confirmation card:

Ready to send?

Recipients       118
Valid emails     118
Invalid emails     2

Subject:
Congratulations on your internship!

[ Send Test ]     [ Send Campaign ]

The final send action should require explicit confirmation.

---

13. Campaign Results

After sending:

Campaign Completed ✓

118 Emails Sent

████████████████████ 100%

Sent       116
Failed       2

Include a recipient-level table:

Recipient| Status
Rahul| ✓ Sent
Priya| ✓ Sent
Amit| ✕ Failed

---

14. Empty States

Never show an empty blank screen.

Example:

No campaigns yet.

Create your first campaign and start sending smarter emails.

[ Create Campaign ]

---

15. Loading States

Use skeleton loaders instead of freezing the interface.

Example:

████████████████
██████████
████████████████████

For AI generation:

✨ AI is writing your email...

---

16. Error States

Errors should explain the problem clearly.

Bad:

Error 500

Better:

We couldn't send this email.

Your email provider rejected the request.
Please check your provider configuration and try again.

[ Try Again ]

---

17. Responsive Design

The application must work on:

- Desktop
- Laptop
- Tablet
- Mobile

Tables should become cards or horizontally scroll on smaller screens.

---

18. Accessibility

Requirements:

- Keyboard navigation
- Visible focus states
- Accessible form labels
- Good text contrast
- Descriptive buttons
- Screen-reader-friendly structure
- Do not rely only on color for status

---

19. Animation

Keep animations subtle.

Use animation for:

- Page transitions
- Button feedback
- Toast notifications
- Progress indicators
- AI generation state

Avoid excessive motion.

---

20. Component Structure

Recommended components:

components/
├── Navbar
├── Sidebar
├── StatCard
├── CampaignTable
├── ContactUploader
├── EmailEditor
├── AIAssistant
├── VariablePicker
├── EmailPreview
├── CampaignProgress
├── StatusBadge
├── EmptyState
├── LoadingState
└── ConfirmDialog

---

21. Design Principle

Every screen should answer one question:

«“What should the user do next?”»

The interface should guide the user naturally:

Import → Compose → Personalize → Preview → Test → Send → Analyze

---

22. Final Brand Experience

MailFlow should feel like:

«A simple email tool on the surface, with powerful automation underneath.»

The user should be able to understand the product within 10 seconds of opening it.

23. IMP Points 
 1. use Backend not server 
 2. use Frontend not Clint 
 3. no unwanted Node moulde 
 4. no over engneering 
 5. NO Heavy Codeing Only Baseic and clere all the requiment 
 6. use NMP Only NO other unwanted file other file 
 7. make it minimal and full working Mailflow 
