export function getRankGradient(color: string): string[] {
  const gradients: { [key: string]: string[] } = {
    "#5DD9E8": ["#5DD9E8", "#3AB4C7"], // Olympian - Cyan
    "#E63946": ["#E63946", "#C41E2E"], // Titan - Red
    "#C77DFF": ["#C77DFF", "#9D4EDD"], // Champion - Purple
    "#7B9FE8": ["#7B9FE8", "#5B7FD8"], // Diamond - Blue
    "#4ECDC4": ["#4ECDC4", "#3AADA4"], // Platinum - Teal
    "#F4C430": ["#F4C430", "#D4A420"], // Gold - Gold
    "#C0D6DF": ["#C0D6DF", "#A0B6BF"], // Silver - Silver
    "#CD7F32": ["#CD7F32", "#B87333"], // Bronze - Bronze
    "#8B4513": ["#8B4513", "#654321"], // Wood - Brown
  };
  return gradients[color] || [color, color];
}
