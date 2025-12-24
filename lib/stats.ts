import { getMyForms } from "./form";

export async function getFormStats() {
  try {
    const data = await getMyForms();

    if (data.user_statistics) {
      const stats = data.user_statistics;

      return {
        visits: stats.total_visits || 0,
        submissions: stats.total_responses || 0,
        submissionRate: Number(stats.overall_conversion_rate.toFixed(1)) || 0,
        bounceRate: Number(stats.overall_bounce_rate.toFixed(1)) || 0,
      };
    }

    return {
      visits: 0,
      submissions: 0,
      submissionRate: 0,
      bounceRate: 0,
    };
  } catch (error) {
    console.error("Ошибка получения общей статистики:", error);
    return {
      visits: 0,
      submissions: 0,
      submissionRate: 0,
      bounceRate: 0,
    };
  }
}