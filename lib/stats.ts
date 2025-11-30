export async function getFormStats() {
  await new Promise(r => setTimeout(r, 500));

  return {
    visits: 2847,
    submissions: 1892,
    submissionRate: 66.5,
    bounceRate: 33.5,
  };
}