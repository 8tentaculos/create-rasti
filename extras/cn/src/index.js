/**
 * @typedef {string|number|boolean|null|undefined|Object.<string, *>|Array.<*>} ClassValue
 */

/**
 * @param {string} a
 * @param {string|number} b
 * @returns {string}
 */
const add = (a, b) => a && b ? a + ' ' + b : '' + (a || b);

/**
 * @param {Array.<*>} classes
 * @returns {string}
 */
const parse = (classes) => {
    let out = '';

    for (const c of classes) {
        if (!c) continue;

        const t = typeof c;

        if (t === 'string' || t === 'number') out = add(out, c);
        else if (Array.isArray(c)) out = add(out, parse(c));
        else if (t === 'object') for (const key in c) c[key] && (out = add(out, key));
    }

    return out;
};

/**
 * `cn` — fast conditional class names.
 *
 * Joins truthy class name arguments into a single space-separated string.
 * Accepts strings, numbers, arrays (nested supported) and objects whose keys
 * are included when their value is truthy. Falsy values are skipped.
 *
 * @param {...ClassValue} args - Class name values to join.
 * @returns {string} The merged class name string.
 *
 * @example
 * cn('a', 'b'); // => 'a b'
 * cn('a', { b : true, c : false }); // => 'a b'
 * cn('a', ['b', ['c']]); // => 'a b c'
 * cn('a', isActive && 'active'); // conditional
 */
const cn = (...args) => parse(args);

export default cn;
