import { getJobCategories } from "./job";

/**
 * Get top 4 categories for landing page
 * @returns {Promise<Array>} - Array of top 4 categories with job counts
 */
export async function getTopIndustries() {
  try {
    const response = await getJobCategories();
    
    // Transform backend categories to frontend format and limit to 4
    const transformed = response.categories.slice(0, 4).map((cat, index) => {
      // Generate color based on category name
      const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      ];
      
      return {
        name: cat.category,
        slug: cat.category.toLowerCase().replace(/\s+/g, '-'),
        description: `Explore ${cat.job_count} opportunities in ${cat.category}`,
        jobs: cat.job_count,
        color: colors[index % colors.length],
        logoLetter: cat.category.charAt(0).toUpperCase()
      };
    });
    
    return transformed;
  } catch (error) {
    console.error('Failed to fetch top industries:', error);
    return [];
  }
}
