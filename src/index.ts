import {initializeTestEnvironment, assertSucceeds, assertFails, withFunctionTriggersDisabled, RulesTestEnvironment} from "@firebase/rules-unit-testing";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

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

type Firestore = ReturnType<typeof firebase.firestore>;

export let app : {
    config : RulesTestEnvironment;
};

export const getDefaultContext = (callback : (firestore : Firestore) => PromiseLike<any>, options : Partial<TestConfig> = {}) => {
    return new Promise((resolve, reject) => {
        if (app.config) {
            const getFirestore = options.auth
                ? app.config.authenticatedContext(options.auth.id.toString()).firestore()
                : app.config.unauthenticatedContext().firestore();

            resolve(callback(getFirestore));
        } else {
            reject("App not initialized!");
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
            reject("App not initialized!");
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
