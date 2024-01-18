import {initializeTestEnvironment, assertSucceeds, assertFails, withFunctionTriggersDisabled, RulesTestEnvironment} from "@firebase/rules-unit-testing";

export {assertSucceeds, assertFails, withFunctionTriggersDisabled};

type TestConfig = {
    auth : {
        id : string | number;
    };
};

type InitializeConfig = {
    projectId : string,
    host : string,
    port : number;
};

type Firestore = ReturnType<typeof getFirestore>;

export let app : {
    config : RulesTestEnvironment;
};

const message = "App not initialized!";

const getFirestore = (options : Partial<TestConfig> = {}) => {
    if (app.config) {
        return options.auth
            ? app.config.authenticatedContext(options.auth.id.toString()).firestore()
            : app.config.unauthenticatedContext().firestore();
    } else {
        throw new Error(message);
    }
};

export const getDefaultContext = (callback : (firestore : Firestore) => PromiseLike<any>, options : Partial<TestConfig> = {}) => {
    return new Promise((resolve, reject) => {
        if (app.config) {
            resolve(callback(getFirestore(options)));
        } else {
            reject(message);
        }
    });
};

export const getAdminContext = (callback : (firestore : Firestore) => PromiseLike<any>) => {
    return new Promise((resolve, reject) => {
        if (app.config) {
            resolve(app.config.withSecurityRulesDisabled(async (context) => {
                return await callback(context.firestore());
            }));
        } else {
            reject(message);
        }
    });
};

export const initializeTestApp = async (options : Partial<InitializeConfig> = {}) => {
    const {projectId = "demo-app", host = "127.0.0.1", port = 8080} = options;

    app = {
        config: await initializeTestEnvironment({
            projectId,
            firestore: {host, port},
        }),
    };
};
