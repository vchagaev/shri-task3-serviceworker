'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const students = require('./students')(path.join(__dirname, './data/students.json'));

const app = express();

app.set('json spaces', 4);
app.set('x-powered-by', false);
app.set('etag', getEtag);
app.use(express.static(path.join(__dirname, '../client')));
app.use(bodyParser.json());

app.get('/api/v1/students', (req, res) => {
    console.time('GET /api/v1/students');
    students.getAll().then((result) => res.json(result));
    console.timeEnd('GET /api/v1/students');
});

app.post('/api/v1/students', (req, res) => {
    console.time('POST /api/v1/students');
    const student = parseStudentFromRequest(req);
    students.add(student).then((result) => res.json(result));
    console.timeEnd('POST /api/v1/students');
});

app.put('/api/v1/students/:id', (req, res) => {
    console.time('PUT /api/v1/students/');
    const student = parseStudentFromRequest(req);
    students.update(student).then((result) => res.json(result));
    console.timeEnd('PUT /api/v1/students/');
});

const myServer = app.listen(process.env.PORT || 5000, () => {
    console.log('Server listening on port ', process.env.PORT === undefined ? 5000 : process.env.PORT);
});

exports.close = (callback) => {
    myServer.close(callback);
};

function parseStudentFromRequest(req) {
    return {
        name: req.body.name,
        picSrc: req.body.picSrc,
        bio: req.body.bio,
        id: parseInt(req.body.id, 10)
    };
}

function getEtag(body) {
    console.time('getEtag');
    const operationalTable = [
        [0, 3, 1, 7, 5, 9, 8, 6, 4, 2],
        [7, 0, 9, 2, 1, 5, 4, 8, 6, 3],
        [4, 2, 0, 6, 8, 7, 1, 3, 5, 9],
        [1, 7, 5, 0, 9, 8, 3, 4, 2, 6],
        [6, 1, 2, 3, 0, 4, 5, 9, 7, 8],
        [3, 6, 7, 4, 2, 0, 9, 5, 8, 1],
        [5, 8, 6, 9, 7, 2, 0, 1, 3, 4],
        [8, 9, 4, 5, 3, 6, 2, 0, 1, 7],
        [9, 4, 3, 8, 6, 1, 7, 2, 0, 5],
        [2, 5, 8, 1, 4, 3, 6, 7, 9, 0]
    ];

    const response = body.toString();
    const eTag = [
        response.substr(0, 5)
            .split('')
            .map((x) => x.charCodeAt(0))
            .join(''),
        '-',
        response
            .split('')
            .map((x) => x.charCodeAt(0))
            .join('')
            .split('')
            .reduce((a, x) => operationalTable[a][x], 0)
    ].join('');
    console.timeEnd('getEtag');
    return eTag;
}
