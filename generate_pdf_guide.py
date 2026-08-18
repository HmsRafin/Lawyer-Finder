#!/usr/bin/env python3
"""
Generates a comprehensive, beautifully styled PDF guide (~30+ pages) for beginners
explaining the full Lawyer Finder codebase: Architecture, Database, PHP Backend,
React Frontend, API flow, and how to run it.

Uses ReportLab Platypus with custom styles, color palettes, and code blocks.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable, ListFlowable, ListItem
)
from reportlab.pdfgen import canvas

PDF_OUTPUT_PATH = "Lawyer_Finder_Codebase_Guide.pdf"

# ═══════════════════════════════════════════════════════════════════════════════
# Custom Canvas for page numbers and headers
# ═══════════════════════════════════════════════════════════════════════════════
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#414942"))

        # Header on pages after page 1
        if self._pageNumber > 1:
            self.drawString(54, 750, "Lawyer Finder -- Complete Beginner's Codebase Guide (CSE 3104)")
            self.setStrokeColor(colors.HexColor("#C1C9BC"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_str)
        self.drawString(54, 36, "Ahsanullah University of Science and Technology - Dept. of CSE")
        self.setStrokeColor(colors.HexColor("#C1C9BC"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()


# ═══════════════════════════════════════════════════════════════════════════════
# Helper functions
# ═══════════════════════════════════════════════════════════════════════════════

# Escape XML characters for ReportLab Paragraphs
def esc(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build_pdf():
    doc = SimpleDocTemplate(
        PDF_OUTPUT_PATH,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=60,
        bottomMargin=60
    )

    styles = getSampleStyleSheet()

    # ─── Color Palette ───────────────────────────────────────────────────────
    PRIMARY = colors.HexColor("#1B6E45")
    PRIMARY_DARK = colors.HexColor("#0F4E2E")
    SECONDARY = colors.HexColor("#C9911A")
    SURFACE_BG = colors.HexColor("#F5FAF5")
    CONTAINER_BG = colors.HexColor("#E9F0E7")
    TEXT_DARK = colors.HexColor("#181D19")
    TEXT_MUTED = colors.HexColor("#414942")
    BORDER_COLOR = colors.HexColor("#C1C9BC")
    CODE_BG = colors.HexColor("#1A2332")
    CODE_TEXT = colors.HexColor("#E0E8D8")
    WARN_BG = colors.HexColor("#FFF8E1")
    WARN_BORDER = colors.HexColor("#FFB300")
    TIP_BG = colors.HexColor("#E8F5E9")
    TIP_BORDER = colors.HexColor("#4CAF50")

    # ─── Typography Styles ───────────────────────────────────────────────────
    title_style = ParagraphStyle('DocTitle', fontName='Helvetica-Bold', fontSize=26, leading=32, textColor=PRIMARY_DARK, spaceAfter=4)
    subtitle_style = ParagraphStyle('DocSubTitle', fontName='Helvetica', fontSize=12, leading=16, textColor=TEXT_MUTED, spaceAfter=14)
    h1_style = ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=PRIMARY, spaceBefore=18, spaceAfter=8, keepWithNext=True)
    h2_style = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=PRIMARY_DARK, spaceBefore=12, spaceAfter=5, keepWithNext=True)
    h3_style = ParagraphStyle('H3', fontName='Helvetica-Bold', fontSize=10.5, leading=14, textColor=TEXT_DARK, spaceBefore=8, spaceAfter=4, keepWithNext=True)
    body_style = ParagraphStyle('Body', fontName='Helvetica', fontSize=9.5, leading=13.5, textColor=TEXT_DARK, spaceAfter=6)
    body_bold = ParagraphStyle('BodyBold', fontName='Helvetica-Bold', fontSize=9.5, leading=13.5, textColor=TEXT_DARK, spaceAfter=6)
    code_style = ParagraphStyle('Code', fontName='Courier', fontSize=7.5, leading=10, textColor=colors.HexColor("#0F4E2E"), spaceAfter=2)
    code_inline = ParagraphStyle('CodeInline', fontName='Courier', fontSize=8.5, leading=11, textColor=PRIMARY_DARK)
    callout_style = ParagraphStyle('Callout', fontName='Helvetica', fontSize=9, leading=13, textColor=TEXT_DARK)
    bullet_style = ParagraphStyle('Bullet', fontName='Helvetica', fontSize=9.5, leading=13.5, textColor=TEXT_DARK, spaceAfter=3, leftIndent=18, bulletIndent=6)
    toc_style = ParagraphStyle('TOC', fontName='Helvetica', fontSize=10, leading=16, textColor=TEXT_DARK, spaceAfter=2, leftIndent=12)
    toc_title = ParagraphStyle('TOCTitle', fontName='Helvetica-Bold', fontSize=10, leading=16, textColor=PRIMARY, spaceAfter=2)

    story = []

    # ═══════════════════════════════════════════════════════════════════════════
    # Helper: callout / info box
    # ═══════════════════════════════════════════════════════════════════════════
    def add_callout(text, bg=CONTAINER_BG, border=BORDER_COLOR, width=504):
        data = [[Paragraph(text, callout_style)]]
        t = Table(data, colWidths=[width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), bg),
            ('BOX', (0, 0), (-1, -1), 1.2, border),
            ('PADDING', (0, 0), (-1, -1), 10),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(t)
        story.append(Spacer(1, 8))

    def add_warning(text):
        add_callout(f"<b>Important:</b> {text}", WARN_BG, WARN_BORDER)

    def add_tip(text):
        add_callout(f"<b>Tip:</b> {text}", TIP_BG, TIP_BORDER)

    def add_code_block(code_lines, title=None):
        """Add a styled code block with dark background."""
        elements = []
        if title:
            elements.append(Paragraph(f"<b>{title}</b>", ParagraphStyle('CodeTitle', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=TEXT_MUTED, spaceAfter=2)))
        
        code_paras = []
        for line in code_lines:
            escaped = esc(line)
            code_paras.append(Paragraph(escaped, code_style))
        
        data = [code_paras]
        # Stack them vertically
        inner_data = [[p] for p in code_paras]
        t = Table(inner_data, colWidths=[490])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F0F4EE")),
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (0, 0), 6),
            ('BOTTOMPADDING', (-1, -1), (-1, -1), 6),
            ('TOPPADDING', (0, 1), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -2), 0),
        ]))
        if title:
            story.append(elements[0])
        story.append(t)
        story.append(Spacer(1, 8))

    def styled_table(data, col_widths, header_bg=PRIMARY):
        t = Table(data, colWidths=col_widths)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), header_bg),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, SURFACE_BG]),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(t)
        story.append(Spacer(1, 10))

    # ═══════════════════════════════════════════════════════════════════════════
    # COVER PAGE
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 100))
    story.append(Paragraph("Lawyer Finder", title_style))
    story.append(Paragraph("Complete Codebase Guide for Beginners", ParagraphStyle('BigSub', fontName='Helvetica', fontSize=16, leading=20, textColor=PRIMARY, spaceAfter=6)))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=12))
    story.append(Paragraph("CSE 3104 - Database Systems Lab Project", subtitle_style))
    story.append(Paragraph("Ahsanullah University of Science and Technology", subtitle_style))
    story.append(Spacer(1, 20))

    add_callout(
        "<b>About This Document</b><br/><br/>"
        "This guide is written for <b>absolute beginners</b>. It walks you through every single file "
        "in the Lawyer Finder codebase -- from the database schema to the PHP backend API to the "
        "React frontend -- explaining <i>what</i> each piece does, <i>why</i> it exists, and <i>how</i> "
        "it connects to the rest of the system.<br/><br/>"
        "If you have never built a full-stack web application before, this is the document you need. "
        "Every SQL query, every PHP endpoint, and every React component is explained in plain English "
        "with real code snippets from the project."
    )

    story.append(Spacer(1, 20))
    # Key facts
    facts_data = [
        ["Metric", "Value"],
        ["Total Backend PHP Files", "10 files across 3 directories"],
        ["Total Frontend React Files", "20+ components and pages"],
        ["Database Tables", "3 (users, lawyers, appointments)"],
        ["SQL Operations Demonstrated", "Transactions, Locks, JOINs, Aggregates, Soft-Delete"],
        ["Authentication", "PHP Sessions + bcrypt password hashing"],
        ["Design System", "Google Material Express 3 tokens"],
        ["How to Run", "python run.py (one command)"],
    ]
    styled_table(facts_data, [150, 354], PRIMARY_DARK)

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # TABLE OF CONTENTS
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("Table of Contents", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10))

    toc_items = [
        ("1.", "What is Lawyer Finder? (Project Overview)"),
        ("2.", "High-Level Architecture (How the Three Layers Work Together)"),
        ("3.", "Project Directory Structure (File Map)"),
        ("4.", "Database Schema Deep Dive (schema.sql)"),
        ("  4.1", "The users Table"),
        ("  4.2", "The lawyers Table"),
        ("  4.3", "The appointments Table"),
        ("  4.4", "Entity Relationship Diagram"),
        ("  4.5", "Normalization (3NF) Explained"),
        ("  4.6", "Seed Data"),
        ("5.", "Backend PHP API -- Complete File-by-File Walkthrough"),
        ("  5.1", "Database Connection (db.php)"),
        ("  5.2", "Authentication Endpoints (auth/)"),
        ("  5.3", "Appointments CRUD Endpoints (appointments/)"),
        ("  5.4", "Lawyers Directory (lawyers/)"),
        ("6.", "Critical SQL Operations (The 5 Required Techniques)"),
        ("  6.1", "ACID Transactions + SELECT ... FOR UPDATE (Double-Booking Guard)"),
        ("  6.2", "Multi-Table SQL JOIN (Resolving Foreign Keys)"),
        ("  6.3", "Status State Machine (Server-Side Validation)"),
        ("  6.4", "Soft-Delete (Preserving Audit History)"),
        ("  6.5", "SQL Aggregates with GROUP BY (Dashboard Metrics)"),
        ("7.", "Frontend React Application -- Architecture & Components"),
        ("  7.1", "Project Setup (Vite + Tailwind + Material 3)"),
        ("  7.2", "API Layer (config.js, auth.js, appointments.js, lawyers.js)"),
        ("  7.3", "Authentication Context (AuthContext.jsx)"),
        ("  7.4", "Routing (App.jsx)"),
        ("  7.5", "Reusable Components"),
        ("  7.6", "Pages (All 11 Screens)"),
        ("8.", "How Data Flows: A Complete Request Lifecycle"),
        ("9.", "How to Run the Project (Quickstart Guide)"),
        ("10.", "Test Accounts & Credentials"),
        ("11.", "Glossary of Terms for Beginners"),
    ]
    for num, title in toc_items:
        is_sub = num.startswith("  ")
        s = toc_style if is_sub else toc_title
        indent = 24 if is_sub else 0
        ps = ParagraphStyle(f'toc_{num}', parent=s, leftIndent=indent)
        story.append(Paragraph(f"<b>{num}</b>&nbsp;&nbsp;{title}", ps))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 1: PROJECT OVERVIEW
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("1. What is Lawyer Finder? (Project Overview)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph(
        "<b>Lawyer Finder</b> is a database-driven web application that connects clients with verified lawyers "
        "based on their <b>specialization</b> (Corporate, Family, Criminal, etc.) and <b>location</b> (district in Bangladesh). "
        "It is built as a CSE 3104 Database Systems Lab project to demonstrate real-world database operations.",
        body_style
    ))

    story.append(Paragraph("The application has <b>three modules</b>:", body_style))

    modules_data = [
        ["Module", "User Role", "What They Can Do"],
        ["Client Module", "client", "Search for lawyers, view profiles, book consultations, manage their appointments (view, cancel)."],
        ["Lawyer Module", "lawyer", "View incoming case requests, accept or reject appointments, mark cases as completed, view their statistics."],
        ["Admin Module", "admin", "View platform-wide statistics, see all appointments across all lawyers and clients, monitor system health."],
    ]
    styled_table(modules_data, [100, 70, 334])

    story.append(Paragraph(
        "For <b>Checkpoint 1</b>, the instructor requires: (1) the complete frontend built and running with all screens, "
        "and (2) one fully working database table demonstrated end-to-end. The <b>appointments</b> table was chosen because "
        "it has the richest CRUD operations, foreign-key relationships, and meaningful SQL features (transactions, locks, "
        "joins, aggregates) in the entire schema.",
        body_style
    ))

    story.append(Spacer(1, 6))
    add_tip("The entire project can be launched with a single command: <code>python run.py</code>. See Section 9 for details.")

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 2: HIGH-LEVEL ARCHITECTURE
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("2. High-Level Architecture", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph(
        "The application follows a classic <b>three-tier architecture</b> -- the same pattern used by most modern "
        "web applications (Gmail, Facebook, Amazon). Think of it as three separate programs that talk to each other:",
        body_style
    ))

    arch_data = [
        ["Layer", "Technology", "What It Does", "Analogy"],
        ["1. Frontend\n(Presentation)", "React (Vite)\nTailwind CSS\nMaterial Design 3", "Renders the user interface.\nHandles button clicks, forms, and navigation.\nSends HTTP requests to the backend.", "The \"face\" of the app --\nwhat users see and interact with."],
        ["2. Backend\n(Application)", "Plain PHP\nPDO (MySQLi)\nSession Authentication", "Receives HTTP requests.\nValidates input and enforces business rules.\nExecutes SQL queries.\nReturns JSON responses.", "The \"brain\" --\nit decides what to do with the data."],
        ["3. Database\n(Data Storage)", "MySQL 8.0\n(XAMPP / InnoDB)", "Stores all data permanently.\nEnforces referential integrity.\nHandles concurrent access safely.", "The \"memory\" --\nit remembers everything."],
    ]
    styled_table(arch_data, [90, 110, 170, 134])

    story.append(Paragraph("<b>How they communicate (the request cycle):</b>", body_bold))
    story.append(Paragraph(
        "1. The user clicks a button in the <b>React frontend</b> (e.g., 'Book Appointment').<br/>"
        "2. React sends an <b>HTTP POST request</b> with JSON data to the PHP backend (e.g., POST /backend/appointments/create.php).<br/>"
        "3. The <b>PHP backend</b> validates the data, opens a database transaction, and executes SQL queries against MySQL.<br/>"
        "4. <b>MySQL</b> processes the SQL, acquires locks if needed, inserts/updates rows, and returns results.<br/>"
        "5. PHP formats the result as a <b>JSON response</b> and sends it back to React.<br/>"
        "6. React <b>updates the UI</b> (shows a success toast, refreshes the appointments list, etc.).",
        body_style
    ))

    add_warning(
        "The frontend and backend are <b>completely separate programs</b>. The React app runs on port 5173 "
        "(Vite dev server). The PHP backend runs on port 8000 (PHP built-in server). They communicate <i>only</i> "
        "through HTTP requests and JSON responses. This is called a <b>REST API</b> architecture."
    )

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 3: DIRECTORY STRUCTURE
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("3. Project Directory Structure (File Map)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph("Here is every file in the project with a one-line description:", body_style))

    dir_data = [
        ["Path", "Purpose"],
        ["run.py", "One-command launcher that starts both backend and frontend servers"],
        ["generate_pdf_guide.py", "This script -- generates the PDF you are reading now"],
        ["README.md", "Project documentation with setup instructions"],
        ["index.html", "Original standalone HTML mockup with Material Design 3 tokens"],
        ["", ""],
        ["backend/config/db.php", "Database connection, CORS headers, session setup, JSON helpers"],
        ["backend/database/schema.sql", "MySQL schema with CREATE TABLE and seed INSERT statements"],
        ["backend/auth/login.php", "POST -- Authenticates user with email + password"],
        ["backend/auth/register.php", "POST -- Creates new user account (hashes password with bcrypt)"],
        ["backend/auth/logout.php", "POST -- Destroys PHP session"],
        ["backend/auth/me.php", "GET -- Returns currently logged-in user from session"],
        ["backend/appointments/create.php", "POST -- Books appointment (with transaction + lock)"],
        ["backend/appointments/read.php", "GET -- Lists appointments with multi-table SQL JOIN"],
        ["backend/appointments/update.php", "POST -- Updates status with state machine validation"],
        ["backend/appointments/delete.php", "POST -- Soft-cancels appointment (no hard delete)"],
        ["backend/appointments/stats.php", "GET -- Returns SQL aggregates (GROUP BY counts)"],
        ["backend/lawyers/read.php", "GET -- Searchable lawyer directory with filters"],
        ["", ""],
        ["frontend/package.json", "Node.js dependencies (React, React Router, Vite)"],
        ["frontend/vite.config.js", "Vite bundler configuration"],
        ["frontend/tailwind.config.js", "Tailwind CSS configuration with Material 3 color tokens"],
        ["frontend/index.html", "HTML entry point for the React SPA"],
        ["frontend/src/main.jsx", "React entry point -- mounts App into the DOM"],
        ["frontend/src/App.jsx", "Root component with all route definitions"],
        ["frontend/src/index.css", "Global styles, Material 3 tokens, animations"],
        ["frontend/src/api/config.js", "API base URL and universal fetch wrapper"],
        ["frontend/src/api/auth.js", "Auth API functions (login, register, logout, getMe)"],
        ["frontend/src/api/appointments.js", "Appointments API functions (create, read, update, delete, stats)"],
        ["frontend/src/api/lawyers.js", "Lawyers API functions (list, getById, search)"],
        ["frontend/src/context/AuthContext.jsx", "Global auth state, role switcher, login/logout logic"],
        ["frontend/src/components/TopBar.jsx", "Navigation header with role switcher pill"],
        ["frontend/src/components/Footer.jsx", "Page footer with project info"],
        ["frontend/src/components/LawyerCard.jsx", "Reusable lawyer profile card"],
        ["frontend/src/components/BookingModal.jsx", "Modal dialog for booking appointments"],
        ["frontend/src/components/CalendarPicker.jsx", "Interactive date picker component"],
        ["frontend/src/components/StatusBadge.jsx", "Colored status pill (pending/accepted/etc.)"],
        ["frontend/src/components/Toast.jsx", "Notification toast popup"],
    ]
    t_dir = Table(dir_data, colWidths=[200, 304])
    t_dir.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('GRID', (0, 0), (-1, -1), 0.3, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, SURFACE_BG]),
        ('PADDING', (0, 0), (-1, -1), 3),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        # Blank separator rows
        ('BACKGROUND', (0, 5), (-1, 5), colors.HexColor("#E0E0E0")),
        ('BACKGROUND', (0, 18), (-1, 18), colors.HexColor("#E0E0E0")),
        ('SPAN', (0, 5), (-1, 5)),
        ('SPAN', (0, 18), (-1, 18)),
    ]))
    story.append(t_dir)

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 4: DATABASE SCHEMA DEEP DIVE
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("4. Database Schema Deep Dive (schema.sql)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph(
        "The database is the foundation of the entire application. Everything -- users, lawyer profiles, "
        "appointments -- is stored as rows in MySQL tables. The schema file is located at "
        "<code>backend/database/schema.sql</code>.",
        body_style
    ))

    # ─── 4.1 Users Table ────────────────────────────────────────────────────
    story.append(Paragraph("4.1 The <code>users</code> Table", h2_style))
    story.append(Paragraph(
        "This table stores the login credentials and role for every person in the system -- whether they are "
        "a client, a lawyer, or an admin. Think of it as the 'address book' of the application.",
        body_style
    ))

    add_code_block([
        "CREATE TABLE users (",
        "    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,",
        "    name        VARCHAR(120) NOT NULL,",
        "    email       VARCHAR(150) NOT NULL UNIQUE,",
        "    password_hash VARCHAR(255) NOT NULL,",
        "    role        ENUM('client','lawyer','admin') NOT NULL DEFAULT 'client',",
        "    phone       VARCHAR(30) NULL,",
        "    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,",
        "    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,",
        "    PRIMARY KEY (id),",
        "    INDEX idx_users_role (role),",
        "    INDEX idx_users_email (email)",
        ") ENGINE=InnoDB;",
    ], "SQL: CREATE TABLE users")

    users_cols = [
        ["Column", "Type", "Explanation"],
        ["id", "INT UNSIGNED AUTO_INCREMENT", "A unique number auto-assigned to each user. This is the Primary Key."],
        ["name", "VARCHAR(120)", "The user's full name (e.g., 'Sadia Anwar')."],
        ["email", "VARCHAR(150) UNIQUE", "Login email. UNIQUE means no two users can share the same email."],
        ["password_hash", "VARCHAR(255)", "The bcrypt-hashed password. We NEVER store plain text passwords."],
        ["role", "ENUM('client','lawyer','admin')", "Controls what the user can do. Only these 3 values are allowed."],
        ["phone", "VARCHAR(30) NULL", "Optional phone number. NULL means it can be left empty."],
        ["created_at", "TIMESTAMP", "Automatically set when the row is first inserted."],
        ["updated_at", "TIMESTAMP", "Automatically updated every time the row is modified."],
    ]
    styled_table(users_cols, [90, 140, 274])

    add_tip(
        "<b>What is AUTO_INCREMENT?</b> It means MySQL automatically generates the next number. "
        "If the last user had id=5, the next one gets id=6. You never have to set it manually."
    )

    # ─── 4.2 Lawyers Table ──────────────────────────────────────────────────
    story.append(Paragraph("4.2 The <code>lawyers</code> Table", h2_style))
    story.append(Paragraph(
        "This table stores the <b>professional profile</b> for users who have role='lawyer'. It has a "
        "<b>one-to-one relationship</b> with the users table via the <code>user_id</code> foreign key. "
        "This means every lawyer row points to exactly one user row.",
        body_style
    ))

    add_code_block([
        "CREATE TABLE lawyers (",
        "    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,",
        "    user_id          INT UNSIGNED NOT NULL UNIQUE,",
        "    specialization   VARCHAR(100) NOT NULL,",
        "    district         VARCHAR(80)  NOT NULL,",
        "    bio              TEXT NULL,",
        "    experience_years INT UNSIGNED NOT NULL DEFAULT 1,",
        "    bar_license      VARCHAR(80) NULL,",
        "    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 1000.00,",
        "    rating           DECIMAL(3,2) NOT NULL DEFAULT 4.80,",
        "    reviews_count    INT UNSIGNED NOT NULL DEFAULT 0,",
        "    PRIMARY KEY (id),",
        "    INDEX idx_lawyers_spec_dist (specialization, district),",
        "    CONSTRAINT fk_lawyers_user",
        "        FOREIGN KEY (user_id) REFERENCES users(id)",
        "        ON DELETE CASCADE ON UPDATE CASCADE",
        ") ENGINE=InnoDB;",
    ], "SQL: CREATE TABLE lawyers")

    lawyers_cols = [
        ["Column", "Type", "Explanation"],
        ["user_id", "INT UNSIGNED UNIQUE", "Points to users(id). UNIQUE enforces one profile per lawyer. The FOREIGN KEY constraint means if you delete the user, the lawyer row is also deleted (CASCADE)."],
        ["specialization", "VARCHAR(100)", "Area of law: Corporate, Family, Criminal, Property, Tax, or Labor."],
        ["district", "VARCHAR(80)", "Geographic location: Dhaka, Chattogram, Sylhet, Khulna, Rajshahi."],
        ["consultation_fee", "DECIMAL(10,2)", "Fee in BDT. DECIMAL avoids floating-point rounding errors."],
        ["rating", "DECIMAL(3,2)", "Average rating (e.g., 4.90 out of 5.00)."],
        ["bar_license", "VARCHAR(80)", "Official bar association license number."],
    ]
    styled_table(lawyers_cols, [100, 120, 284])

    add_warning(
        "<b>ON DELETE CASCADE</b> means: if a user row is deleted from the users table, MySQL will "
        "<i>automatically</i> delete the corresponding lawyer row. This prevents 'orphan' records -- "
        "lawyer profiles that point to users that no longer exist."
    )

    # ─── 4.3 Appointments Table ─────────────────────────────────────────────
    story.append(Paragraph("4.3 The <code>appointments</code> Table", h2_style))
    story.append(Paragraph(
        "This is the <b>core transactional table</b> and the focus of Checkpoint 1. Every consultation booking "
        "creates one row here. It links a <b>client</b> (from users) to a <b>lawyer</b> (from lawyers) at a "
        "specific date and time.",
        body_style
    ))

    add_code_block([
        "CREATE TABLE appointments (",
        "    id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,",
        "    client_id           INT UNSIGNED NOT NULL,",
        "    lawyer_id           INT UNSIGNED NOT NULL,",
        "    appointment_date    DATE NOT NULL,",
        "    appointment_time    TIME NOT NULL,",
        "    case_description    TEXT NOT NULL,",
        "    status              ENUM('pending','accepted','rejected',",
        "                             'completed','cancelled')",
        "                        NOT NULL DEFAULT 'pending',",
        "    cancellation_reason VARCHAR(255) NULL,",
        "    PRIMARY KEY (id),",
        "    INDEX idx_appointments_lawyer_datetime",
        "        (lawyer_id, appointment_date, appointment_time),",
        "    CONSTRAINT fk_appointments_client",
        "        FOREIGN KEY (client_id) REFERENCES users(id)",
        "        ON DELETE CASCADE,",
        "    CONSTRAINT fk_appointments_lawyer",
        "        FOREIGN KEY (lawyer_id) REFERENCES lawyers(id)",
        "        ON DELETE CASCADE",
        ") ENGINE=InnoDB;",
    ], "SQL: CREATE TABLE appointments")

    appt_cols = [
        ["Column", "Type", "Explanation"],
        ["client_id", "INT UNSIGNED FK", "Points to users(id) -- the person booking the consultation."],
        ["lawyer_id", "INT UNSIGNED FK", "Points to lawyers(id) -- the advocate being consulted."],
        ["appointment_date", "DATE", "The date of the consultation (e.g., 2026-08-20)."],
        ["appointment_time", "TIME", "The time slot (e.g., 10:30:00 for 10:30 AM)."],
        ["case_description", "TEXT", "Free-text description of the legal issue."],
        ["status", "ENUM (5 values)", "The current lifecycle state of the appointment."],
        ["cancellation_reason", "VARCHAR(255) NULL", "Optional reason stored when an appointment is cancelled."],
    ]
    styled_table(appt_cols, [110, 100, 294])

    # Composite index explanation
    story.append(Paragraph("<b>Why the composite index?</b>", h3_style))
    story.append(Paragraph(
        "The index <code>idx_appointments_lawyer_datetime (lawyer_id, appointment_date, appointment_time)</code> "
        "is a <b>composite index</b> -- it indexes three columns together. This is critical because our double-booking "
        "check query filters on exactly these three columns: 'Does this lawyer already have a booking at this date and time?' "
        "Without this index, MySQL would scan every row in the table. With it, the lookup is nearly instant.",
        body_style
    ))

    # ─── 4.4 ER Diagram ────────────────────────────────────────────────────
    story.append(Paragraph("4.4 Entity Relationship Diagram", h2_style))
    story.append(Paragraph(
        "The following table shows how the three tables relate to each other through foreign keys:",
        body_style
    ))

    er_data = [
        ["Relationship", "Type", "How It Works"],
        ["users <-> lawyers", "One-to-One", "Each lawyer has exactly one user account.\nlawyers.user_id -> users.id (UNIQUE)"],
        ["users <-> appointments", "One-to-Many", "Each client can have many appointments.\nappointments.client_id -> users.id"],
        ["lawyers <-> appointments", "One-to-Many", "Each lawyer can have many appointments.\nappointments.lawyer_id -> lawyers.id"],
    ]
    styled_table(er_data, [130, 80, 294])

    # ─── 4.5 Normalization ──────────────────────────────────────────────────
    story.append(Paragraph("4.5 Normalization (3NF) Explained", h2_style))
    story.append(Paragraph(
        "Our schema is in <b>Third Normal Form (3NF)</b>. Here is what that means in simple terms:",
        body_style
    ))
    story.append(Paragraph(
        "<b>1NF (First Normal Form):</b> Every column contains a single value (no arrays or lists in a cell). "
        "For example, we don't store 'specialization1, specialization2' in one column.<br/><br/>"
        "<b>2NF (Second Normal Form):</b> Every non-key column depends on the <i>entire</i> primary key. "
        "Since all our tables use a single-column primary key (id), 2NF is automatically satisfied.<br/><br/>"
        "<b>3NF (Third Normal Form):</b> No non-key column depends on another non-key column. For example, "
        "we don't store the lawyer's name inside the appointments table -- we store lawyer_id and JOIN to get "
        "the name. This avoids data duplication (if the lawyer changes their name, we only update one row in users, "
        "not hundreds of appointment rows).",
        body_style
    ))

    # ─── 4.6 Seed Data ─────────────────────────────────────────────────────
    story.append(Paragraph("4.6 Seed Data", h2_style))
    story.append(Paragraph(
        "The schema file also inserts sample data so you can test immediately. Here are the pre-loaded accounts:",
        body_style
    ))

    seed_data = [
        ["Name", "Email", "Role", "Notes"],
        ["System Admin", "admin@lawyerfinder.com", "admin", "Platform administrator"],
        ["Sadia Anwar", "sadia@gmail.com", "client", "Default test client"],
        ["Mahin Hasan", "mahin@gmail.com", "client", "Second test client"],
        ["Nusrat Tania", "nusrat@gmail.com", "client", "Third test client"],
        ["Farhan Ahmed", "farhan@gmail.com", "client", "Fourth test client"],
        ["Adv. Rahim Karim", "rahim@lawyer.com", "lawyer", "Corporate law, Dhaka"],
        ["Adv. Farzana Yasmin", "farzana@lawyer.com", "lawyer", "Family law, Chattogram"],
        ["Adv. Kamrul Hasan", "kamrul@lawyer.com", "lawyer", "Criminal law, Sylhet"],
        ["Adv. Nasrin Akter", "nasrin@lawyer.com", "lawyer", "Property law, Khulna"],
        ["Adv. Shafiul Alam", "shafiul@lawyer.com", "lawyer", "Tax law, Rajshahi"],
        ["Adv. Tania Rahman", "tania@lawyer.com", "lawyer", "Labor law, Dhaka"],
    ]
    styled_table(seed_data, [110, 130, 50, 214])

    add_tip("All seed accounts use the password: <code>password123</code> (stored as a bcrypt hash).")

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 5: BACKEND PHP API
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("5. Backend PHP API -- Complete File-by-File Walkthrough", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph(
        "The backend is a collection of plain PHP scripts (no framework). Each script handles one API endpoint. "
        "The React frontend calls these scripts over HTTP to read and write data in the MySQL database.",
        body_style
    ))

    # ─── 5.1 db.php ─────────────────────────────────────────────────────────
    story.append(Paragraph("5.1 Database Connection &amp; Core Helpers (backend/config/db.php)", h2_style))
    story.append(Paragraph(
        "This is the first file loaded by every other PHP script (via <code>require_once</code>). It does four things:",
        body_style
    ))

    story.append(Paragraph(
        "<b>1. Starts a PHP session</b> -- Sessions allow the server to 'remember' who is logged in across multiple requests. "
        "PHP assigns a unique cookie (PHPSESSID) to each browser.<br/><br/>"
        "<b>2. Sets CORS headers</b> -- Since the React frontend (port 5173) and PHP backend (port 8000) run on different ports, "
        "the browser blocks requests by default (Same-Origin Policy). CORS headers explicitly tell the browser: "
        "'Yes, requests from port 5173 are allowed.'<br/><br/>"
        "<b>3. Connects to MySQL using PDO</b> -- PDO (PHP Data Objects) is PHP's built-in database abstraction layer. "
        "We configure it with: error mode EXCEPTION (throws errors instead of silent failures), fetch mode ASSOC (returns "
        "rows as associative arrays), and emulate_prepares=false (uses real MySQL prepared statements for security).<br/><br/>"
        "<b>4. Defines helper functions</b> -- <code>send_json()</code> formats every API response consistently, "
        "<code>get_json_input()</code> reads the request body, and <code>get_auth_user()</code> checks the session.",
        body_style
    ))

    add_code_block([
        "// PDO Connection (from db.php)",
        "$dsn = 'mysql:host=localhost;port=3306;dbname=lawyer_finder;charset=utf8mb4';",
        "$pdo = new PDO($dsn, 'root', '', [",
        "    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,",
        "    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,",
        "    PDO::ATTR_EMULATE_PREPARES   => false,",
        "]);",
    ], "Key Code: PDO MySQL Connection")

    add_code_block([
        "// Standard JSON response helper",
        "function send_json($success, $data, $message, $status_code = 200) {",
        "    http_response_code($status_code);",
        "    echo json_encode([",
        "        'success' => (bool)$success,",
        "        'data'    => $data,",
        "        'message' => (string)$message",
        "    ]);",
        "    exit;",
        "}",
    ], "Key Code: send_json() Helper")

    add_tip(
        "Every API response has the same structure: <code>{success: true/false, data: ..., message: '...'}</code>. "
        "This makes it easy for the React frontend to handle responses consistently."
    )

    # ─── 5.2 Auth Endpoints ─────────────────────────────────────────────────
    story.append(Paragraph("5.2 Authentication Endpoints (backend/auth/)", h2_style))

    story.append(Paragraph("<b>login.php (POST)</b>", h3_style))
    story.append(Paragraph(
        "Accepts email and password. Looks up the user in the database using a <code>LEFT JOIN</code> with lawyers "
        "(so if the user is a lawyer, we also get their lawyer_id and specialization in one query). Verifies the password "
        "using PHP's <code>password_verify()</code> function, which compares the plain text password against the stored "
        "bcrypt hash. If valid, saves the user data to the PHP session and returns it as JSON.",
        body_style
    ))

    add_code_block([
        "// Password verification (login.php)",
        "$user = $stmt->fetch();  // fetch user row from database",
        "if (!$user || !password_verify($password, $user['password_hash'])) {",
        "    send_json(false, null, 'Invalid email or password.', 401);",
        "}",
        "$_SESSION['user'] = $userData;  // save to session",
        "send_json(true, $userData, 'Login successful!');",
    ], "Key Code: Password Verification")

    story.append(Paragraph("<b>register.php (POST)</b>", h3_style))
    story.append(Paragraph(
        "Creates a new user. Hashes the password with <code>password_hash(PASSWORD_BCRYPT)</code> before storing it. "
        "If the role is 'lawyer', it also creates a row in the lawyers table with default values.",
        body_style
    ))

    story.append(Paragraph("<b>logout.php (POST)</b>", h3_style))
    story.append(Paragraph("Destroys the PHP session and clears the session cookie.", body_style))

    story.append(Paragraph("<b>me.php (GET)</b>", h3_style))
    story.append(Paragraph("Returns the currently logged-in user from the session. Used by the frontend on page load to restore login state.", body_style))

    # ─── 5.3 Appointments CRUD ──────────────────────────────────────────────
    story.append(Paragraph("5.3 Appointments CRUD Endpoints (backend/appointments/)", h2_style))
    story.append(Paragraph(
        "These are the most important files in the entire project because they demonstrate all five required SQL techniques. "
        "Each file is explained in detail in Section 6.",
        body_style
    ))

    appt_files = [
        ["File", "HTTP", "SQL Features Demonstrated"],
        ["create.php", "POST", "ACID Transaction, SELECT ... FOR UPDATE (row lock), INSERT, multi-table JOIN"],
        ["read.php", "GET", "Multi-table INNER JOIN across 3 tables + 2 aliases, dynamic WHERE filters"],
        ["update.php", "POST", "Status state machine validation, Transaction + lock for rescheduling"],
        ["delete.php", "POST", "Soft-delete (UPDATE status='cancelled' instead of DELETE FROM)"],
        ["stats.php", "GET", "COUNT(*), GROUP BY status, GROUP BY lawyer_id, LEFT JOIN aggregates"],
    ]
    styled_table(appt_files, [90, 45, 369])

    # ─── 5.4 Lawyers ────────────────────────────────────────────────────────
    story.append(Paragraph("5.4 Lawyers Directory (backend/lawyers/read.php)", h2_style))
    story.append(Paragraph(
        "Returns a list of all lawyers, joined with their user profiles. Supports optional query parameters for "
        "filtering by specialization, district, and text search (LIKE queries). Used by the Search Lawyers page.",
        body_style
    ))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 6: CRITICAL SQL OPERATIONS
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("6. Critical SQL Operations (The 5 Required Techniques)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph(
        "This section is the <b>most important part of the project</b> for your CSE 3104 submission. "
        "Each technique is explained with the actual SQL from the codebase.",
        body_style
    ))

    # ─── 6.1 Transactions + Locks ───────────────────────────────────────────
    story.append(Paragraph("6.1 ACID Transactions + SELECT ... FOR UPDATE", h2_style))
    story.append(Paragraph("<b>File:</b> <code>backend/appointments/create.php</code>", body_bold))
    story.append(Paragraph(
        "<b>The Problem:</b> What happens if two clients try to book the same lawyer at the same time? "
        "Without protection, both requests could check 'is this slot free?' simultaneously, both see 'yes', "
        "and both insert a booking -- creating a double-booking disaster.",
        body_style
    ))
    story.append(Paragraph(
        "<b>The Solution:</b> We wrap the check-and-insert in a database <b>Transaction</b> and use "
        "<code>SELECT ... FOR UPDATE</code> to acquire an <b>exclusive row lock</b>.",
        body_style
    ))

    add_code_block([
        "// Step 1: Start a transaction",
        "$pdo->beginTransaction();",
        "",
        "// Step 2: Lock the time slot (FOR UPDATE = exclusive lock)",
        "$conflict_sql = \"",
        "    SELECT id FROM appointments",
        "    WHERE lawyer_id = :lawyer_id",
        "      AND appointment_date = :appointment_date",
        "      AND appointment_time = :appointment_time",
        "      AND status IN ('pending', 'accepted')",
        "    FOR UPDATE\";",
        "",
        "// Step 3: If a conflicting row exists, rollback",
        "if ($existing_conflict) {",
        "    $pdo->rollBack();",
        "    send_json(false, null, 'Time slot already reserved.', 409);",
        "}",
        "",
        "// Step 4: Insert the new appointment",
        "$insert_stmt->execute([...]);",
        "",
        "// Step 5: Commit the transaction",
        "$pdo->commit();",
    ], "Annotated Code: The Double-Booking Guard")

    story.append(Paragraph("<b>How FOR UPDATE works step by step:</b>", h3_style))
    story.append(Paragraph(
        "1. <b>Client A</b> sends a booking request for Lawyer #1 on Aug 20 at 10:30 AM.<br/>"
        "2. PHP starts a transaction and executes SELECT ... FOR UPDATE. MySQL finds no conflicting rows, "
        "but <b>locks the index range</b> so no other transaction can modify or insert into this slot.<br/>"
        "3. <b>Client B</b> sends the same booking request 50 milliseconds later.<br/>"
        "4. Client B's SELECT ... FOR UPDATE <b>blocks</b> (waits) because Client A holds the lock.<br/>"
        "5. Client A inserts the appointment and commits. The lock is released.<br/>"
        "6. Client B's SELECT now executes and <b>finds the conflicting row</b>. PHP rolls back and returns 409 Conflict.<br/><br/>"
        "This is called <b>Pessimistic Concurrency Control</b> -- we lock first, then check.",
        body_style
    ))

    add_warning(
        "<b>ACID</b> stands for: <b>A</b>tomicity (all or nothing), <b>C</b>onsistency (data stays valid), "
        "<b>I</b>solation (concurrent transactions don't interfere), <b>D</b>urability (committed data survives crashes)."
    )

    # ─── 6.2 Multi-Table JOIN ───────────────────────────────────────────────
    story.append(Paragraph("6.2 Multi-Table SQL JOIN", h2_style))
    story.append(Paragraph("<b>File:</b> <code>backend/appointments/read.php</code>", body_bold))
    story.append(Paragraph(
        "<b>The Problem:</b> The appointments table only stores foreign key IDs (client_id=2, lawyer_id=1). "
        "But the user wants to see names: 'Sadia Anwar booked Adv. Rahim Karim'. How do we resolve IDs to names?",
        body_style
    ))
    story.append(Paragraph(
        "<b>The Solution:</b> SQL JOIN. One query touches <b>three tables</b> (with the users table used <b>twice</b> -- "
        "once for the client's name, once for the lawyer's name):",
        body_style
    ))

    add_code_block([
        "SELECT",
        "    a.id, a.appointment_date, a.status,",
        "    c.name AS client_name,     -- from users (client)",
        "    c.email AS client_email,",
        "    u.name AS lawyer_name,     -- from users (lawyer)",
        "    l.specialization, l.consultation_fee",
        "FROM appointments a",
        "INNER JOIN users c   ON a.client_id = c.id   -- client details",
        "INNER JOIN lawyers l ON a.lawyer_id = l.id   -- lawyer profile",
        "INNER JOIN users u   ON l.user_id = u.id     -- lawyer's name",
        "WHERE 1=1",
        "ORDER BY a.appointment_date DESC;",
    ], "SQL: Multi-Table INNER JOIN (3 tables, 4 aliases)")

    story.append(Paragraph(
        "<b>Why use aliases?</b> We reference the <code>users</code> table twice. To distinguish them, "
        "we alias one as <code>c</code> (client) and the other as <code>u</code> (the lawyer's user record). "
        "The JOIN chain is: appointments -> users (client) + appointments -> lawyers -> users (lawyer).",
        body_style
    ))

    # ─── 6.3 Status State Machine ──────────────────────────────────────────
    story.append(Paragraph("6.3 Status State Machine (Server-Side Validation)", h2_style))
    story.append(Paragraph("<b>File:</b> <code>backend/appointments/update.php</code>", body_bold))
    story.append(Paragraph(
        "An appointment's status follows strict rules. You can't jump from 'pending' directly to 'completed' -- "
        "the lawyer must accept it first. The backend enforces these rules with a PHP array that maps each status "
        "to its allowed next states:",
        body_style
    ))

    add_code_block([
        "$allowed_transitions = [",
        "    'pending'   => ['accepted', 'rejected', 'cancelled'],",
        "    'accepted'  => ['completed', 'cancelled', 'pending'],",
        "    'rejected'  => ['pending'],  // optional reopen",
        "    'completed' => [],           // terminal - no changes allowed",
        "    'cancelled' => [],           // terminal - no changes allowed",
        "];",
        "",
        "if (!in_array($new_status, $allowed_transitions[$curr_status])) {",
        "    send_json(false, null,",
        "        \"Cannot change from '{$curr_status}' to '{$new_status}'.\", 400);",
        "}",
    ], "PHP Code: Status Transition Validation")

    transitions_data = [
        ["Current Status", "Allowed Next States", "Who Can Do It"],
        ["pending", "accepted, rejected, cancelled", "Lawyer accepts/rejects; Client cancels"],
        ["accepted", "completed, cancelled", "Lawyer marks done; Either party cancels"],
        ["rejected", "pending (reopen)", "Admin can reopen"],
        ["completed", "(none -- terminal)", "No further changes allowed"],
        ["cancelled", "(none -- terminal)", "No further changes allowed"],
    ]
    styled_table(transitions_data, [100, 170, 234])

    # ─── 6.4 Soft-Delete ───────────────────────────────────────────────────
    story.append(Paragraph("6.4 Soft-Delete (Preserving Audit History)", h2_style))
    story.append(Paragraph("<b>File:</b> <code>backend/appointments/delete.php</code>", body_bold))
    story.append(Paragraph(
        "<b>Hard delete</b> (<code>DELETE FROM appointments WHERE id = ?</code>) permanently removes the row. "
        "The data is gone forever.<br/><br/>"
        "<b>Soft delete</b> (what we use) updates <code>status = 'cancelled'</code> and stores the reason. "
        "The row remains in the database for auditing, reporting, and compliance.",
        body_style
    ))

    add_code_block([
        "// Soft-cancel (NOT hard delete)",
        "UPDATE appointments",
        "SET status = 'cancelled',",
        "    cancellation_reason = :reason,",
        "    updated_at = NOW()",
        "WHERE id = :id;",
    ], "SQL: Soft-Delete Query")

    add_tip(
        "Soft-delete is a best practice in production systems. Imagine a lawyer disputes that a client cancelled -- "
        "with soft-delete, we have the complete history. With hard-delete, the evidence is gone."
    )

    # ─── 6.5 SQL Aggregates ─────────────────────────────────────────────────
    story.append(Paragraph("6.5 SQL Aggregates with GROUP BY", h2_style))
    story.append(Paragraph("<b>File:</b> <code>backend/appointments/stats.php</code>", body_bold))
    story.append(Paragraph(
        "The admin and lawyer dashboards need summary statistics: 'How many pending cases does Lawyer #1 have?' "
        "Instead of fetching all rows and counting in PHP, we let MySQL do the counting with aggregate functions:",
        body_style
    ))

    add_code_block([
        "-- Lawyer-specific: count appointments by status",
        "SELECT status, COUNT(*) as count",
        "FROM appointments",
        "WHERE lawyer_id = :lawyer_id",
        "GROUP BY status;",
        "",
        "-- Result example:",
        "-- | status    | count |",
        "-- |-----------|-------|",
        "-- | pending   |   3   |",
        "-- | accepted  |   5   |",
        "-- | completed |  12   |",
    ], "SQL: GROUP BY Aggregate Query")

    add_code_block([
        "-- Platform-wide: appointments per specialization",
        "SELECT l.specialization, COUNT(a.id) as appointment_count",
        "FROM lawyers l",
        "LEFT JOIN appointments a ON l.id = a.lawyer_id",
        "GROUP BY l.specialization;",
    ], "SQL: Specialization Breakdown (Admin Dashboard)")

    story.append(Paragraph(
        "<b>Why LEFT JOIN here?</b> If a lawyer has zero appointments, an INNER JOIN would exclude them. "
        "LEFT JOIN keeps all lawyers and shows 0 for those with no bookings.",
        body_style
    ))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 7: FRONTEND REACT APPLICATION
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("7. Frontend React Application", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    # ─── 7.1 Project Setup ──────────────────────────────────────────────────
    story.append(Paragraph("7.1 Project Setup (Vite + Tailwind CSS + Material Design 3)", h2_style))
    story.append(Paragraph(
        "The frontend is a <b>Single-Page Application (SPA)</b> built with React. That means the browser loads "
        "one HTML file, and JavaScript dynamically swaps content as you navigate -- no full-page reloads.",
        body_style
    ))

    tech_data = [
        ["Technology", "What It Does", "Config File"],
        ["Vite", "Ultra-fast dev server and bundler. Compiles JSX/CSS on the fly.", "vite.config.js"],
        ["React 18", "Component-based UI library. Each page/widget is a reusable 'component'.", "package.json"],
        ["React Router v6", "Client-side routing. Maps URL paths (/lawyers, /admin/dashboard) to components.", "App.jsx"],
        ["Tailwind CSS", "Utility-first CSS framework. Write styles as class names (e.g., 'rounded-xl p-6').", "tailwind.config.js"],
        ["Material Design 3", "Google's design system. We use its color tokens, typography, and elevation system.", "index.css"],
    ]
    styled_table(tech_data, [90, 250, 164])

    # ─── 7.2 API Layer ──────────────────────────────────────────────────────
    story.append(Paragraph("7.2 API Layer (frontend/src/api/)", h2_style))
    story.append(Paragraph(
        "The API layer is a set of JavaScript files that wrap HTTP fetch calls. This keeps API URLs and request "
        "logic in one place instead of scattered across components.",
        body_style
    ))

    story.append(Paragraph("<b>config.js</b> -- The Universal Fetch Wrapper", h3_style))
    story.append(Paragraph(
        "Contains <code>apiRequest(endpoint, options)</code> which: (1) prepends the base URL, (2) sets JSON headers, "
        "(3) includes session cookies (<code>credentials: 'include'</code>), (4) tries the primary server (port 8000), "
        "and if that fails, (5) falls back to XAMPP Apache (port 80). This means the frontend works whether you use "
        "<code>run.py</code> or standard XAMPP.",
        body_style
    ))

    add_code_block([
        "// API request with automatic fallback (config.js)",
        "export async function apiRequest(endpoint, options = {}) {",
        "    try {",
        "        return await tryFetch('http://localhost:8000');",
        "    } catch (err) {",
        "        return await tryFetch('http://localhost/lawyer-finder-api');",
        "    }",
        "}",
    ], "Simplified Code: API Fallback Pattern")

    api_files = [
        ["API File", "Functions Exported", "Backend Endpoints Called"],
        ["auth.js", "login(), register(), logout(), getMe()", "/auth/login.php, /auth/register.php, etc."],
        ["appointments.js", "create(), getAll(), update(), cancel(), getStats()", "/appointments/create.php, read.php, etc."],
        ["lawyers.js", "getAll(), getById(), search()", "/lawyers/read.php"],
    ]
    styled_table(api_files, [90, 200, 214])

    # ─── 7.3 AuthContext ────────────────────────────────────────────────────
    story.append(Paragraph("7.3 Authentication Context (AuthContext.jsx)", h2_style))
    story.append(Paragraph(
        "React <b>Context</b> is a way to share data across all components without passing props manually. "
        "AuthContext stores: the current user object, login/logout functions, and role detection helpers "
        "(<code>isClient</code>, <code>isLawyer</code>, <code>isAdmin</code>).",
        body_style
    ))

    story.append(Paragraph("<b>Key Feature: 1-Click Role Switcher</b>", h3_style))
    story.append(Paragraph(
        "For Checkpoint 1 demonstration, the TopBar includes a role switcher pill that instantly switches between "
        "Client, Lawyer, and Admin views -- without logging out and logging in again. This uses the "
        "<code>switchRole(role)</code> function which swaps the mock user in state and localStorage.",
        body_style
    ))

    add_code_block([
        "// Role switcher (AuthContext.jsx)",
        "const switchRole = (role) => {",
        "    let mock;",
        "    if (role === 'lawyer') {",
        "        mock = { id: 6, name: 'Adv. Rahim Karim', role: 'lawyer', ... };",
        "    } else if (role === 'admin') {",
        "        mock = { id: 1, name: 'System Admin', role: 'admin', ... };",
        "    } else {",
        "        mock = { id: 2, name: 'Sadia Anwar', role: 'client', ... };",
        "    }",
        "    setUser(mock);",
        "    localStorage.setItem('lawyer_finder_user', JSON.stringify(mock));",
        "};",
    ], "Code: The Role Switcher Function")

    # ─── 7.4 Routing ────────────────────────────────────────────────────────
    story.append(Paragraph("7.4 Routing (App.jsx)", h2_style))
    story.append(Paragraph(
        "React Router maps URL paths to React components. Here are all routes defined in App.jsx:",
        body_style
    ))

    routes_data = [
        ["URL Path", "Component", "Module"],
        ["/", "LandingPage", "Public"],
        ["/login", "LoginPage", "Public"],
        ["/register", "RegisterPage", "Public"],
        ["/lawyers", "SearchLawyersPage", "Public"],
        ["/lawyers/:id", "LawyerProfilePage", "Public"],
        ["/book/:id", "BookAppointmentPage", "Public"],
        ["/client/appointments", "MyAppointmentsPage", "Client"],
        ["/client/profile", "ClientEditProfilePage", "Client"],
        ["/lawyer/requests", "IncomingRequestsPage", "Lawyer"],
        ["/lawyer/profile", "LawyerEditProfilePage", "Lawyer"],
        ["/admin/dashboard", "AdminDashboardPage", "Admin"],
    ]
    styled_table(routes_data, [140, 160, 204])

    # ─── 7.5 Components ────────────────────────────────────────────────────
    story.append(Paragraph("7.5 Reusable Components (frontend/src/components/)", h2_style))

    comps_data = [
        ["Component", "What It Renders", "Used By"],
        ["TopBar.jsx", "Navigation header with logo, nav links, role switcher pill, and login/logout button.", "Every page (via App.jsx)"],
        ["Footer.jsx", "Page footer with university name, project info, and copyright.", "Every page (via App.jsx)"],
        ["LawyerCard.jsx", "A card displaying a lawyer's name, specialization, rating, fee, and a 'Book' button.", "SearchLawyersPage, LandingPage"],
        ["BookingModal.jsx", "A modal dialog with date picker, time slot selector, and case description field.", "LawyerProfilePage, SearchLawyersPage"],
        ["CalendarPicker.jsx", "An interactive calendar widget for selecting appointment dates.", "BookingModal"],
        ["StatusBadge.jsx", "A small colored pill showing the appointment status (green=accepted, yellow=pending, etc.).", "MyAppointmentsPage, IncomingRequestsPage, AdminDashboardPage"],
        ["Toast.jsx", "A notification popup that appears at the bottom of the screen for 4 seconds.", "Global (triggered by AuthContext.showToast)"],
    ]
    styled_table(comps_data, [100, 220, 184])

    # ─── 7.6 Pages ──────────────────────────────────────────────────────────
    story.append(Paragraph("7.6 Pages (All 11 Screens)", h2_style))

    story.append(Paragraph("<b>Public Module Pages:</b>", h3_style))
    story.append(Paragraph(
        "<b>LandingPage.jsx (/)</b> -- The homepage. Features a hero section with search bar, trust statistics "
        "(animated counters), curated lawyer cards, service categories with icons, and an architecture diagram "
        "showing the 3-tier stack. This is the first thing visitors see.<br/><br/>"
        "<b>SearchLawyersPage.jsx (/lawyers)</b> -- A full-featured search page. Users can filter lawyers by "
        "specialization (clickable chips), district (dropdown), and sort by rating. Each result renders as a "
        "LawyerCard with a 'Quick Book' button that opens the BookingModal.<br/><br/>"
        "<b>LawyerProfilePage.jsx (/lawyers/:id)</b> -- A detailed profile page showing the lawyer's bio, credentials, "
        "bar license, experience, fee, rating, and reviews. Includes an embedded calendar booking widget.<br/><br/>"
        "<b>BookAppointmentPage.jsx (/book/:id)</b> -- A dedicated booking form page (alternative to the modal). "
        "Includes date picker, time slot grid, and case description textarea.<br/><br/>"
        "<b>LoginPage.jsx (/login) &amp; RegisterPage.jsx (/register)</b> -- Authentication forms with Material 3 "
        "styled inputs, validation feedback, and role selection (client or lawyer).",
        body_style
    ))

    story.append(Paragraph("<b>Client Module Pages:</b>", h3_style))
    story.append(Paragraph(
        "<b>MyAppointmentsPage.jsx (/client/appointments)</b> -- Shows all appointments for the logged-in client. "
        "Each appointment card shows the lawyer's name, date, time, status (via StatusBadge), and a Cancel button. "
        "Cancellation opens a confirmation dialog that calls delete.php (soft-cancel). Data is fetched from "
        "read.php with <code>?client_id=X</code> filter.<br/><br/>"
        "<b>ClientEditProfilePage.jsx (/client/profile)</b> -- Profile editing form for clients.",
        body_style
    ))

    story.append(Paragraph("<b>Lawyer Module Pages:</b>", h3_style))
    story.append(Paragraph(
        "<b>IncomingRequestsPage.jsx (/lawyer/requests)</b> -- The lawyer's case management dashboard. Shows "
        "aggregate statistics at the top (total cases, pending, accepted, completed -- fetched from stats.php). "
        "Below, lists all incoming appointment requests with Accept/Reject/Complete action buttons. Each action "
        "calls update.php with the appropriate status transition.<br/><br/>"
        "<b>LawyerEditProfilePage.jsx (/lawyer/profile)</b> -- Profile editing form for lawyers.",
        body_style
    ))

    story.append(Paragraph("<b>Admin Module Pages:</b>", h3_style))
    story.append(Paragraph(
        "<b>AdminDashboardPage.jsx (/admin/dashboard)</b> -- Platform-wide overview. Shows total clients, total "
        "lawyers, total appointments, and appointments this week (from stats.php without lawyer_id filter). "
        "Displays a master appointments table with all bookings across the platform, filterable by status. "
        "Includes a specialization breakdown chart.",
        body_style
    ))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 8: DATA FLOW LIFECYCLE
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("8. How Data Flows: A Complete Request Lifecycle", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph(
        "Let's trace what happens when a client books an appointment, step by step:",
        body_style
    ))

    flow_data = [
        ["Step", "Layer", "What Happens"],
        ["1", "User", "Client clicks 'Book Appointment' on LawyerProfilePage and fills in the date, time, and case description."],
        ["2", "React", "BookingModal calls appointmentsApi.create({ lawyer_id: 1, appointment_date: '2026-08-20', appointment_time: '10:30', case_description: '...' })"],
        ["3", "API Layer", "config.js wraps the data in a JSON POST request and sends it to http://localhost:8000/backend/appointments/create.php"],
        ["4", "PHP Backend", "create.php receives the JSON body, validates all fields, and verifies both the client and lawyer exist in the database."],
        ["5", "MySQL\n(Transaction)", "PHP calls $pdo->beginTransaction(). MySQL creates an isolated workspace."],
        ["6", "MySQL\n(Lock)", "PHP executes SELECT ... FOR UPDATE. MySQL acquires an exclusive lock on the lawyer's time slot."],
        ["7", "MySQL\n(Insert)", "No conflict found. PHP executes INSERT INTO appointments. MySQL writes the new row."],
        ["8", "MySQL\n(Commit)", "PHP calls $pdo->commit(). MySQL makes the changes permanent and releases the lock."],
        ["9", "PHP Backend", "create.php fetches the new appointment with a JOIN query (to get client name, lawyer name, etc.) and calls send_json(true, $data, 'Success!', 201)."],
        ["10", "React", "The Promise resolves. BookingModal shows a success toast, closes the modal, and navigates to MyAppointmentsPage."],
        ["11", "React", "MyAppointmentsPage calls appointmentsApi.getAll({client_id: 2}), which hits read.php. The new appointment appears in the list with status='pending'."],
    ]
    t_flow = Table(flow_data, colWidths=[30, 70, 404])
    t_flow.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7.5),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, SURFACE_BG]),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_flow)
    story.append(Spacer(1, 10))

    add_tip(
        "This entire cycle -- from user click to database write to UI update -- typically takes less than 200 milliseconds."
    )

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 9: HOW TO RUN
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("9. How to Run the Project (Quickstart Guide)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph("<b>Prerequisites:</b>", h2_style))
    prereqs = [
        ["Software", "Version", "Why Needed", "Download"],
        ["XAMPP", "8.x+", "Provides PHP and MySQL", "apachefriends.org"],
        ["Node.js", "18+", "Runs the React dev server", "nodejs.org"],
        ["Python", "3.8+", "Runs the launcher script", "python.org"],
    ]
    styled_table(prereqs, [80, 60, 200, 164])

    story.append(Paragraph("<b>Step-by-Step Instructions:</b>", h2_style))
    story.append(Paragraph(
        "<b>Step 1:</b> Open XAMPP Control Panel and start <b>MySQL</b> (Apache is optional -- we use PHP's built-in server).<br/><br/>"
        "<b>Step 2:</b> Open a terminal/command prompt in the project root folder.<br/><br/>"
        "<b>Step 3:</b> Install frontend dependencies (first time only):<br/>"
        "<code>cd frontend &amp;&amp; npm install &amp;&amp; cd ..</code><br/><br/>"
        "<b>Step 4:</b> Run the project:<br/>"
        "<code>python run.py</code><br/><br/>"
        "<b>What run.py does automatically:</b><br/>"
        "1. Finds PHP at <code>C:\\xampp\\php\\php.exe</code> (or in your PATH)<br/>"
        "2. Checks if the <code>lawyer_finder</code> database exists -- if not, imports schema.sql<br/>"
        "3. Starts the PHP backend server on <b>http://localhost:8000</b><br/>"
        "4. Starts the Vite React dev server on <b>http://localhost:5173</b><br/>"
        "5. Opens your browser automatically<br/>"
        "6. Press <b>Ctrl+C</b> to stop both servers cleanly.",
        body_style
    ))

    add_callout(
        "<b>Alternative: Manual Setup (without run.py)</b><br/><br/>"
        "Terminal 1 (Backend): <code>C:\\xampp\\php\\php.exe -S localhost:8000 -t backend/</code><br/>"
        "Terminal 2 (Frontend): <code>cd frontend &amp;&amp; npm run dev</code><br/>"
        "Database: Open phpMyAdmin, create database 'lawyer_finder', import backend/database/schema.sql"
    )

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 10: TEST ACCOUNTS
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("10. Test Accounts &amp; Credentials", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    story.append(Paragraph(
        "Use these accounts to test all three modules. All passwords are: <code>password123</code>",
        body_style
    ))

    cred_data = [
        ["Role", "Email", "Password", "What To Test"],
        ["Client", "sadia@gmail.com", "password123", "Search lawyers, book appointments, view My Appointments, cancel bookings"],
        ["Lawyer", "rahim@lawyer.com", "password123", "View Incoming Requests, accept/reject cases, see stats dashboard"],
        ["Admin", "admin@lawyerfinder.com", "password123", "View platform stats, see all appointments, filter by status"],
    ]
    styled_table(cred_data, [50, 140, 80, 234])

    add_tip(
        "You can also use the <b>Role Switcher pill</b> in the top navigation bar to instantly switch between "
        "Client, Lawyer, and Admin views without logging out."
    )

    story.append(Paragraph("<b>Suggested Testing Workflow:</b>", h2_style))
    story.append(Paragraph(
        "1. Open the app (http://localhost:5173) -- you land on the homepage as 'Sadia Anwar' (client).<br/>"
        "2. Click 'Find Lawyers' -> browse the directory -> click a lawyer -> book an appointment.<br/>"
        "3. Go to 'My Appointments' -- see your new booking with status 'pending'.<br/>"
        "4. Switch to Lawyer view (click the role switcher) -> go to 'Incoming Requests' -> Accept the booking.<br/>"
        "5. Switch back to Client -> go to 'My Appointments' -> status is now 'accepted'.<br/>"
        "6. Switch to Admin -> go to 'Dashboard' -> see the appointment in the master list.<br/>"
        "7. Try cancelling an appointment from the Client view -- the soft-delete stores the reason.",
        body_style
    ))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════════
    # SECTION 11: GLOSSARY
    # ═══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("11. Glossary of Terms for Beginners", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8))

    glossary = [
        ["Term", "Definition"],
        ["API", "Application Programming Interface -- a set of rules for how two programs communicate. Our PHP backend is an API that the React frontend calls."],
        ["ACID", "Atomicity, Consistency, Isolation, Durability -- four guarantees that database transactions provide."],
        ["AUTO_INCREMENT", "A MySQL feature that automatically assigns the next integer value to a column when a new row is inserted."],
        ["bcrypt", "A password hashing algorithm. It converts 'password123' into a long random-looking string. It's one-way (you can't reverse it)."],
        ["CORS", "Cross-Origin Resource Sharing -- browser security mechanism. Without proper CORS headers, the browser blocks requests from port 5173 to port 8000."],
        ["CRUD", "Create, Read, Update, Delete -- the four basic database operations."],
        ["ENUM", "A MySQL column type that restricts values to a fixed list (e.g., only 'pending', 'accepted', 'rejected', 'completed', 'cancelled')."],
        ["Foreign Key (FK)", "A column that references the primary key of another table. It creates a link between two tables."],
        ["GROUP BY", "A SQL clause that groups rows with the same value and lets you apply aggregate functions (COUNT, SUM, AVG) to each group."],
        ["InnoDB", "MySQL's default storage engine. It supports transactions, row-level locking, and foreign key constraints."],
        ["JOIN", "A SQL operation that combines rows from two or more tables based on a related column (usually a foreign key)."],
        ["JSON", "JavaScript Object Notation -- a lightweight data format used for API communication. Example: {\"name\": \"Sadia\", \"role\": \"client\"}"],
        ["JSX", "JavaScript XML -- React's syntax for writing HTML-like code inside JavaScript files."],
        ["Normalization (3NF)", "Database design technique to eliminate data redundancy. Instead of repeating data, we use foreign keys to reference shared data."],
        ["PDO", "PHP Data Objects -- PHP's built-in library for connecting to databases securely using prepared statements."],
        ["Primary Key (PK)", "A column (or set of columns) that uniquely identifies each row in a table. Usually 'id'."],
        ["Prepared Statement", "A SQL query with placeholders (:name) instead of raw values. Prevents SQL injection attacks."],
        ["REST API", "Representational State Transfer -- an architectural style where each URL endpoint represents a resource and HTTP methods (GET, POST, PUT, DELETE) represent actions."],
        ["SELECT ... FOR UPDATE", "A MySQL query that reads rows AND locks them, preventing other transactions from modifying them until the lock is released."],
        ["Session", "A way for the server to remember who is logged in. PHP stores session data on the server and identifies the user by a cookie (PHPSESSID)."],
        ["Soft-Delete", "Instead of removing a database row permanently (DELETE), we set a flag (status='cancelled') so the data is preserved for audit purposes."],
        ["SPA", "Single-Page Application -- a web app that loads one HTML page and dynamically updates content using JavaScript (no full-page reloads)."],
        ["SQL Injection", "A security attack where malicious SQL is inserted through user input. Prevented by using prepared statements with parameterized queries."],
        ["Transaction", "A sequence of SQL operations that either ALL succeed (commit) or ALL fail (rollback). Ensures data consistency."],
        ["Vite", "A modern JavaScript build tool. Much faster than Webpack. Serves React files with hot-module replacement during development."],
    ]
    t_gloss = Table(glossary, colWidths=[120, 384])
    t_gloss.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7.5),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, SURFACE_BG]),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTNAME', (0, 1), (0, -1), 'Courier'),
    ]))
    story.append(t_gloss)

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=12))
    story.append(Paragraph(
        "--- End of Lawyer Finder Codebase Guide ---",
        ParagraphStyle('EndNote', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=PRIMARY, alignment=1)
    ))
    story.append(Paragraph(
        "Generated automatically by generate_pdf_guide.py using ReportLab.",
        ParagraphStyle('EndSub', fontName='Helvetica', fontSize=8, leading=10, textColor=TEXT_MUTED, alignment=1)
    ))

    # ═══════════════════════════════════════════════════════════════════════════
    # BUILD
    # ═══════════════════════════════════════════════════════════════════════════
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] PDF guide generated at: {os.path.abspath(PDF_OUTPUT_PATH)}")


if __name__ == '__main__':
    build_pdf()
