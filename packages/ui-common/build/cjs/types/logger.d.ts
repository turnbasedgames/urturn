declare const logger: {
    log: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    info: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    error: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    warn: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
};
export default logger;
