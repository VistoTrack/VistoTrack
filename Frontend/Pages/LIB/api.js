const BASE_URL = "http://vistotrack.com:8000";

export function getApiUrl(endpoint) {
    return `${BASE_URL}${endpoint}`;
}

export function getCsrfToken() {
    return document.cookie.replace(/(?:(?:^|.*;\s*)csrf_token\s*=\s*([^;]*).*$)|^.*$/, "$1");
}