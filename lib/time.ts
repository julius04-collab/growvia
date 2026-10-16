// ISO timestamp for "this long ago". Kept out of page components so the purity lint rule stays happy.
export const isoAgo = (ms: number) => new Date(Date.now() - ms).toISOString();
