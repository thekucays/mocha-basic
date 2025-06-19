const Mocha = require('mocha');
const ExcelJS = require('exceljs');

class ExcelReporter {
  constructor(runner) {
    const results = [];

    runner.on('pass', test => {
      results.push({ title: test.title, status: 'passed', duration: test.duration });
    });

    runner.on('fail', (test, err) => {
      results.push({ title: test.title, status: 'failed', error: err.message });
    });

    runner.on('end', async () => {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Test Results');

      sheet.columns = [
        { header: 'Title', key: 'title', width: 50 },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Duration (ms)', key: 'duration', width: 15 },
        { header: 'Error Message', key: 'error', width: 50 }
      ];

      sheet.addRows(results);

      await workbook.xlsx.writeFile('test-results.xlsx');
      console.log('✅ Test results exported to test-results.xlsx');
    });
  }
}

module.exports = ExcelReporter;
