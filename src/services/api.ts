// TODO: set ROOT_URL when API is ready
const ROOT_URL = "API ROOT URL";

function getHeaders({
  acceptLanguage,
}: {
  acceptLanguage?: "fr" | "en";
}): Headers {
  const headers = new Headers();

  const authorizationHeader = [];

  if (import.meta.env.DEV) {
    authorizationHeader.push(import.meta.env.VITE_AUTHORIZATION_TOKEN);
  }

  if (authorizationHeader.length > 0) {
    headers.append("Authorization", `Basic ${authorizationHeader.join(" ")}`);
  }

  if (acceptLanguage) {
    headers.append("Accept-Language", acceptLanguage);
  }

  return headers;
}

export default async function fetchApi(
  path: `/${string}`,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: FormData,
): Promise<Response> {
  const documentLang = document.documentElement.lang;

  const acceptLanguage =
    documentLang === "fr" || documentLang === "en" ? documentLang : "en";
  const headers = getHeaders({
    acceptLanguage,
  });

  const response = await fetch(`${ROOT_URL}${path}`, {
    method,
    body,
    headers,
    credentials: "include",
    mode: "cors",
  });

  return response;
}
