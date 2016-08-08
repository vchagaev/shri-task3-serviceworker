'use strict';

const request = require('request');
const baseUrl = 'http://localhost:' + (process.env.PORT === undefined ? 5000 : process.env.PORT);
const studentsApp = require('../server/index.js');
const studentsJson = require('../server/data/students.json');

describe('Shri students server', () => {
    it('returns code 200', (done) => {
        request.get(baseUrl, (error, response) => {
            expect(response.statusCode).toBe(200);
            done();
        });
    });

    it('returns all students from', (done) => {
        request.get(baseUrl + '/api/v1/students', (error, response) => {
            expect(JSON.parse(response.body)).toEqual(studentsJson);
            done();
        });
    });

    it('updates students by id', (done) => {
        const firstStudent = studentsJson[0];
        firstStudent.name = Math.random().toFixed(5);
        request({
            url: baseUrl + '/api/v1/students/' + firstStudent.id,
            method: 'PUT',
            json: firstStudent
        }, (error, response) => {
            expect(response.body).toEqual(firstStudent);
            studentsApp.close(() => {
                done();
            });
        });
    });
});
