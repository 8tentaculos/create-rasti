import globals from 'globals';
import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions : {
            globals : {
                ...globals.node
            },
            ecmaVersion : 2022,
            sourceType : 'module'
        },
        rules : {
            indent : ['error', 4],
            'linebreak-style' : ['error', 'unix'],
            quotes : ['error', 'single', { allowTemplateLiterals : true }],
            semi : ['error', 'always'],
            'key-spacing' : ['error', { beforeColon : true, afterColon : true }],
            'no-trailing-spaces' : ['error', { skipBlankLines : false, ignoreComments : true }],
            'no-multiple-empty-lines' : ['error', { max : 1, maxEOF : 0 }],
            'no-console' : 'off'
        }
    },
    {
        files : ['extras/micro-router/**/*.js'],
        languageOptions : {
            globals : {
                ...globals.node,
                ...globals.browser
            }
        }
    }
];

