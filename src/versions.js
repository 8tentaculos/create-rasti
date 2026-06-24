/**
 * Single source of truth for every version pinned in generated projects.
 * When bumping any of these, also follow docs/VERSIONS.md (e.g. path-to-regexp
 * is mirrored in extras/micro-router/package.json, kept in sync manually).
 */
export const VERSIONS = {
    rasti : '^4.0.1',
    vite : '^7.0.0',
    express : '^5.0.1',
    compression : '^1.8.1',
    sirv : '^3.0.0',
    crossEnv : '^7.0.3',
    tailwindcss : '^4.0.0',
    tailwindVite : '^4.0.0',
    cssfun : '^0.0.14',
    pathToRegexp : '^8.0.0'
};
