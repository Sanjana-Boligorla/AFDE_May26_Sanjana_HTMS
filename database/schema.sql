-- ============================================================
-- Helpdesk Ticket Management System — Database Schema
-- Database: MySQL 8.x
-- ============================================================

CREATE DATABASE IF NOT EXISTS helpdesk_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE helpdesk_db;

-- ============================================================
-- Table: tickets
-- Core support ticket entity
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    employee_name    VARCHAR(100)  NOT NULL,
    department       VARCHAR(100)  NOT NULL,
    issue_category   VARCHAR(100)  NOT NULL,
    description      TEXT          NOT NULL,
    priority         ENUM('Low', 'Medium', 'High', 'Critical')        NOT NULL DEFAULT 'Medium',
    status           ENUM('Open', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
    resolution_notes TEXT          NULL,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_status   (status),
    INDEX idx_priority (priority),
    INDEX idx_category (issue_category),
    INDEX idx_created  (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: ticket_comments
-- Tracks the full update/comment history for each ticket.
-- One ticket can have many comments (one-to-many relationship).
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_comments (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id    INT          NOT NULL,
    author       VARCHAR(100) NOT NULL,
    comment_text TEXT         NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key → tickets.id (cascade delete: remove comments when ticket is deleted)
    CONSTRAINT fk_comment_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON DELETE CASCADE,

    INDEX idx_ticket_id (ticket_id),
    INDEX idx_comment_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Sample seed data — tickets
-- ============================================================
INSERT INTO tickets (employee_name, department, issue_category, description, priority, status) VALUES
('Alice Johnson',  'Engineering',  'VPN Issue',            'Unable to connect to VPN from home network since yesterday.',       'High',     'Open'),
('Bob Smith',      'HR',           'Password Reset',       'Forgot my Windows login password after laptop restart.',            'Medium',   'In Progress'),
('Carol White',    'Finance',      'Software Installation','Need MS Office 365 installed on new laptop.',                       'Low',      'Open'),
('David Lee',      'Operations',  'Laptop Issue',         'Laptop screen flickering intermittently during video calls.',        'High',     'In Progress'),
('Eva Martinez',   'Marketing',    'Email Access',         'Cannot access shared marketing mailbox since account migration.',    'Critical', 'Open'),
('Frank Turner',   'Engineering',  'Network Connectivity', 'Intermittent network drops every 30 minutes in conference room 4.', 'Medium',   'Resolved'),
('Grace Kim',      'Legal',        'Hardware Request',     'Requesting an additional monitor for dual-screen setup.',           'Low',      'Closed'),
('Henry Brown',    'Sales',        'VPN Issue',            'VPN client crashes on Windows 11 after recent upgrade.',            'High',     'Open');

-- ============================================================
-- Sample seed data — ticket_comments
-- ============================================================
INSERT INTO ticket_comments (ticket_id, author, comment_text) VALUES
(1, 'IT Support',  'Ticket received. Checking VPN server logs.'),
(1, 'IT Support',  'Issue identified — VPN certificate expired. Renewing now.'),
(2, 'IT Support',  'Password reset initiated. Temporary credentials sent via SMS.'),
(4, 'IT Support',  'Laptop sent for hardware inspection. Likely GPU driver issue.'),
(4, 'David Lee',   'Confirmed — issue persists even after driver reinstall.'),
(5, 'IT Support',  'Escalated to email admin team. ETA 2 hours.'),
(6, 'IT Support',  'Network switch in conference room 4 replaced. Issue resolved.'),
(6, 'Frank Turner','Confirmed working. No drops observed for 24 hours. Thanks!');

-- ============================================================
-- Phase 2 — Historical Tickets (ETL target table)
-- ============================================================

CREATE TABLE IF NOT EXISTS historical_tickets (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    employee_name         VARCHAR(100)  NOT NULL,
    department            VARCHAR(100)  NOT NULL,
    issue_category        VARCHAR(100)  NOT NULL,
    description           TEXT          NOT NULL,
    priority              VARCHAR(20)   NOT NULL,
    status                VARCHAR(20)   NOT NULL,
    created_date          DATE          NOT NULL,
    resolved_date         DATE          NULL,
    resolution_time_hours FLOAT         NULL,
    created_month         VARCHAR(7)    NOT NULL  COMMENT 'Format: YYYY-MM',
    created_quarter       VARCHAR(6)    NOT NULL  COMMENT 'Format: YYYY-QN',
    is_resolved           TINYINT(1)    NOT NULL  DEFAULT 0,
    resolution_bucket     VARCHAR(20)   NULL      COMMENT 'Fast/Normal/Slow/Very Slow',

    -- indexes for analytics queries
    INDEX idx_dept          (department),
    INDEX idx_category      (issue_category),
    INDEX idx_priority      (priority),
    INDEX idx_status        (status),
    INDEX idx_created_month (created_month),
    INDEX idx_quarter       (created_quarter),
    INDEX idx_is_resolved   (is_resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
