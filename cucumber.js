export default {
    default: {
        require: ['features/step-definitions/**/*.js', 'features/support/**/*.js'],
        format: [
            'html:cucumber-report.html',
            'json:cucumber-report.json',
            'progress'
        ],
        formatOptions: {
            snippetInterface: 'async-await'
        },
        publishQuiet: true
    }
};
