# QA Notes

- Verified on 2026-08-20: the unauthenticated root route resolves to the Google sign-in screen after the authentication request completes. The screen presents the Career Automation Hub heading, account-creation prompt, and a visible "Continue with Google Account" button.
- Authenticated dashboard routes require completion of the regular OAuth sign-in flow and were not exercised without a user session. The preview environment's OAuth portal returned a CloudFront 403 response, so the production sign-in callback must be verified after deployment.
- Verified on 2026-08-20: the permanent production domain loads successfully over HTTPS and presents the Google sign-in screen. The Google OAuth callback itself remains the final production verification item.
- Production sign-in launches the configured Manus OAuth URL with the correct deployed callback address. Both that URL and the provider's primary login page returned the same CloudFront 403 response in the sandbox browser, indicating an external browser/provider-access limitation rather than an application-route failure.
