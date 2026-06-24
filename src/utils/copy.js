import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Write content to a file, creating directories if needed.
 * @param {string} filePath - Path to the file
 * @param {string} content - Content to write
 */
export async function writeFile(filePath, content) {
    await fs.mkdir(path.dirname(filePath), { recursive : true });
    await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Read content from a file.
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} File content
 */
export async function readFile(filePath) {
    return fs.readFile(filePath, 'utf-8');
}
