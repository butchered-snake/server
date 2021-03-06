import log from './log';

function loadRequiredEnv(varName: string): string {
    const value = process.env[varName];
    if (value === undefined || value.length === 0) {
        log.crit("environment variable %s is required but not found", varName);
        process.exit(-1);
    }
    return value;
}

const host: string = loadRequiredEnv("BUTCHERED_HOST");
const port: number = +loadRequiredEnv("BUTCHERED_PORT");
const applicationUri: string = host + ':' + port;

export { host, port, applicationUri };

