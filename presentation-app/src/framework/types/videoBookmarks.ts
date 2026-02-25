/**
 * Types for the video timestamp bookmark system.
 *
 * Bookmarks are named timestamps within a video that can be seeked to
 * when a TTS marker fires during narrated playback.
 */

export interface VideoBookmark {
  id: string;      // Referenced by VideoSeekTrigger.bookmarkId
  time: number;    // Seek target, seconds in the video
  label?: string;  // Human-readable description (editor only)
}

export interface VideoBookmarkSet {
  src: string;               // e.g. "/videos/{demoId}/my-video.mp4"
  bookmarks: VideoBookmark[];
}

export interface VideoBookmarksFile {
  demoId: string;
  videos: Record<string, VideoBookmarkSet>; // keyed by videoId
}
