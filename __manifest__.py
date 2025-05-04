{
    'name': 'University Dashboard',
    'author': 'Author Name',
    'category': '',
    'version': '17.0.0.1.0',
    'summary': 'Interactive University Dashboard',
    'description': 'Comprehensive dashboard for university management analytics',
    'depends': ['web', 'base', 'university', 'program_learning_outcome'],
    'data': [
        'views/dashboard.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'university_dashboard/static/src/components/chart.js',
            'university_dashboard/static/src/components/kpi_card.js',
            'university_dashboard/static/src/dashboard/js/dashboard.js',
            'university_dashboard/static/src/dashboard/css/dashboard.css',
            'university_dashboard/static/src/components/chart.xml',
            'university_dashboard/static/src/components/kpi_card.xml',
            'university_dashboard/static/src/dashboard/xml/dashboard.xml',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
}