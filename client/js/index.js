'use strict';

/**
 * Validation Error
 */
class ValidationError extends Error {
    constructor(prop, message) {
        super();
        this.name = 'ValidationError';
        this.prop = prop;
        this.message = message || 'Произошла ошибка валидации';
        this.stack = (new Error()).stack;
    }
}

/**
 * Main class for student app
 */
class StudentsApp {

    /**
     * Initialize validators
     */
    constructor() {
        this.validators = {
            name: (value) => {
                return Boolean(value);
            },
            picSrc: (value) => {
                if (!value || !/^https?:\/\//.test(value)) {
                    return false;
                }
                return true;
            },
            bio: (value) => {
                return Boolean(value);
            }
        };
    }

    /**
     * Validate object property with error throw
     * @param obj - object to validate
     * @param prop - property
     * @param msg - error message
     */
    validate(obj, prop, msg) {
        if (obj.hasOwnProperty(prop) && this.validators[prop] && !this.validators[prop](obj[prop], obj)) {
            throw new ValidationError(prop, msg);
        }
    }

    /**
     * Response to json
     * @param response
     * @returns {*}
     */
    static json(response) {
        return response.json();
    }

    /**
     * Get all data from form
     * @param form - form with students data
     * @returns {*}
     */
    static getFormData(form) {
        return [].reduce.call(
            form.querySelectorAll('input, textarea'),
            (result, formElement) => {
                result[formElement.name] = formElement.value;
                return result;
            }, {}
        );
    }

    /**
     * Add new data to students
     * @param studentsData
     */
    updateStudentsList(studentsData) {
        const studentsHTML = studentsData.map(StudentsApp.renderStudent).join('');

        [].forEach.call(
            document.querySelectorAll('.students__list'),
            (container) => {
                container.innerHTML = studentsHTML;
            }
        );
    }

    /**
     * Apply eventhandlers for containers
     * @param containers - elements array
     * @param selector - selector element in container's elemnt
     * @param event - on event
     * @param handler - handler function
     */
    delegate(containers, selector, event, handler) {
        [].forEach.call(containers, (container) => {
            container.addEventListener(event, function (e) {
                if (e.target.matches(selector)) {
                    handler.apply(e.target, arguments);
                }
            });
        });
    }

    /**
     * Get data from student's form
     * @param form
     * @returns {Promise}
     */
    getStudentData(form) {
        return new Promise((resolve, reject) => {
            [].forEach.call(form.querySelectorAll('.student-form__field'), (field) => {
                field.classList.remove('student-form__field_error');
            });

            const student = StudentsApp.getFormData(form);
            const validationResult = this.validateStudent(student);

            if (validationResult === true) {
                resolve(student);
            } else {
                form.querySelector('.student-form__field-' + validationResult.prop)
                    .classList.add('student-form__field_error');

                reject(validationResult);
            }
        });
    }

    /**
     * Handling add button
     * @param e
     */
    onStudentAddClick(e) {
        e.preventDefault();

        this.setAttribute('disabled', 'disabled');
        const app = window.app;
        app.getStudentData(this.closest('form'))
            .then(app.addStudent)
            .then(() => {
                [].forEach.call(
                    this.closest('form').querySelectorAll('input, textarea'),
                    (x) => {
                        return x.value;
                    }
                );
            })
            .then(app.getStudents)
            .then(app.updateStudentsList)
            .catch((e) => {
                if (!(e instanceof ValidationError)) {
                    console.error(e);
                    alert('Что-то пошло не так!');
                }
            })
            .then(() => {
                this.removeAttribute('disabled');
            });
    }

    /**
     *
     */
    onStudentUpdateClick() {
        const studentContainer = this.closest('.student');
        const studentData = studentContainer.dataset.student;
        console.log('updating ', studentData);
        studentContainer.innerHTML = StudentsApp.renderStudentForm(JSON.parse(studentData));
    }

    /**
     * Handling save button
     * @param e
     */
    onStudentSaveClick(e) {
        e.preventDefault();

        const studentContainer = this.closest('.student');
        const app = window.app;
        this.setAttribute('disabled', 'disabled');

        app.getStudentData(this.closest('form'))
            .then(app.updateStudent)
            .then((student) => {
                const newStudentsContainer = document.createElement('div');
                newStudentsContainer.innerHTML = StudentsApp.renderStudent(student);
                const newStudentContainer = newStudentsContainer
                    .removeChild(newStudentsContainer
                        .querySelector('.student'));
                const studentsContainer = studentContainer.parentElement;

                studentsContainer.insertBefore(newStudentContainer, studentContainer);
                studentsContainer.removeChild(studentContainer);
            })
            .catch((e) => {
                if (!(e instanceof ValidationError)) {
                    console.error(e);
                    alert('Что-то пошло не так!');
                }
            })
            .then(() => {
                this.removeAttribute('disabled');
            });
    }

    /**
     * Render student item
     * @param student - object student
     * @returns {string}
     */
    static renderStudent(student) {
        return `
        <div class="student" data-student='${JSON.stringify(student)}'>
            <div class="student__picSrc">
                <img class="student__img" src="${student.picSrc}">
            </div>
            <div class="student__info">
                <h2 class="student__name">${student.name}</h2>
                <p class="student__bio">${student.bio}</p>
                <button class="student__update-btn">Изменить</button>
            </div>
        </div>
    `;
    }

    /**
     * Render student form to edit
     * @param student - object student
     * @returns {string} - layout
     */
    static renderStudentForm(student) {
        return `
        <form class="student__update-form student-form">
            <input type="hidden" name="id" value="${student.id}">
            <label class="student-form__field student-form__field-name">
                <span class="student-form__field-label">Имя</span>
                <input type="text" name="name" value="${student.name}">
            </label>
            <label class="student-form__field student-form__field-picSrc">
                <span class="student-form__field-label">URL фотографии</span>
                <input type="text" name="picSrc" value="${student.picSrc}">
            </label>
            <label class="student-form__field student-form__field-bio">
                <span class="student-form__field-label">Кратко о себе</span>
                <textarea name="bio" rows="5" cols="40">${student.bio}</textarea>
            </label>
            <button class="student__save-btn">Сохранить</button>
        </form>
    `;
    }

    /**
     * Validate student's name, picSrc, bio
     * @param student
     * @returns {*}
     */
    validateStudent(student) {
        try {
            this.validate(student, 'name', 'Не заполнено имя студента');
            this.validate(student, 'picSrc', 'Неправильный адрес фотографии студента');
            this.validate(student, 'bio', 'Не заполнена биография');
        } catch (e) {
            if (e instanceof ValidationError) {
                return e;
            }

            throw e;
        }

        return true;
    }

    /**
     * Get students from DB
     * @returns {Promise.<JSON>}
     */
    getStudents() {
        return fetch('/api/v1/students').then(StudentsApp.json);
    }

    /**
     * Add students to DB
     * @param student - students object
     * @returns {Promise.<JSON>}
     */
    addStudent(student) {
        return fetch('/api/v1/students', {
            method: 'post',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(student)
        }).then(StudentsApp.json);
    }

    /**
     * Update student in DB
     * @param student - students object
     * @returns {Promise.<JSON>}
     */
    updateStudent(student) {
        return fetch(`/api/v1/students/${student.id}`, {
            method: 'put',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(student)
        }).then(StudentsApp.json);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    window.app = new StudentsApp();
    const app = window.app;
    app.delegate(
        document.querySelectorAll('.students'),
        '.students__add-btn',
        'click',
        app.onStudentAddClick
    );

    app.delegate(
        document.querySelectorAll('.students'),
        '.student__update-btn',
        'click',
        app.onStudentUpdateClick
    );

    app.delegate(
        document.querySelectorAll('.students'),
        '.student__save-btn',
        'click',
        app.onStudentSaveClick
    );

    app.getStudents().then(app.updateStudentsList);
});
