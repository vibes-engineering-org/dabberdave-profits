import { PROJECT_TITLE } from "~/lib/constants";

export async function GET() {
  const appUrl =
    process.env.NEXT_PUBLIC_URL ||
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjg2OTk5OSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDc2ZDUwQjBFMTQ3OWE5QmEyYkQ5MzVGMUU5YTI3QzBjNjQ5QzhDMTIifQ",
      payload:
        "eyJkb21haW4iOiJkYWJiZXJkYXZlLXByb2ZpdHMudmVyY2VsLmFwcCJ9",
      signature:
        "MHhmMjVmMjJiOTVmOGU3YTY0YzA3NjdiMTMzMjY2YjBkZTcxYTk5ZWJiZWMwZTNkOWFlODI2Zjg5YzZkZDQ0YWQ0NzM3NzQyZmE3YzVkNzQ5N2I0OTZmZDJmMWNmYzRlZWU5NGQ1OWRhZDQyMGI3MTMyZGIzYTUzZjQ2ZWUyZjMwZjFj",
    },
    frame: {
      version: "1",
      name: PROJECT_TITLE,
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/og.png`,
      buttonTitle: "Open",
      webhookUrl: `${appUrl}/api/webhook`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#555555",
      primaryCategory: "finance",
    },
  };

  return Response.json(config);
}
