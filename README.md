# University Dashboard Module

## Overview

The **University Dashboard** is a custom Odoo 17 OWL (Odoo Web Library) component designed to present key statistics and visual analytics for a university management system. It provides a high-level overview of various academic entities such as colleges, departments, programs, and courses, as well as user demographics and academic performance through KPIs and interactive charts.

---

## Features

- 🎯 **KPI Cards**: Quickly view the count of colleges, departments, programs, and courses.
- 👥 **User Analytics**: Breakdown of students, doctors, and admins by gender and total counts.
- 📊 **Interactive Charts**:
  - User distribution by role and gender
  - Semester-wise data
  - Course-related performance
  - Learning outcomes and PLOs (Program Learning Outcomes)
- 🔍 **Filters**: Dynamically filter data by:
  - College
  - Department
  - Program
  - Course
  - Semester
  - Academic Year
  - Gender

---

## Components

- `KPICard`: Displays numeric metrics like entity counts.
- `ChartComponent`: Displays graphical charts using chart data and options passed as props.
- `UniversityDashboard`: The main OWL component that integrates KPIs, charts, filters, and handles data loading.

---

## Technical Details

- Built with **Odoo OWL** framework.
- Uses **Odoo's ORM service** to fetch and aggregate data.
- Implements **component-based architecture** using `Component`, `useState`, `onMounted` from `@odoo/owl`.
- Supports **dynamic domain filtering** to refine analytics based on user-selected filters.

---

## Usage

1. **Installation**:
   - Place the dashboard module inside your Odoo custom addons folder.
   - Add it to the manifest `depends` list if integrating into another module.

2. **Activation**:
   - Call the action using the key: `"university.dashboard"` from a menu item or button.

3. **Customization**:
   - To extend charts or filters, modify the `fetchData` and domain logic inside the `UniversityDashboard` component.

---

## Dependencies

- Odoo 17
- Chart.js (indirectly via `ChartComponent`)
- OWL framework (native in Odoo 17)

---

## Example

To trigger the dashboard:

```xml
<record id="action_university_dashboard" model="ir.actions.client">
    <field name="name">University Dashboard</field>
    <field name="tag">university.dashboard</field>
</record>
