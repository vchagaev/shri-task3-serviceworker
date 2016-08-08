module.exports = {
    extends: 'loris/es6',
    root: true,
    env: {
        browser: true,
        worker: true,
        node: true,
        jasmine: true
    },
    rules: {
        'no-console': 0,
        'no-alert': 0
    }
};
