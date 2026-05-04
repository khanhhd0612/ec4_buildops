const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const projectRoute = require('./project.route');
const wbsRoute = require('./wbs.route');
const contractRoute = require('./contract.route');
const acceptanceRoute = require('./acceptance.route');
const boqRoute = require('./boq.route');
const materialRoute = require('./material.route');
const materialRequestRoute = require('./materialRequest.route');
const equipmentRoute = require('./equipment.route');
const documentRoute = require('./document.route');
const costRoute = require('./cost.route');
const expenseRoute = require('./expense.route');
const timesheetRoute = require('./timesheet.route');
const siteDiaryRoute = require('./siteDiary.route');
const reportsRoute = require('./reports.route');
const dashboardRoute = require('./dashboard.route');

const router = express.Router();

const defaultRoutes = [
    { path: '/auth', route: authRoute },
    { path: '/users', route: userRoute },
    { path: '/projects', route: projectRoute },
    { path: '/wbs-items', route: wbsRoute },
    { path: '/contracts', route: contractRoute },
    { path: '/acceptance', route: acceptanceRoute },
    { path: '/boq', route: boqRoute },
    { path: '/materials', route: materialRoute },
    { path: '/material-requests', route: materialRequestRoute },
    { path: '/equipment', route: equipmentRoute },
    { path: '/', route: documentRoute },
    { path: '/', route: costRoute },
    { path: '/', route: expenseRoute },
    { path: '/', route: timesheetRoute },
    { path: '/', route: siteDiaryRoute },
    { path: '/', route: reportsRoute },
    { path: '/dashboard', route: dashboardRoute },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
