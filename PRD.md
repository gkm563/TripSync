# TripSync - Group Contribution & Settlement Tracker

## Product Vision

TripSync is a premium, mobile-first group contribution tracking application designed for small groups (2–10 members) travelling together for internships, hackathons, events, tours, college trips, GDG events, competitions, or any shared activity.

The goal is NOT expense splitting during the trip.

The goal is to accurately track:

* Who paid how much for the group
* Who approved that payment
* Full expense history
* Final settlement calculation
* Complete transparency among members

The application should feel modern, premium, highly visual, simple to use, and require minimal typing.

---

# Core Principle

The app tracks:

"Who paid money for the group."

NOT:

"Who individually spent money on themselves."

Example:

Train Ticket = ₹600

Paid By: Praveen

The app stores:

Praveen contributed ₹600 to the group.

At trip completion, the app calculates who owes whom money.

---

# Target Users

* Friends travelling together
* Internship groups
* College students
* Hackathon teams
* Event organizing teams
* Small communities

Recommended group size:

2–10 members

---

# Authentication

Login Options:

* Google Sign In (Primary)
* Email Sign In (Optional)

Each user has:

* Name
* Profile Photo
* Email
* Join Date

---

# Trip Creation

Any user can create a trip.

No Admin.
No Owner.
No Hierarchy.

All members are equal.

Trip Information:

* Trip Name
* Cover Image
* Start Date
* Expected End Date
* Description (Optional)

Example:

Summer Internship IIT Kanpur

---

# Trip Invitation System

Creator invites members.

Notification:

"Gautam invited you to join Summer Internship IIT Kanpur."

Buttons:

* Accept
* Decline

Only accepted members become active participants.

---

# Shared Expenses

Primary feature of the application.

Expense Fields:

* Expense Title
* Amount
* Category
* Paid By
* Created By
* Date
* Time
* Notes (Optional)

Categories:

* Food
* Travel
* Hotel
* Shopping
* Other

---

# Multiple Payers Support

Example:

Hotel ₹3000

Paid By:

* Gautam ₹1000
* Praveen ₹2000

Contribution calculation must support multiple contributors.

---

# Personal Expenses

Separate section.

Visible only to the owner.

Not included in settlement calculations.

Not visible to other members.

Examples:

* Personal Snacks
* Personal Shopping
* Personal Drinks

This section should remain secondary.

Primary focus must always be Shared Expenses.

---

# Expense Approval System

## Creation

When an expense is created:

Creator automatically receives one positive vote.

Example:

Created By: Gautam

Votes:

Gautam = +1

---

## Voting

Approve = +1

Reject = -1

---

## Majority Formula

Required Majority:

floor(total_members / 2) + 1

Examples:

3 Members = 2

4 Members = 3

5 Members = 3

6 Members = 4

---

## Approval Logic

Example:

Members:

* Gautam
* Rohit
* Praveen

Created By Gautam

Auto Vote:

Gautam = +1

Praveen Approves:

+1

Current Score:

2

Required Majority:

2

Status:

Approved

---

## Reject Logic

Reject = -1

Example:

Gautam +1

Praveen +1

Rohit -1

Net Score:

1

Required Majority:

2

Status:

Pending Review

NOT Rejected

---

# Reject Reason Mandatory

Reject button cannot work without reason.

Flow:

Reject
↓
Choose Reason
↓
Submit

Reasons:

* Wrong Amount
* Duplicate Expense
* Wrong Category
* Other

If Other:

Minimum 20 characters required.

Reject without reason is not allowed.

---

# Review Queue

Expenses that fail majority go into:

Pending Review

Review card shows:

* Expense Details
* Created By
* Date
* Time
* Approvals
* Rejects
* Reject Reasons

Users can discuss and resolve later.

---

# Expense Editing

Approved expense can be edited.

When edited:

Status becomes Pending Again.

All votes reset.

New approval cycle begins.

---

# Complete Audit Trail

Every action must be stored.

Track:

* Created By
* Created Time
* Edited By
* Edit Time
* Approved By
* Rejected By
* Reject Reason
* Version Number

Example:

Version 1
Created By Gautam

Version 2
Edited By Rohit

Nothing should be permanently lost.

---

# Duplicate Detection

Prevent accidental duplicates.

If:

* Same Amount
* Same Category
* Similar Title
* Created within short time

Show warning:

"Similar expense found recently."

Options:

* Continue
* Cancel

Do NOT automatically block.

---

# Real-Time Synchronization

Changes must sync instantly.

Examples:

* Expense Created
* Expense Approved
* Expense Edited
* Trip End Request

All devices update in real time.

No manual refresh required.

---

# Notification System

Push notifications are critical.

Notifications must be clear and human-readable.

Example:

New Expense

"Gautam added a new expense."

Train Ticket
₹600
Paid By: Praveen

Tap to Review

---

Approval Notification

"Train Ticket has been approved."

Approved By Rohit

---

Review Notification

"Expense requires review."

Reason:
Amount may be incorrect.

---

Trip End Notification

"Gautam wants to end this trip."

Buttons:

* Agree
* Keep Trip Active

---

# Notification Center

Sections:

* Unread
* Read

Options:

* Mark All Read
* Clear History

Notification history must remain available.

---

# Live Dashboard

Trip Home Screen

Show:

Total Shared Expense

Member Contributions

Example:

Praveen ₹5000

Rohit ₹4000

Gautam ₹3000

Cards should update live.

---

# Activity Feed

Timeline View

Example:

09:30 AM
Gautam added Train Ticket

09:45 AM
Rohit approved Train Ticket

10:00 AM
Expense Approved

Instagram-style feed design.

---

# Settlement Engine

At any time users can view:

"If settled now"

Example:

Total Expense:

₹12000

Members:

3

Per Member:

₹4000

Contributions:

Praveen ₹5000

Rohit ₹4000

Gautam ₹3000

Settlement:

Gautam pays Praveen ₹1000

Minimum transaction algorithm must be used.

---

# Trip Completion

Trips must NOT auto-close.

No automatic locking.

Any member can request:

End Trip

Notification sent:

"Gautam wants to end the trip."

Every member must agree.

Only when ALL members agree:

Trip Status:

Completed

Until then:

Trip remains Active.

---

# Export System

Export Options:

PDF

Excel

WhatsApp Share

System should ask:

Include:

☑ Shared Expenses

☑ Personal Expenses

☑ Settlement Summary

☑ Activity Log

☑ Approvals

☑ Review Queue

Generate accordingly.

---

# PDF Export

Professional report design.

Include:

Trip Name

Members

Date Range

Expense Summary

Contribution Summary

Settlement Summary

Approval History

Charts

Total Amount

---

# WhatsApp Export

One-click sharing.

Example:

Trip Summary

Total: ₹12000

Praveen: ₹5000

Rohit: ₹4000

Gautam: ₹3000

Settlement:

Gautam → Praveen ₹1000

Share directly to WhatsApp.

---

# UI & UX Requirements

Design Style:

Premium

Modern

Clean

Highly visual

Minimal typing

Fast interaction

---

## Design Language

Rounded cards

Soft shadows

Smooth animations

Glassmorphism elements where appropriate

Modern gradients

Professional typography

Large touch targets

---

## Color System

Primary:

Indigo / Blue Gradient

Secondary:

Teal

Success:

Green

Warning:

Orange

Review:

Amber

Error:

Red

Background:

Off-white with subtle gradients

Dark Mode required.

---

# Navigation

Bottom Navigation

* Home
* Activity
* Add Expense
* Approvals
* Profile

Central Add button should be highlighted.

---

# Performance Requirements

Support:

2–10 active members

Real-time sync

Offline cache

Fast loading

Low battery usage

---

# Backend Stack

Frontend:

React Native + Expo

Backend:

Firebase

Database:

Firestore

Notifications:

Firebase Cloud Messaging

Storage:

Firebase Storage

Authentication:

Google Sign In

---

# Data Safety Rules

Never permanently delete expenses.

Never permanently delete trips.

Use:

Active

Archived

Completed

Status system instead.

Maintain full audit history forever.

No data loss.
