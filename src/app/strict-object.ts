export interface StrictObject {
    [client_id: string]: string,
    redirect_uri: string,
    scope: string,
    state: string,
    include_granted_scopes: string,
    response_type: string
}
