/** @odoo-module **/

import { Component, useState, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { KPICard } from "@university_dashboard/components/kpi_card";
import { ChartComponent } from "@university_dashboard/components/chart";

class UniversityDashboard extends Component {
    static template = "university.Dashboard";
    static components = { KPICard, ChartComponent };

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");

        this.state = useState({
            // KPI Data
            counts: {
                college: 0,
                department: 0,
                program: 0,
                course: 0
            },

            userData: {
                student: { male: 0, female: 0, total: 0 },
                doctor: { male: 0, female: 0, total: 0 },
                admin: { male: 0, female: 0, total: 0 },
                allUsers: 0
            },

            userChartData: null,
            semesterChartData: null,
            semesterChartOptions: null,
            courseChartData: null,
            courseChartOptions: null,
            outcomeChartData: null,
            outcomeChartOptions: null,
            ploChartData: null,
            ploChartOptions: null,

            dataLoaded: false,

            colleges: [],
            departments: [],
            programs: [],
            courses: [],
            semesters: [],
            academic_years: [],
            genders: [],


            filters: {
                college_id: null,
                department_id: null,
                program_id: null,
                course_id: null,
                semester_id: null,
                academic_year_id: null,
                gender_id: null,
            },

            loading: true,
            error: null
        });

        this.onKPIClicked = this.onKPIClicked.bind(this);
        this.onUserChartClicked = this.onUserChartClicked.bind(this);
        this.loadFilterOptions = this.loadFilterOptions.bind(this);

        this.onCollegeFilterChange = this.onCollegeFilterChange.bind(this);
        this.onDepartmentFilterChange = this.onDepartmentFilterChange.bind(this);
        this.onProgramFilterChange = this.onProgramFilterChange.bind(this);
        this.onCourseFilterChange = this.onCourseFilterChange.bind(this);

        this.getCollegeDomain = this.getCollegeDomain.bind(this);
        this.getDepartmentDomain = this.getDepartmentDomain.bind(this);
        this.getProgramDomain = this.getProgramDomain.bind(this);
        this.getCourseDomain = this.getCourseDomain.bind(this);
        this.getRegistrationDomain = this.getRegistrationDomain.bind(this);
        this.getCloDomain = this.getCloDomain.bind(this);
        this.getStudentDomain = this.getStudentDomain.bind(this);
        this.getDoctorDomain = this.getDoctorDomain.bind(this);
        this.getAdminDomain = this.getAdminDomain.bind(this);

        onMounted(async () => {
            await this.loadFilterOptions();
            await this.fetchData();
        });
    }

    getCollegeDomain() {
        const domain = [];
        if (this.state.filters.college_id) {
            domain.push(['id', '=', parseInt(this.state.filters.college_id)]);
        }
        return domain;
    }

    getDepartmentDomain() {
        const domain = [];
        if (this.state.filters.department_id) {
            domain.push(['id', '=', parseInt(this.state.filters.department_id)]);
        }else if (this.state.filters.college_id) {
            domain.push(['college_id', '=', parseInt(this.state.filters.college_id)]);
        }
        return domain;
    }

    getProgramDomain() {
        const domain = [];
        if (this.state.filters.program_id) {
            domain.push(['id', '=', parseInt(this.state.filters.program_id)]);
        }else if (this.state.filters.department_id) {
            domain.push(['department_id', '=', parseInt(this.state.filters.department_id)]);
        }else if (this.state.filters.college_id) {
            domain.push(['department_id.college_id', '=', parseInt(this.state.filters.college_id)]);
        }
        return domain;
    }

    getCourseDomain() {
        const domain = [];
        if (this.state.filters.course_id) {
            domain.push(['id', '=', parseInt(this.state.filters.program_id)]);
        }else if (this.state.filters.program_id) {
            domain.push(['program_ids', '=', parseInt(this.state.filters.program_id)]);
        }else if (this.state.filters.department_id) {
            domain.push(['program_ids.department_id', '=', parseInt(this.state.filters.department_id)]);
        }else if (this.state.filters.college_id) {
            domain.push(['program_ids.department_id.college_id', '=', parseInt(this.state.filters.college_id)]);
        }
        return domain;
    }

    getRegistrationDomain() {
        const domain = [];
        if (this.state.filters.course_id) {
            domain.push(['course_id', '=', parseInt(this.state.filters.course_id)]);
        }
        if (this.state.filters.gender_id) {
            if(parseInt(this.state.filters.gender_id) == 1){
                domain.push(['student_id.gender', '=', 'male']);
            }else{
                domain.push(['student_id.gender', '=', 'female']);
            }
        }
        if (this.state.filters.semester_id) {
            domain.push(['semester_id', '=', parseInt(this.state.filters.semester_id)]);
        }else if (this.state.filters.academic_year_id) {
            domain.push(['academic_year_id', '=', parseInt(this.state.filters.academic_year_id)]);
        }
        return domain;
    }

    getCloDomain() {
        const domain = [];
        if (this.state.filters.semester_id) {
            domain.push(['course_result_id.registration_id.semester_id', '=', parseInt(this.state.filters.semester_id)]);
        }else if (this.state.filters.academic_year_id) {
            domain.push(['course_result_id.registration_id.academic_year_id', '=', parseInt(this.state.filters.academic_year_id)]);
        }
        if (this.state.filters.gender_id) {
            if(parseInt(this.state.filters.gender_id) == 1){
                domain.push(['course_result_id.registration_id.student_id.gender', '=', 'male']);
            }else{
                domain.push(['course_result_id.registration_id.student_id.gender', '=', 'female']);
            }
        }
        if (this.state.filters.course_id) {
            domain.push(['course_id', '=', parseInt(this.state.filters.course_id)]);
        }else if (this.state.filters.program_id) {
            domain.push(['program_learning_outcome_id.program_id', '=', parseInt(this.state.filters.program_id)]);
        }else if (this.state.filters.department_id) {
            domain.push(['program_learning_outcome_id.program_id.department_id', '=', parseInt(this.state.filters.department_id)]);
        }else if (this.state.filters.college_id) {
            domain.push(['program_learning_outcome_id.program_id.department_id.college_id', '=', parseInt(this.state.filters.college_id)]);
        }
        return domain;
    }

    getStudentDomain() {
        const domain = [];

        if (this.state.filters.course_id) {
            domain.push(['program_id.course_ids', '=', parseInt(this.state.filters.course_id)]);
        }
        else if (this.state.filters.program_id) {
            domain.push(['program_id', '=', parseInt(this.state.filters.program_id)]);
        }
        else if (this.state.filters.department_id) {
            domain.push(['program_id.department_id', '=', parseInt(this.state.filters.department_id)]);
        }
        else if (this.state.filters.college_id) {
            domain.push(['program_id.department_id.college_id', '=', parseInt(this.state.filters.college_id)]);
        }
        return domain;
    }

    getDoctorDomain() {
        const domain = [];

        if (this.state.filters.course_id) {
            domain.push(['course_ids', '=', parseInt(this.state.filters.course_id)]);
        }

        return domain;
    }

    getAdminDomain() {
        const domain = [];

        if (this.state.filters.department_id) {
            domain.push(['department_ids', '=', parseInt(this.state.filters.department_id)]);
        }
        else if (this.state.filters.college_id) {
            domain.push(['college_ids', '=', parseInt(this.state.filters.college_id)]);
        }

        return domain;
    }

    async loadFilterOptions() {
        try {
            this.state.colleges = await this.orm.call('college', 'search_read', [
                [], ['id', 'name']
            ]);

            this.state.academic_years = await this.orm.call('academic.year', 'search_read', [
                [], ['id', 'name']
            ]);

            this.state.genders = [{'id': 1, 'name': 'male'},{'id': 2, 'name': 'female'}];

            this.state.departments = [];
            this.state.programs = [];
            this.state.courses = [];
            this.state.semesters = [];
        } catch (error) {
            console.error('Error loading filter options:', error);
        }
    }

    async fetchCountsData() {
        try {

            const countData = await Promise.all([
                this.orm.call('college', 'search_count', [this.getCollegeDomain()]),
                this.orm.call('department', 'search_count', [this.getDepartmentDomain()]),
                this.orm.call('program', 'search_count', [this.getProgramDomain()]),
                this.orm.call('course', 'search_count', [this.getCourseDomain()])
            ]);

            this.state.counts = {
                college: countData[0],
                department: countData[1],
                program: countData[2],
                course: countData[3]
            };

        } catch (error) {
            console.error('Error fetching Counts data:', error);
            this.state.error = 'Error loading Counts data';
        } finally {
            this.state.loading = false;
        }
    }

    async fetchUsersData() {
        try {

            const [studentMale, studentFemale,
                   doctorMale, doctorFemale,
                   adminMale, adminFemale] = await Promise.all([
                this.orm.call('student', 'search_count', [
                    [...this.getStudentDomain(), ['gender', '=', 'male']]
                ]),
                this.orm.call('student', 'search_count', [
                    [...this.getStudentDomain(), ['gender', '=', 'female']]
                ]),
                this.orm.call('doctor', 'search_count', [
                    [...this.getDoctorDomain(), ['gender', '=', 'male']]
                ]),
                this.orm.call('doctor', 'search_count', [
                    [...this.getDoctorDomain(), ['gender', '=', 'female']]
                ]),
                this.orm.call('admin', 'search_count', [
                    [...this.getAdminDomain(), ['gender', '=', 'male']]
                ]),
                this.orm.call('admin', 'search_count', [
                    [...this.getAdminDomain(), ['gender', '=', 'female']]
                ])
            ]);

            this.state.userData = {
                student: {
                    male: studentMale,
                    female: studentFemale,
                    total: studentMale + studentFemale
                },
                doctor: {
                    male: doctorMale,
                    female: doctorFemale,
                    total: doctorMale + doctorFemale
                },
                admin: {
                    male: adminMale,
                    female: adminFemale,
                    total: adminMale + adminFemale
                },
                allUsers: studentMale + studentFemale + doctorMale + doctorFemale + adminMale + adminFemale
            };

            this.state.userChartData = {
                labels: [
                    'Students (Male)', 'Students (Female)',
                    'Doctors (Male)', 'Doctors (Female)',
                    'Admin (Male)', 'Admin (Female)'
                ],
                datasets: [{
                    data: [
                        this.state.userData.student.male,
                        this.state.userData.student.female,
                        this.state.userData.doctor.male,
                        this.state.userData.doctor.female,
                        this.state.userData.admin.male,
                        this.state.userData.admin.female
                    ],
                }]
            };

        } catch (error) {
            console.error('Error fetching Users data:', error);
            this.state.error = 'Error loading Users data';
        } finally {
            this.state.loading = false;
        }
    }

    async fetchSemesterChartData() {
        try {
            const semesters = await this.orm.searchRead('semester', [], ['id', 'name']);

            const regCounts = await Promise.all(
                semesters.map(sem =>
                    this.orm.call('registration', 'search_count', [[...this.getRegistrationDomain(), ['semester_id', '=', sem.id]]])
                )
            );

            const labels = semesters.map(s => s.name);
            const data = regCounts;

            this.state.semesterChartData = {
                labels,
                datasets: [{
                    data,
                    customIds: semesters.map(s => s.id),
                }]
            };

            this.state.semesterChartOptions = {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percent}%)`;
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const clicked = elements[0];
                        const index = clicked.index;
                        const semesterId = this.state.semesterChartData.datasets[0].customIds[index];

                        if (semesterId) {
                            this.action.doAction({
                                type: "ir.actions.act_window",
                                name: "Registrations",
                                res_model: "registration",
                                views: [[false, "list"], [false, "form"]],
                                domain: [["semester_id", "=", semesterId]],
                                target: "current"
                            });
                        }
                    }
                },

            };

        } catch (error) {
            console.error('Error fetching semester data:', error);
            this.state.error = 'Error loading semester data';
        } finally {
            this.state.loading = false;
        }
    }

    async fetchCourseData() {
        try {
            const results = await this.orm.searchRead('registration', this.getRegistrationDomain(), ['course_id', 'final_grade']);

            const courseMap = new Map();

            for (const result of results) {
                const [courseId, courseName] = result.course_id || [];
                if (!courseId || !courseName) continue;

                if (!courseMap.has(courseId)) {
                    courseMap.set(courseId, { name: courseName, grades: [] });
                }

                courseMap.get(courseId).grades.push(result.final_grade);
            }

            const labels = [];
            const avgGrades = [];
            const resultCounts = [];

            for (const { name, grades } of courseMap.values()) {
                const avg = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
                labels.push(name);
                avgGrades.push(avg);
                resultCounts.push(grades.length);
            }

            this.state.courseChartData = {
                labels,
                datasets: [{
                    data: avgGrades,
                    customIds: results.map(s => s.course_id[0]),
                }]
            };

            this.state.courseChartOptions = {
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const avg = context.raw || 0;
                                const index = context.dataIndex;
                                const count = resultCounts?.[index] || 0;

                                return `${label}: ${avg.toFixed(2)} (from ${count} result${count !== 1 ? 's' : ''})`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const clicked = elements[0];
                        const index = clicked.index;
                        const courseId = this.state.courseChartData.datasets[0].customIds[index];

                        if (courseId) {
                            this.action.doAction({
                                type: "ir.actions.act_window",
                                name: "Registrations",
                                res_model: "registration",
                                views: [[false, "list"], [false, "form"]],
                                domain: [["course_id", "=", courseId]],
                                target: "current"
                            });
                        }
                    }
                },
            };

        } catch (error) {
            console.error('Error fetching course grade data:', error);
            this.state.error = 'Error loading course grade data';
        }
    }

    async fetchOutcomeData() {
        try {
            const outcomes = await this.orm.searchRead('course.learning.outcome', this.getCloDomain(), ['id', 'name', 'weight', 'grade', 'full_grade']);

            const outcomeMap = {};

            for (const outcome of outcomes) {
                const outcomeId = outcome.id;
                const name = outcome.name;
                const weight = outcome.weight;
                const full_result = outcome.full_grade;
                const result = outcome.grade;

                if (full_result && result && weight) {
                    if (!outcomeMap[outcomeId]) {
                        outcomeMap[outcomeId] = {
                            name,
                            full_grades: [],
                            grades: [],
                        };
                    }

                    outcomeMap[outcomeId].full_grades.push((full_result * weight) / 100);
                    outcomeMap[outcomeId].grades.push((result * weight) / 100);
                }
            }

            const labels = [];
            const avgGrades = [];
            const fullGrades = [];
            const counts = [];

            for (const outcomeId in outcomeMap) {
                const { name, full_grades, grades} = outcomeMap[outcomeId];
                const total = grades.reduce((a, b) => a + b, 0);
                const average = grades.length ? total / grades.length : 0;
                labels.push(name);
                avgGrades.push(average);
                fullGrades.push(full_grades);
                counts.push(grades.length);
            }

            this.state.outcomeChartData = {
                labels,
                datasets: [
                    {
                        data: fullGrades,
                        customIds: outcomes.map(s => s.id),
                        type: 'bar',

                    },
                    {
                        data: avgGrades,
                        type: 'line',
                        fill: false,
                    },
                ]
            };

            this.state.outcomeChartOptions = {
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const index = context.dataIndex;
                                const count = counts?.[index] || 0;
                                if (context.dataset.type === 'bar'){
                                    const full_grade = context.raw || 0;
                                    return `${context.label} - full grade ${full_grade} - the results is ${count} result${count !== 1 ? 's' : ''}`;
                                }else{
                                    const avg = avgGrades?.[index] || 0;
                                    const full_grade = fullGrades?.[index] || 0;
                                    return `${context.label} - the average ${avg.toFixed(2)} (from ${count} result${count !== 1 ? 's' : ''}) - full grade ${full_grade}`;
                                }

                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const clicked = elements[0];
                        const index = clicked.index;
                        const cloId = this.state.outcomeChartData.datasets[0].customIds[index];

                        if (cloId) {
                            this.action.doAction({
                                type: "ir.actions.act_window",
                                name: "Course Learning Outcome",
                                res_model: "course.learning.outcome",
                                res_id: cloId,
                                views: [[false, "form"]],
                                target: "current"
                            });
                        }
                    }
                },
            };

        } catch (error) {
            console.error('Error fetching outcome grade data:', error);
            this.state.error = 'Error loading outcome grade data';
        }
    }

    async fetchPloData() {
        try {
            const outcomes = await this.orm.searchRead('course.learning.outcome', this.getCloDomain(), ['id', 'name', 'weight', 'program_learning_outcome_id', 'grade', 'full_grade']);

            const outcomeMap = {};

            for (const outcome of outcomes) {
                const programOutcome = outcome.program_learning_outcome_id;
                if (!programOutcome || programOutcome.length === 0) continue;

                const programId = programOutcome[0];
                const programName = programOutcome[1];
                const weight = outcome.weight || 0;
                const full_result = outcome.full_grade;
                const result = outcome.grade || 0;

                if (full_result && result && weight) {
                    if (!outcomeMap[programId]) {
                        outcomeMap[programId] = {
                            name: programName,
                            full_grades: [],
                            grades: [],
                        };
                    }

                    outcomeMap[programId].full_grades.push((full_result * weight) / 100);
                    outcomeMap[programId].grades.push((result * weight) / 100);
                }
            }

            const labels = [];
            const totalGrades = [];
            const totalFullGrades = [];
            const counts = [];

            for (const programId in outcomeMap) {
                const { name, full_grades, grades} = outcomeMap[programId];
                const total_grades = grades.reduce((a, b) => a + b, 0);
                const total_full_grades = full_grades.reduce((a, b) => a + b, 0);
                labels.push(name);
                totalGrades.push(total_grades);
                totalFullGrades.push(total_full_grades);
                counts.push(grades.length);
            }

            this.state.ploChartData = {
                labels,
                datasets: [
                    {
                        data: totalFullGrades,
                        customIds: outcomes.map(s => s.program_learning_outcome_id[0]),
                        type: 'bar',

                    },
                    {
                        data: totalGrades,
                        type: 'line',
                        fill: false,
                    },
                ]
            };

            this.state.ploChartOptions = {
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const index = context.dataIndex;
                                const count = counts?.[index] || 0;
                                if (context.dataset.type === 'bar'){
                                    const total_full_grade = context.raw || 0;
                                    return `${context.label} - total full grade ${total_full_grade} - the results is ${count} result${count !== 1 ? 's' : ''}`;
                                }else{
                                    const total_grades = totalGrades?.[index] || 0;
                                    const total_full_grade = totalFullGrades?.[index] || 0;
                                    return `${context.label} - the total grades ${total_grades.toFixed(2)} (from ${count} result${count !== 1 ? 's' : ''}) - total full grade ${total_full_grade}`;
                                }
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const clicked = elements[0];
                        const index = clicked.index;
                        const ploId = this.state.ploChartData.datasets[0].customIds[index];

                        if (ploId) {
                            this.action.doAction({
                                type: "ir.actions.act_window",
                                name: "Course Learning Outcome",
                                res_model: "course.learning.outcome",
                                views: [[false, "list"], [false, "form"]],
                                domain: [["program_learning_outcome_id", "=", ploId]],
                                target: "current"
                            });
                        }
                    }
                },
            };

        } catch (error) {
            console.error('Error fetching PLO grade data:', error);
            this.state.error = 'Error loading PLO grade data';
        }
    }

    async fetchData() {
        try {
            this.state.loading = true;
            this.state.error = null;


            const promises = [
                await this.fetchCountsData(),
                await this.fetchUsersData(),
                await this.fetchSemesterChartData(),
                await this.fetchCourseData(),
                await this.fetchOutcomeData(),
                await this.fetchPloData(),
            ];

            await Promise.all(promises);
            this.state.dataLoaded = true;

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            this.state.error = 'Error loading dashboard data';
        } finally {
            this.state.loading = false;
        }
    }

    async onKPIClicked({ title }) {
        const modelMap = {
            "Colleges": "college",
            "Departments": "department",
            "Programs": "program",
            "Courses": "course",
            "Total students": "student"
        };

        const model = modelMap[title];

        if (model && this.action) {
            let domain = [];

            if (model == 'college') {
                domain = this.getCollegeDomain();
            }
            if (model == 'department') {
                domain = this.getDepartmentDomain();
            }
            if (model == 'program') {
                domain = this.getProgramDomain();
            }
            if (model == 'course') {
                domain = this.getCourseDomain();
            }

            await this.action.doAction({
                type: "ir.actions.act_window",
                name: title,
                res_model: model,
                views: [[false, "list"], [false, "form"]],
                target: "current",
                domain: domain
            });
        }
    }

    async onUserChartClicked({ index }) {
        const modelMap = {
            0: "student", 1: "student",
            2: "doctor", 3: "doctor",
            4: "admin", 5: "admin"
        };
        const genderMap = {
            0: "male", 1: "female",
            2: "male", 3: "female",
            4: "male", 5: "female"
        };

        const model = modelMap[index];
        const gender = genderMap[index];

        if (model && this.action) {
            let domain = [];

            if (model == 'college') {
                domain = this.getCollegeDomain();
            }
            if (model == 'department') {
                domain = this.getDepartmentDomain();
            }
            if (model == 'program') {
                domain = this.getProgramDomain();
            }
            if (model == 'course') {
                domain = this.getCourseDomain();
            }

            domain.push(['gender', '=', gender]);

            await this.action.doAction({
                type: "ir.actions.act_window",
                name: `${model.charAt(0).toUpperCase() + model.slice(1)}s (${gender})`,
                res_model: model,
                views: [[false, "list"], [false, "form"]],
                target: "current",
                domain: domain,
                context: {
                    search_default_name: false
                }
            });
        }
    }

    async onCollegeFilterChange() {
        try {
            this.state.filters.department_id = null;
            this.state.filters.program_id = null;
            this.state.filters.course_id = null;

            if (this.state.filters.college_id) {
                this.state.departments = await this.orm.call('department', 'search_read', [
                    [['college_id', '=', parseInt(this.state.filters.college_id)]],
                    ['id', 'name']
                ]);
            } else {
                this.state.departments = await this.orm.call('department', 'search_read', [
                    [], ['id', 'name']
                ]);
            }

            this.state.programs = [];
            this.state.courses = [];

            await this.fetchData();

        } catch (error) {
            console.error("Error in college filter change:", error);
            this.state.error = "Failed to update college filter";
        }
    }

    async onDepartmentFilterChange() {
        try {
            this.state.filters.program_id = null;
            this.state.filters.course_id = null;

            if (this.state.filters.department_id) {
                this.state.programs = await this.orm.call('program', 'search_read', [
                    [['department_id', '=', parseInt(this.state.filters.department_id)]],
                    ['id', 'name']
                ]);
            } else {
                this.state.programs = await this.orm.call('program', 'search_read', [
                    [], ['id', 'name']
                ]);
            }

            this.state.courses = [];

            await this.fetchData();
        } catch (error) {
            console.error("Error in department filter change:", error);
            this.state.error = "Failed to update department filter";
        }
    }

    async onProgramFilterChange() {
        try {
            this.state.filters.course_id = null;

            if (this.state.filters.program_id) {
                this.state.courses = await this.orm.call('course', 'search_read', [
                    [['program_ids', '=', parseInt(this.state.filters.program_id)]],
                    ['id', 'name']
                ]);
            } else {
                this.state.courses = await this.orm.call('course', 'search_read', [
                    [], ['id', 'name']
                ]);
            }


            await this.fetchData();
        } catch (error) {
            console.error("Error in program filter change:", error);
            this.state.error = "Failed to update program filter";
        }
    }

    async onCourseFilterChange() {
        await this.fetchData();
    }

    async onAcademicYearFilterChange() {
        try {
            this.state.filters.semester_id = null;

            if (this.state.filters.academic_year_id) {
                this.state.semesters = await this.orm.call('semester', 'search_read', [
                    [['academic_year_id', '=', parseInt(this.state.filters.program_id)]],
                    ['id', 'name']
                ]);
            } else {
                this.state.semesters = await this.orm.call('semester', 'search_read', [
                    [], ['id', 'name']
                ]);
            }


            await this.fetchData();
        } catch (error) {
            console.error("Error in academic year filter change:", error);
            this.state.error = "Failed to update academic year filter";
        }
    }

    async onSemesterFilterChange() {
        await this.fetchData();
    }

    async onGenderFilterChange() {
        await this.fetchData();
    }
}

registry.category("actions").add("university.dashboard", UniversityDashboard);