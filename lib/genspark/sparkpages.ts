import { gensparkFetch } from "./client";

interface SparkpageResponse {
  url: string;
  page_id: string;
}

export async function createSparkpage(params: {
  title: string;
  content: string;
  companyName: string;
  prospectCompany: string;
}): Promise<string | null> {
  try {
    const response = await gensparkFetch<SparkpageResponse>("/sparkpages/create", {
      title: params.title,
      content: params.content,
      metadata: {
        sender: params.companyName,
        recipient: params.prospectCompany,
        tracking: true,
      },
    });

    return response.url;
  } catch (error) {
    console.error("Sparkpage creation failed:", error);
    return null;
  }
}
