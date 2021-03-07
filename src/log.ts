import { createLogger, format, transports } from 'winston';

const log = createLogger({
    level: 'debug',
    format: format.combine(
        format.colorize(),
        format.errors({
            stack: true
        }),
        format.splat(),
        format.simple()
    ),
    transports: [
        new transports.Console()
    ]
});

export default log;

