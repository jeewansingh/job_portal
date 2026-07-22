import { getJobCategories } from "./job";

/**
 * Get all job categories/industries
 * @returns {Promise<Array>} - Array of all categories with job counts
 */
export async function getIndustries() {
  try {
    const response = await getJobCategories();
    
    // Transform backend categories to frontend format
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    ];
    
    const transformed = response.categories.map((cat, index) => {
      return {
        name: cat.category,
        slug: cat.category.toLowerCase().replace(/\s+/g, '-'),
        description: `Discover ${cat.job_count} exciting opportunities in ${cat.category}`,
        jobs: cat.job_count,
        color: colors[index % colors.length],
        logoLetter: cat.category.charAt(0).toUpperCase()
      };
    });
    
    return transformed;
  } catch (error) {
    console.error('Failed to fetch industries:', error);
    return [];
  }
}
