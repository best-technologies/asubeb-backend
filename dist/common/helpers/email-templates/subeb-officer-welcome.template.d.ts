export interface SubebOfficerWelcomeEmailPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
export declare const subebOfficerWelcomeEmailTemplate: (payload: SubebOfficerWelcomeEmailPayload) => string;
