// Dynamic point system: Rank #1 = 300 points, Rank #200 = 1 point, 201+ = 0 points
export function calculatePoints(rank: number): number {
  if (rank < 1) return 0;
  if (rank > 200) return 0;
  if (rank === 1) return 300;
  if (rank === 200) return 1;
  
  // Linear interpolation between rank 1 (300 pts) and rank 200 (1 pt)
  // Formula: points = 300 - ((rank - 1) * 299 / 199)
  const pointsRange = 299;
  const rankRange = 199;
  const points = 300 - ((rank - 1) * pointsRange / rankRange);
  
  return Math.round(points);
}

// Extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  
  return null;
}

// Get YouTube thumbnail URL from video ID or full URL
export function getYouTubeThumbnail(url: string): string {
  const videoId = extractYouTubeId(url);
  if (!videoId) return "";
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
