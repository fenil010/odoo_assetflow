<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


# AGENT.md

# AssetFlow - Enterprise Asset & Resource Management ERP

## Overview

AssetFlow is an enterprise-grade ERP system designed to manage organizational assets and shared resources.

The application is NOT an inventory management software, accounting software, or purchasing system.

The platform focuses entirely on:

- Asset Lifecycle Management
- Resource Booking
- Asset Allocation
- Maintenance Workflow
- Audit Management
- Notifications
- Analytics
- Role-based ERP architecture

Every module should feel production-ready and scalable.

---

# Product Goal

Organizations often manage assets using spreadsheets and paper logs.

This leads to:

- Lost assets
- Double allocation
- No ownership tracking
- Poor maintenance records
- Resource booking conflicts
- Missing audit history

AssetFlow solves these problems through a centralized ERP platform.

---

# Core Principles

The application should always prioritize:

- Enterprise architecture
- Modular code
- Clean database design
- Strong RBAC
- Excellent UX
- Reusable components
- Scalability
- Auditability

Avoid shortcuts that would not scale in production.

---

# Supported Organizations

The system should work for any organization including:

- Schools
- Colleges
- Companies
- Hospitals
- Factories
- Government agencies
- NGOs

Never hardcode organization-specific logic.

Everything should remain generic.

---

# User Roles

There are only four system roles.

## Admin

Responsible for:

- Organization setup
- Departments
- Employee management
- Role assignment
- Categories
- Audit cycle creation
- Analytics

Admin never registers assets personally unless necessary.

---

## Asset Manager

Responsible for:

- Asset registration
- Allocation
- Transfer approval
- Maintenance approval
- Asset return approval
- Asset lifecycle management

---

## Department Head

Responsible for:

- Department assets
- Allocation approval
- Transfer approval
- Resource booking

Cannot manage organization-wide settings.

---

## Employee

Responsible for:

- Viewing assigned assets
- Booking resources
- Requesting transfers
- Returning assets
- Raising maintenance requests

Lowest privilege role.

---

# Authentication Rules

Signup creates ONLY an Employee account.

Users CANNOT choose:

- Admin
- Asset Manager
- Department Head

Only Admin promotes users.

Never allow self-assigned privileges.

---

# Main Modules

## Authentication

Features

- Login
- Signup
- Forgot Password
- Session Management

---

## Dashboard

Dashboard should display real-time KPIs.

Cards include

- Assets Available
- Assets Allocated
- Active Bookings
- Maintenance Today
- Upcoming Returns
- Pending Transfers

Dashboard should feel similar to enterprise ERPs.

---

## Organization Module

Contains

### Departments

Fields

- Name
- Parent Department
- Department Head
- Status

Supports hierarchy.

---

### Asset Categories

Examples

- Electronics
- Furniture
- Vehicles
- Machinery

Should support custom metadata in future.

---

### Employee Directory

Stores

- Name
- Email
- Department
- Role
- Status

Only Admin changes roles.

---

## Asset Module

Every asset contains

- Asset Tag
- Name
- Category
- Serial Number
- Acquisition Date
- Acquisition Cost
- Condition
- Current Status
- Current Holder
- Location
- Images
- Documents
- QR Code
- Shared Resource Flag

Asset Tags are auto-generated.

Example

AF-000001

---

# Asset Lifecycle

Assets can exist in the following states.

Available

↓

Allocated

↓

Reserved

↓

Under Maintenance

↓

Available

↓

Retired

↓

Disposed

Lost is a terminal state until recovered.

Every transition must be recorded.

Never directly overwrite lifecycle history.

---

# Allocation Rules

Only Available assets may be allocated.

Rules

- One asset can have only one active allocation.
- Prevent duplicate allocation.
- Transfer required if already allocated.
- Return restores Available state.

History must always be preserved.

---

# Transfer Workflow

Employee requests transfer

↓

Department Head / Asset Manager approves

↓

Current allocation closes

↓

New allocation created

↓

History updated

Never modify old allocation records.

Always create new ones.

---

# Resource Booking

Shared resources include

- Rooms
- Vehicles
- Equipment

Requirements

- Calendar View
- Time Slot Booking
- Conflict Detection
- Reminder Notifications
- Cancellation
- Reschedule

No overlapping bookings.

---

# Maintenance Workflow

Employee raises request

↓

Pending

↓

Approved

↓

Technician Assigned

↓

In Progress

↓

Resolved

↓

Closed

Approval changes asset status to

Under Maintenance

Resolution returns it to

Available

Maintenance history is immutable.

---

# Audit Module

Audit is cycle-based.

Admin creates

Audit Cycle

↓

Assign Auditors

↓

Verify Assets

↓

Generate Discrepancy Report

↓

Close Cycle

Closed audits become read-only.

---

# Notifications

System notifications include

- Allocation
- Return Reminder
- Overdue Asset
- Booking Reminder
- Booking Approved
- Booking Cancelled
- Maintenance Approved
- Maintenance Rejected
- Audit Assigned
- Audit Completed

Notifications should support unread status.

---

# Activity Logs

Every critical action generates an audit log.

Store

- User
- Action
- Entity
- Previous Value
- New Value
- Timestamp
- IP (future)
- Metadata

Logs are immutable.

---

# Reports

Reports include

- Asset Utilization
- Department Allocation
- Booking Heatmaps
- Maintenance Trends
- Upcoming Retirement
- Idle Assets

Should support CSV/PDF export.

---

# Business Rules

## Asset

Cannot allocate unavailable asset.

Cannot delete allocated asset.

Cannot edit disposed asset.

Cannot delete category with linked assets.

---

## Booking

No overlapping bookings.

Cancelled bookings keep history.

Completed bookings become read-only.

---

## Maintenance

Cannot approve twice.

Cannot resolve before approval.

Cannot delete maintenance history.

---

## Audit

Closed cycles cannot be edited.

Missing assets become Lost after confirmation.

Discrepancy reports are immutable.

---

# Database Philosophy

Prefer normalized relational design.

Use UUIDs.

Soft delete master data.

Maintain immutable history tables for

- Allocation
- Booking
- Maintenance
- Audit

Avoid storing redundant values.

---

# Backend Principles

Use:

- Service Layer
- Repository Pattern
- Validation Layer
- Authorization Layer
- Notification Layer

Business logic must never live inside controllers.

---

# Frontend Principles

Design should resemble modern enterprise software.

Prioritize

- Clean layouts
- Fast navigation
- Minimal clicks
- Responsive UI
- Accessible components

Avoid excessive animations.

Focus on usability.

---

# Non-Functional Requirements

- Fast search
- Pagination
- Filters
- Sorting
- Mobile responsive
- Dark mode ready
- Auditability
- Secure APIs
- RBAC
- Reusable architecture

---

# Future Scope

Architecture should support future additions such as

- Barcode Scanner
- QR Scanning
- RFID
- Multi-organization support
- Multi-tenant architecture
- Vendor management
- Procurement
- Accounting integration
- Predictive maintenance
- AI recommendations

Current implementation should not block these future features.

---

# Development Philosophy

Build AssetFlow like a commercial SaaS ERP product rather than a hackathon demo.

Every feature should prioritize:

- Maintainability
- Scalability
- Security
- Clean Architecture
- Excellent User Experience
- Enterprise-grade engineering