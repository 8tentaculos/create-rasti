/**
 * Single source of truth for every version pinned in generated projects.
 * When bumping any of these, also follow docs/VERSIONS.md (rasti, cssfun and
 * path-to-regexp are mirrored in package.json files, kept in sync by test/versions.test.js).
 */
export const VERSIONS = {
    rasti : '^5.0.0-alpha.4',
    vite : '^8.3.5',
    express : '^5.3.0',
    compression : '^1.8.2',
    sirv : '^3.0.2',
    crossEnv : '^10.1.0',
    tailwindcss : '^4.3.3',
    tailwindVite : '^4.3.3',
    cssfun : '^0.4.0-alpha.0',
    pathToRegexp : '^9.0.0',
    typescript : '^7.0.2',
    typesNode : '^22.20.5',
    typesExpress : '^5.0.6',
    typesCompression : '^1.8.1'
};
