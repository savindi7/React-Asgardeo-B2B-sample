import React, { useState, useEffect } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import "./OrganizationSwitch.css";
import { default as authConfig } from "./config.json";

const OrganizationSwitch = () => {
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState("");
    const { httpRequest, requestCustomGrant, state, getDecodedIDToken, getAccessToken } = useAuthContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isOrgSwitched, setIsOrgSwitched] = useState(false);
    const [decodedAccessToken, setDecodedAccessToken] = useState(undefined);
    const [accessToken, setAccessToken] = useState(false);

    useEffect(() => {
        getDecodedIDToken().then((decodedIdToken) => {
            setDecodedAccessToken(decodedIdToken);
        });

        getAccessToken().then((token) => {
            setAccessToken(token);
        });
    }, [state.isAuthenticated, getDecodedIDToken, getAccessToken]);

    //Fetch organizations when the user is authenticated
    useEffect(() => {
        if (!state?.isAuthenticated) return;

        const fetchOrganizations = async () => {
            try {
                const requestConfig = {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/scim+json",
                    },
                    method: "GET",
                    url: isOrgSwitched === true ?
                    `${authConfig.baseUrl}/o/api/users/v1/me/organizations/root/descendants` :
                    `${authConfig.baseUrl}/api/server/v1/organizations`,
                };

                const response = await httpRequest(requestConfig);
                setOrganizations(isOrgSwitched === true ? response?.data : response?.data?.organizations || []);
            } catch (err) {
                console.error("Error fetching organizations:", err);
                setError("Failed to load organizations. Please try again.");
            }
        };

        fetchOrganizations();
    }, [state?.isAuthenticated, isOrgSwitched]);

    // Handle organization switching
    const handleOrgSwitch = async (orgId) => {

        if(orgId === "") return;

        setIsLoading(true);
        setError(null);
        setSelectedOrg(orgId);

        try {

            const requestBody = {
                token: accessToken,
                scope: authConfig.scope.join(" "),
                client_id: authConfig.clientID,
                switching_organization: orgId,
                grant_type: "organization_switch",
            };

            await requestCustomGrant({
                attachToken: false,
                data: requestBody,
                id: "orgSwitch",
                returnsSession: true,
                signInRequired: true,
            });
    
        } catch (err) {
            console.error("Error switching organization:", err);
            setError("Failed to switch organization. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!decodedAccessToken?.user_org) {
            setIsOrgSwitched(false);

            return;
        }
        const isSwitched = decodedAccessToken.org_id !== decodedAccessToken.user_org;
        setIsOrgSwitched(isSwitched);

    }, [selectedOrg, decodedAccessToken]);

    return (
        <div className="organization-select">
            <label htmlFor="organization-select" className="organization-select-label">
                Switch Organization:
            </label>
            <select
                id="organization-select"
                value={selectedOrg}
                onChange={(e) => handleOrgSwitch(e.target.value)}
                disabled={isLoading || organizations?.organizations?.length === 0}
            >
                <option value="">Select an organization</option>
                {organizations?.map((org) => (
                    <option key={org.id} value={org.id}>
                        {org.name}
                    </option>
                ))}
            </select>
            {isLoading && <p className="loading-text">Switching organization...</p>}
            {error && <p className="error-text">{error}</p>}
        </div>
    );
};

export default OrganizationSwitch;
